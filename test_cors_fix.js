// Test script to verify CORS fix for admin portal authentication
const { spawn } = require('child_process');

function testCorsHeaders() {
  return new Promise((resolve) => {
    console.log('Testing CORS headers for session API...');
    
    const curl = spawn('curl', [
      '-H', 'Origin: http://localhost:3000',
      '-H', 'Accept: application/json',
      '-i', // Include headers in output
      '-s', // Silent mode
      'http://localhost:3007/services/api/auth/session'
    ]);
    
    let output = '';
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.on('close', (code) => {
      console.log('Response:');
      console.log(output);
      
      // Check for CORS headers
      const hasCorsOrigin = output.includes('Access-Control-Allow-Origin: http://localhost:3000');
      const hasCorsCredentials = output.includes('Access-Control-Allow-Credentials: true');
      
      console.log('\nCORS Analysis:');
      console.log(`✓ Access-Control-Allow-Origin header: ${hasCorsOrigin ? 'PRESENT' : 'MISSING'}`);
      console.log(`✓ Access-Control-Allow-Credentials header: ${hasCorsCredentials ? 'PRESENT' : 'MISSING'}`);
      
      if (hasCorsOrigin && hasCorsCredentials) {
        console.log('\n🎉 SUCCESS: CORS headers are properly configured!');
        console.log('The portal at localhost:3000 should now be able to authenticate with the admin portal.');
      } else {
        console.log('\n❌ ISSUE: CORS headers are missing or incorrect.');
        console.log('The admin portal may need to be restarted for middleware changes to take effect.');
      }
      
      resolve({ hasCorsOrigin, hasCorsCredentials });
    });
  });
}

function testAuthFlow() {
  console.log('\n' + '='.repeat(60));
  console.log('ADMIN PORTAL AUTHENTICATION TEST');
  console.log('='.repeat(60));
  
  console.log('\nThis test verifies that the GitHub OAuth authentication flow');
  console.log('between the portal (localhost:3000) and admin portal (localhost:3007)');
  console.log('is working correctly after the CORS middleware fix.\n');
  
  testCorsHeaders().then(({ hasCorsOrigin, hasCorsCredentials }) => {
    console.log('\n' + '-'.repeat(60));
    console.log('NEXT STEPS:');
    console.log('-'.repeat(60));
    
    if (hasCorsOrigin && hasCorsCredentials) {
      console.log('1. Open http://localhost:3000/admin in your browser');
      console.log('2. Click "Login with GitHub"');
      console.log('3. You should be redirected to GitHub OAuth (not another login screen)');
      console.log('4. After GitHub authentication, you should be redirected back to the portal admin');
      console.log('\nThe authentication issue should now be resolved! 🎉');
    } else {
      console.log('1. Restart the admin portal to apply middleware changes:');
      console.log('   - Stop the current admin portal process');
      console.log('   - Run: nx dev admin-portal');
      console.log('   - Or run: pnpm start:admin-portal');
      console.log('2. Run this test script again to verify CORS headers');
      console.log('3. Then test the authentication flow in the browser');
    }
  });
}

testAuthFlow();
