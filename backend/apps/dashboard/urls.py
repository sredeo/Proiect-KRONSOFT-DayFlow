from django.urls import path
from .views import DailyTimelineView, TaskCreateView, EstimateTransitView, LocationSuggestView, TaskDetailView

urlpatterns = [
    path("dashboard/timeline/", DailyTimelineView.as_view(), name="daily_timeline"),
    path("dashboard/tasks/create/", TaskCreateView.as_view(), name="create_task"),
    path("dashboard/tasks/estimate/", EstimateTransitView.as_view(), name="estimate_transit"),
    path("dashboard/locations/suggest/", LocationSuggestView.as_view(), name="suggest_locations"),
    path("dashboard/tasks/<int:task_id>/", TaskDetailView.as_view(), name="delete_task"),
]