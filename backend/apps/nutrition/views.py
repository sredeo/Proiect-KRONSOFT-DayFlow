from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import FoodItem, Meal, MealFood
from .serializers import (
    NutritionTargetSerializer,
    FoodItemSerializer,
    MealSerializer,
    MealFoodSerializer,
)
from . import services


class NutritionTargetView(generics.RetrieveUpdateAPIView):
    serializer_class = NutritionTargetSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return services.get_or_create_target(self.request.user)


class FoodItemListCreateView(generics.ListCreateAPIView):
    serializer_class = FoodItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return services.get_food_items_for_user(self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MealListCreateView(generics.ListCreateAPIView):
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return services.get_meals_for_user(self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MealDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return services.get_meals_for_user(self.request.user)


class MealFoodCreateView(generics.CreateAPIView):
    serializer_class = MealFoodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MealFood.objects.filter(
            meal__user=self.request.user,
            meal_id=self.kwargs["meal_id"],
        )

    def perform_create(self, serializer):
        meal = services.get_meal_for_user(self.request.user, self.kwargs["meal_id"])
        serializer.save(meal=meal)


class MacroSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        summary = services.get_daily_macro_summary(request.user)
        return Response(summary)


class ShoppingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shopping_list = services.get_shopping_list(request.user)
        return Response(shopping_list)
