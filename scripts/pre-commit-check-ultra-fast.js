#!/usr/bin/env node

/**
 * Ultra-fast pre-commit check that runs all checks in parallel
 * - Runs typecheck, lint, and tests completely in parallel
 * - Uses direct tsc for typecheck (bypassing Nx task dependencies)
 * - Maximum parallelization for speed
 */

const { spawn } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');

console.log('\n⚡ Running ultra-fast pre-commit checks (all in parallel)...\n');

// Ensure nx daemon is running for better performance
ensureDaemon();

// Run all checks in parallel
const checks = [
  {
    name: 'TypeScript',
    command: 'node',
    args: ['scripts/tsc-affected-fast.js'],
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
  },
  {
    name: 'Lint',
    command: 'pnpm',
    args: ['nx', 'affected', '--target=lint', '--parallel=6'],
    env: process.env,
  },
  {
    name: 'Tests',
    command: 'pnpm',
    args: ['nx', 'affected', '--target=test', '--parallel=6'],
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
  },
];

const results = [];
let completedCount = 0;

// Start all checks in parallel
checks.forEach((check, index) => {
  console.log(`🚀 Starting ${check.name}...`);

  const startTime = Date.now();
  const child = spawn(check.command, check.args, {
    env: check.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  let output = '';
  let errorOutput = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
  });

  child.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  child.on('close', (code) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    results[index] = {
      name: check.name,
      passed: code === 0,
      duration,
      output: output.trim(),
      errorOutput: errorOutput.trim(),
    };

    completedCount++;

    // Check if all are complete
    if (completedCount === checks.length) {
      displayResults();
    }
  });
});

function displayResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Pre-commit Check Results:');
  console.log('='.repeat(60) + '\n');

  let hasFailures = false;

  results.forEach((result) => {
    const status = result.passed ? '✅' : '❌';
    const statusText = result.passed ? 'PASSED' : 'FAILED';
    console.log(
      `${status} ${result.name}: ${statusText} (${result.duration}s)`,
    );

    if (!result.passed) {
      hasFailures = true;
      console.log(`   Output:`);
      if (result.output) {
        console.log(
          result.output
            .split('\n')
            .map((line) => '   ' + line)
            .join('\n'),
        );
      }
      if (result.errorOutput) {
        console.log(
          result.errorOutput
            .split('\n')
            .map((line) => '   ' + line)
            .join('\n'),
        );
      }
    }
  });

  console.log('\n' + '='.repeat(60));

  if (hasFailures) {
    console.log(
      '❌ Pre-commit checks failed. Please fix errors before committing.\n',
    );
    process.exit(1);
  } else {
    const totalTime = results.reduce(
      (sum, r) => sum + parseFloat(r.duration),
      0,
    );
    const savedTime =
      totalTime - Math.max(...results.map((r) => parseFloat(r.duration)));
    console.log(`✅ All pre-commit checks passed!`);
    console.log(
      `⏱️  Total time: ${Math.max(...results.map((r) => parseFloat(r.duration)))}s`,
    );
    console.log(`🚀 Time saved by parallelization: ${savedTime.toFixed(1)}s\n`);
    process.exit(0);
  }
}
