import { Feather } from '@expo/vector-icons';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { MealInfo, MacroSummary, NutritionAPI } from '../../api';

const MACRO_COLORS = {
  calories: '#4338ca',
  protein: '#10b981',
  carbs: '#f59e0b',
  fat: '#ef4444',
};

export default function NutritionScreen() {
  const [summary, setSummary] = useState<MacroSummary | null>(null);
  const [meals, setMeals] = useState<MealInfo[]>([]);
  const [newMeal, setNewMeal] = useState('');
  const [newMealType, setNewMealType] = useState('Breakfast');
  const [activeMealId, setActiveMealId] = useState<number | null>(null);
  const [foodName, setFoodName] = useState('');
  const [quantityGrams, setQuantityGrams] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function loadNutrition() {
    try {
      setLoading(true);
      const [summaryData, mealList] = await Promise.all([
        NutritionAPI.getMacroSummary(),
        NutritionAPI.getMeals(),
      ]);
      setSummary(summaryData);
      setMeals(mealList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load nutrition data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNutrition();
  }, []);

  async function handleAddMeal() {
    if (!newMeal.trim()) {
      setFieldErrors({ mealName: 'Meal name is required' });
      setError('Please fill in the meal name');
      return;
    }

    try {
      setSaving(true);
      setFieldErrors({});
      await NutritionAPI.createMeal(newMeal.trim(), newMealType);
      setNewMeal('');
      setNewMealType('Breakfast');
      setError(null);
      await loadNutrition();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add meal');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddFood(mealId: number) {
    const errors: Record<string, string> = {};
    if (!foodName.trim()) errors.foodName = 'Food name is required';
    if (!quantityGrams.trim()) errors.quantityGrams = 'Quantity is required';
    if (!calories.trim()) errors.calories = 'Calories are required';
    if (!protein.trim()) errors.protein = 'Protein is required';
    if (!carbs.trim()) errors.carbs = 'Carbs are required';
    if (!fat.trim()) errors.fat = 'Fat is required';

    const quantity = Number(quantityGrams);
    if (quantityGrams.trim() && (!quantity || quantity <= 0)) {
      errors.quantityGrams = 'Quantity must be a positive number';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please complete all required food fields');
      return;
    }

    try {
      setSaving(true);
      setFieldErrors({});
      const foodItem = await NutritionAPI.createFoodItem({
        name: foodName.trim(),
        calories_per_100g: Number(calories),
        protein_per_100g: Number(protein),
        carbs_per_100g: Number(carbs),
        fat_per_100g: Number(fat),
      });
      await NutritionAPI.addFoodToMeal(mealId, foodItem.id, quantity);
      setFoodName('');
      setQuantityGrams('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setActiveMealId(null);
      setError(null);
      await loadNutrition();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add food');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMeal(mealId: number) {
    Alert.alert('Delete meal', 'Are you sure you want to delete this meal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await NutritionAPI.deleteMeal(mealId);
            setError(null);
            await loadNutrition();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to delete meal');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  }

  function renderMacroRow(label: string, value: number, target: number, color: string) {
    const width = target > 0 ? Math.min(100, (value / target) * 100) : 0;
    return (
      <View style={styles.macroRow}>
        <View style={styles.macroLabelRow}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValue}>{value} / {target}</Text>
        </View>
        <View style={styles.macroBarBackground}>
          <View style={[styles.macroBarFill, { width, backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.subtitle}>Track your meals</Text>
        </View>

        {loading ? (
          <View style={styles.loader}><ActivityIndicator size="large" color="#4338ca" /></View>
        ) : (
          <>
            {summary ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Daily Macro Tracker</Text>
                {renderMacroRow('Calories', summary.consumed.calories, summary.target.calories, MACRO_COLORS.calories)}
                {renderMacroRow('Protein', Math.round(summary.consumed.protein), summary.target.protein, MACRO_COLORS.protein)}
                {renderMacroRow('Carbs', Math.round(summary.consumed.carbs), summary.target.carbs, MACRO_COLORS.carbs)}
                {renderMacroRow('Fat', Math.round(summary.consumed.fat), summary.target.fat, MACRO_COLORS.fat)}
              </View>
            ) : (
              <Text style={styles.errorText}>Unable to load nutrition summary.</Text>
            )}

            <View style={styles.mealHeader}>
              <Text style={styles.sectionTitle}>Meals Today</Text>
              <Text style={styles.sectionSubtitle}>{summary ? summary.date : ''}</Text>
            </View>

            <View style={styles.list}>
              {meals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No meals logged yet.</Text>
                </View>
              ) : meals.map(meal => (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.mealCardHeader}>
                    <View>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealMeta}>{meal.meal_type} • {meal.total_calories} kcal</Text>
                    </View>
                    <View style={styles.mealCardActions}>
                      <TouchableOpacity
                        style={styles.deleteMealButton}
                        onPress={() => handleDeleteMeal(meal.id)}
                        disabled={saving}
                      >
                        <Feather name="trash-2" size={18} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addFoodButton}
                        onPress={() => setActiveMealId(activeMealId === meal.id ? null : meal.id)}
                      >
                        <Text style={styles.addFoodButtonText}>+ Add Food</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {meal.foods.length > 0 && (
                    <View style={styles.foodList}>
                      {meal.foods.map(food => (
                        <View key={food.id} style={styles.foodRow}>
                          <Text style={styles.foodName}>{food.food_name}</Text>
                          <Text style={styles.foodMacro}>{food.quantity_grams}g • {food.calories} kcal</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {activeMealId === meal.id && (
                    <View style={styles.foodForm}>
                      <TextInput
                        style={[styles.input, fieldErrors.foodName && styles.inputError]}
                        placeholder="Food name"
                        placeholderTextColor="#999"
                        value={foodName}
                        onChangeText={setFoodName}
                        editable={!saving}
                      />
                      {fieldErrors.foodName ? <Text style={styles.fieldErrorText}>{fieldErrors.foodName}</Text> : null}
                      <TextInput
                        style={[styles.input, fieldErrors.quantityGrams && styles.inputError]}
                        placeholder="Quantity (grams)"
                        placeholderTextColor="#999"
                        value={quantityGrams}
                        keyboardType="numeric"
                        onChangeText={setQuantityGrams}
                        editable={!saving}
                      />
                      {fieldErrors.quantityGrams ? <Text style={styles.fieldErrorText}>{fieldErrors.quantityGrams}</Text> : null}
                      <TextInput
                        style={[styles.input, fieldErrors.calories && styles.inputError]}
                        placeholder="Calories per 100g"
                        placeholderTextColor="#999"
                        value={calories}
                        keyboardType="numeric"
                        onChangeText={setCalories}
                        editable={!saving}
                      />
                      {fieldErrors.calories ? <Text style={styles.fieldErrorText}>{fieldErrors.calories}</Text> : null}
                      <View style={styles.macroRowInputs}>
                        <View style={styles.macroInputColumn}>
                          <TextInput
                            style={[styles.input, styles.smallInput, fieldErrors.protein && styles.inputError]}
                            placeholder="Protein per 100g"
                            placeholderTextColor="#999"
                            value={protein}
                            keyboardType="numeric"
                            onChangeText={setProtein}
                            editable={!saving}
                          />
                          {fieldErrors.protein ? <Text style={styles.fieldErrorText}>{fieldErrors.protein}</Text> : null}
                        </View>
                        <View style={styles.macroInputColumn}>
                          <TextInput
                            style={[styles.input, styles.smallInput, fieldErrors.carbs && styles.inputError]}
                            placeholder="Carbs per 100g"
                            placeholderTextColor="#999"
                            value={carbs}
                            keyboardType="numeric"
                            onChangeText={setCarbs}
                            editable={!saving}
                          />
                          {fieldErrors.carbs ? <Text style={styles.fieldErrorText}>{fieldErrors.carbs}</Text> : null}
                        </View>
                        <View style={styles.macroInputColumn}>
                          <TextInput
                            style={[styles.input, styles.smallInput, fieldErrors.fat && styles.inputError]}
                            placeholder="Fat per 100g"
                            placeholderTextColor="#999"
                            value={fat}
                            keyboardType="numeric"
                            onChangeText={setFat}
                            editable={!saving}
                          />
                          {fieldErrors.fat ? <Text style={styles.fieldErrorText}>{fieldErrors.fat}</Text> : null}
                        </View>
                      </View>
                      <TouchableOpacity style={styles.addMealButton} onPress={() => handleAddFood(meal.id)} disabled={saving}>
                        <Text style={styles.addMealButtonText}>Add Food</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.mealFormArea}>
              <TextInput
                style={[styles.input, fieldErrors.mealName && styles.inputError]}
                placeholder="Add new meal..."
                placeholderTextColor="#999"
                value={newMeal}
                onChangeText={setNewMeal}
                editable={!saving}
              />
              {fieldErrors.mealName ? <Text style={styles.fieldErrorText}>{fieldErrors.mealName}</Text> : null}
              <View style={styles.mealTypeRow}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      newMealType === type && styles.mealTypeButtonActive,
                    ]}
                    onPress={() => setNewMealType(type)}
                    disabled={saving}
                  >
                    <Text
                      style={[
                        styles.mealTypeText,
                        newMealType === type && styles.mealTypeTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.addNewMealButton} onPress={handleAddMeal} disabled={saving}>
                <Text style={styles.addNewMealButtonText}>Add New Meal</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fb' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#000' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  summaryCard: { backgroundColor: '#eef2ff', borderRadius: 20, padding: 22, marginBottom: 24, borderWidth: 1, borderColor: '#dbeafe' },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  macroRow: { marginBottom: 14 },
  macroLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  macroLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  macroValue: { fontSize: 14, color: '#4b5563' },
  macroBarBackground: { height: 8, backgroundColor: '#dbeafe', borderRadius: 999, overflow: 'hidden' },
  macroBarFill: { height: '100%', borderRadius: 999 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  sectionSubtitle: { fontSize: 14, color: '#6b7280' },
  list: { gap: 12, marginBottom: 24 },
  mealCard: { padding: 18, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#e5e7eb' },
  mealCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  mealMeta: { fontSize: 14, color: '#6b7280' },
  mealCardActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  deleteMealButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#ef4444', borderRadius: 12 },
  deleteMealButtonText: { color: '#fff', fontWeight: '600' },
  addFoodButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#4338ca', borderRadius: 12 },
  addFoodButtonText: { color: '#fff', fontWeight: '600' },
  foodList: { marginTop: 14, gap: 10 },
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  foodName: { color: '#111827', fontWeight: '600' },
  foodMacro: { color: '#6b7280' },
  foodForm: { marginTop: 14, gap: 12 },
  macroRowInputs: { flexDirection: 'row', gap: 10 },
  macroInputColumn: { flex: 1 },
  inputArea: { flexDirection: 'column', gap: 10, alignItems: 'stretch' },
  mealFormArea: { flexDirection: 'column', gap: 10, alignItems: 'stretch' },
  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  mealTypeButton: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#e5e7eb', borderRadius: 14 },
  mealTypeButtonActive: { backgroundColor: '#4338ca' },
  mealTypeText: { color: '#111827', fontWeight: '600' },
  mealTypeTextActive: { color: '#fff' },
  input: { flex: 1, minHeight: 50, backgroundColor: '#f5f7fb', borderRadius: 14, paddingHorizontal: 16, color: '#111827' },
  inputError: { borderWidth: 1, borderColor: '#ef4444' },
  fieldErrorText: { color: '#b91c1c', fontSize: 12, marginTop: 4, marginBottom: 4 },
  smallInput: { flex: 1 },
  addButton: { width: 50, height: 50, backgroundColor: '#4338ca', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  addNewMealButton: { marginTop: 12, backgroundColor: '#4338ca', paddingVertical: 14, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  addNewMealButtonText: { color: '#fff', fontWeight: '700' },
  addMealButton: { marginTop: 4, backgroundColor: '#4338ca', paddingVertical: 14, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  addMealButtonText: { color: '#fff', fontWeight: '700' },
  loader: { minHeight: 240, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#b91c1c', marginTop: 12, textAlign: 'center' },
  emptyState: { padding: 24, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  emptyText: { color: '#6b7280' },
});
