// frontend/src/screens/horoscope/MonthlyHoroscopeScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/common/Header';
import BirthDetailsModal from '../../components/common/BirthDetailsModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function MonthlyHoroscopeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [monthlyData, setMonthlyData] = useState(null);

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const generateHoroscope = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@astroai_auth_token');
      const now = new Date();

      const response = await fetch(
        `${API_BASE_URL}/api/horoscope/monthly?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setMonthlyData(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to generate horoscope');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load monthly horoscope');
    } finally {
      setLoading(false);
    }
  };

  // Empty State
  if (!monthlyData && !loading) {
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
            <Text style={styles.emptyTitle}>Monthly Horoscope</Text>
            <Text style={styles.emptyDate}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
          </LinearGradient>

          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="calendar-month" size={80} color="#6C3FB5" />
            <Text style={styles.emptyText}>
              Monthly horoscope: A monthly horoscope provides a comprehensive astrological forecast for the current month, analyzing the influence of planetary movements and their impact on your zodiac sign. It offers insights into major life areas such as career, relationships, health, and finances, helping you prepare for upcoming opportunities and challenges. The prediction includes key planetary positions like Jupiter's transit or Saturn's influence, along with lucky numbers, colors, or remedies to enhance positive energies and mitigate negative ones.
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
          <Text style={styles.loadingText}>Generating your monthly horoscope...</Text>
        </View>
      </View>
    );
  }

  // Main Content
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#6C3FB5', '#4A90E2']} style={styles.header}>
          <Text style={styles.title}>Monthly Horoscope</Text>
          <Text style={styles.month}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        </LinearGradient>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Finance</Text>
            <Text style={styles.prediction}>{monthlyData?.finance_prediction || 'Loading...'}</Text>
            <Text style={styles.score}>Score: {monthlyData?.finance_score || 7}/10</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Career</Text>
            <Text style={styles.prediction}>{monthlyData?.career_prediction || 'Loading...'}</Text>
            <Text style={styles.score}>Score: {monthlyData?.career_score || 7}/10</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Relationship</Text>
            <Text style={styles.prediction}>{monthlyData?.relationship_prediction || 'Loading...'}</Text>
            <Text style={styles.score}>Score: {monthlyData?.relationship_score || 7}/10</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Health</Text>
            <Text style={styles.prediction}>{monthlyData?.health_prediction || 'Loading...'}</Text>
            <Text style={styles.score}>Score: {monthlyData?.health_score || 7}/10</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  
  // Empty State
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

  // Loading State
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

  // Main Content
  header: { padding: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  month: { fontSize: 16, color: '#fff', marginTop: 5 },
  card: { margin: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  prediction: { fontSize: 16, lineHeight: 24, marginBottom: 10 },
  score: { fontSize: 14, fontWeight: 'bold', color: '#6C3FB5' },
  regenerateButton: { 
    margin: 15,
    marginBottom: 30 
  },
});
