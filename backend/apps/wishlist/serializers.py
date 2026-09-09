# from rest_framework import serializers
# from .models import Wishlist


# class WishlistSerializer(serializers.ModelSerializer):
#     product_name = serializers.ReadOnlyField(
#         source="product.name"
#     )

#     product_price = serializers.ReadOnlyField(
#         source="product.price"
#     )

#     class Meta:
#         model = Wishlist
#         fields = "__all__"
#         read_only_fields = ("user",)



from rest_framework import serializers

from .models import Wishlist


class WishlistSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")
    product_price = serializers.SerializerMethodField()
    product_original_price = serializers.ReadOnlyField(source="product.price")
    product_thumbnail = serializers.SerializerMethodField()
    product_slug = serializers.ReadOnlyField(source="product.slug")
    stock_status = serializers.ReadOnlyField(source="product.stock_status")

    class Meta:
        model = Wishlist
        fields = (
            "id",
            "product",
            "product_name",
            "product_price",
            "product_original_price",
            "product_thumbnail",
            "product_slug",
            "stock_status",
            "created_at",
        )

    def get_product_price(self, obj):
        """
        Return discount price if available,
        otherwise return regular price.
        """
        if obj.product.discount_price is not None:
            return obj.product.discount_price

        return obj.product.price

    def get_product_thumbnail(self, obj):
        request = self.context.get("request")

        if obj.product.thumbnail:
            if request:
                return request.build_absolute_uri(
                    obj.product.thumbnail.url
                )

            return obj.product.thumbnail.url

        return None


class AdminWishlistSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source="user.id")
    username = serializers.ReadOnlyField(source="user.username")
    user_email = serializers.ReadOnlyField(source="user.email")

    product_name = serializers.ReadOnlyField(source="product.name")
    product_price = serializers.SerializerMethodField()
    product_original_price = serializers.ReadOnlyField(source="product.price")
    product_thumbnail = serializers.SerializerMethodField()
    product_slug = serializers.ReadOnlyField(source="product.slug")
    stock_status = serializers.ReadOnlyField(source="product.stock_status")

    class Meta:
        model = Wishlist
        fields = (
            "id",
            "user_id",
            "username",
            "user_email",
            "product",
            "product_name",
            "product_price",
            "product_original_price",
            "product_thumbnail",
            "product_slug",
            "stock_status",
            "created_at",
        )

    def get_product_price(self, obj):
        return (
            obj.product.discount_price
            if obj.product.discount_price is not None
            else obj.product.price
        )

    def get_product_thumbnail(self, obj):
        request = self.context.get("request")

        if obj.product.thumbnail:
            if request:
                return request.build_absolute_uri(
                    obj.product.thumbnail.url
                )
            return obj.product.thumbnail.url

        return None

