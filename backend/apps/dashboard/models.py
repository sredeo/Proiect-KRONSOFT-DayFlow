from django.db import models
from django.conf import settings
# Create your models here.

class TaskCategory(models.TextChoices):
    WORK = "work", "Muncă"
    WORKOUT = "workout", "Workout"
    MEETING = "meeting", "Întâlnire"
    SHOPPING = "shopping", "Cumpărături"
    HOBBY = "hobby", "Hobby"
    OTHER = "other", "Altele"


class TransportMode(models.TextChoices):
    CAR = "car", "Mașină"
    WALKING = "walking", "Pe jos"
    TRANSIT = "transit", "Transport comun"


class Task(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=TaskCategory.choices, default=TaskCategory.OTHER)

    # Timeline
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    # Locatie si deplasare
    location = models.CharField(max_length=255, blank=True, null=True)
    transport_mode = models.CharField(max_length=20, choices=TransportMode.choices, default=TransportMode.CAR)
    estimated_transit_time = models.IntegerField(default=0, help_text="Timpul estimat in minute")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "dashboard_tasks"
        ordering = ["date", "start_time"]  # Ordonare cronologica by default

    def __str__(self):
        return f"{self.title} - {self.start_time}"