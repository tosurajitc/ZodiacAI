import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlanetList = ({ planets, showDegrees = true, showHouse = true, showSign = true }) => {
  // Default planet data if none provided
  const defaultPlanets = [
    {
      name: 'Sun',
      sign: 'Aries',
      house: 1,
      degree: '15°24\'',
      symbol: '☉',
      color: '#f59e0b',
      strength: 'Strong',
      isRetrograde: false,
    },
    {
      name: 'Moon',
      sign: 'Cancer',
      house: 4,
      degree: '22°18\'',
      symbol: '☽',
      color: '#60a5fa',
      strength: 'Exalted',
      isRetrograde: false,
    },
    {
      name: 'Mars',
      sign: 'Gemini',
      house: 3,
      degree: '08°45\'',
      symbol: '♂',
      color: '#ef4444',
      strength: 'Neutral',
      isRetrograde: false,
    },
    {
      name: 'Mercury',
      sign: 'Aries',
      house: 1,
      degree: '18°30\'',
      symbol: '☿',
      color: '#10b981',
      strength: 'Neutral',
      isRetrograde: true,
    },
    {
      name: 'Jupiter',
      sign: 'Sagittarius',
      house: 9,
      degree: '12°54\'',
      symbol: '♃',
      color: '#f59e0b',
      strength: 'Own Sign',
      isRetrograde: false,
    },
    {
      name: 'Venus',
      sign: 'Libra',
      house: 7,
      degree: '25°12\'',
      symbol: '♀',
      color: '#ec4899',
      strength: 'Own Sign',
      isRetrograde: false,
    },
    {
      name: 'Saturn',
      sign: 'Aquarius',
      house: 11,
      degree: '05°36\'',
      symbol: '♄',
      color: '#6366f1',
      strength: 'Own Sign',
      isRetrograde: false,
    },
    {
      name: 'Rahu',
      sign: 'Pisces',
      house: 12,
      degree: '14°48\'',
      symbol: '☊',
      color: '#8b5cf6',
      strength: 'Neutral',
      isRetrograde: true,
    },
    {
      name: 'Ketu',
      sign: 'Virgo',
      house: 6,
      degree: '14°48\'',
      symbol: '☋',
      color: '#8b5cf6',
      strength: 'Neutral',
      isRetrograde: true,
    },
  ];

  const planetData = planets || defaultPlanets;

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Exalted':
      case 'Strong':
        return '#10b981';
      case 'Own Sign':
        return '#3b82f6';
      case 'Debilitated':
      case 'Weak':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planetary Positions</Text>
        <View style={styles.legendContainer}>
          <Ionicons name="refresh" size={12} color="#ef4444" />
          <Text style={styles.legendText}>= Retrograde</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {planetData.map((planet, index) => (
          <View key={index} style={styles.planetRow}>
            {/* Planet Symbol & Name */}
            <View style={styles.planetInfo}>
              <View style={[styles.symbolContainer, { backgroundColor: planet.color + '20' }]}>
                <Text style={[styles.symbol, { color: planet.color }]}>{planet.symbol}</Text>
              </View>
              <View style={styles.nameContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.planetName}>{planet.name}</Text>
                  {planet.isRetrograde && (
                    <Ionicons name="refresh" size={14} color="#ef4444" style={styles.retroIcon} />
                  )}
                </View>
                <View style={[styles.strengthBadge, { backgroundColor: getStrengthColor(planet.strength) + '20' }]}>
                  <Text style={[styles.strengthText, { color: getStrengthColor(planet.strength) }]}>
                    {planet.strength}
                  </Text>
                </View>
              </View>
            </View>

            {/* Planet Details */}
            <View style={styles.detailsContainer}>
              {showSign && (
                <View style={styles.detailItem}>
                  <Ionicons name="planet" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>{planet.sign}</Text>
                </View>
              )}
              {showHouse && (
                <View style={styles.detailItem}>
                  <Ionicons name="home" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>House {planet.house}</Text>
                </View>
              )}
              {showDegrees && (
                <View style={styles.detailItem}>
                  <Ionicons name="navigate" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>{planet.degree}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Total Planets:</Text>
          <Text style={styles.footerValue}>{planetData.length}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Retrograde:</Text>
          <Text style={styles.footerValue}>
            {planetData.filter(p => p.isRetrograde).length}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  planetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  planetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  retroIcon: {
    marginLeft: 6,
  },
  strengthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailsContainer: {
    alignItems: 'flex-end',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
});

export default PlanetList;