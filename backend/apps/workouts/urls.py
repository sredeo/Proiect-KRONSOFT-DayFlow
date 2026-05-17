from django.urls import path
from .views import (
    MuscleGroupListView, ExerciseListView, StartWorkoutView, LogSetView,
    FinishWorkoutView, WeeklySplitView, WeeklySplitDetailView, ExerciseSetDetailView,
    ExerciseHistoryView, WorkoutSessionDetailView
)

urlpatterns = [
    # Catalog Exerciții
    path('workouts/exercises/muscle_groups/', MuscleGroupListView.as_view(), name='muscle-groups'),
    path('workouts/exercises/', ExerciseListView.as_view(), name='exercise_list'),

    # Istoric Exercițiu
    path('workouts/exercises/<int:exercise_id>/history/', ExerciseHistoryView.as_view(), name='exercise_history'),

    # Flux Antrenament (Start, Logare, Finish)
    path('workouts/start/', StartWorkoutView.as_view(), name='start_workout'),
    path('workouts/sessions/<int:session_id>/log/', LogSetView.as_view(), name='log_set'),
    path('workouts/sessions/<int:session_id>/finish/', FinishWorkoutView.as_view(), name='finish_workout'),

    # Ștergere/Editare Sesiune completă
    path('workouts/sessions/<int:pk>/', WorkoutSessionDetailView.as_view(), name='session_detail'),

    # Seturi Individuale (Editare/Ștergere greutăți)
    path('workouts/sets/<int:pk>/', ExerciseSetDetailView.as_view(), name='set_detail'),

    # Split Săptămânal
    path('workouts/split/', WeeklySplitView.as_view(), name='weekly_split'),
    path('workouts/split/<int:pk>/', WeeklySplitDetailView.as_view(), name='weekly_split_detail'),
]