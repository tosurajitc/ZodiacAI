// backend/src/models/BirthDetails.js
// BirthDetails model for storing encrypted birth data and kundli information

const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const BirthDetails = sequelize.define('BirthDetails', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,  
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'User name for kundli',
    },
    // Encrypted birth data
    encrypted_birth_data: {
      type: DataTypes.TEXT,
      allowNull: true,  // ✅ Changed
      comment: 'AES-256 encrypted JSON containing date, time, location',
    },
    encryption_iv: {
      type: DataTypes.STRING(32),
      allowNull: true,  // ✅ Changed
      comment: 'Initialization vector for encryption',
    },
    // Derived data (not encrypted, for quick access)
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    birth_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    birth_location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Chart data (stored as JSONB for complex nested data)
    rasi_chart: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'D1 chart - Main birth chart with house positions',
    },
    navamsa_chart: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'D9 chart - Marriage and spiritual strength',
    },
    planetary_positions: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Positions of all planets in signs and houses',
    },
    house_cusps: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Cusp positions for all 12 houses',
    },
    // Dasha periods
    current_dasha: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Current Mahadasha, Antardasha, Pratyantardasha',
    },
    vimshottari_dasha: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Complete 120-year Vimshottari Dasha timeline',
    },
    // Special calculations
    ascendant: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Lagna/Ascendant sign',
    },
    moon_sign: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Rashi - Moon sign',
    },
    sun_sign: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Sun sign (Western)',
    },
    nakshatra: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Birth nakshatra (lunar mansion)',
    },
    // Yogas and Doshas
    yogas: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Beneficial yogas present in chart',
    },
    doshas: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Doshas like Mangal Dosha, Kaal Sarp, etc.',
    },
    // Strength calculations
    planetary_strengths: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Shadbala and other strength calculations',
    },
    // Chart generation metadata
    chart_generated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    chart_version: {
      type: DataTypes.STRING(20),
      defaultValue: '1.0',
      comment: 'Version of calculation engine used',
    },
    calculation_method: {
      type: DataTypes.STRING(50),
      defaultValue: 'Swiss Ephemeris',
    },
    ayanamsa: {
      type: DataTypes.STRING(50),
      defaultValue: 'Lahiri',
      comment: 'Ayanamsa system used',
    },
    // PDF storage
    pdf_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'S3 URL for generated kundli PDF',
    },
    pdf_generated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'birth_details',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['birth_date'],
      },
      {
        fields: ['moon_sign'],
      },
      {
        fields: ['ascendant'],
      },
    ],
  });

  // Helper function to encrypt data
  BirthDetails.encryptData = (data) => {
    const algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
    };
  };

  // Helper function to decrypt data
  BirthDetails.decryptData = (encryptedData, iv) => {
    const algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  };

  // Instance methods
  BirthDetails.prototype.getDecryptedBirthData = function() {
    try {
      return BirthDetails.decryptData(
        this.encrypted_birth_data,
        this.encryption_iv
      );
    } catch (error) {
      throw new Error('Failed to decrypt birth data: ' + error.message);
    }
  };

  BirthDetails.prototype.isChartGenerated = function() {
    return !!(this.rasi_chart && this.planetary_positions);
  };

  BirthDetails.prototype.needsRecalculation = function() {
    // Check if chart is older than 30 days
    if (!this.chart_generated_at) {
      return true;
    }
    
    const daysSinceGeneration = Math.floor(
      (Date.now() - new Date(this.chart_generated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceGeneration > 30;
  };

  BirthDetails.prototype.hasMangalDosha = function() {
    if (!this.doshas || !this.doshas.mangal_dosha) {
      return false;
    }
    return this.doshas.mangal_dosha.present === true;
  };

  BirthDetails.prototype.getCurrentDasha = function() {
    if (!this.current_dasha) {
      return null;
    }
    return {
      mahadasha: this.current_dasha.mahadasha,
      antardasha: this.current_dasha.antardasha,
      pratyantardasha: this.current_dasha.pratyantardasha,
    };
  };

  BirthDetails.prototype.toSafeObject = function() {
    const safeData = this.get({ plain: true });
    // Remove sensitive encrypted data from response
    delete safeData.encrypted_birth_data;
    delete safeData.encryption_iv;
    return safeData;
  };

  // Associations
  BirthDetails.associate = (models) => {
    // BirthDetails belongs to User
    BirthDetails.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return BirthDetails;
};