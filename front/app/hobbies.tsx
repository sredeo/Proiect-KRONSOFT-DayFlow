import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HobbiesScreen() {
  const [hobbies, setHobbies] = useState(['Photography', 'Cooking', 'Gardening']);
  const suggestions = [
    { name: 'Reading', emoji: '📚' },
    { name: 'Gaming', emoji: '🎮' },
    { name: 'Drawing', emoji: '🎨' },
  ];

  const removeHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Hobbies</Text>
            <Text style={styles.subtitle}>Your interests</Text>
          </View>
          <View style={styles.titleIcon}>
            <Feather name="heart" size={20} color="#4338ca" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Suggestions</Text>
        <View style={styles.grid}>
          {suggestions.map(item => (
            <TouchableOpacity key={item.name} style={styles.suggestionCard}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.suggestionText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Current Hobbies</Text>
        <View style={styles.list}>
          {hobbies.map((hobby, index) => (
            <View key={index} style={styles.hobbyItem}>
              <Text style={styles.hobbyName}>{hobby}</Text>
              <TouchableOpacity onPress={() => removeHobby(index)}>
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.inputArea}>
          <TextInput style={styles.input} placeholder="New hobby..." placeholderTextColor="#999" />
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
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#000' },
  grid: { flexDirection: 'row', gap: 12 },
  suggestionCard: { 
    flex: 1,
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  emoji: { fontSize: 26, marginBottom: 10 },
  suggestionText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  list: { gap: 10, marginBottom: 24 },
  hobbyItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  hobbyName: { fontSize: 16, color: '#111827' },
  inputArea: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: { flex: 1, height: 50, backgroundColor: '#f5f7fb', borderRadius: 14, paddingHorizontal: 16, color: '#111827' },
  addButton: { width: 50, height: 50, backgroundColor: '#000', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titleIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
});
