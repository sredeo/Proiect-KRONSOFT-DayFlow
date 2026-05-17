from django.urls import path
from .views import (
    NutritionTargetView,
    FoodItemListCreateView,
    MealListCreateView,
    MealDetailView,
    MealFoodCreateView,
    MacroSummaryView,
    ShoppingListView,
)

urlpatterns = [
    path("nutrition/targets/", NutritionTargetView.as_view(), name="nutrition_targets"),
    path("nutrition/foods/", FoodItemListCreateView.as_view(), name="nutrition_food_items"),
    path("nutrition/meals/", MealListCreateView.as_view(), name="nutrition_meals"),
    path("nutrition/meals/<int:pk>/", MealDetailView.as_view(), name="nutrition_meal_detail"),
    path("nutrition/meals/<int:meal_id>/foods/", MealFoodCreateView.as_view(), name="nutrition_meal_foods"),
    path("nutrition/macros-summary/", MacroSummaryView.as_view(), name="nutrition_macros_summary"),
    path("nutrition/shopping-list/", ShoppingListView.as_view(), name="nutrition_shopping_list"),
]
