from rest_framework import serializers
from .models import ShippingAddress, ShippingCharge


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = "__all__"
        read_only_fields = (
            "user",
            "created_at",
            "updated_at",
        )
        
        
class ShippingChargeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingCharge
        fields = "__all__"