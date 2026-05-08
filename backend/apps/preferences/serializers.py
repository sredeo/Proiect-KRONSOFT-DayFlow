from rest_framework import serializers
from .models import UserPreferences, FavoriteLocation

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['default_transport_mode', 'transit_notifications', 'hobby_notifications']

class FavoriteLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteLocation
        fields = ['id', 'name', 'address']
        read_only_fields = ['id']