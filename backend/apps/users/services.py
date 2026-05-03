from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


def register_user(validated_data: dict) -> User:
    return User.objects.create_user(**validated_data)


def logout_user(refresh_token: str) -> None:
    token = RefreshToken(refresh_token)
    token.blacklist()


def change_password(user: User, new_password: str) -> User:
    user.set_password(new_password)
    user.save()
    return user


def get_all_users():
    return User.objects.all().order_by("-created_at")