from django.conf import settings
from django.db import models

from apps.products.models import Product
from apps.coupons.models import Coupon
from apps.shipping.models import ShippingAddress


PAYMENT = (
    ("COD", "Cash On Delivery"),
    ("SSL", "SSLCommerz"),
    ("BKASH", "bKash"),
    ("NAGAD", "Nagad"),
)


class Order(models.Model):

    STATUS = (
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Out for Delivery", "Out for Delivery"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    shipping_address = models.ForeignKey(
        ShippingAddress,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="orders",
    )

    order_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT,
        default="COD",
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    delivery_charge = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=80,
    )

    grand_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    stock_deducted = models.BooleanField(
        default=False,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS,
        default="Pending",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def save(self, *args, **kwargs):

        # First save to get database ID
        if not self.pk:
            super().save(*args, **kwargs)

        # Generate order number from database ID
        if not self.order_number:

            year = self.created_at.year

            self.order_number = (
                f"ORD-{year}-{self.id:06d}"
            )

            super().save(
                update_fields=["order_number"]
            )

        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    @property
    def subtotal(self):
        return self.price * self.quantity

    def __str__(self):
        return (
            f"{self.product.name} x {self.quantity}"
        )


class OrderStatusHistory(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="status_history",
    )

    status = models.CharField(
        max_length=20,
        choices=Order.STATUS,
    )

    remarks = models.TextField(
        blank=True,
        default="",
    )

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    changed_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-changed_at"]

    def __str__(self):
        return (
            f"{self.order.order_number} - "
            f"{self.status}"
        )


class ReturnRequest(models.Model):

    STATUS = (
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
        ("Completed", "Completed"),
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="return_request",
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Pending",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f"{self.order.order_number} - "
            f"{self.status}"
        )


class Refund(models.Model):

    STATUS = (
        ("Pending", "Pending"),
        ("Processing", "Processing"),
        ("Completed", "Completed"),
        ("Rejected", "Rejected"),
    )

    return_request = models.OneToOneField(
        ReturnRequest,
        on_delete=models.CASCADE,
        related_name="refund",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Pending",
    )

    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    refunded_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return (
            f"{self.return_request.order.order_number}"
            f" - {self.status}"
        )

class ReturnRequestImage(models.Model):
    return_request = models.ForeignKey(
        ReturnRequest,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="returns/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )