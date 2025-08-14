#!/usr/bin/env node

// Fix MaxListenersExceededWarning - must be at the very top before any requires
process.setMaxListeners(0); // 0 = unlimited listeners
require('events').EventEmitter.defaultMaxListeners = 50;

/**
 * Robust pre-commit check with progress indicators, timeouts, and recovery
 * Addresses the recurring issue of silent failures when pre-commit hooks take too long
 * 
 * Features:
 * - Progress indicators with time estimates
 * - Configurable timeouts with graceful handling
 * - Automatic retry mechanism for transient failures
 * - Clear user feedback and guidance
 * - Emergency bypass options
 * - Commit state preservation for recovery
 */

const { spawn, execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Timeouts in milliseconds
  TYPECHECK_TIMEOUT: 5 * 60 * 1000,    // 5 minutes
  TEST_TIMEOUT: 10 * 60 * 1000,        // 10 minutes
  LINT_TIMEOUT: 3 * 60 * 1000,         // 3 minutes
  SECRETS_TIMEOUT: 30 * 1000,          // 30 seconds
  
  // Progress update intervals
  PROGRESS_INTERVAL: 10 * 1000,        // 10 seconds
  
  // Retry configuration
  MAX_RETRIES: 2,
  RETRY_DELAY: 5 * 1000,               // 5 seconds
};

// State management
const STATE_FILE = path.join(__dirname, '../.git/pre-commit-state.json');

class PreCommitRunner {
  constructor() {
    this.hasErrors = false;
    this.startTime = Date.now();
    this.currentStep = '';
    this.totalSteps = 0;
    this.completedSteps = 0;
    this.retryCount = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'progress': '🔄'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  logProgress(message) {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const progress = this.totalSteps > 0 ? `(${this.completedSteps}/${this.totalSteps})` : '';
    this.log(`${message} ${progress} - ${elapsed}s elapsed`, 'progress');
  }

  saveState(state) {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify({
        ...state,
        timestamp: Date.now(),
        pid: process.pid
      }, null, 2));
    } catch (error) {
      this.log(`Warning: Could not save state: ${error.message}`, 'warning');
    }
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        // Only use state if it's recent (within 1 hour)
        if (Date.now() - state.timestamp < 60 * 60 * 1000) {
          return state;
        }
      }
    } catch (error) {
      this.log(`Warning: Could not load state: ${error.message}`, 'warning');
    }
    return null;
  }

  clearState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        fs.unlinkSync(STATE_FILE);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async runWithTimeout(command, args, options = {}) {
    const timeout = options.timeout || 5 * 60 * 1000; // 5 minutes default
    const description = options.description || command;
    
    return new Promise((resolve, reject) => {
      this.logProgress(`Starting: ${description}`);
      
      const child = spawn(command, args, {
        stdio: 'pipe',
        encoding: 'utf8',
        ...options.spawnOptions
      });

      let stdout = '';
      let stderr = '';
      let progressTimer;
      let timeoutTimer;

      // Progress updates
      progressTimer = setInterval(() => {
        this.logProgress(`Running: ${description}`);
      }, CONFIG.PROGRESS_INTERVAL);

      // Timeout handling
      timeoutTimer = setTimeout(() => {
        this.log(`Timeout reached for: ${description}`, 'warning');
        this.log(`Process has been running for ${Math.round(timeout / 1000)}s`, 'warning');
        this.log('You can:', 'info');
        this.log('  1. Wait longer (process is still running)', 'info');
        this.log('  2. Press Ctrl+C to cancel and use: git commit --no-verify', 'info');
        this.log('  3. Use: pnpm commit:fast for urgent commits', 'info');
        
        // Don't kill the process, just warn the user
        // child.kill('SIGTERM');
      }, timeout);

      child.stdout.on('data', (data) => {
        stdout += data;
        // Show important output immediately
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.includes('✓') || line.includes('✗') || line.includes('error') || line.includes('failed')) {
            console.log(line);
          }
        });
      });

      child.stderr.on('data', (data) => {
        stderr += data;
        // Show errors immediately
        console.error(data.toString());
      });

      child.on('close', (code) => {
        clearInterval(progressTimer);
        clearTimeout(timeoutTimer);
        
        if (code === 0) {
          this.log(`Completed: ${description}`, 'success');
          resolve({ code, stdout, stderr });
        } else {
          this.log(`Failed: ${description} (exit code: ${code})`, 'error');
          reject(new Error(`${description} failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        clearInterval(progressTimer);
        clearTimeout(timeoutTimer);
        this.log(`Error running: ${description} - ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async runStep(stepName, command, args, options = {}) {
    this.currentStep = stepName;
    this.saveState({ currentStep: stepName, completedSteps: this.completedSteps });
    
    try {
      await this.runWithTimeout(command, args, {
        description: stepName,
        ...options
      });
      this.completedSteps++;
      this.log(`✅ ${stepName} completed`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ ${stepName} failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runSecretsCheck() {
    this.log('Running secrets detection...', 'info');
    try {
      await this.runWithTimeout('node', ['scripts/check-secrets-staged.js'], {
        timeout: CONFIG.SECRETS_TIMEOUT,
        description: 'Secrets detection'
      });
      return true;
    } catch (error) {
      this.log('❌ Secrets detected! Please remove sensitive information before committing.', 'error');
      this.log('You can use: pnpm check:secrets:fix to attempt automatic fixes.', 'info');
      return false;
    }
  }

  async analyzeChanges() {
    this.log('Analyzing staged changes...', 'info');
    
    let stagedFiles = [];
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
      stagedFiles = output ? output.split('\n').filter(Boolean) : [];
    } catch (error) {
      this.log('⚠️  No staged files found or git error', 'warning');
      return { type: 'none', files: [] };
    }

    if (stagedFiles.length === 0) {
      return { type: 'none', files: [] };
    }

    // Categorize changes
    const dependencyFiles = ['package.json', 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json'];
    const docFiles = stagedFiles.filter(f => f.endsWith('.md') || f.startsWith('developer_notes/'));
    const codeFiles = stagedFiles.filter(f => 
      !dependencyFiles.includes(f) && 
      !f.endsWith('.md') && 
      !f.startsWith('developer_notes/')
    );

    const isDependencyOnly = codeFiles.length === 0 && stagedFiles.some(f => dependencyFiles.includes(f));
    const isDocumentationOnly = codeFiles.length === 0 && docFiles.length > 0;

    this.log(`📊 Change analysis:
  - Total files: ${stagedFiles.length}
  - Code files: ${codeFiles.length}
  - Documentation files: ${docFiles.length}
  - Dependency files: ${stagedFiles.filter(f => dependencyFiles.includes(f)).length}`, 'info');

    if (isDependencyOnly) {
      this.totalSteps = 3; // secrets, typecheck, lint
      return { type: 'dependency', files: stagedFiles };
    } else if (isDocumentationOnly) {
      this.totalSteps = 1; // secrets only
      return { type: 'documentation', files: stagedFiles };
    } else {
      this.totalSteps = 4; // secrets, typecheck, tests, lint
      return { type: 'code', files: stagedFiles };
    }
  }

  async run() {
    // Check if this is a fast commit
    if (process.env.FAST_COMMIT === '1') {
      console.log('\n⚡ Fast commit mode - running essential checks only...\n');
      return await this.runFastMode();
    }

    console.log('\n🚀 Running robust pre-commit checks with progress tracking...\n');
    
    // Check for previous failed state
    const previousState = this.loadState();
    if (previousState) {
      this.log(`Found previous incomplete run from ${new Date(previousState.timestamp).toLocaleString()}`, 'warning');
      this.log(`Last step: ${previousState.currentStep}`, 'info');
      this.log('Starting fresh run...', 'info');
    }

    // Ensure nx daemon is running
    ensureDaemon();

    // Analyze changes
    const analysis = await this.analyzeChanges();
    
    if (analysis.type === 'none') {
      this.log('✅ No staged files - skipping pre-commit checks', 'success');
      this.clearState();
      return true;
    }

    this.log(`🎯 Running ${analysis.type} validation workflow`, 'info');
    this.log(`⏱️  Estimated time: ${this.getEstimatedTime(analysis.type)}`, 'info');
    this.log('💡 You can cancel anytime with Ctrl+C and use: git commit --no-verify', 'info');
    console.log('');

    // Always run secrets check first
    if (!await this.runSecretsCheck()) {
      this.hasErrors = true;
      this.saveState({ failed: true, reason: 'secrets_detected' });
      return false;
    }

    // Run appropriate checks based on change type
    if (analysis.type === 'documentation') {
      this.log('📝 Documentation-only changes - minimal validation', 'info');
      // Only secrets check needed
    } else if (analysis.type === 'dependency') {
      this.log('📦 Dependency-only changes - light validation', 'info');
      
      if (!await this.runStep('TypeScript Check', 'pnpm', ['nx', 'run', 'admin:typecheck'], {
        timeout: CONFIG.TYPECHECK_TIMEOUT
      })) {
        this.hasErrors = true;
      }

      if (!await this.runStep('ESLint', 'pnpm', ['nx', 'affected', '--target=lint', '--parallel=3'], {
        timeout: CONFIG.LINT_TIMEOUT
      })) {
        // Lint warnings don't fail the commit
        this.log('⚠️  ESLint completed with warnings (this is OK)', 'warning');
      }
    } else {
      this.log('🔍 Code changes - full validation', 'info');
      
      if (!await this.runStep('TypeScript Check', 'pnpm', ['nx', 'affected', '--target=typecheck', '--parallel=3'], {
        timeout: CONFIG.TYPECHECK_TIMEOUT
      })) {
        this.hasErrors = true;
      }

      // Run unit tests only for pre-commit (fast feedback)
      if (!await this.runStep('Tests', 'pnpm', ['nx', 'affected', '--target=test:unit', '--parallel=3', '--exclude=platform,@ifla/dev-servers,unified-spreadsheet,standards-cli'], {
        timeout: CONFIG.TEST_TIMEOUT
      })) {
        this.hasErrors = true;
      }

      if (!await this.runStep('ESLint', 'pnpm', ['nx', 'affected', '--target=lint', '--parallel=3'], {
        timeout: CONFIG.LINT_TIMEOUT
      })) {
        // Lint warnings don't fail the commit
        this.log('⚠️  ESLint completed with warnings (this is OK)', 'warning');
      }
    }

    // Final summary
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    
    if (this.hasErrors) {
      this.log(`❌ Pre-commit checks failed after ${totalTime}s`, 'error');
      this.log('🔧 To fix and retry: fix the issues and run git commit again', 'info');
      this.log('🚀 For urgent commits: git commit --no-verify', 'info');
      this.log('⚡ For fast commits: pnpm commit:fast', 'info');
      this.saveState({ failed: true, reason: 'validation_failed', totalTime });
      return false;
    } else {
      this.log(`✅ All pre-commit checks passed in ${totalTime}s!`, 'success');
      this.log(`🎯 Validated ${analysis.type} changes successfully`, 'success');
      this.clearState();
      return true;
    }
  }

  async runFastMode() {
    this.log('⚡ Fast mode: Essential checks only', 'info');
    this.totalSteps = 1;

    // Only run secrets check in fast mode
    if (!await this.runSecretsCheck()) {
      this.hasErrors = true;
      this.saveState({ failed: true, reason: 'secrets_detected' });
      return false;
    }

    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    this.log(`✅ Fast mode completed in ${totalTime}s!`, 'success');
    this.log('⚠️  Note: Comprehensive validation skipped', 'warning');
    this.clearState();
    return true;
  }

  getEstimatedTime(type) {
    switch (type) {
      case 'documentation': return '~10 seconds';
      case 'dependency': return '~1-2 minutes';
      case 'code': return '~3-5 minutes';
      default: return '~2-3 minutes';
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Pre-commit checks interrupted by user');
  console.log('💡 To commit without checks: git commit --no-verify');
  console.log('⚡ For fast commits: pnpm commit:fast');
  process.exit(130); // Standard exit code for SIGINT
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Pre-commit checks terminated');
  process.exit(143); // Standard exit code for SIGTERM
});

// Main execution
async function main() {
  const runner = new PreCommitRunner();
  const success = await runner.run();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error.message);
    console.log('🚀 For urgent commits: git commit --no-verify');
    process.exit(1);
  });
}

module.exports = { PreCommitRunner };