from django.urls import path
from .views import DailyTimelineView, TaskCreateView

urlpatterns = [
    path("dashboard/timeline/", DailyTimelineView.as_view(), name="daily_timeline"),
    path("dashboard/tasks/create/", TaskCreateView.as_view(), name="create_task"),
]