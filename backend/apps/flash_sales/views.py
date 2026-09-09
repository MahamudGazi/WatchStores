from django.utils import timezone

from rest_framework import permissions, filters, viewsets
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.permissions import IsAdmin, IsAdminOrReadOnly
from .models import FlashSale
from .serializers import FlashSaleSerializer


class FlashSaleViewSet(viewsets.ModelViewSet):

    queryset = FlashSale.objects.select_related("product").all()

    serializer_class = FlashSaleSerializer

    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "active",
        "product",
    ]

    search_fields = [
        "name",
        "product__name",
    ]

    ordering_fields = [
        "discount",
        "start_time",
        "end_time",
        "created_at",
    ]

    ordering = [
        "-created_at",
    ]

    def get_queryset(self):
        queryset = super().get_queryset()

        running = self.request.query_params.get("running")

        if running == "true":
            now = timezone.now()

            queryset = queryset.filter(
                active=True,
                start_time__lte=now,
                end_time__gte=now,
            )

        return queryset