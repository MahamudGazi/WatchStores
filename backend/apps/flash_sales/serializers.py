from rest_framework import serializers
from django.utils import timezone

from .models import FlashSale


class FlashSaleSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    is_running = serializers.SerializerMethodField()

    class Meta:
        model = FlashSale
        fields = [
            "id",
            "name",
            "product",
            "product_name",
            "discount",
            "start_time",
            "end_time",
            "active",
            "is_running",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "product_name",
            "is_running",
        ]

    def validate_discount(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError(
                "Discount must be between 1 and 100."
            )
        return value

    def validate(self, attrs):
        start = attrs.get("start_time")
        end = attrs.get("end_time")

        if start and end and end <= start:
            raise serializers.ValidationError(
                {
                    "end_time": "End time must be greater than start time."
                }
            )

        return attrs

    def get_is_running(self, obj):
        now = timezone.now()

        return (
            obj.active
            and obj.start_time <= now <= obj.end_time
        )