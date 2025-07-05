// Test script for the password reset API route
// Run this with: node test-api-route.js

require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

console.log('=== Testing Password Reset API Route ===');

// Check if environment variables are set
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function testApiRoute() {
  const testData = {
    username: 'quen',
    recoveryEmail: 'test@example.com'
  };
  
  console.log('\n📤 Test data:', testData);
  
  try {
    console.log('\n📡 Making API call to /api/auth/reset-password...');
    
    const response = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📥 Response body:', result);
    
    if (response.ok) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed');
    }
    
  } catch (error) {
    console.error('❌ Error making API call:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your development server is running:');
      console.log('   npm run dev');
    }
  }
}

// Check if development server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    console.log('✅ Development server is running');
    return true;
  } catch (error) {
    console.log('❌ Development server is not running');
    console.log('💡 Please start the development server:');
    console.log('   npm run dev');
    return false;
  }
}

async function runTest() {
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    await testApiRoute();
  }
}

runTest().catch(console.error); 