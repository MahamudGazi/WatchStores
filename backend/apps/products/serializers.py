from django.db.models import Avg
from rest_framework import serializers

from apps.wishlist.models import Wishlist
from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = "__all__"
        read_only_fields = ("product",)


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    total_sold = serializers.IntegerField(read_only=True, default=0)

    is_in_wishlist = serializers.SerializerMethodField()

    average_rating = serializers.SerializerMethodField()

    review_count = serializers.SerializerMethodField()

    stock_status = serializers.SerializerMethodField()

    discount_percentage = serializers.SerializerMethodField()

    brand_name = serializers.CharField(
        source="brand.name",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    thumbnail = serializers.ImageField(
        required=False,
        allow_null=True
    )
    class Meta:
        model = Product
        fields = "__all__"

    def update(self, instance, validated_data):
        instance = super().update(
            instance,
            validated_data
        )

        return instance

    def to_representation(self, instance):

        data = super().to_representation(instance)

        request = self.context.get("request")

        if instance.thumbnail and request:
            data["thumbnail"] = request.build_absolute_uri(
                instance.thumbnail.url
            )
        else:
            data["thumbnail"] = None

        return data


    def validate(self, data):
        price = data.get("price", getattr(self.instance, "price", None))
        discount = data.get("discount_price", getattr(self.instance, "discount_price", None))
        stock = data.get("stock", getattr(self.instance, "stock", None))

        if price is not None and price <= 0:
            raise serializers.ValidationError({"price": "Price must be greater than zero."})

        if discount is not None:
            if discount < 0:
                raise serializers.ValidationError({"discount_price": "Discount price cannot be negative."})
            if price is not None and discount >= price:
                raise serializers.ValidationError(
                    {"discount_price": "Discount price must be less than the regular price."}
                )

        if stock is not None and stock < 0:
            raise serializers.ValidationError({"stock": "Stock cannot be negative."})

        return data

    def get_is_in_wishlist(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return Wishlist.objects.filter(
            user=request.user,
            product=obj,
        ).exists()

    def get_average_rating(self, obj):
        average = obj.reviews.aggregate(
            Avg("rating")
        )["rating__avg"]

        return round(average, 1) if average else 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_stock_status(self, obj):
        if obj.stock == 0:
            return "Out of Stock"
        elif obj.stock <= 5:
            return "Low Stock"
        return "In Stock"
    
    def get_discount_percentage(self, obj):
        if obj.discount_price and obj.price:
            discount = (
                (obj.price - obj.discount_price)
                / obj.price
            ) * 100

            return round(discount)

        return 0