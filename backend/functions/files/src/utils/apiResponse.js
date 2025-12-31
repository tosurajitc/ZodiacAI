// backend/functions/files/src/utils/apiResponse.js
// Standardized API Response Helper for AstroAI Backend

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} data - Response data
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {String} code - Error code
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {Object} details - Additional error details
 */
const errorResponse = (res, message, code = 'ERROR', statusCode = 400, details = null) => {
  const response = {
    success: false,
    error: {
      message,
      code,
    },
    timestamp: new Date().toISOString(),
  };

  if (details !== null) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Created Response (201)
 * For successful resource creation
 */
const createdResponse = (res, message, data = null) => {
  return successResponse(res, message, data, 201);
};

/**
 * No Content Response (204)
 * For successful operations with no content to return
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Paginated Response
 * For list endpoints with pagination
 */
const paginatedResponse = (res, message, data, pagination) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: pagination.totalPages || 1,
      totalItems: pagination.totalItems || 0,
      hasNextPage: pagination.hasNextPage || false,
      hasPrevPage: pagination.hasPrevPage || false,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
};

/**
 * Validation Error Response (400)
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(
    res,
    'Validation failed',
    'VALIDATION_ERROR',
    400,
    errors
  );
};

/**
 * Unauthorized Response (401)
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 'UNAUTHORIZED', 401);
};

/**
 * Forbidden Response (403)
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 'FORBIDDEN', 403);
};

/**
 * Not Found Response (404)
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 'NOT_FOUND', 404);
};

/**
 * Conflict Response (409)
 */
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 'CONFLICT', 409);
};

/**
 * Too Many Requests Response (429)
 */
const rateLimitResponse = (res, message = 'Too many requests. Please try again later') => {
  return errorResponse(res, message, 'RATE_LIMIT_EXCEEDED', 429);
};

/**
 * Internal Server Error Response (500)
 */
const internalErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 'INTERNAL_ERROR', 500);
};

/**
 * Service Unavailable Response (503)
 */
const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
  return errorResponse(res, message, 'SERVICE_UNAVAILABLE', 503);
};

/**
 * Custom Response
 * For special cases not covered by standard responses
 */
const customResponse = (res, statusCode, success, message, data = null, error = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  if (error !== null) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Auth Success Response
 * Specialized response for authentication endpoints
 */
const authSuccessResponse = (res, message, user, token, refreshToken = null) => {
  const response = {
    success: true,
    message,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber || null,
        subscriptionTier: user.subscriptionTier || 'free',
        createdAt: user.createdAt,
      },
      token,
    },
    timestamp: new Date().toISOString(),
  };

  if (refreshToken) {
    response.data.refreshToken = refreshToken;
  }

  return res.status(200).json(response);
};

/**
 * Kundli Response
 * Specialized response for kundli data
 */
const kundliResponse = (res, message, kundliData) => {
  const response = {
    success: true,
    message,
    data: {
      id: kundliData.id,  // ← ADD THIS LINE
      kundli: kundliData.kundli || kundliData.chart,
      birthDetails: kundliData.birthDetails,
      planetaryPositions: kundliData.planetaryPositions || kundliData.planets,
      houses: kundliData.houses,
      dashas: kundliData.dashas || null,
      generatedAt: kundliData.generatedAt || new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
};

/**
 * Horoscope Response
 * Specialized response for horoscope predictions
 */
const horoscopeResponse = (res, message, horoscopeData) => {
  const response = {
    success: true,
    message,
    data: {
      type: horoscopeData.type,
      predictions: horoscopeData.predictions,
      scores: horoscopeData.scores || null,
      remedies: horoscopeData.remedies || null,
      validFrom: horoscopeData.validFrom || null,
      validTo: horoscopeData.validTo || null,
      generatedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
};

/**
 * Chat Response
 * Specialized response for AI chat
 */
const chatResponse = (res, message, chatData) => {
  const response = {
    success: true,
    message,
    data: {
      sessionId: chatData.sessionId,
      response: chatData.response,
      remainingQuestions: chatData.remainingQuestions || null,
      conversationHistory: chatData.conversationHistory || null,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
};

/**
 * Analytics Response
 * For dashboard analytics data
 */
const analyticsResponse = (res, message, analyticsData) => {
  const response = {
    success: true,
    message,
    data: {
      metrics: analyticsData.metrics,
      period: analyticsData.period,
      generatedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
};

module.exports = {
  // Standard responses
  successResponse,
  errorResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
  
  // Error responses
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  rateLimitResponse,
  internalErrorResponse,
  serviceUnavailableResponse,
  
  // Custom responses
  customResponse,
  
  // Specialized responses
  authSuccessResponse,
  kundliResponse,
  horoscopeResponse,
  chatResponse,
  analyticsResponse,
};