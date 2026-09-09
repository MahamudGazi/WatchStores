from rest_framework import serializers
from django.utils import timezone

from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            "id",
            "code",
            "discount",
            "active",
            "valid_from",
            "valid_to",
            "is_valid",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "is_valid"]

    def get_is_valid(self, obj):
        now = timezone.now()
        return (
            obj.active
            and obj.valid_from <= now <= obj.valid_to
        )


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=30)
