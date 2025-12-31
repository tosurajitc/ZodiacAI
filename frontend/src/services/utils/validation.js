// validation.js

const validation = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone number validation (Indian format)
  isValidPhone: (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // Name validation (only letters and spaces)
  isValidName: (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
  },

  // Date validation (YYYY-MM-DD format)
  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  // Time validation (HH:MM format)
  isValidTime: (timeString) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeString);
  },

  // Birth date validation (must be in the past and not too old)
  isValidBirthDate: (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const maxAge = 120; // Maximum age in years
    const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
    
    return (
      validation.isValidDate(dateString) &&
      date < today &&
      date > minDate
    );
  },

  // Place name validation
  isValidPlace: (place) => {
    return place && place.trim().length >= 2 && place.trim().length <= 100;
  },

  // Message validation (not empty, max length)
  isValidMessage: (message) => {
    return message && message.trim().length > 0 && message.trim().length <= 1000;
  },

  // Password validation (min 6 characters)
  isValidPassword: (password) => {
    return password && password.length >= 6;
  },

  // Latitude validation (-90 to 90)
  isValidLatitude: (lat) => {
    return !isNaN(lat) && lat >= -90 && lat <= 90;
  },

  // Longitude validation (-180 to 180)
  isValidLongitude: (lng) => {
    return !isNaN(lng) && lng >= -180 && lng <= 180;
  },

  // Timezone validation (e.g., "Asia/Kolkata", "+05:30")
  isValidTimezone: (timezone) => {
    return timezone && timezone.trim().length > 0;
  },

  // Birth details validation (complete object)
  validateBirthDetails: (details) => {
    const errors = {};

    if (!validation.isValidName(details.name)) {
      errors.name = 'Please enter a valid name (2-50 characters, letters only)';
    }

    if (!validation.isValidBirthDate(details.dateOfBirth)) {
      errors.dateOfBirth = 'Please enter a valid birth date';
    }

    if (!validation.isValidTime(details.timeOfBirth)) {
      errors.timeOfBirth = 'Please enter a valid time (HH:MM format)';
    }

    if (!validation.isValidPlace(details.placeOfBirth)) {
      errors.placeOfBirth = 'Please enter a valid place of birth';
    }

    if (!validation.isValidLatitude(details.latitude)) {
      errors.latitude = 'Invalid latitude';
    }

    if (!validation.isValidLongitude(details.longitude)) {
      errors.longitude = 'Invalid longitude';
    }

    if (!validation.isValidTimezone(details.timezone)) {
      errors.timezone = 'Invalid timezone';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // User profile validation
  validateUserProfile: (profile) => {
    const errors = {};

    if (!validation.isValidName(profile.name)) {
      errors.name = 'Please enter a valid name';
    }

    if (!validation.isValidEmail(profile.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (profile.phone && !validation.isValidPhone(profile.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Feedback validation
  validateFeedback: (feedback) => {
    const errors = {};

    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      errors.rating = 'Please select a rating between 1 and 5';
    }

    if (!feedback.message || feedback.message.trim().length < 10) {
      errors.message = 'Please provide feedback (minimum 10 characters)';
    }

    if (feedback.message && feedback.message.length > 500) {
      errors.message = 'Feedback is too long (maximum 500 characters)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Sanitize input (remove special characters, trim)
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  },

  // Check if string contains only numbers
  isNumeric: (value) => {
    return /^\d+$/.test(value);
  },

  // Check if empty or whitespace
  isEmpty: (value) => {
    return !value || value.trim().length === 0;
  },
};

export default validation;