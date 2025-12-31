// backend/functions/files/src/middleware/rateLimiter.js
// Rate Limiting Middleware for AstroAI Backend

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const { rateLimitResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * ========================================
 * CENTRALIZED RATE LIMIT CONFIGURATION
 * ========================================
 * Change CURRENT_MODE to switch all limits at once:
 * - 'TESTING': High limits for development
 * - 'PRODUCTION': Real limits for free/premium users
 */

const RATE_LIMIT_CONFIG = {
  // ===== TESTING MODE (Development) =====
  TESTING: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 1000,
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 1000,
    },
    kundli: {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      free: 1000,
      premium: 1000,
    },
    chat: {
      windowMs: 24 * 60 * 60 * 1000,
      free: 1000,
      premium: 1000,
    },
    horoscope: {
      windowMs: 24 * 60 * 60 * 1000,
      free: 1000,
      premium: 1000,
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000,
      maxRequests: 1000,
    },
    feedback: {
      windowMs: 24 * 60 * 60 * 1000,
      maxRequests: 1000,
    },
    upload: {
      windowMs: 60 * 60 * 1000,
      maxRequests: 1000,
    },
    strict: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000,
    },
  },

  // ===== PRODUCTION MODE (Real Limits) =====
  PRODUCTION: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5, // 5 login attempts per 15 min
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3, // 3 registrations per hour
    },
    kundli: {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      free: 1, // 1 kundli per day for free users
      premium: 10, // 10 kundli per day for premium
    },
    chat: {
      windowMs: 24 * 60 * 60 * 1000,
      free: 5, // 5 messages per day for free
      premium: 'unlimited', // No limit for premium
    },
    horoscope: {
      windowMs: 24 * 60 * 60 * 1000,
      free: 3, // 3 horoscopes per day for free
      premium: 'unlimited', // No limit for premium
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000,
      maxRequests: 3, // 3 password resets per hour
    },
    feedback: {
      windowMs: 24 * 60 * 60 * 1000,
      maxRequests: 5, // 5 feedback submissions per day
    },
    upload: {
      windowMs: 60 * 60 * 1000,
      maxRequests: 10, // 10 uploads per hour
    },
    strict: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute
    },
  },
};

// ===== CHANGE THIS TO SWITCH MODES =====
const CURRENT_MODE = 'TESTING'; // Options: 'TESTING' or 'PRODUCTION'
// =======================================

const LIMITS = RATE_LIMIT_CONFIG[CURRENT_MODE];

logger.info(`Rate limiter initialized in ${CURRENT_MODE} mode`);

/**
 * Create Redis client for rate limiting
 * Falls back to memory store if Redis is not available
 */
let redisClient = null;
let redisConnected = false;

const initializeRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return retries * 100;
          },
        },
      });

      redisClient.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        redisConnected = false;
      });

      redisClient.on('connect', () => {
        logger.info('Redis connected for rate limiting');
        redisConnected = true;
      });

      await redisClient.connect();
    }
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    redisClient = null;
  }
};

// Initialize Redis on module load
initializeRedis();

/**
 * Get store configuration
 * Returns Redis store if available, otherwise uses memory store
 */
const getStore = () => {
  if (redisClient && redisConnected) {
    return new RedisStore({
      client: redisClient,
      prefix: 'rl:',
    });
  }
  return undefined; // Use default memory store
};

/**
 * Rate limit handler
 */
const rateLimitHandler = (req, res) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    url: req.originalUrl,
    userId: req.user?.id || 'anonymous',
  });

  return rateLimitResponse(
    res,
    'Too many requests from this IP. Please try again later.'
  );
};

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: LIMITS.general.windowMs,
  max: LIMITS.general.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
  skip: (req) => {
    return req.path === '/health';
  },
});

/**
 * Auth Rate Limiter
 */
const authLimiter = rateLimit({
  windowMs: LIMITS.auth.windowMs,
  max: LIMITS.auth.maxRequests,
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
});

/**
 * Registration Rate Limiter
 */
const registerLimiter = rateLimit({
  windowMs: LIMITS.register.windowMs,
  max: LIMITS.register.maxRequests,
  message: 'Too many accounts created from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
});

/**
 * Chat Rate Limiter - Free Tier
 */
const chatLimiterFree = rateLimit({
  windowMs: LIMITS.chat.windowMs,
  max: LIMITS.chat.free,
  message: 'Daily chat limit reached. Upgrade to premium for unlimited access.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    return req.user?.subscriptionTier === 'premium' || 
           req.user?.subscriptionTier === 'enterprise';
  },
});

/**
 * Chat Rate Limiter - Premium Tier
 */
const chatLimiterPremium = rateLimit({
  windowMs: LIMITS.chat.windowMs,
  max: LIMITS.chat.premium === 'unlimited' ? 10000 : LIMITS.chat.premium,
  message: 'Hourly chat limit reached. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    return req.user?.subscriptionTier !== 'premium' && 
           req.user?.subscriptionTier !== 'enterprise';
  },
});

/**
 * Kundli Generation Rate Limiter
 */
const kundliLimiter = rateLimit({
  windowMs: LIMITS.kundli.windowMs,
  max: async (req) => {
    if (req.user?.subscriptionTier === 'premium' || 
        req.user?.subscriptionTier === 'enterprise') {
      return LIMITS.kundli.premium;
    }
    return LIMITS.kundli.free;
  },
  message: 'Daily kundli generation limit reached. Upgrade to premium for more.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});

/**
 * Horoscope Rate Limiter
 */
const horoscopeLimiter = rateLimit({
  windowMs: LIMITS.horoscope.windowMs,
  max: LIMITS.horoscope.free,
  message: 'Daily horoscope limit reached. Upgrade to premium for unlimited access.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    return req.user?.subscriptionTier === 'premium' || 
           req.user?.subscriptionTier === 'enterprise';
  },
});

/**
 * Password Reset Rate Limiter
 */
const passwordResetLimiter = rateLimit({
  windowMs: LIMITS.passwordReset.windowMs,
  max: LIMITS.passwordReset.maxRequests,
  message: 'Too many password reset attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
});

/**
 * Feedback Rate Limiter
 */
const feedbackLimiter = rateLimit({
  windowMs: LIMITS.feedback.windowMs,
  max: LIMITS.feedback.maxRequests,
  message: 'Daily feedback limit reached. Please try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});

/**
 * File Upload Rate Limiter
 */
const uploadLimiter = rateLimit({
  windowMs: LIMITS.upload.windowMs,
  max: LIMITS.upload.maxRequests,
  message: 'Upload limit reached. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});

/**
 * Strict Rate Limiter
 */
const strictLimiter = rateLimit({
  windowMs: LIMITS.strict.windowMs,
  max: LIMITS.strict.maxRequests,
  message: 'Too many requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  store: getStore(),
  handler: rateLimitHandler,
});

/**
 * Dynamic Rate Limiter
 * Adjusts limits based on user subscription tier
 */
const dynamicLimiter = (limits) => {
  return rateLimit({
    windowMs: limits.windowMs || 15 * 60 * 1000,
    max: async (req) => {
      const tier = req.user?.subscriptionTier || 'free';
      return limits[tier] || limits.free || 10;
    },
    message: limits.message || 'Rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
    store: getStore(),
    handler: rateLimitHandler,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
  });
};

/**
 * Clean up Redis connection on process exit
 */
process.on('SIGTERM', async () => {
  if (redisClient && redisConnected) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
  chatLimiterFree,
  chatLimiterPremium,
  kundliLimiter,
  horoscopeLimiter,
  passwordResetLimiter,
  feedbackLimiter,
  uploadLimiter,
  strictLimiter,
  dynamicLimiter,
};