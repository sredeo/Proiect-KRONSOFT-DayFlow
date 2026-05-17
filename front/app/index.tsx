import React, { useState, useCallback } from "react";
import {
  Pressable, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, View, ActivityIndicator,
  Modal, TextInput, TouchableOpacity, Alert
} from "react-native";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { DashboardAPI, Task, SettingsAPI } from "../api";
import { requestNotificationPermissions, scheduleTransitNotifications } from "../notifications";

const categoryStyles: Record<string, any> = {
  meeting: { background: "#fff", tag: "#eef2ff", accent: "#4338ca", icon: "🤝" },
  work: { background: "#fff", tag: "#e0f2fe", accent: "#0284c7", icon: "💻" },
  workout: { background: "#fff", tag: "#dcfce7", accent: "#16a34a", icon: "🏋️" },
  hobby: { background: "#fff", tag: "#fee2e2", accent: "#dc2626", icon: "🎸" },
  other: { background: "#fff", tag: "#f3f4f6", accent: "#4b5563", icon: "📌" },
  default: { background: "#fff", tag: "#f3f4f6", accent: "#4b5563", icon: "📌" },
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    category: "work",
    date: new Date().toISOString().split('T')[0],
    start_time: "10:00:00",
    end_time: "11:00:00",
    location: "",
    transport_mode: "car",
    origin_preference: "previous",
    custom_origin: ""
  });

  const [startHour, setStartHour] = useState("10");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("11");
  const [endMinute, setEndMinute] = useState("00");

  const [liveTransit, setLiveTransit] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);

  const fetchTimelineAndSchedule = async () => {
    try {
      setLoading(true);

      const offlineStatus = await AsyncStorage.getItem('offline_mode');
      const isOffline = offlineStatus === 'true';
      setIsOfflineMode(isOffline);

      if (!isOffline) {
        await requestNotificationPermissions();
      }

      const tasksData = await DashboardAPI.getTimeline();
      setTasks(tasksData);

      if (!isOffline) {
        const prefsData = await SettingsAPI.getPreferences();
        await scheduleTransitNotifications(tasksData, prefsData.transit_notifications);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTimelineAndSchedule();
    }, [])
  );

  React.useEffect(() => {
    const sh = startHour.padStart(2, '0');
    const sm = startMinute.padStart(2, '0');
    const eh = endHour.padStart(2, '0');
    const em = endMinute.padStart(2, '0');

    setNewTask(prev => ({
      ...prev,
      start_time: `${sh}:${sm}:00`,
      end_time: `${eh}:${em}:00`
    }));
  }, [startHour, startMinute, endHour, endMinute]);

  React.useEffect(() => {
    if (newTask.location.length < 3) {
      setLiveTransit(null);
      setLocationSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      if (showSuggestions) {
        try {
          const suggestions = await DashboardAPI.suggestLocations(newTask.location);
          setLocationSuggestions(suggestions);
        } catch (error) { console.log(error); }
      }

      setIsEstimating(true);
      try {
        const res = await DashboardAPI.estimateTransit(newTask);
        setLiveTransit(res.estimated_transit_time);
      } catch (error) {
        console.log(error);
      } finally {
        setIsEstimating(false);
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [newTask.location, newTask.transport_mode, newTask.start_time, newTask.date, newTask.origin_preference, newTask.custom_origin, showSuggestions]);

  React.useEffect(() => {
    if (newTask.custom_origin.length < 3 || newTask.origin_preference !== "custom") {
      setOriginSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      if (showOriginSuggestions) {
        try {
          const suggestions = await DashboardAPI.suggestLocations(newTask.custom_origin);
          setOriginSuggestions(suggestions);
        } catch (error) { console.log(error); }
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [newTask.custom_origin, newTask.origin_preference, showOriginSuggestions]);

  const handleCreateTask = async () => {
    if (isOfflineMode) return Alert.alert("Offline Mode", "You cannot create tasks while the app is in offline mode.");
    if (!newTask.title) return alert("Please add a title!");

    try {
      setIsSubmitting(true);
      await DashboardAPI.createTask(newTask);
      setModalVisible(false);
      fetchTimelineAndSchedule();
      setNewTask({ ...newTask, title: "" });
    } catch (error) {
      alert("Error creating task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = (taskId: number, taskTitle: string) => {
    if (isOfflineMode) return Alert.alert("Offline Mode", "You cannot delete tasks while the app is in offline mode.");

    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await DashboardAPI.deleteTask(taskId);
              setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
            } catch (error) {
              alert("Could not delete the task.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Your Timeline</Text>
          <Text style={styles.date}>Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

          {isOfflineMode && (
            <View style={styles.offlineBadge}>
              <Feather name="wifi-off" size={14} color="#b45309" />
              <Text style={styles.offlineBadgeText}>Offline Mode - Reading from local cache</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator size="large" color="#4338ca" style={{ marginTop: 50 }} />
          ) : tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🧘</Text>
              <Text style={styles.emptyStateText}>You have no tasks for today.</Text>
            </View>
          ) : (
            <View style={styles.timelineWrapper}>
              <View style={styles.timelineLine} />

              {tasks.map((item) => {
                const category = categoryStyles[item.category] || categoryStyles.default;
                const formatStartTime = item.start_time.substring(0, 5);
                const formatEndTime = item.end_time.substring(0, 5);

                return (
                  <Pressable key={item.id} style={styles.timelineItem}>
                    <View style={styles.timeColumn}>
                      <Text style={styles.timeText}>{formatStartTime}</Text>
                      <Text style={styles.timeTextEnd}>{formatEndTime}</Text>
                      <View style={[styles.timelineDot, { backgroundColor: category.accent }]} />
                    </View>

                    <View style={[styles.cardContent, { borderLeftColor: category.accent }]}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <View style={[styles.tag, { backgroundColor: category.tag, alignSelf: 'flex-start' }]}>
                            <Text style={[styles.tagText, { color: category.accent }]}>
                              {category.icon} {item.category.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteTask(item.id, item.title)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                          <Feather name="trash-2" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>

                      {item.location ? (
                        <Text style={styles.itemSubtitle}>📍 {item.location}</Text>
                      ) : null}

                      {item.estimated_transit_time > 0 ? (
                        <View style={styles.transitBadge}>
                          <Text style={styles.transitText}>
                            ⏱️ Transit: {item.estimated_transit_time} min ({item.transport_mode === 'car' ? '🚗' : item.transport_mode === 'walking' ? '🚶' : '🚌'})
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragIndicator} />
            <Text style={styles.modalTitle}>Create New Task</Text>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., Team Meeting"
                value={newTask.title}
                onChangeText={(text) => setNewTask({...newTask, title: text})}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {["work", "meeting", "workout", "hobby", "other"].map((cat) => {
                  const isActive = newTask.category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catBtn, isActive && { backgroundColor: categoryStyles[cat].accent, borderColor: categoryStyles[cat].accent }]}
                      onPress={() => setNewTask({...newTask, category: cat})}
                    >
                      <Text style={[styles.catBtnText, isActive && {color: '#fff'}]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Time Range</Text>
              <View style={styles.timePickerContainer}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeBlockLabel}>From</Text>
                  <View style={styles.clockContainer}>
                    <TextInput style={styles.clockInput} keyboardType="numeric" maxLength={2} value={startHour} placeholder="10" onChangeText={(text) => { if (parseInt(text) > 23) return; setStartHour(text); }}/>
                    <Text style={styles.clockDivider}>:</Text>
                    <TextInput style={styles.clockInput} keyboardType="numeric" maxLength={2} value={startMinute} placeholder="00" onChangeText={(text) => { if (parseInt(text) > 59) return; setStartMinute(text); }}/>
                  </View>
                </View>

                <Text style={styles.timeRangeArrow}>→</Text>

                <View style={styles.timeBlock}>
                  <Text style={styles.timeBlockLabel}>To</Text>
                  <View style={styles.clockContainer}>
                    <TextInput style={styles.clockInput} keyboardType="numeric" maxLength={2} value={endHour} placeholder="11" onChangeText={(text) => { if (parseInt(text) > 23) return; setEndHour(text); }}/>
                    <Text style={styles.clockDivider}>:</Text>
                    <TextInput style={styles.clockInput} keyboardType="numeric" maxLength={2} value={endMinute} placeholder="00" onChangeText={(text) => { if (parseInt(text) > 59) return; setEndMinute(text); }}/>
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Destination</Text>
              <View style={{ zIndex: 10 }}>
                <TextInput
                  style={styles.input}
                  placeholder="E.g., Central Park"
                  value={newTask.location}
                  onChangeText={(text) => {
                    setNewTask({...newTask, location: text});
                    setShowSuggestions(true);
                  }}
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {locationSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index} style={styles.suggestionItem}
                        onPress={() => {
                          setNewTask({...newTask, location: suggestion});
                          setShowSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.inputLabel}>Starting Point</Text>
              <View style={styles.originRow}>
                {[
                  {id: "previous", label: "Previous task"},
                  {id: "home", label: "From Home"},
                  {id: "custom", label: "Custom location"}
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.originBtn, newTask.origin_preference === opt.id && styles.originBtnActive]}
                    onPress={() => setNewTask({...newTask, origin_preference: opt.id})}
                  >
                    <Text style={[styles.originBtnText, newTask.origin_preference === opt.id && styles.originBtnTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {newTask.origin_preference === "custom" && (
                <View style={{ zIndex: 9, marginTop: 8 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter starting address..."
                    value={newTask.custom_origin}
                    onChangeText={(text) => {
                      setNewTask({...newTask, custom_origin: text});
                      setShowOriginSuggestions(true);
                    }}
                  />
                  {showOriginSuggestions && originSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {originSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index} style={styles.suggestionItem}
                          onPress={() => {
                            setNewTask({...newTask, custom_origin: suggestion});
                            setShowOriginSuggestions(false);
                          }}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <Text style={styles.inputLabel}>Transport Mode</Text>
              <View style={styles.transportRow}>
                {[
                  {id: "car", label: "Car"},
                  {id: "walking", label: "Walking"},
                  {id: "transit", label: "Transit"}
                ].map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.transportBtn, newTask.transport_mode === mode.id && styles.transportBtnActive]}
                    onPress={() => setNewTask({...newTask, transport_mode: mode.id})}
                  >
                    <Text style={[styles.transportBtnText, newTask.transport_mode === mode.id && styles.transportBtnTextActive]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.liveValidationBox}>
                {isEstimating ? (
                  <Text style={styles.validationTextNormal}>Calculating distance... ⏳</Text>
                ) : liveTransit !== null && liveTransit > 0 ? (
                  <Text style={styles.validationTextWarning}>
                    ⚠️ It will take ~{liveTransit} min
                    {newTask.origin_preference === "home" ? " from home" :
                     newTask.origin_preference === "previous" ? " from the previous task" :
                     newTask.custom_origin ? ` from ${newTask.custom_origin}` : " from the starting point"}
                    .
                  </Text>
                ) : (
                  <Text style={styles.validationTextNormal}>
                    Enter destination to estimate transit
                    {newTask.origin_preference === "home" ? " from home." :
                     newTask.origin_preference === "previous" ? " from the previous task." :
                     " from the starting point."}
                  </Text>
                )}
              </View>

            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTask} disabled={isSubmitting}>
                <Text style={styles.saveBtnText}>{isSubmitting ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fa" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 110 },

  header: { marginBottom: 32 },
  greeting: { fontSize: 32, fontWeight: "800", color: "#111827", marginBottom: 4, letterSpacing: -0.5 },
  date: { fontSize: 15, color: "#6b7280", fontWeight: "500", textTransform: "capitalize" },
  offlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 12, gap: 8 },
  offlineBadgeText: { color: '#b45309', fontSize: 13, fontWeight: '600' },

  section: { flex: 1 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyStateEmoji: { fontSize: 48, marginBottom: 16 },
  emptyStateText: { color: '#6b7280', fontSize: 16, fontWeight: '500' },

  timelineWrapper: { position: 'relative', marginLeft: 10 },
  timelineLine: { position: 'absolute', left: 49, top: 20, bottom: 0, width: 2, backgroundColor: '#e5e7eb', zIndex: 0 },

  timelineItem: { flexDirection: "row", marginBottom: 24, zIndex: 1 },
  timeColumn: { width: 55, alignItems: 'center', paddingTop: 2 },
  timeText: { fontSize: 14, fontWeight: "800", color: "#111827" },
  timeTextEnd: { fontSize: 11, fontWeight: "600", color: "#6b7280", marginTop: 2, marginBottom: 8 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1, elevation: 2 },

  cardContent: { flex: 1, marginLeft: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderLeftWidth: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  itemTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  itemSubtitle: { fontSize: 13, color: "#4b5563", marginBottom: 8, fontWeight: "500" },

  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },

  transitBadge: { backgroundColor: '#f3f4f6', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 4 },
  transitText: { fontSize: 12, color: '#4b5563', fontWeight: '600' },

  fab: { position: 'absolute', bottom: 50, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4338ca', justifyContent: 'center', alignItems: 'center', shadowColor: "#4338ca", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  fabIcon: { fontSize: 32, color: '#fff', fontWeight: '300', marginTop: -2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 12, paddingBottom: 40, height: '85%', shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 20 },
  modalDragIndicator: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 24 },

  inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 16, color: '#111827' },

  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  catBtn: { paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, backgroundColor: '#fff' },
  catBtnText: { fontSize: 13, fontWeight: '600', color: '#4b5563', textTransform: 'capitalize' },

  timePickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, padding: 16, marginBottom: 20 },
  timeBlock: { flex: 1, alignItems: 'center' },
  timeBlockLabel: { fontSize: 11, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  clockContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 8 },
  clockInput: { width: 36, height: 40, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111827' },
  clockDivider: { fontSize: 16, fontWeight: '700', color: '#9ca3af', paddingBottom: 2 },
  timeRangeArrow: { fontSize: 20, color: '#9ca3af', paddingHorizontal: 12, fontWeight: '300' },

  originRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  originBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#f3f4f6', borderRadius: 20 },
  originBtnActive: { backgroundColor: '#e0e7ff' },
  originBtnText: { color: '#4b5563', fontSize: 12, fontWeight: '600' },
  originBtnTextActive: { color: '#4338ca' },

  transportRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  transportBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
  transportBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
  transportBtnText: { color: '#4b5563', fontWeight: '600', fontSize: 13 },
  transportBtnTextActive: { color: '#ffffff' },

  suggestionsContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginTop: -16, marginBottom: 16, maxHeight: 150, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  suggestionItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  suggestionText: { fontSize: 14, color: '#374151' },

  liveValidationBox: { minHeight: 24, marginBottom: 24, justifyContent: 'center' },
  validationTextNormal: { color: '#6b7280', fontSize: 13, fontStyle: 'italic' },
  validationTextWarning: { color: '#b45309', fontSize: 13, fontWeight: '600' },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelBtnText: { color: '#4b5563', fontWeight: '700', fontSize: 16 },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});