from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True
    )

    qr_code = serializers.ImageField(
        read_only=True
    )

    customer = serializers.CharField(
        source="order.user.username",
        read_only=True
    )

    amount = serializers.DecimalField(
        source="order.grand_total",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    payment_status = serializers.CharField(
        source="order.payment.status",
        read_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "order_number",
            "customer",
            "amount",
            "payment_status",
            "qr_code",
            "created_at",
        ]