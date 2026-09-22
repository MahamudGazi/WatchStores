from django.db import transaction

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.products.models import Product
from .models import Cart
from .serializers import CartSerializer


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Cart.objects
            .filter(user=self.request.user)
            .select_related("product")
            .order_by("-created_at")
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        if quantity < 1:
            return Response(
                {"detail": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Stock validation
        existing = Cart.objects.filter(
            user=request.user,
            product=product,
        ).first()

        current_qty = existing.quantity if existing else 0

        if product.stock < (current_qty + quantity):
            available = max(
                0,
                product.stock - current_qty,
            )

            return Response(
                {
                    "detail": (
                        f"Only {available} more item(s) "
                        f"available for {product.name}."
                    ),
                    "available": available,
                    "stock": product.stock,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response(
            CartSerializer(
                cart_item,
                context={"request": request},
            ).data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="merge",
    )
    def merge(self, request):
        """
        Merge guest cart items into the authenticated user's cart.

        Body:
        {
            "items": [
                {"product_id": 1, "quantity": 2},
                ...
            ]
        }

        Guest quantities are validated against current product stock
        together with any quantity already present in the user's cart.
        """

        items = request.data.get("items", [])

        if not isinstance(items, list):
            return Response(
                {
                    "success": False,
                    "message": "items must be a list",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        merged = []

        try:
            with transaction.atomic():

                for item in items:

                    if not isinstance(item, dict):
                        continue

                    product_id = (
                        item.get("product_id")
                        or item.get("product")
                    )

                    if not product_id:
                        continue

                    try:
                        quantity = int(
                            item.get("quantity", 1)
                        )
                    except (TypeError, ValueError):
                        continue

                    if quantity < 1:
                        continue

                    # Lock the product row so concurrent cart merges
                    # cannot bypass the stock check.
                    try:
                        product = (
                            Product.objects
                            .select_for_update()
                            .get(pk=product_id)
                        )
                    except Product.DoesNotExist:
                        continue

                    # Lock the existing cart row when present.
                    try:
                        cart_item = (
                            Cart.objects
                            .select_for_update()
                            .get(
                                user=request.user,
                                product=product,
                            )
                        )
                        created = False
                    except Cart.DoesNotExist:
                        cart_item = None
                        created = True

                    current_qty = (
                        cart_item.quantity
                        if cart_item is not None
                        else 0
                    )

                    requested_total = (
                        current_qty + quantity
                    )

                    # Critical stock validation:
                    # existing cart quantity + guest quantity
                    # must never exceed current product stock.
                    if requested_total > product.stock:
                        available = max(
                            0,
                            product.stock - current_qty,
                        )

                        return Response(
                            {
                                "success": False,
                                "message": (
                                    f"Only {available} more "
                                    f"item(s) available for "
                                    f"{product.name}."
                                ),
                                "product_id": product.id,
                                "available": available,
                                "stock": product.stock,
                                "requested": quantity,
                                "current_cart_quantity": current_qty,
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    if cart_item is None:
                        cart_item = Cart.objects.create(
                            user=request.user,
                            product=product,
                            quantity=quantity,
                        )
                    else:
                        cart_item.quantity = requested_total
                        cart_item.save(
                            update_fields=["quantity"]
                        )

                    merged.append(
                        CartSerializer(
                            cart_item,
                            context={"request": request},
                        ).data
                    )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "message": "Unable to merge cart.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({
            "success": True,
            "message": (
                f"Merged {len(merged)} item(s)."
            ),
            "data": merged,
        })
