from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.dateparse import parse_date
from datetime import date
from django.shortcuts import get_object_or_404

from .models import Task
from .serializers import TaskSerializer
from . import services


class DailyTimelineView(APIView):
    permission_classes = [IsAuthenticated]  # Doar userii logati

    def get(self, request):
        date_param = request.query_params.get("date")
        target_date = parse_date(date_param) if date_param else date.today()


        tasks = services.get_daily_timeline(request.user, target_date)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)


        task = services.create_task(request.user, serializer.validated_data)


        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

class EstimateTransitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        transit_time = services.estimate_task_transit(
            user=request.user,
            target_date=data.get("date"),
            start_time=data.get("start_time"),
            destination=data.get("location"),
            transport_mode=data.get("transport_mode"),
            origin_preference=data.get("origin_preference", "previous"),
            custom_origin=data.get("custom_origin", "")
        )
        return Response({"estimated_transit_time": transit_time}, status=status.HTTP_200_OK)

class LocationSuggestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        suggestions = services.get_location_suggestions(query)
        return Response(suggestions, status=status.HTTP_200_OK)

class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, task_id):
        task = get_object_or_404(Task, id=task_id, user=request.user)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)