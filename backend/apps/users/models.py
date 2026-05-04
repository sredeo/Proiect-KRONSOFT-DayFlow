from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Role(models.TextChoices):
    ADMIN = "admin", "Admin"
    #MODERATOR = "moderator", "Moderator"
    PREMIUM_USER = "premium_user", "Premium User"
    USER = "user", "User"


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Need an email address")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", Role.USER)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    #avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)

    default_location = models.CharField(max_length=255, default="Brașov, România",
                                        help_text="Locația de unde își începe ziua utilizatorul")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.email

    @property
    def is_admin(self):
        return self.role == Role.ADMIN