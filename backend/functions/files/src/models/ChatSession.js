// backend/src/models/ChatSession.js
// ChatSession model for managing AI chat conversations

module.exports = (sequelize, DataTypes) => {
  const ChatSession = sequelize.define('ChatSession', {
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'New Chat',
      comment: 'Auto-generated or user-defined chat title',
    },
    session_type: {
      type: DataTypes.ENUM('general', 'career', 'relationship', 'health', 'finance'),
      defaultValue: 'general',
      comment: 'Type of conversation for better context',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this session is currently active',
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of last message in this session',
    },
    message_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total number of messages in this session',
    },
    // Context and metadata
    context_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'AI-generated summary of conversation context',
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Tags for categorizing conversations',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional metadata like chart references, predictions made',
    },
    // User engagement metrics
    user_satisfaction: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'User rating for this session (1-5 stars)',
    },
    feedback_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional user feedback about this session',
    },
    // Session state
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether user has archived this chat',
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether user has pinned this chat to top',
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // AI model info
    ai_model_used: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'gpt-4',
      comment: 'AI model used for this session',
    },
    total_tokens_used: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total tokens consumed in this session',
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
    tableName: 'chat_sessions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['user_id', 'is_active'],
      },
      {
        fields: ['user_id', 'is_pinned'],
      },
      {
        fields: ['user_id', 'is_archived'],
      },
      {
        fields: ['last_message_at'],
      },
      {
        fields: ['session_type'],
      },
    ],
  });

  // Instance methods
  ChatSession.prototype.updateLastMessage = async function() {
    this.last_message_at = new Date();
    this.message_count += 1;
    await this.save();
  };

  ChatSession.prototype.generateTitle = function(firstMessage) {
    // Generate a smart title from the first user message
    if (!firstMessage) {
      return 'New Chat';
    }
    
    // Take first 50 characters and add ellipsis if longer
    let title = firstMessage.trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    return title;
  };

  ChatSession.prototype.archive = async function() {
    this.is_archived = true;
    this.archived_at = new Date();
    this.is_active = false;
    await this.save();
  };

  ChatSession.prototype.unarchive = async function() {
    this.is_archived = false;
    this.archived_at = null;
    this.is_active = true;
    await this.save();
  };

  ChatSession.prototype.pin = async function() {
    this.is_pinned = true;
    await this.save();
  };

  ChatSession.prototype.unpin = async function() {
    this.is_pinned = false;
    await this.save();
  };

  ChatSession.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      await this.save();
    }
  };

  ChatSession.prototype.removeTag = async function(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    await this.save();
  };

  ChatSession.prototype.rateSatisfaction = async function(rating, feedbackText = null) {
    this.user_satisfaction = rating;
    if (feedbackText) {
      this.feedback_text = feedbackText;
    }
    await this.save();
  };

  ChatSession.prototype.addTokens = async function(tokenCount) {
    this.total_tokens_used += tokenCount;
    await this.save();
  };

  ChatSession.prototype.isOlderThan = function(days) {
    const daysSinceLastMessage = Math.floor(
      (Date.now() - new Date(this.last_message_at || this.created_at).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    return daysSinceLastMessage > days;
  };

  ChatSession.prototype.toSafeObject = function() {
    const safeData = this.get({ plain: true });
    return {
      ...safeData,
      isOld: this.isOlderThan(7),
    };
  };

  // Class methods
  ChatSession.getActiveSessionsByUser = async function(userId) {
    return await this.findAll({
      where: {
        user_id: userId,
        is_active: true,
        is_archived: false,
      },
      order: [
        ['is_pinned', 'DESC'],
        ['last_message_at', 'DESC'],
      ],
    });
  };

  ChatSession.getPinnedSessionsByUser = async function(userId) {
    return await this.findAll({
      where: {
        user_id: userId,
        is_pinned: true,
        is_archived: false,
      },
      order: [['last_message_at', 'DESC']],
    });
  };

  ChatSession.getArchivedSessionsByUser = async function(userId) {
    return await this.findAll({
      where: {
        user_id: userId,
        is_archived: true,
      },
      order: [['archived_at', 'DESC']],
    });
  };

  // Associations
  ChatSession.associate = (models) => {
    // ChatSession belongs to User
    ChatSession.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });

    // ChatSession has many ChatMessages
    ChatSession.hasMany(models.ChatMessage, {
      foreignKey: 'session_id',
      as: 'messages',
      onDelete: 'CASCADE',
    });
  };

  return ChatSession;
};