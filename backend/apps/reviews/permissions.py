from rest_framework.permissions import BasePermission


class IsReviewOwnerOrReadOnly(BasePermission):
    """
    Owner can update/delete.
    Everyone can read.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        return obj.user == request.user