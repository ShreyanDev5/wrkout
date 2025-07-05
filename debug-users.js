// Debug script to check users in Supabase
// Run this with: node debug-users.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('=== Debug Users Script ===');

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

async function debugUsers() {
  try {
    console.log('\n🔍 Fetching users from Supabase...');
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`✅ Found ${users?.length || 0} users`);
    
    if (!users || users.length === 0) {
      console.log('📝 No users found in the database');
      return;
    }
    
    console.log('\n📋 User Details:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
      console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Check for users with @wrkout.app emails
    const wrkoutUsers = users.filter(u => u.email && u.email.includes('@wrkout.app'));
    console.log(`\n🎯 Users with @wrkout.app emails: ${wrkoutUsers.length}`);
    
    wrkoutUsers.forEach(user => {
      const username = user.email.replace('@wrkout.app', '');
      console.log(`   - ${username} (${user.email})`);
    });
    
    // Test specific username lookup
    const testUsername = process.argv[2];
    if (testUsername) {
      console.log(`\n🧪 Testing lookup for username: ${testUsername}`);
      const pseudoEmail = `${testUsername}@wrkout.app`;
      const foundUser = users.find(u => u.email === pseudoEmail);
      
      if (foundUser) {
        console.log(`✅ Found user: ${foundUser.email} (ID: ${foundUser.id})`);
      } else {
        console.log(`❌ User not found with email: ${pseudoEmail}`);
        console.log('Available emails:');
        users.slice(0, 10).forEach(u => console.log(`   - ${u.email}`));
        if (users.length > 10) {
          console.log(`   ... and ${users.length - 10} more`);
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

debugUsers().catch(console.error); 