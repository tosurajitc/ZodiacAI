import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MonthlyHoroscopeScreen({ navigation }) {
  
  // Mock monthly horoscope - will be from Python engine
  const monthlyData = {
    month: 'January 2025',
    overview: 'This month brings significant opportunities for growth and transformation. Jupiter\'s transit through your career house indicates professional advancement. Focus on building long-term relationships and financial planning.',
    areas: [
      {
        icon: 'cash',
        title: 'Finance',
        color: '#27AE60',
        text: 'Strong financial growth expected. First two weeks are excellent for investments. Property deals may finalize mid-month. Avoid speculative investments after 20th. Monthly income may increase by 15-20%.',
      },
      {
        icon: 'briefcase',
        title: 'Career',
        color: '#F39C12',
        text: 'Career takes center stage this month. Promotion or recognition likely between 10th-20th. New projects bring visibility. Job seekers will find opportunities after 15th. Avoid workplace conflicts during Mercury retrograde (5th-18th).',
      },
      {
        icon: 'heart',
        title: 'Relationship',
        color: '#E74C3C',
        text: 'Mixed month for relationships. Singles may meet someone special around 12th. Married couples should focus on communication. Venus retrograde may bring past issues to surface. Plan romantic outing on 25th.',
      },
      {
        icon: 'heart-pulse',
        title: 'Health',
        color: '#4A90E2',
        text: 'Generally positive health. Minor digestive issues possible in first week. Start new fitness routine after 8th. Mental health remains stable. Practice stress management techniques. Stay hydrated throughout.',
      },
    ],
    keyDates: [
      { date: '5-8 Jan', event: 'Important career decisions', type: 'career' },
      { date: '12 Jan', event: 'Romantic opportunity', type: 'love' },
      { date: '15-20 Jan', event: 'Financial gains', type: 'finance' },
      { date: '25 Jan', event: 'Family celebration', type: 'family' },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6C3FB5', '#4A90E2']} style={styles.header}>
        <View style={styles.headerTop}>
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color="#FFFFFF" 
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Monthly Horoscope</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.monthText}>{monthlyData.month}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Overview Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.overviewTitle}>Monthly Overview</Text>
            <Text style={styles.overviewText}>{monthlyData.overview}</Text>
          </Card.Content>
        </Card>

        {/* Area Cards */}
        {monthlyData.areas.map((area, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.areaHeader}>
                <View style={[styles.areaIcon, { backgroundColor: area.color }]}>
                  <MaterialCommunityIcons name={area.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.areaTitle}>{area.title}</Text>
              </View>
              <Text style={styles.areaText}>{area.text}</Text>
            </Card.Content>
          </Card>
        ))}

        {/* Key Dates */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🗓️ Important Dates</Text>
            {monthlyData.keyDates.map((item, index) => (
              <View key={index} style={styles.keyDateItem}>
                <Text style={styles.keyDateDate}>{item.date}</Text>
                <Text style={styles.keyDateEvent}>{item.event}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  monthText: { fontSize: 18, color: '#FFFFFF', textAlign: 'center', opacity: 0.9 },
  content: { flex: 1, paddingHorizontal: 20, marginTop: -10 },
  card: { marginTop: 16, borderRadius: 12, elevation: 2 },
  overviewTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  overviewText: { fontSize: 15, color: '#2C3E50', lineHeight: 24 },
  areaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  areaIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  areaTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginLeft: 12 },
  areaText: { fontSize: 14, color: '#2C3E50', lineHeight: 22 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 16 },
  keyDateItem: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  keyDateDate: { fontSize: 14, fontWeight: 'bold', color: '#6C3FB5', width: 100 },
  keyDateEvent: { fontSize: 14, color: '#2C3E50', flex: 1 },
  bottomPadding: { height: 40 },
});