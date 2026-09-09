from rest_framework.routers import DefaultRouter
from .views import WishlistViewSet, AdminWishlistViewSet

router = DefaultRouter()
router.register(
    "admin",
    AdminWishlistViewSet,
    basename="admin-wishlist",
)

router.register(
    "",
    WishlistViewSet,
    basename="wishlist",
)
urlpatterns = router.urls