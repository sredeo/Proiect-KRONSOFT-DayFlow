from decimal import Decimal
from django.conf import settings
from django.db import models


class NutritionTarget(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="nutrition_target")
    calories = models.PositiveIntegerField(default=2000)
    protein = models.PositiveIntegerField(default=100)
    carbs = models.PositiveIntegerField(default=250)
    fat = models.PositiveIntegerField(default=70)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "nutrition_targets"

    def __str__(self):
        return f"{self.user.email} nutrition target"


class FoodItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="food_items")
    name = models.CharField(max_length=120)
    calories_per_100g = models.PositiveIntegerField(default=0)
    protein_per_100g = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("0.00"))
    carbs_per_100g = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("0.00"))
    fat_per_100g = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("0.00"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "food_items"
        unique_together = ["user", "name"]

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class Meal(models.Model):
    MEAL_TYPES = [
        ("Breakfast", "Breakfast"),
        ("Lunch", "Lunch"),
        ("Dinner", "Dinner"),
        ("Snack", "Snack"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meals")
    name = models.CharField(max_length=120)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES, default="Breakfast")
    date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "meals"
        ordering = ["date", "meal_type"]

    def __str__(self):
        return f"{self.user.email} - {self.date} - {self.name}"


class MealFood(models.Model):
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name="foods")
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity_grams = models.DecimalField(max_digits=7, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "meal_foods"

    def __str__(self):
        return f"{self.food_item.name} {self.quantity_grams}g in {self.meal.name}"

    def total_factor(self):
        return Decimal(self.quantity_grams) / Decimal(100)

    def calories(self):
        return int(self.food_item.calories_per_100g * self.total_factor())

    def protein(self):
        return self.food_item.protein_per_100g * self.total_factor()

    def carbs(self):
        return self.food_item.carbs_per_100g * self.total_factor()

    def fat(self):
        return self.food_item.fat_per_100g * self.total_factor()
