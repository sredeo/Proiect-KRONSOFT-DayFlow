import { Feather, FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GymScreen() {
  const [selected, setSelected] = useState('Running');

  const workouts = [
    { name: 'Running', icon: 'running', kcal: '300' },
    { name: 'Weight Training', icon: 'dumbbell', kcal: '450' },
    { name: 'Yoga', icon: 'spa', kcal: '150' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Fitness</Text>
          <Text style={styles.subtitle}>Today's Workout</Text>
        </View>

        <View style={styles.calorieCard}>
          <View>
            <Text style={styles.kcalLabel}>Burned</Text>
            <Text style={styles.kcalValue}>1,240 <Text style={styles.kcalUnit}>kcal</Text></Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.kcalLabel}>Goal</Text>
            <Text style={styles.kcalValue}>2,000 <Text style={styles.kcalUnit}>kcal</Text></Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {workouts.map((item) => (
            <TouchableOpacity 
              key={item.name} 
              style={[styles.workoutCard, selected === item.name && styles.selectedCard]}
              onPress={() => setSelected(item.name)}
            >
              <FontAwesome5 name={item.icon} size={24} color={selected === item.name ? "#000" : "#666"} />
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{item.name}</Text>
                <Text style={styles.workoutKcal}>{item.kcal} kcal</Text>
              </View>
              {selected === item.name && <Feather name="check-circle" size={20} color="black" />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fb' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#000' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  calorieCard: { 
    backgroundColor: '#e0f2fe', borderRadius: 18, padding: 24, 
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#bae6fd' 
  },
  kcalLabel: { fontSize: 13, color: '#0663a8', marginBottom: 4 },
  kcalValue: { fontSize: 22, fontWeight: '700', color: '#111827' },
  kcalUnit: { fontSize: 14, fontWeight: '400', color: '#666' },
  divider: { width: 1, height: 40, backgroundColor: '#dbeafe' },
  listContainer: { gap: 12 },
  workoutCard: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, 
    backgroundColor: '#fff', borderRadius: 16, gap: 16, borderWidth: 1, borderColor: '#e5e7eb'
  },
  selectedCard: { backgroundColor: '#dbeafe', borderColor: '#93c5fd' },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  workoutKcal: { fontSize: 14, color: '#666' },
  startButton: { 
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#000', borderRadius: 14, height: 56, 
    justifyContent: 'center', alignItems: 'center' 
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
