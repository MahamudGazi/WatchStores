from rest_framework import serializers
from .models import StoreSettings


class StoreSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = StoreSettings
        fields = "__all__"

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]