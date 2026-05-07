from rest_framework import serializers
from .models import Exercise, WorkoutSession, ExerciseSet, WeeklySplit
from rest_framework.validators import UniqueTogetherValidator

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = "__all__"

class ExerciseSetSerializer(serializers.ModelSerializer):
    # Afișăm și numele exercițiului, nu doar ID-ul, ca să fie mai ușor pe frontend
    exercise_name = serializers.ReadOnlyField(source='exercise.name')

    class Meta:
        model = ExerciseSet
        fields = ["id", "exercise", "exercise_name", "set_number", "reps", "weight_kg"]

class WorkoutSessionSerializer(serializers.ModelSerializer):
    # Aici folosim `related_name="sets"` din models.py pentru a aduce automat
    # toate seturile care aparțin de acest antrenament într-o singură cerere.
    sets = ExerciseSetSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutSession
        fields = ["id", "user", "date", "notes", "is_completed", "sets"]
        read_only_fields = ["user", "date"] # Acestea sunt setate automat pe backend


class WeeklySplitSerializer(serializers.ModelSerializer):
    # Adăugăm user-ul ascuns, luat automat din request, pentru a-l folosi în validator
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = WeeklySplit
        fields = ["id", "user", "day_of_week", "muscle_group", "exercises"]

        # Verificăm ca ACELAȘI user să nu își pună 2 antrenamente în ACEEAȘI zi
        validators = [
            UniqueTogetherValidator(
                queryset=WeeklySplit.objects.all(),
                fields=['user', 'day_of_week'],
                message="Ai deja un antrenament programat pentru această zi!"
            )
        ]