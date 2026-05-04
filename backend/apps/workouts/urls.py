from django.urls import path
from .views import ExerciseListView, StartWorkoutView, LogSetView, FinishWorkoutView

urlpatterns = [
    path('exercises/', ExerciseListView.as_view(), name='exercise_list'),
    path('start/', StartWorkoutView.as_view(), name='start_workout'),
    path('sessions/<int:session_id>/log/', LogSetView.as_view(), name='log_set'),
    path('sessions/<int:session_id>/finish/', FinishWorkoutView.as_view(), name='finish_workout'),
]