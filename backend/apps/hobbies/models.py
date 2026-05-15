from django.db import models
from django.conf import settings

class Hobby(models.Model):
    ENERGY_LEVELS = [
        ('Low', 'Low Energy (Relaxing)'),
        ('Medium', 'Medium Energy (Active)'),
        ('High', 'High Energy (Demanding)'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    # Obiective
    weekly_goal = models.PositiveIntegerField(help_text="De câte ori pe săptămână?")
    preferred_duration_mins = models.PositiveIntegerField(default=30)
    energy_required = models.CharField(max_length=10, choices=ENERGY_LEVELS, default='Medium')

    # Progres
    current_streak = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class HobbyLog(models.Model):
    hobby = models.ForeignKey(Hobby, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField(auto_now_add=True)
    duration_mins = models.PositiveIntegerField()
    completed = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.hobby.name} on {self.date}"

