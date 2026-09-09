from django.utils import timezone
from rest_framework import serializers

from .models import Promotion


class PromotionSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    is_running = serializers.SerializerMethodField()

    class Meta:
        model = Promotion

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
            "product_name",
            "is_running",
            "created_at",
        ]

    def validate_discount(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError(
                "Discount must be between 1 and 100."
            )

        return value

    def validate(self, attrs):

        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({
                "end_time": "End time must be greater than start time."
            })

        return attrs

    def get_is_running(self, obj):

        now = timezone.now()

        return (
            obj.active
            and obj.start_time <= now
            and obj.end_time >= now
        )