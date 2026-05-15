import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import GymScreen from "./app/gym";
import HobbiesScreen from "./app/hobbies";
import HomeScreen from "./app/index";
import LoginScreen from "./app/login";
import NutritionScreen from "./app/nutrition";
import RegisterScreen from "./app/register";
import SettingsScreen from "./app/settings";

const baseTabBarStyle = {
  height: 70,
  paddingBottom: 10,
  paddingTop: 8,
  backgroundColor: "#fff",
  borderTopWidth: 1,
  borderTopColor: "#f0f0f0",
};

const Tab = createBottomTabNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {authScreen === 'login' ? (
          <LoginScreen
            onLogin={() => setIsAuthenticated(true)}
            onSwitchToRegister={() => setAuthScreen('register')}
          />
        ) : (
          <RegisterScreen
            onRegister={() => setIsAuthenticated(true)}
            onSwitchToLogin={() => setAuthScreen('login')}
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
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#666',
            tabBarStyle:
              route.name === 'Settings' ? { display: 'none' } : baseTabBarStyle,
            animation: 'shift',
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
            component={SettingsScreen}
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
