from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Hobby, HobbyLog
from .serializers import HobbySerializer, HobbyLogSerializer
from .services import get_hobby_suggestion

class HobbyListCreateView(generics.ListCreateAPIView):
    serializer_class = HobbySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Hobby.objects.filter(user=self.request.user)

class HobbyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HobbySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Hobby.objects.filter(user=self.request.user)

class SuggestHobbyView(APIView):
    """
    GET /api/hobbies/suggest/?minutes=45&energy=Medium
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        minutes = request.query_params.get('minutes', 30)
        energy = request.query_params.get('energy', 'Medium')

        suggestion = get_hobby_suggestion(request.user, minutes, energy)
        return Response(suggestion)

class LogHobbySessionView(generics.CreateAPIView):
    serializer_class = HobbyLogSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Aici am putea adăuga logică pentru a crește streak-ul în viitor
        serializer.save()