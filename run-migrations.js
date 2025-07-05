#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗄️  Supabase Database Migration Helper\n');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.log('❌ Migrations directory not found!');
  process.exit(1);
}

const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

console.log('📋 Found migration files:');
migrationFiles.forEach((file, index) => {
  console.log(`  ${index + 1}. ${file}`);
});

console.log('\n📝 To run these migrations:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of each migration file');
console.log('4. Run them in order (001, then 002)\n');

console.log('🔗 Your Supabase project URL:');
console.log('   https://izbdlaygeupakdhuodlk.supabase.co\n');

console.log('📖 Migration contents:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

migrationFiles.forEach((file, index) => {
  const filePath = path.join(migrationsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`\n📄 ${file}:`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(content);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

console.log('\n✅ After running migrations:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Try signing up with a new account');
console.log('3. Check the browser console for any errors\n');

console.log('�� Happy coding!'); 