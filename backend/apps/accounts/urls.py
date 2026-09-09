from django.urls import path

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    RegisterView,
    LoginView,
    ProfileView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    SendEmailVerificationView,
    VerifyEmailView,
    AdminUserViewSet,
)


router = DefaultRouter()

router.register(
    r"admin/users",
    AdminUserViewSet,
    basename="admin-users",
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password-reset",
    ),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
    path(
        "verify-email/send/",
        SendEmailVerificationView.as_view(),
        name="send-email-verify",
    ),
    path(
        "verify-email/",
        VerifyEmailView.as_view(),
        name="verify-email",
    ),
] + router.urls