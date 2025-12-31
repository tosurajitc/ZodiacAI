// test-server.js - Fixed import
require('dotenv').config();
const express = require('express');

console.log('Step 1: Loading database config...');
let sequelize;
try {
  const db = require('./src/config/database');
  sequelize = db.sequelize; // Extract sequelize from the exported object
  console.log('✅ Database config loaded');
} catch (error) {
  console.error('❌ Failed to load database config:', error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test database connection
console.log('Step 2: Testing database connection...');
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    console.log('Step 3: Starting Express server...');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`Test at: http://localhost:${PORT}/test`);
    }).on('error', (err) => {
      console.error('❌ Server start error:', err);
    });
  })
  .catch(err => {
    console.error('❌ Database authentication failed:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    process.exit(1);
  });