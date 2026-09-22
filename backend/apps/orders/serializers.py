from rest_framework import serializers

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
    ReturnRequest,
    ReturnRequestImage,
    Refund,
)

from apps.shipping.models import ShippingAddress


class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.ReadOnlyField(
        source="product.name"
    )

    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "order",
            "product",
            "product_name",
            "quantity",
            "price",
            "subtotal",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "subtotal",
        ]


class OrderStatusHistorySerializer(
    serializers.ModelSerializer
):

    changed_by = serializers.CharField(
        source="changed_by.username",
        read_only=True,
    )

    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True,
    )

    class Meta:
        model = OrderStatusHistory

        fields = [
            "id",
            "order_number",
            "status",
            "remarks",
            "changed_by",
            "changed_at",
        ]

        read_only_fields = [
            "id",
            "order_number",
            "changed_by",
            "changed_at",
        ]


class ShippingAddressSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ShippingAddress

        fields = [
            "id",
            "full_name",
            "phone",
            "address_line",
            "city",
            "district",
            "postal_code",
            "country",
        ]

        read_only_fields = ["id"]


class OrderSerializer(serializers.ModelSerializer):

    customer = serializers.SerializerMethodField()


    payment_status = serializers.CharField(
        source="payment.status",
        read_only=True,
    )

    payment_transaction_id = serializers.CharField(
        source="payment.transaction_id",
        read_only=True,
    )

    payment_amount = serializers.DecimalField(
        source="payment.amount",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    status_history = OrderStatusHistorySerializer(
        many=True,
        read_only=True,
    )

    shipping_address = ShippingAddressSerializer(
        read_only=True,
    )

    shipping_address_id = serializers.PrimaryKeyRelatedField(
        source="shipping_address",
        queryset=ShippingAddress.objects.all(),
        write_only=True,
        required=True,
    )

    class Meta:
        model = Order

        fields = [
            "id",
            "customer",
            "user",
            "shipping_address",
            "shipping_address_id",
            "order_number",
            "payment_method",
            "payment_status",
            "payment_transaction_id",
            "payment_amount",
            "ip_address",
            "coupon",
            "total_price",
            "delivery_charge",
            "grand_total",
            "status",
            "created_at",
            "updated_at",
            "items",
            "status_history",
        ]

        read_only_fields = [
            "id",
            "user",
            "order_number",
            "ip_address",
            "payment_method",
            "coupon",
            "total_price",
            "delivery_charge",
            "grand_total",
            "status",
            "created_at",
            "updated_at",
            "items",
            "status_history",
            "customer",
        ]

    def get_customer(self, obj):

        if not obj.user:
            return None

        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
        }

    def validate_shipping_address_id(self, value):

        request = self.context.get("request")

        if request is None:
            return value

        if value.user != request.user:
            raise serializers.ValidationError(
                "Invalid shipping address."
            )

        return value


class ReturnRequestImageSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ReturnRequestImage

        fields = [
            "id",
            "image",
            "uploaded_at",
        ]

        read_only_fields = [
            "id",
            "uploaded_at",
        ]


class ReturnRequestSerializer(
    serializers.ModelSerializer
):

    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True,
    )

    customer = serializers.SerializerMethodField()

    shipping_address = ShippingAddressSerializer(
        source="order.shipping_address",
        read_only=True,
    )

    images = ReturnRequestImageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = ReturnRequest

        fields = [
            "id",
            "order",
            "order_number",
            "customer",
            "shipping_address",
            "reason",
            "status",
            "created_at",
            "images",
        ]

        read_only_fields = [
            "id",
            "order",
            "order_number",
            "customer",
            "shipping_address",
            "status",
            "created_at",
            "images",
        ]

    def get_customer(self, obj):

        user = obj.order.user

        if not user:
            return None

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }

class RefundSerializer(serializers.ModelSerializer):

    order_number = serializers.CharField(
        source="return_request.order.order_number",
        read_only=True,
    )

    class Meta:
        model = Refund

        fields = [
            "id",
            "return_request",
            "order_number",
            "amount",
            "status",
            "transaction_id",
            "refunded_at",
        ]

        read_only_fields = [
            "id",
            "order_number",
            "refunded_at",
        ]