from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.dateparse import parse_date
from datetime import date

from .serializers import TaskSerializer
from . import services


class DailyTimelineView(APIView):
    permission_classes = [IsAuthenticated]  # Doar userii logati

    def get(self, request):
        # Daca primim un parametru de data, il folosim; daca nu, luam data de azi
        date_param = request.query_params.get("date")
        target_date = parse_date(date_param) if date_param else date.today()

        # Apelam logica din services
        tasks = services.get_daily_timeline(request.user, target_date)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Validam datele
        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Trimitem la service sa il creeze
        task = services.create_task(request.user, serializer.validated_data)

        # Returnam noul task creat
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)