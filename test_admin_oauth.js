const fetch = require('node-fetch');

async function testAdminPortalEndpoints() {
  console.log('Testing Admin Portal OAuth Configuration...\n');
  
  const baseUrl = 'http://localhost:3007/services';
  const endpoints = [
    { name: 'Admin Portal Base', url: `${baseUrl}` },
    { name: 'Auth Signin Page', url: `${baseUrl}/auth/signin` },
    { name: 'Session API', url: `${baseUrl}/api/auth/session` },
    { name: 'Signout API', url: `${baseUrl}/api/auth/signout` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}: ${endpoint.url}`);
      const response = await fetch(endpoint.url, {
        method: 'GET',
        timeout: 5000
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (endpoint.name === 'Session API') {
        const data = await response.text();
        console.log(`  Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
      }
      
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log('  → Admin portal is not running on port 3007');
      }
    }
    console.log('');
  }
  
  // Test portal admin page
  console.log('Testing Portal Admin Page...');
  try {
    const portalResponse = await fetch('http://localhost:3000/admin', {
      timeout: 5000
    });
    console.log(`Portal Admin Status: ${portalResponse.status} ${portalResponse.statusText}`);
  } catch (error) {
    console.log(`Portal Admin Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('  → Portal is not running on port 3000');
    }
  }
}

testAdminPortalEndpoints().catch(console.error);
