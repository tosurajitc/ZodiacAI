// horoscopeAPI.js - Using fetch for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../../constants/config';

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
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
  getDailyHoroscope: async (userId, date = null) => {
    const endpoint = date 
      ? `/horoscope/daily/${userId}?date=${date}`
      : `/horoscope/daily/${userId}`;
    return apiCall(endpoint, { method: 'GET' });
  },

  // Get monthly horoscope
  getMonthlyHoroscope: async (userId, year = null, month = null) => {
    let endpoint = `/horoscope/monthly/${userId}`;
    if (year && month) {
      endpoint += `?year=${year}&month=${month}`;
    }
    return apiCall(endpoint, { method: 'GET' });
  },

  // Get yearly horoscope
  getYearlyHoroscope: async (userId, year = null) => {
    const endpoint = year
      ? `/horoscope/yearly/${userId}?year=${year}`
      : `/horoscope/yearly/${userId}`;
    return apiCall(endpoint, { method: 'GET' });
  },

  // Get lifetime analysis
  getLifetimeAnalysis: async (userId) => {
    return apiCall(`/horoscope/lifetime/${userId}`, {
      method: 'GET',
    });
  },

  // Get remedies
  getRemedies: async (userId, category = null) => {
    const endpoint = category
      ? `/horoscope/remedies/${userId}?category=${category}`
      : `/horoscope/remedies/${userId}`;
    return apiCall(endpoint, { method: 'GET' });
  },

  // Get current transits
  getCurrentTransits: async (userId) => {
    return apiCall(`/horoscope/transits/${userId}`, {
      method: 'GET',
    });
  },

  // Get predictions for specific area
  getPredictionByArea: async (userId, area) => {
    return apiCall(`/horoscope/prediction/${userId}/${area}`, {
      method: 'GET',
    });
  },

  // Generate horoscope (force regenerate)
  generateHoroscope: async (userId, type, params = {}) => {
    return apiCall('/horoscope/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, type, ...params }),
    });
  },
};

export default horoscopeAPI;