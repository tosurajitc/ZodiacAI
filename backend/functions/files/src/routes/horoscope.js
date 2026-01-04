// backend/src/routes/horoscope.js
// Horoscope Prediction Routes for AstroAI Backend

const express = require('express');
const router = express.Router();

// Import controllers
const horoscopeController = require('../controllers/horoscopeController');

// Import middleware
const { verifyToken, requireSubscription } = require('../middleware/authMiddleware');
const { horoscopeLimiter } = require('../middleware/rateLimiter');

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
 * @route   GET /api/horoscope/category
 * @desc    Get horoscope by category
 * @access  Private
 */
router.get(
  '/category',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getHoroscopeByCategory
);

/**
 * @route   GET /api/horoscope/transits/current
 * @desc    Get current planetary transits
 * @access  Private
 */
router.get(
  '/transits/current',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getCurrentTransits
);

/**
 * @route   GET /api/horoscope/transits
 * @desc    Get transit predictions
 * @access  Private
 */
router.get(
  '/transits',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getTransitPredictions
);

/**
 * @route   GET /api/horoscope/dasha
 * @desc    Get dasha predictions
 * @access  Private
 */
router.get(
  '/dasha',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getDashaPredictions
);

/**
 * @route   POST /api/horoscope/compatibility
 * @desc    Get compatibility analysis
 * @access  Private
 */
router.post(
  '/compatibility',
  verifyToken,
  requireSubscription('premium'),
  horoscopeController.getCompatibility
);

/**
 * @route   GET /api/horoscope/remedies
 * @desc    Get remedies
 * @access  Private
 */
router.get(
  '/remedies',
  verifyToken,
  horoscopeLimiter,
  horoscopeController.getRemedies
);

/**
 * @route   POST /api/horoscope/feedback
 * @desc    Submit horoscope feedback
 * @access  Private
 */
router.post(
  '/feedback',
  verifyToken,
  horoscopeController.submitFeedback
);

/**
 * @route   GET /api/horoscope/history
 * @desc    Get horoscope history
 * @access  Private
 */
router.get(
  '/history',
  verifyToken,
  horoscopeController.getHoroscopeHistory
);

/**
 * @route   GET /api/horoscope/muhurat
 * @desc    Get auspicious times
 * @access  Private
 */
router.get(
  '/muhurat',
  verifyToken,
  requireSubscription('premium'),
  horoscopeController.getAuspiciousTimes
);

/**
 * @route   POST /api/horoscope/personalized
 * @desc    Get personalized prediction
 * @access  Private
 */
router.post(
  '/personalized',
  verifyToken,
  horoscopeController.getPersonalizedPrediction
);

/**
 * @route   POST /api/horoscope/regenerate
 * @desc    Regenerate horoscope
 * @access  Private
 */
router.post(
  '/regenerate',
  verifyToken,
  horoscopeController.regenerateHoroscope
);

/**
 * @route   GET /api/horoscope/summary
 * @desc    Get horoscope summary
 * @access  Private
 */
router.get(
  '/summary',
  verifyToken,
  horoscopeController.getHoroscopeSummary
);

/**
 * @route   POST /api/horoscope/share
 * @desc    Share horoscope
 * @access  Private
 */
router.post(
  '/share',
  verifyToken,
  horoscopeController.shareHoroscope
);

/**
 * @route   GET /api/horoscope/download/pdf
 * @desc    Download horoscope PDF
 * @access  Private
 */
router.get(
  '/download/pdf',
  verifyToken,
  horoscopeController.downloadHoroscopePDF
);

/**
 * @route   GET /api/horoscope/notifications/settings
 * @desc    Get notification settings
 * @access  Private
 */
router.get(
  '/notifications/settings',
  verifyToken,
  horoscopeController.getNotificationSettings
);

/**
 * @route   PUT /api/horoscope/notifications/settings
 * @desc    Update notification settings
 * @access  Private
 */
router.put(
  '/notifications/settings',
  verifyToken,
  horoscopeController.updateNotificationSettings
);

/**
 * @route   GET /api/horoscope/zodiac
 * @desc    Get zodiac sign info
 * @access  Private
 */
router.get(
  '/zodiac',
  verifyToken,
  horoscopeController.getZodiacSignInfo
);

/**
 * @route   GET /api/horoscope/planets
 * @desc    Get planet positions
 * @access  Private
 */
router.get(
  '/planets',
  verifyToken,
  horoscopeController.getPlanetPositions
);

/**
 * @route   GET /api/horoscope/houses
 * @desc    Get house analysis
 * @access  Private
 */
router.get(
  '/houses',
  verifyToken,
  horoscopeController.getHouseAnalysis
);

module.exports = router;