from django.urls import path
from .views import MuscleGroupListView, ExerciseListView, StartWorkoutView, LogSetView, FinishWorkoutView, \
    WeeklySplitView, WeeklySplitDetailView, ExerciseSetDetailView

urlpatterns = [
    path('workouts/exercises/muscle_groups/', MuscleGroupListView.as_view(), name='muscle-groups'),
    path('workouts/exercises/', ExerciseListView.as_view(), name='exercise_list'),

    path('workouts/start/', StartWorkoutView.as_view(), name='start_workout'),
    path('workouts/sessions/<int:session_id>/log/', LogSetView.as_view(), name='log_set'),
    path('workouts/sessions/<int:session_id>/finish/', FinishWorkoutView.as_view(), name='finish_workout'),

    path('workouts/split/', WeeklySplitView.as_view(), name='weekly_split'),
    path('workouts/sets/<int:pk>/', ExerciseSetDetailView.as_view(), name='set_detail'),
    path('workouts/split/<int:pk>/', WeeklySplitDetailView.as_view(), name='weekly_split_detail'),
]