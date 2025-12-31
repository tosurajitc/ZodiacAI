import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HoroscopeCard = ({
  title,
  prediction,
  score,
  icon,
  color,
  onPress,
  showReadMore = true,
  expanded = false,
  style,
}) => {
  const getScoreColor = (score) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    if (score >= 4) return '#ef4444';
    return '#9ca3af';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Challenging';
  };

  const scoreColor = score ? getScoreColor(score) : color || '#667eea';
  const truncatedText = prediction?.length > 120 && !expanded 
    ? prediction.substring(0, 120) + '...' 
    : prediction;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[color + '15' || '#667eea15', color + '05' || '#667eea05']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' || '#667eea20' }]}>
            <Ionicons name={icon || 'star'} size={24} color={color || '#667eea'} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{title}</Text>
            {score && (
              <View style={styles.scoreContainer}>
                <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20' }]}>
                  <Text style={[styles.scoreText, { color: scoreColor }]}>
                    {score}/10
                  </Text>
                </View>
                <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                  {getScoreLabel(score)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Prediction Text */}
        {prediction && (
          <Text style={styles.prediction}>{truncatedText}</Text>
        )}

        {/* Read More Button */}
        {showReadMore && prediction?.length > 120 && (
          <View style={styles.footer}>
            <Text style={[styles.readMore, { color: color || '#667eea' }]}>
              {expanded ? 'Read Less' : 'Read More'}
            </Text>
            <Ionicons 
              name={expanded ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={color || '#667eea'} 
            />
          </View>
        )}

        {/* Progress Bar (if score available) */}
        {score && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${score * 10}%`, backgroundColor: scoreColor }
                ]} 
              />
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  prediction: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default HoroscopeCard;