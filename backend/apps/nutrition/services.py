from datetime import date
from decimal import Decimal
from django.db.models import Sum, F
from .models import NutritionTarget, FoodItem, Meal, MealFood


DEFAULT_TARGETS = {
    "calories": 2000,
    "protein": 100,
    "carbs": 250,
    "fat": 70,
}


def get_or_create_target(user):
    target, _ = NutritionTarget.objects.get_or_create(user=user, defaults=DEFAULT_TARGETS)
    return target


def get_food_items_for_user(user):
    return FoodItem.objects.filter(user=user).order_by("name")


def get_meals_for_user(user):
    return Meal.objects.filter(user=user).order_by("date", "meal_type")


def get_meal_for_user(user, meal_id):
    return Meal.objects.get(id=meal_id, user=user)


def get_today_meals(user, for_date=None):
    if for_date is None:
        for_date = date.today()
    return Meal.objects.filter(user=user, date=for_date)


def _aggregate_macro_totals(meal_foods):
    totals = {
        "calories": 0,
        "protein": Decimal("0.00"),
        "carbs": Decimal("0.00"),
        "fat": Decimal("0.00"),
    }

    for meal_food in meal_foods:
        totals["calories"] += meal_food.calories()
        totals["protein"] += meal_food.protein()
        totals["carbs"] += meal_food.carbs()
        totals["fat"] += meal_food.fat()

    return totals


def get_daily_macro_summary(user, for_date=None):
    target = get_or_create_target(user)
    meals = get_today_meals(user, for_date)
    meal_foods = MealFood.objects.filter(meal__in=meals).select_related("food_item")
    totals = _aggregate_macro_totals(meal_foods)

    progress = {
        "calories": int(totals["calories"]),
        "protein": float(totals["protein"]),
        "carbs": float(totals["carbs"]),
        "fat": float(totals["fat"]),
    }

    return {
        "date": (for_date or date.today()).isoformat(),
        "target": {
            "calories": target.calories,
            "protein": target.protein,
            "carbs": target.carbs,
            "fat": target.fat,
        },
        "consumed": progress,
        "remaining": {
            "calories": max(target.calories - progress["calories"], 0),
            "protein": max(target.protein - progress["protein"], 0),
            "carbs": max(target.carbs - progress["carbs"], 0),
            "fat": max(target.fat - progress["fat"], 0),
        },
        "meals": [
            {
                "id": meal.id,
                "name": meal.name,
                "meal_type": meal.meal_type,
                "date": meal.date,
                "total_calories": sum(food.calories() for food in meal.foods.all()),
                "total_protein": float(sum(food.protein() for food in meal.foods.all())),
                "total_carbs": float(sum(food.carbs() for food in meal.foods.all())),
                "total_fat": float(sum(food.fat() for food in meal.foods.all())),
            }
            for meal in meals
        ],
    }


def get_shopping_list(user, for_date=None):
    if for_date is None:
        for_date = date.today()

    meal_foods = MealFood.objects.filter(meal__user=user, meal__date=for_date).select_related("food_item")
    grouped = {}

    for item in meal_foods:
        key = item.food_item.name.lower()
        if key not in grouped:
            grouped[key] = {
                "name": item.food_item.name,
                "total_quantity_grams": Decimal("0.00"),
                "calories_per_100g": item.food_item.calories_per_100g,
                "protein_per_100g": item.food_item.protein_per_100g,
                "carbs_per_100g": item.food_item.carbs_per_100g,
                "fat_per_100g": item.food_item.fat_per_100g,
            }
        grouped[key]["total_quantity_grams"] += item.quantity_grams

    return [
        {
            "name": data["name"],
            "total_quantity_grams": float(data["total_quantity_grams"]),
            "calories_per_100g": data["calories_per_100g"],
            "protein_per_100g": float(data["protein_per_100g"]),
            "carbs_per_100g": float(data["carbs_per_100g"]),
            "fat_per_100g": float(data["fat_per_100g"]),
        }
        for data in grouped.values()
    ]
