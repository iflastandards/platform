#!/usr/bin/env node

const fetch = require('node-fetch');

async function testDemoMode() {
  console.log('Testing Demo Mode...\n');

  // Check if environment variable is set
  console.log('1. Environment Variable Check:');
  console.log(
    `   NEXT_PUBLIC_IFLA_DEMO = ${process.env.NEXT_PUBLIC_IFLA_DEMO}`,
  );

  // Check server response
  console.log('\n2. Server Response Check:');
  try {
    const response = await fetch('http://localhost:3007/api/health');
    const text = await response.text();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${text}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Check if demo mode is visible in page source
  console.log('\n3. Page Source Check:');
  try {
    const response = await fetch('http://localhost:3007/');
    const html = await response.text();

    // Look for demo-related strings
    const hasDemoEnvVar = html.includes('NEXT_PUBLIC_IFLA_DEMO');
    const hasDemoMode =
      html.includes('Demo Mode') || html.includes('DEMO MODE');
    const hasMockService = html.includes('github-mock-service');

    console.log(`   Contains NEXT_PUBLIC_IFLA_DEMO: ${hasDemoEnvVar}`);
    console.log(`   Contains "Demo Mode" text: ${hasDemoMode}`);
    console.log(`   Contains mock service reference: ${hasMockService}`);

    // Check __NEXT_DATA__ for environment variables
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/,
    );
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const envVars = nextData.props?.pageProps?.__env || {};
        console.log('\n4. Next.js Data Check:');
        console.log(
          `   Environment variables in __NEXT_DATA__:`,
          Object.keys(envVars),
        );
      } catch (e) {
        // Ignore parsing errors
      }
    }
  } catch (error) {
    console.log(`   Error fetching page: ${error.message}`);
  }

  console.log('\n5. Recommendations:');
  console.log('   - Sign in with one of the test accounts');
  console.log('   - Navigate to /dashboard');
  console.log('   - Look for orange "DEMO MODE" chip');
  console.log('   - Check role chip in navbar (admin/maintainer/member)');
  console.log('   - Verify mock data loads instantly without API calls');
}

testDemoMode();
