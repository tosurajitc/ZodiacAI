// RatingStars.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const RatingStars = ({ rating, onRatingChange, size = 32, editable = true, color = colors.warning }) => {
  const stars = [1, 2, 3, 4, 5];

  const handleStarPress = (starValue) => {
    if (editable && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleStarPress(star)}
          disabled={!editable}
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? color : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  starButton: {
    padding: spacing.xs,
  },
});

export default RatingStars;