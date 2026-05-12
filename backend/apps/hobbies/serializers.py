from rest_framework import serializers
from .models import Hobby, HobbyLog
from django.utils import timezone
import datetime


class HobbySerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    progress_this_week = serializers.SerializerMethodField()

    class Meta:
        model = Hobby
        fields = [
            "id", "user", "name", "description", "weekly_goal",
            "preferred_duration_mins", "energy_required",
            "current_streak", "progress_this_week", "created_at"
        ]
        read_only_fields = ["current_streak", "created_at"]

    def get_progress_this_week(self, obj):
        today = timezone.now().date()
        start_of_week = today - datetime.timedelta(days=today.weekday())
        return obj.logs.filter(date__gte=start_of_week, completed=True).count()


class HobbyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HobbyLog
        fields = "__all__"

    def create(self, validated_data):
        log = super().create(validated_data)

        # Dacă sesiunea este marcată ca finalizată, actualizăm streak-ul
        if log.completed:
            hobby = log.hobby
            today = timezone.now().date()
            yesterday = today - datetime.timedelta(days=1)

            # Verificăm dacă a mai existat o sesiune ieri
            had_session_yesterday = HobbyLog.objects.filter(
                hobby=hobby,
                date=yesterday,
                completed=True
            ).exists()

            if had_session_yesterday:
                hobby.current_streak += 1
            else:
                # Dacă a sărit o zi (și nu e prima sesiune ever), resetăm sau începem de la 1
                # Verificăm dacă a mai făcut ceva azi deja (să nu crească streak-ul de 2 ori pe zi)
                sessions_today = HobbyLog.objects.filter(hobby=hobby, date=today, completed=True).count()
                if sessions_today <= 1:  # E prima sesiune pe azi
                    hobby.current_streak = 1

            hobby.save()

        return log