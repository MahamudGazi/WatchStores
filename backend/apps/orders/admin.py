from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "payment_method",
        "grand_total",
        "status",
        "created_at",
    )

    list_editable = (
        "status",
    )

    list_filter = (
        "status",
        "payment_method",
    )

    search_fields = (
        "order_number",
        "user__username",
        "user__email",
    )

    ordering = ("-created_at",)