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
      
      const buildProcess = spawn('pnpm', ['nx', 'build', site], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      
      // Capture stdout
      buildProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Real-time warning detection
        const lines = text.split('\n');
        lines.forEach(line => {
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
        lines.forEach(line => {
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
        
        console.log(`${success ? '✅' : '❌'} ${site}: ${buildTime}s, ${warnings.length} warnings`);
        
        resolve({
          site,
          success,
          buildTime,
          warnings,
          exitCode: code,
        });
      });
    });
  }

  /**
   * Check if a line contains a warning
   */
  isWarning(line) {
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
    
    return warningPatterns.some(pattern => pattern.test(line));
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
        const promise = this.buildSite(site).then(result => {
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
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    const failedBuilds = results.filter(r => !r.success).length;
    
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
    console.log(`🚀 Running parallel build warning collection (${isCI ? 'CI mode' : 'Local mode'}: ${MAX_PARALLEL} parallel builds)...\n`);
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
    
    // Exit status based on warnings
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
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
  collector.run().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = ParallelWarningCollector;