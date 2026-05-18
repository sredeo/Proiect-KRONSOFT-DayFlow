import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity,
  View, ActivityIndicator, Modal, TextInput, Alert
} from 'react-native';
import { WorkoutsAPI, Exercise, WorkoutSession, WeeklySplit, ExerciseSet } from '../../api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function GymScreen() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);

  // Backend Data State
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [splits, setSplits] = useState<WeeklySplit[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

  // Real History State
  const [exerciseHistories, setExerciseHistories] = useState<Record<number, { date: string; sets: ExerciseSet[] }>>({});

  // Modals State
  const [isAddExerciseModalVisible, setAddExerciseModalVisible] = useState(false);
  const [isSetSplitModalVisible, setSetSplitModalVisible] = useState(false);

  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [selectedSplitGroups, setSelectedSplitGroups] = useState<string[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  // Set Logging Forms
  const [setInputs, setSetInputs] = useState<Record<number, { reps: string; weight: string }>>({});

  useEffect(() => {
    initWorkoutPage();
  }, []);

  useEffect(() => {
    if (splits.length > 0) {
      fetchHistoryForCurrentExercises();
    }
  }, [selectedDay, splits]);

  const initWorkoutPage = async () => {
    setLoading(true);
    try {
      const fetchedSplits = await WorkoutsAPI.getWeeklySplit();
      setSplits(fetchedSplits);

      const exercises = await WorkoutsAPI.getExercises();
      setAllExercises(exercises);

      const session = await WorkoutsAPI.startSession("Auto-generated session");
      setActiveSession(session);

      const todayIndex = new Date().getDay();
      const todayString = todayIndex === 0 ? 'Sunday' : DAYS_OF_WEEK[todayIndex - 1];
      setSelectedDay(todayString);

    } catch (e) {
      console.log('Error initializing workouts:', e);
    } finally {
      setLoading(false);
    }
  };

  const currentSplit = splits.find(s => s.day_of_week === selectedDay);
  const plannedExercises = allExercises.filter(ex => currentSplit?.exercises.includes(ex.id));

  const fetchHistoryForCurrentExercises = async () => {
    if (!currentSplit) return;
    const historiesUpdate: Record<number, { date: string; sets: ExerciseSet[] }> = {};

    for (const exId of currentSplit.exercises) {
      try {
        const historyData = await WorkoutsAPI.getExerciseHistory(exId);
        historiesUpdate[exId] = historyData;
      } catch (e) {}
    }
    setExerciseHistories(historiesUpdate);
  };

  // --- Create Split for current day (Multi-Select) ---
  const openSetSplitModal = async () => {
    setSelectedSplitGroups([]); // Reset selections
    const groups = await WorkoutsAPI.getMuscleGroups();
    setMuscleGroups(groups);
    setSetSplitModalVisible(true);
  };

  const toggleSplitGroup = (group: string) => {
    if (selectedSplitGroups.includes(group)) {
      setSelectedSplitGroups(selectedSplitGroups.filter(g => g !== group));
    } else {
      setSelectedSplitGroups([...selectedSplitGroups, group]);
    }
  };

  const handleSaveSplitGroups = async () => {
    if (selectedSplitGroups.length === 0) {
      Alert.alert("Error", "Please select at least one muscle group.");
      return;
    }

    // Combine selected groups (e.g. "Chest & Triceps")
    const combinedGroups = selectedSplitGroups.join(' & ');

    try {
      await WorkoutsAPI.setWeeklySplit({
        day_of_week: selectedDay,
        muscle_group: combinedGroups,
        exercises: []
      });
      const fetchedSplits = await WorkoutsAPI.getWeeklySplit();
      setSplits(fetchedSplits);
      setSetSplitModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "Could not set the muscle group.");
    }
  };

  // --- Delete Split Day ---
  const handleDeleteCurrentSplit = () => {
    if (!currentSplit) return;
    Alert.alert(
      "Reset Routine",
      `Are you sure you want to remove the entire routine for ${selectedDay}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await WorkoutsAPI.deleteWeeklySplit(currentSplit.id);
              const fetchedSplits = await WorkoutsAPI.getWeeklySplit();
              setSplits(fetchedSplits);
            } catch (e) {
              Alert.alert("Error", "Could not reset the routine.");
            }
          }
        }
      ]
    );
  };

  // --- Add Exercise Modal ---
  const openAddExerciseModal = async () => {
    setAddExerciseModalVisible(true);
    const groups = await WorkoutsAPI.getMuscleGroups();
    setMuscleGroups(groups);
  };

  const handleSelectMuscle = async (group: string) => {
    setSelectedMuscle(group);
    const exercises = await WorkoutsAPI.getExercises(group);
    setFilteredExercises(exercises);
  };

  const handleSelectExercise = async (exerciseId: number) => {
    if (!currentSplit) return;
    try {
      const newExercises = [...currentSplit.exercises, exerciseId];


      await WorkoutsAPI.updateWeeklySplit(currentSplit.id, {
        exercises: newExercises
      });

      const fetchedSplits = await WorkoutsAPI.getWeeklySplit();
      setSplits(fetchedSplits);
      setAddExerciseModalVisible(false);
      setSelectedMuscle(null);
    } catch (e) {
      Alert.alert("Error", "Could not save the exercise.");
    }
  };

  // --- Log / Delete Sets ---
  const handleLogSet = async (exerciseId: number) => {
    if (!activeSession) return;
    const input = setInputs[exerciseId] || { reps: '', weight: '' };

    if (!input.reps || !input.weight) {
      Alert.alert("Error", "Please fill in both reps and weight!");
      return;
    }

    const existingSets = activeSession.sets.filter(s => s.exercise === exerciseId);
    const nextSetNumber = existingSets.length + 1;

    try {
      const newSet = await WorkoutsAPI.logSet(activeSession.id, {
        exercise_id: exerciseId,
        set_number: nextSetNumber,
        reps: parseInt(input.reps),
        weight_kg: parseFloat(input.weight)
      });

      setActiveSession({
        ...activeSession,
        sets: [...activeSession.sets, newSet]
      });

      setSetInputs({ ...setInputs, [exerciseId]: { reps: '', weight: '' } });
    } catch (e) {
      Alert.alert("Error", "Could not log the set.");
    }
  };

  const handleDeleteSet = async (setId: number) => {
    if (!activeSession) return;
    try {
      await WorkoutsAPI.deleteSet(setId);
      setActiveSession({
        ...activeSession,
        sets: activeSession.sets.filter(s => s.id !== setId)
      });
    } catch (e) {
      Alert.alert("Error", "Could not remove the logged set.");
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeSession) return;
    try {
      const finishedSession = await WorkoutsAPI.finishSession(activeSession.id);
      setActiveSession(finishedSession);
      setReportModalVisible(true);
    } catch (e) {
      Alert.alert("Error", "Could not finish the workout.");
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#000" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout</Text>
        <Text style={styles.subtitle}>Fitness & Progress</Text>
      </View>

      {/* Horizontal Days Bar */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
          {DAYS_OF_WEEK.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selectedDay === day && styles.dayButtonSelected]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, selectedDay === day && styles.dayTextSelected]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Split Header */}
        <View style={styles.splitHeader}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.sectionTitle}>
              {currentSplit ? currentSplit.muscle_group : "No routine set"}
            </Text>
          </View>

          {!currentSplit ? (
            <TouchableOpacity style={styles.createSplitBtn} onPress={openSetSplitModal}>
              <Text style={styles.createSplitText}>Set Muscle Group</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.splitActions}>
              <TouchableOpacity onPress={handleDeleteCurrentSplit} style={{ marginRight: 14 }}>
                <Feather name="trash-2" size={22} color="#dc2626" />
              </TouchableOpacity>
              <TouchableOpacity onPress={openAddExerciseModal}>
                 <Feather name="plus-circle" size={24} color="#7c3aed" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Exercises List */}
        {currentSplit && plannedExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exercises planned for today.</Text>
          </View>
        ) : (
          plannedExercises.map((exercise) => {
            const exerciseSets = activeSession?.sets.filter(s => s.exercise === exercise.id) || [];
            const pastHistory = exerciseHistories[exercise.id];

            return (
              <View key={exercise.id} style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>

                {pastHistory ? (
                  <View style={styles.historyBox}>
                    <Text style={styles.historyTitle}>Last time target ({pastHistory.date}):</Text>
                    <Text style={styles.historyDetails}>
                      {pastHistory.sets.map(ps => `Set ${ps.set_number}: ${ps.reps}x${ps.weight_kg}kg`).join('  |  ')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.historyText}>No previous history found for this exercise.</Text>
                )}

                {exerciseSets.map((set) => (
                  <View key={set.id} style={styles.loggedSetRow}>
                    <View style={styles.setMainInfo}>
                      <Text style={styles.setLabel}>Set {set.set_number}</Text>
                      <Text style={styles.setValues}>{set.reps} reps × {set.weight_kg} kg</Text>
                    </View>
                    <TouchableOpacity onPress={() => set.id && handleDeleteSet(set.id)}>
                      <Feather name="trash" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.numberInput}
                    placeholder="Reps"
                    keyboardType="numeric"
                    value={setInputs[exercise.id]?.reps || ''}
                    onChangeText={(val) => setSetInputs({...setInputs, [exercise.id]: { ...setInputs[exercise.id], reps: val }})}
                  />
                  <TextInput
                    style={styles.numberInput}
                    placeholder="Kg"
                    keyboardType="numeric"
                    value={setInputs[exercise.id]?.weight || ''}
                    onChangeText={(val) => setSetInputs({...setInputs, [exercise.id]: { ...setInputs[exercise.id], weight: val }})}
                  />
                  <TouchableOpacity style={styles.logBtn} onPress={() => handleLogSet(exercise.id)}>
                    <Text style={styles.logBtnText}>Log</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>

      {/* MULTI-SELECT SET SPLIT MODAL */}
      <Modal visible={isSetSplitModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Routine for {selectedDay}</Text>
            <TouchableOpacity onPress={() => setSetSplitModalVisible(false)}>
              <Feather name="x" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalStep}>Select Muscle Groups (Multiple allowed)</Text>

            {muscleGroups.map(group => {
              const isSelected = selectedSplitGroups.includes(group);
              return (
                <TouchableOpacity
                  key={group}
                  style={[styles.modalListItem, isSelected && { backgroundColor: '#f5f3ff' }]}
                  onPress={() => toggleSplitGroup(group)}
                >
                  <Text style={styles.modalListText}>{group}</Text>
                  {isSelected ? (
                    <Feather name="check-square" size={20} color="#7c3aed" />
                  ) : (
                    <Feather name="square" size={20} color="#ccc" />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.saveSplitBtn} onPress={handleSaveSplitGroups}>
              <Text style={styles.saveSplitBtnText}>Save Routine</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ADD EXERCISE MODAL */}
      <Modal visible={isAddExerciseModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <TouchableOpacity onPress={() => { setAddExerciseModalVisible(false); setSelectedMuscle(null); }}>
              <Feather name="x" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {!selectedMuscle ? (
              <>
                <Text style={styles.modalStep}>1. Select Muscle Group</Text>
                {muscleGroups.map(group => (
                  <TouchableOpacity key={group} style={styles.modalListItem} onPress={() => handleSelectMuscle(group)}>
                    <Text style={styles.modalListText}>{group}</Text>
                    <Feather name="chevron-right" size={20} color="#666" />
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.modalStep}>2. Select Exercise ({selectedMuscle})</Text>
                {filteredExercises.map(ex => (
                  <TouchableOpacity key={ex.id} style={styles.modalListItem} onPress={() => handleSelectExercise(ex.id)}>
                    <Text style={styles.modalListText}>{ex.name}</Text>
                    <Feather name="plus" size={20} color="#7c3aed" />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.backBtnModal} onPress={() => setSelectedMuscle(null)}>
                  <Text style={styles.backBtnText}>Back to groups</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* FINAL REPORT MODAL */}
      <Modal visible={reportModalVisible} animationType="fade" transparent={true}>
        <View style={styles.overlay}>
          <View style={styles.reportCard}>
            <Text style={styles.reportEmoji}>🎉</Text>
            <Text style={styles.reportTitle}>Workout Finished!</Text>
            <Text style={styles.reportText}>You logged a total of {activeSession?.sets.length} sets today.</Text>
            <Text style={styles.reportSuggestion}>*Suggestion: Try to increase the weight by 2.5 kg on your first exercises next week.*</Text>
            <TouchableOpacity
              style={styles.closeReportBtn}
              onPress={() => {
                setReportModalVisible(false);
                initWorkoutPage();
              }}>
              <Text style={styles.closeReportText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },

  daysScroll: { paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
  dayButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  dayButtonSelected: { backgroundColor: '#000', borderColor: '#000' },
  dayText: { fontSize: 14, fontWeight: '600', color: '#666' },
  dayTextSelected: { color: '#fff' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  splitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  splitActions: { flexDirection: 'row', alignItems: 'center' },

  createSplitBtn: { backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#c7d2fe' },
  createSplitText: { color: '#4338ca', fontWeight: '600', fontSize: 13 },

  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#999', fontSize: 15 },

  exerciseCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  exerciseName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },

  historyBox: { backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  historyTitle: { fontSize: 11, fontWeight: '700', color: '#166534', textTransform: 'uppercase' },
  historyDetails: { fontSize: 12, color: '#14532d', marginTop: 2, fontWeight: '500' },
  historyText: { fontSize: 12, color: '#6b7280', marginBottom: 12, fontStyle: 'italic' },

  loggedSetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8, marginBottom: 8 },
  setMainInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  setLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  setValues: { fontSize: 14, color: '#111827', fontWeight: '500' },

  inputRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  numberInput: { flex: 1, height: 44, backgroundColor: '#f5f7fb', borderRadius: 10, paddingHorizontal: 12, fontSize: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  logBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  logBtnText: { color: '#fff', fontWeight: '600' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(247, 248, 251, 0.9)' },
  finishButton: { backgroundColor: '#000', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalContent: { padding: 20 },
  modalStep: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 15, textTransform: 'uppercase' },
  modalListItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalListText: { fontSize: 16, fontWeight: '500', color: '#111827' },
  backBtnModal: { marginTop: 20, alignItems: 'center', padding: 15, backgroundColor: '#f3f4f6', borderRadius: 12 },
  backBtnText: { fontWeight: '600', color: '#374151' },

  saveSplitBtn: { backgroundColor: '#7c3aed', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveSplitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  reportCard: { backgroundColor: '#fff', borderRadius: 24, padding: 30, alignItems: 'center' },
  reportEmoji: { fontSize: 50, marginBottom: 15 },
  reportTitle: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  reportText: { fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 15 },
  reportSuggestion: { fontSize: 14, color: '#0369a1', fontStyle: 'italic', textAlign: 'center', marginBottom: 25 },
  closeReportBtn: { backgroundColor: '#000', width: '100%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  closeReportText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});