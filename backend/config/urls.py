from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)


def health_check(request):
    """Simple health endpoint for load balancers / monitoring."""
    return JsonResponse({"status": "ok", "service": "watchstore-api"})


urlpatterns = [
    path("health/", health_check, name="health"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/brands/", include("apps.brands.urls")),
    path("api/categories/", include("apps.categories.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/cart/", include("apps.cart.urls")),
    path("api/wishlist/", include("apps.wishlist.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/", include("apps.flash_sales.urls")),
    path("api/invoices/", include("apps.invoices.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/shipping/", include("apps.shipping.urls")),
    path("api/coupons/", include("apps.coupons.urls")),
    path("api/", include("apps.promotions.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/settings/", include("apps.settings.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
