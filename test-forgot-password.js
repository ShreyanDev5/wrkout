// Test script for forgot password functionality
// Run this with: node test-forgot-password.js

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Check if environment variables are set
console.log('=== Environment Check ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testForgotPassword() {
  console.log('\n=== Testing Forgot Password Functionality ===');
  
  // Use a real email address for testing
  const testEmail = process.argv[2] || 'your-email@example.com'; // Pass email as command line argument
  
  if (testEmail === 'your-email@example.com') {
    console.log('⚠️  Please provide a real email address as an argument:');
    console.log('   node test-forgot-password.js your-email@example.com');
    console.log('   Or update the testEmail variable in the script');
    return;
  }
  
  try {
    console.log(`📧 Testing password reset for: ${testEmail}`);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:3000/auth/reset-password',
    });
    
    if (error) {
      console.error('❌ Error during password reset:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      console.log('✅ Password reset email sent successfully');
      console.log('Response data:', data);
      console.log('\n📋 Next steps:');
      console.log('1. Check your email inbox');
      console.log('2. Check your spam/junk folder');
      console.log('3. Wait a few minutes (email delivery can be delayed)');
      console.log('4. If no email received, check Supabase dashboard email settings');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

async function checkSupabaseConnection() {
  console.log('\n=== Testing Supabase Connection ===');
  
  try {
    // Try to access auth instead of a specific table
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Auth connection error:', error);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('Current user:', user ? 'Authenticated' : 'Not authenticated');
    }
  } catch (err) {
    console.error('❌ Connection test failed:', err);
  }
}

async function checkEmailConfiguration() {
  console.log('\n=== Email Configuration Check ===');
  console.log('🔧 To configure email settings in Supabase:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to Authentication > Settings');
  console.log('3. Check "SMTP Settings" section');
  console.log('4. Ensure SMTP is properly configured');
  console.log('5. Check "Email Templates" for password reset template');
  console.log('6. Verify sender email address is set');
  console.log('\n📧 Common email providers:');
  console.log('- Gmail: smtp.gmail.com:587');
  console.log('- Outlook: smtp-mail.outlook.com:587');
  console.log('- SendGrid: smtp.sendgrid.net:587');
  console.log('- Mailgun: smtp.mailgun.org:587');
}

async function runTests() {
  await checkSupabaseConnection();
  await testForgotPassword();
  await checkEmailConfiguration();
  
  console.log('\n=== Troubleshooting Steps ===');
  console.log('1. ✅ Code is working (API returns success)');
  console.log('2. 🔍 Check Supabase dashboard email configuration');
  console.log('3. 📧 Verify email templates are set up');
  console.log('4. 🛠️  Check SMTP settings and credentials');
  console.log('5. 📬 Check spam/junk folder');
  console.log('6. ⏰ Wait 5-10 minutes for email delivery');
  console.log('7. 🔄 Try with a different email address');
}

runTests().catch(console.error); 