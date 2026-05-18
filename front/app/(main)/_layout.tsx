import React from 'react';
import { Platform, View } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Feather } from '@expo/vector-icons';

const TopTabNavigator = createMaterialTopTabNavigator();
const SwipeableTabs = withLayoutContext(TopTabNavigator.Navigator);

export default function MainLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F2F4F7' }}>
      <SwipeableTabs
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          tabBarShowIcon: true,
          tabBarActiveTintColor: '#0F172A',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            height: Platform.OS === 'ios' ? 90 : 75,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            elevation: 0,
            shadowOpacity: 0
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '800', textTransform: 'none' },
          tabBarIndicatorStyle: { backgroundColor: '#4F46E5', height: 3, top: 0 },
        }}
      >
        <SwipeableTabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }: {color: string}) => <Feather name="home" size={22} color={color} /> }} />
        <SwipeableTabs.Screen name="gym" options={{ title: "Gym", tabBarIcon: ({ color }: {color: string}) => <Feather name="activity" size={22} color={color} /> }} />
        <SwipeableTabs.Screen name="nutrition" options={{ title: "Eats", tabBarIcon: ({ color }: {color: string}) => <Feather name="coffee" size={22} color={color} /> }} />
        <SwipeableTabs.Screen name="hobbies" options={{ title: "Stars", tabBarIcon: ({ color }: {color: string}) => <Feather name="star" size={22} color={color} /> }} />
        <SwipeableTabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }: {color: string}) => <Feather name="settings" size={22} color={color} /> }} />
      </SwipeableTabs>
    </View>
  );
}