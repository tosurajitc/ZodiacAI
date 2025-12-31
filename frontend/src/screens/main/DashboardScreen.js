import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {
  
  // ✅ Real user data from AsyncStorage
  const [userData, setUserData] = useState({
    name: 'Loading...',
    hasKundli: true,
    birthDetails: {
      date: '15 Aug 1992',
      time: '10:30 AM',
      place: 'Bangalore, India',
    },
    sunSign: 'Leo ♌',
    moonSign: 'Taurus ♉',
    ascendant: 'Virgo ♍',
  });

  // ✅ Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@astroai_user_data');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(prev => ({
            ...prev,
            name: user.name || 'User',
            email: user.email
          }));
          console.log('Dashboard loaded user:', user.name);
        }
      } catch (error) {
        console.error('Error loading user data in dashboard:', error);
      }
    };

    loadUserData();
  }, []);

  const handleViewKundli = () => {
    navigation.navigate('KundliView');
  };

  const handleCreateKundli = () => {
    navigation.navigate('BirthDetails');
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6C3FB5', '#4A90E2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Namaste 🙏</Text>
            <Text style={styles.userName}>{userData.name}</Text>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Info Cards */}
        {userData.hasKundli && (
          <View style={styles.quickInfoContainer}>
            <QuickInfoChip icon="zodiac-leo" label={userData.sunSign} />
            <QuickInfoChip icon="moon-waning-crescent" label={userData.moonSign} />
            <QuickInfoChip icon="arrow-up-circle" label={userData.ascendant} />
          </View>
        )}
      </LinearGradient>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Kundli Card */}
        {!userData.hasKundli ? (
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="chart-arc" size={40} color="#6C3FB5" />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Create Your Kundli</Text>
                  <Text style={styles.cardSubtitle}>Get started with your birth chart</Text>
                </View>
              </View>
              <Button 
                mode="contained" 
                onPress={handleCreateKundli}
                style={styles.primaryButton}
              >
                Create Kundli
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="chart-arc" size={40} color="#6C3FB5" />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Your Kundli</Text>
                  <Text style={styles.cardSubtitle}>
                    {userData.birthDetails.date} • {userData.birthDetails.time}
                  </Text>
                </View>
              </View>
              <Button 
                mode="outlined" 
                onPress={handleViewKundli}
                style={styles.outlinedButton}
              >
                View Kundli
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Today's Horoscope */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="calendar-today" size={24} color="#6C3FB5" />
              <Text style={styles.sectionTitle}>Today's Horoscope</Text>
            </View>
            <Divider style={styles.divider} />
            <Text style={styles.horoscopeText}>
              Today is a favorable day for career advancement. Jupiter's position suggests 
              new opportunities may arise. Stay focused and trust your instincts.
            </Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('DailyHoroscope')}
              style={styles.textButton}
            >
              Read Full Horoscope
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            icon="calendar-month"
            title="Monthly"
            subtitle="Horoscope"
            color="#E74C3C"
            onPress={() => navigation.navigate('MonthlyHoroscope')}
          />
          <QuickActionCard
            icon="calendar-star"
            title="Yearly"
            subtitle="Horoscope"
            color="#27AE60"
            onPress={() => navigation.navigate('YearlyHoroscope')}
          />
        </View>

        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            icon="infinity"
            title="Lifetime"
            subtitle="Analysis"
            color="#F39C12"
            onPress={() => navigation.navigate('LifetimeAnalysis')}
          />
          <QuickActionCard
            icon="meditation"
            title="Remedies"
            subtitle="& Solutions"
            color="#9B59B6"
            onPress={() => navigation.navigate('Remedies')}
          />
        </View>

        {/* AI Chat Prompt */}
        <Card style={[styles.card, styles.chatPromptCard]} elevation={2}>
          <Card.Content>
            <View style={styles.chatPrompt}>
              <MaterialCommunityIcons name="robot" size={32} color="#6C3FB5" />
              <View style={styles.chatPromptText}>
                <Text style={styles.chatPromptTitle}>Ask AI Astrologer</Text>
                <Text style={styles.chatPromptSubtitle}>
                  Get instant answers to your questions
                </Text>
              </View>
            </View>
            <Button 
              mode="contained" 
              icon="chat"
              onPress={() => navigation.navigate('Chat')}
              style={styles.primaryButton}
            >
              Start Chat
            </Button>
          </Card.Content>
        </Card>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

// Quick Info Chip Component
function QuickInfoChip({ icon, label }) {
  return (
    <View style={styles.quickInfoChip}>
      <MaterialCommunityIcons name={icon} size={16} color="#FFFFFF" />
      <Text style={styles.quickInfoLabel}>{label}</Text>
    </View>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon, title, subtitle, color, onPress }) {
  return (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  quickInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickInfoLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 12,
  },
  horoscopeText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 12,
  },
  primaryButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  outlinedButton: {
    borderRadius: 8,
    marginTop: 8,
    borderColor: '#6C3FB5',
  },
  textButton: {
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 2,
  },
  chatPromptCard: {
    marginTop: 16,
  },
  chatPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatPromptText: {
    marginLeft: 12,
    flex: 1,
  },
  chatPromptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  chatPromptSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  bottomPadding: {
    height: 20,
  },
});