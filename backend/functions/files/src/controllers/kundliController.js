// backend/functions/files/src/controllers/kundliController.js
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const logger = require('../utils/logger');
const pythonEngine = require('../services/pythonEngineService');
const {
  successResponse,
  createdResponse,
  kundliResponse,
  notFoundResponse,
  conflictResponse,
  errorResponse,
} = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/errorHandler');
const { BirthDetails, User } = require('../models');

/**
 * @desc    Generate new kundli from birth details
 * @route   POST /api/kundli/generate
 * @access  Private
 */
const generateKundli = asyncHandler(async (req, res) => {
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, latitude, longitude, timezone } = req.body;
  const userId = req.user.id;

  logger.info('Generating comprehensive kundli', { userId, name });

  try {
    let finalLat = latitude;
    let finalLon = longitude;
    
    // Geocode location if coordinates not provided
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

    // Call Python engine using service
    const birthData = {
      birthDate: typeof dateOfBirth === 'string' ? dateOfBirth.split('T')[0] : dateOfBirth.toISOString().split('T')[0],
      birthTime: timeOfBirth.substring(0, 5),
      latitude: finalLat,
      longitude: finalLon,
      timezone: timezone || 5.5,
      name: name,
      place: placeOfBirth
    };

    const result = await pythonEngine.generateComprehensiveKundli(birthData);

    if (!result.success) {
      return errorResponse(res, 'Failed to generate kundli from Python engine', 500);
    }

    const kundliData = result.data;

    // Ensure user exists
    await User.findOrCreate({
      where: { id: userId },
      defaults: {
        id: userId,
        email: req.user.email || 'unknown@email.com',
        full_name: name
      }
    });

    // Save or update birth details
    const [birthDetailsRecord, created] = await BirthDetails.upsert({
      user_id: userId,
      name: name,
      birth_date: dateOfBirth,
      birth_time: timeOfBirth,
      birth_location: placeOfBirth,
      latitude: finalLat,
      longitude: finalLon,
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
    }, {
      conflictFields: ['user_id']
    });
    
    logger.info(created ? 'New birth details created' : 'Birth details updated', { userId, kundliId: birthDetailsRecord.id });

    return kundliResponse(res, created ? 'Kundli generated successfully' : 'Kundli updated successfully', {
      id: birthDetailsRecord.id,
      kundli: kundliData.shodashvarga_table,
      birthDetails: {
        name: name,
        dateOfBirth: birthData.birthDate,
        timeOfBirth: timeOfBirth,
        placeOfBirth: placeOfBirth
      },
      planetaryPositions: kundliData.planetary_positions,
      houses: kundliData.house_analysis,
      dashas: kundliData.dasha,
      generatedAt: new Date().toISOString(),
      isUpdate: !created
    });

  } catch (error) {
    logger.error('Kundli generation failed', { 
      error: error.message,
      userId,
      stack: error.stack
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

  try {
    // Fetch birth details from database
    const birthDetails = await BirthDetails.findOne({ 
      where: { user_id: userId }
    });

    if (!birthDetails) {
      return successResponse(res, 'No kundli found. Please generate your kundli first.', null);
    }

    // Return kundli data from database
    const kundliData = {
      id: birthDetails.id,
      birthDetails: {
        name: birthDetails.name,
        birth_date: birthDetails.birth_date,
        birth_time: birthDetails.birth_time,
        birth_location: birthDetails.birth_location,
      },
      kundli: birthDetails.shodashvarga_table,
      planetaryPositions: birthDetails.planetary_positions,
      houses: birthDetails.house_analysis,
      dashas: {
        current: birthDetails.current_dasha,
        complete_timeline: birthDetails.vimshottari_dasha
      },
      createdAt: birthDetails.chart_generated_at || birthDetails.created_at,
    };

    logger.info('Kundli retrieved from database', { userId });
    return successResponse(res, 'Kundli retrieved', kundliData);

  } catch (error) {
    logger.error('Error fetching kundli', { error: error.message, userId });
    return errorResponse(res, 'Failed to fetch kundli', 500);
  }
});

/**
 * @desc    Get specific kundli by ID
 * @route   GET /api/kundli/:id
 * @access  Private
 */
const getKundliById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    const kundliData = {
      id: birthDetails.id,
      birthDetails: {
        name: birthDetails.name,
        birth_date: birthDetails.birth_date,
        birth_time: birthDetails.birth_time,
        birth_location: birthDetails.birth_location,
      },
      kundli: birthDetails.shodashvarga_table,
      planetaryPositions: birthDetails.planetary_positions,
      houses: birthDetails.house_analysis,
      dashas: {
        current: birthDetails.current_dasha,
        complete_timeline: birthDetails.vimshottari_dasha
      },
      createdAt: birthDetails.chart_generated_at || birthDetails.created_at,
    };

    return successResponse(res, 'Kundli retrieved', kundliData);
  } catch (error) {
    logger.error('Error fetching kundli by ID', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch kundli', 500);
  }
});

/**
 * @desc    Update kundli birth details
 * @route   PUT /api/kundli/:id
 * @access  Private
 */
const updateKundli = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, latitude, longitude, timezone } = req.body;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    // Regenerate kundli with new details
    const birthData = {
      birthDate: typeof dateOfBirth === 'string' ? dateOfBirth.split('T')[0] : dateOfBirth.toISOString().split('T')[0],
      birthTime: timeOfBirth.substring(0, 5),
      latitude: latitude || birthDetails.latitude,
      longitude: longitude || birthDetails.longitude,
      timezone: timezone || birthDetails.timezone,
      name: name || birthDetails.name,
      place: placeOfBirth || birthDetails.birth_location
    };

    const result = await pythonEngine.generateComprehensiveKundli(birthData);

    if (!result.success) {
      return errorResponse(res, 'Failed to regenerate kundli', 500);
    }

    const kundliData = result.data;

    // Update birth details
    await birthDetails.update({
      name: name || birthDetails.name,
      birth_date: dateOfBirth || birthDetails.birth_date,
      birth_time: timeOfBirth || birthDetails.birth_time,
      birth_location: placeOfBirth || birthDetails.birth_location,
      latitude: latitude || birthDetails.latitude,
      longitude: longitude || birthDetails.longitude,
      timezone: timezone || birthDetails.timezone,
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

    logger.info('Kundli updated', { userId, kundliId: id });

    return successResponse(res, 'Kundli updated successfully', {
      id: birthDetails.id,
      kundli: kundliData.shodashvarga_table,
      birthDetails: {
        name: birthDetails.name,
        dateOfBirth: birthDetails.birth_date,
        timeOfBirth: birthDetails.birth_time,
        placeOfBirth: birthDetails.birth_location
      },
      planetaryPositions: kundliData.planetary_positions,
      houses: kundliData.house_analysis,
      dashas: kundliData.dasha,
    });
  } catch (error) {
    logger.error('Kundli update failed', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to update kundli', 500);
  }
});

/**
 * @desc    Delete kundli
 * @route   DELETE /api/kundli/:id
 * @access  Private
 */
const deleteKundli = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    await birthDetails.destroy();
    
    logger.info('Kundli deleted', { userId, kundliId: id });

    return successResponse(res, 'Kundli deleted successfully');
  } catch (error) {
    logger.error('Kundli deletion failed', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to delete kundli', 500);
  }
});

/**
 * @desc    Get birth chart (Rasi chart - D1)
 * @route   GET /api/kundli/:id/chart
 * @access  Private
 */
const getBirthChart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    const chart = {
      type: 'rasi',
      chart_data: birthDetails.rasi_chart,
      planetary_positions: birthDetails.planetary_positions,
    };

    return successResponse(res, 'Birth chart retrieved', chart);
  } catch (error) {
    logger.error('Error fetching birth chart', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch birth chart', 500);
  }
});

/**
 * @desc    Get Navamsa chart (D9)
 * @route   GET /api/kundli/:id/navamsa
 * @access  Private
 */
const getNavamsaChart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    const chart = {
      type: 'navamsa',
      chart_data: birthDetails.navamsa_chart,
    };

    return successResponse(res, 'Navamsa chart retrieved', chart);
  } catch (error) {
    logger.error('Error fetching Navamsa chart', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch Navamsa chart', 500);
  }
});

/**
 * @desc    Get divisional chart (D1-D60)
 * @route   GET /api/kundli/:id/divisional/:type
 * @access  Private - Premium only
 */
const getDivisionalChart = asyncHandler(async (req, res) => {
  const { id, type } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    const divisionalNames = {
      '1': 'Rasi (Main Birth Chart)',
      '2': 'Hora (Wealth)',
      '3': 'Drekkana (Siblings)',
      '4': 'Chaturthamsa (Fortune)',
      '7': 'Saptamsa (Children)',
      '9': 'Navamsa (Marriage)',
      '10': 'Dasamsa (Career)',
      '12': 'Dwadasamsa (Parents)',
      '16': 'Shodasamsa (Vehicles)',
      '20': 'Vimsamsa (Spirituality)',
      '24': 'Chaturvimsamsa (Education)',
      '27': 'Saptavimsamsa (Strength)',
      '30': 'Trimsamsa (Misfortunes)',
      '40': 'Khavedamsa (Auspicious)',
      '45': 'Akshavedamsa (General)',
      '60': 'Shashtyamsa (Complete)',
    };

    const chart = {
      type: `D${type}`,
      name: divisionalNames[type] || `D${type}`,
      chart_data: birthDetails.shodashvarga_table,
    };

    return successResponse(res, 'Divisional chart retrieved', chart);
  } catch (error) {
    logger.error('Error fetching divisional chart', { error: error.message, kundliId: id, chartType: type });
    return errorResponse(res, 'Failed to fetch divisional chart', 500);
  }
});

/**
 * @desc    Get planetary positions
 * @route   GET /api/kundli/:id/planets
 * @access  Private
 */
const getPlanetaryPositions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    return successResponse(res, 'Planetary positions retrieved', birthDetails.planetary_positions);
  } catch (error) {
    logger.error('Error fetching planetary positions', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch planetary positions', 500);
  }
});

/**
 * @desc    Get house positions and cusps
 * @route   GET /api/kundli/:id/houses
 * @access  Private
 */
const getHouses = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    return successResponse(res, 'Houses retrieved', {
      house_analysis: birthDetails.house_analysis,
      house_cusps: birthDetails.house_cusps,
    });
  } catch (error) {
    logger.error('Error fetching houses', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch houses', 500);
  }
});

/**
 * @desc    Get Vimshottari dasha periods
 * @route   GET /api/kundli/:id/dasha
 * @access  Private
 */
const getDashaPeriods = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    const dashas = {
      current: birthDetails.current_dasha,
      complete_timeline: birthDetails.vimshottari_dasha,
    };

    return successResponse(res, 'Dasha periods retrieved', dashas);
  } catch (error) {
    logger.error('Error fetching dasha periods', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch dasha periods', 500);
  }
});

/**
 * @desc    Get yogas (combinations) in chart
 * @route   GET /api/kundli/:id/yogas
 * @access  Private
 */
const getYogas = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    return successResponse(res, 'Yogas retrieved', birthDetails.yogas || []);
  } catch (error) {
    logger.error('Error fetching yogas', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch yogas', 500);
  }
});

/**
 * @desc    Get doshas (Mangal, Kaal Sarp, etc.)
 * @route   GET /api/kundli/:id/doshas
 * @access  Private
 */
const getDoshas = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    return successResponse(res, 'Doshas retrieved', birthDetails.doshas || []);
  } catch (error) {
    logger.error('Error fetching doshas', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch doshas', 500);
  }
});

/**
 * @desc    Get planetary strengths (Shadbala, Ashtakavarga)
 * @route   GET /api/kundli/:id/strengths
 * @access  Private - Premium only
 */
const getPlanetaryStrengths = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    return successResponse(res, 'Planetary strengths retrieved', birthDetails.planetary_strengths || []);
  } catch (error) {
    logger.error('Error fetching planetary strengths', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch planetary strengths', 500);
  }
});

/**
 * @desc    Get planetary aspects
 * @route   GET /api/kundli/:id/aspects
 * @access  Private
 */
const getPlanetaryAspects = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    // Aspects would be calculated from planetary positions
    const aspects = [];

    return successResponse(res, 'Planetary aspects retrieved', aspects);
  } catch (error) {
    logger.error('Error fetching planetary aspects', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch planetary aspects', 500);
  }
});

/**
 * @desc    Get nakshatra details
 * @route   GET /api/kundli/:id/nakshatras
 * @access  Private
 */
const getNakshatraDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    const nakshatras = {
      birthNakshatra: birthDetails.nakshatra,
      details: birthDetails.planetary_positions
    };

    return successResponse(res, 'Nakshatra details retrieved', nakshatras);
  } catch (error) {
    logger.error('Error fetching nakshatra details', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch nakshatra details', 500);
  }
});

/**
 * @desc    Get complete kundli summary
 * @route   GET /api/kundli/:id/summary
 * @access  Private
 */
const getKundliSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    const summary = {
      basicInfo: {
        ascendant: birthDetails.ascendant,
        moonSign: birthDetails.moon_sign,
        sunSign: birthDetails.sun_sign,
        nakshatra: birthDetails.nakshatra,
      },
      birthDetails: {
        name: birthDetails.name,
        birth_date: birthDetails.birth_date,
        birth_time: birthDetails.birth_time,
        birth_location: birthDetails.birth_location,
      },
      currentDasha: birthDetails.current_dasha,
      yogas: birthDetails.yogas,
      doshas: birthDetails.doshas,
    };

    return successResponse(res, 'Kundli summary retrieved', summary);
  } catch (error) {
    logger.error('Error fetching kundli summary', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch kundli summary', 500);
  }
});

/**
 * @desc    Download kundli as PDF
 * @route   GET /api/kundli/:id/pdf
 * @access  Private
 */
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
 * @desc    Match two kundlis for compatibility (Gun Milan)
 * @route   POST /api/kundli/match
 * @access  Private - Premium only
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
 * @desc    Verify and get coordinates for location
 * @route   POST /api/kundli/verify-location
 * @access  Private
 */
const verifyLocation = asyncHandler(async (req, res) => {
  const { placeOfBirth } = req.body;

  try {
    const geoResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeOfBirth)}`,
      {
        headers: {
          'User-Agent': 'AstroAI/1.0 (astrology-app)'
        }
      }
    );

    if (geoResponse.data && geoResponse.data.length > 0) {
      const location = geoResponse.data[0];
      const coordinates = {
        place: location.display_name,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        timezone: 'Asia/Kolkata',
      };
      return successResponse(res, 'Location verified', coordinates);
    } else {
      return errorResponse(res, 'Location not found', 404);
    }
  } catch (error) {
    logger.error('Location verification failed', { error: error.message, placeOfBirth });
    return errorResponse(res, 'Failed to verify location', 500);
  }
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
 * @desc    Get current transits over natal chart
 * @route   GET /api/kundli/:id/current-transits
 * @access  Private
 */
const getCurrentTransits = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const birthDetails = await BirthDetails.findOne({
      where: { id, user_id: userId }
    });

    if (!birthDetails) {
      return notFoundResponse(res, 'Kundli');
    }

    // Call Python engine for current transits
    const transitData = {
      birthDate: birthDetails.birth_date,
      birthTime: birthDetails.birth_time,
      latitude: birthDetails.latitude,
      longitude: birthDetails.longitude,
      timezone: birthDetails.timezone,
    };

    const result = await pythonEngine.getCurrentTransits(transitData);

    return successResponse(res, 'Current transits retrieved', result.data);
  } catch (error) {
    logger.error('Error fetching current transits', { error: error.message, kundliId: id });
    return errorResponse(res, 'Failed to fetch current transits', 500);
  }
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