from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Exercise, WorkoutSession, WeeklySplit, ExerciseSet
from .serializers import ExerciseSerializer, WorkoutSessionSerializer, ExerciseSetSerializer, WeeklySplitSerializer
from . import services


# ... (importurile tale de sus rămân la fel) ...

# 1. Gestionarea Exercițiilor (Catalogul)
class ExerciseListView(generics.ListCreateAPIView):
    """GET pentru a vedea exercițiile (cu filtrare opțională), POST pentru a adăuga unul nou"""
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ordonăm alfabetic by default
        queryset = Exercise.objects.all().order_by('name')

        # Căutăm parametrul 'muscle_group' în URL (ex: ?muscle_group=Chest)
        muscle = self.request.query_params.get('muscle_group', None)

        if muscle is not None:
            # iexact face filtrarea case-insensitive (ignoră litere mari/mici)
            queryset = queryset.filter(muscle_group__iexact=muscle)

        return queryset


# 1.5 Căutarea Grupelor Musculare Unice (Pentru meniul Dropdown)
class MuscleGroupListView(APIView):
    """GET /api/workouts/exercises/muscle_groups/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Extragem doar grupele musculare, fără duplicate, ordonate alfabetic
        groups = Exercise.objects.values_list('muscle_group', flat=True).distinct().order_by('muscle_group')
        return Response(groups)


# 2. Începerea unei sesiuni noi de antrenament
# ... (restul codului tău rămâne complet neschimbat) ...

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

class WeeklySplitView(generics.ListCreateAPIView):
    """GET pentru a vedea split-ul pe toata saptamana, POST pentru a asocia o grupa unei zile"""
    serializer_class = WeeklySplitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Userul logat va vedea doar zilele lui, nu si ale altora
        return WeeklySplit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Cand salveaza, asociaza automat ziua de antrenament cu userul logat
        serializer.save(user=self.request.user)

# ... restul codului tău din views.py ...

# 5. Modificarea sau Ștergerea unui Set (ExerciseSet)
class ExerciseSetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Vezi un set anume
    PATCH/PUT: Modifică setul (ex: ai greșit kilogramele)
    DELETE: Șterge setul complet
    """
    serializer_class = ExerciseSetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Măsură de securitate: Userul poate modifica/șterge DOAR seturile din propriile sesiuni
        return ExerciseSet.objects.filter(session__user=self.request.user)


# 6. Modificarea sau Ștergerea unei zile din Split
class WeeklySplitDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Vezi o zi din split
    PATCH/PUT: Schimbă grupa (ex: treci de la Piept la Spate)
    DELETE: Șterge ziua complet
    """
    serializer_class = WeeklySplitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Userul poate șterge doar split-ul lui
        return WeeklySplit.objects.filter(user=self.request.user)