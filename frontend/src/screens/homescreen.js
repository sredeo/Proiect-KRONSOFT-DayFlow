import React from "react";
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
import { FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

const alerts = [
  {
    id: "traffic",
    color: "#f7e64f",
    text: "You're leaving in just 4 minutes for Kronsoft. Leave earlier!",
  },
  {
    id: "balance",
    color: "#58e04d",
    text: "Your day is balanced - 3h work, 1h sport, 1h hobby",
  },
];

const timelineItems = [
  {
    id: "1",
    time: "8:30",
    title: "Daily Standup - Meet",
    duration: "~2 min left",
    tag: "job",
    tagColor: "#ff4cb2",
    stripe: "#c58bff",
  },
  {
    id: "2",
    time: "8:30",
    title: "Daily Standup - Meet",
    duration: "~2 min left",
    tag: "job",
    tagColor: "#ff4b4b",
    stripe: "#ff705f",
  },
  {
    id: "3",
    time: "8:30",
    title: "Daily Standup - Meet",
    duration: "~2 min left",
    tag: "job",
    tagColor: "#43d1ff",
    stripe: "#54d7f2",
  },
  {
    id: "4",
    time: "8:30",
    title: "Daily Standup - Meet",
    duration: "~2 min left",
    tag: "job",
    tagColor: "#b980ff",
    stripe: "#b980ff",
  },
  {
    id: "5",
    time: "8:30",
    title: "Daily Standup - Meet",
    duration: "~2 min left",
    tag: "job",
    tagColor: "#f6d542",
    stripe: "#f6d542",
  },
  {
    id: "6",
    time: "8:30",
    title: "Daily Standup - Meet",
    duration: "~2 min left",
    tag: "job",
    tagColor: "#5ee073",
    stripe: "#5ee073",
  },
];

function BottomNavigation({ activeTab, onGoToGym }) {
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

      <Pressable style={styles.navButton} onPress={onGoToGym}>
        <FontAwesome5 name="utensils" size={26} color="#111111" />
      </Pressable>

      <Pressable style={[styles.navButton, styles.homeNavButton]}>
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

export default function HomeScreen({ onGoToGym }) {
  const handleAddTask = () => {
    Alert.alert("New Task", "Task creation modal will be added later.");
  };

  const handleTimelinePress = (item) => {
    Alert.alert("Timeline Item", `${item.title} at ${item.time}`);
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
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.dateText}>Joi, 30 Aprilie</Text>
              <Text style={styles.title}>Ziua Ta</Text>
            </View>

            <Pressable style={styles.taskButton} onPress={handleAddTask}>
              <Text style={styles.taskButtonText}>+ Task</Text>
            </Pressable>
          </View>

          <View style={styles.alerts}>
            {alerts.map((alert) => (
              <View
                key={alert.id}
                style={[styles.alertCard, { backgroundColor: alert.color }]}
              >
                <Ionicons name="warning" size={13} color="#111111" />
                <Text style={styles.alertText}>{alert.text}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Timeline - Astăzi</Text>

          <View style={styles.timeline}>
            {timelineItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.timelineCard}
                onPress={() => handleTimelinePress(item)}
              >
                <View style={[styles.cardStripe, { backgroundColor: item.stripe }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.time}>{item.time}</Text>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <View style={styles.metaRow}>
                    <Text
                      style={[styles.tag, { backgroundColor: item.tagColor }]}
                    >
                      {item.tag}
                    </Text>
                    <Text style={styles.duration}>{item.duration}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <BottomNavigation activeTab="home" onGoToGym={onGoToGym} />
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
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "800",
  },
  title: {
    color: "#111111",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 34,
  },
  taskButton: {
    backgroundColor: "#f2f2f2",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  taskButtonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "900",
  },
  alerts: {
    gap: 8,
    marginBottom: 10,
  },
  alertCard: {
    minHeight: 27,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  alertText: {
    flex: 1,
    color: "#111111",
    fontSize: 9,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 7,
  },
  timeline: {
    gap: 10,
  },
  timelineCard: {
    minHeight: 40,
    backgroundColor: "#d8d8d8",
    borderRadius: 7,
    overflow: "hidden",
    flexDirection: "row",
  },
  cardStripe: {
    width: 5,
  },
  timelineContent: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  time: {
    color: "#111111",
    fontSize: 7,
    fontWeight: "900",
  },
  timelineTitle: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  tag: {
    color: "#ffffff",
    fontSize: 6,
    fontWeight: "900",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: "hidden",
  },
  duration: {
    color: "#111111",
    fontSize: 6,
    fontWeight: "800",
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
