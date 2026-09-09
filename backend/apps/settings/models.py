from django.db import models


class StoreSettings(models.Model):
    # =========================
    # GENERAL
    # =========================

    store_name = models.CharField(
        max_length=150,
        default="WatchStore",
    )

    store_email = models.EmailField(
        default="admin@watchstore.com",
    )

    phone = models.CharField(
        max_length=30,
        blank=True,
        default="",
    )

    address = models.TextField(
        blank=True,
        default="Dhaka, Bangladesh",
    )

    currency = models.CharField(
        max_length=10,
        default="BDT",
    )

    timezone = models.CharField(
        max_length=100,
        default="Asia/Dhaka",
    )

    store_active = models.BooleanField(
        default=True,
    )

    # =========================
    # NOTIFICATIONS
    # =========================

    new_order_notification = models.BooleanField(
        default=True,
    )

    new_customer_notification = models.BooleanField(
        default=True,
    )

    low_stock_notification = models.BooleanField(
        default=True,
    )

    return_request_notification = models.BooleanField(
        default=True,
    )

    refund_request_notification = models.BooleanField(
        default=True,
    )

    email_notification = models.BooleanField(
        default=True,
    )

    # =========================
    # SECURITY
    # =========================

    two_factor_enabled = models.BooleanField(
        default=False,
    )

    login_alert = models.BooleanField(
        default=True,
    )

    # =========================
    # SHIPPING
    # =========================

    delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=80,
    )

    delivery_days = models.PositiveIntegerField(
        default=5,
    )

    free_shipping_minimum = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=5000,
    )

    shipping_country = models.CharField(
        max_length=100,
        default="Bangladesh",
    )

    # =========================
    # PAYMENT
    # =========================

    cash_on_delivery = models.BooleanField(
        default=True,
    )

    sslcommerz_enabled = models.BooleanField(
        default=True,
    )

    stripe_enabled = models.BooleanField(
        default=False,
    )

    # =========================
    # EMAIL
    # =========================

    email_from_name = models.CharField(
        max_length=150,
        default="WatchStore",
    )

    email_from_email = models.EmailField(
        default="admin@watchstore.com",
    )

    smtp_host = models.CharField(
        max_length=255,
        default="smtp.gmail.com",
    )

    smtp_port = models.PositiveIntegerField(
        default=587,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Store Settings"
        verbose_name_plural = "Store Settings"

    def __str__(self):
        return self.store_name