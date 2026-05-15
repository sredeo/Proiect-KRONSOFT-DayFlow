import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notif, setNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [offline, setOffline] = useState(false);

  const SettingRow = ({ label, value, onToggle }: { label: string, value: boolean, onToggle: (v: boolean) => void }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onToggle} 
        trackColor={{ false: "#ddd", true: "#000" }}
        thumbColor="#fff"
      />
    </View>
  );

  const ActionRow = ({ label }: { label: string }) => (
    <TouchableOpacity style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Feather name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home' as never)}>
              <Feather name="arrow-left" size={20} color="#000" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Preferences</Text>
            <SettingRow label="Notifications" value={notif} onToggle={setNotif} />
            <SettingRow label="Dark Mode" value={darkMode} onToggle={setDarkMode} />
            <SettingRow label="Offline Mode" value={offline} onToggle={setOffline} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Account</Text>
            <ActionRow label="Edit Profile" />
            <ActionRow label="Change Password" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>About</Text>
            <View style={styles.infoRow}><Text style={styles.settingLabel}>Version</Text><Text style={styles.infoText}>1.0.0</Text></View>
            <View style={styles.infoRow}><Text style={styles.settingLabel}>Build</Text><Text style={styles.infoText}>1</Text></View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#f5f5f5',
  },
  backButtonText: { fontSize: 14, fontWeight: '600', color: '#000' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  settingRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 14, borderBottomWidth: 0 
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  settingLabel: { fontSize: 16, color: '#000' },
  infoText: { fontSize: 16, color: '#666' },
  logoutButton: { 
    marginTop: 12, height: 56, backgroundColor: '#d30a0a', 
    borderRadius: 12, justifyContent: 'center', alignItems: 'center' 
  },
  logoutText: { color: '#e2e2e2', fontSize: 16, fontWeight: '600' },
});
