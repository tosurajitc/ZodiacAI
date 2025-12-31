import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const YearlyHoroscopeScreen = () => {
  const [selectedQuarter, setSelectedQuarter] = useState(0);

  const yearlyData = {
    year: 2025,
    overallRating: 8.2,
    keyThemes: [
      'Career advancement and recognition',
      'Financial growth through investments',
      'Relationship stability and harmony',
      'Health improvements with discipline',
    ],
    luckyMonths: ['March', 'July', 'November'],
    challengingMonths: ['April', 'September'],
  };

  const quarters = [
    {
      id: 0,
      name: 'Q1 (Jan-Mar)',
      rating: 8.5,
      color: '#10b981',
      summary: 'Strong start to the year with career opportunities',
      predictions: {
        career: 'Excellent period for job changes and promotions. Your hard work will be recognized.',
        finance: 'Steady income growth. Good time for long-term investments.',
        relationship: 'Harmonious relationships. Single? You might meet someone special.',
        health: 'Good vitality. Maintain regular exercise routine.',
      },
      keyEvents: [
        'January: New project opportunities',
        'February: Financial gains from past investments',
        'March: Important career decision',
      ],
    },
    {
      id: 1,
      name: 'Q2 (Apr-Jun)',
      rating: 6.5,
      color: '#f59e0b',
      summary: 'Mixed period requiring patience and careful planning',
      predictions: {
        career: 'Challenges at workplace. Stay focused and avoid conflicts.',
        finance: 'Control expenses. Avoid major financial commitments.',
        relationship: 'Communication is key. Minor misunderstandings possible.',
        health: 'Stress management needed. Practice meditation.',
      },
      keyEvents: [
        'April: Workplace challenges',
        'May: Financial decisions need caution',
        'June: Resolution of conflicts',
      ],
    },
    {
      id: 2,
      name: 'Q3 (Jul-Sep)',
      rating: 9.0,
      color: '#10b981',
      summary: 'Peak performance period with multiple opportunities',
      predictions: {
        career: 'Outstanding period for growth. Leadership roles likely.',
        finance: 'Unexpected financial gains. Good returns on investments.',
        relationship: 'Deepening bonds. Marriage proposals possible.',
        health: 'Excellent energy levels. Good time for fitness goals.',
      },
      keyEvents: [
        'July: Major career breakthrough',
        'August: Financial windfall',
        'September: Relationship milestone',
      ],
    },
    {
      id: 3,
      name: 'Q4 (Oct-Dec)',
      rating: 7.8,
      color: '#3b82f6',
      summary: 'Consolidation period with steady progress',
      predictions: {
        career: 'Stable growth. Focus on building skills for next year.',
        finance: 'Year-end bonuses likely. Plan for next year investments.',
        relationship: 'Family gatherings bring joy. Strengthen bonds.',
        health: 'Maintain health routines. Prevent seasonal illnesses.',
      },
      keyEvents: [
        'October: Strategic planning period',
        'November: Social recognition',
        'December: Family celebrations',
      ],
    },
  ];

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#10b981';
    if (rating >= 6) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Yearly Horoscope {yearlyData.year}</Text>
          <Text style={styles.subtitle}>Complete year analysis</Text>
        </View>

        {/* Overall Rating Card */}
        <View style={styles.overallCard}>
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Overall Year Rating</Text>
            <View style={styles.ratingDisplay}>
              <Text style={[styles.ratingNumber, { color: getRatingColor(yearlyData.overallRating) }]}>
                {yearlyData.overallRating}
              </Text>
              <Text style={styles.ratingOutOf}>/10</Text>
            </View>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(yearlyData.overallRating / 2) ? 'star' : 'star-outline'}
                  size={20}
                  color="#fbbf24"
                />
              ))}
            </View>
          </View>

          <View style={styles.themesSection}>
            <Text style={styles.sectionTitle}>Key Themes for {yearlyData.year}</Text>
            {yearlyData.keyThemes.map((theme, index) => (
              <View key={index} style={styles.themeItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.themeText}>{theme}</Text>
              </View>
            ))}
          </View>

          <View style={styles.monthsSection}>
            <View style={styles.monthsRow}>
              <View style={styles.monthsColumn}>
                <Text style={styles.monthsLabel}>Lucky Months:</Text>
                <Text style={styles.monthsText}>{yearlyData.luckyMonths.join(', ')}</Text>
              </View>
              <View style={styles.monthsColumn}>
                <Text style={styles.monthsLabel}>Be Cautious:</Text>
                <Text style={styles.monthsText}>{yearlyData.challengingMonths.join(', ')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quarter Selector */}
        <View style={styles.quarterSelector}>
          <Text style={styles.quarterSelectorTitle}>Select Quarter</Text>
          <View style={styles.quarterButtons}>
            {quarters.map((quarter) => (
              <TouchableOpacity
                key={quarter.id}
                style={[
                  styles.quarterButton,
                  selectedQuarter === quarter.id && styles.quarterButtonActive,
                  { borderColor: quarter.color },
                ]}
                onPress={() => setSelectedQuarter(quarter.id)}
              >
                <Text
                  style={[
                    styles.quarterButtonText,
                    selectedQuarter === quarter.id && styles.quarterButtonTextActive,
                  ]}
                >
                  {quarter.name}
                </Text>
                <View style={[styles.quarterRating, { backgroundColor: quarter.color + '20' }]}>
                  <Text style={[styles.quarterRatingText, { color: quarter.color }]}>
                    {quarter.rating}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quarter Details */}
        <View style={styles.quarterDetails}>
          <View style={[styles.quarterHeader, { backgroundColor: quarters[selectedQuarter].color + '20' }]}>
            <Ionicons name="calendar" size={24} color={quarters[selectedQuarter].color} />
            <View style={styles.quarterHeaderText}>
              <Text style={styles.quarterName}>{quarters[selectedQuarter].name}</Text>
              <Text style={styles.quarterSummary}>{quarters[selectedQuarter].summary}</Text>
            </View>
          </View>

          {/* Predictions by Area */}
          <View style={styles.predictionsContainer}>
            {Object.entries(quarters[selectedQuarter].predictions).map(([area, prediction]) => (
              <View key={area} style={styles.predictionCard}>
                <View style={styles.predictionHeader}>
                  <Ionicons
                    name={
                      area === 'career'
                        ? 'briefcase'
                        : area === 'finance'
                        ? 'cash'
                        : area === 'relationship'
                        ? 'heart'
                        : 'fitness'
                    }
                    size={20}
                    color={quarters[selectedQuarter].color}
                  />
                  <Text style={styles.predictionAreaTitle}>
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </Text>
                </View>
                <Text style={styles.predictionText}>{prediction}</Text>
              </View>
            ))}
          </View>

          {/* Key Events */}
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>Key Events This Quarter</Text>
            {quarters[selectedQuarter].keyEvents.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={[styles.eventDot, { backgroundColor: quarters[selectedQuarter].color }]} />
                <Text style={styles.eventText}>{event}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer Note */}
        <View style={styles.footer}>
          <Ionicons name="information-circle" size={20} color="#e0e7ff" />
          <Text style={styles.footerText}>
            These predictions are based on your birth chart and current planetary transits. Individual results may vary.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  overallCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingSection: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  ratingOutOf: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  themesSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  themeText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 10,
    flex: 1,
  },
  monthsSection: {
    paddingTop: 20,
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthsColumn: {
    flex: 1,
  },
  monthsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  monthsText: {
    fontSize: 13,
    color: '#1f2937',
  },
  quarterSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quarterSelectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  quarterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quarterButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quarterButtonActive: {
    borderWidth: 2,
  },
  quarterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 6,
  },
  quarterButtonTextActive: {
    color: '#1f2937',
  },
  quarterRating: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quarterRatingText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  quarterDetails: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quarterHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  quarterHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  quarterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  quarterSummary: {
    fontSize: 14,
    color: '#6b7280',
  },
  predictionsContainer: {
    padding: 20,
  },
  predictionCard: {
    marginBottom: 16,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionAreaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  predictionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  eventsSection: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  eventsSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  eventText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#e0e7ff',
    marginLeft: 10,
    lineHeight: 18,
  },
});

export default YearlyHoroscopeScreen;