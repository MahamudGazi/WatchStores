from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    profile_image = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
    )
    is_email_verified = models.BooleanField(default=False)
    email_otp = models.CharField(max_length=6, blank=True, default="")
    email_otp_created_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.username
