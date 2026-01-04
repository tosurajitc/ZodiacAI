// backend/src/controllers/horoscopeController.js
const { BirthDetails, Horoscope, User } = require('../models');
const axios = require('axios');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { AppError } = require('../utils/errorHandler');

// Python calculation engine URL
const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';
const PYTHON_API_KEY = process.env.PYTHON_API_KEY || 'zodiacai-secret-key-2025';

/**
 * Get Daily Horoscope
 * GET /api/horoscope/daily?date=YYYY-MM-DD
 */
exports.getDailyHoroscope = async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.id || req.user?.userId;

    if (!userId) {
      logger.error('User ID not found in request', { user: req.user, headers: req.headers });
      return errorResponse(res, 'Authentication required', 401);
    }

    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    logger.info('Fetching daily horoscope', { userId, targetDate });

    const birthDetails = await BirthDetails.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    if (!birthDetails) {
      return errorResponse(res, 'Birth details not found. Please enter your birth details first.', 404);
    }

    const existingHoroscope = await Horoscope.findOne({
      where: { user_id: userId, horoscope_type: 'daily', period_start: new Date(targetDate) },
    });

    if (existingHoroscope) {
      const horoscopeAge = Date.now() - new Date(existingHoroscope.updated_at).getTime();
      const sixHoursInMs = 6 * 60 * 60 * 1000;
      if (horoscopeAge < sixHoursInMs) {
        logger.info('Returning cached daily horoscope', { userId, targetDate });
        return successResponse(res, 'Daily horoscope retrieved', { ...existingHoroscope.toJSON(), cached: true });
      }
    }

    logger.info('Calling Python engine for daily horoscope', { userId, birthDate: birthDetails.birth_date, targetDate });

    const pythonResponse = await axios.post(
      `${PYTHON_ENGINE_URL}/horoscope/daily`,
      null,
      {
        params: {
          birth_date: birthDetails.birth_date,
          birth_time: birthDetails.birth_time,
          birth_location: birthDetails.birth_location,
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
          timezone: birthDetails.timezone,
          target_date: targetDate,
        },
        headers: { 'X-API-Key': PYTHON_API_KEY, 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );

    const horoscopeData = pythonResponse.data;

    logger.info('Python engine response received', { userId, hasData: !!horoscopeData });

    const [horoscope, created] = await Horoscope.upsert({
      user_id: userId,
      horoscope_type: 'daily',
      category: 'general',
      period_start: new Date(targetDate),
      period_end: new Date(targetDate),
      title: horoscopeData.title || `Daily Horoscope - ${targetDate}`,
      summary: horoscopeData.summary || '',
      detailed_prediction: horoscopeData.detailed_prediction || '',
      career_prediction: horoscopeData.career_prediction || '',
      finance_prediction: horoscopeData.finance_prediction || '',
      relationship_prediction: horoscopeData.relationship_prediction || '',
      health_prediction: horoscopeData.health_prediction || '',
      overall_score: horoscopeData.overall_score || 7,
      career_score: horoscopeData.career_score || 7,
      finance_score: horoscopeData.finance_score || 7,
      relationship_score: horoscopeData.relationship_score || 7,
      health_score: horoscopeData.health_score || 7,
      lucky_number: horoscopeData.lucky_number || null,
      lucky_color: horoscopeData.lucky_color || null,
      lucky_time: horoscopeData.lucky_time || null,
      auspicious_times: horoscopeData.auspicious_times || null,
      planetary_transits: horoscopeData.planetary_transits || null,
      moon_phase: horoscopeData.moon_phase || null,
      tips: horoscopeData.tips || null,
    });

    logger.info('Daily horoscope saved to database', { userId, created, horoscopeId: horoscope.id });

    const formattedResponse = {
      id: horoscope.id,
      date: new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      luckyNumber: horoscope.lucky_number,
      luckyColor: horoscope.lucky_color,
      luckyTime: horoscope.lucky_time,
      score: {
        finance: horoscope.finance_score,
        career: horoscope.career_score,
        relationship: horoscope.relationship_score,
        health: horoscope.health_score,
      },
      predictions: {
        finance: { title: 'Financial Outlook', text: horoscope.finance_prediction, tips: horoscopeData.tips?.finance || [] },
        career: { title: 'Career & Work', text: horoscope.career_prediction, tips: horoscopeData.tips?.career || [] },
        relationship: { title: 'Love & Relationships', text: horoscope.relationship_prediction, tips: horoscopeData.tips?.relationship || [] },
        health: { title: 'Health & Wellness', text: horoscope.health_prediction, tips: horoscopeData.tips?.health || [] },
      },
      transits: horoscope.planetary_transits || [],
      cached: false,
    };

    return successResponse(res, 'Daily horoscope generated successfully', formattedResponse);
  } catch (error) {
    logger.error('Daily horoscope generation failed', { error: error.message, userId: req.user?.uid || req.user?.id, stack: error.stack, pythonError: error.response?.data });
    if (error.response?.status === 401) return errorResponse(res, 'Python engine authentication failed', 500);
    if (error.code === 'ECONNREFUSED') return errorResponse(res, 'Calculation service unavailable. Please try again.', 503);
    return errorResponse(res, error.message || 'Failed to generate daily horoscope', error.statusCode || 500);
  }
};

/**
 * Get Monthly Horoscope
 * GET /api/horoscope/monthly?month=1&year=2025
 */
exports.getMonthlyHoroscope = async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.id || req.user?.userId;

    if (!userId) {
      logger.error('User ID not found in request', { user: req.user, headers: req.headers });
      return errorResponse(res, 'Authentication required', 401);
    }

    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    logger.info('Fetching monthly horoscope', { userId, month: targetMonth, year: targetYear });

    const birthDetails = await BirthDetails.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    if (!birthDetails) {
      return errorResponse(res, 'Birth details not found', 404);
    }

    const periodStart = new Date(targetYear, targetMonth - 1, 1);
    const periodEnd = new Date(targetYear, targetMonth, 0);

    const existingHoroscope = await Horoscope.findOne({
      where: { user_id: userId, horoscope_type: 'monthly', period_start: periodStart },
    });

    if (existingHoroscope) {
      const age = Date.now() - new Date(existingHoroscope.updated_at).getTime();
      if (age < 7 * 24 * 60 * 60 * 1000) {
        return successResponse(res, 'Monthly horoscope retrieved', { ...existingHoroscope.toJSON(), cached: true });
      }
    }

    const pythonResponse = await axios.post(
      `${PYTHON_ENGINE_URL}/horoscope/monthly`,
      null,
      {
        params: {
          birth_date: birthDetails.birth_date,
          birth_time: birthDetails.birth_time,
          birth_location: birthDetails.birth_location,
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
          timezone: birthDetails.timezone,
          target_month: targetMonth,
          target_year: targetYear,
        },
        headers: { 'X-API-Key': PYTHON_API_KEY },
        timeout: 20000,
      }
    );

    const horoscopeData = pythonResponse.data;

    const [horoscope] = await Horoscope.upsert({
      user_id: userId,
      horoscope_type: 'monthly',
      category: 'general',
      period_start: periodStart,
      period_end: periodEnd,
      title: horoscopeData.title,
      summary: horoscopeData.summary,
      detailed_prediction: horoscopeData.detailed_prediction,
      career_prediction: horoscopeData.career_prediction,
      finance_prediction: horoscopeData.finance_prediction,
      relationship_prediction: horoscopeData.relationship_prediction,
      health_prediction: horoscopeData.health_prediction,
      overall_score: horoscopeData.overall_score,
      career_score: horoscopeData.career_score,
      finance_score: horoscopeData.finance_score,
      relationship_score: horoscopeData.relationship_score,
      health_score: horoscopeData.health_score,
      planetary_transits: horoscopeData.planetary_transits,
      weekly_breakdown: horoscopeData.weekly_breakdown,
    });

    return successResponse(res, 'Monthly horoscope generated', horoscope);
  } catch (error) {
    logger.error('Monthly horoscope failed', { error: error.message, userId: req.user?.uid || req.user?.id, stack: error.stack });
    return errorResponse(res, 'Failed to generate monthly horoscope', 500);
  }
};

/**
 * Get Yearly Horoscope
 * GET /api/horoscope/yearly?year=2025
 */
exports.getYearlyHoroscope = async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.id || req.user?.userId;

    if (!userId) {
      logger.error('User ID not found in request', { user: req.user });
      return errorResponse(res, 'Authentication required', 401);
    }

    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const birthDetails = await BirthDetails.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    if (!birthDetails) {
      return errorResponse(res, 'Birth details not found', 404);
    }

    const periodStart = new Date(targetYear, 0, 1);
    const periodEnd = new Date(targetYear, 11, 31);

    const existingHoroscope = await Horoscope.findOne({
      where: { user_id: userId, horoscope_type: 'yearly', period_start: periodStart },
    });

    if (existingHoroscope) {
      const age = Date.now() - new Date(existingHoroscope.updated_at).getTime();
      if (age < 30 * 24 * 60 * 60 * 1000) {
        return successResponse(res, 'Yearly horoscope retrieved', { ...existingHoroscope.toJSON(), cached: true });
      }
    }

    const pythonResponse = await axios.post(
      `${PYTHON_ENGINE_URL}/horoscope/yearly`,
      null,
      {
        params: {
          birth_date: birthDetails.birth_date,
          birth_time: birthDetails.birth_time,
          birth_location: birthDetails.birth_location,
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
          timezone: birthDetails.timezone,
          target_year: targetYear,
        },
        headers: { 'X-API-Key': PYTHON_API_KEY },
        timeout: 25000,
      }
    );

    const horoscopeData = pythonResponse.data;

    const [horoscope] = await Horoscope.upsert({
      user_id: userId,
      horoscope_type: 'yearly',
      category: 'general',
      period_start: periodStart,
      period_end: periodEnd,
      title: horoscopeData.title,
      summary: horoscopeData.summary,
      detailed_prediction: horoscopeData.detailed_prediction,
      career_prediction: horoscopeData.career_prediction,
      finance_prediction: horoscopeData.finance_prediction,
      relationship_prediction: horoscopeData.relationship_prediction,
      health_prediction: horoscopeData.health_prediction,
      overall_score: horoscopeData.overall_score,
      career_score: horoscopeData.career_score,
      finance_score: horoscopeData.finance_score,
      relationship_score: horoscopeData.relationship_score,
      health_score: horoscopeData.health_score,
      planetary_transits: horoscopeData.planetary_transits,
      quarterly_breakdown: horoscopeData.quarterly_breakdown,
      important_dates: horoscopeData.important_dates,
    });

    return successResponse(res, 'Yearly horoscope generated', horoscope);
  } catch (error) {
    logger.error('Yearly horoscope failed', { error: error.message });
    return errorResponse(res, 'Failed to generate yearly horoscope', 500);
  }
};

/**
 * Get Lifetime Analysis
 * GET /api/horoscope/lifetime
 */
exports.getLifetimeAnalysis = async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.id || req.user?.userId;

    if (!userId) {
      logger.error('User ID not found in request', { user: req.user });
      return errorResponse(res, 'Authentication required', 401);
    }

    const birthDetails = await BirthDetails.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    if (!birthDetails) {
      return errorResponse(res, 'Birth details not found', 404);
    }

    const existingHoroscope = await Horoscope.findOne({
      where: { user_id: userId, horoscope_type: 'lifetime' },
    });

    if (existingHoroscope) {
      const age = Date.now() - new Date(existingHoroscope.updated_at).getTime();
      if (age < 90 * 24 * 60 * 60 * 1000) {
        return successResponse(res, 'Lifetime analysis retrieved', { ...existingHoroscope.toJSON(), cached: true });
      }
    }

    const pythonResponse = await axios.post(
      `${PYTHON_ENGINE_URL}/horoscope/lifetime`,
      null,
      {
        params: {
          birth_date: birthDetails.birth_date,
          birth_time: birthDetails.birth_time,
          birth_location: birthDetails.birth_location,
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
          timezone: birthDetails.timezone,
        },
        headers: { 'X-API-Key': PYTHON_API_KEY },
        timeout: 30000,
      }
    );

    const horoscopeData = pythonResponse.data;

    const birthDate = new Date(birthDetails.birth_date);
    const [horoscope] = await Horoscope.upsert({
      user_id: userId,
      horoscope_type: 'lifetime',
      category: 'general',
      period_start: birthDate,
      period_end: new Date(birthDate.getFullYear() + 100, birthDate.getMonth(), birthDate.getDate()),
      title: horoscopeData.title || 'Lifetime Analysis',
      summary: horoscopeData.summary,
      detailed_prediction: horoscopeData.detailed_prediction,
      career_prediction: horoscopeData.career_analysis,
      finance_prediction: horoscopeData.finance_analysis,
      relationship_prediction: horoscopeData.relationship_analysis,
      health_prediction: horoscopeData.health_analysis,
      overall_score: horoscopeData.overall_score,
      life_path_analysis: horoscopeData.life_path,
      strengths: horoscopeData.strengths,
      challenges: horoscopeData.challenges,
      major_periods: horoscopeData.major_dasha_periods,
    });

    return successResponse(res, 'Lifetime analysis generated', horoscope);
  } catch (error) {
    logger.error('Lifetime analysis failed', { error: error.message });
    return errorResponse(res, 'Failed to generate lifetime analysis', 500);
  }
};

// Placeholder exports
exports.getWeeklyHoroscope = async (req, res) => errorResponse(res, 'Weekly horoscope not yet implemented', 501);
exports.getHoroscopeByCategory = async (req, res) => errorResponse(res, 'Category horoscope not yet implemented', 501);
exports.getCurrentTransits = async (req, res) => errorResponse(res, 'Transits endpoint not yet implemented', 501);
exports.getTransitPredictions = async (req, res) => errorResponse(res, 'Transit predictions not yet implemented', 501);
exports.getDashaPredictions = async (req, res) => errorResponse(res, 'Dasha predictions not yet implemented', 501);
exports.getCompatibility = async (req, res) => errorResponse(res, 'Compatibility not yet implemented', 501);
exports.getRemedies = async (req, res) => errorResponse(res, 'Remedies not yet implemented', 501);
exports.submitFeedback = async (req, res) => errorResponse(res, 'Feedback not yet implemented', 501);
exports.getHoroscopeHistory = async (req, res) => errorResponse(res, 'History not yet implemented', 501);
exports.getAuspiciousTimes = async (req, res) => errorResponse(res, 'Muhurat not yet implemented', 501);
exports.getPersonalizedPrediction = async (req, res) => errorResponse(res, 'Personalized prediction not yet implemented', 501);
exports.regenerateHoroscope = async (req, res) => errorResponse(res, 'Regenerate not yet implemented', 501);
exports.getHoroscopeSummary = async (req, res) => errorResponse(res, 'Summary not yet implemented', 501);
exports.shareHoroscope = async (req, res) => errorResponse(res, 'Share not yet implemented', 501);
exports.downloadHoroscopePDF = async (req, res) => errorResponse(res, 'PDF download not yet implemented', 501);
exports.getNotificationSettings = async (req, res) => errorResponse(res, 'Notification settings not yet implemented', 501);
exports.updateNotificationSettings = async (req, res) => errorResponse(res, 'Update notification settings not yet implemented', 501);
exports.getZodiacSignInfo = async (req, res) => errorResponse(res, 'Zodiac info not yet implemented', 501);
exports.getPlanetPositions = async (req, res) => errorResponse(res, 'Planet positions not yet implemented', 501);
exports.getHouseAnalysis = async (req, res) => errorResponse(res, 'House analysis not yet implemented', 501);