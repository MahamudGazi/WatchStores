from rest_framework import serializers
from .models import Cart


class CartSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")
    product_price = serializers.SerializerMethodField()
    product_original_price = serializers.ReadOnlyField(source="product.price")
    product_slug = serializers.ReadOnlyField(source="product.slug")
    stock_status = serializers.ReadOnlyField(source="product.stock_status")

    product_thumbnail = serializers.SerializerMethodField()

    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = (
            "id",
            "user",
            "product",
            "product_name",
            "product_price",
            "product_original_price",
            "product_thumbnail",
            "product_slug",
            "stock_status",
            "quantity",
            "subtotal",
            "created_at",
        )
        read_only_fields = ("user",)

    def get_product_price(self, obj):
        return obj.unit_price

    def get_product_thumbnail(self, obj):
        request = self.context.get("request")

        if obj.product.thumbnail:
            if request:
                return request.build_absolute_uri(obj.product.thumbnail.url)
            return obj.product.thumbnail.url

        return None