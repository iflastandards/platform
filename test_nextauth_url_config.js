const fetch = require('node-fetch');

async function testNextAuthURLConfig() {
  console.log('Testing NextAuth URL Configuration Issue...\n');
  
  console.log('Current Configuration:');
  console.log('- Next.js basePath: /services');
  console.log('- NEXTAUTH_URL: http://localhost:3007/services');
  console.log('- Expected callback: http://localhost:3007/services/api/auth/callback/github');
  console.log('- Actual callback (from error): http://localhost:3007/services/callback/github');
  
  console.log('\n=== ANALYSIS ===');
  console.log('The issue appears to be a conflict between:');
  console.log('1. Next.js basePath: "/services"');
  console.log('2. NEXTAUTH_URL: "http://localhost:3007/services"');
  
  console.log('\nThis double "/services" configuration might cause NextAuth to:');
  console.log('- Generate callback URLs incorrectly');
  console.log('- Skip the "/api/auth" part in the URL construction');
  
  console.log('\n=== POTENTIAL SOLUTIONS ===');
  console.log('Option 1: Change NEXTAUTH_URL to base URL without basePath');
  console.log('  NEXTAUTH_URL=http://localhost:3007');
  console.log('  (Let Next.js basePath handle the /services part)');
  
  console.log('\nOption 2: Remove basePath and keep full NEXTAUTH_URL');
  console.log('  Remove basePath from next.config.js');
  console.log('  Keep NEXTAUTH_URL=http://localhost:3007/services');
  
  console.log('\nOption 3: Use NEXTAUTH_URL_INTERNAL for internal routing');
  console.log('  NEXTAUTH_URL=http://localhost:3007/services (external)');
  console.log('  NEXTAUTH_URL_INTERNAL=http://localhost:3007 (internal)');
  
  console.log('\n=== RECOMMENDED FIX ===');
  console.log('Try Option 1 first - change NEXTAUTH_URL to:');
  console.log('NEXTAUTH_URL=http://localhost:3007');
  console.log('\nThis should result in the correct callback URL:');
  console.log('http://localhost:3007/services/api/auth/callback/github');
  
  console.log('\n=== TESTING STEPS ===');
  console.log('1. Update apps/admin/.env:');
  console.log('   NEXTAUTH_URL=http://localhost:3007');
  console.log('2. Restart the admin portal');
  console.log('3. Test the OAuth flow again');
  console.log('4. Check if the callback URL is now correct');
}

testNextAuthURLConfig().catch(console.error);
