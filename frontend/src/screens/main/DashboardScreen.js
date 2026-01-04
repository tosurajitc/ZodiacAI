// frontend/src/screens/main/DashboardScreen.js - REDESIGNED CLEAN LAYOUT
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/common/Header';
import DashboardFooter from '../../components/common/DashboardFooter';
import BirthDetailsModal from '../../components/common/BirthDetailsModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Data states
  const [todayPanchang, setTodayPanchang] = useState(null);
  const [luckyElements, setLuckyElements] = useState(null);
  const [todayInsight, setTodayInsight] = useState(null);
  const [currentDasha, setCurrentDasha] = useState(null);
  const [doshaAlerts, setDoshaAlerts] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  const quickAIQuestions = [
    { id: 1, icon: '🎯', question: 'When will I get promoted?' },
    { id: 2, icon: '💰', question: 'Best time to invest money?' },
    { id: 3, icon: '❤️', question: 'Will I find love this year?' },
    { id: 4, icon: '🏠', question: 'Should I buy property now?' }
  ];

  const navigationMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'view-dashboard', screen: 'Dashboard' },
    { id: 'kundli', label: 'Your Kundli', icon: 'chart-box', screen: 'KundliView' },
    { id: 'daily', label: 'Daily Horoscope', icon: 'crystal-ball', screen: 'DailyHoroscope' },
    { id: 'monthly', label: 'Monthly Horoscope', icon: 'calendar-month', screen: 'MonthlyHoroscope' },
    { id: 'yearly', label: 'Yearly Horoscope', icon: 'calendar-star', screen: 'YearlyHoroscope' },
    { id: 'lifetime', label: 'Lifetime Analysis', icon: 'infinity', screen: 'LifetimeAnalysis' },
    { id: 'matching', label: 'Kundli Matching', icon: 'heart-multiple', screen: 'KundliMatching' },
    { id: 'remedies', label: 'Remedies', icon: 'meditation', screen: 'Remedies' },
    { id: 'chat', label: 'AI Astrologer', icon: 'robot', screen: 'Chat' },
    { id: 'profile', label: 'Profile', icon: 'account', screen: 'Profile' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@astroai_auth_token');
      
      await Promise.all([
        fetchPanchang(token),
        fetchLuckyElements(token),
        fetchTodayInsight(token),
        fetchCurrentDasha(token),
        fetchDoshaAlerts(token),
        fetchUpcomingEvents(token)
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const fetchPanchang = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/panchang/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTodayPanchang(data.data);
      }
    } catch (error) {
      setTodayPanchang({
        tithi: 'Ashtami',
        paksha: 'Krishna Paksha',
        nakshatra: 'Rohini',
        yoga: 'Shukla',
        karana: 'Bava',
        sunrise: '6:24 AM',
        sunset: '5:48 PM',
        rahu_kaal: '3:00 PM - 4:30 PM',
        abhijit_muhurat: '11:54 AM - 12:42 PM'
      });
    }
  };

  const fetchLuckyElements = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lucky-elements/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLuckyElements(data.data);
      }
    } catch (error) {
      setLuckyElements({
        color: 'Green',
        colorCode: '#4CAF50',
        numbers: [3, 7, 12],
        direction: 'East',
        gemstone: 'Emerald',
        time: '9 AM - 11 AM',
        day: 'Wednesday'
      });
    }
  };

  const fetchTodayInsight = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/insights/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTodayInsight(data.data);
      }
    } catch (error) {
      setTodayInsight({
        text: 'With Mars in your 7th house, focus on partnerships today. Avoid conflicts in relationships and maintain harmony. Jupiter\'s aspect brings opportunities in career.',
        mood: 'positive',
        advice: 'Stay calm and patient'
      });
    }
  };

  const fetchCurrentDasha = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dasha/current`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentDasha(data.data);
      }
    } catch (error) {
      setCurrentDasha({
        mahadasha: 'Venus',
        antardasha: 'Jupiter',
        pratyantardasha: 'Moon',
        remaining: '2 years 4 months',
        endDate: '15 May 2027'
      });
    }
  };

  const fetchDoshaAlerts = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doshas/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data.hasDosha) {
        setDoshaAlerts(data.data);
      }
    } catch (error) {
      setDoshaAlerts({
        hasDosha: true,
        doshas: [
          { name: 'Mangal Dosha', severity: 'medium', house: '7th house' }
        ]
      });
    }
  };

  const fetchUpcomingEvents = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/upcoming`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUpcomingEvents(data.data);
      }
    } catch (error) {
      setUpcomingEvents([
        { date: 'Jan 15', event: 'Full Moon (Purnima)', icon: '🌕' },
        { date: 'Jan 18', event: 'Mercury Retrograde', icon: '⚠️' },
        { date: 'Jan 25', event: 'Saturn Transit', icon: '🪐' }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C3FB5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Component */}
      <Header navigation={navigation} onMenuPress={() => setDrawerVisible(true)} />

      {/* Hamburger Drawer */}
      {drawerVisible && (
        <View style={styles.drawerOverlay}>
          <TouchableOpacity 
            style={styles.drawerBackdrop} 
            onPress={() => setDrawerVisible(false)}
          />
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <MaterialCommunityIcons name="close" size={24} color="#2C3E50" onPress={() => setDrawerVisible(false)} />
            </View>
            <ScrollView style={styles.drawerMenu}>
              {navigationMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setDrawerVisible(false);
                    navigation.navigate(item.screen);
                  }}
                >
                  <MaterialCommunityIcons name={item.icon} size={22} color="#6C3FB5" />
                  <Text style={styles.drawerMenuText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C3FB5']} />
        }
      >
        {/* ROW 1: Panchang | Lucky Elements | Today's Insight (3 Columns) */}
        <View style={isWeb ? styles.threeColumnRow : styles.singleColumn}>
          {/* Panchang Card */}
          <Card style={isWeb ? styles.columnCard : styles.fullWidthCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="calendar-star" size={24} color="#6C3FB5" />
                <Text style={styles.cardTitle}>Today's Panchang</Text>
              </View>
              <Divider style={styles.divider} />
              {todayPanchang && (
                <>
                  <InfoRow label="Tithi" value={`${todayPanchang.tithi} (${todayPanchang.paksha})`} />
                  <InfoRow label="Nakshatra" value={todayPanchang.nakshatra} />
                  <InfoRow label="Sunrise" value={todayPanchang.sunrise} icon="weather-sunny" />
                  <InfoRow label="Sunset" value={todayPanchang.sunset} icon="weather-night" />
                  <View style={styles.muhuratBox}>
                    <Text style={styles.muhuratGood}>✅ Abhijit: {todayPanchang.abhijit_muhurat}</Text>
                    <Text style={styles.muhuratBad}>⚠️ Rahu Kaal: {todayPanchang.rahu_kaal}</Text>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>

          {/* Lucky Elements Card */}
          <Card style={isWeb ? styles.columnCard : styles.fullWidthCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="clover" size={24} color="#4CAF50" />
                <Text style={styles.cardTitle}>Lucky Elements</Text>
              </View>
              <Divider style={styles.divider} />
              {luckyElements && (
                <>
                  <InfoRow 
                    label="Color" 
                    value={luckyElements.color}
                    valueStyle={{ color: luckyElements.colorCode, fontWeight: 'bold' }}
                  />
                  <InfoRow label="Numbers" value={luckyElements.numbers.join(', ')} />
                  <InfoRow label="Direction" value={luckyElements.direction} icon="compass" />
                  <InfoRow label="Gemstone" value={luckyElements.gemstone} icon="diamond" />
                  <InfoRow label="Best Time" value={luckyElements.time} icon="clock-outline" />
                </>
              )}
            </Card.Content>
          </Card>

          {/* Today's Insight Card */}
          <Card style={isWeb ? styles.columnCard : styles.fullWidthCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFA726" />
                <Text style={styles.cardTitle}>Today's Insight</Text>
              </View>
              <Divider style={styles.divider} />
              {todayInsight && (
                <>
                  <Text style={styles.insightText}>{todayInsight.text}</Text>
                  <Button 
                    mode="text" 
                    onPress={() => navigation.navigate('Chat')}
                    style={styles.linkButton}
                    compact
                  >
                    Ask AI for Details →
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        </View>

        {/* ROW 2: Your Kundli | Today's Horoscope (2 Columns) */}
        <View style={isWeb ? styles.twoColumnRow : styles.singleColumn}>
          {/* Kundli Card */}
          <Card style={isWeb ? styles.halfCard : styles.fullWidthCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="chart-box" size={24} color="#6C3FB5" />
                <Text style={styles.cardTitle}>Your Kundli</Text>
              </View>
              <Divider style={styles.divider} />
              <Text style={styles.birthDetails}>15 Aug 1992 • 10:30 AM</Text>
              <Text style={styles.birthPlace}>Bangalore, Karnataka</Text>
              <View style={styles.buttonRow}>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('KundliView')}
                  style={styles.centeredButton}
                  buttonColor="#6C3FB5"
                  compact
                >
                  View Chart
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => setShowModal(true)}
                  style={styles.centeredButton}
                  buttonColor="#6C3FB5"
                  compact
                >
                  Update
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Horoscope Card */}
          <Card style={isWeb ? styles.halfCard : styles.fullWidthCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="crystal-ball" size={24} color="#9C27B0" />
                <Text style={styles.cardTitle}>Today's Horoscope</Text>
              </View>
              <Divider style={styles.divider} />
              <Text style={styles.horoscopeText}>
                Career looks promising with Jupiter's favorable transit. Financial gains expected. 
                Relationships need attention.
              </Text>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('DailyHoroscope')}
                style={styles.linkButton}
                compact
              >
                Read Full Prediction →
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* ROW 3: Current Dasha | Dosha Alerts (2 Columns) */}
        <View style={isWeb ? styles.twoColumnRow : styles.singleColumn}>
          {/* Dasha Card */}
          <Card style={isWeb ? styles.halfCard : styles.fullWidthCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#FF6B35" />
                <Text style={styles.cardTitle}>Current Dasha Period</Text>
              </View>
              <Divider style={styles.divider} />
              {currentDasha && (
                <>
                  <View style={styles.dashaRow}>
                    <Text style={styles.dashaLabel}>Mahadasha:</Text>
                    <Chip style={styles.dashaChip}>{currentDasha.mahadasha}</Chip>
                  </View>
                  <View style={styles.dashaRow}>
                    <Text style={styles.dashaLabel}>Antardasha:</Text>
                    <Chip style={styles.dashaChip}>{currentDasha.antardasha}</Chip>
                  </View>
                  <Text style={styles.dashaRemaining}>⏳ {currentDasha.remaining} remaining</Text>
                </>
              )}
            </Card.Content>
          </Card>

          {/* Dosha Alert Card */}
          {doshaAlerts?.hasDosha && (
            <Card style={[isWeb ? styles.halfCard : styles.fullWidthCard, styles.doshaCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="alert-circle" size={24} color="#E74C3C" />
                  <Text style={styles.cardTitle}>Dosha Alert</Text>
                </View>
                <Divider style={styles.divider} />
                {doshaAlerts.doshas.map((dosha, index) => (
                  <View key={index} style={styles.doshaItem}>
                    <Text style={styles.doshaName}>🔴 {dosha.name}</Text>
                    <Text style={styles.doshaHouse}>Located in {dosha.house}</Text>
                  </View>
                ))}
                <View style={styles.buttonContainer}>
                  <Button 
                    mode="contained" 
                    onPress={() => navigation.navigate('Remedies')}
                    style={styles.centeredButton}
                    buttonColor="#6C3FB5"
                    compact
                  >
                    View Remedies
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* ROW 4: Horoscope Grid (2x2) */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="star-four-points" size={24} color="#6C3FB5" />
          <Text style={styles.sectionHeaderTitle}>Horoscope Reports</Text>
        </View>

        <View style={isWeb ? styles.twoColumnRow : styles.singleColumn}>
          <TouchableOpacity 
            style={[styles.gridCard, { backgroundColor: '#FFE5E5' }]}
            onPress={() => navigation.navigate('MonthlyHoroscope')}
          >
            <MaterialCommunityIcons name="calendar-month" size={40} color="#6C3FB5" />
            <Text style={styles.gridTitle}>Monthly Horoscope</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridCard, { backgroundColor: '#E5F5E5' }]}
            onPress={() => navigation.navigate('YearlyHoroscope')}
          >
            <MaterialCommunityIcons name="calendar-star" size={40} color="#6C3FB5" />
            <Text style={styles.gridTitle}>Yearly Horoscope</Text>
          </TouchableOpacity>
        </View>

        <View style={isWeb ? styles.twoColumnRow : styles.singleColumn}>
          <TouchableOpacity 
            style={[styles.gridCard, { backgroundColor: '#FFF3E5' }]}
            onPress={() => navigation.navigate('LifetimeAnalysis')}
          >
            <MaterialCommunityIcons name="infinity" size={40} color="#6C3FB5" />
            <Text style={styles.gridTitle}>Lifetime Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridCard, { backgroundColor: '#F3E5F5' }]}
            onPress={() => navigation.navigate('Remedies')}
          >
            <MaterialCommunityIcons name="meditation" size={40} color="#6C3FB5" />
            <Text style={styles.gridTitle}>Remedies & Solutions</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Component */}
        <DashboardFooter 
          navigation={navigation} 
          quickQuestions={quickAIQuestions}
          upcomingEvents={upcomingEvents}
        />
      </ScrollView>

      {/* Birth Details Modal */}
      <BirthDetailsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false);
          onRefresh();
        }}
        purpose="update"
      />
    </View>
  );
}

// Helper Component
function InfoRow({ label, value, icon, valueStyle }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        {icon && <MaterialCommunityIcons name={icon} size={16} color="#7F8C8D" style={{ marginRight: 4 }} />}
        <Text style={styles.infoLabelText}>{label}:</Text>
      </View>
      <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  
  // Layout Styles
  threeColumnRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  singleColumn: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  columnCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  halfCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  fullWidthCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  
  // Card Styles
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 12,
  },
  
  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabelText: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  
  // Panchang
  muhuratBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  muhuratGood: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
    marginBottom: 4,
  },
  muhuratBad: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '500',
  },
  
  // Insight
  insightText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    marginBottom: 8,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  
  // Kundli
  birthDetails: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 4,
  },
  birthPlace: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  centeredButton: {
    minWidth: 120,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  
  // Horoscope
  horoscopeText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  // Dasha
  dashaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dashaLabel: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  dashaChip: {
    backgroundColor: '#E3F2FD',
  },
  dashaRemaining: {
    fontSize: 12,
    color: '#6C3FB5',
    marginTop: 4,
  },
  
  // Dosha
  doshaCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  doshaItem: {
    marginBottom: 10,
  },
  doshaName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 2,
  },
  doshaHouse: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  
  // Grid Cards
  gridCard: {
    flex: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 2,
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    textAlign: 'center',
  },
  
  // Drawer
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#fff',
    elevation: 16,
  },
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  drawerMenu: {
    flex: 1,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  drawerMenuText: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
  },
});
