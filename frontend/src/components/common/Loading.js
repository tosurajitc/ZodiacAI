import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Loading = ({ 
  fullscreen = false, 
  message = 'Loading...', 
  size = 'large',
  color = '#667eea',
  showMessage = true,
}) => {
  if (fullscreen) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.fullscreenContainer}>
        <View style={styles.content}>
          <ActivityIndicator size={size} color="#fff" />
          {showMessage && <Text style={styles.fullscreenText}>{message}</Text>}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {showMessage && <Text style={styles.text}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  fullscreenText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
});

export default Loading;