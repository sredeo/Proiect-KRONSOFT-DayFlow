from django.db import models
from django.conf import settings


class TransportMode(models.TextChoices):
    CAR = "car", "Mașină"
    WALKING = "walking", "Pe jos"
    TRANSIT = "transit", "Transport comun"


class UserPreferences(models.Model):
    # Folosim OneToOneField pentru ca un user are un singur set de preferinte
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="preferences")
    default_transport_mode = models.CharField(max_length=20, choices=TransportMode.choices, default=TransportMode.CAR)

    # Comutatoare (Toggles) pentru notificari
    transit_notifications = models.BooleanField(default=True)
    hobby_notifications = models.BooleanField(default=True)

    class Meta:
        db_table = "user_preferences"

    def __str__(self):
        return f"Preferinte pentru {self.user.email}"


class FavoriteLocation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorite_locations")
    name = models.CharField(max_length=50, help_text="Ex: Acasă, Birou, Sală, Facultate")
    address = models.CharField(max_length=255)

    class Meta:
        db_table = "favorite_locations"

    def __str__(self):
        return f"{self.name} - {self.user.email}"