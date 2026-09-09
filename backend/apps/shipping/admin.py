from django.contrib import admin
from .models import ShippingAddress
from .models import ShippingAddress, ShippingCharge


@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "user",
        "phone",
        "district",
        "is_default",
    )

    list_filter = (
        "district",
        "is_default",
    )

    search_fields = (
        "full_name",
        "phone",
        "user__username",
    )
    

@admin.register(ShippingCharge)
class ShippingChargeAdmin(admin.ModelAdmin):
    list_display = (
        "district",
        "charge",
        "estimated_days",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "district",
    )