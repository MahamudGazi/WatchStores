from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Cart
from .serializers import CartSerializer


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user).order_by("-created_at")

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
        existing = Cart.objects.filter(user=request.user, product=product).first()
        current_qty = existing.quantity if existing else 0
        if product.stock < (current_qty + quantity):
            available = max(0, product.stock - current_qty)
            return Response(
                {
                    "detail": f"Only {available} more item(s) available for {product.name}.",
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
            CartSerializer(cart_item, context={"request": request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="merge")
    def merge(self, request):
        """Merge guest cart items into authenticated user cart.
        Body: { "items": [ {"product_id": 1, "quantity": 2}, ... ] }
        """
        items = request.data.get("items", [])
        if not isinstance(items, list):
            return Response(
                {"success": False, "message": "items must be a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        merged = []
        for item in items:
            product_id = item.get("product_id") or item.get("product")
            quantity = int(item.get("quantity", 1))
            if not product_id or quantity < 1:
                continue

            cart_item, created = Cart.objects.get_or_create(
                user=request.user,
                product_id=product_id,
                defaults={"quantity": quantity},
            )
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            merged.append(
                CartSerializer(cart_item, context={"request": request}).data
            )

        return Response({
            "success": True,
            "message": f"Merged {len(merged)} item(s).",
            "data": merged,
        })
