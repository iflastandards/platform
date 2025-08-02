#!/usr/bin/env node

/**
 * Centralized linting commands for the monorepo
 * Provides utilities for running ESLint with various configurations
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const commands = {
  'lint:check-config': {
    description: 'Check ESLint configuration for a specific file',
    usage: 'pnpm lint:check-config <file-path>',
    run: (args) => {
      const filePath = args[0];
      if (!filePath) {
        console.error('Please provide a file path');
        process.exit(1);
      }
      execSync(`pnpm eslint --print-config "${filePath}"`, { stdio: 'inherit' });
    },
  },
  
  'lint:debug': {
    description: 'Run ESLint with debug output',
    usage: 'pnpm lint:debug [files...]',
    run: (args) => {
      const files = args.join(' ') || '.';
      execSync(`DEBUG=eslint:* pnpm eslint ${files}`, { stdio: 'inherit' });
    },
  },
  
  'lint:workspace': {
    description: 'Lint a specific workspace',
    usage: 'pnpm lint:workspace <workspace-name>',
    run: (args) => {
      const workspace = args[0];
      if (!workspace) {
        console.error('Please provide a workspace name');
        process.exit(1);
      }
      execSync(`pnpm nx lint ${workspace}`, { stdio: 'inherit' });
    },
  },
  
  'lint:cached': {
    description: 'Run ESLint with caching enabled',
    usage: 'pnpm lint:cached [files...]',
    run: (args) => {
      const files = args.join(' ') || '.';
      execSync(`pnpm eslint --cache --cache-location node_modules/.cache/eslint/ ${files}`, { stdio: 'inherit' });
    },
  },
  
  'lint:report': {
    description: 'Generate an HTML report of linting issues',
    usage: 'pnpm lint:report',
    run: () => {
      execSync('pnpm eslint . --format html --output-file eslint-report.html', { stdio: 'inherit' });
      console.log('Report generated: eslint-report.html');
    },
  },
};

// Parse command
const command = process.argv[2];
const args = process.argv.slice(3);

if (!command || command === '--help') {
  console.log('Available lint commands:\n');
  Object.entries(commands).forEach(([name, cmd]) => {
    console.log(`  ${name.padEnd(20)} ${cmd.description}`);
    console.log(`  ${' '.repeat(20)} Usage: ${cmd.usage}\n`);
  });
  process.exit(0);
}

if (commands[command]) {
  try {
    commands[command].run(args);
  } catch (error) {
    console.error(`Error running ${command}:`, error.message);
    process.exit(1);
  }
} else {
  console.error(`Unknown command: ${command}`);
  console.log('Run with --help to see available commands');
  process.exit(1);
}