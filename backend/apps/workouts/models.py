from django.db import models
from django.conf import settings

class Exercise(models.Model):
    name = models.CharField(max_length=100, unique=True)
    muscle_group = models.CharField(max_length=50)

    class Meta:
        db_table = "exercises"

    def __str__(self):
        return self.name

class WorkoutSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="workouts")
    date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        db_table = "workout_sessions"

    def __str__(self):
        return f"{self.user.username} - {self.date}"

class ExerciseSet(models.Model):
    session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name="sets")
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    set_number = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = "exercise_sets"

    def __str__(self):
        return f"{self.exercise.name} - Set {self.set_number}: {self.reps}x {self.weight_kg}kg"

class WeeklySplit(models.Model):
        DAYS_OF_WEEK = [
            ('Monday', 'Monday'),
            ('Tuesday', 'Tuesday'),
            ('Wednesday', 'Wednesday'),
            ('Thursday', 'Thursday'),
            ('Friday', 'Friday'),
            ('Saturday', 'Saturday'),
            ('Sunday', 'Sunday'),
        ]
        user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weekly_splits')
        day_of_week = models.CharField(max_length=15, choices=DAYS_OF_WEEK)
        muscle_group = models.CharField(max_length=100)  # Ex: "Piept si Triceps", "Picioare"

        exercises = models.ManyToManyField(Exercise, blank=True, related_name="routines")

        class Meta:
            # Ne asiguram ca userul nu poate pune doua split-uri diferite pe aceeasi zi
            unique_together = ['user', 'day_of_week']

        def __str__(self):
            return f"{self.user} - {self.day_of_week}: {self.muscle_group}"