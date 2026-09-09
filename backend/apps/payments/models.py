from django.db import models

from apps.orders.models import Order


class Payment(models.Model):

    STATUS = (
        ("Pending", "Pending"),
        ("Success", "Success"),
        ("Failed", "Failed"),
        ("Cancelled", "Cancelled"),
    )

    METHOD = (
        ("COD", "Cash On Delivery"),
        ("SSL", "SSLCommerz"),
        ("BKASH", "bKash"),
        ("NAGAD", "Nagad"),
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment",
    )

    method = models.CharField(
        max_length=20,
        choices=METHOD,
    )

    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
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

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f"{self.order.order_number} - "
            f"{self.status}"
        )