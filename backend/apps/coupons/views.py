from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.core.permissions import IsAdmin
from rest_framework.response import Response

from .models import Coupon
from .serializers import CouponSerializer, ApplyCouponSerializer


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by("-created_at")
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdmin()]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def validate_coupon(request):
    """Validate a coupon code for checkout."""
    serializer = ApplyCouponSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    code = serializer.validated_data["code"].strip().upper()

    try:
        coupon = Coupon.objects.get(code__iexact=code)
    except Coupon.DoesNotExist:
        return Response(
            {"success": False, "message": "Invalid coupon code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    now = timezone.now()

    if not coupon.active:
        return Response(
            {"success": False, "message": "This coupon is inactive."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if now < coupon.valid_from:
        return Response(
            {"success": False, "message": "This coupon is not active yet."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if now > coupon.valid_to:
        return Response(
            {"success": False, "message": "This coupon has expired."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "success": True,
            "message": "Coupon applied successfully.",
            "data": {
                "id": coupon.id,
                "code": coupon.code,
                "discount": coupon.discount,
            },
        },
        status=status.HTTP_200_OK,
    )
