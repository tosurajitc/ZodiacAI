import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LifetimeAnalysisScreen = () => {
  const lifeAreas = [
    {
      id: 1,
      title: 'Career & Profession',
      icon: 'briefcase',
      score: 85,
      description: 'Strong career growth potential with leadership opportunities after age 35.',
      keyPeriods: ['2025-2028: Major promotions', '2030-2032: Business opportunities'],
      color: '#667eea',
    },
    {
      id: 2,
      title: 'Relationships & Marriage',
      icon: 'heart',
      score: 72,
      description: 'Harmonious relationships with slight delays in marriage timing.',
      keyPeriods: ['2026-2027: Marriage period', '2029+: Strong family bonds'],
      color: '#f093fb',
    },
    {
      id: 3,
      title: 'Finance & Wealth',
      icon: 'cash',
      score: 78,
      description: 'Steady wealth accumulation with multiple income sources.',
      keyPeriods: ['2025-2030: Property gains', '2032+: Investment returns'],
      color: '#4facfe',
    },
    {
      id: 4,
      title: 'Health & Wellness',
      icon: 'fitness',
      score: 68,
      description: 'Good overall health with attention needed for stress management.',
      keyPeriods: ['2025-2027: Focus on fitness', '2030+: Preventive care'],
      color: '#43e97b',
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Lifetime Analysis</Text>
          <Text style={styles.subtitle}>Your life journey predictions</Text>
        </View>

        {lifeAreas.map((area) => (
          <View key={area.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={area.icon} size={32} color={area.color} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.cardTitle}>{area.title}</Text>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.scoreText, { color: getScoreColor(area.score) }]}>
                    {area.score}%
                  </Text>
                  <Text style={styles.scoreLabelText}>Favorable</Text>
                </View>
              </View>
            </View>

            <Text style={styles.description}>{area.description}</Text>

            <View style={styles.periodsSection}>
              <Text style={styles.periodsTitle}>Key Life Periods:</Text>
              {area.keyPeriods.map((period, index) => (
                <View key={index} style={styles.periodItem}>
                  <Ionicons name="arrow-forward" size={16} color={area.color} />
                  <Text style={styles.periodText}>{period}</Text>
                </View>
              ))}
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${area.score}%`, backgroundColor: area.color }]} />
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Ionicons name="information-circle" size={20} color="#fff" />
          <Text style={styles.footerText}>
            These predictions are based on your birth chart analysis and planetary periods.
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  scoreLabelText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  periodsSection: {
    marginBottom: 16,
  },
  periodsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  periodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  periodText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#fff',
    marginLeft: 12,
    lineHeight: 18,
  },
});

export default LifetimeAnalysisScreen;