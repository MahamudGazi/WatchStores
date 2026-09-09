from rest_framework.routers import DefaultRouter

from .views import (
    OrderViewSet,
    ShippingAddressViewSet,
)

router = DefaultRouter()

router.register(
    r"shipping-addresses",
    ShippingAddressViewSet,
    basename="shipping-addresses",
)

router.register(
    r"",
    OrderViewSet,
    basename="orders",
)

urlpatterns = router.urls