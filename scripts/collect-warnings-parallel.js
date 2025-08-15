#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration - use actual directory names
const SITES = ['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc'];

// Environment-aware parallelism
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const isDistributedCI = process.env.NX_CLOUD_DISTRIBUTED_EXECUTION === 'true';
// When Nx Cloud distributed execution is active, run sequentially to avoid conflicts
const MAX_PARALLEL = isDistributedCI ? 1 : isCI ? 3 : 8; // Sequential in distributed CI, conservative in regular CI (3), optimized locally (8)

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
      const brokenLinks = [];
      const startTime = Date.now();
      let output = '';
      let currentBrokenLinkSource = null;

      console.log(`🏗️  Starting build: ${site}`);

      // Add environment variables that might be needed
      const env = {
        ...process.env,
        DOCS_ENV: process.env.DOCS_ENV || 'preview',
      };

      // If running in distributed CI mode, bypass Nx Cloud for individual builds
      // to avoid "No additional tasks detected" errors
      const buildCommand = isDistributedCI
        ? ['nx', 'build', site, '--skip-nx-cache']
        : ['nx', 'build', site];

      const buildProcess = spawn('pnpm', buildCommand, {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        env,
        cwd: process.cwd(),
      });

      // Capture stdout
      buildProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Real-time warning detection and broken link parsing
        const lines = text.split('\n');
        lines.forEach((line) => {
          // Check for broken link source page
          const brokenLinkSourceMatch = line.match(
            /Broken link on source page path = (.+?):/,
          );
          if (brokenLinkSourceMatch) {
            currentBrokenLinkSource = brokenLinkSourceMatch[1].trim();
          }

          // Check for broken link target
          const brokenLinkTargetMatch = line.match(/-> linking to (.+)/);
          if (brokenLinkTargetMatch && currentBrokenLinkSource) {
            // Strip ANSI color codes from the target link
            const targetLink = brokenLinkTargetMatch[1]
              .trim()
              .replace(/\u001b\[[0-9;]*m/g, '');
            brokenLinks.push({
              site,
              sourcePage: currentBrokenLinkSource,
              targetLink,
              timestamp: new Date().toISOString(),
            });
          }

          if (this.isWarning(line)) {
            // Strip ANSI color codes from the warning line
            const cleanLine = line.trim().replace(/\u001b\[[0-9;]*m/g, '');
            warnings.push({
              site,
              line: cleanLine,
              timestamp: new Date().toISOString(),
            });
          }
        });
      });

      // Capture stderr
      buildProcess.stderr.on('data', (data) => {
        const text = data.toString();
        output += text;

        // Check stderr for warnings and broken links too
        const lines = text.split('\n');
        lines.forEach((line) => {
          // Check for broken link source page
          const brokenLinkSourceMatch = line.match(
            /Broken link on source page path = (.+?):/,
          );
          if (brokenLinkSourceMatch) {
            currentBrokenLinkSource = brokenLinkSourceMatch[1].trim();
          }

          // Check for broken link target
          const brokenLinkTargetMatch = line.match(/-> linking to (.+)/);
          if (brokenLinkTargetMatch && currentBrokenLinkSource) {
            // Strip ANSI color codes from the target link
            const targetLink = brokenLinkTargetMatch[1]
              .trim()
              .replace(/\u001b\[[0-9;]*m/g, '');
            brokenLinks.push({
              site,
              sourcePage: currentBrokenLinkSource,
              targetLink,
              timestamp: new Date().toISOString(),
            });
          }

          if (this.isWarning(line)) {
            // Strip ANSI color codes from the warning line
            const cleanLine = line.trim().replace(/\u001b\[[0-9;]*m/g, '');
            warnings.push({
              site,
              line: cleanLine,
              timestamp: new Date().toISOString(),
            });
          }
        });
      });

      buildProcess.on('close', (code) => {
        const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
        const success = code === 0;

        const warningMsg =
          warnings.length > 0 ? `${warnings.length} warnings` : 'no warnings';
        const brokenLinkMsg =
          brokenLinks.length > 0 ? `, ${brokenLinks.length} broken links` : '';

        console.log(
          `${success ? '✅' : '❌'} ${site}: ${buildTime}s, ${warningMsg}${brokenLinkMsg}`,
        );

        // If build failed, show the last part of the output for debugging
        if (!success && output) {
          const lines = output.split('\n');

          // Check for specific Nx Cloud error
          const hasNxCloudError = output.includes(
            'No additional tasks detected',
          );
          if (hasNxCloudError) {
            console.log(
              `    ⚠️  Nx Cloud distributed execution conflict detected for ${site}`,
            );
            console.log(
              `    💡 Suggestion: Re-run with --skip-nx-cache or disable distributed execution`,
            );
          } else {
            const relevantLines = lines
              .slice(-20)
              .filter((line) => line.trim());
            if (relevantLines.length > 0) {
              console.log(`    Error output from ${site}:`);
              relevantLines.forEach((line) => console.log(`      ${line}`));
            }
          }
        }

        resolve({
          site,
          success,
          buildTime,
          warnings,
          brokenLinks,
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
    const totalBrokenLinks = results.reduce(
      (sum, r) => sum + (r.brokenLinks ? r.brokenLinks.length : 0),
      0,
    );
    const failedBuilds = results.filter((r) => !r.success).length;

    let summary = '# Build Warnings Summary\n\n';
    summary += `- Total warnings: ${totalWarnings}\n`;
    summary += `- Total broken links: ${totalBrokenLinks}\n`;
    summary += `- Failed builds: ${failedBuilds}\n`;
    summary += `- Timestamp: ${new Date().toISOString()}\n\n`;

    summary += '## By Site\n\n';
    results.forEach(({ site, success, warnings, brokenLinks, buildTime }) => {
      const brokenLinkCount = brokenLinks ? brokenLinks.length : 0;
      summary += `- **${site}**: ${success ? '✅' : '❌'} ${warnings.length} warnings, ${brokenLinkCount} broken links (${buildTime}s)\n`;
    });

    // Add broken links section if any exist
    if (totalBrokenLinks > 0) {
      summary += '\n## Broken Links Details\n\n';
      results.forEach(({ site, brokenLinks }) => {
        if (brokenLinks && brokenLinks.length > 0) {
          summary += `### ${site}\n\n`;

          // Group broken links by source page
          const linksBySource = {};
          brokenLinks.forEach((link) => {
            if (!linksBySource[link.sourcePage]) {
              linksBySource[link.sourcePage] = [];
            }
            linksBySource[link.sourcePage].push(link.targetLink);
          });

          // Display grouped broken links
          Object.entries(linksBySource).forEach(([source, targets]) => {
            summary += `**Page: ${source}**\n`;
            targets.forEach((target) => {
              summary += `  - → ${target}\n`;
            });
            summary += '\n';
          });
        }
      });
    }

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
    let modeDescription = isDistributedCI
      ? 'Distributed CI mode (sequential)'
      : isCI
        ? 'CI mode'
        : 'Local mode';
    console.log(
      `🚀 Running build warning collection (${modeDescription}: ${MAX_PARALLEL} parallel build${MAX_PARALLEL === 1 ? '' : 's'})...\n`,
    );

    // Debug: Check environment and Nx configuration
    if (isCI) {
      const { execSync } = require('child_process');
      try {
        const nxVersion = execSync('npx nx --version', {
          encoding: 'utf8',
        }).trim();
        console.log(`📦 Using Nx version: ${nxVersion}`);
        console.log(`📁 Working directory: ${process.cwd()}`);
        console.log(`🌍 DOCS_ENV: ${process.env.DOCS_ENV || 'not set'}`);

        // Show Nx Cloud configuration
        if (isDistributedCI) {
          console.log(`☁️  Nx Cloud Distributed Execution: ENABLED`);
          console.log(
            `⚠️  Running builds sequentially to avoid Nx Cloud conflicts`,
          );
          console.log(
            `📊 Agent Count: ${process.env.NX_CLOUD_DISTRIBUTED_EXECUTION_AGENT_COUNT || 'not set'}`,
          );
        }
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

    // Save broken links separately for easier processing
    const allBrokenLinks = results.flatMap((r) =>
      (r.brokenLinks || []).map((link) => ({
        ...link,
        site: r.site,
      })),
    );
    if (allBrokenLinks.length > 0) {
      const brokenLinksPath = path.join(reportsDir, 'broken-links.json');
      fs.writeFileSync(
        brokenLinksPath,
        JSON.stringify(allBrokenLinks, null, 2),
      );
      console.log(`\n🔗 Broken links saved to: ${brokenLinksPath}`);
    }

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
