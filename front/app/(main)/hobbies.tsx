import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, ActivityIndicator, Modal, Alert
} from 'react-native';
import { HobbiesAPI, Hobby } from '../../api';

export default function HobbiesScreen() {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Suggestion State
  const [aiMinutes, setAiMinutes] = useState('30');
  const [aiEnergy, setAiEnergy] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [suggestion, setSuggestion] = useState<{ hobby?: string; reason?: string; error?: string } | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Add Hobby Modal State
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newHobby, setNewHobby] = useState<Partial<Hobby>>({
    name: '',
    description: '',
    weekly_goal: 3,
    preferred_duration_mins: 30,
    energy_required: 'Medium'
  });

  // Log Session Modal State
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedHobbyForLog, setSelectedHobbyForLog] = useState<Hobby | null>(null);
  const [logDuration, setLogDuration] = useState('');

  useEffect(() => {
    fetchHobbies();
  }, []);

  const fetchHobbies = async () => {
    setLoading(true);
    try {
      const data = await HobbiesAPI.getHobbies();
      setHobbies(data);
    } catch (e) {
      console.log('Error fetching hobbies:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestion = async () => {
    if (!aiMinutes || isNaN(Number(aiMinutes))) {
      Alert.alert("Error", "Please enter a valid number of minutes.");
      return;
    }
    setIsSuggesting(true);
    setSuggestion(null);
    try {
      const res = await HobbiesAPI.suggestHobby(Number(aiMinutes), aiEnergy);
      setSuggestion(res);
    } catch (e) {
      Alert.alert("Error", "Could not get suggestion from AI.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddHobby = async () => {
    if (!newHobby.name) {
      Alert.alert("Error", "Please provide a hobby name.");
      return;
    }
    try {
      await HobbiesAPI.createHobby(newHobby);
      setAddModalVisible(false);
      setNewHobby({ name: '', description: '', weekly_goal: 3, preferred_duration_mins: 30, energy_required: 'Medium' });
      fetchHobbies();
    } catch (e) {
      Alert.alert("Error", "Could not create the hobby.");
    }
  };

  const handleDeleteHobby = (id: number) => {
    Alert.alert("Delete Hobby", "Are you sure you want to remove this hobby?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await HobbiesAPI.deleteHobby(id);
            fetchHobbies();
          } catch (e) {
            Alert.alert("Error", "Could not delete hobby.");
          }
      }}
    ]);
  };

  const openLogModal = (hobby: Hobby) => {
    setSelectedHobbyForLog(hobby);
    setLogDuration(hobby.preferred_duration_mins.toString());
    setLogModalVisible(true);
  };

  const handleLogSession = async () => {
    if (!selectedHobbyForLog || !logDuration || isNaN(Number(logDuration))) {
      Alert.alert("Error", "Enter a valid duration.");
      return;
    }
    try {
      await HobbiesAPI.logSession({
        hobby: selectedHobbyForLog.id,
        duration_mins: Number(logDuration),
        completed: true
      });
      setLogModalVisible(false);
      Alert.alert("Success", "Session logged successfully! Keep the streak going! 🔥");
      fetchHobbies(); // Refresh progress
    } catch (e) {
      Alert.alert("Error", "Could not log session.");
    }
  };

  if (loading && hobbies.length === 0) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4338ca" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Hobbies</Text>
            <Text style={styles.subtitle}>Track your free time</Text>
          </View>
          <TouchableOpacity style={styles.titleIcon} onPress={() => setAddModalVisible(true)}>
            <Feather name="plus" size={24} color="#4338ca" />
          </TouchableOpacity>
        </View>

        {/* --- AI SUGGESTION AREA --- */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>✨ AI Assistant</Text>
            <Text style={styles.aiSubtitle}>Don't know what to do?</Text>
          </View>

          <View style={styles.aiForm}>
            <View style={styles.aiInputGroup}>
              <Text style={styles.label}>Free minutes:</Text>
              <TextInput
                style={styles.aiInput}
                value={aiMinutes}
                onChangeText={setAiMinutes}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.aiInputGroup}>
              <Text style={styles.label}>Energy:</Text>
              <View style={styles.energyRow}>
                {['Low', 'Medium', 'High'].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.energyBtn, aiEnergy === level && styles.energyBtnActive]}
                    onPress={() => setAiEnergy(level as 'Low' | 'Medium' | 'High')}
                  >
                    <Text style={[styles.energyBtnText, aiEnergy === level && styles.energyBtnTextActive]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.suggestBtn} onPress={handleGetSuggestion} disabled={isSuggesting}>
            {isSuggesting ? <ActivityIndicator color="#fff" /> : <Text style={styles.suggestBtnText}>Suggest a Hobby</Text>}
          </TouchableOpacity>

          {suggestion && (
            <View style={styles.suggestionResult}>
              {suggestion.error ? (
                <Text style={styles.errorText}>{suggestion.error}</Text>
              ) : (
                <>
                  <Text style={styles.suggestedHobbyTitle}>👉 {suggestion.hobby}</Text>
                  <Text style={styles.suggestedReason}>{suggestion.reason}</Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* --- CURRENT HOBBIES LIST --- */}
        <Text style={styles.sectionTitle}>My Hobbies</Text>

        {hobbies.length === 0 ? (
          <Text style={styles.emptyText}>You haven't added any hobbies yet.</Text>
        ) : (
          <View style={styles.list}>
            {hobbies.map((hobby) => (
              <View key={hobby.id} style={styles.hobbyCard}>

                <View style={styles.hobbyHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hobbyName}>{hobby.name}</Text>
                    <Text style={styles.hobbyDesc}>{hobby.energy_required} Energy • {hobby.preferred_duration_mins} min</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteHobby(hobby.id)} style={{ padding: 4 }}>
                    <Feather name="trash-2" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.hobbyStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Weekly Goal</Text>
                    <Text style={styles.statValue}>{hobby.progress_this_week} / {hobby.weekly_goal}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Current Streak</Text>
                    <Text style={styles.statValue}>🔥 {hobby.current_streak} days</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.logBtn} onPress={() => openLogModal(hobby)}>
                  <Feather name="check-circle" size={18} color="#15803d" />
                  <Text style={styles.logBtnText}>Log Session</Text>
                </TouchableOpacity>

              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* --- ADD HOBBY MODAL --- */}
      <Modal visible={isAddModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Hobby</Text>
            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
              <Feather name="x" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.label}>Hobby Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Reading, Guitar"
              value={newHobby.name}
              onChangeText={(val) => setNewHobby({...newHobby, name: val})}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Optional notes..."
              value={newHobby.description}
              onChangeText={(val) => setNewHobby({...newHobby, description: val})}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Weekly Goal</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={newHobby.weekly_goal?.toString()}
                  onChangeText={(val) => setNewHobby({...newHobby, weekly_goal: parseInt(val) || 0})}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Pref. Duration (min)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={newHobby.preferred_duration_mins?.toString()}
                  onChangeText={(val) => setNewHobby({...newHobby, preferred_duration_mins: parseInt(val) || 0})}
                />
              </View>
            </View>

            <Text style={styles.label}>Required Energy</Text>
            <View style={styles.energyRowModal}>
              {['Low', 'Medium', 'High'].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[styles.energyBtn, newHobby.energy_required === level && styles.energyBtnActive]}
                  onPress={() => setNewHobby({...newHobby, energy_required: level as any})}
                >
                  <Text style={[styles.energyBtnText, newHobby.energy_required === level && styles.energyBtnTextActive]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddHobby}>
              <Text style={styles.saveBtnText}>Save Hobby</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- LOG SESSION MODAL --- */}
      <Modal visible={logModalVisible} animationType="fade" transparent={true}>
        <View style={styles.overlay}>
          <View style={styles.logCard}>
            <Text style={styles.logTitle}>Log Session</Text>
            <Text style={styles.logSubtitle}>How long did you do "{selectedHobbyForLog?.name}"?</Text>

            <TextInput
              style={styles.logInput}
              keyboardType="numeric"
              value={logDuration}
              onChangeText={setLogDuration}
            />
            <Text style={styles.minLabel}>minutes</Text>

            <View style={styles.logActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleLogSession}>
                <Text style={styles.confirmBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  titleIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },

  aiCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  aiHeader: { marginBottom: 16 },
  aiTitle: { fontSize: 18, fontWeight: '700', color: '#4338ca' },
  aiSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  aiForm: { marginBottom: 16 },
  aiInputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  aiInput: { height: 46, backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, fontSize: 16 },
  energyRow: { flexDirection: 'row', gap: 8 },
  energyBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  energyBtnActive: { backgroundColor: '#eef2ff', borderColor: '#4338ca' },
  energyBtnText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  energyBtnTextActive: { color: '#4338ca', fontWeight: '700' },
  suggestBtn: { backgroundColor: '#4338ca', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  suggestBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  suggestionResult: { marginTop: 16, padding: 16, backgroundColor: '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  suggestedHobbyTitle: { fontSize: 16, fontWeight: '700', color: '#166534', marginBottom: 6 },
  suggestedReason: { fontSize: 14, color: '#14532d', lineHeight: 20 },
  errorText: { color: '#dc2626' },

  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#111827' },
  emptyText: { color: '#9ca3af', fontStyle: 'italic' },

  list: { gap: 16 },
  hobbyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  hobbyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  hobbyName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  hobbyDesc: { fontSize: 13, color: '#6b7280', marginTop: 4 },

  hobbyStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#f3f4f6' },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#111827' },

  logBtn: { flexDirection: 'row', backgroundColor: '#dcfce7', height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8 },
  logBtnText: { color: '#166534', fontWeight: '600', fontSize: 14 },

  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalContent: { padding: 20 },
  modalInput: { height: 50, backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  energyRowModal: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  saveBtn: { backgroundColor: '#000', height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  logCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  logTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  logSubtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 20 },
  logInput: { fontSize: 40, fontWeight: '800', color: '#4338ca', textAlign: 'center', minWidth: 100, borderBottomWidth: 2, borderBottomColor: '#eef2ff', paddingBottom: 8 },
  minLabel: { fontSize: 16, color: '#9ca3af', marginTop: 8, marginBottom: 24 },
  logActions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, height: 48, backgroundColor: '#f3f4f6', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#4b5563', fontWeight: '600' },
  confirmBtn: { flex: 1, height: 48, backgroundColor: '#15803d', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '600' },
});