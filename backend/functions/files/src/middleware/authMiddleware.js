// backend/functions/files/src/middleware/authMiddleware.js
// Authentication Middleware for AstroAI Backend

const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase'); // Use our Firebase config
const { unauthorizedResponse, forbiddenResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Firebase is already initialized in config/firebase.js

/**
 * Verify JWT Token Middleware
 * Validates JWT token from Authorization header
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No token provided in request', {
        ip: req.ip,
        url: req.originalUrl,
      });
      return unauthorizedResponse(res, 'No token provided. Please log in');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      subscriptionTier: decoded.subscriptionTier || 'free',
    };

    logger.logAuth('Token verified', decoded.id, true);
    next();
  } catch (error) {
    logger.logAuth('Token verification failed', 'unknown', false, {
      error: error.message,
    });

    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token expired. Please log in again');
    }

    if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Invalid token. Please log in again');
    }

    return unauthorizedResponse(res, 'Authentication failed');
  }
};

/**
 * Verify Firebase Token Middleware
 * Validates Firebase ID token from Authorization header
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No Firebase token provided in request', {
        ip: req.ip,
        url: req.originalUrl,
      });
      return unauthorizedResponse(res, 'No token provided. Please log in');
    }

    const token = authHeader.split(' ')[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user info to request
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      firebaseUser: decodedToken,
    };

    logger.logAuth('Firebase token verified', decodedToken.uid, true);
    next();
  } catch (error) {
    logger.logAuth('Firebase token verification failed', 'unknown', false, {
      error: error.message,
    });

    if (error.code === 'auth/id-token-expired') {
      return unauthorizedResponse(res, 'Token expired. Please log in again');
    }

    if (error.code === 'auth/argument-error') {
      return unauthorizedResponse(res, 'Invalid token format');
    }

    return unauthorizedResponse(res, 'Authentication failed');
  }
};

/**
 * Optional Authentication Middleware
 * Does not fail if no token is provided, but verifies if present
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      subscriptionTier: decoded.subscriptionTier || 'free',
    };

    next();
  } catch (error) {
    // Token invalid, continue without authentication
    req.user = null;
    next();
  }
};

/**
 * Check Subscription Tier Middleware
 * Ensures user has required subscription tier
 */
const requireSubscription = (requiredTier) => {
  return (req, res, next) => {
    const subscriptionHierarchy = {
      free: 0,
      basic: 1,
      premium: 2,
      enterprise: 3,
    };

    const userTier = req.user?.subscriptionTier || 'free';
    const userLevel = subscriptionHierarchy[userTier] || 0;
    const requiredLevel = subscriptionHierarchy[requiredTier] || 0;

    if (userLevel < requiredLevel) {
      logger.logAuth('Subscription check failed', req.user?.id, false, {
        userTier,
        requiredTier,
      });
      return forbiddenResponse(
        res,
        `This feature requires ${requiredTier} subscription or higher`
      );
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    logger.logAuth('Admin access denied', req.user?.id, false);
    return forbiddenResponse(res, 'Admin access required');
  }

  next();
};

/**
 * Check if user owns the resource
 * Compares req.user.id with req.params.userId or req.body.userId
 */
const requireOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;

  if (!resourceUserId) {
    return forbiddenResponse(res, 'User ID not found in request');
  }

  if (req.user.id !== resourceUserId && !req.user.isAdmin) {
    logger.logAuth('Ownership check failed', req.user.id, false, {
      resourceUserId,
    });
    return forbiddenResponse(res, 'You do not have access to this resource');
  }

  next();
};

/**
 * Refresh Token Middleware
 * Validates refresh token and issues new access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return unauthorizedResponse(res, 'Refresh token required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        subscriptionTier: decoded.subscriptionTier,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    req.newAccessToken = accessToken;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      subscriptionTier: decoded.subscriptionTier,
    };

    logger.logAuth('Token refreshed', decoded.id, true);
    next();
  } catch (error) {
    logger.logAuth('Token refresh failed', 'unknown', false, {
      error: error.message,
    });

    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Refresh token expired. Please log in again');
    }

    return unauthorizedResponse(res, 'Invalid refresh token');
  }
};

module.exports = {
  verifyToken,
  verifyFirebaseToken,
  optionalAuth,
  requireSubscription,
  requireAdmin,
  requireOwnership,
  refreshToken,
};