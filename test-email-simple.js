// Simple test script for Supabase email functionality
// Run this with: node test-email-simple.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('=== Supabase Email Configuration Test ===');

// Check environment variables
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create service role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEmailConfiguration() {
  try {
    console.log('\n🔍 Testing Supabase email configuration...');
    
    // Test 1: Check if we can access auth settings
    console.log('\n📋 Test 1: Checking auth configuration...');
    
    // Test 2: Try to send a test email using the same method as our API
    console.log('\n📧 Test 2: Testing email sending process...');
    
    const testEmail = 'test@example.com';
    const pseudoEmail = 'quen@wrkout.app';
    
    console.log('🔍 Looking for user with email:', pseudoEmail);
    
    // Get user list to find our test user
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }
    
    console.log(`✅ Found ${users?.length || 0} users`);
    
    const user = users?.find(u => u.email === pseudoEmail);
    
    if (!user) {
      console.error('❌ Test user not found');
      return;
    }
    
    console.log('✅ Test user found:', { id: user.id, email: user.email });
    
    // Test 3: Check if we can update user email (simulate our process)
    console.log('\n🔄 Test 3: Testing email update process...');
    
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email: testEmail }
    );
    
    if (updateError) {
      console.error('❌ Error updating user email:', updateError);
      console.log('\n💡 This suggests there might be an issue with:');
      console.log('   - Service role permissions');
      console.log('   - Email validation rules');
      console.log('   - Supabase configuration');
    } else {
      console.log('✅ User email updated successfully');
      
      // Revert the email back
      const { error: revertError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email: pseudoEmail }
      );
      
      if (revertError) {
        console.error('⚠️ Error reverting email:', revertError);
      } else {
        console.log('✅ Email reverted successfully');
      }
    }
    
    // Test 4: Check email templates
    console.log('\n📧 Test 4: Email delivery analysis...');
    console.log('💡 Common reasons for email delays:');
    console.log('   1. SMTP configuration not set up in Supabase dashboard');
    console.log('   2. Email templates not configured');
    console.log('   3. Sender email not verified');
    console.log('   4. Rate limiting or spam filters');
    console.log('   5. Network delays (can take 5-15 minutes)');
    
    console.log('\n🔧 Next steps to check:');
    console.log('   1. Go to Supabase Dashboard → Authentication → Settings');
    console.log('   2. Check "SMTP Settings" section');
    console.log('   3. Verify "Email Templates" are configured');
    console.log('   4. Check "Sender Email" is set and verified');
    console.log('   5. Look for any error messages in the dashboard');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testEmailConfiguration().catch(console.error); 