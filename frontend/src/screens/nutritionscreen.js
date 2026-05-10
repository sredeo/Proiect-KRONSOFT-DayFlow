import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import BottomTabBar from "./BottomTabBar";

const macroTargets = {
  calories: 2400,
  protein: 180,
  carbs: 420,
  fat: 90,
};

const meals = [
  {
    id: "breakfast",
    title: "Breakfast",
    expanded: true,
    foods: [
      { id: "oats", name: "Oats with fruit", calories: 320, protein: 8, carbs: 58, fat: 6 },
      { id: "milk", name: "Milk 1.5%", calories: 100, protein: 5, carbs: 10, fat: 2 },
    ],
  },
  {
    id: "lunch",
    title: "Lunch",
    expanded: false,
    foods: [],
  },
  {
    id: "dinner",
    title: "Dinner",
    expanded: false,
    foods: [],
  },
];

const foodOptions = [
  { id: "yogurt", name: "Greek yogurt", calories: 85, protein: 10, carbs: 4, fat: 2 },
  { id: "chicken", name: "Chicken breast", calories: 165, protein: 31, carbs: 0, fat: 4 },
  { id: "rice", name: "Cooked rice", calories: 130, protein: 3, carbs: 28, fat: 0 },
  { id: "avocado", name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15 },
];

const initialShoppingItems = [
  { id: "oats", name: "Oats", quantity: "500 g", category: "Pantry", checked: false },
  { id: "milk", name: "Milk 1.5%", quantity: "1 bottle", category: "Dairy", checked: false },
  { id: "fruit", name: "Fresh fruit", quantity: "4 servings", category: "Produce", checked: false },
];

const pantryMap = {
  "Oats with fruit": { name: "Oats", quantity: "500 g", category: "Pantry" },
  "Milk 1.5%": { name: "Milk 1.5%", quantity: "1 bottle", category: "Dairy" },
};

export default function NutritionScreen({ navigation }) {
  const [mealPlan, setMealPlan] = useState(meals);
  const [expandedMeals, setExpandedMeals] = useState({
    breakfast: true,
    lunch: false,
    dinner: false,
  });
  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState("breakfast");
  const [shoppingItems, setShoppingItems] = useState(initialShoppingItems);
  const [isShoppingModalVisible, setIsShoppingModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");

  const totals = useMemo(
    () =>
      mealPlan.reduce(
        (sum, meal) => {
          meal.foods.forEach((food) => {
            sum.calories += food.calories;
            sum.protein += food.protein;
            sum.carbs += food.carbs;
            sum.fat += food.fat;
          });
          return sum;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [mealPlan]
  );

  const caloriesLeft = macroTargets.calories - totals.calories;
  const shoppingStats = useMemo(() => {
    const left = shoppingItems.filter((item) => !item.checked).length;
    return {
      left,
      bought: shoppingItems.length - left,
    };
  }, [shoppingItems]);
  const shoppingSections = useMemo(() => {
    const groups = new Map();

    shoppingItems.forEach((item) => {
      const category = item.category.trim() || "Other";
      const current = groups.get(category) || [];
      groups.set(category, [...current, item]);
    });

    return Array.from(groups, ([category, items]) => ({
      category,
      items,
      left: items.filter((item) => !item.checked).length,
    }));
  }, [shoppingItems]);

  const toggleMeal = (mealId) => {
    setExpandedMeals((current) => ({
      ...current,
      [mealId]: !current[mealId],
    }));
  };

  const handleAddFood = () => {
    setIsFoodModalVisible(true);
  };

  const addFoodToMeal = (food) => {
    setMealPlan((current) =>
      current.map((meal) =>
        meal.id === selectedMealId
          ? {
              ...meal,
              foods: [
                ...meal.foods,
                {
                  ...food,
                  id: `${food.id}-${Date.now()}`,
                },
              ],
            }
          : meal
      )
    );
    setExpandedMeals((current) => ({ ...current, [selectedMealId]: true }));
    setIsFoodModalVisible(false);
  };

  const updateShoppingItem = (itemId, field, value) => {
    setShoppingItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  };

  const toggleShoppingItem = (itemId) => {
    setShoppingItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteShoppingItem = (itemId) => {
    setShoppingItems((current) => current.filter((item) => item.id !== itemId));
  };

  const addShoppingItem = () => {
    const name = newItemName.trim();
    const quantity = newItemQuantity.trim();
    const category = newItemCategory.trim();

    if (!name) {
      Alert.alert("Name required", "Enter a food name first.");
      return;
    }

    setShoppingItems((current) => [
      ...current,
      {
        id: `${Date.now()}-${name}`,
        name,
        quantity: quantity || "1 item",
        category: category || "Other",
        checked: false,
      },
    ]);
    setNewItemName("");
    setNewItemQuantity("");
    setNewItemCategory("");
  };

  const generateShoppingList = () => {
    const nextItems = [];

    mealPlan.forEach((meal) => {
      meal.foods.forEach((food) => {
        const grocery = pantryMap[food.name] || {
          name: food.name,
          quantity: "1 serving",
          category: "Meal prep",
        };

        if (!nextItems.some((item) => item.name === grocery.name)) {
          nextItems.push({
            id: `${Date.now()}-${grocery.name}`,
            ...grocery,
            checked: false,
          });
        }
      });
    });

    setShoppingItems(nextItems);
  };

  const clearCheckedItems = () => {
    setShoppingItems((current) => current.filter((item) => !item.checked));
  };

  const handleTabPress = (tab) => {
    if (navigation && tab !== "nutrition") {
      navigation.navigate?.(tab);
    }
  };

  const renderMacroLine = (key, label, unit) => {
    const percent = Math.min((totals[key] / macroTargets[key]) * 100, 100);

    return (
      <View style={styles.macroLine}>
        <View>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroSmall}>
            {totals[key]} / {macroTargets[key]} {unit}
          </Text>
        </View>
        <View style={styles.macroProgress}>
          <View style={[styles.macroProgressFill, { width: `${percent}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.title}>Nutrition</Text>

          <View style={styles.macroCard}>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieText}>{totals.calories} kcal</Text>
              <View style={styles.targetPill}>
                <Text style={styles.targetText}>Target: {macroTargets.calories} kcal</Text>
              </View>
            </View>
            {renderMacroLine("calories", "Calories", "kcal")}
            {renderMacroLine("protein", "Protein", "g")}
            {renderMacroLine("carbs", "Carbs", "g")}
            {renderMacroLine("fat", "Fat", "g")}
          </View>

          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{Math.max(caloriesLeft, 0)}</Text>
              <Text style={styles.quickStatLabel}>kcal left</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{totals.protein}g</Text>
              <Text style={styles.quickStatLabel}>protein</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{mealPlan.reduce((sum, meal) => sum + meal.foods.length, 0)}</Text>
              <Text style={styles.quickStatLabel}>foods logged</Text>
            </View>
          </View>

          <View style={styles.nutritionInsight}>
            <View>
              <Text style={styles.insightTitle}>
                {totals.protein < 40 ? "Protein needs attention" : "On track"}
              </Text>
              <Text style={styles.insightText}>
                {totals.protein < 40
                  ? "Add a protein source to your next meal."
                  : "Macros update as you add meals."}
              </Text>
            </View>
            <Text style={styles.caloriesLeft}>{caloriesLeft} kcal left</Text>
          </View>

          <View style={styles.mealsWrapper}>
            {mealPlan.map((meal) => {
              const isExpanded = expandedMeals[meal.id];
              const mealCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
              const summary =
                meal.foods.length > 0
                  ? `${mealCalories} Kcal - ${meal.foods.length} foods`
                  : "Empty";

              return (
                <View key={meal.id} style={styles.mealBlock}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.mealHeader,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => toggleMeal(meal.id)}
                  >
                    <View>
                      <Text style={styles.mealTitle}>{meal.title}</Text>
                      <Text style={styles.mealSummary}>{summary}</Text>
                    </View>
                    <Text style={styles.triangle}>
                      {isExpanded ? "\u25B2" : "\u25BC"}
                    </Text>
                  </Pressable>

                  {isExpanded &&
                    (meal.foods.length > 0 ? (
                      meal.foods.map((food) => (
                        <Pressable
                          key={food.id}
                          style={({ pressed }) => [
                            styles.foodRow,
                            pressed && styles.pressed,
                          ]}
                          onPress={() =>
                            Alert.alert(
                              food.name,
                              `${food.calories} kcal, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat`
                            )
                          }
                        >
                          <Text style={styles.foodName}>{food.name}</Text>
                          <Text style={styles.foodKcal}>{food.calories} Kcal</Text>
                        </Pressable>
                      ))
                    ) : (
                      <View style={styles.foodRow}>
                        <Text style={styles.foodName}>No foods added</Text>
                        <Text style={styles.foodKcal}>0 Kcal</Text>
                      </View>
                    ))}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.actionsDock}>
          <Pressable
            style={({ pressed }) => [
              styles.shoppingButton,
              pressed && styles.pressed,
            ]}
            onPress={() => setIsShoppingModalVisible(true)}
          >
            <Feather name="shopping-cart" size={22} color="#050505" />
            <Text style={styles.shoppingText}>Shopping list</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.addFoodButton, pressed && styles.pressed]}
            onPress={handleAddFood}
          >
            <Text style={styles.plus}>+</Text>
            <Text style={styles.addFoodText}>Add Food</Text>
          </Pressable>
        </View>

        <BottomTabBar activeTab="nutrition" onTabPress={handleTabPress} />
      </View>

      <Modal
        transparent
        visible={isFoodModalVisible}
        animationType="slide"
        onRequestClose={() => setIsFoodModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsFoodModalVisible(false)}>
          <Pressable style={styles.foodModalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHead}>
              <View>
                <Text style={styles.modalTitle}>Add Food</Text>
                <Text style={styles.modalSubtitle}>Pick a meal, then add one quick food.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setIsFoodModalVisible(false)}>
                <Text style={styles.closeText}>X</Text>
              </Pressable>
            </View>

            <View style={styles.mealPicker}>
              {mealPlan.map((meal) => (
                <Pressable
                  key={meal.id}
                  style={[
                    styles.mealChoice,
                    selectedMealId === meal.id && styles.mealChoiceActive,
                  ]}
                  onPress={() => setSelectedMealId(meal.id)}
                >
                  <Text style={styles.mealChoiceText}>{meal.title}</Text>
                </Pressable>
              ))}
            </View>

            {foodOptions.map((food) => (
              <Pressable key={food.id} style={styles.foodOption} onPress={() => addFoodToMeal(food)}>
                <View>
                  <Text style={styles.foodOptionTitle}>{food.name}</Text>
                  <Text style={styles.foodOptionMeta}>
                    {food.calories} kcal | {food.protein}P | {food.carbs}C | {food.fat}F
                  </Text>
                </View>
                <Feather name="plus" size={20} color="#050505" />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={isShoppingModalVisible}
        animationType="slide"
        onRequestClose={() => setIsShoppingModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsShoppingModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHead}>
              <View>
                <Text style={styles.modalTitle}>Shopping List</Text>
                <Text style={styles.modalSubtitle}>
                  Grouped by aisle, quick to check at the store.
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setIsShoppingModalVisible(false)}
              >
                <Text style={styles.closeText}>X</Text>
              </Pressable>
            </View>

            <View style={styles.shoppingSummary}>
              <View style={styles.shoppingSummaryPill}>
                <Text style={styles.shoppingSummaryText}>{shoppingStats.left} left</Text>
              </View>
              <View style={styles.shoppingSummaryPill}>
                <Text style={styles.shoppingSummaryText}>{shoppingStats.bought} bought</Text>
              </View>
            </View>

            <View style={styles.shoppingToolbar}>
              <Pressable style={styles.secondaryButton} onPress={generateShoppingList}>
                <Text style={styles.secondaryButtonText}>Generate from meals</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={clearCheckedItems}>
                <Text style={styles.secondaryButtonText}>Clear checked</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.shoppingList} keyboardShouldPersistTaps="handled">
              {shoppingItems.length === 0 ? (
                <Text style={styles.shoppingEmpty}>
                  No items yet. Add one or generate from meals.
                </Text>
              ) : (
                shoppingSections.map((section) => (
                  <View key={section.category} style={styles.shoppingSection}>
                    <View style={styles.shoppingSectionHead}>
                      <Text style={styles.shoppingSectionTitle}>{section.category}</Text>
                      <Text style={styles.shoppingSectionCount}>
                        {section.left}/{section.items.length} left
                      </Text>
                    </View>
                    {section.items.map((item) => (
                      <View
                        key={item.id}
                        style={[styles.shoppingItem, item.checked && styles.shoppingItemDone]}
                      >
                        <Pressable
                          style={[
                            styles.checkbox,
                            item.checked && styles.checkboxChecked,
                          ]}
                          onPress={() => toggleShoppingItem(item.id)}
                        >
                          <Text style={styles.checkboxText}>{item.checked ? "\u2713" : ""}</Text>
                        </Pressable>
                        <View style={styles.shoppingContent}>
                          <TextInput
                            style={[
                              styles.shoppingInput,
                              item.checked && styles.shoppingInputDone,
                            ]}
                            value={item.name}
                            onChangeText={(value) => updateShoppingItem(item.id, "name", value)}
                          />
                          <View style={styles.shoppingMetaRow}>
                            <TextInput
                              style={styles.quantityInput}
                              value={item.quantity}
                              onChangeText={(value) => updateShoppingItem(item.id, "quantity", value)}
                            />
                            <TextInput
                              style={styles.categoryInput}
                              value={item.category}
                              onChangeText={(value) => updateShoppingItem(item.id, "category", value)}
                            />
                          </View>
                        </View>
                        <Pressable
                          style={styles.deleteButton}
                          onPress={() => deleteShoppingItem(item.id)}
                        >
                          <Feather name="trash-2" size={17} color="#050505" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ))
              )}

              <View style={styles.addItemPanel}>
                <TextInput
                  style={styles.newItemInput}
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Food name"
                  placeholderTextColor="#777"
                />
                <View style={styles.addItemRow}>
                  <TextInput
                    style={styles.newQuantityInput}
                    value={newItemQuantity}
                    onChangeText={setNewItemQuantity}
                    placeholder="Qty"
                    placeholderTextColor="#777"
                  />
                  <TextInput
                    style={styles.newCategoryInput}
                    value={newItemCategory}
                    onChangeText={setNewItemCategory}
                    placeholder="Category"
                    placeholderTextColor="#777"
                  />
                </View>
              </View>
            </ScrollView>

            <Pressable style={styles.addItemButton} onPress={addShoppingItem}>
              <Text style={styles.addItemText}>Add item</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const fontFamily = Platform.select({
  android: "sans-serif-condensed",
  ios: "AvenirNextCondensed-Heavy",
  default: undefined,
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingTop: 12,
    paddingBottom: 96,
  },
  title: {
    marginLeft: 23,
    marginBottom: 14,
    color: "#050505",
    fontFamily,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
  },
  macroCard: {
    minHeight: 245,
    marginLeft: 23,
    marginRight: 33,
    marginBottom: 11,
    paddingTop: 15,
    paddingHorizontal: 17,
    borderWidth: 2,
    borderColor: "#0094FF",
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
  },
  quickStats: {
    flexDirection: "row",
    marginLeft: 23,
    marginRight: 33,
    marginBottom: 11,
  },
  quickStat: {
    flex: 1,
    minHeight: 58,
    justifyContent: "center",
    marginRight: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#EDEDED",
  },
  quickStatValue: {
    color: "#050505",
    fontFamily,
    fontSize: 22,
    fontWeight: "900",
  },
  quickStatLabel: {
    color: "#050505",
    fontSize: 10,
    fontWeight: "800",
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  calorieText: {
    color: "#050505",
    fontFamily,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 36,
  },
  targetPill: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#EDEDED",
  },
  targetText: {
    color: "#050505",
    fontSize: 12,
    fontWeight: "800",
  },
  macroLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  macroLabel: {
    color: "#050505",
    fontFamily,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 26,
  },
  macroSmall: {
    color: "#050505",
    fontSize: 10,
    fontWeight: "800",
  },
  macroProgress: {
    width: 122,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#9A9A9A",
    overflow: "hidden",
  },
  macroProgressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#0094FF",
  },
  nutritionInsight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 23,
    marginRight: 33,
    marginBottom: 11,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#EDEDED",
  },
  insightTitle: {
    color: "#050505",
    fontFamily,
    fontSize: 17,
    fontWeight: "900",
  },
  insightText: {
    color: "#050505",
    fontSize: 10,
    fontWeight: "800",
  },
  caloriesLeft: {
    color: "#050505",
    fontFamily,
    fontSize: 18,
    fontWeight: "900",
  },
  mealsWrapper: {
    marginTop: 0,
  },
  mealBlock: {
    borderBottomWidth: 1,
    borderBottomColor: "#585858",
  },
  mealHeader: {
    minHeight: 37,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingLeft: 23,
    paddingRight: 33,
  },
  mealTitle: {
    color: "#050505",
    fontFamily,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 27,
  },
  mealSummary: {
    color: "#050505",
    fontFamily,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 17,
  },
  triangle: {
    color: "#050505",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 35,
  },
  foodRow: {
    height: 37,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 51,
    paddingRight: 39,
    borderTopWidth: 1,
    borderTopColor: "#707070",
  },
  foodName: {
    color: "#050505",
    fontFamily,
    fontSize: 15,
    fontWeight: "900",
  },
  foodKcal: {
    color: "#050505",
    fontFamily,
    fontSize: 15,
    fontWeight: "900",
  },
  actionsDock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 24,
    paddingRight: 35,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    backgroundColor: "#FFFFFF",
  },
  shoppingButton: {
    width: 155,
    height: 39,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
  },
  shoppingText: {
    marginLeft: 4,
    color: "#050505",
    fontFamily,
    fontSize: 17,
    fontWeight: "900",
  },
  addFoodButton: {
    width: 155,
    height: 39,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 3,
    paddingRight: 8,
    borderRadius: 10,
    backgroundColor: "#D76F74",
  },
  plus: {
    marginRight: 4,
    color: "#050505",
    fontSize: 34,
    fontWeight: "400",
    lineHeight: 36,
  },
  addFoodText: {
    color: "#050505",
    fontFamily,
    fontSize: 17,
    fontWeight: "900",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.34)",
  },
  modalCard: {
    maxHeight: "82%",
    padding: 20,
    paddingBottom: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  foodModalCard: {
    maxHeight: "78%",
    padding: 20,
    paddingBottom: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  mealPicker: {
    flexDirection: "row",
    marginBottom: 12,
  },
  mealChoice: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 9,
    backgroundColor: "#D9D9D9",
  },
  mealChoiceActive: {
    backgroundColor: "#D76F74",
  },
  mealChoiceText: {
    color: "#050505",
    fontFamily,
    fontSize: 15,
    fontWeight: "900",
  },
  foodOption: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
  },
  foodOptionTitle: {
    color: "#050505",
    fontFamily,
    fontSize: 18,
    fontWeight: "900",
  },
  foodOptionMeta: {
    color: "#050505",
    fontSize: 11,
    fontWeight: "800",
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#050505",
    fontFamily,
    fontSize: 25,
    fontWeight: "900",
  },
  modalSubtitle: {
    maxWidth: 270,
    color: "#555555",
    fontSize: 11,
    fontWeight: "700",
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
  },
  closeText: {
    color: "#050505",
    fontSize: 20,
    fontWeight: "900",
  },
  shoppingSummary: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  shoppingSummaryPill: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#EDEDED",
  },
  shoppingSummaryText: {
    color: "#050505",
    fontSize: 12,
    fontWeight: "900",
  },
  shoppingToolbar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: "#D9D9D9",
  },
  secondaryButtonText: {
    color: "#050505",
    fontFamily,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  shoppingList: {
    maxHeight: 360,
  },
  shoppingSection: {
    marginBottom: 10,
  },
  shoppingSectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
    paddingHorizontal: 2,
  },
  shoppingSectionTitle: {
    color: "#050505",
    fontFamily,
    fontSize: 16,
    fontWeight: "900",
  },
  shoppingSectionCount: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "900",
  },
  shoppingEmpty: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    overflow: "hidden",
    borderRadius: 10,
    color: "#555555",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    backgroundColor: "#EDEDED",
  },
  shoppingItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 74,
    marginBottom: 7,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#EDEDED",
  },
  shoppingItemDone: {
    opacity: 0.82,
  },
  checkbox: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    borderWidth: 2,
    borderColor: "#050505",
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#00E34D",
  },
  checkboxText: {
    color: "#050505",
    fontSize: 16,
    fontWeight: "900",
  },
  shoppingContent: {
    flex: 1,
    minWidth: 0,
  },
  shoppingMetaRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 7,
  },
  shoppingInput: {
    height: 38,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    borderRadius: 9,
    color: "#050505",
    fontSize: 16,
    fontWeight: "800",
    backgroundColor: "#FFFFFF",
  },
  shoppingInputDone: {
    textDecorationLine: "line-through",
    opacity: 0.55,
  },
  quantityInput: {
    flex: 0.85,
    height: 38,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    borderRadius: 9,
    color: "#050505",
    fontSize: 14,
    fontWeight: "800",
    backgroundColor: "#FFFFFF",
  },
  categoryInput: {
    flex: 1,
    height: 38,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    borderRadius: 9,
    color: "#050505",
    fontSize: 13,
    fontWeight: "800",
    backgroundColor: "#FFF7D8",
  },
  deleteButton: {
    width: 34,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    borderRadius: 9,
    backgroundColor: "#D76F74",
  },
  addItemPanel: {
    gap: 8,
    marginTop: 2,
    padding: 9,
    borderRadius: 10,
    backgroundColor: "#EDEDED",
  },
  addItemRow: {
    flexDirection: "row",
    gap: 8,
  },
  newItemInput: {
    height: 42,
    paddingHorizontal: 11,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    color: "#050505",
    fontSize: 16,
    fontWeight: "800",
    backgroundColor: "#FFFFFF",
  },
  newQuantityInput: {
    flex: 0.85,
    height: 42,
    paddingHorizontal: 11,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    color: "#050505",
    fontSize: 16,
    fontWeight: "800",
    backgroundColor: "#FFFFFF",
  },
  newCategoryInput: {
    flex: 1,
    height: 42,
    paddingHorizontal: 11,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    color: "#050505",
    fontSize: 16,
    fontWeight: "800",
    backgroundColor: "#FFFFFF",
  },
  addItemButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: "#D76F74",
  },
  addItemText: {
    color: "#050505",
    fontFamily,
    fontSize: 19,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.65,
  },
});
