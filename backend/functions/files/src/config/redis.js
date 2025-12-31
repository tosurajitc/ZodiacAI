// backend/functions/files/src/config/redis.js
// Redis Configuration for Caching and Session Management

const redis = require('redis');
const logger = require('../utils/logger');
require('dotenv').config();

// Redis configuration based on environment
const redisConfig = {
  development: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
  },
  test: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 1, // Use different DB for testing
  },
  production: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';
const config = redisConfig[env];

// Create Redis client
const redisClient = redis.createClient({
  socket: {
    host: config.host,
    port: config.port,
    tls: config.tls,
  },
  password: config.password,
  database: config.db,
  legacyMode: false,
});

// Redis event handlers
redisClient.on('connect', () => {
  logger.info('✅ Redis client connecting...');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client connected and ready');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis client error:', err.message);
});

redisClient.on('end', () => {
  logger.info('Redis client connection closed');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('✅ Redis connection established successfully');
    }
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to Redis:', error.message);
    throw error;
  }
};

// Close Redis connection
const closeRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error.message);
    throw error;
  }
};

// Helper functions for common Redis operations

/**
 * Set a key-value pair in Redis with optional expiration
 * @param {string} key - Redis key
 * @param {any} value - Value to store (will be JSON stringified)
 * @param {number} expiryInSeconds - Optional expiry time in seconds
 */
const setCache = async (key, value, expiryInSeconds = null) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (expiryInSeconds) {
      await redisClient.setEx(key, expiryInSeconds, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
    
    logger.debug(`Cache set: ${key}`);
    return true;
  } catch (error) {
    logger.error(`Error setting cache for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Get a value from Redis by key
 * @param {string} key - Redis key
 * @returns {any} Parsed value or null
 */
const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as string if not JSON
    }
  } catch (error) {
    logger.error(`Error getting cache for key ${key}:`, error.message);
    return null;
  }
};

/**
 * Delete a key from Redis
 * @param {string} key - Redis key
 */
const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    logger.debug(`Cache deleted: ${key}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting cache for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Redis key pattern (e.g., "user:*")
 */
const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.debug(`Cache pattern deleted: ${pattern} (${keys.length} keys)`);
    }
    return true;
  } catch (error) {
    logger.error(`Error deleting cache pattern ${pattern}:`, error.message);
    return false;
  }
};

/**
 * Check if a key exists in Redis
 * @param {string} key - Redis key
 */
const existsCache = async (key) => {
  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error(`Error checking cache existence for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Set expiration time for a key
 * @param {string} key - Redis key
 * @param {number} seconds - Expiry time in seconds
 */
const expireCache = async (key, seconds) => {
  try {
    await redisClient.expire(key, seconds);
    logger.debug(`Cache expiry set: ${key} (${seconds}s)`);
    return true;
  } catch (error) {
    logger.error(`Error setting cache expiry for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Increment a counter in Redis
 * @param {string} key - Redis key
 * @param {number} increment - Amount to increment (default: 1)
 */
const incrementCache = async (key, increment = 1) => {
  try {
    const value = await redisClient.incrBy(key, increment);
    return value;
  } catch (error) {
    logger.error(`Error incrementing cache for key ${key}:`, error.message);
    return null;
  }
};

/**
 * Get remaining time to live for a key
 * @param {string} key - Redis key
 * @returns {number} TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
 */
const getTTL = async (key) => {
  try {
    const ttl = await redisClient.ttl(key);
    return ttl;
  } catch (error) {
    logger.error(`Error getting TTL for key ${key}:`, error.message);
    return -2;
  }
};

// Export Redis client and helper functions
module.exports = {
  redisClient,
  connectRedis,
  closeRedis,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  existsCache,
  expireCache,
  incrementCache,
  getTTL
};