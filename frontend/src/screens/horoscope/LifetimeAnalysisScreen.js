// frontend/src/screens/horoscope/LifetimeAnalysisScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/common/Header';
import BirthDetailsModal from '../../components/common/BirthDetailsModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function LifetimeAnalysisScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lifetimeData, setLifetimeData] = useState(null);

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@astroai_auth_token');

      const response = await fetch(
        `${API_BASE_URL}/api/horoscope/lifetime`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setLifetimeData(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to generate analysis');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load lifetime analysis');
    } finally {
      setLoading(false);
    }
  };

  // Empty State
  if (!lifetimeData && !loading) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} />
        
        <BirthDetailsModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={generateAnalysis}
          purpose="analysis"
        />
        
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <LinearGradient colors={['#6C3FB5', '#4A90E2']} style={styles.emptyHeader}>
            <Text style={styles.emptyTitle}>Lifetime Analysis</Text>
            <Text style={styles.emptySubtitle}>Your complete life journey</Text>
          </LinearGradient>

          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="infinity" size={80} color="#6C3FB5" />
            <Text style={styles.emptyText}>
              Lifetime analysis: A lifetime analysis provides a comprehensive astrological overview of your entire life journey from birth to the present and beyond. It examines your natal chart deeply to reveal your life purpose, karmic patterns, soul lessons, and destined path. The analysis covers all major life phases including childhood influences, career trajectory, relationship patterns, spiritual growth, and dharma. It includes detailed interpretations of planetary periods (dashas), major transits, and their impact on your life's timeline, offering insights into past challenges, current opportunities, and future potentials.
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
          <Text style={styles.loadingText}>Generating your lifetime analysis...</Text>
          <Text style={styles.loadingSubtext}>This may take a moment...</Text>
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
          <MaterialCommunityIcons name="infinity" size={60} color="#fff" />
          <Text style={styles.title}>Lifetime Analysis</Text>
          <Text style={styles.subtitle}>Your complete life journey</Text>
        </LinearGradient>

        {/* Life Purpose */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="target" size={28} color="#6C3FB5" />
              <Text style={styles.cardTitle}>Life Purpose & Dharma</Text>
            </View>
            <Text style={styles.cardText}>
              {lifetimeData?.life_purpose || 
              'Your soul\'s journey is to become a leader and guide for others. Your dharma involves teaching, mentoring, and sharing wisdom gained through life experiences. You are meant to inspire transformation in people\'s lives through your authentic expression and spiritual insights.'}
            </Text>
          </Card.Content>
        </Card>

        {/* Karmic Patterns */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="sync" size={28} color="#E91E63" />
              <Text style={styles.cardTitle}>Karmic Patterns</Text>
            </View>
            <Text style={styles.cardText}>
              {lifetimeData?.karmic_patterns || 
              'Past life karma influences your current relationships and material pursuits. Focus on balancing giving and receiving, learning boundaries, and developing self-worth independent of external validation. Your soul is working through lessons of trust and surrender.'}
            </Text>
          </Card.Content>
        </Card>

        {/* Life Phases */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="timeline" size={28} color="#FF9800" />
              <Text style={styles.cardTitle}>Major Life Phases</Text>
            </View>
            
            <View style={styles.phaseContainer}>
              <Text style={styles.phaseTitle}>Ages 0-28: Foundation Phase</Text>
              <Text style={styles.phaseText}>
                {lifetimeData?.phase_1 || 
                'Early years shaped by Saturn and Jupiter. Learning fundamental life lessons, building character, and discovering talents. Focus on education and personal development.'}
              </Text>
            </View>

            <View style={styles.phaseContainer}>
              <Text style={styles.phaseTitle}>Ages 29-42: Growth Phase</Text>
              <Text style={styles.phaseText}>
                {lifetimeData?.phase_2 || 
                'Period of expansion and achievement. Career advancement, relationship commitments, and material success. Saturn return brings maturity and life redirection.'}
              </Text>
            </View>

            <View style={styles.phaseContainer}>
              <Text style={styles.phaseTitle}>Ages 43-60: Mastery Phase</Text>
              <Text style={styles.phaseText}>
                {lifetimeData?.phase_3 || 
                'Time of wisdom and leadership. Sharing knowledge with others, mentoring, and contributing to society. Peak of professional and personal influence.'}
              </Text>
            </View>

            <View style={styles.phaseContainer}>
              <Text style={styles.phaseTitle}>Ages 60+: Wisdom Phase</Text>
              <Text style={styles.phaseText}>
                {lifetimeData?.phase_4 || 
                'Spiritual deepening and reflection. Legacy building, simplification, and preparing for the next journey. Focus shifts to inner peace and transcendence.'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Soul Lessons */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="school" size={28} color="#9C27B0" />
              <Text style={styles.cardTitle}>Key Soul Lessons</Text>
            </View>
            <Text style={styles.lessonItem}>• Developing emotional resilience and inner strength</Text>
            <Text style={styles.lessonItem}>• Learning to trust divine timing and surrender control</Text>
            <Text style={styles.lessonItem}>• Balancing material success with spiritual growth</Text>
            <Text style={styles.lessonItem}>• Cultivating authentic relationships and vulnerability</Text>
            <Text style={styles.lessonItem}>• Finding purpose beyond personal achievement</Text>
          </Card.Content>
        </Card>

        {/* Dasha Periods */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={28} color="#4CAF50" />
              <Text style={styles.cardTitle}>Planetary Periods (Dashas)</Text>
            </View>
            <Text style={styles.cardText}>
              {lifetimeData?.dasha_overview || 
              'Your current life is influenced by a sequence of planetary periods. Each planet rules different aspects of your life for specific durations, creating natural cycles of growth, challenge, and transformation. Understanding these periods helps you align with cosmic timing.'}
            </Text>
          </Card.Content>
        </Card>

        {/* Future Potential */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="crystal-ball" size={28} color="#2196F3" />
              <Text style={styles.cardTitle}>Future Potential</Text>
            </View>
            <Text style={styles.cardText}>
              {lifetimeData?.future_potential || 
              'Your chart shows immense potential for spiritual leadership and creative expression. Upcoming Jupiter transits will bring opportunities for expansion in teaching, writing, or consulting. Trust your intuition and embrace your authentic voice. The universe supports your highest purpose.'}
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
    alignItems: 'center',
    padding: 40 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#7F8C8D' 
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#BDC3C7',
    fontStyle: 'italic'
  },

  // Main Content
  header: { padding: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  subtitle: { fontSize: 16, color: '#fff', marginTop: 5 },
  card: { margin: 15, elevation: 2 },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    gap: 10 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: 'bold',
    flex: 1 
  },
  cardText: { 
    fontSize: 16, 
    lineHeight: 24,
    color: '#2C3E50' 
  },
  phaseContainer: { 
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  phaseTitle: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#6C3FB5',
    marginBottom: 8 
  },
  phaseText: { 
    fontSize: 14, 
    lineHeight: 22,
    color: '#34495E' 
  },
  lessonItem: { 
    fontSize: 15, 
    lineHeight: 26,
    color: '#2C3E50' 
  },
  regenerateButton: { 
    margin: 15,
    marginBottom: 30 
  },
});
