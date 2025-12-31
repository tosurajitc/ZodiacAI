// backend/functions/files/src/utils/validator.js
// Input Validation Schemas using Joi for AstroAI Backend

const Joi = require('joi');

/**
 * User Registration Validation Schema
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character',
      'any.required': 'Password is required',
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits',
    }),
});

/**
 * User Login Validation Schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

/**
 * Birth Details Validation Schema
 */
const birthDetailsSchema = Joi.object({

  name: Joi.string()
  .min(2)
  .max(100)
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),


  dateOfBirth: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.base': 'Please provide a valid date of birth',
      'date.max': 'Date of birth cannot be in the future',
      'any.required': 'Date of birth is required',
    }),
  timeOfBirth: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Time must be in HH:MM format (24-hour)',
      'any.required': 'Time of birth is required',
    }),
  placeOfBirth: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Place of birth must be at least 2 characters',
      'string.max': 'Place of birth cannot exceed 100 characters',
      'any.required': 'Place of birth is required',
    }),
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required',
    }),
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required',
    }),
  timezone: Joi.string()
    .required()
    .messages({
      'any.required': 'Timezone is required',
    }),
});

/**
 * Chat Message Validation Schema
 */
const chatMessageSchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message is required',
    }),
  sessionId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.uuid': 'Invalid session ID format',
    }),
});

/**
 * Feedback Validation Schema
 */
const feedbackSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required',
    }),
  comment: Joi.string()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Comment must be at least 10 characters',
      'string.max': 'Comment cannot exceed 500 characters',
    }),
  category: Joi.string()
    .valid('prediction', 'chat', 'kundli', 'general', 'bug')
    .required()
    .messages({
      'any.only': 'Invalid feedback category',
      'any.required': 'Category is required',
    }),
});

/**
 * Profile Update Validation Schema
 */
const profileUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
    }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits',
    }),
  dateOfBirth: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future',
    }),
  gender: Joi.string()
    .valid('male', 'female', 'other')
    .optional()
    .messages({
      'any.only': 'Gender must be male, female, or other',
    }),
});

/**
 * Horoscope Request Validation Schema
 */
const horoscopeRequestSchema = Joi.object({
  type: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'yearly', 'lifetime')
    .required()
    .messages({
      'any.only': 'Invalid horoscope type',
      'any.required': 'Horoscope type is required',
    }),
  date: Joi.date()
    .optional()
    .messages({
      'date.base': 'Please provide a valid date',
    }),
});

/**
 * Compatibility Check Validation Schema
 */
const compatibilitySchema = Joi.object({
  partner1: birthDetailsSchema.required(),
  partner2: birthDetailsSchema.required(),
});

/**
 * Password Change Validation Schema
 */
const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character',
      'any.required': 'New password is required',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
});

/**
 * Middleware to validate request body
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
      });
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

/**
 * Middleware to validate query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
      });
    }

    // Replace request query with validated value
    req.query = value;
    next();
  };
};

/**
 * Middleware to validate route parameters
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
      });
    }

    // Replace request params with validated value
    req.params = value;
    next();
  };
};

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  birthDetailsSchema,
  chatMessageSchema,
  feedbackSchema,
  profileUpdateSchema,
  horoscopeRequestSchema,
  compatibilitySchema,
  passwordChangeSchema,
  
  // Middleware
  validate,
  validateQuery,
  validateParams,
};