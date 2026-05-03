from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, LogoutView,
    ProfileView, ChangePasswordView,
    UserListView, UserDetailView,
)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),

    # Users
    path("users/", UserListView.as_view(), name="user_list"),
    path("users/me/", ProfileView.as_view(), name="user_profile"),
    path("users/me/change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
]