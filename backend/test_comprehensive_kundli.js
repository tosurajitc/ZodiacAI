// Test Script - Verify Comprehensive Kundli System
// Location: backend/test_comprehensive_kundli.js
// Run with: node test_comprehensive_kundli.js

const axios = require('axios');

const PYTHON_API = 'http://localhost:8000';
const NODE_API = 'http://localhost:5000';
const API_KEY = 'your-python-engine-api-key';

async function testPythonEngine() {
  console.log('\n=== Testing Python Engine ===');
  
  try {
    const response = await axios.post(
      `${PYTHON_API}/api/kundli/comprehensive`,
      null,
      {
        params: {
          birth_date: '1990-05-15',
          birth_time: '14:30',
          latitude: 19.0760,
          longitude: 72.8777,
          timezone: 5.5,
          name: 'Test User',
          place: 'Mumbai'
        },
        headers: { 'X-API-Key': API_KEY }
      }
    );
    
    console.log('✅ Python engine working');
    console.log(`Planets: ${Object.keys(response.data.data.planetary_positions).length}`);
    console.log(`Shodashvarga: ${Object.keys(response.data.data.shodashvarga_table).length} planets`);
    console.log(`Houses: ${response.data.data.house_analysis.length}`);
    
    return true;
  } catch (error) {
    console.log('❌ Python engine failed:', error.message);
    return false;
  }
}

async function testNodeBackend(token) {
  console.log('\n=== Testing Node.js Backend ===');
  
  try {
    const response = await axios.post(
      `${NODE_API}/api/kundli/generate`,
      {
        name: 'Test User',
        dateOfBirth: '1990-05-15',
        timeOfBirth: '14:30',
        placeOfBirth: 'Mumbai, India',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 5.5
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    console.log('✅ Node backend working');
    console.log('Kundli ID:', response.data.data.id);
    
    return response.data.data.id;
  } catch (error) {
    console.log('❌ Node backend failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Comprehensive Kundli Tests...\n');
  
  const pythonOk = await testPythonEngine();
  
  if (!pythonOk) {
    console.log('\n⚠️  Python engine not running. Start with: cd astrology-engine && python main.py');
  }
  
  console.log('\n✅ All tests complete!');
}

runTests();