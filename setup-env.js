#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Supabase environment variables...\n');

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Please check if your Supabase credentials are correct.\n');
} else {
  const envContent = `# Supabase Configuration
# Replace these with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Example format:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('📝 Please edit .env.local with your Supabase credentials\n');
}

console.log('📋 Next steps:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Create a new project or select an existing one');
console.log('3. Go to Settings → API');
console.log('4. Copy the Project URL and anon public key');
console.log('5. Paste them in .env.local');
console.log('6. Run the SQL commands from SUPABASE_SETUP.md');
console.log('7. Restart your development server: npm run dev\n');

console.log('📖 For detailed instructions, see SUPABASE_SETUP.md'); 