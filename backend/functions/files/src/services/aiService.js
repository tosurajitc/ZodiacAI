// backend/functions/files/src/services/aiService.js
// AI Service for OpenAI/Claude Integration

const axios = require('axios');
const logger = require('../utils/logger');
const { getCache, setCache } = require('../config/redis');
require('dotenv').config();

// AI Provider configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'claude'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4'; // or 'claude-3-opus-20240229'

// API endpoints
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// System prompt for astrology context
const SYSTEM_PROMPT = `You are an expert Vedic astrologer with deep knowledge of:
- Planetary positions and their effects
- House systems and their significance
- Dasha periods and timing predictions
- Transit effects on birth charts
- Career, relationship, health, and financial guidance
- Remedies (gemstones, mantras, rituals)

Guidelines:
1. Provide personalized predictions based on the user's birth chart data
2. Explain astrological concepts in simple, easy-to-understand language
3. Be empathetic and supportive in your responses
4. Give practical advice along with astrological insights
5. Avoid medical or legal advice - only provide astrological guidance
6. When timing is asked, provide specific date ranges based on transits and dashas
7. Keep responses conversational and focused (2-4 paragraphs max)
8. If birth chart data is missing, politely ask user to provide it

Always structure career advice around:
- Current planetary periods (Dasha/Antardasha)
- Relevant transits (especially Saturn, Jupiter, Rahu, Ketu)
- 10th house (career) and its lord's position
- Specific timing windows for job changes, promotions, etc.`;

/**
 * Generate AI response for chat message
 * @param {string} userMessage - User's message
 * @param {Object} birthData - User's birth chart data
 * @param {Array} conversationHistory - Previous messages in conversation
 * @returns {string} AI response
 */
const generateAIResponse = async (userMessage, birthData = null, conversationHistory = []) => {
  try {
    // Build context with birth data
    let contextMessage = '';
    if (birthData && birthData.planetary_positions) {
      contextMessage = `User's Birth Chart Data:
- Birth Date: ${birthData.birth_date}
- Birth Time: ${birthData.birth_time}
- Birth Place: ${birthData.birth_place}
- Ascendant: ${birthData.ascendant || 'Not available'}
- Moon Sign: ${birthData.moon_sign || 'Not available'}
- Sun Sign: ${birthData.sun_sign || 'Not available'}
- Current Dasha: ${birthData.current_dasha || 'Not available'}

Planetary Positions:
${formatPlanetaryPositions(birthData.planetary_positions)}

`;
    }

    // Call appropriate AI provider
    let response;
    if (AI_PROVIDER === 'openai') {
      response = await callOpenAI(userMessage, contextMessage, conversationHistory);
    } else if (AI_PROVIDER === 'claude') {
      response = await callClaude(userMessage, contextMessage, conversationHistory);
    } else {
      throw new Error('Invalid AI provider configured');
    }

    logger.info('AI response generated successfully');
    return response;

  } catch (error) {
    logger.error('Error generating AI response:', error.message);
    throw new Error('Failed to generate AI response. Please try again.');
  }
};

/**
 * Call OpenAI API
 */
const callOpenAI = async (userMessage, contextMessage, conversationHistory) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Build messages array
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + '\n\n' + contextMessage
      }
    ];

    // Add conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Call OpenAI API
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: AI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        timeout: 30000
      }
    );

    const aiResponse = response.data.choices[0].message.content.trim();
    
    // Log token usage
    logger.debug(`OpenAI tokens used: ${response.data.usage.total_tokens}`);

    return aiResponse;

  } catch (error) {
    if (error.response) {
      logger.error('OpenAI API error:', error.response.data);
      throw new Error(`OpenAI API error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    throw error;
  }
};

/**
 * Call Claude API
 */
const callClaude = async (userMessage, contextMessage, conversationHistory) => {
  try {
    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    // Build messages array (Claude format)
    const messages = [];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message with context
    const userContent = contextMessage 
      ? `${contextMessage}\n\nUser Question: ${userMessage}`
      : userMessage;

    messages.push({
      role: 'user',
      content: userContent
    });

    // Call Claude API
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: AI_MODEL,
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: messages,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    const aiResponse = response.data.content[0].text.trim();
    
    // Log token usage
    logger.debug(`Claude tokens used: ${response.data.usage.input_tokens + response.data.usage.output_tokens}`);

    return aiResponse;

  } catch (error) {
    if (error.response) {
      logger.error('Claude API error:', error.response.data);
      throw new Error(`Claude API error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    throw error;
  }
};

/**
 * Format planetary positions for AI context
 */
const formatPlanetaryPositions = (positions) => {
  if (!positions || typeof positions !== 'object') {
    return 'Not available';
  }

  try {
    const formatted = Object.entries(positions)
      .map(([planet, data]) => {
        if (typeof data === 'object' && data.sign && data.degree) {
          return `${planet}: ${data.sign} ${data.degree}°`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n');

    return formatted || 'Not available';
  } catch (error) {
    logger.error('Error formatting planetary positions:', error.message);
    return 'Not available';
  }
};

/**
 * Generate quick prediction (cached for 24 hours)
 * @param {string} predictionType - Type: 'daily', 'weekly', 'monthly'
 * @param {Object} birthData - User's birth data
 * @returns {string} Prediction text
 */
const generateQuickPrediction = async (predictionType, birthData) => {
  try {
    // Check cache first
    const cacheKey = `prediction:${birthData.user_id}:${predictionType}:${new Date().toISOString().split('T')[0]}`;
    const cached = await getCache(cacheKey);
    
    if (cached) {
      logger.debug(`Using cached ${predictionType} prediction`);
      return cached;
    }

    // Generate new prediction
    const prompt = generatePredictionPrompt(predictionType, birthData);
    const prediction = await generateAIResponse(prompt, birthData, []);

    // Cache for 24 hours
    await setCache(cacheKey, prediction, 86400);

    return prediction;

  } catch (error) {
    logger.error('Error generating quick prediction:', error.message);
    throw error;
  }
};

/**
 * Generate prediction prompt based on type
 */
const generatePredictionPrompt = (type, birthData) => {
  const today = new Date().toISOString().split('T')[0];

  const prompts = {
    daily: `Provide a brief daily prediction for ${today}. Focus on:
1. Overall energy and mood
2. Career/work guidance
3. Relationship insights
4. Lucky time/color/direction
Keep it positive, practical, and concise (3-4 sentences).`,

    weekly: `Provide a weekly prediction for the upcoming week starting ${today}. Cover:
1. Overall weekly theme
2. Best days for important activities
3. Areas requiring caution
4. Opportunities to watch for
Keep it actionable and motivating (5-6 sentences).`,

    monthly: `Provide a monthly prediction for ${new Date().toLocaleString('default', { month: 'long' })}. Include:
1. Key themes and opportunities
2. Important date ranges for career moves
3. Relationship and financial outlook
4. Recommended focus areas
Be specific about timing where possible (7-8 sentences).`
  };

  return prompts[type] || prompts.daily;
};

/**
 * Validate AI service configuration
 */
const validateAIConfig = () => {
  if (AI_PROVIDER === 'openai' && !OPENAI_API_KEY) {
    logger.error('OpenAI API key not configured');
    return false;
  }
  
  if (AI_PROVIDER === 'claude' && !CLAUDE_API_KEY) {
    logger.error('Claude API key not configured');
    return false;
  }

  logger.info(`AI Service configured with provider: ${AI_PROVIDER}, model: ${AI_MODEL}`);
  return true;
};

// Validate configuration on module load
validateAIConfig();

module.exports = {
  generateAIResponse,
  generateQuickPrediction,
  validateAIConfig
};