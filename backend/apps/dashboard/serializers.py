from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id", "title", "category", "date",
            "start_time", "end_time", "location",
            "transport_mode", "estimated_transit_time"
        ]
        read_only_fields = ["id", "estimated_transit_time"]

    def validate(self, data):
        if data.get("start_time") >= data.get("end_time"):
            raise serializers.ValidationError({"time": "Ora de final trebuie să fie după ora de început."})
        return data