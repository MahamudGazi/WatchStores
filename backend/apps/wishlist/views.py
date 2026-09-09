from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from .models import Wishlist
from .serializers import WishlistSerializer, AdminWishlistSerializer
from apps.core.permissions import IsCustomer, IsAdmin
from apps.core.responses import (
    success_response,
    error_response,
)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return (
            Wishlist.objects
            .filter(user=self.request.user)
            .select_related("product")
            .order_by("-created_at")
        )

    @action(detail=False, methods=["get"])
    def count(self, request):
        total = self.get_queryset().count()

        return success_response(
            data={"count": total},
            message="Wishlist count fetched successfully.",
        )

    def create(self, request, *args, **kwargs):
        product = request.data.get("product")

        if not product:
            return error_response(
                message="Product is required.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Wishlist.objects.filter(
            user=request.user,
            product_id=product,
        ).exists():
            return error_response(
                message="Product already exists in wishlist.",
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save(user=request.user)

        return success_response(
            data=serializer.data,
            message="Product added to wishlist successfully.",
            status=status.HTTP_201_CREATED,
        )

class AdminWishlistViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdminWishlistSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return (
            Wishlist.objects
            .select_related("user", "product")
            .order_by("-created_at")
        )