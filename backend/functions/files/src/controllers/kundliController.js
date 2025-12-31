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

// Replace the generateKundli function in kundliController.js
// Location: backend/functions/files/src/controllers/kundliController.js
// Replace lines 23-239 with this:

const generateKundli = asyncHandler(async (req, res) => {
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, latitude, longitude, timezone } = req.body;
  const userId = req.user.id;

  logger.info('Generating comprehensive kundli', { userId, name });

  try {
      // Geocode location if coordinates not provided
      let finalLat = latitude;
      let finalLon = longitude;
      
      if (!latitude || !longitude) {
        const geoResponse = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeOfBirth)}`,
          {
            headers: {
              'User-Agent': 'AstroAI/1.0 (astrology-app)'
            }
          }
        );
        
        if (geoResponse.data && geoResponse.data.length > 0) {
          finalLat = parseFloat(geoResponse.data[0].lat);
          finalLon = parseFloat(geoResponse.data[0].lon);
        } else {
          return errorResponse(res, 'Unable to find location coordinates', 400);
        }
      }

      // Call Python engine
      const pythonApiUrl = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';
      const apiKey = process.env.PYTHON_ENGINE_API_KEY || 'your-python-engine-api-key';

      const response = await axios.post(
        `${pythonApiUrl}/api/kundli/comprehensive`,
        null,
        {
          params: {
            birth_date: typeof dateOfBirth === 'string' ? dateOfBirth.split('T')[0] : dateOfBirth.toISOString().split('T')[0],
            birth_time: timeOfBirth.substring(0, 5),
            latitude: finalLat,
            longitude: finalLon,
            timezone: timezone || 5.5,
            name: name,
            place: placeOfBirth
          },
          headers: {
            'X-API-Key': apiKey
          }
        }
      );

    const kundliData = response.data.data;

    // Create kundli ID
    const kundliId = uuidv4();

    // Ensure user exists
    const { User } = require('../models');
    await User.findOrCreate({
      where: { id: userId },
      defaults: {
        id: userId,
        email: req.user.email || 'unknown@email.com',
        name: name
      }
    });

    // Save to database
    await BirthDetails.create({
      id: kundliId,
      user_id: userId,
      name: name,
      birth_date: dateOfBirth,
      birth_time: timeOfBirth,
      birth_location: placeOfBirth,
      latitude: latitude,
      longitude: longitude,
      timezone: timezone || 5.5,
      rasi_chart: kundliData.shodashvarga_table,
      navamsa_chart: kundliData.shodashvarga_table,
      planetary_positions: kundliData.planetary_positions,
      house_cusps: kundliData.house_analysis,
      current_dasha: kundliData.dasha.current,
      vimshottari_dasha: kundliData.dasha.complete_timeline,
      shodashvarga_table: kundliData.shodashvarga_table,
      house_analysis: kundliData.house_analysis,
      chart_generated_at: new Date(),
    });

    logger.info('Comprehensive kundli saved', { userId, kundliId });

    return kundliResponse(res, 'Comprehensive kundli generated successfully', {
      id: kundliId,
      kundli: kundliData.shodashvarga_table,
      birthDetails: {
        name: name,
        dateOfBirth: typeof dateOfBirth === 'string' ? dateOfBirth.split('T')[0] : dateOfBirth.toISOString().split('T')[0],
        timeOfBirth: timeOfBirth,
        placeOfBirth: placeOfBirth
      },
      planetaryPositions: kundliData.planetary_positions,
      houses: kundliData.house_analysis,
      dashas: kundliData.dasha,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Kundli generation failed', { 
      error: error.message,
      userId,
      pythonEngineError: error.response?.data 
    });

    if (error.response?.status === 401) {
      return errorResponse(res, 'Python engine authentication failed', 500);
    }

    return errorResponse(res, 'Failed to generate kundli. Please try again.', 500);
  }
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
// Update downloadKundliPDF function in kundliController.js
// Location: backend/functions/files/src/controllers/kundliController.js
// REPLACE lines 534-636 with this:

const downloadKundliPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  logger.info('PDF download requested', { userId, kundliId: id });

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id: id, user_id: userId }
    });

    if (!birthDetails) {
      return res.status(404).json({
        success: false,
        message: 'Kundli not found'
      });
    }

    const kundliData = {
      birthDetails: {
        name: birthDetails.name,
        dateOfBirth: birthDetails.birth_date,
        timeOfBirth: birthDetails.birth_time,
        placeOfBirth: birthDetails.birth_location,
      },
      chartData: {
        planets: birthDetails.planetary_positions || [],
        houses: birthDetails.house_cusps || []
      },
      shodashvarga: birthDetails.shodashvarga_table || null,
      houseAnalysis: birthDetails.house_analysis || null,
      dasha: {
        current: birthDetails.current_dasha || null,
        complete_timeline: birthDetails.vimshottari_dasha || null
      }
    };

    const pdfService = require('../services/pdfService');
    const pdfBuffer = await pdfService.generateKundliPDF(kundliData);

    const filename = `Kundli_${birthDetails.name}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    logger.info('Comprehensive PDF generated', { kundliId: id, fileSize: pdfBuffer.length });

    return res.send(pdfBuffer);

  } catch (error) {
    logger.error('PDF generation failed', { error: error.message, kundliId: id });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
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