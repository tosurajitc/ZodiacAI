import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6C3FB5', '#4A90E2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* App Icon/Logo - For now using emoji, replace with actual logo later */}
          <Text style={styles.logo}>🔮</Text>
          
          <Text style={styles.title}>ZodiacAI</Text>
          <Text style={styles.subtitle}>Your AI Astrology Companion</Text>
          
          <ActivityIndicator 
            animating={true} 
            color="#FFFFFF" 
            size="large" 
            style={styles.loader}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});