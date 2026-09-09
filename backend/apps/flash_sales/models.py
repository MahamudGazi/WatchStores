from django.db import models
from django.utils import timezone

from apps.products.models import Product


class FlashSale(models.Model):

    name = models.CharField(max_length=120)

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="flash_sales",
    )

    discount = models.PositiveIntegerField()

    start_time = models.DateTimeField()

    end_time = models.DateTimeField()

    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.discount}%)"

    @property
    def is_running(self):
        now = timezone.now()
        return (
            self.active
            and self.start_time <= now <= self.end_time
        )