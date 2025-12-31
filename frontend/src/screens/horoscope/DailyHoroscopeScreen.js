import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DailyHoroscopeScreen({ navigation }) {
  
  const [selectedTab, setSelectedTab] = useState('finance');

  // Mock daily horoscope data - will be from Python engine (Day 4)
  const horoscopeData = {
    date: 'Monday, 30 December 2024',
    luckyNumber: 7,
    luckyColor: 'Blue',
    luckyTime: '10:00 AM - 12:00 PM',
    score: {
      finance: 8,
      career: 7,
      relationship: 6,
      health: 9,
    },
    predictions: {
      finance: {
        title: 'Financial Outlook',
        text: 'Excellent day for financial planning! Jupiter in your 2nd house brings opportunities for income growth. Consider reviewing your investments. A past loan may get cleared. Avoid impulsive purchases in the evening. Lucky for real estate deals.',
        tips: ['Review investment portfolio', 'Consider saving opportunities', 'Good day for property deals'],
      },
      career: {
        title: 'Career & Work',
        text: 'Strong day for professional growth. Your communication skills will shine in meetings. A senior may recognize your efforts. Good time to pitch new ideas. Avoid workplace conflicts after 3 PM. Focus on team collaboration.',
        tips: ['Pitch new ideas to seniors', 'Network with colleagues', 'Complete pending tasks'],
      },
      relationship: {
        title: 'Love & Relationships',
        text: 'Mixed energies in relationships today. Morning is good for heart-to-heart conversations. Venus suggests romantic moments in the evening. Singles may meet someone interesting at work. Married couples should avoid arguments about finances.',
        tips: ['Plan quality time with partner', 'Express your feelings openly', 'Avoid financial discussions'],
      },
      health: {
        title: 'Health & Wellness',
        text: 'Excellent vitality today! Your energy levels are high. Perfect day to start a new fitness routine. Yoga and meditation will be especially beneficial. Stay hydrated. Avoid heavy meals after sunset. Mental health is positive.',
        tips: ['Start morning exercise', 'Practice meditation', 'Stay hydrated throughout day'],
      },
    },
  };

  const tabData = [
    { value: 'finance', label: 'Finance', icon: 'cash' },
    { value: 'career', label: 'Career', icon: 'briefcase' },
    { value: 'relationship', label: 'Love', icon: 'heart' },
    { value: 'health', label: 'Health', icon: 'heart-pulse' },
  ];

  const currentPrediction = horoscopeData.predictions[selectedTab];

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6C3FB5', '#4A90E2']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color="#FFFFFF" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Daily Horoscope</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <Text style={styles.dateText}>{horoscopeData.date}</Text>

        {/* Lucky Stats */}
        <View style={styles.luckyContainer}>
          <LuckyChip icon="numeric" label="Lucky #" value={horoscopeData.luckyNumber} />
          <LuckyChip icon="palette" label="Color" value={horoscopeData.luckyColor} />
          <LuckyChip icon="clock-outline" label="Time" value="10-12AM" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Score Overview Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Today's Overview</Text>
            <View style={styles.scoreContainer}>
              <ScoreBar label="Finance" score={horoscopeData.score.finance} color="#27AE60" />
              <ScoreBar label="Career" score={horoscopeData.score.career} color="#F39C12" />
              <ScoreBar label="Love" score={horoscopeData.score.relationship} color="#E74C3C" />
              <ScoreBar label="Health" score={horoscopeData.score.health} color="#4A90E2" />
            </View>
          </Card.Content>
        </Card>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={selectedTab}
            onValueChange={setSelectedTab}
            buttons={tabData}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Prediction Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.predictionHeader}>
              <MaterialCommunityIcons 
                name={tabData.find(t => t.value === selectedTab).icon} 
                size={28} 
                color="#6C3FB5" 
              />
              <Text style={styles.predictionTitle}>{currentPrediction.title}</Text>
            </View>
            
            <Text style={styles.predictionText}>{currentPrediction.text}</Text>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Today's Tips:</Text>
              {currentPrediction.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#27AE60" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Planetary Transit Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Current Planetary Transits</Text>
            <TransitRow planet="Sun" position="Sagittarius" effect="Positive" />
            <TransitRow planet="Moon" position="Pisces" effect="Neutral" />
            <TransitRow planet="Mercury" position="Capricorn" effect="Positive" />
            <TransitRow planet="Jupiter" position="Taurus" effect="Very Positive" />
          </Card.Content>
        </Card>

        {/* Feedback Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.feedbackTitle}>Was this prediction accurate?</Text>
            <View style={styles.feedbackButtons}>
              <Chip 
                icon="thumb-up" 
                onPress={() => alert('Thank you for your feedback!')}
                style={styles.feedbackChip}
              >
                Accurate
              </Chip>
              <Chip 
                icon="thumb-down" 
                onPress={() => alert('Thank you! We\'ll improve.')}
                style={styles.feedbackChip}
              >
                Not Accurate
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

// Lucky Chip Component
function LuckyChip({ icon, label, value }) {
  return (
    <View style={styles.luckyChip}>
      <MaterialCommunityIcons name={icon} size={16} color="#FFFFFF" />
      <Text style={styles.luckyLabel}>{label}</Text>
      <Text style={styles.luckyValue}>{value}</Text>
    </View>
  );
}

// Score Bar Component
function ScoreBar({ label, score, color }) {
  return (
    <View style={styles.scoreItem}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{score}/10</Text>
      </View>
      <View style={styles.scoreBarContainer}>
        <View style={[styles.scoreBarFill, { width: `${score * 10}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// Transit Row Component
function TransitRow({ planet, position, effect }) {
  const effectColor = effect === 'Very Positive' ? '#27AE60' : effect === 'Positive' ? '#4A90E2' : '#F39C12';
  
  return (
    <View style={styles.transitRow}>
      <Text style={styles.transitPlanet}>{planet}</Text>
      <Text style={styles.transitPosition}>{position}</Text>
      <Chip 
        textStyle={{ fontSize: 11 }}
        style={[styles.transitChip, { backgroundColor: effectColor }]}
      >
        {effect}
      </Chip>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  luckyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  luckyChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  luckyLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  luckyValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -10,
  },
  card: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  scoreContainer: {
    marginTop: 8,
  },
  scoreItem: {
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 14,
    color: '#6C3FB5',
    fontWeight: 'bold',
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tabContainer: {
    marginTop: 16,
  },
  segmentedButtons: {
    backgroundColor: '#FFFFFF',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
  },
  predictionText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 20,
  },
  tipsSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transitPlanet: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    width: 80,
  },
  transitPosition: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  transitChip: {
    height: 26,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  feedbackChip: {
    backgroundColor: '#E3F2FD',
  },
  bottomPadding: {
    height: 40,
  },
});