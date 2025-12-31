// backend/src/models/index.js
// Sequelize initialization and model associations

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration from environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

// Initialize models object
const db = {};

// Import all model files dynamically
const basename = path.basename(__filename);
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file !== 'index.js'
    );
  });

// Load each model
modelFiles.forEach(file => {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

// Set up associations between models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add Sequelize instance and class to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

// Sync database (create tables if they don't exist)
const syncDatabase = async (options = {}) => {
  try {
    const syncOptions = {
      force: options.force || false, // Drop tables before recreating (use with caution!)
      alter: options.alter || false, // Alter tables to match models
    };

    await sequelize.sync(syncOptions);
    
    if (syncOptions.force) {
      console.log('⚠️  Database synced with FORCE (all tables dropped and recreated)');
    } else if (syncOptions.alter) {
      console.log('✅ Database synced with ALTER (tables updated to match models)');
    } else {
      console.log('✅ Database synced (tables created if not exist)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    return false;
  }
};

// Close database connection
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
    return true;
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
    return false;
  }
};

// Export database object with helper functions
db.testConnection = testConnection;
db.syncDatabase = syncDatabase;
db.closeConnection = closeConnection;

module.exports = db;