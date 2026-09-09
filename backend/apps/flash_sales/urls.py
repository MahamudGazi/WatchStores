from rest_framework.routers import DefaultRouter

from .views import FlashSaleViewSet


router = DefaultRouter()

router.register(
    r"flash-sales",
    FlashSaleViewSet,
    basename="flash-sale",
)

urlpatterns = router.urls