#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration - use actual directory names
const SITES = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc'];

// Environment-aware parallelism
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const MAX_PARALLEL = isCI ? 3 : 8; // Conservative in CI (3), optimized locally (8)

class ParallelWarningCollector {
  constructor() {
    this.results = new Map();
    this.filteredCount = 0;
    this.loadIgnoredPatterns();
  }

  /**
   * Load ignored warning patterns from configuration
   */
  loadIgnoredPatterns() {
    this.ignoredPatterns = [];
    try {
      const configPath = path.join(__dirname, 'warnings-ignore.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.ignoredPatterns = config.ignoredPatterns.map((item) => ({
          pattern: new RegExp(item.pattern, 'i'),
          reason: item.reason,
        }));
        console.log(
          `📋 Loaded ${this.ignoredPatterns.length} ignored warning patterns`,
        );
      }
    } catch (error) {
      console.warn('⚠️  Could not load warnings-ignore.json:', error.message);
    }
  }

  /**
   * Build a site and capture warnings
   */
  buildSite(site) {
    return new Promise((resolve) => {
      const warnings = [];
      const startTime = Date.now();
      let output = '';

      console.log(`🏗️  Starting build: ${site}`);

      // Add environment variables that might be needed
      const env = {
        ...process.env,
        DOCS_ENV: process.env.DOCS_ENV || 'preview',
      };

      const buildProcess = spawn('pnpm', ['nx', 'build', site], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        env,
        cwd: process.cwd(),
      });

      // Capture stdout
      buildProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Real-time warning detection
        const lines = text.split('\n');
        lines.forEach((line) => {
          if (this.isWarning(line)) {
            warnings.push({
              site,
              line: line.trim(),
              timestamp: new Date().toISOString(),
            });
          }
        });
      });

      // Capture stderr
      buildProcess.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Check stderr for warnings too
        const lines = text.split('\n');
        lines.forEach((line) => {
          if (this.isWarning(line)) {
            warnings.push({
              site,
              line: line.trim(),
              timestamp: new Date().toISOString(),
            });
          }
        });
      });

      buildProcess.on('close', (code) => {
        const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
        const success = code === 0;

        console.log(
          `${success ? '✅' : '❌'} ${site}: ${buildTime}s, ${warnings.length} warnings`,
        );

        // If build failed, show the last part of the output for debugging
        if (!success && output) {
          const lines = output.split('\n');
          const relevantLines = lines.slice(-20).filter((line) => line.trim());
          if (relevantLines.length > 0) {
            console.log(`    Error output from ${site}:`);
            relevantLines.forEach((line) => console.log(`      ${line}`));
          }
        }

        resolve({
          site,
          success,
          buildTime,
          warnings,
          exitCode: code,
          errorOutput: !success ? output : undefined,
        });
      });
    });
  }

  /**
   * Check if a line contains a warning
   */
  isWarning(line) {
    // Check if this line should be ignored based on loaded patterns
    if (this.ignoredPatterns && this.ignoredPatterns.length > 0) {
      if (this.ignoredPatterns.some(({ pattern }) => pattern.test(line))) {
        this.filteredCount++;
        return false;
      }
    }

    // Fallback ignored patterns if config file couldn't be loaded
    const fallbackIgnorePatterns = [
      // Node.js fs.rmdir deprecation - expected and will be fixed in future Node versions
      /DeprecationWarning:.*fs\.rmdir.*recursive option is deprecated/i,
      /Use fs\.rm\(path, \{ recursive: true \}\)/i,
      // Node.js experimental features warnings
      /ExperimentalWarning:/i,
    ];

    // Check fallback patterns if config wasn't loaded
    if (!this.ignoredPatterns || this.ignoredPatterns.length === 0) {
      if (fallbackIgnorePatterns.some((pattern) => pattern.test(line))) {
        this.filteredCount++;
        return false;
      }
    }

    const warningPatterns = [
      /\[WARNING\]/i,
      /\[WARN\]/i,
      /Warning:/i,
      /⚠️/,
      /deprecated/i,
      /broken link/i,
      /not found/i,
      /cannot resolve/i,
    ];

    return warningPatterns.some((pattern) => pattern.test(line));
  }

  /**
   * Run builds in parallel with concurrency limit
   */
  async runParallel() {
    const results = [];
    const queue = [...SITES];
    const running = new Set();

    while (queue.length > 0 || running.size > 0) {
      // Start new builds up to the limit
      while (running.size < MAX_PARALLEL && queue.length > 0) {
        const site = queue.shift();
        const promise = this.buildSite(site).then((result) => {
          running.delete(promise);
          results.push(result);
          return result;
        });
        running.add(promise);
      }

      // Wait for at least one to complete
      if (running.size > 0) {
        await Promise.race(running);
      }
    }

    return results;
  }

  /**
   * Generate a simple summary
   */
  generateSummary(results) {
    const totalWarnings = results.reduce(
      (sum, r) => sum + r.warnings.length,
      0,
    );
    const failedBuilds = results.filter((r) => !r.success).length;

    let summary = '# Build Warnings Summary\n\n';
    summary += `- Total warnings: ${totalWarnings}\n`;
    summary += `- Failed builds: ${failedBuilds}\n`;
    summary += `- Timestamp: ${new Date().toISOString()}\n\n`;

    summary += '## By Site\n\n';
    results.forEach(({ site, success, warnings, buildTime }) => {
      summary += `- **${site}**: ${success ? '✅' : '❌'} ${warnings.length} warnings (${buildTime}s)\n`;
    });

    if (totalWarnings > 0) {
      summary += '\n## All Warnings\n\n';
      results.forEach(({ site, warnings }) => {
        if (warnings.length > 0) {
          summary += `### ${site}\n\n`;
          warnings.forEach((w, i) => {
            summary += `${i + 1}. ${w.line}\n`;
          });
          summary += '\n';
        }
      });
    }

    return summary;
  }

  /**
   * Main execution
   */
  async run() {
    console.log(
      `🚀 Running parallel build warning collection (${isCI ? 'CI mode' : 'Local mode'}: ${MAX_PARALLEL} parallel builds)...\n`,
    );

    // Debug: Check if nx is available
    if (isCI) {
      const { execSync } = require('child_process');
      try {
        const nxVersion = execSync('npx nx --version', {
          encoding: 'utf8',
        }).trim();
        console.log(`📦 Using Nx version: ${nxVersion}`);
        console.log(`📁 Working directory: ${process.cwd()}`);
        console.log(`🌍 DOCS_ENV: ${process.env.DOCS_ENV || 'not set'}`);
      } catch (e) {
        console.error('❌ Failed to get Nx version:', e.message);
      }
    }

    const startTime = Date.now();

    const results = await this.runParallel();

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Total time: ${totalTime}s`);

    // Generate and save report
    const summary = this.generateSummary(results);

    const reportsDir = path.join(process.cwd(), 'output', '_reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const reportPath = path.join(reportsDir, 'build-warnings-summary.md');
    fs.writeFileSync(reportPath, summary);

    console.log(`\n📄 Report saved to: ${reportPath}`);

    // Also save as JSON for processing
    const jsonPath = path.join(reportsDir, 'build-warnings.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

    // GitHub Actions summary
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    }

    // Check for failed builds
    const failedBuilds = results.filter((r) => !r.success);
    if (failedBuilds.length > 0) {
      console.log(`\n❌ ${failedBuilds.length} build(s) failed:`);
      failedBuilds.forEach(({ site }) => {
        console.log(`   - ${site}`);
      });
      process.exit(1); // Exit with error code if any builds failed
    }

    // Exit status based on warnings
    const totalWarnings = results.reduce(
      (sum, r) => sum + r.warnings.length,
      0,
    );

    // Report filtered warnings count
    if (this.filteredCount > 0) {
      console.log(
        `\n🔇 Filtered ${this.filteredCount} known/expected warnings`,
      );
    }

    if (totalWarnings > 0) {
      console.log(`\n⚠️  Found ${totalWarnings} warnings`);
    } else {
      console.log('\n✅ No warnings found!');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const collector = new ParallelWarningCollector();
  collector.run().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = ParallelWarningCollector;
