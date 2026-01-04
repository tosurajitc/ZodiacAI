import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithGoogle, signInWithFacebook } from '../../services/firebase/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const syncWithBackend = async (firebaseUser, provider) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      
      const endpoint = provider === 'google' ? '/api/auth/google' : '/api/auth/facebook';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Backend sync failed');
      }

      await AsyncStorage.setItem('@astroai_user_data', JSON.stringify(data.user));
      await AsyncStorage.setItem('@astroai_auth_token', data.token);

      console.log('User synced with backend:', data.user);
      
      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      console.error('Backend sync error:', error);
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (!result.success) {
        Alert.alert('Login Failed', result.error);
        return;
      }

      await syncWithBackend(result.user, 'google');
      
      console.log('Google login complete');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to complete login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithFacebook();
      
      if (!result.success) {
        Alert.alert('Login Failed', result.error);
        return;
      }

      await syncWithBackend(result.user, 'facebook');
      
      console.log('Facebook login complete');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to complete login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#6C3FB5', '#4A90E2']} style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="zodiac-leo" size={100} color="#fff" />
        <Text style={styles.title}>ZodiacAI</Text>
        <Text style={styles.subtitle}>Your Personal AI Astrologer</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <MaterialCommunityIcons name="google" size={24} color="#fff" />
            <Text style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.facebookButton} 
            onPress={handleFacebookSignIn}
            disabled={loading}
          >
            <MaterialCommunityIcons name="facebook" size={24} color="#fff" />
            <Text style={styles.buttonText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    gap: 10,
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4267B2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 40,
    textAlign: 'center',
  },
});
