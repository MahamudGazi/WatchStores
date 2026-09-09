from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    PaymentViewSet,
    create_payment_session,
    payment_success,
    payment_fail,
    payment_cancel,
    payment_ipn,
)


router = DefaultRouter()

router.register(
    "",
    PaymentViewSet,
    basename="payments",
)


urlpatterns = [

    path(
        "create-session/",
        create_payment_session,
        name="create-payment-session",
    ),

    path(
        "success/",
        payment_success,
        name="payment-success",
    ),

    path(
        "fail/",
        payment_fail,
        name="payment-fail",
    ),

    path(
        "cancel/",
        payment_cancel,
        name="payment-cancel",
    ),

    path(
        "ipn/",
        payment_ipn,
        name="payment-ipn",
    ),

] + router.urls