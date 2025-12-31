import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const RemediesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'gemstone', label: 'Gemstones', icon: 'diamond' },
    { id: 'mantra', label: 'Mantras', icon: 'musical-notes' },
    { id: 'ritual', label: 'Rituals', icon: 'flame' },
    { id: 'lifestyle', label: 'Lifestyle', icon: 'leaf' },
  ];

  const remedies = [
    {
      id: 1,
      category: 'gemstone',
      title: 'Blue Sapphire (Neelam)',
      planet: 'Saturn',
      description: 'Wear a 4-5 carat blue sapphire in silver ring on middle finger.',
      instructions: [
        'Purchase on Saturday during Saturn hora',
        'Energize with Saturn mantra 108 times',
        'Wear on Saturday morning after sunrise',
        'Clean weekly with milk and water',
      ],
      priority: 'High',
      color: '#3b82f6',
    },
    {
      id: 2,
      category: 'mantra',
      title: 'Shani Mantra',
      planet: 'Saturn',
      description: 'Chant Saturn mantra daily for removing obstacles.',
      instructions: [
        'Om Sham Shanicharaya Namah (108 times)',
        'Chant during Saturn hora or Saturday',
        'Face west direction while chanting',
        'Use rudraksha mala for counting',
      ],
      priority: 'High',
      color: '#8b5cf6',
    },
    {
      id: 3,
      category: 'ritual',
      title: 'Saturday Fasting',
      planet: 'Saturn',
      description: 'Observe fast on Saturdays to appease Saturn.',
      instructions: [
        'Fast from sunrise to sunset',
        'Consume only fruits and milk',
        'Donate black sesame seeds to poor',
        'Light mustard oil lamp in evening',
      ],
      priority: 'Medium',
      color: '#ec4899',
    },
    {
      id: 4,
      category: 'lifestyle',
      title: 'Color Therapy',
      planet: 'General',
      description: 'Wear favorable colors to enhance positive energies.',
      instructions: [
        'Monday: White/Cream colors',
        'Saturday: Black/Dark blue colors',
        'Thursday: Yellow/Golden colors',
        'Avoid red on Saturdays',
      ],
      priority: 'Low',
      color: '#10b981',
    },
    {
      id: 5,
      category: 'gemstone',
      title: 'Yellow Sapphire (Pukhraj)',
      planet: 'Jupiter',
      description: 'Wear a 3-4 carat yellow sapphire in gold ring on index finger.',
      instructions: [
        'Purchase on Thursday during Jupiter hora',
        'Energize with Jupiter mantra 108 times',
        'Wear on Thursday morning',
        'Clean with Ganga jal weekly',
      ],
      priority: 'Medium',
      color: '#f59e0b',
    },
    {
      id: 6,
      category: 'ritual',
      title: 'Hanuman Chalisa',
      planet: 'Mars',
      description: 'Recite Hanuman Chalisa daily for strength and courage.',
      instructions: [
        'Recite once daily in morning',
        'Face east while reciting',
        'Light a ghee lamp before Lord Hanuman',
        'Offer red flowers',
      ],
      priority: 'Medium',
      color: '#ef4444',
    },
  ];

  const filteredRemedies = selectedCategory === 'all' 
    ? remedies 
    : remedies.filter(r => r.category === selectedCategory);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Remedies</Text>
        <Text style={styles.subtitle}>Personalized solutions for you</Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons 
              name={cat.icon} 
              size={20} 
              color={selectedCategory === cat.id ? '#fff' : '#667eea'} 
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Remedies List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {filteredRemedies.map((remedy) => (
          <View key={remedy.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: remedy.color + '20' }]}>
                <Ionicons name="star" size={24} color={remedy.color} />
              </View>
              <View style={styles.headerContent}>
                <Text style={styles.cardTitle}>{remedy.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.planetText}>For: {remedy.planet}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(remedy.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(remedy.priority) }]}>
                      {remedy.priority}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.description}>{remedy.description}</Text>

            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsTitle}>How to follow:</Text>
              {remedy.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={[styles.bullet, { backgroundColor: remedy.color }]} />
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: remedy.color }]}>
              <Text style={styles.actionButtonText}>Set Reminder</Text>
              <Ionicons name="notifications" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle" size={20} color="#e0e7ff" />
          <Text style={styles.disclaimerText}>
            These remedies are suggestions based on Vedic astrology. Consult an expert astrologer before implementing any remedy.
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
    paddingBottom: 16,
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
  categoryScroll: {
    maxHeight: 60,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  categoryTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planetText: {
    fontSize: 13,
    color: '#6b7280',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  instructionsSection: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#e0e7ff',
    marginLeft: 10,
    lineHeight: 18,
  },
});

export default RemediesScreen;