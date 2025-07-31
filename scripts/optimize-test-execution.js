#!/usr/bin/env node

/**
 * Task 2.3 & 2.4: Test Execution Optimizer
 * Configures targeted test execution and updates package.json scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestExecutionOptimizer {
  constructor() {
    this.optimizations = {
      scriptsUpdated: [],
      scriptsCreated: [],
      configsUpdated: [],
      errors: []
    };
  }

  async optimizeTestExecution() {
    console.log('🚀 TASK 2.3 & 2.4: Optimizing Test Execution\n');

    // Update nx configuration for better affected detection
    await this.optimizeNxConfig();
    
    // Create optimized package.json scripts
    await this.createOptimizedScripts();
    
    // Update existing inefficient scripts
    await this.updateExistingScripts();
    
    // Create tag-based execution scripts
    await this.createTagBasedScripts();
    
    this.printResults();
  }

  async optimizeNxConfig() {
    console.log('⚙️  Optimizing nx.json configuration...\n');

    const nxConfigPath = 'nx.json';
    const nxConfig = JSON.parse(fs.readFileSync(nxConfigPath, 'utf8'));

    // Optimize target defaults for better affected detection
    if (!nxConfig.targetDefaults.e2e.inputs.includes('testInputs')) {
      nxConfig.targetDefaults.e2e.inputs.push('testInputs');
      this.optimizations.configsUpdated.push('Added testInputs to e2e target');
    }

    // Optimize parallel execution defaults
    if (nxConfig.parallel < 6) {
      nxConfig.parallel = 6; // Better utilization of modern multi-core systems
      this.optimizations.configsUpdated.push('Increased parallel execution to 6');
    }

    // Add tag-based input patterns
    if (!nxConfig.namedInputs.taggedTestInputs) {
      nxConfig.namedInputs.taggedTestInputs = [
        "{projectRoot}/**/*.test.*",
        "{projectRoot}/**/*.spec.*", 
        "{workspaceRoot}/scripts/test-tagging-analyzer.js",
        "{workspaceRoot}/scripts/validate-test-tags.js"
      ];
      this.optimizations.configsUpdated.push('Added taggedTestInputs for tag-based testing');
    }

    // Write optimized configuration
    fs.writeFileSync(nxConfigPath, JSON.stringify(nxConfig, null, 2));
    console.log('✅ Optimized nx.json configuration\n');
  }

  async createOptimizedScripts() {
    console.log('📝 Creating optimized test scripts...\n');

    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Create new optimized scripts
    const optimizedScripts = {
      // Affected-based core commands
      "test:affected": "nx affected --target=test --parallel=6",
      "test:affected:unit": "pnpm test:affected --grep '@unit'",
      "test:affected:integration": "pnpm test:affected --grep '@integration'",
      "test:affected:critical": "pnpm test:affected --grep '@critical'",
      
      // Tag-based test execution
      "test:by-tag": "node scripts/run-tests-by-tag.js",
      "test:unit": "pnpm test:by-tag --tags @unit",
      "test:integration": "pnpm test:by-tag --tags @integration", 
      "test:security": "pnpm test:by-tag --tags @security",
      "test:api": "pnpm test:by-tag --tags @api",
      "test:validation": "pnpm test:by-tag --tags @validation",
      "test:rbac": "pnpm test:by-tag --tags @rbac",
      
      // Optimized CI commands
      "test:ci:affected": "nx affected --target=test --parallel=6 --maxParallel=6",
      "test:ci:critical": "pnpm test:by-tag --tags @critical --parallel",
      "test:ci:smoke": "nx affected --target=test:smoke --parallel=4",
      
      // Smart development commands
      "test:dev": "nx affected --target=test --parallel=3 --watch",
      "test:dev:unit": "pnpm test:dev --grep '@unit'",
      "test:dev:changed": "vitest --changed --run",
      
      // Performance optimized commands
      "test:fast": "nx affected --target=test --parallel=6 --skip-nx-cache=false",
      "test:fast:unit": "pnpm test:fast --grep '@unit'",
      "test:fast:critical": "pnpm test:fast --grep '@critical'",
      
      // Comprehensive with affected optimization
      "test:comprehensive:affected": "nx affected --targets=typecheck,lint,test,build --parallel=6",
      "test:comprehensive:smart": "pnpm test:comprehensive:affected && pnpm test:e2e:affected",
    };

    // Add new scripts to package.json
    Object.entries(optimizedScripts).forEach(([key, value]) => {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        this.optimizations.scriptsCreated.push(key);
      }
    });

    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Created ${this.optimizations.scriptsCreated.length} optimized scripts\n`);
  }

  async updateExistingScripts() {
    console.log('🔄 Updating existing inefficient scripts...\n');

    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Scripts to optimize with parallel flags
    const scriptsToParallelize = {
      "build:affected": "nx affected --target=build --parallel=6",
      "lint:affected": "nx affected --target=lint --parallel=6", 
      "typecheck:affected": "nx affected --target=typecheck --parallel=6",
      "test:all": "nx run-many --target=test --all --parallel=6",
      "build:all": "nx run-many --target=build --all --parallel=6",
      "lint:all": "nx run-many --target=lint --all --parallel=6",
      "typecheck:all": "nx run-many --target=typecheck --all --parallel=6"
    };

    // Update existing scripts
    Object.entries(scriptsToParallelize).forEach(([key, value]) => {
      if (packageJson.scripts[key] && packageJson.scripts[key] !== value) {
        const oldValue = packageJson.scripts[key];
        packageJson.scripts[key] = value;
        this.optimizations.scriptsUpdated.push({
          script: key,
          old: oldValue,
          new: value
        });
      }
    });

    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated ${this.optimizations.scriptsUpdated.length} existing scripts\n`);
  }

  async createTagBasedScripts() {
    console.log('🏷️  Creating tag-based test runner...\n');

    const tagBasedRunner = `#!/usr/bin/env node

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
      projects: 'all'
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
      }
    }

    return options;
  }

  buildCommand() {
    let baseCommand;
    
    if (this.options.affected && this.options.projects === 'all') {
      baseCommand = 'nx affected --target=test';
    } else if (this.options.projects === 'all') {
      baseCommand = 'nx run-many --target=test --all';
    } else {
      baseCommand = \`nx run-many --target=test --projects=\${this.options.projects}\`;
    }

    // Add parallel execution
    baseCommand += \` --parallel=\${this.options.parallel}\`;

    // Add tag filtering via grep
    if (this.options.tags.length > 0) {
      const tagPattern = this.options.tags.join('.*');
      baseCommand += \` -- --grep "\${tagPattern}"\`;
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
    console.log('🧪 Tag-based Test Runner\\n');
    
    // Ensure nx daemon for performance
    ensureDaemon();

    const command = this.buildCommand();
    console.log(\`🚀 Executing: \${command}\\n\`);

    try {
      execSync(command, {
        stdio: 'inherit',
        env: process.env
      });
      console.log('\\n✅ Tests completed successfully');
    } catch (error) {
      console.log('\\n❌ Tests failed');
      process.exit(1);
    }
  }

  printHelp() {
    console.log(\`
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

Examples:
  node scripts/run-tests-by-tag.js --tags @unit
  node scripts/run-tests-by-tag.js --tags @critical,@security --parallel 6
  node scripts/run-tests-by-tag.js --tags @integration --no-affected
  node scripts/run-tests-by-tag.js --tags @unit --watch
\`);
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
`;

    fs.writeFileSync('scripts/run-tests-by-tag.js', tagBasedRunner);
    execSync('chmod +x scripts/run-tests-by-tag.js');
    this.optimizations.scriptsCreated.push('scripts/run-tests-by-tag.js');

    console.log('✅ Created tag-based test runner\n');
  }

  printResults() {
    console.log('📊 TEST EXECUTION OPTIMIZATION RESULTS');
    console.log('======================================\n');

    console.log(`📈 SUMMARY:`);
    console.log(`   Scripts created: ${this.optimizations.scriptsCreated.length}`);
    console.log(`   Scripts updated: ${this.optimizations.scriptsUpdated.length}`);
    console.log(`   Configs updated: ${this.optimizations.configsUpdated.length}`);
    console.log(`   Errors: ${this.optimizations.errors.length}\n`);

    if (this.optimizations.scriptsCreated.length > 0) {
      console.log('✨ NEW SCRIPTS CREATED:');
      this.optimizations.scriptsCreated.forEach(script => {
        console.log(`   ✅ ${script}`);
      });
      console.log();
    }

    if (this.optimizations.scriptsUpdated.length > 0) {
      console.log('🔄 SCRIPTS UPDATED:');
      this.optimizations.scriptsUpdated.forEach(update => {
        console.log(`   📝 ${update.script}`);
        console.log(`      Old: ${update.old.substring(0, 50)}...`);
        console.log(`      New: ${update.new.substring(0, 50)}...`);
        console.log();
      });
    }

    if (this.optimizations.configsUpdated.length > 0) {
      console.log('⚙️  CONFIGURATIONS UPDATED:');
      this.optimizations.configsUpdated.forEach(config => {
        console.log(`   ✅ ${config}`);
      });
      console.log();
    }

    console.log('🎯 NEW CAPABILITIES ENABLED:');
    console.log('   🏷️  Tag-based test execution with nx affected integration');
    console.log('   ⚡ Optimized parallel execution (6 processes)');
    console.log('   🎯 Smart affected detection for faster development cycles');
    console.log('   🚀 Combined tag + affected filtering for precise test runs');
    console.log('   📊 Better cache utilization with improved input detection\n');

    console.log('🚀 EXAMPLE USAGE:');
    console.log('   pnpm test:affected              # Run affected tests only');
    console.log('   pnpm test:unit                  # Run unit tests with affected detection');
    console.log('   pnpm test:critical              # Run critical tests with affected detection');
    console.log('   pnpm test:by-tag --tags @api    # Run API tests');
    console.log('   pnpm test:fast:unit             # Fast unit test execution');
    console.log('   pnpm test:comprehensive:smart   # Smart comprehensive testing\n');
  }

  async validateOptimizations() {
    console.log('🧪 Validating optimizations...\n');

    try {
      // Test the new tag-based runner
      execSync('node scripts/run-tests-by-tag.js --help', { stdio: 'pipe' });
      console.log('✅ Tag-based runner validation successful');

      // Test affected command
      execSync('npx nx affected --target=test --dry-run', { stdio: 'pipe' });
      console.log('✅ Nx affected validation successful');

      // Test parallel execution
      execSync('npx nx run-many --target=test --all --parallel=6 --dry-run', { stdio: 'pipe' });
      console.log('✅ Parallel execution validation successful');

      console.log('\n🎉 All optimizations validated successfully!\n');
    } catch (error) {
      console.log(`❌ Validation error: ${error.message}\n`);
      this.optimizations.errors.push(error.message);
    }
  }
}

// Run optimization
if (require.main === module) {
  const optimizer = new TestExecutionOptimizer();
  optimizer.optimizeTestExecution().then(() => {
    optimizer.validateOptimizations();
  }).catch(console.error);
}

module.exports = { TestExecutionOptimizer };
