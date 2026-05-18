from rest_framework import serializers
from .models import NutritionTarget, FoodItem, Meal, MealFood


class NutritionTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionTarget
        fields = ["calories", "protein", "carbs", "fat"]


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ["id", "name", "calories_per_100g", "protein_per_100g", "carbs_per_100g", "fat_per_100g"]


class MealFoodSerializer(serializers.ModelSerializer):
    food_name = serializers.ReadOnlyField(source="food_item.name")
    calories = serializers.SerializerMethodField()
    protein = serializers.SerializerMethodField()
    carbs = serializers.SerializerMethodField()
    fat = serializers.SerializerMethodField()

    class Meta:
        model = MealFood
        fields = ["id", "food_item", "food_name", "quantity_grams", "calories", "protein", "carbs", "fat"]

    def get_calories(self, obj):
        return obj.calories()

    def get_protein(self, obj):
        return float(obj.protein())

    def get_carbs(self, obj):
        return float(obj.carbs())

    def get_fat(self, obj):
        return float(obj.fat())


class MealSerializer(serializers.ModelSerializer):
    foods = MealFoodSerializer(many=True, read_only=True)
    total_calories = serializers.SerializerMethodField()
    total_protein = serializers.SerializerMethodField()
    total_carbs = serializers.SerializerMethodField()
    total_fat = serializers.SerializerMethodField()

    class Meta:
        model = Meal
        fields = ["id", "name", "meal_type", "date", "notes", "foods", "total_calories", "total_protein", "total_carbs", "total_fat"]

    def get_total_calories(self, obj):
        return sum(food.calories() for food in obj.foods.all())

    def get_total_protein(self, obj):
        return float(sum(food.protein() for food in obj.foods.all()))

    def get_total_carbs(self, obj):
        return float(sum(food.carbs() for food in obj.foods.all()))

    def get_total_fat(self, obj):
        return float(sum(food.fat() for food in obj.foods.all()))


class ShoppingListItemSerializer(serializers.Serializer):
    name = serializers.CharField()
    total_quantity_grams = serializers.DecimalField(max_digits=10, decimal_places=2)
    calories_per_100g = serializers.IntegerField()
    protein_per_100g = serializers.DecimalField(max_digits=6, decimal_places=2)
    carbs_per_100g = serializers.DecimalField(max_digits=6, decimal_places=2)
    fat_per_100g = serializers.DecimalField(max_digits=6, decimal_places=2)
