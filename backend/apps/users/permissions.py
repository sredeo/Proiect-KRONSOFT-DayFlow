from rest_framework.permissions import BasePermission
from .models import Role


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ADMIN)


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == Role.ADMIN:
            return True
        # obj must have user or be user
        owner = getattr(obj, "user", obj)
        return owner == request.user