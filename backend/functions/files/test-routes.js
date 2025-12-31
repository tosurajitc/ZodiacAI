// test-routes.js - Test loading each route file
require('dotenv').config();

console.log('Testing route file imports...\n');

// Test each route file individually
const routes = [
  { name: 'auth', path: './src/routes/auth' },
  { name: 'kundli', path: './src/routes/kundli' },
  { name: 'horoscope', path: './src/routes/horoscope' },
  { name: 'chat', path: './src/routes/chat' },
  { name: 'feedback', path: './src/routes/feedback' }
];

routes.forEach(route => {
  try {
    console.log(`Testing ${route.name} routes...`);
    require(route.path);
    console.log(`✅ ${route.name} routes loaded successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to load ${route.name} routes:`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}\n`);
  }
});

console.log('Route testing complete!');