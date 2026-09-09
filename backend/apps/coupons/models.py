from django.db import models


class Coupon(models.Model):

    code = models.CharField(
        max_length=30,
        unique=True
    )

    discount = models.PositiveIntegerField()

    active = models.BooleanField(default=True)

    valid_from = models.DateTimeField()

    valid_to = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code