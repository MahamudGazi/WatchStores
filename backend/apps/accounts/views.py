import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, status, filters, viewsets, serializers
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import IsSuperAdmin

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.core.throttles import LoginRateThrottle
from .serializers import (
    ChangePasswordSerializer,
    RegisterSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerifySerializer,
    AdminUserSerializer,
    AdminCreateUserSerializer,
)

User = get_user_model()

def _generate_otp():
    return f"{random.randint(100000, 999999)}"

def _send_otp_email(user, purpose="verification"):
    otp = _generate_otp()
    user.email_otp = otp
    user.email_otp_created_at = timezone.now()
    user.save(update_fields=["email_otp", "email_otp_created_at"])

    subject = (
        "WatchStore – Email Verification"
        if purpose == "verification"
        else "WatchStore – Password Reset OTP"
    )
    message = f"Your OTP is: {otp}\nValid for 15 minutes."
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
    except Exception:
        pass
    return otp
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user

        if u.is_superuser:
            role = "SUPER_ADMIN"
        elif not u.is_staff:
            role = "CUSTOMER"
        elif u.groups.filter(name="Staff").exists():
            role = "STAFF"
        elif u.groups.filter(name="Admin").exists():
            role = "ADMIN"
        else:
            role = "ADMIN"

        return Response({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "phone": u.phone,
            "is_email_verified": u.is_email_verified,
            "is_staff": u.is_staff,
            "role": role,
        })
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        if user.email:
            _send_otp_email(user, purpose="verification")
class LoginView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = PasswordResetRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"]
        try:
            user = User.objects.get(email__iexact=email)
            _send_otp_email(user, purpose="reset")
        except User.DoesNotExist:
            pass
        # Always same message (don't leak existence)
        return Response({
            "success": True,
            "message": "If this email exists, an OTP has been sent.",
        })
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = PasswordResetConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"]
        otp = ser.validated_data["otp"]
        new_password = ser.validated_data["new_password"]

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "Invalid email or OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.email_otp or user.email_otp != otp:
            return Response(
                {"success": False, "message": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.email_otp_created_at or (
            timezone.now() - user.email_otp_created_at > timedelta(minutes=15)
        ):
            return Response(
                {"success": False, "message": "OTP expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.email_otp = ""
        user.email_otp_created_at = None
        user.save()
        return Response({
            "success": True,
            "message": "Password reset successfully.",
        })
class SendEmailVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.is_email_verified:
            return Response({"success": True, "message": "Already verified."})
        if not request.user.email:
            return Response(
                {"success": False, "message": "No email on account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        _send_otp_email(request.user, purpose="verification")
        return Response({"success": True, "message": "OTP sent to your email."})
class VerifyEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = EmailVerifySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        otp = ser.validated_data["otp"]
        user = request.user

        if not user.email_otp or user.email_otp != otp:
            return Response(
                {"success": False, "message": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.email_otp_created_at or (
            timezone.now() - user.email_otp_created_at > timedelta(minutes=15)
        ):
            return Response(
                {"success": False, "message": "OTP expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_email_verified = True
        user.email_otp = ""
        user.email_otp_created_at = None
        user.save()
        return Response({"success": True, "message": "Email verified."})
class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Super Admin only user management API.

    Supports:
    - List users
    - Create Admin/Staff
    - Retrieve user
    - Update user
    - Partial update user
    - Delete user
    - Change role
    """
    queryset = (
        User.objects
        .all()
        .prefetch_related("groups")
        .order_by("-date_joined")
    )

    permission_classes = [
        IsAuthenticated,
        IsSuperAdmin,
    ]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "is_active",
        "is_email_verified",
        "is_staff",
    ]

    search_fields = [
        "username",
        "email",
        "phone",
    ]

    ordering_fields = [
        "username",
        "email",
        "date_joined",
    ]

    ordering = [
        "-date_joined",
    ]

    def get_serializer_class(self):
        """
        Use a separate serializer for creating Admin/Staff.
        """

        if self.action == "create":
            return AdminCreateUserSerializer

        return AdminUserSerializer

    def perform_update(self, serializer):
        """
        Prevent Super Admin from being accidentally modified
        through normal user update.
        """

        user = self.get_object()

        if user.is_superuser:
            raise serializers.ValidationError(
                "Super Admin cannot be modified through this endpoint."
            )

        serializer.save()

    def destroy(self, request, *args, **kwargs):
        """
        Prevent deleting Super Admin.
        """

        user = self.get_object()

        if user.is_superuser:
            return Response(
                {
                    "success": False,
                    "message": "Super Admin cannot be deleted.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.id == request.user.id:
            return Response(
                {
                    "success": False,
                    "message": "You cannot delete your own account.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()

        return Response(
            {
                "success": True,
                "message": "User deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="role",
    )
    def update_role(self, request, pk=None):
        """
        Change user role.

        Allowed:
        - ADMIN
        - STAFF
        - CUSTOMER

        Super Admin cannot be changed.
        """

        user = self.get_object()

        role = request.data.get("role")

        allowed_roles = {
            "ADMIN",
            "STAFF",
            "CUSTOMER",
        }

        if role not in allowed_roles:
            return Response(
                {
                    "success": False,
                    "message": "Invalid role.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Never modify Super Admin role
        if user.is_superuser:
            return Response(
                {
                    "success": False,
                    "message": (
                        "Super Admin role cannot be changed."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent changing own role
        if user.id == request.user.id:
            return Response(
                {
                    "success": False,
                    "message": (
                        "You cannot change your own role."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        admin_group, _ = Group.objects.get_or_create(
            name="Admin"
        )

        staff_group, _ = Group.objects.get_or_create(
            name="Staff"
        )

        # Remove existing role groups
        user.groups.remove(
            admin_group,
            staff_group
        )

        if role == "ADMIN":

            user.is_staff = True

            user.groups.add(
                admin_group
            )

        elif role == "STAFF":

            user.is_staff = True

            user.groups.add(
                staff_group
            )

        elif role == "CUSTOMER":

            user.is_staff = False

        user.save(
            update_fields=[
                "is_staff"
            ]
        )

        serializer = AdminUserSerializer(
            user,
            context={
                "request": request
            }
        )

        return Response(
            {
                "success": True,
                "message": "Role updated successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    """Authenticated user can change their own password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"success": True, "message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )
