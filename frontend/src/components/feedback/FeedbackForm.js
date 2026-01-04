// FeedbackForm.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import Button from '../common/Button';
import RatingStars from './RatingStars';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { FEEDBACK_CATEGORIES } from '../../constants/constants';
import validation from '../../services/utils/validation';
import firestoreDB from '../../services/firebase/firestore';

const FeedbackForm = ({ userId, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // Validate feedback
    const feedbackData = {
      rating,
      category: selectedCategory,
      message,
    };

    const validationResult = validation.validateFeedback(feedbackData);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a feedback category');
      return;
    }

    setLoading(true);

    try {
      // Save feedback to Firestore
      await firestoreDB.saveFeedback({
        userId,
        rating,
        category: selectedCategory,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Thank you for your feedback!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setRating(0);
            setSelectedCategory(null);
            setMessage('');
            setErrors({});

            if (onSubmitSuccess) {
              onSubmitSuccess();
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Rating Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Rate Your Experience</Text>
        <RatingStars rating={rating} onRatingChange={setRating} size={40} />
        {errors.rating && <Text style={styles.errorText}>{errors.rating}</Text>}
      </View>

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Feedback Category</Text>
        <View style={styles.categoryContainer}>
          {FEEDBACK_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              title={`${category.icon} ${category.name}`}
              onPress={() => setSelectedCategory(category.name)}
              variant={selectedCategory === category.name ? 'primary' : 'outline'}
              style={styles.categoryButton}
            />
          ))}
        </View>
      </View>

      {/* Message Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Your Feedback</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Share your thoughts, suggestions, or report issues..."
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>{message.length}/500</Text>
        {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
      </View>

      {/* Submit Button */}
      <Button
        title={loading ? 'Submitting...' : 'Submit Feedback'}
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submitButton}
      />

      {/* Privacy Note */}
      <Text style={styles.privacyNote}>
        Your feedback helps us improve AstroAI. We respect your privacy and will never share your feedback publicly.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenHorizontal,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.h6,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radiusMedium,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    minHeight: 120,
  },
  characterCount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  privacyNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default FeedbackForm;
