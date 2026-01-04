// frontend/src/services/utils/zodiacCalculator.js
// Zodiac sign calculator based on birth date

// Zodiac sign data with date ranges (Western/Tropical zodiac)
const ZODIAC_SIGNS = [
  {
    sign: 'Aries',
    symbol: '♈',
    element: 'Fire',
    ruler: 'Mars',
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
  },
  {
    sign: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    ruler: 'Venus',
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
  },
  {
    sign: 'Gemini',
    symbol: '♊',
    element: 'Air',
    ruler: 'Mercury',
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20,
  },
  {
    sign: 'Cancer',
    symbol: '♋',
    element: 'Water',
    ruler: 'Moon',
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22,
  },
  {
    sign: 'Leo',
    symbol: '♌',
    element: 'Fire',
    ruler: 'Sun',
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
  },
  {
    sign: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    ruler: 'Mercury',
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
  },
  {
    sign: 'Libra',
    symbol: '♎',
    element: 'Air',
    ruler: 'Venus',
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
  },
  {
    sign: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    ruler: 'Mars',
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21,
  },
  {
    sign: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    ruler: 'Jupiter',
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
  },
  {
    sign: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    ruler: 'Saturn',
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
  },
  {
    sign: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    ruler: 'Saturn',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
  },
  {
    sign: 'Pisces',
    symbol: '♓',
    element: 'Water',
    ruler: 'Jupiter',
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
  },
];

/**
 * Calculate zodiac sign from birth date
 * @param {string|Date} birthDate - Birth date in 'YYYY-MM-DD' format or Date object
 * @returns {Object} - Zodiac sign details
 */
export const getZodiacSign = (birthDate) => {
  let date;

  // Parse birth date
  if (typeof birthDate === 'string') {
    date = new Date(birthDate);
  } else if (birthDate instanceof Date) {
    date = birthDate;
  } else {
    throw new Error('Invalid birth date format');
  }

  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();

  // Find matching zodiac sign
  for (const zodiac of ZODIAC_SIGNS) {
    const { startMonth, startDay, endMonth, endDay } = zodiac;

    // Handle zodiac signs that span across year boundary (Capricorn)
    if (startMonth > endMonth) {
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        return zodiac;
      }
    } else {
      // Normal case
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      ) {
        return zodiac;
      }
    }
  }

  // Fallback (should never reach here)
  return ZODIAC_SIGNS[0];
};

/**
 * Get zodiac sign name only
 * @param {string|Date} birthDate - Birth date
 * @returns {string} - Zodiac sign name
 */
export const getZodiacSignName = (birthDate) => {
  return getZodiacSign(birthDate).sign;
};

/**
 * Get all zodiac signs
 * @returns {Array} - Array of all zodiac signs
 */
export const getAllZodiacSigns = () => {
  return ZODIAC_SIGNS;
};

/**
 * Get zodiac sign by name
 * @param {string} signName - Name of the sign
 * @returns {Object|null} - Zodiac sign details or null
 */
export const getZodiacSignByName = (signName) => {
  return ZODIAC_SIGNS.find(
    (z) => z.sign.toLowerCase() === signName.toLowerCase()
  ) || null;
};

/**
 * Format zodiac sign for display
 * @param {string|Date} birthDate - Birth date
 * @returns {string} - Formatted string like "Leo ♌"
 */
export const formatZodiacSign = (birthDate) => {
  const zodiac = getZodiacSign(birthDate);
  return `${zodiac.sign} ${zodiac.symbol}`;
};

/**
 * Check if two dates are compatible (simple element-based compatibility)
 * @param {string|Date} date1 - First birth date
 * @param {string|Date} date2 - Second birth date
 * @returns {Object} - Compatibility result
 */
export const checkZodiacCompatibility = (date1, date2) => {
  const sign1 = getZodiacSign(date1);
  const sign2 = getZodiacSign(date2);

  // Element compatibility matrix
  const compatibility = {
    Fire: { Fire: 'High', Earth: 'Medium', Air: 'High', Water: 'Low' },
    Earth: { Fire: 'Medium', Earth: 'High', Air: 'Low', Water: 'High' },
    Air: { Fire: 'High', Earth: 'Low', Air: 'High', Water: 'Medium' },
    Water: { Fire: 'Low', Earth: 'High', Air: 'Medium', Water: 'High' },
  };

  const compatibilityLevel = compatibility[sign1.element][sign2.element];

  return {
    sign1: sign1.sign,
    sign2: sign2.sign,
    compatibility: compatibilityLevel,
    description: getCompatibilityDescription(compatibilityLevel),
  };
};

/**
 * Get compatibility description
 * @param {string} level - Compatibility level
 * @returns {string} - Description
 */
const getCompatibilityDescription = (level) => {
  const descriptions = {
    High: 'Excellent compatibility! Your energies align naturally.',
    Medium: 'Good compatibility with some effort required.',
    Low: 'Challenging compatibility, but growth potential exists.',
  };
  return descriptions[level] || 'Compatibility varies.';
};

/**
 * Get current zodiac period
 * @returns {Object} - Current zodiac sign period
 */
export const getCurrentZodiacPeriod = () => {
  const today = new Date();
  return getZodiacSign(today);
};

/**
 * Validate birth date format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} - True if valid
 */
export const isValidBirthDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const today = new Date();

  // Check if date is valid and not in future
  return date instanceof Date && !isNaN(date) && date <= today;
};

export default {
  getZodiacSign,
  getZodiacSignName,
  getAllZodiacSigns,
  getZodiacSignByName,
  formatZodiacSign,
  checkZodiacCompatibility,
  getCurrentZodiacPeriod,
  isValidBirthDate,
};
