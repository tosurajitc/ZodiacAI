// backend/src/models/User.js
// User model for authentication and profile management

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address',
        },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true, // Nullable for OAuth users
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    profile_picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true,
    },
    subscription_tier: {
      type: DataTypes.ENUM('free', 'premium'),
      defaultValue: 'free',
      allowNull: false,
    },
    subscription_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subscription_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    daily_questions_used: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    last_question_reset: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    auth_provider: {
      type: DataTypes.ENUM('email', 'google', 'facebook'),
      defaultValue: 'email',
      allowNull: false,
    },
    firebase_uid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications_enabled: true,
        language: 'en',
        theme: 'light',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['firebase_uid'],
      },
      {
        fields: ['subscription_tier'],
      },
    ],
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    if (!this.password_hash) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password_hash);
  };

  User.prototype.isPremium = function() {
    if (this.subscription_tier !== 'premium') {
      return false;
    }
    if (!this.subscription_end_date) {
      return false;
    }
    return new Date() < new Date(this.subscription_end_date);
  };

  User.prototype.canAskQuestion = function() {
    // Premium users have unlimited questions
    if (this.isPremium()) {
      return true;
    }

    // Reset daily counter if last reset was yesterday or earlier
    const now = new Date();
    const lastReset = new Date(this.last_question_reset);
    const isNewDay = now.toDateString() !== lastReset.toDateString();

    if (isNewDay) {
      return true; // Will be reset in controller
    }

    // Free tier: 5 questions per day
    const FREE_TIER_LIMIT = parseInt(process.env.FREE_TIER_DAILY_QUESTIONS) || 5;
    return this.daily_questions_used < FREE_TIER_LIMIT;
  };

  User.prototype.getRemainingQuestions = function() {
    if (this.isPremium()) {
      return 'unlimited';
    }

    const FREE_TIER_LIMIT = parseInt(process.env.FREE_TIER_DAILY_QUESTIONS) || 5;
    return Math.max(0, FREE_TIER_LIMIT - this.daily_questions_used);
  };

  User.prototype.toSafeObject = function() {
    const { 
      password_hash, 
      refresh_token, 
      ...safeUser 
    } = this.get({ plain: true });
    return safeUser;
  };

  // Hooks
  User.beforeCreate(async (user) => {
    // Hash password if provided
    if (user.password_hash) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
  });

  User.beforeUpdate(async (user) => {
    // Hash password if changed
    if (user.changed('password_hash') && user.password_hash) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
  });

  // Associations
  User.associate = (models) => {
    // User has one BirthDetails
    User.hasOne(models.BirthDetails, {
      foreignKey: 'user_id',
      as: 'birthDetails',
      onDelete: 'CASCADE',
    });

    // User has many ChatSessions
    User.hasMany(models.ChatSession, {
      foreignKey: 'user_id',
      as: 'chatSessions',
      onDelete: 'CASCADE',
    });

    // User has many Horoscopes
    User.hasMany(models.Horoscope, {
      foreignKey: 'user_id',
      as: 'horoscopes',
      onDelete: 'CASCADE',
    });

    // User has many Feedback
    User.hasMany(models.Feedback, {
      foreignKey: 'user_id',
      as: 'feedbacks',
      onDelete: 'CASCADE',
    });
  };

  return User;
};