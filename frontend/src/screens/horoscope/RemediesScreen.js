// frontend/src/screens/horoscope/RemediesScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Button, Chip, List } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/common/Header';
import BirthDetailsModal from '../../components/common/BirthDetailsModal';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function RemediesScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [remediesData, setRemediesData] = useState(null);

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const generateRemedies = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@astroai_auth_token');

      const response = await fetch(
        `${API_BASE_URL}/api/horoscope/remedies`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setRemediesData(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to generate remedies');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load remedies');
    } finally {
      setLoading(false);
    }
  };

  // Empty State
  if (!remediesData && !loading) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} />
        
        <BirthDetailsModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={generateRemedies}
          purpose="remedies"
        />
        
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <LinearGradient colors={['#6C3FB5', '#4A90E2']} style={styles.emptyHeader}>
            <Text style={styles.emptyTitle}>Astrological Remedies</Text>
            <Text style={styles.emptySubtitle}>Personalized solutions for harmony</Text>
          </LinearGradient>

          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="meditation" size={80} color="#6C3FB5" />
            <Text style={styles.emptyText}>
              Astrological remedies are time-tested Vedic solutions designed to strengthen beneficial planetary influences and mitigate challenging ones in your birth chart. These include gemstone recommendations, mantras, fasting days, charitable acts, yantras, and lifestyle adjustments tailored to your unique planetary positions. Remedies help balance cosmic energies, remove obstacles, attract positive opportunities, and accelerate spiritual growth. They work by aligning your actions with favorable planetary vibrations, enhancing overall well-being across health, wealth, relationships, and career.
            </Text>
            <Button 
              mode="contained" 
              onPress={handleGenerateClick}
              style={styles.generateButton}
              icon="star"
            >
              Generate Remedies
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
          <Text style={styles.loadingText}>Generating your personalized remedies...</Text>
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
          <MaterialCommunityIcons name="meditation" size={50} color="#fff" />
          <Text style={styles.title}>Astrological Remedies</Text>
          <Text style={styles.subtitle}>Personalized solutions for balance</Text>
        </LinearGradient>

        {/* Gemstone Recommendations */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="diamond-stone" size={28} color="#E91E63" />
              <Text style={styles.cardTitle}>Gemstone Recommendations</Text>
            </View>
            {(remediesData?.gemstones || [
              { name: 'Ruby', planet: 'Sun', benefit: 'Enhances confidence, vitality, and leadership', weight: '5-7 carats', metal: 'Gold', finger: 'Ring finger', day: 'Sunday' },
              { name: 'Pearl', planet: 'Moon', benefit: 'Calms mind, improves emotional balance', weight: '4-6 carats', metal: 'Silver', finger: 'Little finger', day: 'Monday' },
            ]).map((gem, index) => (
              <View key={index} style={styles.gemstoneCard}>
                <View style={styles.gemstoneHeader}>
                  <View>
                    <Text style={styles.gemstoneName}>{gem.name}</Text>
                    <Text style={styles.gemstonePlanet}>For {gem.planet}</Text>
                  </View>
                  <Chip style={styles.gemstoneChip}>{gem.weight}</Chip>
                </View>
                <Text style={styles.gemstoneBenefit}>✨ {gem.benefit}</Text>
                <View style={styles.gemstoneDetails}>
                  <Text style={styles.gemstoneDetail}>Metal: {gem.metal}</Text>
                  <Text style={styles.gemstoneDetail}>Finger: {gem.finger}</Text>
                  <Text style={styles.gemstoneDetail}>Wear on: {gem.day}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.note}>
              ⚠️ Consult an expert astrologer before wearing gemstones
            </Text>
          </Card.Content>
        </Card>

        {/* Mantras */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="music-note" size={28} color="#FF9800" />
              <Text style={styles.cardTitle}>Powerful Mantras</Text>
            </View>
            {(remediesData?.mantras || [
              { planet: 'Sun', mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah', count: '7000 times in 40 days', benefit: 'Strengthens Sun, improves health and authority' },
              { planet: 'Moon', mantra: 'Om Shram Shreem Shraum Sah Chandraya Namah', count: '11000 times in 40 days', benefit: 'Calms mind, enhances emotional stability' },
            ]).map((mantra, index) => (
              <View key={index} style={styles.mantraCard}>
                <View style={styles.mantraHeader}>
                  <Text style={styles.mantraPlanet}>{mantra.planet} Mantra</Text>
                </View>
                <Text style={styles.mantraText}>{mantra.mantra}</Text>
                <View style={styles.mantraDetails}>
                  <MaterialCommunityIcons name="counter" size={16} color="#7F8C8D" />
                  <Text style={styles.mantraCount}>{mantra.count}</Text>
                </View>
                <Text style={styles.mantraBenefit}>🌟 {mantra.benefit}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Fasting Days */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="weather-night" size={28} color="#9C27B0" />
              <Text style={styles.cardTitle}>Recommended Fasts</Text>
            </View>
            {(remediesData?.fasts || [
              { day: 'Sunday', planet: 'Sun', benefit: 'Boosts vitality and success', food: 'Wheat, jaggery, red foods' },
              { day: 'Monday', planet: 'Moon', benefit: 'Mental peace and emotional balance', food: 'White rice, milk, white foods' },
              { day: 'Saturday', planet: 'Saturn', benefit: 'Reduces obstacles and delays', food: 'Sesame, black gram, simple meals' },
            ]).map((fast, index) => (
              <View key={index} style={styles.fastCard}>
                <View style={styles.fastHeader}>
                  <View>
                    <Text style={styles.fastDay}>{fast.day}</Text>
                    <Text style={styles.fastPlanet}>For {fast.planet}</Text>
                  </View>
                </View>
                <Text style={styles.fastBenefit}>🙏 {fast.benefit}</Text>
                <Text style={styles.fastFood}>Food: {fast.food}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Charity & Donations */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="hand-heart" size={28} color="#4CAF50" />
              <Text style={styles.cardTitle}>Charitable Acts</Text>
            </View>
            {(remediesData?.charity || [
              { planet: 'Sun', items: 'Red clothes, wheat, jaggery, copper', day: 'Sunday', benefit: 'Strengthens authority and health' },
              { planet: 'Saturn', items: 'Black clothes, iron, oil, footwear', day: 'Saturday', benefit: 'Removes obstacles and karmic debts' },
              { planet: 'Jupiter', items: 'Yellow clothes, books, turmeric, gold', day: 'Thursday', benefit: 'Attracts wealth and wisdom' },
            ]).map((charity, index) => (
              <View key={index} style={styles.charityCard}>
                <View style={styles.charityHeader}>
                  <Text style={styles.charityPlanet}>For {charity.planet}</Text>
                  <Chip style={styles.charityChip}>{charity.day}</Chip>
                </View>
                <Text style={styles.charityItems}>Donate: {charity.items}</Text>
                <Text style={styles.charityBenefit}>💫 {charity.benefit}</Text>
              </View>
            ))}
            <Text style={styles.note}>
              💝 Donate to the needy with pure intentions
            </Text>
          </Card.Content>
        </Card>

        {/* Yantra Recommendations */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="grid" size={28} color="#2196F3" />
              <Text style={styles.cardTitle}>Yantras for Protection</Text>
            </View>
            {(remediesData?.yantras || [
              { name: 'Sri Yantra', benefit: 'Prosperity, abundance, divine blessings', placement: 'Worship room or office', material: 'Copper or Gold' },
              { name: 'Navgraha Yantra', benefit: 'Balances all planetary energies', placement: 'Main entrance or worship room', material: 'Copper' },
            ]).map((yantra, index) => (
              <View key={index} style={styles.yantraCard}>
                <Text style={styles.yantraName}>{yantra.name}</Text>
                <Text style={styles.yantraBenefit}>🔮 {yantra.benefit}</Text>
                <View style={styles.yantraDetails}>
                  <Text style={styles.yantraDetail}>Material: {yantra.material}</Text>
                  <Text style={styles.yantraDetail}>Place: {yantra.placement}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Lifestyle Adjustments */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="yoga" size={28} color="#00BCD4" />
              <Text style={styles.cardTitle}>Lifestyle Tips</Text>
            </View>
            <List.Section>
              {(remediesData?.lifestyle || [
                'Wake up early during Brahma Muhurta (4-6 AM) for meditation',
                'Practice Surya Namaskar daily for Sun strength',
                'Offer water to Sun every morning facing east',
                'Respect elders and teachers for Jupiter blessings',
                'Feed cows and crows regularly for ancestral peace',
                'Plant trees and care for plants for environmental harmony',
                'Practice gratitude and kindness daily',
              ]).map((tip, index) => (
                <List.Item
                  key={index}
                  title={tip}
                  titleNumberOfLines={3}
                  left={props => <List.Icon {...props} icon="check-circle" color="#4CAF50" />}
                  style={styles.lifestyleItem}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>

        <Button 
          mode="outlined" 
          onPress={handleGenerateClick}
          style={styles.regenerateButton}
          icon="refresh"
        >
          Regenerate Remedies
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#fff', marginTop: 5 },
  card: { margin: 15 },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    gap: 10 
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  note: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4
  },

  // Gemstone Card
  gemstoneCard: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12
  },
  gemstoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  gemstoneName: { fontSize: 18, fontWeight: 'bold', color: '#E91E63' },
  gemstonePlanet: { fontSize: 13, color: '#7F8C8D', marginTop: 2 },
  gemstoneChip: { backgroundColor: '#FCE4EC' },
  gemstoneBenefit: { 
    fontSize: 14, 
    color: '#2C3E50', 
    marginBottom: 10,
    lineHeight: 20 
  },
  gemstoneDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  gemstoneDetail: { fontSize: 12, color: '#7F8C8D' },

  // Mantra Card
  mantraCard: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12
  },
  mantraHeader: { marginBottom: 8 },
  mantraPlanet: { fontSize: 16, fontWeight: 'bold', color: '#FF9800' },
  mantraText: {
    fontSize: 15,
    color: '#2C3E50',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 22
  },
  mantraDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  mantraCount: { fontSize: 13, color: '#7F8C8D' },
  mantraBenefit: { fontSize: 13, color: '#34495E', lineHeight: 19 },

  // Fast Card
  fastCard: {
    backgroundColor: '#F3E5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12
  },
  fastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  fastDay: { fontSize: 16, fontWeight: 'bold', color: '#9C27B0' },
  fastPlanet: { fontSize: 13, color: '#7F8C8D', marginTop: 2 },
  fastBenefit: { fontSize: 14, color: '#2C3E50', marginBottom: 6 },
  fastFood: { fontSize: 13, color: '#7F8C8D', fontStyle: 'italic' },

  // Charity Card
  charityCard: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12
  },
  charityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  charityPlanet: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  charityChip: { backgroundColor: '#C8E6C9' },
  charityItems: { 
    fontSize: 14, 
    color: '#2C3E50', 
    marginBottom: 6,
    fontWeight: '500' 
  },
  charityBenefit: { fontSize: 13, color: '#34495E' },

  // Yantra Card
  yantraCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12
  },
  yantraName: { fontSize: 16, fontWeight: 'bold', color: '#2196F3', marginBottom: 6 },
  yantraBenefit: { fontSize: 14, color: '#2C3E50', marginBottom: 8 },
  yantraDetails: { flexDirection: 'row', gap: 15 },
  yantraDetail: { fontSize: 12, color: '#7F8C8D' },

  // Lifestyle
  lifestyleItem: { paddingVertical: 4 },

  regenerateButton: { 
    margin: 15,
    marginBottom: 30 
  },
});
