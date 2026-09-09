from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Object owner only.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsAdminOrReadOnly(BasePermission):
    """
    Anyone can read.
    Only Admin/Super Admin can modify.
    """

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        user = request.user

        if not user or not user.is_authenticated:
            return False

        return (
            user.is_superuser
            or user.groups.filter(name="Admin").exists()
        )


class IsCustomer(BasePermission):
    """
    Logged-in customers only.
    """

    def has_permission(self, request, view):
        user = request.user

        return (
            user
            and user.is_authenticated
            and not user.is_staff
        )


class IsAdmin(BasePermission):
    """
    Allows Super Admin and Admin users.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return (
            user.is_superuser
            or user.groups.filter(name="Admin").exists()
        )


class IsSuperAdmin(BasePermission):
    """
    Allows access only to Super Admin.
    """

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_superuser
        )


class IsStaffMember(BasePermission):
    """
    Allows Super Admin, Admin and Staff users.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return (
            user.is_superuser
            or user.groups.filter(name__in=["Admin", "Staff"]).exists()
        )