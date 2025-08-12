#!/usr/bin/env node

/**
 * Test script to check demo mode on preview server
 * Run: node scripts/test-preview-demo.js
 */

const PREVIEW_URL = 'https://admin-iflastandards-preview.onrender.com';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDemoMode() {
  log('\n🔍 Testing Demo Mode on Preview Server', 'cyan');
  log(`   URL: ${PREVIEW_URL}\n`, 'blue');

  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  // Test 1: Check if server is accessible
  log('1. Testing server accessibility...', 'yellow');
  try {
    const response = await fetch(PREVIEW_URL);
    if (response.ok) {
      results.passed.push('✅ Server is accessible');
      log('   ✅ Server is accessible', 'green');
    } else {
      results.failed.push(`❌ Server returned status ${response.status}`);
      log(`   ❌ Server returned status ${response.status}`, 'red');
    }
  } catch (error) {
    results.failed.push('❌ Server is not accessible');
    log(`   ❌ Error: ${error.message}`, 'red');
    return results;
  }

  // Test 2: Check demo status endpoint
  log('\n2. Testing demo status endpoint...', 'yellow');
  try {
    const response = await fetch(`${PREVIEW_URL}/api/demo-status`);

    if (response.redirected) {
      results.warnings.push('⚠️  Demo status endpoint requires authentication');
      log(
        '   ⚠️  Endpoint requires authentication or does not exist',
        'yellow',
      );
    } else if (response.ok) {
      const data = await response.json();

      if (data.isDemoMode === true) {
        results.passed.push('✅ Demo mode is ENABLED');
        log('   ✅ Demo mode is ENABLED', 'green');
        log(
          `      NEXT_PUBLIC_IFLA_DEMO: ${data.NEXT_PUBLIC_IFLA_DEMO}`,
          'cyan',
        );
        log(`      NODE_ENV: ${data.NODE_ENV}`, 'cyan');
      } else {
        results.failed.push('❌ Demo mode is DISABLED');
        log('   ❌ Demo mode is DISABLED', 'red');
        log(
          `      NEXT_PUBLIC_IFLA_DEMO: ${data.NEXT_PUBLIC_IFLA_DEMO || 'not set'}`,
          'cyan',
        );
      }
    } else {
      results.warnings.push(`⚠️  Demo status returned ${response.status}`);
      log(`   ⚠️  Unexpected status: ${response.status}`, 'yellow');
    }
  } catch (error) {
    results.warnings.push('⚠️  Could not check demo status');
    log(`   ⚠️  Error: ${error.message}`, 'yellow');
  }

  // Test 3: Check health endpoint
  log('\n3. Testing health endpoint...', 'yellow');
  try {
    const response = await fetch(`${PREVIEW_URL}/api/health`);
    if (response.ok) {
      results.passed.push('✅ Health endpoint is working');
      log('   ✅ Health endpoint is working', 'green');
    } else {
      results.warnings.push(`⚠️  Health endpoint returned ${response.status}`);
      log(`   ⚠️  Health endpoint returned ${response.status}`, 'yellow');
    }
  } catch (error) {
    results.warnings.push('⚠️  Health endpoint error');
    log(`   ⚠️  Error: ${error.message}`, 'yellow');
  }

  // Test 4: Check Clerk configuration
  log('\n4. Testing authentication setup...', 'yellow');
  try {
    const response = await fetch(PREVIEW_URL);
    const html = await response.text();

    if (html.includes('clerk.accounts.dev') || html.includes('__clerk')) {
      results.passed.push('✅ Clerk authentication is configured');
      log('   ✅ Clerk authentication is configured', 'green');
    } else {
      results.warnings.push('⚠️  Clerk configuration not detected in HTML');
      log('   ⚠️  Clerk configuration not detected', 'yellow');
    }

    if (html.includes('Sign In') || html.includes('sign-in')) {
      results.passed.push('✅ Sign-in UI is present');
      log('   ✅ Sign-in UI is present', 'green');
    }
  } catch (error) {
    results.warnings.push('⚠️  Could not check authentication');
    log(`   ⚠️  Error: ${error.message}`, 'yellow');
  }

  // Test 5: Check protected routes
  log('\n5. Testing route protection...', 'yellow');
  try {
    const response = await fetch(`${PREVIEW_URL}/dashboard`, {
      redirect: 'manual',
    });

    if ([301, 302, 307].includes(response.status)) {
      const location = response.headers.get('location');
      if (
        location &&
        (location.includes('sign-in') || location.includes('clerk'))
      ) {
        results.passed.push('✅ Protected routes redirect to sign-in');
        log('   ✅ Protected routes properly redirect to sign-in', 'green');
      } else {
        results.warnings.push(
          '⚠️  Protected routes redirect to unexpected location',
        );
        log(`   ⚠️  Redirects to: ${location}`, 'yellow');
      }
    } else if (response.status === 200) {
      results.warnings.push(
        '⚠️  Dashboard accessible without auth (might be cached)',
      );
      log('   ⚠️  Dashboard returned 200 (might be cached)', 'yellow');
    }
  } catch (error) {
    results.warnings.push('⚠️  Could not test route protection');
    log(`   ⚠️  Error: ${error.message}`, 'yellow');
  }

  // Test 6: Check for demo mode indicators in HTML
  log('\n6. Checking for demo mode indicators...', 'yellow');
  try {
    const response = await fetch(PREVIEW_URL);
    const html = await response.text();

    // Look for environment variable in page
    if (html.includes('NEXT_PUBLIC_IFLA_DEMO')) {
      results.passed.push('✅ Demo environment variable found in page');
      log('   ✅ Demo environment variable referenced in page', 'green');
    }

    // Look for demo-related components
    if (
      html.includes('github-mock-service') ||
      html.includes('getMockGitHubData')
    ) {
      results.passed.push('✅ Mock service components detected');
      log('   ✅ Mock service components detected', 'green');
    }
  } catch (error) {
    results.warnings.push('⚠️  Could not check page content');
    log(`   ⚠️  Error: ${error.message}`, 'yellow');
  }

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(50), 'cyan');

  log(`\n✅ Passed: ${results.passed.length}`, 'green');
  results.passed.forEach((item) => log(`   ${item}`, 'green'));

  if (results.failed.length > 0) {
    log(`\n❌ Failed: ${results.failed.length}`, 'red');
    results.failed.forEach((item) => log(`   ${item}`, 'red'));
  }

  if (results.warnings.length > 0) {
    log(`\n⚠️  Warnings: ${results.warnings.length}`, 'yellow');
    results.warnings.forEach((item) => log(`   ${item}`, 'yellow'));
  }

  // Recommendations
  log('\n' + '='.repeat(50), 'cyan');
  log('💡 RECOMMENDATIONS', 'cyan');
  log('='.repeat(50), 'cyan');

  if (results.failed.some((f) => f.includes('Demo mode is DISABLED'))) {
    log('\nTo enable demo mode on preview:', 'yellow');
    log(
      '1. Add NEXT_PUBLIC_IFLA_DEMO=true to Render environment variables',
      'white',
    );
    log('2. Add IFLA_DEMO=true as well', 'white');
    log('3. Redeploy the preview server', 'white');
    log('4. Clear browser cache and test again', 'white');
  } else if (results.passed.some((p) => p.includes('Demo mode is ENABLED'))) {
    log("\n✅ Demo mode is enabled! To verify it's working:", 'green');
    log(
      '1. Sign in with a test account like editor+clerk_test@example.com',
      'white',
    );
    log('2. Look for orange "DEMO MODE" chip on dashboard', 'white');
    log('3. Check that mock data loads instead of real GitHub data', 'white');
    log('4. Verify role-based access uses mock roles', 'white');
  } else {
    log('\n⚠️  Could not determine demo mode status', 'yellow');
    log('The /api/demo-status endpoint may not be deployed yet.', 'white');
    log('Check Render logs for more information.', 'white');
  }

  log('\n' + '='.repeat(50) + '\n', 'cyan');

  return results;
}

// Run the test
testDemoMode().catch((error) => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});
