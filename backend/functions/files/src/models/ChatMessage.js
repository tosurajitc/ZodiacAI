// backend/src/models/ChatMessage.js
// ChatMessage model for storing individual chat messages

module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chat_sessions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
      comment: 'Who sent this message',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The actual message content',
    },
    // Message metadata
    message_type: {
      type: DataTypes.ENUM('text', 'prediction', 'chart', 'remedy', 'compatibility'),
      defaultValue: 'text',
      comment: 'Type of message for frontend rendering',
    },
    tokens_used: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Tokens consumed for this message (AI responses)',
    },
    processing_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time taken to generate response (milliseconds)',
    },
    // AI model info
    ai_model: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Specific AI model used for this response',
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Temperature parameter used for AI generation',
    },
    // Context and references
    referenced_chart_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Chart data referenced in this message',
    },
    referenced_transit_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Transit data referenced in this message',
    },
    prediction_confidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
      comment: 'Confidence score for predictions (0-1)',
    },
    // User interaction
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether user edited this message',
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Soft delete flag',
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // User feedback on individual messages
    is_helpful: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'User marked message as helpful (thumbs up/down)',
    },
    feedback_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Why user marked as helpful/not helpful',
    },
    // For streaming responses
    is_streaming: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a streaming response in progress',
    },
    stream_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether streaming completed successfully',
    },
    // Error handling
    has_error: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this message generation had an error',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if generation failed',
    },
    // Additional data
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of attachment objects (charts, PDFs, images)',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional metadata for special message types',
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
    tableName: 'chat_messages',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['session_id'],
      },
      {
        fields: ['session_id', 'created_at'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['message_type'],
      },
      {
        fields: ['is_deleted'],
      },
      {
        fields: ['is_helpful'],
      },
    ],
  });

  // Instance methods
  ChatMessage.prototype.markAsHelpful = async function(helpful, reason = null) {
    this.is_helpful = helpful;
    if (reason) {
      this.feedback_reason = reason;
    }
    await this.save();
  };

  ChatMessage.prototype.edit = async function(newContent) {
    if (this.role !== 'user') {
      throw new Error('Only user messages can be edited');
    }
    this.content = newContent;
    this.is_edited = true;
    this.edited_at = new Date();
    await this.save();
  };

  ChatMessage.prototype.softDelete = async function() {
    this.is_deleted = true;
    this.deleted_at = new Date();
    await this.save();
  };

  ChatMessage.prototype.restore = async function() {
    this.is_deleted = false;
    this.deleted_at = null;
    await this.save();
  };

  ChatMessage.prototype.addAttachment = async function(attachment) {
    this.attachments = [...this.attachments, attachment];
    await this.save();
  };

  ChatMessage.prototype.completeStreaming = async function() {
    this.is_streaming = false;
    this.stream_completed = true;
    await this.save();
  };

  ChatMessage.prototype.markError = async function(errorMessage) {
    this.has_error = true;
    this.error_message = errorMessage;
    this.is_streaming = false;
    this.stream_completed = false;
    await this.save();
  };

  ChatMessage.prototype.getWordCount = function() {
    return this.content.trim().split(/\s+/).length;
  };

  ChatMessage.prototype.getCharacterCount = function() {
    return this.content.length;
  };

  ChatMessage.prototype.isRecent = function() {
    const minutesSinceCreation = Math.floor(
      (Date.now() - new Date(this.created_at).getTime()) / (1000 * 60)
    );
    return minutesSinceCreation < 5;
  };

  ChatMessage.prototype.toSafeObject = function() {
    const safeData = this.get({ plain: true });
    
    // Remove deleted messages content
    if (this.is_deleted) {
      safeData.content = '[Message deleted]';
      delete safeData.attachments;
      delete safeData.metadata;
    }
    
    // Remove error details from user-facing response
    if (this.has_error && this.role === 'assistant') {
      safeData.content = 'Sorry, I encountered an error generating this response. Please try again.';
      delete safeData.error_message;
    }
    
    return safeData;
  };

  // Class methods
  ChatMessage.getMessagesBySession = async function(sessionId, limit = 50) {
    return await this.findAll({
      where: {
        session_id: sessionId,
        is_deleted: false,
      },
      order: [['created_at', 'ASC']],
      limit: limit,
    });
  };

  ChatMessage.getRecentMessages = async function(sessionId, count = 20) {
    return await this.findAll({
      where: {
        session_id: sessionId,
        is_deleted: false,
      },
      order: [['created_at', 'DESC']],
      limit: count,
    });
  };

  ChatMessage.getContextMessages = async function(sessionId, maxTokens = 4000) {
    // Get recent messages that fit within token limit
    const messages = await this.findAll({
      where: {
        session_id: sessionId,
        is_deleted: false,
      },
      order: [['created_at', 'DESC']],
      limit: 50, // Get last 50 messages
    });

    // Filter to fit token limit (approximate)
    let totalTokens = 0;
    const contextMessages = [];
    
    for (const message of messages) {
      const messageTokens = message.tokens_used || Math.ceil(message.content.length / 4);
      if (totalTokens + messageTokens > maxTokens) {
        break;
      }
      totalTokens += messageTokens;
      contextMessages.push(message);
    }

    // Return in chronological order
    return contextMessages.reverse();
  };

  ChatMessage.countMessagesBySession = async function(sessionId) {
    return await this.count({
      where: {
        session_id: sessionId,
        is_deleted: false,
      },
    });
  };

  ChatMessage.getHelpfulMessages = async function(sessionId) {
    return await this.findAll({
      where: {
        session_id: sessionId,
        is_helpful: true,
        is_deleted: false,
      },
      order: [['created_at', 'DESC']],
    });
  };

  // Associations
  ChatMessage.associate = (models) => {
    // ChatMessage belongs to ChatSession
    ChatMessage.belongsTo(models.ChatSession, {
      foreignKey: 'session_id',
      as: 'session',
      onDelete: 'CASCADE',
    });
  };

  return ChatMessage;
};