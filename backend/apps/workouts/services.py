from .models import Exercise, WorkoutSession, ExerciseSet
from django.shortcuts import get_object_or_404


def create_workout_session(user, notes=""):
    """Creează o nouă sesiune de antrenament pentru ziua curentă."""
    return WorkoutSession.objects.create(user=user, notes=notes)


def log_exercise_set(session, exercise_id, set_number, reps, weight_kg):
    """Adaugă un set specific (cu kilograme și repetări) la antrenamentul curent."""
    exercise = get_object_or_404(Exercise, id=exercise_id)
    return ExerciseSet.objects.create(
        session=session,
        exercise=exercise,
        set_number=set_number,
        reps=reps,
        weight_kg=weight_kg
    )


def finish_and_get_daily_summary(session):
    """
    Marchează antrenamentul ca fiind complet și extrage sumarul.
    Aici se pregătesc datele pentru analiza progresului și sugestiile de îmbunătățire.
    """
    session.is_completed = True
    session.save()

    # Returnăm sesiunea, iar serializerul se va ocupa să aducă toate seturile
    return session