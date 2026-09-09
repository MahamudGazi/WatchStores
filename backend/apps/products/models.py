from django.db import models
from django.utils.text import slugify
from config import settings

from apps.brands.models import Brand
from apps.categories.models import Category


class Product(models.Model):
    brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name="products"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )

    name = models.CharField(max_length=200)

    slug = models.SlugField(
        unique=True,
        blank=True
    )

    sku = models.CharField(
        max_length=50,
        unique=True
    )

    short_description = models.CharField(
        max_length=300
    )

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    stock = models.PositiveIntegerField(default=0)

    thumbnail = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True
    )

    @property
    def stock_status(self):
        if self.stock > 10:
            return "In Stock"
        elif self.stock > 0:
            return "Low Stock"
        return "Out of Stock"

    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views_count = models.PositiveIntegerField(default=0)
    is_flash_sale = models.BooleanField(default=False)





    class Meta:
        ordering = ["-created_at"]

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.price is not None and self.price <= 0:
            raise ValidationError({"price": "Price must be greater than zero."})
        if self.discount_price is not None:
            if self.discount_price < 0:
                raise ValidationError({"discount_price": "Cannot be negative."})
            if self.price and self.discount_price >= self.price:
                raise ValidationError(
                    {"discount_price": "Must be less than regular price."}
                )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # Ensure stock never goes negative at model level
        if self.stock is not None and self.stock < 0:
            self.stock = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="products/gallery/"
    )

    alt_text = models.CharField(
        max_length=255,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.product.name} Image"


class RecentlyViewed(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recently_viewed_products"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="recent_views"
    )

    viewed_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-viewed_at"]
        unique_together = ("user", "product")

    def __str__(self):
        return f"{self.user} viewed {self.product}"
    
    
