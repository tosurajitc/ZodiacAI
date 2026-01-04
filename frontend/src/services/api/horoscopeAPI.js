// frontend/src/services/api/horoscopeAPI.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/config';

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('@astroai_auth_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function for API calls
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
  // Get Daily Horoscope
  getDailyHoroscope: async ({ date } = {}) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return apiCall(`/api/horoscope/daily?date=${targetDate}`, {
      method: 'GET',
    });
  },

  // Get Weekly Horoscope
  getWeeklyHoroscope: async ({ startDate } = {}) => {
    const queryParams = startDate ? `?startDate=${startDate}` : '';
    return apiCall(`/api/horoscope/weekly${queryParams}`, {
      method: 'GET',
    });
  },

  // Get Monthly Horoscope
  getMonthlyHoroscope: async ({ month, year } = {}) => {
    const now = new Date();
    const targetMonth = month || (now.getMonth() + 1);
    const targetYear = year || now.getFullYear();
    
    return apiCall(`/api/horoscope/monthly?month=${targetMonth}&year=${targetYear}`, {
      method: 'GET',
    });
  },

  // Get Yearly Horoscope
  getYearlyHoroscope: async ({ year } = {}) => {
    const targetYear = year || new Date().getFullYear();
    return apiCall(`/api/horoscope/yearly?year=${targetYear}`, {
      method: 'GET',
    });
  },

  // Get Lifetime Analysis
  getLifetimeAnalysis: async () => {
    return apiCall('/api/horoscope/lifetime', {
      method: 'GET',
    });
  },

  // Get Horoscope by Category
  getHoroscopeByCategory: async ({ type, category, date } = {}) => {
    const queryParams = new URLSearchParams({
      ...(type && { type }),
      ...(category && { category }),
      ...(date && { date }),
    }).toString();

    return apiCall(`/api/horoscope/category?${queryParams}`, {
      method: 'GET',
    });
  },

  // Get Current Transits
  getCurrentTransits: async () => {
    return apiCall('/api/horoscope/transits/current', {
      method: 'GET',
    });
  },

  // Get Transit Predictions
  getTransitPredictions: async ({ startDate, endDate } = {}) => {
    const queryParams = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }).toString();

    return apiCall(`/api/horoscope/transits?${queryParams}`, {
      method: 'GET',
    });
  },

  // Get Dasha Predictions
  getDashaPredictions: async () => {
    return apiCall('/api/horoscope/dasha', {
      method: 'GET',
    });
  },

  // Get Compatibility Analysis
  getCompatibility: async (partnerData) => {
    return apiCall('/api/horoscope/compatibility', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    });
  },

  // Get Remedies
  getRemedies: async ({ category, severity } = {}) => {
    const queryParams = new URLSearchParams({
      ...(category && { category }),
      ...(severity && { severity }),
    }).toString();

    return apiCall(`/api/horoscope/remedies?${queryParams}`, {
      method: 'GET',
    });
  },

  // Submit Horoscope Feedback
  submitFeedback: async (feedbackData) => {
    return apiCall('/api/horoscope/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  // Get Horoscope History
  getHoroscopeHistory: async ({ type, limit = 10, offset = 0 } = {}) => {
    const queryParams = new URLSearchParams({
      ...(type && { type }),
      limit: limit.toString(),
      offset: offset.toString(),
    }).toString();

    return apiCall(`/api/horoscope/history?${queryParams}`, {
      method: 'GET',
    });
  },

  // Get Auspicious Times (Muhurat)
  getAuspiciousTimes: async ({ date, activity } = {}) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const queryParams = new URLSearchParams({
      date: targetDate,
      ...(activity && { activity }),
    }).toString();

    return apiCall(`/api/horoscope/muhurat?${queryParams}`, {
      method: 'GET',
    });
  },

  // Get Personalized Predictions
  getPersonalizedPrediction: async ({ question, category } = {}) => {
    return apiCall('/api/horoscope/personalized', {
      method: 'POST',
      body: JSON.stringify({ question, category }),
    });
  },

  // Regenerate Horoscope
  regenerateHoroscope: async ({ type, date } = {}) => {
    return apiCall('/api/horoscope/regenerate', {
      method: 'POST',
      body: JSON.stringify({ type, date }),
    });
  },

  // Get Horoscope Summary
  getHoroscopeSummary: async ({ period = 'week' } = {}) => {
    return apiCall(`/api/horoscope/summary?period=${period}`, {
      method: 'GET',
    });
  },

  // Share Horoscope
  shareHoroscope: async ({ horoscopeId, platform } = {}) => {
    return apiCall('/api/horoscope/share', {
      method: 'POST',
      body: JSON.stringify({ horoscopeId, platform }),
    });
  },

  // Download Horoscope PDF
  downloadHoroscopePDF: async ({ type, date } = {}) => {
    try {
      const token = await getAuthToken();
      const queryParams = new URLSearchParams({
        type,
        ...(date && { date }),
      }).toString();

      const response = await fetch(
        `${API_BASE_URL}/api/horoscope/download/pdf?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('PDF download failed');
      }

      const blob = await response.blob();
      
      return {
        success: true,
        blob,
        message: 'Horoscope PDF generated successfully',
      };
    } catch (error) {
      console.error('Error downloading horoscope PDF:', error);
      throw error;
    }
  },

  // Get Horoscope Notifications Settings
  getNotificationSettings: async () => {
    return apiCall('/api/horoscope/notifications/settings', {
      method: 'GET',
    });
  },

  // Update Horoscope Notifications Settings
  updateNotificationSettings: async (settings) => {
    return apiCall('/api/horoscope/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Get Zodiac Sign Info
  getZodiacSignInfo: async ({ sign } = {}) => {
    const queryParams = sign ? `?sign=${sign}` : '';
    return apiCall(`/api/horoscope/zodiac${queryParams}`, {
      method: 'GET',
    });
  },

  // Get Planet Positions
  getPlanetPositions: async ({ date } = {}) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return apiCall(`/api/horoscope/planets?date=${targetDate}`, {
      method: 'GET',
    });
  },

  // Get House Analysis
  getHouseAnalysis: async ({ house } = {}) => {
    const queryParams = house ? `?house=${house}` : '';
    return apiCall(`/api/horoscope/houses${queryParams}`, {
      method: 'GET',
    });
  },
};

export default horoscopeAPI;
