import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert,
  SafeAreaView
} from 'react-react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// --- MOCK DATA ---
const mockLocations = [
  { id: '1', name: 'Acasa', address: 'Str. Mamaie 67, Brasov', color: '#4caf50' },
  { id: '2', name: 'Birou', address: 'Str. Mamaie 67, Brasov', color: '#00bcd4' },
  { id: '3', name: 'Sala', address: 'Str. Mamaie 67, Brasov', color: '#f44336' },
  { id: '4', name: 'Facultate', address: 'Str. Mamaie 67, Brasov', color: '#ffc107' },
];

const transportModes = [
  { id: 'car', label: 'Mașină', icon: 'car-sport-outline' },
  { id: 'walk', label: 'Pe jos', icon: 'walk-outline' },
  { id: 'transit', label: 'Transport', icon: 'bus-outline' },
];

export default function SettingsScreen() {
  // --- STATE-URI PENTRU INTERACTIVITATE ---
  const [selectedTransport, setSelectedTransport] = useState('car');
  const [transitAlarm, setTransitAlarm] = useState(true);
  const [hobbySuggestions, setHobbySuggestions] = useState(false);

  // --- HANDLERS (Simulare actiuni) ---
  const handleEditLocation = (name) => {
    Alert.alert("Editare Locație", `Aici se va deschide modalul pentru editarea locației: ${name}`);
  };

  const handleAddLocation = () => {
    Alert.alert("Adaugă Locație", "Deschide formularul de adăugare locație nouă.");
  };

  const handleLogout = () => {
    Alert.alert("Deconectare", "Ești sigur că vrei să te deconectezi?", [
      { text: "Anulează", style: "cancel" },
      { text: "Da, Deconectează-mă", onPress: () => console.log("Logout triggered") }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={32} color="black" />
          <Text style={styles.headerTitle}>Setari</Text>
        </View>

        {/* PROFIL CARD */}
        <View style={styles.cardContainer}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>BS</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Bizon Stefan</Text>
              <Text style={styles.profileEmail}>bizonstefan@yahoo.com</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Google Account Conectat</Text>
              </View>
            </View>
          </View>
        </View>

        {/* LOCAȚII FAVORITE */}
        <Text style={styles.sectionTitle}>Locatii Favorite</Text>
        <View style={[styles.cardContainer, { padding: 0 }]}>
          {mockLocations.map((loc, index) => (
            <View key={loc.id} style={[styles.locationItem, index !== mockLocations.length - 1 && styles.borderBottom]}>
              <View style={[styles.locationDot, { backgroundColor: loc.color }]} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationName}>{loc.name}</Text>
                <Text style={styles.locationAddress}>{loc.address}</Text>
              </View>
              <TouchableOpacity onPress={() => handleEditLocation(loc.name)}>
                <MaterialIcons name="edit" size={24} color="black" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddLocation}>
            <Ionicons name="add" size={20} color="black" />
            <Text style={styles.addButtonText}>Adauga Locatie</Text>
          </TouchableOpacity>
        </View>

        {/* MOD DE DEPLASARE IMPLICIT */}
        <Text style={styles.sectionTitle}>Mod de deplasare implicit</Text>
        <View style={styles.transportRow}>
          {transportModes.map((mode) => (
            <TouchableOpacity 
              key={mode.id} 
              style={[
                styles.transportButton, 
                selectedTransport === mode.id && styles.transportButtonSelected
              ]}
              onPress={() => setSelectedTransport(mode.id)}
            >
              <Ionicons 
                name={mode.icon} 
                size={18} 
                color={selectedTransport === mode.id ? "white" : "black"} 
              />
              <Text style={[
                styles.transportButtonText,
                selectedTransport === mode.id && styles.transportButtonTextSelected
              ]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NOTIFICĂRI */}
        <Text style={styles.sectionTitle}>Notificari</Text>
        <View style={[styles.cardContainer, { padding: 0 }]}>
          <View style={[styles.notificationItem, styles.borderBottom]}>
            <View>
              <Text style={styles.notificationTitle}>Alarma de transit</Text>
              <Text style={styles.notificationSubtitle}>Pleaca la timp la task-uri</Text>
            </View>
            <Switch 
              value={transitAlarm} 
              onValueChange={setTransitAlarm} 
              trackColor={{ false: '#767577', true: '#a855f7' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          <View style={styles.notificationItem}>
            <View>
              <Text style={styles.notificationTitle}>Sugestii Hobby</Text>
              <Text style={styles.notificationSubtitle}>Ferestre libere detectate</Text>
            </View>
            <Switch 
              value={hobbySuggestions} 
              onValueChange={setHobbySuggestions}
              trackColor={{ false: '#767577', true: '#a855f7' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        {/* BUTON DECONECTARE */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="door-open-outline" size={24} color="red" style={{marginRight: 8}}/>
          <Text style={styles.logoutText}>Deconectează-te</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* BOTTOM TAB BAR (Mocked pentru acuratețea imaginii) 
          Notă: În producție, acest meniu se face de obicei cu React Navigation (createBottomTabNavigator) 
          la un nivel mai înalt de arhitectură, nu în fișierul ecranului. */}
      <View style={styles.bottomTabBar}>
        <Ionicons name="barbell-outline" size={28} color="black" />
        <Ionicons name="restaurant-outline" size={28} color="black" />
        <Ionicons name="home-outline" size={32} color="black" />
        <Ionicons name="star-outline" size={28} color="black" />
        <Ionicons name="settings-outline" size={28} color="black" />
      </View>
    </SafeAreaView>
  );
}

// --- STILIZĂRI ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 100, // Spațiu pentru bottom bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cardContainer: {
    backgroundColor: '#e5e5e5', // Culoarea gri deschis din design
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  // Profil
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 12,
    color: 'black',
    marginBottom: 4,
  },
  badge: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Secțiuni generale
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  // Locații
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  locationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 15,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationAddress: {
    fontSize: 12,
    color: '#555',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  // Transport
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    gap: 10,
  },
  transportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  transportButtonSelected: {
    backgroundColor: '#333', // Highlight pentru butonul apăsat
  },
  transportButtonText: {
    fontWeight: 'bold',
    marginLeft: 5,
    color: 'black',
  },
  transportButtonTextSelected: {
    color: 'white',
  },
  // Notificări
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#555',
  },
  // Logout
  logoutButton: {
    backgroundColor: '#e5e5e5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  logoutText: {
    color: 'red',
    fontSize: 22,
    fontWeight: 'bold',
  },
  // Bottom Tab Bar Mock
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#e5e5e5',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  }
});