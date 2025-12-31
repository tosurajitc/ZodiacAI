// backend/functions/files/src/routes/feedback.js
// Feedback Routes for AstroAI Backend

const express = require('express');
const router = express.Router();

// Import controllers
const feedbackController = require('../controllers/feedbackController');

// Import middleware
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');
const { feedbackLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../utils/validator');
const { feedbackSchema } = require('../utils/validator');

/**
 * @route   POST /api/feedback
 * @desc    Submit general feedback
 * @access  Private
 */
router.post(
  '/',
  verifyToken,
  feedbackLimiter,
  validate(feedbackSchema),
  feedbackController.submitFeedback
);

/**
 * @route   GET /api/feedback
 * @desc    Get user's feedback history
 * @access  Private
 */
router.get(
  '/',
  verifyToken,
  feedbackController.getUserFeedback
);

/**
 * @route   GET /api/feedback/:id
 * @desc    Get specific feedback by ID
 * @access  Private
 */
router.get(
  '/:id',
  verifyToken,
  feedbackController.getFeedbackById
);

/**
 * @route   PUT /api/feedback/:id
 * @desc    Update feedback
 * @access  Private
 */
router.put(
  '/:id',
  verifyToken,
  validate(feedbackSchema),
  feedbackController.updateFeedback
);

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete feedback
 * @access  Private
 */
router.delete(
  '/:id',
  verifyToken,
  feedbackController.deleteFeedback
);

/**
 * @route   POST /api/feedback/prediction/:predictionId
 * @desc    Rate prediction accuracy
 * @access  Private
 */
router.post(
  '/prediction/:predictionId',
  verifyToken,
  feedbackController.ratePrediction
);

/**
 * @route   POST /api/feedback/chat/:chatId
 * @desc    Rate chat response quality
 * @access  Private
 */
router.post(
  '/chat/:chatId',
  verifyToken,
  feedbackController.rateChatResponse
);

/**
 * @route   POST /api/feedback/kundli/:kundliId
 * @desc    Rate kundli accuracy
 * @access  Private
 */
router.post(
  '/kundli/:kundliId',
  verifyToken,
  feedbackController.rateKundli
);

/**
 * @route   POST /api/feedback/feature-request
 * @desc    Submit feature request
 * @access  Private
 */
router.post(
  '/feature-request',
  verifyToken,
  feedbackLimiter,
  feedbackController.submitFeatureRequest
);

/**
 * @route   POST /api/feedback/bug-report
 * @desc    Submit bug report
 * @access  Private
 */
router.post(
  '/bug-report',
  verifyToken,
  feedbackLimiter,
  feedbackController.submitBugReport
);

/**
 * @route   POST /api/feedback/app-rating
 * @desc    Rate the overall app
 * @access  Private
 */
router.post(
  '/app-rating',
  verifyToken,
  feedbackController.rateApp
);

/**
 * @route   GET /api/feedback/app-rating
 * @desc    Get user's app rating
 * @access  Private
 */
router.get(
  '/app-rating',
  verifyToken,
  feedbackController.getUserAppRating
);

/**
 * @route   POST /api/feedback/testimonial
 * @desc    Submit testimonial
 * @access  Private
 */
router.post(
  '/testimonial',
  verifyToken,
  feedbackController.submitTestimonial
);

/**
 * @route   GET /api/feedback/testimonials
 * @desc    Get approved testimonials (public)
 * @access  Public
 */
router.get(
  '/testimonials',
  optionalAuth,
  feedbackController.getApprovedTestimonials
);

/**
 * @route   POST /api/feedback/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post(
  '/contact',
  feedbackLimiter,
  feedbackController.submitContactForm
);

/**
 * @route   GET /api/feedback/categories
 * @desc    Get feedback categories
 * @access  Public
 */
router.get(
  '/categories',
  feedbackController.getFeedbackCategories
);

/**
 * @route   GET /api/feedback/stats
 * @desc    Get user's feedback statistics
 * @access  Private
 */
router.get(
  '/stats',
  verifyToken,
  feedbackController.getUserFeedbackStats
);

/**
 * @route   POST /api/feedback/:id/helpful
 * @desc    Mark feedback as helpful
 * @access  Private
 */
router.post(
  '/:id/helpful',
  verifyToken,
  feedbackController.markFeedbackHelpful
);

module.exports = router;