// frontend/src/screens/horoscope/YearlyHoroscopeScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/common/Header';
import BirthDetailsModal from '../../components/common/BirthDetailsModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function YearlyHoroscopeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [yearlyData, setYearlyData] = useState(null);

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const generateHoroscope = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@astroai_auth_token');
      const year = new Date().getFullYear();

      const response = await fetch(
        `${API_BASE_URL}/api/horoscope/yearly?year=${year}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setYearlyData(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to generate horoscope');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load yearly horoscope');
    } finally {
      setLoading(false);
    }
  };

  // Empty State
  if (!yearlyData && !loading) {
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
            <Text style={styles.emptyTitle}>Yearly Horoscope {new Date().getFullYear()}</Text>
            <Text style={styles.emptySubtitle}>Complete year analysis</Text>
          </LinearGradient>

          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="calendar-star" size={80} color="#6C3FB5" />
            <Text style={styles.emptyText}>
              Yearly horoscope: A yearly horoscope provides a comprehensive astrological forecast for the entire year, examining major planetary transits and their long-term impact on your zodiac sign. It covers all significant life areas including career milestones, relationship developments, financial patterns, and health trends throughout the year. The prediction highlights key periods for growth, challenges to watch for, and quarterly breakdowns of what to expect. It includes important astrological events like eclipses, retrogrades, and major planetary shifts that will shape your year.
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
          <Text style={styles.loadingText}>Generating your yearly horoscope...</Text>
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
          <Text style={styles.title}>Yearly Horoscope {new Date().getFullYear()}</Text>
          <Text style={styles.subtitle}>Complete year analysis</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{yearlyData?.overall_score || 8.2}</Text>
            <Text style={styles.ratingLabel}>/10</Text>
          </View>
        </LinearGradient>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Key Themes for {new Date().getFullYear()}</Text>
            <Text style={styles.theme}>✓ Career advancement and recognition</Text>
            <Text style={styles.theme}>✓ Financial growth through investments</Text>
            <Text style={styles.theme}>✓ Relationship stability and harmony</Text>
            <Text style={styles.theme}>✓ Health improvements with discipline</Text>
          </Card.Content>
        </Card>

        {yearlyData?.quarterly_breakdown?.map((quarter, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Text style={styles.quarterTitle}>Q{index + 1} ({quarter.months})</Text>
              <Text style={styles.quarterScore}>Score: {quarter.score}/10</Text>
              <Text style={styles.quarterText}>{quarter.prediction}</Text>
            </Card.Content>
          </Card>
        )) || (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.quarterTitle}>Q1 (Jan - Mar)</Text>
                <Text style={styles.quarterScore}>Score: 8/10</Text>
                <Text style={styles.quarterText}>Strong start to the year with Jupiter's blessings. Focus on new beginnings and career initiatives.</Text>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.quarterTitle}>Q2 (Apr - Jun)</Text>
                <Text style={styles.quarterScore}>Score: 7/10</Text>
                <Text style={styles.quarterText}>Moderate progress. Watch for Mercury retrograde in May. Good time for planning, not execution.</Text>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.quarterTitle}>Q3 (Jul - Sep)</Text>
                <Text style={styles.quarterScore}>Score: 9/10</Text>
                <Text style={styles.quarterText}>Excellent period for growth. Venus transit brings harmony in relationships and financial gains.</Text>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.quarterTitle}>Q4 (Oct - Dec)</Text>
                <Text style={styles.quarterScore}>Score: 8/10</Text>
                <Text style={styles.quarterText}>Year ends on a positive note. Saturn's influence brings stability and long-term success.</Text>
              </Card.Content>
            </Card>
          </>
        )}

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
  emptySubtitle: { fontSize: 16, color: '#fff', marginTop: 5 },
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
  subtitle: { fontSize: 16, color: '#fff', marginTop: 5 },
  ratingContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 20 },
  ratingText: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  ratingLabel: { fontSize: 24, color: '#fff', marginLeft: 5 },
  card: { margin: 15 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  theme: { fontSize: 16, marginVertical: 5, color: '#4CAF50' },
  quarterTitle: { fontSize: 18, fontWeight: 'bold' },
  quarterScore: { fontSize: 14, color: '#6C3FB5', marginVertical: 5 },
  quarterText: { fontSize: 16, lineHeight: 24 },
  regenerateButton: { 
    margin: 15,
    marginBottom: 30 
  },
});
