from django.db import models
from django.conf import settings


class ShippingAddress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shipping_addresses",
    )

    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address_line = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)

    country = models.CharField(
        max_length=100,
        default="Bangladesh",
    )

    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.user.username})"
    
    
class ShippingCharge(models.Model):
    district = models.CharField(
        max_length=100,
        unique=True
    )

    charge = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    estimated_days = models.PositiveIntegerField(default=3)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.district} - {self.charge}"