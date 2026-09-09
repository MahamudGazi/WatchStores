from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import ShippingAddress, ShippingCharge
from .serializers import (
    ShippingAddressSerializer,
    ShippingChargeSerializer,
)


class ShippingAddressViewSet(viewsets.ModelViewSet):
    serializer_class = ShippingAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        is_default = serializer.validated_data.get("is_default", False)

        if is_default:
            ShippingAddress.objects.filter(
                user=self.request.user,
                is_default=True
            ).update(is_default=False)

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        is_default = serializer.validated_data.get("is_default", False)

        if is_default:
            ShippingAddress.objects.filter(
                user=self.request.user,
                is_default=True
            ).exclude(
                id=serializer.instance.id
            ).update(is_default=False)

        serializer.save()


@api_view(["GET"])
def shipping_charges(request):
    charges = ShippingCharge.objects.filter(
        is_active=True
    ).order_by("district")

    serializer = ShippingChargeSerializer(
        charges,
        many=True
    )

    return Response(serializer.data)