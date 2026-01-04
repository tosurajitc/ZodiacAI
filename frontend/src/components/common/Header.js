// frontend/src/components/common/Header.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function Header({ navigation, onMenuPress }) {
  const [userData, setUserData] = useState(null);
  const [predictionCategories, setPredictionCategories] = useState([]);

  const navigationMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'view-dashboard', screen: 'Dashboard' },
    { id: 'kundli', label: 'Your Kundli', icon: 'chart-box', screen: 'KundliView' },
    { id: 'daily', label: 'Daily Horoscope', icon: 'crystal-ball', screen: 'DailyHoroscope' },
    { id: 'monthly', label: 'Monthly Horoscope', icon: 'calendar-month', screen: 'MonthlyHoroscope' },
    { id: 'yearly', label: 'Yearly Horoscope', icon: 'calendar-star', screen: 'YearlyHoroscope' },
    { id: 'lifetime', label: 'Lifetime Analysis', icon: 'infinity', screen: 'LifetimeAnalysis' },
    { id: 'remedies', label: 'Remedies', icon: 'meditation', screen: 'Remedies' },
    { id: 'chat', label: 'AI Astrologer', icon: 'robot', screen: 'Chat' },
    { id: 'profile', label: 'Profile', icon: 'account', screen: 'Profile' },
  ];

  useEffect(() => {
    loadUserData();
    fetchPredictionCategories();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('@astroai_user_data');
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchPredictionCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('@astroai_auth_token');
      const response = await fetch(`${API_BASE_URL}/api/predictions/categories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPredictionCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      // Mock data fallback
      setPredictionCategories([
        { id: 'finance', name: 'Finance', icon: '💰', score: 7, status: 'Good', color: '#4CAF50' },
        { id: 'health', name: 'Health', icon: '❤️', score: 8, status: 'Excellent', color: '#E91E63' },
        { id: 'job', name: 'Job', icon: '💼', score: 6, status: 'Average', color: '#2196F3' },
        { id: 'business', name: 'Business', icon: '🏢', score: 8, status: 'Good', color: '#FF9800' },
        { id: 'love', name: 'Love Life', icon: '💑', score: 7, status: 'Good', color: '#E91E63' },
        { id: 'education', name: 'Education', icon: '🎓', score: 9, status: 'Excellent', color: '#9C27B0' },
        { id: 'investment', name: 'Investment', icon: '📈', score: 6, status: 'Moderate', color: '#FF5722' },
      ]);
    }
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      navigation.toggleDrawer();
    }
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <LinearGradient colors={['#6C3FB5', '#4A90E2']} style={styles.header}>
      {/* Top Bar: Menu, Brand, Notifications */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <MaterialCommunityIcons name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>ZodiacAI</Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileIcon}>
            <MaterialCommunityIcons name="account-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Namaste 🙏</Text>
        <Text style={styles.userName}>{userData?.name || 'User'}</Text>
      </View>

      {/* Prediction Categories - Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {predictionCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('CategoryDetail', { category })}
          >
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryScore}>{category.score}/10</Text>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={[styles.categoryStatus, { color: category.color }]}>
              {category.status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Access Buttons */}
      <View style={styles.quickAccessContainer}>
        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('KundliMatching')}
        >
          <MaterialCommunityIcons name="heart-multiple" size={20} color="#fff" />
          <Text style={styles.quickAccessText}>Kundli Matching</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <MaterialCommunityIcons name="robot" size={20} color="#fff" />
          <Text style={styles.quickAccessText}>Ask AI Astrologer</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuButton: {
    padding: 8,
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileIcon: {
    marginLeft: 8,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 4,
    paddingRight: 20,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 100,
    alignItems: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  quickAccessButton: {
    backgroundColor: '#6C3FB5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    minWidth: 140,
  },
  quickAccessText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
