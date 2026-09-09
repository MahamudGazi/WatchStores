from django.contrib.auth import get_user_model

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.core.permissions import IsCustomer, IsAdmin
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status

from apps.core.permissions import IsCustomer
from apps.orders.models import OrderItem

from .models import Review
from .serializers import ReviewSerializer
from .permissions import IsReviewOwnerOrReadOnly

User = get_user_model()
class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_permissions(self):

        if self.action == "admin_reviews":
            permission_classes = [
                IsAuthenticated,
                IsAdmin,
            ]
        else:
            permission_classes = [
                IsAuthenticated,
                IsCustomer,
                IsReviewOwnerOrReadOnly,
            ]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user

        if self.action == "admin_reviews":
            return (
                Review.objects
                .select_related("user", "product")
                .all()
            )

        return (
            Review.objects
            .select_related("user", "product")
            .filter(user=user)
        )
    def perform_create(self, serializer):
        product = serializer.validated_data["product"]

        purchased = OrderItem.objects.filter(
            order__user=self.request.user,
            order__status="Delivered",
            product=product,
        ).exists()

        if not purchased:
            raise PermissionDenied(
                "You can review only purchased products."
            )

        if Review.objects.filter(
            user=self.request.user,
            product=product,
        ).exists():
            raise PermissionDenied(
                "You already reviewed this product."
            )

        serializer.save(user=self.request.user)

    @action(
        detail=False,
        methods=["get"],
        url_path="admin",
    )
    def admin_reviews(self, request):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True,
        )

        return Response(
            {
                "success": True,
                "count": queryset.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )