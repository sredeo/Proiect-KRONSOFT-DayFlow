from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import UserPreferencesSerializer, FavoriteLocationSerializer
from . import services

class PreferencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs = services.get_user_preferences(request.user)
        return Response(UserPreferencesSerializer(prefs).data, status=status.HTTP_200_OK)

    def patch(self, request): # Folosim PATCH pentru a updata doar anumite campuri
        serializer = UserPreferencesSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        prefs = services.update_user_preferences(request.user, serializer.validated_data)
        return Response(UserPreferencesSerializer(prefs).data, status=status.HTTP_200_OK)

class FavoriteLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        locations = services.get_favorite_locations(request.user)
        return Response(FavoriteLocationSerializer(locations, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = FavoriteLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        location = services.add_favorite_location(request.user, serializer.validated_data)
        return Response(FavoriteLocationSerializer(location).data, status=status.HTTP_201_CREATED)

class FavoriteLocationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, location_id):
        services.delete_favorite_location(request.user, location_id)
        return Response(status=status.HTTP_204_NO_CONTENT)