import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthAPI } from './../api';
import { useRouter } from 'expo-router';



export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    const { email, username, password, password_confirm } = form;

    if (!email.trim() || !username.trim() || !password) {
      Alert.alert('Error', 'Fill required fields: email, username, password');
      return;
    }
    if (password !== password_confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await AuthAPI.register({
        email: email.trim().toLowerCase(),
        username: username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password,
        password_confirm,
      });
      Alert.alert('Success!', 'Account created. Please log in.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (e: any) {
      Alert.alert('Registration error', e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>Dayflow</Text>
        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Dayflow today</Text>

          <TextInput
            value={form.email}
            onChangeText={set('email')}
            placeholder="Email *"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TextInput
            value={form.username}
            onChangeText={set('username')}
            placeholder="Username *"
            placeholderTextColor="#999"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TextInput
            value={form.first_name}
            onChangeText={set('first_name')}
            placeholder="First name"
            placeholderTextColor="#999"
            style={styles.input}
            editable={!loading}
          />
          <TextInput
            value={form.last_name}
            onChangeText={set('last_name')}
            placeholder="Last name"
            placeholderTextColor="#999"
            style={styles.input}
            editable={!loading}
          />
          <TextInput
            value={form.password}
            onChangeText={set('password')}
            placeholder="Password *"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
            editable={!loading}
          />
          <TextInput
            value={form.password_confirm}
            onChangeText={set('password_confirm')}
            placeholder="Confirm password *"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.textButton} onPress={() => router.replace('/login')} disabled={loading}>
            <Text style={styles.loginText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 15,
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    marginBottom: 14,
    color: '#000',
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  textButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  loginText: {
    color: '#000',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
