import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <-- 1. Use Expo Router instead of Navigation
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, StyleSheet, Switch, Text,
  TouchableOpacity, View, ScrollView, TextInput,
  Modal, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsAPI, UsersAPI, DashboardAPI, AuthAPI } from '../../api';
import { useAuth } from '../_layout';

export default function SettingsScreen() {
  const router = useRouter();
  const { logoutState } = useAuth();

  const [transitNotif, setTransitNotif] = useState(true);
  const [hobbyNotif, setHobbyNotif] = useState(true);


  const [offline, setOffline] = useState(false);

  const [defaultLocation, setDefaultLocation] = useState("");
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        const prefs = await SettingsAPI.getPreferences();
        setTransitNotif(prefs.transit_notifications);
        setHobbyNotif(prefs.hobby_notifications);

        const user = await UsersAPI.getMe();
        if (user.default_location) setDefaultLocation(user.default_location);
        setUsername(user.username || "");
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");

        const storedOfflineMode = await AsyncStorage.getItem('offline_mode');

        setOffline(storedOfflineMode === 'true');
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadAllSettings();
  }, []);

  useEffect(() => {
    if (defaultLocation.length < 3 || !showSuggestions) {
      setLocationSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const suggestions = await DashboardAPI.suggestLocations(defaultLocation);
        setLocationSuggestions(suggestions);
      } catch (error) { console.error(error); }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [defaultLocation, showSuggestions]);

  const toggleTransit = async (value: boolean) => {
    setTransitNotif(value);
    try { await SettingsAPI.updatePreferences({ transit_notifications: value }); }
    catch (e) { setTransitNotif(!value); }
  };

  const toggleHobby = async (value: boolean) => {
    setHobbyNotif(value);
    try { await SettingsAPI.updatePreferences({ hobby_notifications: value }); }
    catch (e) { setHobbyNotif(!value); }
  };


  const toggleOfflineMode = async (value: boolean) => {
    setOffline(value);
    await AsyncStorage.setItem('offline_mode', String(value));
  };

  const handleSaveLocation = async () => {
    setIsSavingLocation(true);
    try {
      await UsersAPI.updateMe({ default_location: defaultLocation });
      Alert.alert("Success", "Default home location saved!");
    } catch (e) { Alert.alert("Error", "Could not save the location."); }
    setIsSavingLocation(false);
  };

  const handleSaveProfile = async () => {
    if (!username) return Alert.alert("Error", "Username is required.");
    setIsSavingProfile(true);
    try {
      await UsersAPI.updateMe({ username, first_name: firstName, last_name: lastName });
      Alert.alert("Success", "Your profile has been updated!");
      setEditProfileVisible(false);
    } catch (e) { Alert.alert("Error", "Could not save the profile."); }
    setIsSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return Alert.alert("Error", "Please fill in all fields.");
    if (newPassword !== confirmNewPassword) return Alert.alert("Error", "New passwords do not match.");

    setIsChangingPassword(true);
    try {
      await UsersAPI.changePassword(oldPassword, newPassword);
      Alert.alert("Success", "Password changed successfully!");
      setOldPassword(""); setNewPassword(""); setConfirmNewPassword("");
      setChangePasswordVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Current password is incorrect.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const SettingRow = ({ label, value, onToggle }: { label: string, value: boolean, onToggle: (v: boolean) => void }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#ddd", true: "#000" }} thumbColor="#fff" />
    </View>
  );

  const ActionRow = ({ label, onPress }: { label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Feather name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    await AuthAPI.logout();
    logoutState();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 1 }}>


          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Preferences</Text>
            <SettingRow label="Transit Notifications" value={transitNotif} onToggle={toggleTransit} />
            <SettingRow label="Hobby Notifications" value={hobbyNotif} onToggle={toggleHobby} />
            <SettingRow label="Offline Mode" value={offline} onToggle={toggleOfflineMode} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Home Location (Default)</Text>
            <View style={{ zIndex: 999, position: 'relative' }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={styles.locationInput} value={defaultLocation}
                  onChangeText={(text) => { setDefaultLocation(text); setShowSuggestions(true); }}
                  placeholder="Your home address..."
                />
                <TouchableOpacity onPress={handleSaveLocation} disabled={isSavingLocation} style={styles.saveLocationBtn}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isSavingLocation ? "..." : "Save"}</Text>
                </TouchableOpacity>
              </View>

              {showSuggestions && locationSuggestions.length > 0 && (
                <View style={styles.settingsSuggestionsContainer}>
                  {locationSuggestions.map((suggestion, index) => (
                    <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => { setDefaultLocation(suggestion); setShowSuggestions(false); }}>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Account</Text>
            <ActionRow label="Edit Profile" onPress={() => setEditProfileVisible(true)} />
            <ActionRow label="Change Password" onPress={() => setChangePasswordVisible(true)} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>About</Text>
            <View style={styles.infoRow}><Text style={styles.settingLabel}>Version</Text><Text style={styles.infoText}>1.0.0</Text></View>
            <View style={styles.infoRow}><Text style={styles.settingLabel}>Build</Text><Text style={styles.infoText}>1</Text></View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      <Modal visible={editProfileVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput style={styles.modalInput} value={username} onChangeText={setUsername} />

            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput style={styles.modalInput} value={firstName} onChangeText={setFirstName} />

            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput style={styles.modalInput} value={lastName} onChangeText={setLastName} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditProfileVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={isSavingProfile}>
                <Text style={styles.saveBtnText}>{isSavingProfile ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={changePasswordVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput style={styles.modalInput} secureTextEntry value={oldPassword} onChangeText={setOldPassword} />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput style={styles.modalInput} secureTextEntry value={newPassword} onChangeText={setNewPassword} />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput style={styles.modalInput} secureTextEntry value={confirmNewPassword} onChangeText={setConfirmNewPassword} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setChangePasswordVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={isChangingPassword}>
                <Text style={styles.saveBtnText}>{isChangingPassword ? "Updating..." : "Update"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 0 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 18 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#f5f5f5' },
  backButtonText: { fontSize: 14, fontWeight: '600', color: '#000' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingLabel: { fontSize: 16, color: '#000' },
  infoText: { fontSize: 16, color: '#666' },
  logoutButton: { marginTop: 12, height: 56, backgroundColor: '#d30a0a', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutText: { color: '#e2e2e2', fontSize: 16, fontWeight: '600' },

  locationInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 16, color: '#000' },
  saveLocationBtn: { backgroundColor: '#111827', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  settingsSuggestionsContainer: { position: 'absolute', top: 54, left: 0, right: 0, zIndex: 999, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', maxHeight: 150, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  suggestionItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  suggestionText: { fontSize: 14, color: '#374151' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, height: '75%' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, textTransform: 'uppercase' },
  modalInput: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16, color: '#111827' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 'auto' },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelBtnText: { color: '#4b5563', fontWeight: '700', fontSize: 16 },
  saveBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});