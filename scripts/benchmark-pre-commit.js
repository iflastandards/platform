#!/usr/bin/env node

/**
 * Benchmark script to compare all pre-commit test versions
 */

const { spawnSync } = require('child_process');
const fs = require('fs');

const versions = [
  { name: 'original', script: 'scripts/pre-commit-check.js' },
  { name: 'optimized', script: 'scripts/pre-commit-check-optimized.js' },
  { name: 'smart', script: 'scripts/pre-commit-check-smart.js' },
  { name: 'robust', script: 'scripts/pre-commit-check-robust.js' },
  { name: 'fast', script: 'scripts/pre-commit-check-fast.js' },
  { name: 'ultra-fast', script: 'scripts/pre-commit-check-ultra-fast.js' },
];

const results = [];

console.log('🏁 Pre-commit Test Speed Comparison\n');
console.log('='.repeat(60));
console.log('Testing all pre-commit versions...\n');

// Ensure nx daemon is running
try {
  spawnSync('node', ['scripts/ensure-nx-daemon.js'], { stdio: 'ignore' });
} catch (e) {
  // Continue even if daemon script fails
}

for (const version of versions) {
  if (!fs.existsSync(version.script)) {
    console.log(`⚠️  Skipping ${version.name}: script not found`);
    results.push({
      name: version.name,
      time: null,
      status: 'not found',
    });
    continue;
  }

  console.log(`\n📊 Testing: ${version.name}`);
  console.log('-'.repeat(40));

  const startTime = Date.now();
  let status = 'success';
  let errorOutput = '';

  try {
    // Run with 2 minute timeout
    const result = spawnSync('node', [version.script], {
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 120000, // 2 minutes in milliseconds
      env: {
        ...process.env,
        CI: '1',
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
    });

    if (result.error) {
      if (result.error.code === 'ETIMEDOUT') {
        status = 'timeout';
        errorOutput = 'Exceeded 2 minute timeout';
      } else {
        throw result.error;
      }
    } else if (result.status !== 0) {
      status = 'failed';
      errorOutput = result.stderr || result.stdout || 'Test failed';
    }
  } catch (error) {
    status = 'failed';
    errorOutput = error.message || 'Unknown error';
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  results.push({
    name: version.name,
    time: duration,
    status,
  });

  if (status === 'success') {
    console.log(`✅ Completed in ${duration.toFixed(1)}s`);
  } else if (status === 'timeout') {
    console.log(`⏱️  Timeout after ${duration.toFixed(1)}s`);
  } else {
    console.log(`❌ Failed after ${duration.toFixed(1)}s`);
    if (errorOutput) {
      console.log(`   Error: ${errorOutput.split('\n')[0]}`);
    }
  }
}

// Display comparison table
console.log('\n' + '='.repeat(60));
console.log('📊 COMPARISON RESULTS');
console.log('='.repeat(60));

// Sort by time (fastest first)
const validResults = results.filter(
  (r) => r.time !== null && r.status === 'success',
);
validResults.sort((a, b) => a.time - b.time);

if (validResults.length === 0) {
  console.log('❌ No successful runs to compare');
} else {
  console.log('\n| Version      | Time    | Status  | Speed vs Slowest |');
  console.log('|--------------|---------|---------|------------------|');

  const slowest = Math.max(...validResults.map((r) => r.time));

  results.forEach((result) => {
    const name = result.name.padEnd(12);
    const time = result.time
      ? `${result.time.toFixed(1)}s`.padEnd(7)
      : 'N/A'.padEnd(7);
    const status = result.status.padEnd(7);

    let speedup = '';
    if (result.time && result.status === 'success') {
      const improvement = (((slowest - result.time) / slowest) * 100).toFixed(
        0,
      );
      const multiplier = (slowest / result.time).toFixed(1);
      speedup = `${multiplier}x (${improvement}% faster)`;
    } else {
      speedup = 'N/A';
    }

    console.log(`| ${name} | ${time} | ${status} | ${speedup.padEnd(16)} |`);
  });

  console.log(
    '\n🏆 Winner: ' +
      validResults[0].name +
      ' (' +
      validResults[0].time.toFixed(1) +
      's)',
  );

  if (validResults.length > 1) {
    const improvement = (
      ((validResults[validResults.length - 1].time - validResults[0].time) /
        validResults[validResults.length - 1].time) *
      100
    ).toFixed(0);
    console.log(
      `📈 ${improvement}% faster than the slowest successful version`,
    );
  }
}

console.log('\n' + '='.repeat(60));
console.log('Note: Times may vary based on cache state and system load');
console.log('For most accurate results, run multiple times and average\n');
