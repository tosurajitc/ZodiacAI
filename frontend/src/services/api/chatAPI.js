// chatAPI.js - Using fetch for React Native
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

export const chatAPI = {
  // Create new chat session
  createSession: async (userId, title = null) => {
    return apiCall('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId, title }),
    });
  },

  // Get all chat sessions for user
  getSessions: async (userId) => {
    return apiCall(`/chat/sessions/${userId}`, {
      method: 'GET',
    });
  },

  // Get specific session
  getSession: async (sessionId) => {
    return apiCall(`/chat/session/${sessionId}`, {
      method: 'GET',
    });
  },

  // Send message
  sendMessage: async (sessionId, message) => {
    return apiCall('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message }),
    });
  },

  // Get chat history
  getHistory: async (sessionId) => {
    return apiCall(`/chat/history/${sessionId}`, {
      method: 'GET',
    });
  },

  // Delete session
  deleteSession: async (sessionId) => {
    return apiCall(`/chat/session/${sessionId}`, {
      method: 'DELETE',
    });
  },

  // Update session title
  updateSessionTitle: async (sessionId, title) => {
    return apiCall(`/chat/session/${sessionId}/title`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  },

  // Get AI suggestions
  getSuggestions: async (userId) => {
    return apiCall(`/chat/suggestions/${userId}`, {
      method: 'GET',
    });
  },

  // Rate message
  rateMessage: async (messageId, rating) => {
    return apiCall(`/chat/message/${messageId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  },
};

export default chatAPI;
