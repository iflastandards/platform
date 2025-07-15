#!/usr/bin/env tsx
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔧 Supabase Setup Guide for IFLA Standards Platform\n');

console.log('This script will help you set up Supabase for the import workflow.\n');

console.log('Step 1: Create a Supabase Project');
console.log('---------------------------------------');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Click "New project"');
console.log('3. Choose your organization (or create one)');
console.log('4. Set project name: "ifla-standards-dev" (or similar)');
console.log('5. Generate a strong database password');
console.log('6. Choose your region (preferably close to your users)');
console.log('7. Click "Create new project"\n');

console.log('Step 2: Get Your API Keys');
console.log('---------------------------------------');
console.log('1. Once created, go to Settings > API');
console.log('2. Copy the "URL" - this is your NEXT_PUBLIC_SUPABASE_URL');
console.log('3. Copy the "anon public" key - this is your NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('4. Copy the "service_role" key - this is your SUPABASE_SERVICE_ROLE_KEY\n');

console.log('Step 3: Create Database Schema');
console.log('---------------------------------------');
console.log('1. Go to SQL Editor in your Supabase dashboard');
console.log('2. Create a new query');
console.log('3. Copy and paste the following SQL:\n');

// Read the schema file
const schemaPath = join(__dirname, '../apps/admin/src/lib/supabase/schema.sql');
try {
  const schema = readFileSync(schemaPath, 'utf-8');
  console.log('```sql');
  console.log(schema);
  console.log('```\n');
} catch (error) {
  console.log('⚠️  Could not read schema file. Make sure to run the SQL from:');
  console.log('   apps/admin/src/lib/supabase/schema.sql\n');
}

console.log('Step 4: Configure Environment Variables');
console.log('---------------------------------------');
console.log('1. Copy apps/admin/.env.local.example to apps/admin/.env.local');
console.log('2. Fill in the Supabase values from Step 2');
console.log('3. Restart your development server\n');

console.log('Step 5: Enable Row Level Security (Optional but Recommended)');
console.log('---------------------------------------');
console.log('For production use, you should enable RLS policies.');
console.log('Example policies are provided in the schema file.\n');

console.log('Step 6: Test Your Connection');
console.log('---------------------------------------');
console.log('1. Start the admin app: pnpm nx dev admin');
console.log('2. Navigate to /import');
console.log('3. Try creating an import job');
console.log('4. Check Supabase dashboard > Table Editor to see the job created\n');

console.log('✅ Setup guide complete!');
console.log('\nFor more information, visit: https://supabase.com/docs');