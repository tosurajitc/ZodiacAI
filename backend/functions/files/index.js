// backend/functions/files/index.js
// Main Express Server for AstroAI Backend

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import middleware
const { errorHandler } = require('./src/utils/errorHandler');
const logger = require('./src/utils/logger');

// Import database and Redis configurations
const { connectDatabase, closeDatabase } = require('./src/config/database');
const { connectRedis, closeRedis } = require('./src/config/redis');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:19006'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/kundli/generate')) {
    console.log('=== MIDDLEWARE DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Has name field?', 'name' in req.body);
    console.log('Name value:', req.body.name);
  }
  next();
});

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AstroAI Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
  try {
    // Connect to PostgreSQL database
    logger.info('📄 Connecting to PostgreSQL database...');
    await connectDatabase();
    
    // Connect to Redis cache
    logger.info('📄 Connecting to Redis cache...');
    await connectRedis();

    // Load routes AFTER database is connected
    logger.info('📦 Loading API routes...');
    const authRoutes = require('./src/routes/auth');
    const kundliRoutes = require('./src/routes/kundli');
    const horoscopeRoutes = require('./src/routes/horoscope');
    const chatRoutes = require('./src/routes/chat');
    const feedbackRoutes = require('./src/routes/feedback');

    // Register API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/kundli', kundliRoutes);
    app.use('/api/horoscope', horoscopeRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/feedback', feedbackRoutes);

    // 404 handler for undefined routes
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
      });
    });

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 AstroAI Backend Server started successfully`);
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`⏰ Started at: ${new Date().toISOString()}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n✅ Server ready at: http://localhost:${PORT}`);
        console.log(`✅ Health check: http://localhost:${PORT}/health`);
        console.log(`✅ API base URL: http://localhost:${PORT}/api\n`);
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close database connections gracefully
  closeDatabase();
  closeRedis();
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close database connections gracefully
  closeDatabase();
  closeRedis();
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  // Close database connections
  closeDatabase()
    .then(() => closeRedis())
    .then(() => {
      logger.info('All connections closed. Exiting process.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  
  // Close database connections
  closeDatabase()
    .then(() => closeRedis())
    .then(() => {
      logger.info('All connections closed. Exiting process.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    });
});

// Start the server
startServer();

module.exports = app;