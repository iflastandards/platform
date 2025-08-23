#!/usr/bin/env node

/**
 * Enhanced test runner with real-time progress reporting
 * Shows test results as each project completes
 */

const { execSync, spawn } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');

// Try to load chalk, fallback to no colors if not available
let chalk;
try {
  chalk = require('chalk').default || require('chalk');
} catch (e) {
  // Fallback to no-color functions
  chalk = {
    blue: (str) => str,
    cyan: (str) => str,
    green: (str) => str,
    red: (str) => str,
    yellow: (str) => str,
    gray: (str) => str,
    bold: (str) => str,
  };
  Object.keys(chalk).forEach((key) => {
    if (typeof chalk[key] === 'function') {
      chalk[key].bold = (str) => str;
    }
  });
}

// Ensure nx daemon is running
ensureDaemon();

console.log(
  chalk.blue('🚀 Starting test run with real-time progress reporting...\n'),
);

// Get list of affected projects with test target (excluding platform to avoid redundancy)
let affectedProjects = [];
try {
  const projectsOutput = execSync(
    'pnpm nx show projects --affected --target=test --exclude=platform',
    {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    },
  );
  affectedProjects = projectsOutput.trim().split('\n').filter(Boolean);
} catch (error) {
  console.log(chalk.yellow('⚠️  No affected projects with test target found'));
  process.exit(0);
}

console.log(
  chalk.cyan(
    `📋 Found ${affectedProjects.length} affected projects to test:\n`,
  ),
);
affectedProjects.forEach((p) => console.log(`   • ${p}`));
console.log('');

// Track results
const results = {
  passed: [],
  failed: [],
  skipped: [],
  inProgress: new Set(),
};

const totalStartTime = Date.now();

// Function to run test for a single project
function runProjectTest(project) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log(
      chalk.gray(`[${new Date().toLocaleTimeString()}]`) +
        chalk.blue(` ▶️  Testing ${project}...`),
    );
    results.inProgress.add(project);

    const testProcess = spawn(
      'pnpm',
      ['nx', 'test', project, '--skip-nx-cache'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      },
    );

    let output = '';
    let errorOutput = '';

    testProcess.stdout.on('data', (data) => {
      output += data.toString();
      // Check for test completion patterns
      const dataStr = data.toString();
      if (dataStr.includes('Test Files') || dataStr.includes('Tests')) {
        // Extract test summary if available
        const lines = dataStr.split('\n');
        lines.forEach((line) => {
          if (
            line.includes('passed') ||
            line.includes('failed') ||
            line.includes('skipped')
          ) {
            console.log(chalk.gray(`     ${project}: `) + line.trim());
          }
        });
      }
    });

    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    testProcess.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      results.inProgress.delete(project);

      // Check if the error is due to missing test target (can be in stdout or stderr)
      const combinedOutput = output + errorOutput;
      const hasNoTestTarget =
        combinedOutput.includes('Cannot find configuration for task') &&
        combinedOutput.includes(':test');
      const hasNoTestFiles = output.includes('No test files found');

      if (code === 0 || hasNoTestFiles) {
        results.passed.push(project);
        console.log(
          chalk.gray(`[${new Date().toLocaleTimeString()}]`) +
            chalk.green(` ✅ ${project} completed`) +
            chalk.gray(` (${duration}s)`),
        );

        // Try to extract test counts from output
        const testMatch = output.match(/(\d+)\s+pass/);
        const failMatch = output.match(/(\d+)\s+fail/);
        const skipMatch = output.match(/(\d+)\s+skip/);

        if (testMatch || failMatch || skipMatch) {
          const summary = [];
          if (testMatch) {summary.push(chalk.green(`${testMatch[1]} passed`));}
          if (failMatch) {summary.push(chalk.red(`${failMatch[1]} failed`));}
          if (skipMatch) {summary.push(chalk.yellow(`${skipMatch[1]} skipped`));}
          console.log(chalk.gray(`     └─ ${summary.join(', ')}`));
        } else if (hasNoTestFiles) {
          console.log(chalk.gray(`     └─ No test files found`));
        }
      } else if (hasNoTestTarget) {
        results.skipped.push(project);
        console.log(
          chalk.gray(`[${new Date().toLocaleTimeString()}]`) +
            chalk.yellow(` ⏭️  ${project} skipped`) +
            chalk.gray(` (no test target)`),
        );
      } else {
        results.failed.push(project);
        console.log(
          chalk.gray(`[${new Date().toLocaleTimeString()}]`) +
            chalk.red(` ❌ ${project} failed`) +
            chalk.gray(` (${duration}s)`),
        );
        if (errorOutput && !hasNoTestTarget) {
          console.log(
            chalk.red(`     └─ Error: ${errorOutput.split('\n')[0]}`),
          );
        }
      }

      // Show progress
      const completed =
        results.passed.length + results.failed.length + results.skipped.length;
      const remaining = affectedProjects.length - completed;
      if (remaining > 0) {
        console.log(
          chalk.gray(
            `     Progress: ${completed}/${affectedProjects.length} completed, ${remaining} remaining\n`,
          ),
        );
      }

      resolve(code);
    });
  });
}

// Run tests with controlled parallelism
async function runTests() {
  const maxParallel = 3;
  const queue = [...affectedProjects];
  const running = [];

  console.log(
    chalk.cyan(
      `\n🔄 Running tests with max parallelism of ${maxParallel}...\n`,
    ),
  );

  while (queue.length > 0 || running.length > 0) {
    // Start new tests up to max parallel
    while (running.length < maxParallel && queue.length > 0) {
      const project = queue.shift();
      const promise = runProjectTest(project);
      running.push(promise);
    }

    // Wait for at least one to complete
    if (running.length > 0) {
      await Promise.race(running);
      // Remove completed promises
      for (let i = running.length - 1; i >= 0; i--) {
        const result = await Promise.race([
          running[i],
          Promise.resolve('pending'),
        ]);
        if (result !== 'pending') {
          running.splice(i, 1);
        }
      }
    }
  }

  // Final summary
  const totalDuration = ((Date.now() - totalStartTime) / 1000).toFixed(1);
  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(chalk.cyan.bold('📊 Test Run Summary'));
  console.log(chalk.cyan('='.repeat(60)));

  if (results.passed.length > 0) {
    console.log(chalk.green(`\n✅ Passed (${results.passed.length}):`));
    results.passed.forEach((p) => console.log(chalk.green(`   • ${p}`)));
  }

  if (results.skipped.length > 0) {
    console.log(
      chalk.yellow(
        `\n⏭️  Skipped (${results.skipped.length}) - no test target:`,
      ),
    );
    results.skipped.forEach((p) => console.log(chalk.yellow(`   • ${p}`)));
  }

  if (results.failed.length > 0) {
    console.log(chalk.red(`\n❌ Failed (${results.failed.length}):`));
    results.failed.forEach((p) => console.log(chalk.red(`   • ${p}`)));
  }

  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(
    chalk.cyan('Total: ') +
      chalk.green(`${results.passed.length} passed`) +
      ', ' +
      chalk.yellow(`${results.skipped.length} skipped`) +
      ', ' +
      chalk.red(`${results.failed.length} failed`) +
      chalk.gray(` (${totalDuration}s)`),
  );
  console.log(chalk.cyan('='.repeat(60) + '\n'));

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Handle interruption
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⚠️  Test run interrupted'));
  console.log(
    chalk.gray('In progress: ' + Array.from(results.inProgress).join(', ')),
  );
  process.exit(130);
});

// Start test execution
runTests().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
