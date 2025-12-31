// backend/functions/files/src/routes/horoscope.js
// Horoscope Prediction Routes for AstroAI Backend

const express = require('express');
const router = express.Router();

// Import controllers
const horoscopeController = require('../controllers/horoscopeController');

// Import middleware
const { verifyToken, requireSubscription } = require('../middleware/authMiddleware');
const { horoscopeLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../utils/validator');
const { horoscopeRequestSchema } = require('../utils/validator');

/**
 * @route   GET /api/horoscope/daily
 * @desc    Get daily horoscope
 * @access  Private
 */
router.get(
  '/daily',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getDailyHoroscope
);

/**
 * @route   GET /api/horoscope/weekly
 * @desc    Get weekly horoscope
 * @access  Private
 */
router.get(
  '/weekly',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getWeeklyHoroscope
);

/**
 * @route   GET /api/horoscope/monthly
 * @desc    Get monthly horoscope
 * @access  Private
 */
router.get(
  '/monthly',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getMonthlyHoroscope
);

/**
 * @route   GET /api/horoscope/yearly
 * @desc    Get yearly horoscope
 * @access  Private
 */
router.get(
  '/yearly',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getYearlyHoroscope
);

/**
 * @route   GET /api/horoscope/lifetime
 * @desc    Get lifetime analysis
 * @access  Private
 */
router.get(
  '/lifetime',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getLifetimeAnalysis
);

/**
 * @route   POST /api/horoscope/generate
 * @desc    Generate custom horoscope for specific date/type
 * @access  Private
 */
router.post(
  '/generate',
  verifyToken,
  horoscopeLimiter,
  validate(horoscopeRequestSchema),
  horoscopeController.generateHoroscope
);

/**
 * @route   GET /api/horoscope/career
 * @desc    Get career-focused predictions
 * @access  Private
 */
router.get(
  '/career',
  verifyToken,
  requireSubscription('premium'),
  horoscopeController.getCareerPredictions
);

/**
 * @route   GET /api/horoscope/relationships
 * @desc    Get relationship predictions
 * @access  Private
 */
router.get(
  '/relationships',
  verifyToken,
  horoscopeController.getRelationshipPredictions
);

/**
 * @route   GET /api/horoscope/health
 * @desc    Get health predictions
 * @access  Private
 */
router.get(
  '/health',
  verifyToken,
  horoscopeController.getHealthPredictions
);

/**
 * @route   GET /api/horoscope/finance
 * @desc    Get financial predictions
 * @access  Private
 */
router.get(
  '/finance',
  verifyToken,
  horoscopeController.getFinancePredictions
);

/**
 * @route   GET /api/horoscope/transits
 * @desc    Get current planetary transits and their effects
 * @access  Private
 */
router.get(
  '/transits',
  verifyToken,
  horoscopeController.getCurrentTransits
);

/**
 * @route   GET /api/horoscope/dasha
 * @desc    Get current dasha period analysis
 * @access  Private
 */
router.get(
  '/dasha',
  verifyToken,
  horoscopeController.getCurrentDasha
);

/**
 * @route   GET /api/horoscope/remedies
 * @desc    Get personalized remedies
 * @access  Private
 */
router.get(
  '/remedies',
  verifyToken,
  horoscopeController.getRemedies
);

/**
 * @route   GET /api/horoscope/auspicious-times
 * @desc    Get auspicious times (muhurat) for activities
 * @access  Private
 */
router.get(
  '/auspicious-times',
  verifyToken,
  requireSubscription('premium'),
  horoscopeController.getAuspiciousTimes
);

/**
 * @route   POST /api/horoscope/compatibility
 * @desc    Check compatibility between two birth charts
 * @access  Private
 */
router.post(
  '/compatibility',
  verifyToken,
  requireSubscription('premium'),
  horoscopeController.checkCompatibility
);

/**
 * @route   GET /api/horoscope/history
 * @desc    Get user's horoscope history
 * @access  Private
 */
router.get(
  '/history',
  verifyToken,
  horoscopeController.getHoroscopeHistory
);

/**
 * @route   GET /api/horoscope/history/:id
 * @desc    Get specific horoscope by ID
 * @access  Private
 */
router.get(
  '/history/:id',
  verifyToken,
  horoscopeController.getHoroscopeById
);

/**
 * @route   POST /api/horoscope/save
 * @desc    Save horoscope to favorites
 * @access  Private
 */
router.post(
  '/save',
  verifyToken,
  horoscopeController.saveHoroscope
);

/**
 * @route   DELETE /api/horoscope/saved/:id
 * @desc    Remove horoscope from favorites
 * @access  Private
 */
router.delete(
  '/saved/:id',
  verifyToken,
  horoscopeController.deleteSavedHoroscope
);

/**
 * @route   GET /api/horoscope/export/:id
 * @desc    Export horoscope as PDF
 * @access  Private
 */
router.get(
  '/export/:id',
  verifyToken,
  horoscopeController.exportHoroscope
);

/**
 * @route   POST /api/horoscope/feedback/:id
 * @desc    Provide feedback on horoscope accuracy
 * @access  Private
 */
router.post(
  '/feedback/:id',
  verifyToken,
  horoscopeController.provideFeedback
);

module.exports = router;