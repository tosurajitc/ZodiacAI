import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase auth
import { onAuthStateChange } from '../services/firebase/auth';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SplashScreen from '../screens/auth/SplashScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Kundli Screens
import BirthDetailsScreen from '../screens/kundli/BirthDetailsScreen';
import KundliViewScreen from '../screens/kundli/KundliViewScreen';

// Horoscope Screens
import DailyHoroscopeScreen from '../screens/horoscope/DailyHoroscopeScreen';
import MonthlyHoroscopeScreen from '../screens/horoscope/MonthlyHoroscopeScreen';
import YearlyHoroscopeScreen from '../screens/horoscope/YearlyHoroscopeScreen';
import LifetimeAnalysisScreen from '../screens/horoscope/LifetimeAnalysisScreen';
import RemediesScreen from '../screens/horoscope/RemediesScreen';

// Chat Screen
import ChatScreen from '../screens/chat/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for Main App
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chat' : 'chat-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C3FB5',
        tabBarInactiveTintColor: '#7F8C8D',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app start
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@astroai_user_data');
        const storedToken = await AsyncStorage.getItem('@astroai_auth_token');
        
        if (storedUser && storedToken) {
          console.log('Loaded stored user:', JSON.parse(storedUser));
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User logged in with Firebase - check for backend data
        try {
          const storedUser = await AsyncStorage.getItem('@astroai_user_data');
          if (storedUser) {
            console.log('Firebase auth detected, setting user from storage');
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Error checking stored user after Firebase auth:', error);
        }
      } else {
        // User logged out - clear everything
        console.log('User logged out, clearing data');
        setUser(null);
        await AsyncStorage.multiRemove(['@astroai_user_data', '@astroai_auth_token']);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Auth Stack - Show login if not authenticated
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // Main App Stack - Show app if authenticated
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="BirthDetails" component={BirthDetailsScreen} />
          <Stack.Screen name="KundliView" component={KundliViewScreen} />
          <Stack.Screen name="DailyHoroscope" component={DailyHoroscopeScreen} />
          <Stack.Screen name="MonthlyHoroscope" component={MonthlyHoroscopeScreen} />
          <Stack.Screen name="YearlyHoroscope" component={YearlyHoroscopeScreen} />
          <Stack.Screen name="LifetimeAnalysis" component={LifetimeAnalysisScreen} />
          <Stack.Screen name="Remedies" component={RemediesScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}