from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ShippingAddressViewSet, shipping_charges

router = DefaultRouter()

router.register(
    "",
    ShippingAddressViewSet,
    basename="shipping",
)

urlpatterns = [
    path(
        "charges/",
        shipping_charges,
        name="shipping-charges",
    ),
] + router.urls