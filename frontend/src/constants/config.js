// config.js

const config = {
  // API Configurationw
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:5000' 
    : 'https://api.zodiacai.com', // Change for production

  PYTHON_API_URL: __DEV__
    ? 'http://localhost:8000/api'
    : 'https://astrology.zodiacai.com/api',
  // App Configuration
  APP_NAME: 'ZodiacAI',
  APP_VERSION: '1.0.0',
  APP_BUILD: '001',

  // Free Tier Limits
  FREE_TIER: {
    QUESTIONS_PER_DAY: 5,
    KUNDLI_GENERATIONS: 1,
    CHAT_HISTORY_DAYS: 7,
  },

  // Premium Tier Benefits
  PREMIUM_TIER: {
    QUESTIONS_PER_DAY: 'unlimited',
    KUNDLI_GENERATIONS: 'unlimited',
    CHAT_HISTORY_DAYS: 'unlimited',
    PDF_DOWNLOADS: true,
    PRIORITY_SUPPORT: true,
    ADVANCED_PREDICTIONS: true,
  },

  // Subscription Pricing
  PRICING: {
    MONTHLY: 499, // ₹499/month
    YEARLY: 4999, // ₹4999/year (saves ₹1000)
  },

  // Firebase Collections
  FIREBASE_COLLECTIONS: {
    USERS: 'users',
    BIRTH_DETAILS: 'birthDetails',
    CHAT_SESSIONS: 'chatSessions',
    CHAT_MESSAGES: 'chatMessages',
    FEEDBACK: 'feedback',
    QUESTION_COUNTS: 'questionCounts',
    SUBSCRIPTIONS: 'subscriptions',
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    USER_DATA: '@astroai_user_data',
    AUTH_TOKEN: '@astroai_auth_token',
    BIRTH_DETAILS: '@astroai_birth_details',
    ONBOARDING_COMPLETE: '@astroai_onboarding',
    THEME: '@astroai_theme',
  },

  // Chat Configuration
  CHAT: {
    MAX_MESSAGE_LENGTH: 1000,
    TYPING_INDICATOR_DELAY: 1000, // 1 second
    MESSAGE_FETCH_LIMIT: 50,
  },

  // Astrology Configuration
  ASTROLOGY: {
    HOUSE_SYSTEM: 'Placidus', // or 'Equal'
    AYANAMSA: 'Lahiri', // Vedic standard
    CHART_TYPES: ['Rasi', 'Navamsa', 'Bhava Chalit'],
    DASHA_SYSTEM: 'Vimshottari', // 120-year cycle
  },

  // Timezone Configuration
  DEFAULT_TIMEZONE: 'Asia/Kolkata',
  DEFAULT_COUNTRY: 'India',

  // Date Formats
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',

  // API Timeouts
  TIMEOUT: {
    DEFAULT: 30000, // 30 seconds
    LONG: 60000, // 60 seconds for heavy calculations
  },

  // Error Messages
  ERROR_MESSAGES: {
    NETWORK: 'Network error. Please check your internet connection.',
    SERVER: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Session expired. Please login again.',
    RATE_LIMIT: 'Daily question limit reached. Upgrade to Premium for unlimited access.',
    VALIDATION: 'Please check your input and try again.',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    KUNDLI_GENERATED: 'Kundli generated successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    FEEDBACK_SUBMITTED: 'Thank you for your feedback!',
    LOGOUT: 'Logged out successfully!',
  },

  // Social Media Links
  SOCIAL_MEDIA: {
    FACEBOOK: 'https://facebook.com/astroai',
    INSTAGRAM: 'https://instagram.com/astroai',
    TWITTER: 'https://twitter.com/astroai',
    WEBSITE: 'https://astroai.com',
  },

  // Support
  SUPPORT: {
    EMAIL: 'support@astroai.com',
    PHONE: '+91-1234567890',
    WHATSAPP: '+91-1234567890',
  },

  // Feature Flags
  FEATURES: {
    VOICE_INPUT: false,
    DARK_MODE: true,
    NOTIFICATIONS: true,
    ANALYTICS: true,
    COMPATIBILITY_CHECK: true,
    PDF_EXPORT: true,
  },

  // External APIs
  EXTERNAL_APIS: {
    GEOCODING: 'https://nominatim.openstreetmap.org/search',
    TIMEZONE: 'http://api.timezonedb.com/v2.1/get-time-zone',
  },

  // App Store Links
  APP_STORE: {
    IOS: 'https://apps.apple.com/app/astroai',
    ANDROID: 'https://play.google.com/store/apps/details?id=com.astroai',
  },
};

export const API_BASE_URL = config.API_BASE_URL;
export const PYTHON_API_URL = config.PYTHON_API_URL;
export default config;