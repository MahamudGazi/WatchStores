from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from .serializers import (
    ProductSerializer,
    ProductImageSerializer,

)
from .filters import ProductFilter
from apps.orders.models import OrderItem
from .models import (
    Product,
    ProductImage,
    RecentlyViewed,
)
from django.db.models import (
    Sum, Avg, Count,
    Exists, OuterRef,
    Value, BooleanField,
    )
from apps.core.permissions import IsAdminOrReadOnly, IsAdmin
from apps.wishlist.models import Wishlist

from apps.core.responses import (
    success_response,
    error_response,

)
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status


class ProductViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Product.objects
            .select_related("brand", "category")
            .prefetch_related("images")
            .annotate(
                average_rating_value=Avg("reviews__rating"),
                review_count_value=Count("reviews", distinct=True),
            )
        )

        if user.is_authenticated:
            queryset = queryset.annotate(
                is_in_wishlist_value=Exists(
                    Wishlist.objects.filter(
                        user=user,
                        product=OuterRef("pk"),
                    )
                )
            )
        else:
            queryset = queryset.annotate(
                is_in_wishlist_value=Value(
                    False,
                    output_field=BooleanField(),
                )
            )

        if user.is_authenticated and user.is_staff:
            return queryset

        return queryset.filter(
            is_active=True,
            stock__gt=0,
        )

    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def partial_update(self, request, *args, **kwargs):

        product = self.get_object()

        serializer = self.get_serializer(
            product,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        product = serializer.save()

        gallery_files = request.FILES.getlist("gallery")

        for image in gallery_files:
            ProductImage.objects.create(
                product=product,
                image=image,
            )

        return Response(
            self.get_serializer(product).data,
            status=status.HTTP_200_OK,
        )


    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = [
        "name",
        "sku",
        "short_description",
        "description",
        "brand__name",
        "category__name",
    ]

    ordering_fields = [
        "price",
        "created_at",
        "name",
    ]

    ordering = ["-created_at"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def retrieve(self, request, *args, **kwargs):
        product = self.get_object()

        product.views_count += 1
        product.save(update_fields=["views_count"])

        response = super().retrieve(request, *args, **kwargs)

        if request.user.is_authenticated:
            RecentlyViewed.objects.update_or_create(
                user=request.user,
                product=product,
            )

        return response



    @action(detail=True, methods=["get"])
    def similar(self, request, pk=None):
        product = self.get_object()

        similar_products = (
            self.get_queryset()
            .filter(
                brand=product.brand,
                is_active=True,
            )
            .exclude(
                id=product.id,
            )[:8]
        )

        serializer = self.get_serializer(
            similar_products,
            many=True,
        )

        return success_response(
            data=serializer.data,
            message="Success",
        )

    @action(detail=True, methods=["get"], url_path="frequently-bought")
    def frequently_bought(self, request, pk=None):
        product = self.get_object()

        order_ids = (
            OrderItem.objects
            .filter(product=product)
            .values_list("order_id", flat=True)
        )

        products = (
            self.get_queryset()
            .filter(
                orderitem__order_id__in=order_ids,
                is_active=True,
            )
            .exclude(
                id=product.id,
            )
            .distinct()[:8]
        )

        serializer = self.get_serializer(
            products,
            many=True,
        )

        return success_response(
            data=serializer.data,
            message="Success",
        )

    @action(detail=False, methods=["get"])
    def recently_viewed(self, request):
        if not request.user.is_authenticated:
            return success_response(
                data=[],
                message="Success",
            )

        products = (
            self.get_queryset()
            .filter(recent_views__user=request.user)
            .distinct()
        )

        serializer = self.get_serializer(products, many=True)

        return success_response(
            data=serializer.data,
            message="Success",
        )

    @action(detail=False, methods=["get"])
    def trending(self, request):
        products = (
            self.get_queryset()
            .filter(is_active=True)
            .order_by("-views_count")[:10]
        )

        serializer = self.get_serializer(
            products,
            many=True,
        )

        return success_response(
            data=serializer.data,
            message="Success",
        )

    @action(detail=False, methods=["get"])
    def best_sellers(self, request):
        products = (
            self.get_queryset()
            .filter(is_active=True)
            .annotate(
                total_sold=Sum("orderitem__quantity")
            )
            .order_by("-total_sold")[:10]
        )

        serializer = self.get_serializer(
            products,
            many=True,
        )

        return success_response(
            data=serializer.data,
            message="Success",
        )

    @action(detail=False, methods=["get"])
    def recommendations(self, request):
        if not request.user.is_authenticated:
            return success_response(data=[])

        purchased_categories = OrderItem.objects.filter(
            order__user=request.user,
            order__status="Delivered",
        ).values_list(
            "product__category_id",
            flat=True,
        )

        purchased_products = OrderItem.objects.filter(
            order__user=request.user,
            order__status="Delivered",
        ).values_list(
            "product_id",
            flat=True,
        )

        products = (
            self.get_queryset()
            .filter(
                category_id__in=purchased_categories,
                is_active=True,
            )
            .exclude(
                id__in=purchased_products,
            )
            .distinct()[:10]
        )

        serializer = self.get_serializer(
            products,
            many=True,
        )

        return success_response(
            data=serializer.data,
            message="Success",
        )

    @action(detail=False, methods=["get"])
    def flash_sale(self, request):
        products = (
            self.get_queryset()
            .filter(
                is_flash_sale=True,
                is_active=True,
            )[:20]
        )

        serializer = self.get_serializer(
            products,
            many=True,
        )

        return success_response(
            data=serializer.data,
            message="Success",
        )

    @action(detail=False, methods=["get"])
    def out_of_stock(self, request):
        products = (
            self.get_queryset()
            .filter(
                stock=0,
                is_active=True,
            )
        )

        serializer = self.get_serializer(
            products,
            many=True,
        )

        return success_response(
            data=serializer.data,
            message="Out of stock products fetched successfully.",
        )

    @action(detail=False, methods=["get"])
    def out_of_stock(self, request):
        products = Product.objects.filter(
            stock=0,
            is_active=True,
        )

        serializer = self.get_serializer(products, many=True)
        return success_response(
            data=serializer.data,
            message="Success"
        )

    @action(
        detail=True,
        methods=["get", "post"],
        url_path="images",
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_image(self, request, pk=None):
        product = self.get_object()

        if request.method == "GET":

            images = product.images.all().order_by("id")

            serializer = ProductImageSerializer(
                images,
                many=True,
                context={
                    "request": request
                },
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        # =========================
        # POST â€” Upload Image
        # =========================
        image = request.FILES.get("image")
        alt_text = request.data.get("alt_text", "")

        if not image:
            return Response(
                {
                    "error": "Image is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        product_image = ProductImage.objects.create(
            product=product,
            image=image,
            alt_text=alt_text,
        )

        serializer = ProductImageSerializer(
            product_image,
            context={
                "request": request
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["patch", "delete"],
        url_path=r"images/(?P<image_id>[^/.]+)",
        parser_classes=[MultiPartParser, FormParser],
    )
    def manage_image(self, request, pk=None, image_id=None):

        product = self.get_object()

        try:
            product_image = ProductImage.objects.get(
                id=image_id,
                product=product,
            )
        except ProductImage.DoesNotExist:
            return Response(
                {
                    "error": "Gallery image not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # =========================================================
        # DELETE IMAGE
        # =========================================================

        if request.method == "DELETE":

            # Delete physical file
            if product_image.image:
                product_image.image.delete(
                    save=False
                )

            # Delete database record
            product_image.delete()

            return Response(
                {
                    "message": "Gallery image deleted successfully."
                },
                status=status.HTTP_200_OK,
            )

        # =========================================================
        # PATCH IMAGE
        # =========================================================

        if request.method == "PATCH":

            # Update alt text
            if "alt_text" in request.data:
                product_image.alt_text = request.data.get(
                    "alt_text",
                    ""
                ).strip()

            # New image
            new_image = request.FILES.get("image")

            if new_image:

                # Delete old physical file
                if product_image.image:
                    product_image.image.delete(
                        save=False
                    )

                # Replace with new image
                product_image.image = new_image

            product_image.save()

            serializer = ProductImageSerializer(
                product_image,
                context={
                    "request": request
                },
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

    @action(detail=False, methods=["get"])

    def inventory_summary(self, request):
        data = {
            "total_products": Product.objects.count(),
            "active_products": Product.objects.filter(is_active=True).count(),
            "out_of_stock": Product.objects.filter(stock=0).count(),
            "low_stock": Product.objects.filter(
                stock__gt=0,
                stock__lte=5
            ).count(),
        }

        return success_response(
            data=data,
            message="Inventory summary fetched successfully."
        )


    @action(detail=False, methods=["get"])
    def inventory(self, request):

        products = (
            Product.objects
            .select_related("brand", "category")
            .prefetch_related("images")
            .order_by("stock", "name")
        )

        data = []

        for product in products:

            if product.stock == 0:
                stock_status = "Out of Stock"

            elif product.stock <= 5:
                stock_status = "Low Stock"

            else:
                stock_status = "In Stock"

            image_url = None

            # First priority: Thumbnail
            if product.thumbnail:
                image_url = request.build_absolute_uri(
                    product.thumbnail.url
                )

            # Second priority: Gallery image
            else:
                first_image = next(iter(product.images.all()), None)

                if first_image and first_image.image:
                    image_url = request.build_absolute_uri(
                        first_image.image.url
                    )

            data.append({
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "price": product.price,
                "stock": product.stock,
                "is_active": product.is_active,
                "status": stock_status,
                "image": image_url,
                "brand": (
                    product.brand.name
                    if product.brand
                    else None
                ),
                "category": (
                    product.category.name
                    if product.category
                    else None
                ),
            })

        return success_response(
            data=data,
            message="Inventory fetched successfully.",
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdmin],
    )
    def update_stock(self, request, pk=None):

        product = self.get_object()

        stock = request.data.get("stock")

        if stock is None:
            return Response(
                {"error": "Stock is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            stock = int(stock)
        except (TypeError, ValueError):
            return Response(
                {"error": "Stock must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if stock < 0:
            return Response(
                {"error": "Stock cannot be negative."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.stock = stock
        product.save(update_fields=["stock"])

        return success_response(
            data={
                "id": product.id,
                "name": product.name,
                "stock": product.stock,
            },
            message="Stock updated successfully."
        )