// backend/functions/files/src/routes/kundli.js
// Kundli Generation Routes for AstroAI Backend

const express = require('express');
const router = express.Router();

// Import controllers
const kundliController = require('../controllers/kundliController');

// Import middleware
const { verifyToken, requireSubscription } = require('../middleware/authMiddleware');
const { kundliLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../utils/validator');
const { birthDetailsSchema } = require('../utils/validator');

/**
 * @route   POST /api/kundli/generate
 * @desc    Generate new kundli from birth details
 * @access  Private
 */
router.post(
  '/generate',
  verifyToken,
  kundliLimiter,
  validate(birthDetailsSchema),
  kundliController.generateKundli
);

/**
 * @route   GET /api/kundli
 * @desc    Get user's saved kundli
 * @access  Private
 */
router.get(
  '/',
  verifyToken,
  kundliController.getUserKundli
);

/**
 * @route   POST /api/kundli/match
 * @desc    Match two kundlis for compatibility (Gun Milan)
 * @access  Private - Premium only
 */
router.post(
  '/match',
  verifyToken,
  requireSubscription('premium'),
  kundliController.matchKundlis
);

/**
 * @route   POST /api/kundli/verify-location
 * @desc    Verify and get coordinates for location
 * @access  Private
 */
router.post(
  '/verify-location',
  verifyToken,
  kundliController.verifyLocation
);

/**
 * ========================================
 * SPECIFIC ROUTES - MUST COME BEFORE /:id
 * ========================================
 */

/**
 * @route   GET /api/kundli/:id/pdf
 * @desc    Download kundli as PDF
 * @access  Private
 */
router.get(
  '/:id/pdf',
  verifyToken,
  kundliController.downloadKundliPDF
);

/**
 * @route   GET /api/kundli/:id/chart
 * @desc    Get birth chart (Rasi chart - D1)
 * @access  Private
 */
router.get(
  '/:id/chart',
  verifyToken,
  kundliController.getBirthChart
);

/**
 * @route   GET /api/kundli/:id/navamsa
 * @desc    Get Navamsa chart (D9)
 * @access  Private
 */
router.get(
  '/:id/navamsa',
  verifyToken,
  kundliController.getNavamsaChart
);

/**
 * @route   GET /api/kundli/:id/divisional/:type
 * @desc    Get divisional chart (D1-D60)
 * @access  Private - Premium only
 */
router.get(
  '/:id/divisional/:type',
  verifyToken,
  requireSubscription('premium'),
  kundliController.getDivisionalChart
);

/**
 * @route   GET /api/kundli/:id/planets
 * @desc    Get planetary positions
 * @access  Private
 */
router.get(
  '/:id/planets',
  verifyToken,
  kundliController.getPlanetaryPositions
);

/**
 * @route   GET /api/kundli/:id/houses
 * @desc    Get house positions and cusps
 * @access  Private
 */
router.get(
  '/:id/houses',
  verifyToken,
  kundliController.getHouses
);

/**
 * @route   GET /api/kundli/:id/dasha
 * @desc    Get Vimshottari dasha periods
 * @access  Private
 */
router.get(
  '/:id/dasha',
  verifyToken,
  kundliController.getDashaPeriods
);

/**
 * @route   GET /api/kundli/:id/yogas
 * @desc    Get yogas (combinations) in chart
 * @access  Private
 */
router.get(
  '/:id/yogas',
  verifyToken,
  kundliController.getYogas
);

/**
 * @route   GET /api/kundli/:id/doshas
 * @desc    Get doshas (Mangal, Kaal Sarp, etc.)
 * @access  Private
 */
router.get(
  '/:id/doshas',
  verifyToken,
  kundliController.getDoshas
);

/**
 * @route   GET /api/kundli/:id/strengths
 * @desc    Get planetary strengths (Shadbala, Ashtakavarga)
 * @access  Private - Premium only
 */
router.get(
  '/:id/strengths',
  verifyToken,
  requireSubscription('premium'),
  kundliController.getPlanetaryStrengths
);

/**
 * @route   GET /api/kundli/:id/aspects
 * @desc    Get planetary aspects
 * @access  Private
 */
router.get(
  '/:id/aspects',
  verifyToken,
  kundliController.getPlanetaryAspects
);

/**
 * @route   GET /api/kundli/:id/nakshatras
 * @desc    Get nakshatra details
 * @access  Private
 */
router.get(
  '/:id/nakshatras',
  verifyToken,
  kundliController.getNakshatraDetails
);

/**
 * @route   GET /api/kundli/:id/summary
 * @desc    Get complete kundli summary
 * @access  Private
 */
router.get(
  '/:id/summary',
  verifyToken,
  kundliController.getKundliSummary
);

/**
 * @route   GET /api/kundli/:id/share
 * @desc    Generate shareable link for kundli
 * @access  Private
 */
router.get(
  '/:id/share',
  verifyToken,
  kundliController.generateShareLink
);

/**
 * @route   POST /api/kundli/:id/add-family
 * @desc    Add family member's kundli
 * @access  Private
 */
router.post(
  '/:id/add-family',
  verifyToken,
  validate(birthDetailsSchema),
  kundliController.addFamilyMember
);

/**
 * @route   GET /api/kundli/:id/family
 * @desc    Get all family member kundlis
 * @access  Private
 */
router.get(
  '/:id/family',
  verifyToken,
  kundliController.getFamilyKundlis
);

/**
 * @route   GET /api/kundli/:id/panchang
 * @desc    Get panchang for birth date/time
 * @access  Private
 */
router.get(
  '/:id/panchang',
  verifyToken,
  kundliController.getBirthPanchang
);

/**
 * @route   GET /api/kundli/:id/current-transits
 * @desc    Get current transits over natal chart
 * @access  Private
 */
router.get(
  '/:id/current-transits',
  verifyToken,
  kundliController.getCurrentTransits
);

/**
 * ========================================
 * GENERIC ROUTE - MUST COME LAST
 * ========================================
 */

/**
 * @route   GET /api/kundli/:id
 * @desc    Get specific kundli by ID
 * @access  Private
 */
router.get(
  '/:id',
  verifyToken,
  kundliController.getKundliById
);

/**
 * @route   PUT /api/kundli/:id
 * @desc    Update kundli birth details
 * @access  Private
 */
router.put(
  '/:id',
  verifyToken,
  validate(birthDetailsSchema),
  kundliController.updateKundli
);

/**
 * @route   DELETE /api/kundli/:id
 * @desc    Delete kundli
 * @access  Private
 */
router.delete(
  '/:id',
  verifyToken,
  kundliController.deleteKundli
);

module.exports = router;