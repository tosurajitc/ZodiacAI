// backend/functions/files/src/controllers/kundliController.js
// Kundli Generation & Management Controller for AstroAI Backend

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const logger = require('../utils/logger');
const {
  successResponse,
  createdResponse,
  kundliResponse,
  notFoundResponse,
  conflictResponse,
  errorResponse,
} = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const { BirthDetails } = require('../models');

/**
 * @desc    Generate new kundli from birth details
 * @route   POST /api/kundli/generate
 * @access  Private
 */
const generateKundli = asyncHandler(async (req, res) => {
  console.log('=== INCOMING REQUEST ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, latitude, longitude, timezone } = req.body;
  const userId = req.user.id;

  // Mock kundli data (TEMPORARY - will be replaced with Python engine data)
  const kundliData = {
    chart: {
      rasi: {
        houses: [
          { house: 1, sign: 'Gemini', planets: ['Mercury', 'Venus'] },
          { house: 2, sign: 'Cancer', planets: [] },
          { house: 3, sign: 'Leo', planets: ['Sun'] },
          { house: 4, sign: 'Virgo', planets: [] },
          { house: 5, sign: 'Libra', planets: ['Mars'] },
          { house: 6, sign: 'Scorpio', planets: ['Ketu'] },
          { house: 7, sign: 'Sagittarius', planets: [] },
          { house: 8, sign: 'Capricorn', planets: ['Saturn'] },
          { house: 9, sign: 'Aquarius', planets: [] },
          { house: 10, sign: 'Pisces', planets: ['Jupiter'] },
          { house: 11, sign: 'Aries', planets: [] },
          { house: 12, sign: 'Taurus', planets: ['Moon', 'Rahu'] },
        ],
      },
      navamsa: {
        houses: [
          { house: 1, sign: 'Leo', planets: ['Sun'] },
        ],
      },
    },
    birthDetails: {
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      latitude,
      longitude,
      timezone,
    },
    planets: [
      {
        name: 'Sun',
        sign: 'Leo',
        degree: '15°30\'',
        house: 3,
        retrograde: false,
        nakshatra: 'Magha',
        nakshatraPada: 2,
      },
      {
        name: 'Moon',
        sign: 'Taurus',
        degree: '23°12\'',
        house: 12,
        retrograde: false,
        nakshatra: 'Mrigashira',
        nakshatraPada: 1,
      },
      {
        name: 'Mars',
        sign: 'Libra',
        degree: '8°42\'',
        house: 5,
        retrograde: false,
        nakshatra: 'Chitra',
        nakshatraPada: 3,
      },
      {
        name: 'Mercury',
        sign: 'Gemini',
        degree: '12°24\'',
        house: 1,
        retrograde: false,
        nakshatra: 'Ardra',
        nakshatraPada: 1,
      },
      {
        name: 'Jupiter',
        sign: 'Pisces',
        degree: '28°54\'',
        house: 10,
        retrograde: false,
        nakshatra: 'Revati',
        nakshatraPada: 4,
      },
      {
        name: 'Venus',
        sign: 'Gemini',
        degree: '19°18\'',
        house: 1,
        retrograde: false,
        nakshatra: 'Punarvasu',
        nakshatraPada: 2,
      },
      {
        name: 'Saturn',
        sign: 'Capricorn',
        degree: '7°6\'',
        house: 8,
        retrograde: true,
        nakshatra: 'Uttara Ashadha',
        nakshatraPada: 2,
      },
      {
        name: 'Rahu',
        sign: 'Taurus',
        degree: '25°36\'',
        house: 12,
        retrograde: true,
        nakshatra: 'Mrigashira',
        nakshatraPada: 2,
      },
      {
        name: 'Ketu',
        sign: 'Scorpio',
        degree: '25°36\'',
        house: 6,
        retrograde: true,
        nakshatra: 'Jyeshtha',
        nakshatraPada: 2,
      },
    ],
    houses: [
      { house: 1, cusp: 'Gemini 15°30\'', lord: 'Mercury' },
      { house: 2, cusp: 'Cancer 12°45\'', lord: 'Moon' },
      { house: 3, cusp: 'Leo 10°20\'', lord: 'Sun' },
      { house: 4, cusp: 'Virgo 8°15\'', lord: 'Mercury' },
      { house: 5, cusp: 'Libra 7°30\'', lord: 'Venus' },
      { house: 6, cusp: 'Scorpio 9°00\'', lord: 'Mars' },
      { house: 7, cusp: 'Sagittarius 15°30\'', lord: 'Jupiter' },
      { house: 8, cusp: 'Capricorn 12°45\'', lord: 'Saturn' },
      { house: 9, cusp: 'Aquarius 10°20\'', lord: 'Saturn' },
      { house: 10, cusp: 'Pisces 8°15\'', lord: 'Jupiter' },
      { house: 11, cusp: 'Aries 7°30\'', lord: 'Mars' },
      { house: 12, cusp: 'Taurus 9°00\'', lord: 'Venus' },
    ],
    dashas: {
      currentDasha: {
        mahadasha: 'Venus',
        antardasha: 'Moon',
        pratyantardasha: 'Mars',
        startDate: '2024-12-01',
        endDate: '2025-02-15',
      },
    },
  };

  // Create kundli object with unique ID
  const kundliId = uuidv4();
  const kundli = {
    id: kundliId,
    userId,
    ...kundliData,
    createdAt: new Date(),
  };

  logger.info('Kundli generated', { userId, kundliId });

  // Save to database
  try {
    console.log('=== ATTEMPTING DATABASE INSERT ===');
    console.log('Data:', { id: kundliId, user_id: userId, name: name });

    const { User } = require('../models');

    // Ensure user exists in database
    await User.findOrCreate({
      where: { id: userId },
      defaults: {
        id: userId,
        email: req.user.email || 'unknown@email.com',
        name: name
      }
    });


    await BirthDetails.create({
      id: kundliId,
      user_id: userId,
      name: name,
      birth_date: dateOfBirth,
      birth_time: timeOfBirth,
      birth_location: placeOfBirth,
      latitude: latitude,
      longitude: longitude,
      timezone: timezone,
      rasi_chart: JSON.stringify(kundliData.chart.rasi),
      navamsa_chart: JSON.stringify(kundliData.chart.navamsa),
      planetary_positions: JSON.stringify(kundliData.planets),
      house_cusps: JSON.stringify(kundliData.houses),
      current_dasha: JSON.stringify(kundliData.dashas.currentDasha),
      chart_generated_at: new Date(),
    });

    console.log('=== SUCCESS ===');
  } catch (err) {
    console.error('=== DATABASE ERROR ===');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    throw err;
  }

  logger.info('Kundli saved to database', { userId, kundliId });

  // Return response with ID included
  return kundliResponse(res, 'Kundli generated successfully', {
    id: kundliId,
    kundli: kundliData.chart,
    birthDetails: kundliData.birthDetails,
    planetaryPositions: kundliData.planets,
    houses: kundliData.houses,
    dashas: kundliData.dashas,
    generatedAt: kundli.createdAt.toISOString()
  });
});

/**
 * @desc    Get user's saved kundli
 * @route   GET /api/kundli
 * @access  Private
 */
const getUserKundli = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const kundli = {
    id: uuidv4(),
    userId,
    birthDetails: {
      dateOfBirth: '1990-05-15',
      timeOfBirth: '14:30',
      placeOfBirth: 'Mumbai, India',
    },
    createdAt: new Date(),
  };

  return successResponse(res, 'Kundli retrieved', kundli);
});

/**
 * @desc    Get specific kundli by ID
 * @route   GET /api/kundli/:id
 * @access  Private
 */
const getKundliById = asyncHandler(async (req, res) => {
  return notFoundResponse(res, 'Kundli');
});

/**
 * @desc    Update kundli birth details
 * @route   PUT /api/kundli/:id
 * @access  Private
 */
const updateKundli = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  logger.info('Kundli updated', { userId, kundliId: id });

  return successResponse(res, 'Kundli updated successfully');
});

/**
 * @desc    Delete kundli
 * @route   DELETE /api/kundli/:id
 * @access  Private
 */
const deleteKundli = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  logger.info('Kundli deleted', { userId, kundliId: id });

  return successResponse(res, 'Kundli deleted successfully');
});

/**
 * @desc    Get birth chart (Rasi chart - D1)
 * @route   GET /api/kundli/:id/chart
 * @access  Private
 */
const getBirthChart = asyncHandler(async (req, res) => {
  const chart = {
    type: 'rasi',
    houses: [
      { house: 1, sign: 'Gemini', planets: ['Mercury', 'Venus'] },
      { house: 2, sign: 'Cancer', planets: [] },
      { house: 3, sign: 'Leo', planets: ['Sun'] },
    ],
  };

  return successResponse(res, 'Birth chart retrieved', chart);
});

/**
 * @desc    Get Navamsa chart (D9)
 * @route   GET /api/kundli/:id/navamsa
 * @access  Private
 */
const getNavamsaChart = asyncHandler(async (req, res) => {
  const chart = {
    type: 'navamsa',
    houses: [
      { house: 1, sign: 'Leo', planets: ['Sun'] },
    ],
  };

  return successResponse(res, 'Navamsa chart retrieved', chart);
});

/**
 * @desc    Get divisional chart (D1-D60)
 * @route   GET /api/kundli/:id/divisional/:type
 * @access  Private (Premium)
 */
const getDivisionalChart = asyncHandler(async (req, res) => {
  const { type } = req.params;

  const names = {
    '1': 'Rasi (Main Birth Chart)',
    '2': 'Hora (Wealth)',
    '9': 'Navamsa (Marriage)',
    '10': 'Dasamsa (Career)',
  };

  const chart = {
    type: `D${type}`,
    name: names[type] || `D${type}`,
    houses: [],
  };

  return successResponse(res, 'Divisional chart retrieved', chart);
});

/**
 * @desc    Get planetary positions
 * @route   GET /api/kundli/:id/planets
 * @access  Private
 */
const getPlanetaryPositions = asyncHandler(async (req, res) => {
  const planets = [
    {
      name: 'Sun',
      sign: 'Leo',
      degree: 15.5,
      house: 3,
      retrograde: false,
      nakshatra: 'Magha',
      lord: 'Sun',
    },
  ];

  return successResponse(res, 'Planetary positions retrieved', planets);
});

/**
 * @desc    Get house positions and cusps
 * @route   GET /api/kundli/:id/houses
 * @access  Private
 */
const getHouses = asyncHandler(async (req, res) => {
  const houses = [
    {
      house: 1,
      sign: 'Gemini',
      cusp: '15°30\'',
      lord: 'Mercury',
      planets: ['Mercury', 'Venus'],
      significance: 'Self, appearance, personality',
    },
  ];

  return successResponse(res, 'Houses retrieved', houses);
});

/**
 * @desc    Get Vimshottari dasha periods
 * @route   GET /api/kundli/:id/dasha
 * @access  Private
 */
const getDashaPeriods = asyncHandler(async (req, res) => {
  const dashas = {
    current: {
      mahadasha: {
        planet: 'Venus',
        startDate: '2020-01-01',
        endDate: '2030-01-01',
        remainingYears: 5,
      },
    },
  };

  return successResponse(res, 'Dasha periods retrieved', dashas);
});

/**
 * @desc    Get yogas (combinations) in chart
 * @route   GET /api/kundli/:id/yogas
 * @access  Private
 */
const getYogas = asyncHandler(async (req, res) => {
  const yogas = [
    {
      name: 'Gajakesari Yoga',
      description: 'Jupiter and Moon in mutual kendras',
      effect: 'Wisdom, prosperity, and good character',
      strength: 'Strong',
    },
  ];

  return successResponse(res, 'Yogas retrieved', yogas);
});

/**
 * @desc    Get doshas (Mangal, Kaal Sarp, etc.)
 * @route   GET /api/kundli/:id/doshas
 * @access  Private
 */
const getDoshas = asyncHandler(async (req, res) => {
  const doshas = [
    {
      name: 'Mangal Dosha',
      present: true,
      severity: 'Moderate',
      description: 'Mars in 7th house',
      remedies: ['Marry after 28 years of age'],
    },
  ];

  return successResponse(res, 'Doshas retrieved', doshas);
});

/**
 * @desc    Get planetary strengths
 * @route   GET /api/kundli/:id/strengths
 * @access  Private (Premium)
 */
const getPlanetaryStrengths = asyncHandler(async (req, res) => {
  const strengths = [
    {
      planet: 'Sun',
      shadbala: 425.5,
      ashtakavarga: 32,
      dignity: 'Exalted',
      strength: 'Very Strong',
    },
  ];

  return successResponse(res, 'Planetary strengths retrieved', strengths);
});

/**
 * @desc    Get planetary aspects
 * @route   GET /api/kundli/:id/aspects
 * @access  Private
 */
const getPlanetaryAspects = asyncHandler(async (req, res) => {
  const aspects = [
    {
      from: 'Jupiter',
      to: 'Moon',
      type: 'Trine',
      angle: 120,
      effect: 'Beneficial',
    },
  ];

  return successResponse(res, 'Planetary aspects retrieved', aspects);
});

/**
 * @desc    Get nakshatra details
 * @route   GET /api/kundli/:id/nakshatras
 * @access  Private
 */
const getNakshatraDetails = asyncHandler(async (req, res) => {
  const nakshatras = {
    birthNakshatra: {
      name: 'Mrigashira',
      pada: 1,
      lord: 'Mars',
      deity: 'Soma',
    },
  };

  return successResponse(res, 'Nakshatra details retrieved', nakshatras);
});

/**
 * @desc    Get complete kundli summary
 * @route   GET /api/kundli/:id/summary
 * @access  Private
 */
const getKundliSummary = asyncHandler(async (req, res) => {
  const summary = {
    basicInfo: {
      ascendant: 'Gemini',
      moonSign: 'Taurus',
      sunSign: 'Leo',
    },
  };

  return successResponse(res, 'Kundli summary retrieved', summary);
});

/**
 * @desc    Download kundli as PDF
 * @route   GET /api/kundli/:id/pdf
 * @access  Private
 */
const downloadKundliPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  logger.info('PDF download requested', { 
    service: 'astroai-backend',
    userId, 
    kundliId: id 
  });

  try {
    // Fetch actual kundli from database
    const birthDetails = await BirthDetails.findOne({
      where: { 
        id: id,
        user_id: userId
      }
    });

    if (!birthDetails) {
      logger.warn('Kundli not found', { userId, kundliId: id });
      return res.status(404).json({
        success: false,
        message: 'Kundli not found or unauthorized'
      });
    }

    logger.info('Kundli fetched from DB', { 
      kundliId: id, 
      name: birthDetails.name,
      place: birthDetails.birth_location 
    });

    // Parse chart data from database
    const rasiChart = birthDetails.rasi_chart ? JSON.parse(birthDetails.rasi_chart) : { houses: [] };
    const planets = birthDetails.planetary_positions ? JSON.parse(birthDetails.planetary_positions) : [];
    const houses = birthDetails.house_cusps ? JSON.parse(birthDetails.house_cusps) : [];

    const kundliData = {
      birthDetails: {
        name: birthDetails.name,
        dateOfBirth: birthDetails.birth_date,
        timeOfBirth: birthDetails.birth_time,
        placeOfBirth: birthDetails.birth_location,
        latitude: birthDetails.latitude,
        longitude: birthDetails.longitude,
        timezone: birthDetails.timezone
      },
      chartData: {
        planets: planets,
        houses: houses,
        rasi: rasiChart
      }
    };

    // Import pdfService
    const pdfService = require('../services/pdfService');

    // Generate PDF
    logger.info('Generating PDF with real data', { 
      service: 'astroai-backend',
      kundliId: id,
      userName: kundliData.birthDetails.name
    });

    const pdfBuffer = await pdfService.generateKundliPDF({
      birthDetails: kundliData.birthDetails,
      chartData: kundliData.chartData,
      userName: kundliData.birthDetails.name
    });

    // Set response headers for file download
    const filename = `Kundli_${kundliData.birthDetails.name}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    logger.info('PDF generated successfully', {
      service: 'astroai-backend',
      kundliId: id,
      fileSize: pdfBuffer.length,
      filename: filename
    });

    return res.send(pdfBuffer);

  } catch (error) {
    logger.error('PDF generation failed', {
      service: 'astroai-backend',
      error: error.message,
      stack: error.stack,
      kundliId: id
    });
    
    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Generate shareable link for kundli
 * @route   GET /api/kundli/:id/share
 * @access  Private
 */
const generateShareLink = asyncHandler(async (req, res) => {
  const shareUrl = `${process.env.FRONTEND_URL}/kundli/shared/${uuidv4()}`;

  return successResponse(res, 'Share link generated', { shareUrl });
});

/**
 * @desc    Match two kundlis for compatibility
 * @route   POST /api/kundli/match
 * @access  Private (Premium)
 */
const matchKundlis = asyncHandler(async (req, res) => {
  const match = {
    totalScore: 28,
    maxScore: 36,
    percentage: 78,
  };

  return successResponse(res, 'Kundli matching complete', match);
});

/**
 * @desc    Add family member's kundli
 * @route   POST /api/kundli/:id/add-family
 * @access  Private
 */
const addFamilyMember = asyncHandler(async (req, res) => {
  return createdResponse(res, 'Family member kundli created');
});

/**
 * @desc    Get all family member kundlis
 * @route   GET /api/kundli/:id/family
 * @access  Private
 */
const getFamilyKundlis = asyncHandler(async (req, res) => {
  return successResponse(res, 'Family kundlis retrieved', []);
});

/**
 * @desc    Verify location
 * @route   POST /api/kundli/verify-location
 * @access  Private
 */
const verifyLocation = asyncHandler(async (req, res) => {
  const coordinates = {
    place: 'Mumbai, Maharashtra, India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
  };

  return successResponse(res, 'Location verified', coordinates);
});

/**
 * @desc    Get panchang for birth date/time
 * @route   GET /api/kundli/:id/panchang
 * @access  Private
 */
const getBirthPanchang = asyncHandler(async (req, res) => {
  const panchang = {
    tithi: 'Shukla Panchami',
    nakshatra: 'Mrigashira',
  };

  return successResponse(res, 'Birth panchang retrieved', panchang);
});

/**
 * @desc    Get current transits
 * @route   GET /api/kundli/:id/current-transits
 * @access  Private
 */
const getCurrentTransits = asyncHandler(async (req, res) => {
  return successResponse(res, 'Current transits retrieved', []);
});

module.exports = {
  generateKundli,
  getUserKundli,
  getKundliById,
  updateKundli,
  deleteKundli,
  getBirthChart,
  getNavamsaChart,
  getDivisionalChart,
  getPlanetaryPositions,
  getHouses,
  getDashaPeriods,
  getYogas,
  getDoshas,
  getPlanetaryStrengths,
  getPlanetaryAspects,
  getNakshatraDetails,
  getKundliSummary,
  downloadKundliPDF,
  generateShareLink,
  matchKundlis,
  addFamilyMember,
  getFamilyKundlis,
  verifyLocation,
  getBirthPanchang,
  getCurrentTransits,
};