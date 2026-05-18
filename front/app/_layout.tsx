import 'react-native-gesture-handler';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { TokenStorage } from '../api';

// 1. THE FIX: Create a Global Auth Context
const AuthContext = createContext({
  loginState: () => {},
  logoutState: () => {}
});

// We export this hook so login.tsx and settings.tsx can use it!
export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  // Hide Android System Bar
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, [segments]);

  // Load token ONLY on first app launch
  useEffect(() => {
    const initAuth = async () => {
      const token = await TokenStorage.getAccess();
      setIsAuthenticated(!!token);
    };
    initAuth();
  }, []);

  // Secure Routing Logic
  useEffect(() => {
    if (isAuthenticated === null) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(main)');
    }
  }, [isAuthenticated, segments]);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f2f4f8" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Wrap the app in the provider so other pages can update the state!
  return (
    <AuthContext.Provider value={{
      loginState: () => setIsAuthenticated(true),
      logoutState: () => setIsAuthenticated(false)
    }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(main)" />
      </Stack>
    </AuthContext.Provider>
  );
}