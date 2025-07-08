const fetch = require('node-fetch');

async function testOAuthCallback() {
  console.log('Testing GitHub OAuth Callback Configuration...\n');
  
  const baseUrl = 'http://localhost:3007/services';
  
  // Test the NextAuth configuration endpoint
  console.log('1. Testing NextAuth configuration...');
  try {
    const configResponse = await fetch(`${baseUrl}/api/auth/providers`, {
      timeout: 5000
    });
    
    if (configResponse.ok) {
      const providers = await configResponse.json();
      console.log('✓ NextAuth providers endpoint accessible');
      
      if (providers.github) {
        console.log('✓ GitHub provider configured');
        console.log(`  Provider ID: ${providers.github.id}`);
        console.log(`  Provider Name: ${providers.github.name}`);
      } else {
        console.log('❌ GitHub provider not found in configuration');
      }
    } else {
      console.log(`❌ NextAuth providers endpoint returned: ${configResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Error accessing NextAuth providers: ${error.message}`);
  }
  
  console.log('\n2. Testing callback URL accessibility...');
  
  // Test if the callback endpoint exists
  const callbackUrl = `${baseUrl}/api/auth/callback/github`;
  try {
    const callbackResponse = await fetch(callbackUrl, {
      method: 'GET',
      timeout: 5000
    });
    
    console.log(`Callback URL: ${callbackUrl}`);
    console.log(`Status: ${callbackResponse.status} ${callbackResponse.statusText}`);
    
    if (callbackResponse.status === 400) {
      console.log('✓ Callback endpoint exists (400 is expected without OAuth parameters)');
    } else if (callbackResponse.status === 404) {
      console.log('❌ Callback endpoint not found - NextAuth may not be properly configured');
    } else {
      console.log(`ℹ️  Unexpected status: ${callbackResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Error accessing callback URL: ${error.message}`);
  }
  
  console.log('\n3. Analyzing the OAuth error...');
  console.log('Error URL from issue:');
  console.log('https://github.com/login/oauth/authorize?scope=read%3Auser%2Cuser%3Aemail%2Cread%3Aorg&response_type=code&client_id=Ov23liBWNxxWlhUaydib&redirect_uri=http%3A%2F%2Flocalhost%3A3007%2Fservices%2Fcallback%2Fgithub&code_challenge=YsrvjN2Y_PRGhnNwUeOM1m3BrVZuwsAjZkSI7prgcyM&code_challenge_method=S256');
  
  const errorRedirectUri = decodeURIComponent('http%3A%2F%2Flocalhost%3A3007%2Fservices%2Fcallback%2Fgithub');
  const expectedRedirectUri = 'http://localhost:3007/services/api/auth/callback/github';
  
  console.log(`\nError redirect_uri: ${errorRedirectUri}`);
  console.log(`Expected redirect_uri: ${expectedRedirectUri}`);
  console.log(`\n❌ MISMATCH DETECTED!`);
  console.log(`The OAuth error shows redirect_uri is missing '/api/auth' part`);
  console.log(`This suggests the GitHub OAuth app is configured with the wrong callback URL`);
  
  console.log('\n4. Solution:');
  console.log('The GitHub OAuth app needs to be updated with the correct callback URL:');
  console.log(`✓ Correct callback URL: ${expectedRedirectUri}`);
  console.log(`❌ Current (wrong) callback URL: ${errorRedirectUri}`);
  
  console.log('\nTo fix this:');
  console.log('1. Go to https://github.com/settings/developers');
  console.log('2. Find the OAuth app with Client ID: Ov23liBWNxxWlhUaydib');
  console.log('3. Update the "Authorization callback URL" to:');
  console.log(`   ${expectedRedirectUri}`);
  console.log('4. Save the changes');
  console.log('5. Test the OAuth flow again');
}

testOAuthCallback().catch(console.error);
