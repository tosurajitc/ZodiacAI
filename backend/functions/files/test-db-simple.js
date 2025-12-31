// test-db-simple.js - Test DB without logger dependency
require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'astroai_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log, // Use console.log instead of logger
  }
);

console.log('\nTesting database connection...');

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed:');
    console.error('Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 10 seconds');
  process.exit(1);
}, 10000);