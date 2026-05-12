from django.urls import path
from .views import MuscleGroupListView, ExerciseListView, StartWorkoutView, LogSetView, FinishWorkoutView, \
    WeeklySplitView, WeeklySplitDetailView, ExerciseSetDetailView

urlpatterns = [
    path('exercises/muscle_groups/', MuscleGroupListView.as_view(), name='muscle-groups'),
    path('exercises/', ExerciseListView.as_view(), name='exercise_list'),

    path('start/', StartWorkoutView.as_view(), name='start_workout'),
    path('sessions/<int:session_id>/log/', LogSetView.as_view(), name='log_set'),
    path('sessions/<int:session_id>/finish/', FinishWorkoutView.as_view(), name='finish_workout'),

    path('split/', WeeklySplitView.as_view(), name='weekly_split'),
    path('sets/<int:pk>/', ExerciseSetDetailView.as_view(), name='set_detail'),
    path('split/<int:pk>/', WeeklySplitDetailView.as_view(), name='weekly_split_detail'),
]