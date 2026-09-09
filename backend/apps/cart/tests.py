from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.products.models import Product
from apps.brands.models import Brand
from apps.categories.models import Category
from .models import Cart

User = get_user_model()


class CartTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="cartuser", password="TestPass123!"
        )
        self.client.force_authenticate(user=self.user)
        brand = Brand.objects.create(name="TestBrand", slug="testbrand")
        cat = Category.objects.create(name="TestCat", slug="testcat")
        self.product = Product.objects.create(
            brand=brand,
            category=cat,
            name="Test Watch",
            sku="TW-001",
            short_description="Nice",
            description="Desc",
            price=1000,
            discount_price=800,
            stock=10,
        )

    def test_add_to_cart(self):
        res = self.client.post(
            "/api/cart/",
            {"product": self.product.id, "quantity": 2},
            format="json",
        )
        self.assertIn(res.status_code, (200, 201))
        self.assertTrue(
            Cart.objects.filter(user=self.user, product=self.product).exists()
        )

    def test_cart_subtotal_uses_discount(self):
        item = Cart.objects.create(
            user=self.user, product=self.product, quantity=2
        )
        self.assertEqual(item.subtotal, 1600)  # 800 * 2
