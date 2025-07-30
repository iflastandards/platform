#!/usr/bin/env node

/**
 * Test Runner Utility for Tag-Based Test Execution
 * This script provides a CLI interface for running tests with specific tags
 */

import { spawn } from 'child_process';
import { TestTags } from './test-tags';

interface TestRunOptions {
  tags?: string[];
  browsers?: string[];
  workers?: number;
  retries?: number;
  headed?: boolean;
  debug?: boolean;
  updateSnapshots?: boolean;
  reporter?: string;
  grep?: string;
  project?: string;
  config?: string;
}

/**
 * Run Playwright tests with specified options
 */
export function runTests(options: TestRunOptions = {}): Promise<number> {
  const args = ['playwright', 'test'];
  
  // Add config file if specified
  if (options.config) {
    args.push('--config', options.config);
  }
  
  // Add grep pattern for tags
  if (options.tags && options.tags.length > 0) {
    const grepPattern = options.tags.join('|');
    args.push('--grep', grepPattern);
  } else if (options.grep) {
    args.push('--grep', options.grep);
  }
  
  // Add browser projects
  if (options.browsers && options.browsers.length > 0) {
    options.browsers.forEach(browser => {
      args.push('--project', browser);
    });
  } else if (options.project) {
    args.push('--project', options.project);
  }
  
  // Add other options
  if (options.workers) {
    args.push('--workers', options.workers.toString());
  }
  
  if (options.retries !== undefined) {
    args.push('--retries', options.retries.toString());
  }
  
  if (options.headed) {
    args.push('--headed');
  }
  
  if (options.debug) {
    args.push('--debug');
  }
  
  if (options.updateSnapshots) {
    args.push('--update-snapshots');
  }
  
  if (options.reporter) {
    args.push('--reporter', options.reporter);
  }
  
  // Execute the command
  return new Promise((resolve) => {
    const child = spawn('npx', args, {
      stdio: 'inherit',
      shell: true,
    });
    
    child.on('close', (code) => {
      resolve(code || 0);
    });
  });
}

/**
 * Predefined test suites
 */
export const TestSuites = {
  smoke: () => runTests({
    tags: [TestTags.SMOKE],
    config: 'playwright.config.smoke.ts',
    workers: 4,
    retries: 0,
  }),
  
  integration: () => runTests({
    tags: [TestTags.INTEGRATION],
    config: 'playwright.config.integration.ts',
    workers: 3,
    retries: 1,
  }),
  
  e2e: () => runTests({
    tags: [TestTags.E2E],
    config: 'playwright.config.e2e.ts',
    workers: 2,
    retries: 2,
  }),
  
  critical: () => runTests({
    tags: [TestTags.CRITICAL],
    browsers: ['chromium', 'firefox'],
    retries: 2,
  }),
  
  auth: () => runTests({
    tags: [TestTags.AUTH],
    browsers: ['chromium'],
    retries: 1,
  }),
  
  rbac: () => runTests({
    tags: [TestTags.RBAC],
    browsers: ['chromium'],
    retries: 1,
  }),
  
  admin: () => runTests({
    tags: [TestTags.ADMIN],
    project: 'portal-e2e',
  }),
  
  flaky: () => runTests({
    tags: [TestTags.FLAKY],
    retries: 3,
    workers: 1,
  }),
  
  mobile: () => runTests({
    tags: [TestTags.MOBILE_ONLY],
    browsers: ['mobile-chrome', 'mobile-safari'],
  }),
  
  visual: () => runTests({
    tags: [TestTags.VISUAL],
    updateSnapshots: process.argv.includes('--update-snapshots'),
  }),
  
  performance: () => runTests({
    tags: [TestTags.PERFORMANCE],
    browsers: ['chromium'],
    workers: 1,
  }),
};

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === '--help') {
    console.log(`
Playwright Test Runner - Tag-Based Test Execution

Usage: test-runner <command> [options]

Commands:
  smoke         Run smoke tests
  integration   Run integration tests
  e2e          Run end-to-end tests
  critical     Run critical tests
  auth         Run authentication tests
  rbac         Run RBAC tests
  admin        Run admin portal tests
  flaky        Run flaky tests with extra retries
  mobile       Run mobile-only tests
  visual       Run visual regression tests
  performance  Run performance tests
  custom       Run tests with custom tags

Options:
  --tags       Comma-separated list of tags
  --browsers   Comma-separated list of browsers
  --workers    Number of parallel workers
  --retries    Number of retries
  --headed     Run tests in headed mode
  --debug      Run tests in debug mode
  --update-snapshots  Update visual snapshots

Examples:
  test-runner smoke
  test-runner integration --workers 4
  test-runner custom --tags @auth,@critical --browsers chromium,firefox
  test-runner visual --update-snapshots
    `);
    process.exit(0);
  }
  
  // Parse options
  const options: TestRunOptions = {};
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    
    switch (arg) {
      case '--tags':
        options.tags = next?.split(',').map(t => t.trim());
        i++;
        break;
      case '--browsers':
        options.browsers = next?.split(',').map(b => b.trim());
        i++;
        break;
      case '--workers':
        options.workers = parseInt(next || '1');
        i++;
        break;
      case '--retries':
        options.retries = parseInt(next || '0');
        i++;
        break;
      case '--headed':
        options.headed = true;
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--update-snapshots':
        options.updateSnapshots = true;
        break;
    }
  }
  
  // Run the appropriate test suite
  let testPromise: Promise<number>;
  
  if (command === 'custom') {
    testPromise = runTests(options);
  } else if (command in TestSuites) {
    testPromise = TestSuites[command as keyof typeof TestSuites]();
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
  
  testPromise.then(code => {
    process.exit(code);
  });
}