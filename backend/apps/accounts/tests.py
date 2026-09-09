from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPass123!",
        )

    def test_register(self):
        res = self.client.post(
            "/api/auth/register/",
            {
                "username": "newuser",
                "email": "new@example.com",
                "password": "StrongPass123!",
                "phone": "01712345678",
            },
            format="json",
        )
        self.assertIn(res.status_code, (200, 201))

    def test_login(self):
        res = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)

    def test_password_reset_request(self):
        res = self.client.post(
            "/api/auth/password-reset/",
            {"email": "test@example.com"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
