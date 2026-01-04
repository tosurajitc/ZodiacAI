// backend/src/models/Feedback.js
// Feedback model for user feedback, ratings, and support tickets

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
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
    // Feedback type and category
    feedback_type: {
      type: DataTypes.ENUM('rating', 'bug_report', 'feature_request', 'general', 'support', 'complaint', 'praise'),
      allowNull: false,
      comment: 'Type of feedback',
    },
    category: {
      type: DataTypes.ENUM('app', 'prediction_accuracy', 'chat', 'kundli', 'ui_ux', 'performance', 'payment', 'other'),
      defaultValue: 'other',
      comment: 'Category of feedback',
    },
    // Rating
    overall_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Overall app rating (1-5 stars)',
    },
    feature_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Specific feature rating',
    },
    // Feedback content
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Brief title/subject',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Detailed feedback description',
    },
    // Context information
    related_feature: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Which feature this feedback is about',
    },
    related_screen: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Which screen/page this feedback is about',
    },
    related_session_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Related chat session ID if applicable',
    },
    related_horoscope_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Related horoscope ID if applicable',
    },
    // Bug report specific fields
    bug_severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: true,
      comment: 'Severity level for bug reports',
    },
    steps_to_reproduce: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Steps to reproduce the bug',
    },
    expected_behavior: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Expected behavior description',
    },
    actual_behavior: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Actual behavior observed',
    },
    // Device and app information
    device_info: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Device information (OS, version, model)',
    },
    app_version: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'App version when feedback was given',
    },
    platform: {
      type: DataTypes.ENUM('web', 'android', 'ios'),
      allowNull: true,
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Browser name and version (for web)',
    },
    // Attachments
    screenshots: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      comment: 'URLs of uploaded screenshots',
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Other attachments (logs, files)',
    },
    // Contact preferences
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Alternative contact email',
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Contact phone number',
    },
    prefers_followup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether user wants follow-up',
    },
    // Status and priority
    status: {
      type: DataTypes.ENUM('new', 'under_review', 'in_progress', 'resolved', 'closed', 'wont_fix'),
      defaultValue: 'new',
      comment: 'Current status of the feedback',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      comment: 'Priority level',
    },
    // Admin/team response
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal notes from admin/support team',
    },
    admin_response: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Response sent to user',
    },
    assigned_to: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Team member assigned to this feedback',
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When this feedback was resolved',
    },
    resolution_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'How the issue was resolved',
    },
    // Sentiment analysis
    sentiment_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: -1,
        max: 1,
      },
      comment: 'AI-analyzed sentiment (-1 to 1)',
    },
    sentiment_label: {
      type: DataTypes.ENUM('positive', 'neutral', 'negative'),
      allowNull: true,
    },
    // Engagement metrics
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether admin has read this feedback',
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    response_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether response was sent to user',
    },
    response_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // User satisfaction after resolution
    resolution_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'User rating of how well issue was resolved',
    },
    resolution_feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User feedback on resolution',
    },
    // Flags
    is_flagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Flagged for urgent attention',
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Archived feedback',
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Analytics
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of upvotes (for feature requests)',
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times viewed by team',
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
    tableName: 'feedback',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['feedback_type'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['is_flagged'],
      },
      {
        fields: ['is_archived'],
      },
      {
        fields: ['overall_rating'],
      },
      {
        fields: ['created_at'],
      },
    ],
  });

  // Instance methods
  Feedback.prototype.markAsRead = async function() {
    if (!this.is_read) {
      this.is_read = true;
      this.read_at = new Date();
      await this.save();
    }
  };

  Feedback.prototype.flag = async function() {
    this.is_flagged = true;
    await this.save();
  };

  Feedback.prototype.unflag = async function() {
    this.is_flagged = false;
    await this.save();
  };

  Feedback.prototype.archive = async function() {
    this.is_archived = true;
    this.archived_at = new Date();
    await this.save();
  };

  Feedback.prototype.updateStatus = async function(newStatus, notes = null) {
    this.status = newStatus;
    if (notes) {
      this.admin_notes = notes;
    }
    if (newStatus === 'resolved' || newStatus === 'closed') {
      this.resolved_at = new Date();
    }
    await this.save();
  };

  Feedback.prototype.assignTo = async function(assignee) {
    this.assigned_to = assignee;
    await this.save();
  };

  Feedback.prototype.sendResponse = async function(responseText) {
    this.admin_response = responseText;
    this.response_sent = true;
    this.response_sent_at = new Date();
    await this.save();
  };

  Feedback.prototype.resolve = async function(resolutionNotes) {
    this.status = 'resolved';
    this.resolved_at = new Date();
    this.resolution_notes = resolutionNotes;
    await this.save();
  };

  Feedback.prototype.rateResolution = async function(rating, feedback = null) {
    this.resolution_rating = rating;
    if (feedback) {
      this.resolution_feedback = feedback;
    }
    await this.save();
  };

  Feedback.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      await this.save();
    }
  };

  Feedback.prototype.incrementUpvotes = async function() {
    this.upvotes += 1;
    await this.save();
  };

  Feedback.prototype.incrementViews = async function() {
    this.views += 1;
    await this.save();
  };

  Feedback.prototype.isHighPriority = function() {
    return this.priority === 'high' || this.priority === 'urgent' || this.is_flagged;
  };

  Feedback.prototype.needsResponse = function() {
    return this.prefers_followup && !this.response_sent;
  };

  Feedback.prototype.getResponseTime = function() {
    if (!this.response_sent_at) {
      return null;
    }
    const diffMs = new Date(this.response_sent_at) - new Date(this.created_at);
    return Math.floor(diffMs / (1000 * 60 * 60)); // hours
  };

  Feedback.prototype.toSafeObject = function() {
    const safeData = this.get({ plain: true });
    // Remove internal admin fields from user-facing response
    delete safeData.admin_notes;
    delete safeData.assigned_to;
    return {
      ...safeData,
      isHighPriority: this.isHighPriority(),
      needsResponse: this.needsResponse(),
      responseTimeHours: this.getResponseTime(),
    };
  };

  // Class methods
  Feedback.getByStatus = async function(status, limit = 50) {
    return await this.findAll({
      where: { status },
      order: [['created_at', 'DESC']],
      limit: limit,
    });
  };

  Feedback.getByPriority = async function(priority, limit = 50) {
    return await this.findAll({
      where: { priority },
      order: [['created_at', 'DESC']],
      limit: limit,
    });
  };

  Feedback.getUnreadFeedback = async function(limit = 50) {
    return await this.findAll({
      where: { is_read: false },
      order: [['created_at', 'DESC']],
      limit: limit,
    });
  };

  Feedback.getFlaggedFeedback = async function() {
    return await this.findAll({
      where: { is_flagged: true },
      order: [['created_at', 'DESC']],
    });
  };

  Feedback.getBugReports = async function(severity = null) {
    const where = { feedback_type: 'bug_report' };
    if (severity) {
      where.bug_severity = severity;
    }
    return await this.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  };

  Feedback.getFeatureRequests = async function(orderBy = 'upvotes') {
    const orderField = orderBy === 'upvotes' ? 'upvotes' : 'created_at';
    return await this.findAll({
      where: { feedback_type: 'feature_request' },
      order: [[orderField, 'DESC']],
    });
  };

  Feedback.getAverageRating = async function(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const ratings = await this.findAll({
      where: {
        overall_rating: { [sequelize.Sequelize.Op.ne]: null },
        created_at: { [sequelize.Sequelize.Op.gte]: startDate },
      },
      attributes: ['overall_rating'],
    });

    if (ratings.length === 0) return null;
    
    const sum = ratings.reduce((acc, r) => acc + r.overall_rating, 0);
    return (sum / ratings.length).toFixed(2);
  };

  Feedback.needingResponse = async function() {
    return await this.findAll({
      where: {
        prefers_followup: true,
        response_sent: false,
        is_archived: false,
      },
      order: [['created_at', 'ASC']],
    });
  };

  // Associations
  Feedback.associate = (models) => {
    // Feedback belongs to User
    Feedback.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return Feedback;
};