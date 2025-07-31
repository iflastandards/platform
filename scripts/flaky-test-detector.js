#!/usr/bin/env node

/**
 * Task 4.2: Flaky Test Detection and Reporting
 * Analyzes test results to identify flaky tests and generate reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FlakyTestDetector {
  constructor() {
    this.testHistory = [];
    this.flakyTests = [];
    this.config = {
      historyFile: 'test-results/flaky-test-history.json',
      reportFile: 'docs/testing/flaky-test-report.md',
      minRuns: 5, // Minimum runs to consider for flaky detection
      flakyThreshold: 0.8, // Test must pass at least 80% but not 100%
      maxHistory: 1000 // Maximum test runs to keep in history
    };
  }

  async detectFlakyTests() {
    console.log('🔍 Detecting flaky tests...\n');

    // Load test history
    await this.loadTestHistory();
    
    // Analyze current test results
    await this.analyzeTestResults();
    
    // Identify flaky patterns
    await this.identifyFlakyPatterns();
    
    // Generate reports
    await this.generateReport();
    
    // Save updated history
    await this.saveTestHistory();
    
    console.log('✅ Flaky test detection complete\n');
  }

  async loadTestHistory() {
    console.log('📚 Loading test history...');
    
    if (fs.existsSync(this.config.historyFile)) {
      try {
        const data = fs.readFileSync(this.config.historyFile, 'utf8');
        this.testHistory = JSON.parse(data);
        console.log(`  Loaded ${this.testHistory.length} historical test runs`);
      } catch (error) {
        console.log('  Warning: Could not load test history, starting fresh');
        this.testHistory = [];
      }
    } else {
      console.log('  No test history found, starting fresh');
      this.testHistory = [];
    }
  }

  async analyzeTestResults() {
    console.log('🧪 Analyzing current test results...');
    
    const testResultDirs = [
      'test-results',
      'playwright-report',
      'coverage',
      'tmp/playwright-results'
    ];

    let currentRun = {
      timestamp: new Date().toISOString(),
      results: {},
      environment: process.env.NODE_ENV || 'development',
      branch: this.getCurrentBranch(),
      commit: this.getCurrentCommit()
    };

    for (const dir of testResultDirs) {
      if (fs.existsSync(dir)) {
        await this.parseTestResults(dir, currentRun);
      }
    }

    // Add current run to history
    this.testHistory.push(currentRun);
    
    // Limit history size
    if (this.testHistory.length > this.config.maxHistory) {
      this.testHistory = this.testHistory.slice(-this.config.maxHistory);
    }

    console.log(`  Analyzed test run with ${Object.keys(currentRun.results).length} tests`);
  }

  async parseTestResults(dir, currentRun) {
    // Parse JUnit XML files
    const junitFiles = this.findFiles(dir, /\.xml$/);
    for (const file of junitFiles) {
      await this.parseJUnitXML(file, currentRun);
    }

    // Parse JSON test results
    const jsonFiles = this.findFiles(dir, /test-results.*\.json$/);
    for (const file of jsonFiles) {
      await this.parseJSONResults(file, currentRun);
    }

    // Parse Playwright results
    const playwrightResults = this.findFiles(dir, /results\.json$/);
    for (const file of playwrightResults) {
      await this.parsePlaywrightResults(file, currentRun);
    }
  }

  findFiles(dir, pattern) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const walk = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (pattern.test(item)) {
          files.push(fullPath);
        }
      }
    };
    
    walk(dir);
    return files;
  }

  async parseJUnitXML(file, currentRun) {
    // Basic JUnit XML parsing for test results
    try {
      const content = fs.readFileSync(file, 'utf8');
      const testCaseRegex = /<testcase[^>]*name="([^"]*)"[^>]*(?:time="([^"]*)")?[^>]*(?:\/>|>[\s\S]*?<\/testcase>)/g;
      const failureRegex = /<failure|<error/;
      
      let match;
      while ((match = testCaseRegex.exec(content)) !== null) {
        const testName = match[1];
        const duration = parseFloat(match[2]) || 0;
        const testContent = match[0];
        const failed = failureRegex.test(testContent);
        
        if (!currentRun.results[testName]) {
          currentRun.results[testName] = [];
        }
        
        currentRun.results[testName].push({
          status: failed ? 'failed' : 'passed',
          duration,
          file: path.basename(file)
        });
      }
    } catch (error) {
      console.log(`  Warning: Could not parse ${file}`);
    }
  }

  async parseJSONResults(file, currentRun) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const results = JSON.parse(content);
      
      // Handle various JSON result formats
      if (results.tests) {
        for (const test of results.tests) {
          const testName = test.name || test.title;
          if (!currentRun.results[testName]) {
            currentRun.results[testName] = [];
          }
          
          currentRun.results[testName].push({
            status: test.status || (test.passed ? 'passed' : 'failed'),
            duration: test.duration || 0,
            file: path.basename(file)
          });
        }
      }
    } catch (error) {
      console.log(`  Warning: Could not parse ${file}`);
    }
  }

  async parsePlaywrightResults(file, currentRun) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const results = JSON.parse(content);
      
      if (results.suites) {
        for (const suite of results.suites) {
          for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
              const testName = `${spec.title} > ${test.title}`;
              
              if (!currentRun.results[testName]) {
                currentRun.results[testName] = [];
              }
              
              for (const result of test.results || []) {
                currentRun.results[testName].push({
                  status: result.status,
                  duration: result.duration || 0,
                  file: 'playwright'
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`  Warning: Could not parse Playwright results ${file}`);
    }
  }

  async identifyFlakyPatterns() {
    console.log('🎯 Identifying flaky test patterns...');
    
    const testStats = {};
    
    // Aggregate test results across all runs
    for (const run of this.testHistory) {
      for (const [testName, results] of Object.entries(run.results)) {
        if (!testStats[testName]) {
          testStats[testName] = {
            totalRuns: 0,
            passed: 0,
            failed: 0,
            durations: [],
            environments: new Set(),
            branches: new Set(),
            firstSeen: run.timestamp,
            lastSeen: run.timestamp
          };
        }
        
        const stats = testStats[testName];
        
        for (const result of results) {
          stats.totalRuns++;
          if (result.status === 'passed') {
            stats.passed++;
          } else {
            stats.failed++;
          }
          
          if (result.duration > 0) {
            stats.durations.push(result.duration);
          }
        }
        
        stats.environments.add(run.environment);
        stats.branches.add(run.branch);
        stats.lastSeen = run.timestamp;
      }
    }
    
    // Identify flaky tests
    this.flakyTests = [];
    
    for (const [testName, stats] of Object.entries(testStats)) {
      if (stats.totalRuns >= this.config.minRuns) {
        const passRate = stats.passed / stats.totalRuns;
        
        // Flaky if it sometimes passes and sometimes fails
        if (passRate > 0 && passRate < this.config.flakyThreshold) {
          const avgDuration = stats.durations.length > 0 
            ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length 
            : 0;
          
          this.flakyTests.push({
            testName,
            passRate,
            totalRuns: stats.totalRuns,
            passed: stats.passed,
            failed: stats.failed,
            avgDuration,
            environments: Array.from(stats.environments),
            branches: Array.from(stats.branches),
            firstSeen: stats.firstSeen,
            lastSeen: stats.lastSeen,
            flakinessScore: this.calculateFlakinessScore(stats)
          });
        }
      }
    }
    
    // Sort by flakiness score (most problematic first)
    this.flakyTests.sort((a, b) => b.flakinessScore - a.flakinessScore);
    
    console.log(`  Identified ${this.flakyTests.length} flaky tests`);
  }

  calculateFlakinessScore(stats) {
    const passRate = stats.passed / stats.totalRuns;
    const failureRate = 1 - passRate;
    
    // Score based on:
    // - How often it fails (higher failure rate = higher score)
    // - How many times it has run (more runs = more confidence)
    // - Recency (more recent failures = higher score)
    
    const baseScore = failureRate * 100;
    const confidenceMultiplier = Math.min(stats.totalRuns / 20, 2); // Cap at 2x
    const recencyBonus = this.isRecent(stats.lastSeen) ? 20 : 0;
    
    return baseScore * confidenceMultiplier + recencyBonus;
  }

  isRecent(timestamp) {
    const now = new Date();
    const testDate = new Date(timestamp);
    const daysDiff = (now - testDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7; // Consider tests from last 7 days as recent
  }

  async generateReport() {
    console.log('📊 Generating flaky test report...');
    
    const report = this.generateMarkdownReport();
    
    // Ensure directory exists
    const dir = path.dirname(this.config.reportFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.config.reportFile, report);
    console.log(`  Report saved to: ${this.config.reportFile}`);
    
    // Also save JSON data for programmatic use
    const jsonFile = this.config.reportFile.replace('.md', '.json');
    fs.writeFileSync(jsonFile, JSON.stringify({
      flakyTests: this.flakyTests,
      summary: {
        totalFlakyTests: this.flakyTests.length,
        totalTestRuns: this.testHistory.length,
        detectionDate: new Date().toISOString()
      }
    }, null, 2));
    
    console.log(`  Data saved to: ${jsonFile}`);
  }

  generateMarkdownReport() {
    const now = new Date().toISOString();
    
    return `# Flaky Test Detection Report

Generated: ${now}

## Summary

- **Total Flaky Tests Detected**: ${this.flakyTests.length}
- **Test Runs Analyzed**: ${this.testHistory.length}
- **Detection Threshold**: ${this.config.flakyThreshold * 100}% pass rate
- **Minimum Runs Required**: ${this.config.minRuns}

## Flaky Tests (Ordered by Severity)

${this.flakyTests.length === 0 ? '🎉 No flaky tests detected!' : this.flakyTests.map((test, index) => `
### ${index + 1}. ${test.testName}

- **Flakiness Score**: ${test.flakinessScore.toFixed(1)}/100
- **Pass Rate**: ${(test.passRate * 100).toFixed(1)}% (${test.passed}/${test.totalRuns})
- **Total Runs**: ${test.totalRuns}
- **Average Duration**: ${test.avgDuration.toFixed(2)}ms
- **Environments**: ${test.environments.join(', ')}
- **Branches**: ${test.branches.join(', ')}
- **First Seen**: ${test.firstSeen}
- **Last Seen**: ${test.lastSeen}

**Recommended Actions**:
${test.flakinessScore > 80 ? '🚨 **HIGH PRIORITY** - This test is highly unreliable and should be fixed immediately' : ''}
${test.flakinessScore > 50 ? '⚠️ **MEDIUM PRIORITY** - This test needs attention to improve reliability' : ''}
${test.flakinessScore <= 50 ? '📝 **LOW PRIORITY** - Monitor this test for patterns' : ''}

`).join('\n')}

## Recommendations

### Immediate Actions
${this.flakyTests.filter(t => t.flakinessScore > 80).length > 0 ? `
- **Fix high-priority flaky tests** (${this.flakyTests.filter(t => t.flakinessScore > 80).length} tests)
- Consider disabling or quarantining severely flaky tests temporarily
- Investigate common patterns in high-flakiness tests
` : '- No high-priority flaky tests detected'}

### Medium-term Actions
- Set up automated flaky test monitoring in CI/CD
- Implement retry mechanisms for moderately flaky tests
- Add more stable assertions and waits in E2E tests
- Review test isolation and cleanup procedures

### Long-term Strategy
- Establish flaky test SLA (e.g., <5% of tests should be flaky)
- Implement test stability metrics in team dashboards
- Regular flaky test review sessions
- Test environment stability improvements

## Detection Configuration

- **History File**: \`${this.config.historyFile}\`
- **Report File**: \`${this.config.reportFile}\`
- **Flaky Threshold**: ${this.config.flakyThreshold * 100}%
- **Minimum Runs**: ${this.config.minRuns}
- **Max History**: ${this.config.maxHistory} runs

---
*This report was generated by the Flaky Test Detector as part of Phase 4: Monitor and Report*
`;
  }

  getCurrentBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  getCurrentCommit() {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  async saveTestHistory() {
    console.log('💾 Saving test history...');
    
    // Ensure directory exists
    const dir = path.dirname(this.config.historyFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.config.historyFile, JSON.stringify(this.testHistory, null, 2));
    console.log(`  History saved with ${this.testHistory.length} runs`);
  }
}

// Run the detector
if (require.main === module) {
  const detector = new FlakyTestDetector();
  detector.detectFlakyTests().catch(console.error);
}

module.exports = FlakyTestDetector;
