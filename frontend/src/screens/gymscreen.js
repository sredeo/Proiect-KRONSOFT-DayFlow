import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";

const days = [
  { id: "mon", number: "1", label: "Lun" },
  { id: "tue", number: "2", label: "Mar" },
  { id: "wed", number: "3", label: "Mie" },
  { id: "thu", number: "4", label: "Joi" },
  { id: "fri", number: "5", label: "Vin" },
];

const exercises = [
  { id: "1", title: "Exercițiu 1" },
  { id: "2", title: "Exercițiu 2" },
  { id: "3", title: "Exercițiu 3", active: true },
  { id: "4", title: "Exercițiu 4" },
  { id: "5", title: "Exercițiu 5" },
];

function BottomNavigation({ onGoToHome }) {
  const handleUnavailableTab = (label) => {
    Alert.alert(label, `${label} screen is not implemented yet.`);
  };

  return (
    <View style={styles.bottomNav}>
      <Pressable
        style={styles.navButton}
        onPress={() => handleUnavailableTab("Hobbies")}
      >
        <FontAwesome5 name="puzzle-piece" size={26} color="#111111" />
      </Pressable>

      <Pressable style={styles.navButton}>
        <FontAwesome5 name="utensils" size={26} color="#111111" />
      </Pressable>

      <Pressable style={[styles.navButton, styles.homeNavButton]} onPress={onGoToHome}>
        <Feather name="home" size={32} color="#111111" />
      </Pressable>

      <Pressable
        style={styles.navButton}
        onPress={() => handleUnavailableTab("Favorites")}
      >
        <Feather name="star" size={28} color="#111111" />
      </Pressable>

      <Pressable
        style={styles.navButton}
        onPress={() => handleUnavailableTab("Settings")}
      >
        <Feather name="settings" size={28} color="#111111" />
      </Pressable>
    </View>
  );
}

export default function GymScreen({ onGoToHome }) {
  const [selectedDay, setSelectedDay] = useState("mon");
  const [selectedExercise, setSelectedExercise] = useState("3");

  const handleExercisePress = (exercise) => {
    setSelectedExercise(exercise.id);
    Alert.alert("Exercise", `${exercise.title} selected.`);
  };

  const handleTimerPress = (exercise) => {
    Alert.alert("Timer", `Timer started for ${exercise.title}.`);
  };

  const handleFinishWorkout = () => {
    Alert.alert("Workout", "Workout completed - mock action.");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#1f1f1f" />

      <View style={styles.phoneFrame}>
        <View style={styles.topStrip} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Workout</Text>

          <View style={styles.daysRow}>
            {days.map((day) => (
              <Pressable
                key={day.id}
                style={[
                  styles.dayCard,
                  selectedDay === day.id && styles.selectedDayCard,
                ]}
                onPress={() => setSelectedDay(day.id)}
              >
                <Text style={styles.dayNumber}>{day.number}</Text>
                <Text style={styles.dayLabel}>{day.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Exerciții</Text>

          <View style={styles.exerciseList}>
            {exercises.map((exercise) => {
              const isSelected = selectedExercise === exercise.id;

              return (
                <Pressable
                  key={exercise.id}
                  style={[
                    styles.exerciseCard,
                    isSelected && styles.selectedExerciseCard,
                  ]}
                  onPress={() => handleExercisePress(exercise)}
                >
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>

                  <Pressable
                    style={styles.timerButton}
                    onPress={() => handleTimerPress(exercise)}
                  >
                    <Text style={styles.timerButtonText}>Bifează</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.finishButton} onPress={handleFinishWorkout}>
            <Text style={styles.finishButtonText}>Finalizează antrenament</Text>
          </Pressable>
        </ScrollView>

        <BottomNavigation onGoToHome={onGoToHome} />
        <View style={styles.bottomStrip} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1f1f1f",
  },
  phoneFrame: {
    flex: 1,
    marginHorizontal: 12,
    marginVertical: 28,
    backgroundColor: "#ffffff",
  },
  topStrip: {
    height: 31,
    backgroundColor: "#fde5e5",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 16,
  },
  title: {
    color: "#111111",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 7,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  dayCard: {
    width: 29,
    minHeight: 34,
    borderRadius: 7,
    backgroundColor: "#dedede",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  selectedDayCard: {
    backgroundColor: "#eeeeee",
  },
  dayNumber: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 16,
  },
  dayLabel: {
    color: "#111111",
    fontSize: 9,
    fontWeight: "800",
  },
  sectionTitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseCard: {
    minHeight: 47,
    borderRadius: 7,
    backgroundColor: "#d8d8d8",
    paddingHorizontal: 8,
    paddingTop: 5,
    paddingBottom: 6,
  },
  selectedExerciseCard: {
    borderWidth: 2,
    borderColor: "#129cff",
    backgroundColor: "#e2e2e2",
  },
  exerciseTitle: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
  },
  timerButton: {
    alignSelf: "flex-end",
    marginTop: 17,
    backgroundColor: "#a8a8a8",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  timerButtonText: {
    color: "#111111",
    fontSize: 9,
    fontWeight: "900",
  },
  finishButton: {
    alignSelf: "center",
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: "#d8d8d8",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  finishButtonText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
  },
  bottomNav: {
    height: 42,
    backgroundColor: "#e6e6e6",
    borderTopWidth: 1,
    borderTopColor: "#d2d2d2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 5,
  },
  navButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  homeNavButton: {
    width: 44,
  },
  bottomStrip: {
    height: 31,
    backgroundColor: "#fde5e5",
  },
});
