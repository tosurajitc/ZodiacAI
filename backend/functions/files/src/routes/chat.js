// backend/functions/files/src/routes/chat.js
// AI Chat Routes for AstroAI Backend

const express = require('express');
const router = express.Router();

// Import controllers
const chatController = require('../controllers/chatController');

// Import middleware
const { verifyToken } = require('../middleware/authMiddleware');
const { 
  chatLimiterFree, 
  chatLimiterPremium 
} = require('../middleware/rateLimiter');
const { validate } = require('../utils/validator');
const { chatMessageSchema } = require('../utils/validator');

/**
 * @route   POST /api/chat/sessions
 * @desc    Create new chat session
 * @access  Private
 */
router.post(
  '/sessions',
  verifyToken,
  chatController.createSession
);

/**
 * @route   GET /api/chat/sessions
 * @desc    Get all user chat sessions
 * @access  Private
 */
router.get(
  '/sessions',
  verifyToken,
  chatController.getUserSessions
);

/**
 * @route   GET /api/chat/sessions/:sessionId
 * @desc    Get specific chat session with messages
 * @access  Private
 */
router.get(
  '/sessions/:sessionId',
  verifyToken,
  chatController.getSession
);

/**
 * @route   DELETE /api/chat/sessions/:sessionId
 * @desc    Delete chat session
 * @access  Private
 */
router.delete(
  '/sessions/:sessionId',
  verifyToken,
  chatController.deleteSession
);

/**
 * @route   POST /api/chat/message
 * @desc    Send message to AI chat
 * @access  Private
 */
router.post(
  '/message',
  verifyToken,
  chatLimiterFree,
  chatLimiterPremium,
  validate(chatMessageSchema),
  chatController.sendMessage
);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get chat history for a session
 * @access  Private
 */
router.get(
  '/history/:sessionId',
  verifyToken,
  chatController.getChatHistory
);

/**
 * @route   GET /api/chat/recent
 * @desc    Get recent chat sessions (last 10)
 * @access  Private
 */
router.get(
  '/recent',
  verifyToken,
  chatController.getRecentSessions
);

/**
 * @route   PUT /api/chat/sessions/:sessionId/title
 * @desc    Update chat session title
 * @access  Private
 */
router.put(
  '/sessions/:sessionId/title',
  verifyToken,
  chatController.updateSessionTitle
);

/**
 * @route   POST /api/chat/sessions/:sessionId/clear
 * @desc    Clear all messages in a session
 * @access  Private
 */
router.post(
  '/sessions/:sessionId/clear',
  verifyToken,
  chatController.clearSession
);

/**
 * @route   GET /api/chat/usage
 * @desc    Get user's chat usage statistics
 * @access  Private
 */
router.get(
  '/usage',
  verifyToken,
  chatController.getChatUsage
);

/**
 * @route   GET /api/chat/suggestions
 * @desc    Get AI-powered question suggestions based on user's kundli
 * @access  Private
 */
router.get(
  '/suggestions',
  verifyToken,
  chatController.getQuestionSuggestions
);

/**
 * @route   POST /api/chat/feedback/:messageId
 * @desc    Provide feedback on AI response (thumbs up/down)
 * @access  Private
 */
router.post(
  '/feedback/:messageId',
  verifyToken,
  chatController.provideFeedback
);

/**
 * @route   GET /api/chat/export/:sessionId
 * @desc    Export chat session as PDF
 * @access  Private
 */
router.get(
  '/export/:sessionId',
  verifyToken,
  chatController.exportSession
);

module.exports = router;