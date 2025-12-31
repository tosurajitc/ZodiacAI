// kundliAPI.js - Using fetch for React Native
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

export const kundliAPI = {
  // Generate new Kundli
  generateKundli: async (birthData) => {
    return apiCall('/api/kundli/generate', {
      method: 'POST',
      body: JSON.stringify(birthData),
    });
  },

  // Get user's Kundli
  getKundli: async (kundliId) => {
    return apiCall(`/api/kundli/${kundliId}`, {
      method: 'GET',
    });
  },

  // Get all Kundlis for user
  getUserKundlis: async () => {
    return apiCall(`/api/kundli`, {
      method: 'GET',
    });
  },

  // Update Kundli
  updateKundli: async (kundliId, updates) => {
    return apiCall(`/api/kundli/${kundliId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete Kundli
  deleteKundli: async (kundliId) => {
    return apiCall(`/api/kundli/${kundliId}`, {
      method: 'DELETE',
    });
  },

  // Download Kundli PDF
  downloadPDF: async (kundliId) => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/kundli/${kundliId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('PDF download failed');
      }

      const blob = await response.blob();
      
      return {
        success: true,
        blob,
        message: 'PDF generated successfully',
      };
    } catch (error) {
      console.error('PDF download error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Get planetary positions
  getPlanetaryPositions: async (kundliId) => {
    return apiCall(`/api/kundli/${kundliId}/planets`, {
      method: 'GET',
    });
  },

  // Get Dasha periods
  getDashaPeriods: async (kundliId) => {
    return apiCall(`/api/kundli/${kundliId}/dasha`, {
      method: 'GET',
    });
  },

  // Get house positions
  getHousePositions: async (kundliId) => {
    return apiCall(`/api/kundli/${kundliId}/houses`, {
      method: 'GET',
    });
  },

  // Get divisional charts
  getDivisionalChart: async (kundliId, chartType) => {
    return apiCall(`/api/kundli/${kundliId}/divisional/${chartType}`, {
      method: 'GET',
    });
  },

  // Get compatibility analysis
  getCompatibility: async (kundliId1, kundliId2) => {
    return apiCall(`/api/kundli/match`, {
      method: 'POST',
      body: JSON.stringify({ kundliId1, kundliId2 }),
    });
  },

  // Verify location
  verifyLocation: async (placeOfBirth) => {
    return apiCall('/api/kundli/verify-location', {
      method: 'POST',
      body: JSON.stringify({ placeOfBirth }),
    });
  },
};

export default kundliAPI;