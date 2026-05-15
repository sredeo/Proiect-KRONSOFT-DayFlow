import React from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const categoryStyles = {
  Meeting: {
    background: "#eef2ff",
    tag: "#c7d2fe",
    accent: "#4338ca",
  },
  Work: {
    background: "#e0f2fe",
    tag: "#bae6fd",
    accent: "#0369a1",
  },
  Break: {
    background: "#dcfce7",
    tag: "#bbf7d0",
    accent: "#15803d",
  },
  Hobby: {
    background: "#fee2e2",
    tag: "#fecaca",
    accent: "#b91c1c",
  },
  Default: {
    background: "#f3f4f6",
    tag: "#e5e7eb",
    accent: "#6b7280",
  },
};

const timelineItems = [
  {
    id: "1",
    time: "8:30",
    title: "Daily Standup",
    duration: "2 min",
    tag: "Meeting",
  },
  {
    id: "2",
    time: "9:00",
    title: "Project Review",
    duration: "30 min",
    tag: "Work",
  },
  {
    id: "3",
    time: "10:00",
    title: "Team Sync",
    duration: "45 min",
    tag: "Meeting",
  },
  {
    id: "4",
    time: "11:30",
    title: "Lunch Break",
    duration: "1h",
    tag: "Break",
  },
  {
    id: "5",
    time: "2:00",
    title: "Creative Session",
    duration: "1h 30 min",
    tag: "Hobby",
  },
];

const stats = [
  {
    id: "tasks",
    label: "Tasks",
    value: "4",
    color: "#eef2ff",
    borderColor: "#4338ca",
  },
  {
    id: "hours",
    label: "Hours",
    value: "8",
    color: "#e0f2fe",
    borderColor: "#0369a1",
  },
  {
    id: "progress",
    label: "Progress",
    value: "75%",
    color: "#dcfce7",
    borderColor: "#15803d",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Today</Text>
          <Text style={styles.date}>Thursday, April 30</Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <View
              key={stat.id}
              style={[styles.statCard, { backgroundColor: stat.color, borderLeftColor: stat.borderColor }]}
            >
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.timeline}>
            {timelineItems.map((item) => {
              const category = categoryStyles[item.tag] || categoryStyles.Default;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.timelineItem, { backgroundColor: category.background, borderLeftColor: category.accent }]}
                >
                  <View style={[styles.timelineTime, { backgroundColor: category.tag }]}
                  >
                    <Text style={[styles.time, { color: category.accent }]}>{item.time}</Text>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.duration}</Text>
                  </View>
                  <Text style={[styles.tag, { backgroundColor: category.tag, color: category.accent, borderColor: category.accent }]}>
                    {item.tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderLeftWidth: 4,
  },
  timelineTime: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  timelineContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#999",
  },
  tag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
});
