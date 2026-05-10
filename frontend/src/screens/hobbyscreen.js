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
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTabBar from "./BottomTabBar";

const CHECK = "\u2713";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const hobbyIcons = [
  { id: "music", icon: "music-note", color: "#FFB247", label: "Music" },
  { id: "book", icon: "book-open-page-variant-outline", color: "#00A83D", label: "Reading" },
  { id: "camera", icon: "camera-outline", color: "#B92BE7", label: "Photo" },
  { id: "shoe", icon: "shoe-sneaker", color: "#35DDE8", label: "Sport" },
  { id: "palette", icon: "palette-outline", color: "#8FB8FF", label: "Creative" },
];

const initialHobbies = [
  {
    id: "guitar",
    title: "Guitar",
    target: 4,
    duration: 30,
    streak: 3,
    icon: "guitar-acoustic",
    color: "#FFB247",
    goal: "Play the chorus cleanly",
    energy: "Medium",
    sessions: [
      { id: "guitar-tue", day: 1, time: "18:30", completed: true },
      { id: "guitar-thu", day: 3, time: "18:30", completed: false },
      { id: "guitar-sat", day: 5, time: "11:00", completed: false },
      { id: "guitar-sun", day: 6, time: "17:30", completed: false },
    ],
  },
  {
    id: "reading",
    title: "Reading",
    target: 5,
    duration: 25,
    streak: 6,
    icon: "book-open-page-variant-outline",
    color: "#00A83D",
    goal: "Read 80 pages this week",
    energy: "Low",
    sessions: [
      { id: "reading-mon", day: 0, time: "21:00", completed: true },
      { id: "reading-tue", day: 1, time: "21:00", completed: true },
      { id: "reading-wed", day: 2, time: "21:00", completed: true },
      { id: "reading-thu", day: 3, time: "14:00", completed: false },
      { id: "reading-sat", day: 5, time: "10:00", completed: false },
    ],
  },
  {
    id: "photo",
    title: "Photography",
    target: 2,
    duration: 40,
    streak: 1,
    icon: "camera-outline",
    color: "#B92BE7",
    goal: "Shoot one small city set",
    energy: "High",
    sessions: [
      { id: "photo-wed", day: 2, time: "17:30", completed: true },
      { id: "photo-sat", day: 5, time: "16:00", completed: false },
    ],
  },
  {
    id: "run",
    title: "Running",
    target: 3,
    duration: 35,
    streak: 5,
    icon: "shoe-sneaker",
    color: "#35DDE8",
    goal: "Keep an easy pace",
    energy: "High",
    sessions: [
      { id: "run-mon", day: 0, time: "07:30", completed: true },
      { id: "run-wed", day: 2, time: "07:30", completed: true },
      { id: "run-fri", day: 4, time: "07:30", completed: false },
    ],
  },
];

const todayIndex = () => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
};

const buildCalendarDays = () => {
  const today = new Date();

  return Array.from({ length: 18 }, (_, index) => {
    const offset = index - 5;
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const jsDay = date.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

    return {
      offset,
      dayIndex,
      dayLabel: DAYS[dayIndex],
      dateLabel: `${MONTHS[date.getMonth()]} ${date.getDate()}`,
      isToday: offset === 0,
      isPast: offset < 0,
    };
  });
};

const getCompletedCount = (hobby) => hobby.sessions.filter((session) => session.completed).length;

const getAllSessions = (hobbies) =>
  hobbies.flatMap((hobby) =>
    hobby.sessions.map((session) => ({
      ...session,
      hobbyId: hobby.id,
      hobbyTitle: hobby.title,
      color: hobby.color,
      icon: hobby.icon,
      duration: hobby.duration,
      goal: hobby.goal,
      energy: hobby.energy,
    }))
  );

const getNextSession = (sessions, selectedDay) =>
  sessions
    .filter((session) => !session.completed)
    .map((session) => ({
      ...session,
      distance: session.day >= selectedDay ? session.day - selectedDay : session.day + 7 - selectedDay,
    }))
    .sort((a, b) => a.distance - b.distance || a.time.localeCompare(b.time))[0];

export default function HobbyScreen({ navigation }) {
  const [hobbies, setHobbies] = useState(initialHobbies);
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [mode, setMode] = useState("plan");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newHobbyName, setNewHobbyName] = useState("");
  const [newTarget, setNewTarget] = useState("3");
  const [newDuration, setNewDuration] = useState("30");
  const [newTime, setNewTime] = useState("18:00");
  const [selectedIconId, setSelectedIconId] = useState("music");

  const calendarDays = useMemo(() => buildCalendarDays(), []);
  const selectedCalendarDay =
    calendarDays.find((day) => day.offset === selectedOffset) || calendarDays[5];
  const selectedDay = selectedCalendarDay?.dayIndex ?? todayIndex();
  const allSessions = useMemo(() => getAllSessions(hobbies), [hobbies]);
  const selectedDaySessions = allSessions
    .filter((session) => session.day === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextUp = useMemo(() => getNextSession(allSessions, selectedDay), [allSessions, selectedDay]);

  const weeklyStats = useMemo(() => {
    const completed = allSessions.filter((session) => session.completed).length;
    const planned = allSessions.length;
    const minutesDone = allSessions
      .filter((session) => session.completed)
      .reduce((sum, session) => sum + session.duration, 0);
    const minutesPlanned = allSessions.reduce((sum, session) => sum + session.duration, 0);
    const behind = hobbies.filter((hobby) => getCompletedCount(hobby) < Math.ceil(hobby.target / 2)).length;
    return {
      completed,
      planned,
      minutesDone,
      minutesPlanned,
      behind,
      percent: planned > 0 ? Math.round((completed / planned) * 100) : 0,
    };
  }, [allSessions, hobbies]);

  const dayStats = useMemo(() => {
    const total = selectedDaySessions.length;
    const done = selectedDaySessions.filter((session) => session.completed).length;
    const minutes = selectedDaySessions
      .filter((session) => !session.completed)
      .reduce((sum, session) => sum + session.duration, 0);
    return { total, done, minutes };
  }, [selectedDaySessions]);

  const smartSuggestion = useMemo(() => {
    if (!nextUp) {
      return {
        title: "Recovery window",
        body: "All open sessions are done. Keep the evening free or add a light creative block.",
      };
    }
    if (dayStats.minutes > 60) {
      return {
        title: "Split today's load",
        body: `You still have ${dayStats.minutes} minutes planned. Start with ${nextUp.hobbyTitle}, then decide if the second block still fits.`,
      };
    }
    return {
      title: "Best next action",
      body: `${nextUp.hobbyTitle} is the cleanest next step: ${nextUp.duration} minutes, ${nextUp.energy.toLowerCase()} energy.`,
    };
  }, [dayStats.minutes, nextUp]);

  const toggleSession = (hobbyId, sessionId) => {
    setHobbies((current) =>
      current.map((hobby) =>
        hobby.id === hobbyId
          ? {
              ...hobby,
              sessions: hobby.sessions.map((session) =>
                session.id === sessionId ? { ...session, completed: !session.completed } : session
              ),
            }
          : hobby
      )
    );
  };

  const createHobby = () => {
    const name = newHobbyName.trim();
    const target = Math.max(1, Math.min(Number(newTarget || 3), 7));
    const duration = Math.max(5, Math.min(Number(newDuration || 30), 180));
    const selectedIcon = hobbyIcons.find((item) => item.id === selectedIconId) || hobbyIcons[0];

    if (!name) {
      Alert.alert("Name required", "Enter a hobby name first.");
      return;
    }

    setHobbies((current) => [
      {
        id: `${Date.now()}-${name}`,
        title: name,
        target,
        duration,
        streak: 0,
        icon: selectedIcon.icon,
        color: selectedIcon.color,
        goal: "Build a steady weekly habit",
        energy: "Medium",
        sessions: [
          {
            id: `${Date.now()}-${name}-session`,
            day: selectedDay,
            time: newTime || "18:00",
            completed: false,
          },
        ],
      },
      ...current,
    ]);
    setNewHobbyName("");
    setNewTarget("3");
    setNewDuration("30");
    setNewTime("18:00");
    setSelectedIconId("music");
    setIsModalVisible(false);
  };

  const handleMoveSession = (session) => {
    Alert.alert("Move session", `${session.hobbyTitle} can be moved to another free day from here.`);
  };

  const handleTabPress = (tab) => {
    if (navigation && tab !== "hobby") {
      navigation.navigate?.(tab);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>DayFlow</Text>
              <Text style={styles.title}>Hobby Planner</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.addHobbyButton, pressed && styles.pressed]}
              onPress={() => setIsModalVisible(true)}
            >
              <Feather name="plus" size={24} color="#050505" />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>
                  {selectedCalendarDay.isToday ? "Today" : selectedCalendarDay.dateLabel} focus
                </Text>
                <Text style={styles.heroTitle}>
                  {dayStats.done}/{dayStats.total} sessions done
                </Text>
              </View>
              <Text style={styles.heroPercent}>{weeklyStats.percent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${weeklyStats.percent}%` }]} />
            </View>
            <View style={styles.heroStats}>
              <Text style={styles.heroStat}>
                {selectedCalendarDay.isPast ? "Worked" : "Planned"} {dayStats.minutes} min open
              </Text>
              <Text style={styles.heroStat}>{weeklyStats.minutesDone}/{weeklyStats.minutesPlanned} min week</Text>
            </View>
          </View>

          <View style={styles.calendarBlock}>
            <View style={styles.calendarHead}>
              <Text style={styles.calendarTitle}>Calendar</Text>
              <Text style={styles.calendarMeta}>
                {selectedCalendarDay.dayLabel}, {selectedCalendarDay.dateLabel}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: 392, y: 0 }}
              contentContainerStyle={styles.dayStrip}
            >
              {calendarDays.map((calendarDay) => {
                const dayTotal = allSessions.filter((session) => session.day === calendarDay.dayIndex).length;
                const dayDone = allSessions.filter(
                  (session) => session.day === calendarDay.dayIndex && session.completed
                ).length;
                const completion = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;

                return (
                  <Pressable
                    key={`${calendarDay.dateLabel}-${calendarDay.offset}`}
                    style={({ pressed }) => [
                      styles.dayButton,
                      selectedOffset === calendarDay.offset && styles.selectedDayButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setSelectedOffset(calendarDay.offset)}
                  >
                    <View style={styles.dayTopRow}>
                      <Text style={styles.dayLabel}>{calendarDay.dayLabel}</Text>
                      {calendarDay.isToday && <View style={styles.todayDot} />}
                    </View>
                    <Text style={styles.dateLabel}>{calendarDay.dateLabel}</Text>
                    <View style={styles.dayProgressTrack}>
                      <View style={[styles.dayProgressFill, { width: `${completion}%` }]} />
                    </View>
                    <Text style={styles.dayCount}>{dayDone}/{dayTotal} sessions</Text>
                    <Text style={styles.dayStatus}>
                      {calendarDay.isPast ? "History" : calendarDay.isToday ? "Today" : "Upcoming"}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.modeTabs}>
            {[
              { id: "plan", label: "Plan" },
              { id: "progress", label: "Progress" },
              { id: "library", label: "Library" },
            ].map((item) => (
              <Pressable
                key={item.id}
                style={[styles.modeTab, mode === item.id && styles.activeModeTab]}
                onPress={() => setMode(item.id)}
              >
                <Text style={styles.modeTabText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {mode === "plan" && (
            <>
              <View style={styles.smartCard}>
                <Feather name="zap" size={20} color="#050505" />
                <View style={styles.smartCopy}>
                  <Text style={styles.smartTitle}>{smartSuggestion.title}</Text>
                  <Text style={styles.smartText}>{smartSuggestion.body}</Text>
                </View>
              </View>

              {nextUp && (
                <View style={styles.nextCard}>
                  <View style={[styles.nextIcon, { backgroundColor: nextUp.color }]}>
                    <MaterialCommunityIcons name={nextUp.icon} size={22} color="#050505" />
                  </View>
                  <View style={styles.nextCopy}>
                    <Text style={styles.nextLabel}>Up next</Text>
                    <Text style={styles.nextTitle}>{nextUp.hobbyTitle}</Text>
                    <Text style={styles.nextMeta}>
                      {nextUp.distance === 0 ? "Today" : DAYS[nextUp.day]} at {nextUp.time} | {nextUp.duration} min
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.primaryCheck, { backgroundColor: nextUp.color }]}
                    onPress={() => toggleSession(nextUp.hobbyId, nextUp.id)}
                  >
                    <Text style={styles.primaryCheckText}>{CHECK}</Text>
                  </Pressable>
                </View>
              )}

              <Text style={styles.sectionTitle}>
                {selectedCalendarDay.dayLabel}, {selectedCalendarDay.dateLabel}
              </Text>
              {selectedDaySessions.length > 0 ? (
                selectedDaySessions.map((session) => (
                  <View key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionTimeBlock}>
                      <Text style={styles.sessionTime}>{session.time}</Text>
                      <Text style={styles.sessionDuration}>{session.duration}m</Text>
                    </View>
                    <View style={[styles.sessionRail, { backgroundColor: session.color }]} />
                    <View style={styles.sessionCopy}>
                      <Text style={styles.sessionTitle}>{session.hobbyTitle}</Text>
                      <Text style={styles.sessionGoal}>{session.goal}</Text>
                      <View style={styles.sessionTags}>
                        <Text style={styles.sessionTag}>{session.energy} energy</Text>
                        <Text style={styles.sessionTag}>
                          {session.completed
                            ? "Completed"
                            : selectedCalendarDay.isPast
                              ? "Missed"
                              : "Planned"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.sessionActions}>
                      <Pressable style={styles.iconButton} onPress={() => handleMoveSession(session)}>
                        <Feather name="calendar" size={16} color="#050505" />
                      </Pressable>
                      <Pressable
                        style={[styles.sessionCheck, session.completed && styles.sessionCheckDone]}
                        onPress={() => toggleSession(session.hobbyId, session.id)}
                      >
                        <Text style={styles.sessionCheckText}>{session.completed ? CHECK : ""}</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No hobby blocks today</Text>
                  <Text style={styles.emptyText}>Add a 15-30 minute block if you want to keep your weekly rhythm alive.</Text>
                </View>
              )}
            </>
          )}

          {mode === "progress" && (
            <>
              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{weeklyStats.completed}/{weeklyStats.planned}</Text>
                  <Text style={styles.metricLabel}>sessions</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{weeklyStats.behind}</Text>
                  <Text style={styles.metricLabel}>need attention</Text>
                </View>
              </View>
              <Text style={styles.sectionTitle}>Weekly map</Text>
              <View style={styles.habitMap}>
                {hobbies.map((hobby) => (
                  <View key={hobby.id} style={styles.habitRow}>
                    <Text style={styles.habitName}>{hobby.title}</Text>
                    <View style={styles.habitDays}>
                      {DAYS.map((day, index) => {
                        const session = hobby.sessions.find((item) => item.day === index);
                        return (
                          <View
                            key={`${hobby.id}-${day}`}
                            style={[
                              styles.habitCell,
                              session && { borderColor: hobby.color },
                              session?.completed && { backgroundColor: hobby.color },
                            ]}
                          >
                            <Text style={styles.habitCellText}>{session?.completed ? CHECK : ""}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {mode === "library" && (
            <>
              <Text style={styles.sectionTitle}>Hobby library</Text>
              {hobbies.map((hobby) => {
                const completed = getCompletedCount(hobby);
                const percent = Math.min((completed / hobby.target) * 100, 100);
                const nextSession = getNextSession(
                  hobby.sessions.map((session) => ({
                    ...session,
                    hobbyId: hobby.id,
                    hobbyTitle: hobby.title,
                    duration: hobby.duration,
                  })),
                  selectedDay
                );

                return (
                  <View key={hobby.id} style={styles.hobbyCard}>
                    <View style={styles.hobbyInfoRow}>
                      <View style={[styles.hobbyIcon, { backgroundColor: hobby.color }]}>
                        <MaterialCommunityIcons name={hobby.icon} size={20} color="#050505" />
                      </View>
                      <View style={styles.hobbyTextBlock}>
                        <Text style={styles.hobbyTitle}>{hobby.title}</Text>
                        <Text style={styles.hobbySummary}>{hobby.goal}</Text>
                        <Text style={styles.hobbyMeta}>
                          {completed}/{hobby.target} this week | streak {hobby.streak} days
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressTrackSmall}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${percent}%`, backgroundColor: hobby.color },
                        ]}
                      />
                    </View>
                    <Text style={styles.nextSmall}>
                      Next: {nextSession ? `${DAYS[nextSession.day]} ${nextSession.time}` : "No open sessions"}
                    </Text>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        <BottomTabBar activeTab="hobby" onTabPress={handleTabPress} />
      </View>

      <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Add Hobby</Text>
              <Pressable style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeText}>X</Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Hobby name</Text>
            <TextInput style={styles.input} value={newHobbyName} onChangeText={setNewHobbyName} placeholder="Ex: Dancing" placeholderTextColor="#777" />
            <Text style={styles.fieldLabel}>Sessions per week</Text>
            <TextInput style={styles.input} value={newTarget} onChangeText={setNewTarget} keyboardType="number-pad" />
            <Text style={styles.fieldLabel}>Session duration</Text>
            <TextInput style={styles.input} value={newDuration} onChangeText={setNewDuration} keyboardType="number-pad" />
            <Text style={styles.fieldLabel}>First session time</Text>
            <TextInput style={styles.input} value={newTime} onChangeText={setNewTime} placeholder="18:00" placeholderTextColor="#777" />

            <View style={styles.iconPicker}>
              {hobbyIcons.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityLabel={item.label}
                  style={[
                    styles.iconChoice,
                    selectedIconId === item.id && styles.activeIconChoice,
                  ]}
                  onPress={() => setSelectedIconId(item.id)}
                >
                  <MaterialCommunityIcons name={item.icon} size={25} color="#050505" />
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.createButton} onPress={createHobby}>
              <Text style={styles.createButtonText}>Add to {selectedCalendarDay.dayLabel}</Text>
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
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  header: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: { color: "#777777", fontSize: 11, fontWeight: "900" },
  title: { color: "#050505", fontFamily, fontSize: 37, fontWeight: "900", lineHeight: 40 },
  addHobbyButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
  },
  hero: { padding: 12, borderRadius: 10, backgroundColor: "#EDEDED" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  heroLabel: { color: "#555555", fontSize: 11, fontWeight: "900" },
  heroTitle: { color: "#050505", fontFamily, fontSize: 24, fontWeight: "900", lineHeight: 27 },
  heroPercent: { color: "#050505", fontFamily, fontSize: 31, fontWeight: "900" },
  heroStats: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  heroStat: { color: "#050505", fontSize: 11, fontWeight: "800" },
  progressTrack: { height: 9, marginTop: 10, borderRadius: 9, backgroundColor: "#9A9A9A", overflow: "hidden" },
  progressTrackSmall: { height: 8, marginTop: 10, borderRadius: 8, backgroundColor: "#8E8E8E", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 9, backgroundColor: "#0094FF" },
  calendarBlock: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F1F1F1",
  },
  calendarHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  calendarTitle: {
    color: "#050505",
    fontFamily,
    fontSize: 17,
    fontWeight: "900",
  },
  calendarMeta: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "900",
  },
  dayStrip: { paddingHorizontal: 10 },
  dayButton: {
    width: 92,
    minHeight: 86,
    marginRight: 8,
    padding: 9,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  selectedDayButton: {
    borderWidth: 2,
    borderColor: "#050505",
    backgroundColor: "#FFFFFF",
  },
  dayTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todayDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#0094FF",
  },
  dayLabel: { color: "#050505", fontFamily, fontSize: 14, fontWeight: "900" },
  dateLabel: { marginTop: 2, color: "#555555", fontSize: 11, fontWeight: "900" },
  dayProgressTrack: {
    height: 6,
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: "#D9D9D9",
    overflow: "hidden",
  },
  dayProgressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#0094FF",
  },
  dayCount: { marginTop: 6, color: "#050505", fontSize: 10, fontWeight: "900" },
  dayStatus: { marginTop: 2, color: "#555555", fontSize: 9, fontWeight: "800" },
  modeTabs: { flexDirection: "row", marginTop: 12, marginBottom: 10, padding: 3, borderRadius: 10, backgroundColor: "#EDEDED" },
  modeTab: { flex: 1, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  activeModeTab: { backgroundColor: "#FFFFFF" },
  modeTabText: { color: "#050505", fontFamily, fontSize: 15, fontWeight: "900" },
  smartCard: { flexDirection: "row", padding: 12, borderRadius: 10, backgroundColor: "#D9D9D9" },
  smartCopy: { flex: 1, marginLeft: 9 },
  smartTitle: { color: "#050505", fontFamily, fontSize: 16, fontWeight: "900" },
  smartText: { color: "#050505", fontSize: 11, fontWeight: "800", lineHeight: 14 },
  nextCard: { flexDirection: "row", alignItems: "center", marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: "#F1F1F1" },
  nextIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, marginRight: 9 },
  nextCopy: { flex: 1 },
  nextLabel: { color: "#555555", fontSize: 10, fontWeight: "900" },
  nextTitle: { color: "#050505", fontFamily, fontSize: 18, fontWeight: "900" },
  nextMeta: { color: "#050505", fontSize: 11, fontWeight: "800" },
  primaryCheck: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  primaryCheckText: { color: "#050505", fontSize: 22, fontWeight: "900" },
  sectionTitle: { marginTop: 12, marginBottom: 8, color: "#050505", fontFamily, fontSize: 22, fontWeight: "900" },
  sessionCard: { flexDirection: "row", alignItems: "center", minHeight: 78, marginBottom: 9, padding: 9, borderRadius: 10, backgroundColor: "#EDEDED" },
  sessionTimeBlock: { width: 48 },
  sessionTime: { color: "#050505", fontFamily, fontSize: 15, fontWeight: "900" },
  sessionDuration: { color: "#555555", fontSize: 10, fontWeight: "900" },
  sessionRail: { width: 5, alignSelf: "stretch", borderRadius: 5, marginRight: 9 },
  sessionCopy: { flex: 1 },
  sessionTitle: { color: "#050505", fontFamily, fontSize: 16, fontWeight: "900" },
  sessionGoal: { color: "#050505", fontSize: 11, fontWeight: "800" },
  sessionTags: { flexDirection: "row", marginTop: 5 },
  sessionTag: { marginRight: 6, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 7, backgroundColor: "#D9D9D9", color: "#050505", fontSize: 10, fontWeight: "900" },
  sessionActions: { alignItems: "center", marginLeft: 7 },
  iconButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#D9D9D9", marginBottom: 6 },
  sessionCheck: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#050505", borderRadius: 8 },
  sessionCheckDone: { backgroundColor: "#00E34D" },
  sessionCheckText: { color: "#050505", fontSize: 15, fontWeight: "900" },
  metricGrid: { flexDirection: "row" },
  metricCard: { flex: 1, padding: 12, marginRight: 8, borderRadius: 10, backgroundColor: "#EDEDED" },
  metricValue: { color: "#050505", fontFamily, fontSize: 25, fontWeight: "900" },
  metricLabel: { color: "#050505", fontSize: 11, fontWeight: "800" },
  habitMap: { padding: 10, borderRadius: 10, backgroundColor: "#EDEDED" },
  habitRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  habitName: { width: 86, color: "#050505", fontFamily, fontSize: 13, fontWeight: "900" },
  habitDays: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  habitCell: { width: 27, height: 24, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#CFCFCF", borderRadius: 7, backgroundColor: "#FFFFFF" },
  habitCellText: { color: "#050505", fontSize: 12, fontWeight: "900" },
  hobbyCard: { minHeight: 112, marginBottom: 10, padding: 11, borderRadius: 10, backgroundColor: "#D9D9D9" },
  hobbyInfoRow: { flexDirection: "row", alignItems: "center" },
  hobbyIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 15, marginRight: 8 },
  hobbyTextBlock: { flex: 1 },
  hobbyTitle: { color: "#050505", fontFamily, fontSize: 15, fontWeight: "900" },
  hobbySummary: { color: "#050505", fontSize: 10, fontWeight: "800" },
  hobbyMeta: { color: "#050505", fontSize: 10, fontWeight: "800" },
  nextSmall: { marginTop: 8, color: "#050505", fontSize: 11, fontWeight: "900" },
  emptyState: { padding: 13, borderRadius: 10, backgroundColor: "#EDEDED" },
  emptyTitle: { color: "#050505", fontFamily, fontSize: 17, fontWeight: "900" },
  emptyText: { color: "#050505", fontSize: 11, fontWeight: "800" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.34)" },
  modalCard: { padding: 20, paddingBottom: 22, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: "#FFFFFF" },
  modalHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { color: "#050505", fontFamily, fontSize: 25, fontWeight: "900" },
  closeButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#D9D9D9" },
  closeText: { color: "#050505", fontSize: 20, fontWeight: "900" },
  fieldLabel: { marginBottom: 5, color: "#050505", fontFamily, fontSize: 16, fontWeight: "900" },
  input: { height: 42, marginBottom: 10, paddingHorizontal: 11, borderWidth: 2, borderColor: "#D9D9D9", borderRadius: 10, color: "#050505", fontSize: 17, fontWeight: "800" },
  iconPicker: { flexDirection: "row", marginTop: 2, marginBottom: 14 },
  iconChoice: { flex: 1, height: 44, alignItems: "center", justifyContent: "center", marginRight: 8, borderWidth: 2, borderColor: "transparent", borderRadius: 12, backgroundColor: "#D9D9D9" },
  activeIconChoice: { borderColor: "#0094FF" },
  createButton: { height: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#D76F74" },
  createButtonText: { color: "#050505", fontFamily, fontSize: 19, fontWeight: "900" },
  pressed: { opacity: 0.7 },
});
