from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer
from .permissions import IsAdmin, IsOwnerOrAdmin
from . import services


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        services.register_user(serializer.validated_data)


class LogoutView(APIView):
    """POST /api/auth/logout/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            services.logout_user(request.data["refresh"])
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/users/me/"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/users/me/change-password/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        services.change_password(request.user, serializer.validated_data["new_password"])
        return Response({"detail": "Password changed"})


class UserListView(generics.ListAPIView):
    """GET /api/users/"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return services.get_all_users()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/users/<id>/"""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj