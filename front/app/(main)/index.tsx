import React, { useState, useCallback } from "react";
import {
  Pressable, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, View, ActivityIndicator,
  Modal, TextInput, TouchableOpacity, Alert
} from "react-native";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { DashboardAPI, Task, SettingsAPI } from "../../api";
import { requestNotificationPermissions, scheduleTransitNotifications } from "../../notifications";

const categoryStyles: Record<string, any> = {
  meeting: { background: "#fff", tag: "#eef2ff", accent: "#4338ca" },
  work: { background: "#fff", tag: "#e0f2fe", accent: "#0284c7" },
  workout: { background: "#fff", tag: "#dcfce7", accent: "#16a34a" },
  hobby: { background: "#fff", tag: "#fee2e2", accent: "#dc2626" },
  other: { background: "#fff", tag: "#f3f4f6", accent: "#4b5563" },
  default: { background: "#fff", tag: "#f3f4f6", accent: "#4b5563" },
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
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" hidden={true} />

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
                              {item.category.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteTask(item.id, item.title)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                          <Feather name="trash-2" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>


                      {item.location ? (
                        <Text style={styles.itemSubtitle}>{item.location}</Text>
                      ) : null}


                      {item.estimated_transit_time > 0 ? (
                        <View style={styles.transitBadge}>
                          <Text style={styles.transitText}>
                            Transit: {item.estimated_transit_time} min ({item.transport_mode})
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

  screen: { flex: 1, backgroundColor: "#F2F4F7" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 130 },

  header: { marginBottom: 36 },
  greeting: { fontSize: 36, fontWeight: "900", color: "#0F172A", marginBottom: 6, letterSpacing: -1 },
  date: { fontSize: 16, color: "#64748B", fontWeight: "600", textTransform: "capitalize", letterSpacing: 0.5 },

  offlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginTop: 16, gap: 8 },
  offlineBadgeText: { color: '#B45309', fontSize: 13, fontWeight: '700' },

  section: { flex: 1 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyStateEmoji: { fontSize: 64, marginBottom: 20 },
  emptyStateText: { color: '#94A3B8', fontSize: 18, fontWeight: '600' },

  timelineWrapper: { position: 'relative', marginLeft: 12 },
  timelineLine: { position: 'absolute', left: 49, top: 24, bottom: 0, width: 2, backgroundColor: '#E2E8F0', zIndex: 0 },

  timelineItem: { flexDirection: "row", marginBottom: 28, zIndex: 1 },
  timeColumn: { width: 60, alignItems: 'center', paddingTop: 4 },
  timeText: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  timeTextEnd: { fontSize: 12, fontWeight: "600", color: "#94A3B8", marginTop: 4, marginBottom: 10 },

  timelineDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 4, borderColor: '#F2F4F7', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },

  cardContent: {
    flex: 1,
    marginLeft: 20,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',

    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  itemTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginBottom: 6, letterSpacing: -0.5 },
  itemSubtitle: { fontSize: 14, color: "#64748B", marginBottom: 12, fontWeight: "600" },


  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.8 },

  transitBadge: { backgroundColor: '#F1F5F9', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginTop: 4 },
  transitText: { fontSize: 13, color: '#475569', fontWeight: '700' },

  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginBottom: 12, gap: 6 },
  alertBannerText: { color: '#991B1B', fontSize: 12, fontWeight: '800' },

  workoutSummary: { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, marginTop: 6, borderWidth: 1, borderColor: '#DCFCE7' },
  workoutSummaryText: { fontSize: 13, color: '#166534', fontWeight: '700' },


  fab: { position: 'absolute', bottom: 40, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', shadowColor: "#0F172A", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 10 },
  fabIcon: { fontSize: 32, color: '#ffffff', fontWeight: '300', marginTop: -2 },


  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingTop: 16, paddingBottom: 50, height: '88%', shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  modalDragIndicator: { width: 48, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 28, letterSpacing: -0.5 },

  inputLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, marginBottom: 24, fontSize: 16, color: '#0F172A', fontWeight: '500' },

  categoryRow: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  catBtn: { paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 99, backgroundColor: '#ffffff' },
  catBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'capitalize' },

  timePickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, padding: 20, marginBottom: 24 },
  timeBlock: { flex: 1, alignItems: 'center' },
  timeBlockLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  clockContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4 },
  clockInput: { width: 40, height: 44, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#0F172A' },
  clockDivider: { fontSize: 18, fontWeight: '800', color: '#94A3B8', paddingBottom: 2 },
  timeRangeArrow: { fontSize: 24, color: '#CBD5E1', paddingHorizontal: 16, fontWeight: '300' },

  originRow: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  originBtn: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#F1F5F9', borderRadius: 99 },
  originBtnActive: { backgroundColor: '#EEF2FF' },
  originBtnText: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  originBtnTextActive: { color: '#4F46E5' },

  transportRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  transportBtn: { flex: 1, paddingVertical: 14, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, alignItems: 'center', backgroundColor: '#ffffff' },
  transportBtnActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  transportBtnText: { color: '#64748B', fontWeight: '700', fontSize: 14 },
  transportBtnTextActive: { color: '#ffffff' },

  suggestionsContainer: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginTop: -20, marginBottom: 20, maxHeight: 180, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4 },
  suggestionItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  suggestionText: { fontSize: 15, color: '#334155', fontWeight: '500' },

  liveValidationBox: { minHeight: 30, marginBottom: 28, justifyContent: 'center' },
  validationTextNormal: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic', fontWeight: '500' },
  validationTextWarning: { color: '#B45309', fontSize: 14, fontWeight: '700' },

  modalActions: { flexDirection: 'row', gap: 16, marginTop: 16 },
  cancelBtn: { flex: 1, padding: 18, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelBtnText: { color: '#64748B', fontWeight: '800', fontSize: 16 },
  saveBtn: { flex: 1, padding: 18, borderRadius: 16, backgroundColor: '#4F46E5', alignItems: 'center', shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  saveBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 }
});