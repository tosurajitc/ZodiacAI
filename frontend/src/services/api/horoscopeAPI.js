// horoscopeAPI.js - Using fetch for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../../constants/config';

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('@astroai_auth_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const apiCall = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const horoscopeAPI = {
  // Get daily horoscope
  getDailyHoroscope: async () => {
    return apiCall('/api/horoscope/daily', { method: 'GET' });
  },

  // Get weekly horoscope
  getWeeklyHoroscope: async () => {
    return apiCall('/api/horoscope/weekly', { method: 'GET' });
  },

  // Get monthly horoscope
  getMonthlyHoroscope: async () => {
    return apiCall('/api/horoscope/monthly', { method: 'GET' });
  },

  // Get yearly horoscope
  getYearlyHoroscope: async () => {
    return apiCall('/api/horoscope/yearly', { method: 'GET' });
  },

  // Get lifetime analysis
  getLifetimeAnalysis: async () => {
    return apiCall('/api/horoscope/lifetime', { method: 'GET' });
  },

  // Get remedies
  getRemedies: async () => {
    return apiCall('/api/horoscope/remedies', { method: 'GET' });
  },

  // Get current transits
  getCurrentTransits: async () => {
    return apiCall('/api/horoscope/transits', { method: 'GET' });
  },

  // Get current dasha
  getCurrentDasha: async () => {
    return apiCall('/api/horoscope/dasha', { method: 'GET' });
  },

  // Get career predictions
  getCareerPredictions: async () => {
    return apiCall('/api/horoscope/career', { method: 'GET' });
  },

  // Get relationship predictions
  getRelationshipPredictions: async () => {
    return apiCall('/api/horoscope/relationships', { method: 'GET' });
  },

  // Get health predictions
  getHealthPredictions: async () => {
    return apiCall('/api/horoscope/health', { method: 'GET' });
  },

  // Get finance predictions
  getFinancePredictions: async () => {
    return apiCall('/api/horoscope/finance', { method: 'GET' });
  },

  // Generate custom horoscope
  generateHoroscope: async (type, params = {}) => {
    return apiCall('/api/horoscope/generate', {
      method: 'POST',
      body: JSON.stringify({ type, ...params }),
    });
  },
};

export default horoscopeAPI;