import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import GymScreen from "./app/gym";
import HobbiesScreen from "./app/hobbies";
import HomeScreen from "./app/index";
import LoginScreen from "./app/login";
import NutritionScreen from "./app/nutrition";
import RegisterScreen from "./app/register";
import SettingsScreen from "./app/settings";
import { AuthAPI, TokenStorage } from "./api";

const baseTabBarStyle = {
  height: 70,
  paddingBottom: 10,
  paddingTop: 8,
  backgroundColor: "#fff",
  borderTopWidth: 1,
  borderTopColor: "#f0f0f0",
};

const Tab = createBottomTabNavigator();

type AuthState = "loading" | "unauthenticated" | "authenticated";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");

  useEffect(() => {
    (async () => {
      const token = await TokenStorage.getAccess();
      setAuthState(token ? "authenticated" : "unauthenticated");
    })();
  }, []);

  const handleLogin = useCallback(() => {
    setAuthState("authenticated");
  }, []);

  const handleRegister = useCallback(() => {
    setAuthScreen("login");
    setAuthState("unauthenticated");
  }, []);

  const handleLogout = useCallback(async () => {
    await AuthAPI.logout();
    setAuthScreen("login");
    setAuthState("unauthenticated");
  }, []);

  if (authState === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {authScreen === "login" ? (
          <LoginScreen
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthScreen("register")}
          />
        ) : (
          <RegisterScreen
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthScreen("login")}
          />
        )}
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: "#000",
            tabBarInactiveTintColor: "#666",
            tabBarStyle:
              route.name === "Settings" ? { display: "none" } : baseTabBarStyle,
            animation: "shift",
          })}
        >
          <Tab.Screen
            name="Hobbies"
            component={HobbiesScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Feather name="star" size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Nutrition"
            component={NutritionScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Feather name="coffee" size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Feather name="home" size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Gym"
            component={GymScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Feather name="activity" size={22} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            children={() => <SettingsScreen onLogout={handleLogout} />}
            options={{
              tabBarIcon: ({ color }) => (
                <Feather name="settings" size={22} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f4f8",
  },
});
