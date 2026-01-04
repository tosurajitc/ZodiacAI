// backend/src/models/Horoscope.js
// Horoscope model for storing generated predictions

module.exports = (sequelize, DataTypes) => {
  const Horoscope = sequelize.define('Horoscope', {
    id: {
      type: DataTypes.STRING,
      defaultValue: () => require('crypto').randomUUID(),
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
    // Horoscope type and scope
    horoscope_type: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly', 'lifetime', 'transit', 'dasha'),
      allowNull: false,
      comment: 'Type of horoscope prediction',
    },
    category: {
      type: DataTypes.ENUM('general', 'career', 'finance', 'relationship', 'health', 'education', 'travel'),
      defaultValue: 'general',
      comment: 'Life area this prediction focuses on',
    },
    // Time period
    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Start date of prediction period',
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'End date of prediction period',
    },
    // Prediction content
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Title or headline for the prediction',
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Brief summary of the prediction',
    },
    detailed_prediction: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Full detailed prediction text',
    },
    // Category-specific predictions
    career_prediction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Career-specific guidance',
    },
    finance_prediction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Financial outlook',
    },
    relationship_prediction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Relationship and love guidance',
    },
    health_prediction: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Health and wellness advice',
    },
    // Scores and ratings
    overall_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
      comment: 'Overall period rating (1-10)',
    },
    career_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    finance_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    relationship_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    health_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    // Lucky attributes
    lucky_numbers: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
      comment: 'Lucky numbers for the period',
    },
    lucky_colors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Lucky colors for the period',
    },
    lucky_days: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Lucky days of the week',
    },
    lucky_direction: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Favorable direction for activities',
    },
    // Astrological data
    planetary_transits: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Relevant planetary transits for this period',
    },
    current_dasha: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dasha period information',
    },
    aspects: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Important planetary aspects',
    },
    // Remedies
    suggested_remedies: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of remedy suggestions',
    },
    gemstone_recommendation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    mantra_recommendation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Important dates and events
    important_dates: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of important dates in this period',
    },
    auspicious_times: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Muhurat timings for activities',
    },
    challenging_periods: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Periods to be cautious',
    },
    // Predictions and warnings
    opportunities: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      comment: 'List of opportunities to watch for',
    },
    challenges: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      comment: 'List of potential challenges',
    },
    warnings: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      comment: 'Important warnings or cautions',
    },
    // AI generation metadata
    generated_by: {
      type: DataTypes.ENUM('ai', 'template', 'manual'),
      defaultValue: 'ai',
      comment: 'How this prediction was generated',
    },
    ai_model_used: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'AI model used for generation',
    },
    confidence_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
      comment: 'Confidence in the prediction (0-1)',
    },
    generation_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time taken to generate (milliseconds)',
    },
    // User interaction
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether user has read this horoscope',
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'User marked as favorite',
    },
    user_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'User rating for accuracy (1-5 stars)',
    },
    user_feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User feedback on prediction accuracy',
    },
    // Validity and expiry
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this prediction is currently valid',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this prediction expires',
    },
    // Additional metadata
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Tags for categorization',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional metadata',
    },
    // Timestamps
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'horoscopes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['user_id', 'horoscope_type'],
      },
      {
        fields: ['user_id', 'category'],
      },
      {
        fields: ['user_id', 'period_start', 'period_end'],
      },
      {
        fields: ['horoscope_type', 'period_start'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['expires_at'],
      },
      {
        fields: ['is_favorite'],
      },
    ],
  });

  // Instance methods
  Horoscope.prototype.markAsRead = async function() {
    if (!this.is_read) {
      this.is_read = true;
      this.read_at = new Date();
      await this.save();
    }
  };

  Horoscope.prototype.toggleFavorite = async function() {
    this.is_favorite = !this.is_favorite;
    await this.save();
  };

  Horoscope.prototype.rate = async function(rating, feedback = null) {
    this.user_rating = rating;
    if (feedback) {
      this.user_feedback = feedback;
    }
    await this.save();
  };

  Horoscope.prototype.isExpired = function() {
    if (!this.expires_at) {
      return false;
    }
    return new Date() > new Date(this.expires_at);
  };

  Horoscope.prototype.isCurrentlyActive = function() {
    const now = new Date();
    return (
      this.is_active &&
      !this.isExpired() &&
      now >= new Date(this.period_start) &&
      now <= new Date(this.period_end)
    );
  };

  Horoscope.prototype.getDaysRemaining = function() {
    const now = new Date();
    const end = new Date(this.period_end);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  Horoscope.prototype.getAverageScore = function() {
    const scores = [
      this.career_score,
      this.finance_score,
      this.relationship_score,
      this.health_score,
    ].filter(score => score !== null);

    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  Horoscope.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      await this.save();
    }
  };

  Horoscope.prototype.expire = async function() {
    this.is_active = false;
    this.expires_at = new Date();
    await this.save();
  };

  Horoscope.prototype.toSafeObject = function() {
    const safeData = this.get({ plain: true });
    return {
      ...safeData,
      isExpired: this.isExpired(),
      isActive: this.isCurrentlyActive(),
      daysRemaining: this.getDaysRemaining(),
      averageScore: this.getAverageScore(),
    };
  };

  // Class methods
  Horoscope.getCurrentHoroscope = async function(userId, horoscopeType) {
    const now = new Date();
    return await this.findOne({
      where: {
        user_id: userId,
        horoscope_type: horoscopeType,
        is_active: true,
        period_start: { [sequelize.Sequelize.Op.lte]: now },
        period_end: { [sequelize.Sequelize.Op.gte]: now },
      },
      order: [['created_at', 'DESC']],
    });
  };

  Horoscope.getHoroscopesByType = async function(userId, horoscopeType, limit = 10) {
    return await this.findAll({
      where: {
        user_id: userId,
        horoscope_type: horoscopeType,
      },
      order: [['period_start', 'DESC']],
      limit: limit,
    });
  };

  Horoscope.getFavorites = async function(userId) {
    return await this.findAll({
      where: {
        user_id: userId,
        is_favorite: true,
      },
      order: [['period_start', 'DESC']],
    });
  };

  Horoscope.cleanupExpired = async function() {
    const now = new Date();
    return await this.update(
      { is_active: false },
      {
        where: {
          expires_at: { [sequelize.Sequelize.Op.lt]: now },
          is_active: true,
        },
      }
    );
  };

  // Associations
  Horoscope.associate = (models) => {
    // Horoscope belongs to User
    Horoscope.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return Horoscope;
};