// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local Storage Helper Functions
const storage = {
  // Save data to storage
  setItem: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return { success: true };
    } catch (error) {
      console.error('Error saving to storage:', error);
      return { success: false, error: error.message };
    }
  },

  // Get data from storage
  getItem: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  // Remove item from storage
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('Error removing from storage:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear all storage
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      return { success: true };
    } catch (error) {
      console.error('Error clearing storage:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all keys
  getAllKeys: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  // Get multiple items at once
  multiGet: async (keys) => {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result = {};
      values.forEach(([key, value]) => {
        result[key] = value ? JSON.parse(value) : null;
      });
      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  },

  // Save multiple items at once
  multiSet: async (keyValuePairs) => {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
      return { success: true };
    } catch (error) {
      console.error('Error saving multiple items:', error);
      return { success: false, error: error.message };
    }
  },

  // App-specific storage keys
  keys: {
    USER_DATA: 'user_data',
    AUTH_TOKEN: 'auth_token',
    BIRTH_DETAILS: 'birth_details',
    THEME_PREFERENCE: 'theme_preference',
    NOTIFICATION_SETTINGS: 'notification_settings',
    CHAT_HISTORY: 'chat_history',
    LAST_SYNC: 'last_sync',
    ONBOARDING_COMPLETE: 'onboarding_complete',
    QUESTION_COUNT_TODAY: 'question_count_today',
    LAST_QUESTION_DATE: 'last_question_date',
  },

  // User session helpers
  saveUserSession: async (userData) => {
    return await storage.setItem(storage.keys.USER_DATA, userData);
  },

  getUserSession: async () => {
    return await storage.getItem(storage.keys.USER_DATA);
  },

  clearUserSession: async () => {
    await storage.removeItem(storage.keys.USER_DATA);
    await storage.removeItem(storage.keys.AUTH_TOKEN);
    await storage.removeItem(storage.keys.BIRTH_DETAILS);
  },

  // Auth token helpers
  saveAuthToken: async (token) => {
    return await storage.setItem(storage.keys.AUTH_TOKEN, token);
  },

  getAuthToken: async () => {
    return await storage.getItem(storage.keys.AUTH_TOKEN);
  },

  // Birth details helpers
  saveBirthDetails: async (details) => {
    return await storage.setItem(storage.keys.BIRTH_DETAILS, details);
  },

  getBirthDetails: async () => {
    return await storage.getItem(storage.keys.BIRTH_DETAILS);
  },

  // Question count helpers (for rate limiting)
  saveQuestionCount: async (count) => {
    const today = new Date().toISOString().split('T')[0];
    await storage.setItem(storage.keys.LAST_QUESTION_DATE, today);
    return await storage.setItem(storage.keys.QUESTION_COUNT_TODAY, count);
  },

  getQuestionCount: async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = await storage.getItem(storage.keys.LAST_QUESTION_DATE);
    
    // Reset count if it's a new day
    if (lastDate !== today) {
      await storage.saveQuestionCount(0);
      return 0;
    }
    
    const count = await storage.getItem(storage.keys.QUESTION_COUNT_TODAY);
    return count || 0;
  },

  incrementQuestionCount: async () => {
    const currentCount = await storage.getQuestionCount();
    const newCount = currentCount + 1;
    await storage.saveQuestionCount(newCount);
    return newCount;
  },
};

export default storage;