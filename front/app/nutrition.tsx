import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NutritionScreen() {
  const [meals, setMeals] = useState([
    { id: 1, name: 'Breakfast', emoji: '☕', kcal: 500 },
    { id: 2, name: 'Lunch', emoji: '🥗', kcal: 750 },
    { id: 3, name: 'Dinner', emoji: '🍽️', kcal: 600 },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.subtitle}>Track your meals</Text>
        </View>

        <View style={styles.calorieCard}>
          <Text style={styles.kcalValue}>1,850 / 2,000</Text>
          <Text style={styles.kcalLabel}>kcal consumed today</Text>
          <View style={styles.progressBar}><View style={[styles.progress, {width: '92%'}]} /></View>
        </View>

        <View style={styles.list}>
          {meals.map(meal => (
            <View key={meal.id} style={styles.mealCard}>
              <Text style={styles.emoji}>{meal.emoji}</Text>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.inputArea}>
          <TextInput style={styles.input} placeholder="Add new meal..." placeholderTextColor="#999" />
          <TouchableOpacity style={styles.addButton}>
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
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
  calorieCard: { backgroundColor: '#eef2ff', borderRadius: 18, padding: 22, marginBottom: 24, borderWidth: 1, borderColor: '#dbeafe' },
  kcalValue: { fontSize: 24, fontWeight: '700', color: '#111827' },
  kcalLabel: { fontSize: 14, color: '#666', marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: '#dbeafe', borderRadius: 4 },
  progress: { height: '100%', backgroundColor: '#4338ca', borderRadius: 4 },
  list: { gap: 12, marginBottom: 24 },
  mealCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  emoji: { fontSize: 24, marginRight: 16 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  mealKcal: { fontSize: 14, color: '#666' },
  inputArea: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: { flex: 1, height: 50, backgroundColor: '#f5f7fb', borderRadius: 14, paddingHorizontal: 16, color: '#111827' },
  addButton: { width: 50, height: 50, backgroundColor: '#000', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});
