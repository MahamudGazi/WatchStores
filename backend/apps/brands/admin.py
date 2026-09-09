from django.contrib import admin
from .models import Brand


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "country",
        "is_active",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    search_fields = (
        "name",
        "country",
    )