#!/usr/bin/env node

/**
 * Tag-based Test Runner - Optimized for Phase 1 tagging system
 * Runs tests based on tags with nx affected integration
 */

const { execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');

class TagBasedTestRunner {
  constructor() {
    this.args = process.argv.slice(2);
    this.options = this.parseOptions();
  }

  parseOptions() {
    const options = {
      tags: [],
      affected: true,
      parallel: 3,
      watch: false,
      coverage: false,
      projects: 'all',
      dryRun: false
    };

    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i];
      switch (arg) {
        case '--tags':
          options.tags = this.args[++i]?.split(',') || [];
          break;
        case '--parallel':
          options.parallel = parseInt(this.args[++i]) || 3;
          break;
        case '--no-affected':
          options.affected = false;
          break;
        case '--watch':
          options.watch = true;
          break;
        case '--coverage':
          options.coverage = true;
          break;
        case '--projects':
          options.projects = this.args[++i] || 'all';
          break;
        case '--dry-run':
          options.dryRun = true;
          break;
      }
    }

    return options;
  }

  buildCommand() {
    let baseCommand;
    
    if (this.options.affected && this.options.projects === 'all') {
      baseCommand = 'pnpm exec nx affected --target=test';
    } else if (this.options.projects === 'all') {
      baseCommand = 'pnpm exec nx run-many --target=test --all';
    } else {
      baseCommand = `pnpm exec nx run-many --target=test --projects=${this.options.projects}`;
    }

    // Add parallel execution
    baseCommand += ` --parallel=${this.options.parallel}`;

    // Add tag filtering via grep
    if (this.options.tags.length > 0) {
      const tagPattern = this.options.tags.join('.*');
      baseCommand += ` -- --grep "${tagPattern}"`;
    }

    // Add coverage if requested
    if (this.options.coverage) {
      baseCommand += ' --coverage';
    }

    // Add watch mode if requested
    if (this.options.watch) {
      baseCommand += ' --watch';
    }

    return baseCommand;
  }

  async run() {
    console.log('🧪 Tag-based Test Runner\n');
    
    const command = this.buildCommand();
    
    if (this.options.dryRun) {
      console.log(`🔍 Dry run - would execute: ${command}\n`);
      return;
    }
    
    // Ensure nx daemon for performance
    ensureDaemon();

    console.log(`🚀 Executing: ${command}\n`);

    try {
      execSync(command, {
        stdio: 'inherit',
        env: process.env
      });
      console.log('\n✅ Tests completed successfully');
    } catch (error) {
      console.log('\n❌ Tests failed');
      process.exit(1);
    }
  }

  printHelp() {
    console.log(`
Tag-based Test Runner

Usage:
  node scripts/run-tests-by-tag.js [options]

Options:
  --tags <tags>        Comma-separated list of tags to filter by
  --parallel <n>       Number of parallel processes (default: 3)
  --no-affected        Run all tests instead of affected only
  --watch              Run in watch mode  
  --coverage           Generate coverage report
  --projects <list>    Specific projects to test
  --dry-run            Show command without executing

Examples:
  node scripts/run-tests-by-tag.js --tags @unit
  node scripts/run-tests-by-tag.js --tags @critical,@security --parallel 6
  node scripts/run-tests-by-tag.js --tags @integration --no-affected
  node scripts/run-tests-by-tag.js --tags @unit --watch
`);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TagBasedTestRunner();
  
  if (runner.args.includes('--help') || runner.args.includes('-h')) {
    runner.printHelp();
  } else {
    runner.run().catch(console.error);
  }
}

module.exports = { TagBasedTestRunner };
