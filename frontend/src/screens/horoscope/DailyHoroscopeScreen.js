// frontend/src/screens/horoscope/DailyHoroscopeScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, SegmentedButtons, ActivityIndicator, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/common/Header';
import BirthDetailsModal from '../../components/common/BirthDetailsModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function DailyHoroscopeScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('finance');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [horoscopeData, setHoroscopeData] = useState(null);

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const generateHoroscope = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@astroai_auth_token');

      const response = await fetch(`${API_BASE_URL}/api/horoscope/daily`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setHoroscopeData(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to generate horoscope');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load horoscope');
    } finally {
      setLoading(false);
    }
  };

  // Empty State
  if (!horoscopeData && !loading) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} />
        
        <BirthDetailsModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={generateHoroscope}
          purpose="horoscope"
        />
        
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <LinearGradient colors={['#6C3FB5', '#4A90E2']} style={styles.emptyHeader}>
            <Text style={styles.emptyTitle}>Daily Horoscope</Text>
            <Text style={styles.emptyDate}>{new Date().toLocaleDateString()}</Text>
          </LinearGradient>

          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="crystal-ball" size={80} color="#6C3FB5" />
            <Text style={styles.emptyText}>
              Daily horoscope: A daily horoscope provides a concise astrological forecast for the current day, focusing on planetary positions and their immediate impact on your zodiac sign. It typically includes a brief overview of the day's energy, highlighting key planetary influences like the Moon's phase, Mercury's retrograde status, or Venus's position in relation to your natal chart. The prediction covers major life areas such as career, relationships, health, and finances, offering actionable insights for navigating the day's challenges and opportunities. It also suggests lucky numbers, colors, or remedies to enhance positive energies and mitigate negative ones.
            </Text>
            <Button 
              mode="contained" 
              onPress={handleGenerateClick}
              style={styles.generateButton}
              icon="star"
            >
              Generate Now
            </Button>
          </View>
        </ScrollView>
        {/* NO FOOTER HERE - React Navigation handles it automatically */}
      </View>
    );
  }

  // Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C3FB5" />
          <Text style={styles.loadingText}>Generating your daily horoscope...</Text>
        </View>
        {/* NO FOOTER HERE */}
      </View>
    );
  }

  // Main Content
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#6C3FB5', '#4A90E2']} style={styles.header}>
          <Text style={styles.title}>Daily Horoscope</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
        </LinearGradient>

        <SegmentedButtons
          value={selectedTab}
          onValueChange={setSelectedTab}
          buttons={[
            { value: 'finance', label: 'Finance' },
            { value: 'career', label: 'Career' },
            { value: 'love', label: 'Love' },
            { value: 'health', label: 'Health' }
          ]}
          style={styles.tabs}
        />

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.scoreContainer}>
              <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
              <Text style={styles.scoreText}>
                {horoscopeData?.[`${selectedTab}_score`] || 7}/10
              </Text>
            </View>
            <Text style={styles.prediction}>
              {horoscopeData?.[`${selectedTab}_prediction`] || 'Loading predictions...'}
            </Text>
          </Card.Content>
        </Card>

        <Button 
          mode="outlined" 
          onPress={handleGenerateClick}
          style={styles.regenerateButton}
          icon="refresh"
        >
          Update Birth Details
        </Button>
      </ScrollView>
      {/* NO FOOTER HERE - React Navigation handles it automatically */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  
  emptyContainer: { flexGrow: 1 },
  emptyHeader: { padding: 30, alignItems: 'center' },
  emptyTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  emptyDate: { fontSize: 16, color: '#fff', marginTop: 5 },
  emptyContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#7F8C8D', 
    textAlign: 'center', 
    marginVertical: 20,
    lineHeight: 24 
  },
  generateButton: { 
    marginTop: 20, 
    paddingHorizontal: 30 
  },

  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#7F8C8D' 
  },

  header: { padding: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  date: { fontSize: 16, color: '#fff', marginTop: 5 },
  tabs: { margin: 15 },
  card: { margin: 15 },
  scoreContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  scoreText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginLeft: 10 
  },
  prediction: { 
    fontSize: 16, 
    lineHeight: 24 
  },
  regenerateButton: { 
    margin: 15,
    marginBottom: 30 
  },
});
