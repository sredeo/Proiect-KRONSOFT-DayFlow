from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Exercise, WorkoutSession
from .serializers import ExerciseSerializer, WorkoutSessionSerializer, ExerciseSetSerializer
from . import services

# 1. Gestionarea Exercițiilor (Catalogul)
class ExerciseListView(generics.ListCreateAPIView):
    """GET pentru a vedea exercițiile, POST pentru a adăuga unul nou"""
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

# 2. Începerea unei sesiuni noi de antrenament
class StartWorkoutView(APIView):
    """POST /api/workouts/start/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notes = request.data.get("notes", "")
        # Apelăm logica separată pentru crearea zilei
        session = services.create_workout_session(user=request.user, notes=notes)
        return Response(WorkoutSessionSerializer(session).data, status=status.HTTP_201_CREATED)

# 3. Logarea unui set (reps, kg) într-o sesiune
class LogSetView(APIView):
    """POST /api/workouts/sessions/<session_id>/log/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        exercise_id = request.data.get("exercise_id")
        set_number = request.data.get("set_number")
        reps = request.data.get("reps")
        weight_kg = request.data.get("weight_kg")

        try:
            # Ne asigurăm că sesiunea există și aparține userului curent
            session = WorkoutSession.objects.get(id=session_id, user=request.user)
            # Salvăm setul cu kilogramele folosite
            exercise_set = services.log_exercise_set(session, exercise_id, set_number, reps, weight_kg)
            return Response(ExerciseSetSerializer(exercise_set).data, status=status.HTTP_201_CREATED)
        except WorkoutSession.DoesNotExist:
            return Response({"error": "Sesiunea nu a fost găsită."}, status=status.HTTP_404_NOT_FOUND)

# 4. Finalizarea antrenamentului și returnarea raportului
class FinishWorkoutView(APIView):
    """POST /api/workouts/sessions/<session_id>/finish/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        try:
            session = WorkoutSession.objects.get(id=session_id, user=request.user)
            # Închidem ziua și generăm sumarul
            session = services.finish_and_get_daily_summary(session)
            # Returnăm tot obiectul (inclusiv lista de seturi)
            return Response(WorkoutSessionSerializer(session).data, status=status.HTTP_200_OK)
        except WorkoutSession.DoesNotExist:
            return Response({"error": "Sesiunea nu a fost găsită."}, status=status.HTTP_404_NOT_FOUND)
