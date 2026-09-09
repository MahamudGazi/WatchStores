from django.contrib import admin

from .models import FlashSale


@admin.register(FlashSale)
class FlashSaleAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "product",
        "discount",
        "active",
        "start_time",
        "end_time",
    )

    list_filter = (
        "active",
        "start_time",
    )

    search_fields = (
        "name",
        "product__name",
    )

    ordering = ("-created_at",)