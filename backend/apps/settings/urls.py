from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StoreSettingsView,
    EmailSettingsView,
    ShippingSettingsView,
    DeliveryChargeViewSet,
)

router = DefaultRouter()
router.register(
    r"delivery-charges",
    DeliveryChargeViewSet,
    basename="delivery-charges",
)

urlpatterns = [
    path("store/", StoreSettingsView.as_view(), name="store-settings"),
    path("email/", EmailSettingsView.as_view(), name="email-settings"),
    path("shipping/", ShippingSettingsView.as_view(), name="shipping-settings"),
] + router.urls
