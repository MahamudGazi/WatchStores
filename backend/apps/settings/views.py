from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes

from apps.core.permissions import IsAdmin, IsStaffMember

from .models import StoreSettings
from .serializers import StoreSettingsSerializer


def get_store_settings():
    settings_obj = StoreSettings.objects.first()
    if not settings_obj:
        settings_obj = StoreSettings.objects.create()
    return settings_obj


class StoreSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        settings_obj = get_store_settings()
        serializer = StoreSettingsSerializer(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        settings_obj = get_store_settings()
        serializer = StoreSettingsSerializer(
            settings_obj, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "Settings updated successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        return self.put(request)


class EmailSettingsView(APIView):
    """Email-related settings (subset of StoreSettings)."""

    permission_classes = [IsAuthenticated, IsAdmin]

    EMAIL_FIELDS = [
        "store_email",
        "email_notification",
        "new_order_notification",
        "new_customer_notification",
        "low_stock_notification",
        "return_request_notification",
        "refund_request_notification",
    ]

    def get(self, request):
        obj = get_store_settings()
        data = {f: getattr(obj, f, None) for f in self.EMAIL_FIELDS if hasattr(obj, f)}
        # Always include common keys frontend may expect
        data.setdefault("store_email", obj.store_email)
        data.setdefault("email_notification", getattr(obj, "email_notification", True))
        return Response(data)

    def put(self, request):
        obj = get_store_settings()
        payload = {k: v for k, v in request.data.items() if k in self.EMAIL_FIELDS and hasattr(obj, k)}
        for k, v in payload.items():
            setattr(obj, k, v)
        obj.save()
        data = {f: getattr(obj, f, None) for f in self.EMAIL_FIELDS if hasattr(obj, f)}
        return Response({"success": True, "message": "Email settings updated.", "data": data})

    def patch(self, request):
        return self.put(request)


class ShippingSettingsView(APIView):
    """Default shipping settings from StoreSettings."""

    permission_classes = [IsAuthenticated, IsAdmin]

    SHIPPING_FIELDS = [
        "delivery_charge",
        "delivery_days",
        "free_shipping_minimum",
        "shipping_country",
    ]

    def get(self, request):
        obj = get_store_settings()
        data = {}
        for f in self.SHIPPING_FIELDS:
            if hasattr(obj, f):
                val = getattr(obj, f)
                data[f] = float(val) if hasattr(val, "__float__") and f != "shipping_country" else val
        return Response(data)

    def put(self, request):
        obj = get_store_settings()
        for f in self.SHIPPING_FIELDS:
            if f in request.data and hasattr(obj, f):
                setattr(obj, f, request.data[f])
        obj.save()
        data = {}
        for f in self.SHIPPING_FIELDS:
            if hasattr(obj, f):
                val = getattr(obj, f)
                data[f] = float(val) if hasattr(val, "__float__") and f != "shipping_country" else val
        return Response({"success": True, "message": "Shipping settings updated.", "data": data})

    def patch(self, request):
        return self.put(request)


# Delivery charges CRUD (district-based) – uses shipping.ShippingCharge
from apps.shipping.models import ShippingCharge
from apps.shipping.serializers import ShippingChargeSerializer


class DeliveryChargeViewSet(viewsets.ModelViewSet):
    """
    /api/settings/delivery-charges/
    """
    queryset = ShippingCharge.objects.all().order_by("district")
    serializer_class = ShippingChargeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
