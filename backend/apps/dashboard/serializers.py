from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    origin_preference = serializers.CharField(write_only=True, required=False, default="previous")
    custom_origin = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Task
        fields = [
            "id", "title", "category", "date",
            "start_time", "end_time", "location",
            "transport_mode", "estimated_transit_time",
            "origin_preference", "custom_origin"
            "origin_preference", "custom_origin",
            "recurring_days", "recurrence_end_date"

        ]
        read_only_fields = ["id", "estimated_transit_time"]

    def validate(self, data):
        if data.get("start_time") >= data.get("end_time"):
            raise serializers.ValidationError({"time": "Ora de final trebuie să fie după ora de început."})
        return data