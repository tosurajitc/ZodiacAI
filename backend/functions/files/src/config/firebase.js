// backend/functions/files/src/config/firebase.js
// Firebase Admin SDK Configuration

const admin = require('firebase-admin');
const logger = require('../utils/logger');
require('dotenv').config();

// Firebase configuration
let firebaseApp;

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (firebaseApp) {
      logger.info('Firebase Admin SDK already initialized');
      return firebaseApp;
    }

    // Get service account from environment variable or file
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // If service account is provided as JSON string in env variable
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        logger.info('Using Firebase service account from environment variable');
      } catch (error) {
        logger.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
        throw new Error('Invalid Firebase service account JSON in environment variable');
      }
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // If service account path is provided
      try {
        serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        logger.info('Using Firebase service account from file path');
      } catch (error) {
        logger.error('Error loading Firebase service account file:', error.message);
        throw new Error('Firebase service account file not found');
      }
    } else {
      // For local development, try default path
      try {
        serviceAccount = require('../../../firebase-service-account.json');
        logger.info('Using Firebase service account from default path');
      } catch (error) {
        logger.warn('No Firebase service account found. Using application default credentials.');
      }
    }

    // Initialize Firebase Admin
    if (serviceAccount) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Use application default credentials (for Google Cloud deployment)
      firebaseApp = admin.initializeApp({
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    logger.info('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;

  } catch (error) {
    logger.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    throw error;
  }
};

// Initialize Firebase on module load
initializeFirebase();

// Get Firebase Auth instance
const getAuth = () => {
  return admin.auth();
};

// Get Firestore instance
const getFirestore = () => {
  return admin.firestore();
};

// Get Firebase Storage instance
const getStorage = () => {
  return admin.storage();
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Object} Decoded token
 */
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Error verifying Firebase ID token:', error.message);
    throw new Error('Invalid or expired token');
  }
};

/**
 * Create custom token for user
 * @param {string} uid - User ID
 * @param {Object} additionalClaims - Optional custom claims
 * @returns {string} Custom token
 */
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    logger.error('Error creating custom token:', error.message);
    throw error;
  }
};

/**
 * Get user by UID
 * @param {string} uid - User ID
 * @returns {Object} User record
 */
const getUserByUid = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    logger.error('Error getting user by UID:', error.message);
    throw error;
  }
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Object} User record
 */
const getUserByEmail = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    logger.error('Error getting user by email:', error.message);
    throw error;
  }
};

/**
 * Update user
 * @param {string} uid - User ID
 * @param {Object} properties - Properties to update
 * @returns {Object} Updated user record
 */
const updateUser = async (uid, properties) => {
  try {
    const updatedUser = await admin.auth().updateUser(uid, properties);
    return updatedUser;
  } catch (error) {
    logger.error('Error updating user:', error.message);
    throw error;
  }
};

/**
 * Delete user
 * @param {string} uid - User ID
 */
const deleteUser = async (uid) => {
  try {
    await admin.auth().deleteUser(uid);
    logger.info(`User deleted: ${uid}`);
    return true;
  } catch (error) {
    logger.error('Error deleting user:', error.message);
    throw error;
  }
};

/**
 * Set custom user claims
 * @param {string} uid - User ID
 * @param {Object} customClaims - Custom claims object
 */
const setCustomUserClaims = async (uid, customClaims) => {
  try {
    await admin.auth().setCustomUserClaims(uid, customClaims);
    logger.info(`Custom claims set for user: ${uid}`);
    return true;
  } catch (error) {
    logger.error('Error setting custom claims:', error.message);
    throw error;
  }
};

/**
 * Revoke refresh tokens for user
 * @param {string} uid - User ID
 */
const revokeRefreshTokens = async (uid) => {
  try {
    await admin.auth().revokeRefreshTokens(uid);
    logger.info(`Refresh tokens revoked for user: ${uid}`);
    return true;
  } catch (error) {
    logger.error('Error revoking refresh tokens:', error.message);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 */
const generatePasswordResetLink = async (email) => {
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    return link;
  } catch (error) {
    logger.error('Error generating password reset link:', error.message);
    throw error;
  }
};

/**
 * Send email verification link
 * @param {string} email - User email
 */
const generateEmailVerificationLink = async (email) => {
  try {
    const link = await admin.auth().generateEmailVerificationLink(email);
    return link;
  } catch (error) {
    logger.error('Error generating email verification link:', error.message);
    throw error;
  }
};

// Firestore helper functions

/**
 * Get document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 */
const getDocument = async (collection, docId) => {
  try {
    const docRef = admin.firestore().collection(collection).doc(docId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    logger.error('Error getting document:', error.message);
    throw error;
  }
};

/**
 * Set document in Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Data to set
 */
const setDocument = async (collection, docId, data) => {
  try {
    const docRef = admin.firestore().collection(collection).doc(docId);
    await docRef.set(data, { merge: true });
    return true;
  } catch (error) {
    logger.error('Error setting document:', error.message);
    throw error;
  }
};

/**
 * Delete document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 */
const deleteDocument = async (collection, docId) => {
  try {
    const docRef = admin.firestore().collection(collection).doc(docId);
    await docRef.delete();
    return true;
  } catch (error) {
    logger.error('Error deleting document:', error.message);
    throw error;
  }
};

/**
 * Query documents from Firestore
 * @param {string} collection - Collection name
 * @param {Array} filters - Array of filter arrays [field, operator, value]
 * @param {number} limit - Optional limit
 */
const queryDocuments = async (collection, filters = [], limit = null) => {
  try {
    let query = admin.firestore().collection(collection);
    
    filters.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    const documents = [];
    
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    logger.error('Error querying documents:', error.message);
    throw error;
  }
};

// Export Firebase admin and helper functions
module.exports = {
  admin,
  firebaseApp,
  getAuth,
  getFirestore,
  getStorage,
  verifyIdToken,
  createCustomToken,
  getUserByUid,
  getUserByEmail,
  updateUser,
  deleteUser,
  setCustomUserClaims,
  revokeRefreshTokens,
  generatePasswordResetLink,
  generateEmailVerificationLink,
  getDocument,
  setDocument,
  deleteDocument,
  queryDocuments
};