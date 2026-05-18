import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router'; // <-- 1. Import useRouter
import { AuthAPI } from './../api';
import { useAuth } from './_layout';

// 2. Remove the Props type, we don't need it anymore
export default function LoginScreen() {
  const router = useRouter(); // <-- 3. Initialize the router
  const { loginState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Fill in email and password');
      return;
    }

    setLoading(true);
    try {
      await AuthAPI.login(email.trim().toLowerCase(), password);

      loginState(); // <--- INSTANTLY updates RootLayout! No more race conditions.
      router.replace('/');

    } catch (e: any) {
      Alert.alert('Login error', e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.appName}>Dayflow</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.textButton} onPress={() => router.push('/register')} disabled={loading}>
          <Text style={styles.loginText}>Don't have an account? Create one</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 75,
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
