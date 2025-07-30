/**
 * Flaky Test Detector Reporter
 * Tracks test failures and successes to identify flaky tests
 */

import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestHistory {
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  total: number;
  results: Array<{
    status: TestResult['status'];
    duration: number;
    retry: number;
    error?: string;
    timestamp: string;
  }>;
}

export default class FlakyDetectorReporter implements Reporter {
  private testHistory: Map<string, TestHistory> = new Map();
  private outputPath: string;
  private threshold: number;
  
  constructor(options: { outputPath?: string; threshold?: number } = {}) {
    this.outputPath = options.outputPath || './tmp/playwright-results/flaky-tests.json';
    this.threshold = options.threshold || 0.8; // 80% pass rate threshold
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    const testKey = this.getTestKey(test);
    const history = this.testHistory.get(testKey) || this.createEmptyHistory();
    
    // Update counters
    history.total++;
    switch (result.status) {
      case 'passed':
        history.passed++;
        break;
      case 'failed':
        history.failed++;
        break;
      case 'flaky':
        history.flaky++;
        break;
      case 'skipped':
        history.skipped++;
        break;
    }
    
    // Add result to history
    history.results.push({
      status: result.status,
      duration: result.duration,
      retry: result.retry,
      error: result.error?.message,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 10 results
    if (history.results.length > 10) {
      history.results = history.results.slice(-10);
    }
    
    this.testHistory.set(testKey, history);
  }
  
  async onEnd(result: FullResult): Promise<void> {
    const report = this.generateReport();
    
    // Ensure output directory exists
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write report
    fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2));
    
    // Print summary to console
    this.printSummary(report);
  }
  
  private getTestKey(test: TestCase): string {
    return `${test.location.file}:${test.location.line}:${test.title}`;
  }
  
  private createEmptyHistory(): TestHistory {
    return {
      passed: 0,
      failed: 0,
      flaky: 0,
      skipped: 0,
      total: 0,
      results: [],
    };
  }
  
  private generateReport(): any {
    const flakyTests: Array<{
      test: string;
      passRate: number;
      history: TestHistory;
    }> = [];
    
    const reliableTests: Array<{
      test: string;
      passRate: number;
    }> = [];
    
    const failingTests: Array<{
      test: string;
      failRate: number;
      history: TestHistory;
    }> = [];
    
    // Analyze each test
    for (const [testKey, history] of this.testHistory.entries()) {
      if (history.total === 0 || history.skipped === history.total) {
        continue;
      }
      
      const passRate = history.passed / (history.total - history.skipped);
      const failRate = history.failed / (history.total - history.skipped);
      
      if (passRate === 1) {
        reliableTests.push({ test: testKey, passRate });
      } else if (passRate === 0) {
        failingTests.push({ test: testKey, failRate, history });
      } else if (passRate < this.threshold) {
        flakyTests.push({ test: testKey, passRate, history });
      }
    }
    
    // Sort by pass rate (ascending for flaky tests)
    flakyTests.sort((a, b) => a.passRate - b.passRate);
    failingTests.sort((a, b) => b.failRate - a.failRate);
    
    return {
      summary: {
        total: this.testHistory.size,
        reliable: reliableTests.length,
        flaky: flakyTests.length,
        failing: failingTests.length,
        threshold: this.threshold,
      },
      flakyTests: flakyTests.slice(0, 20), // Top 20 flaky tests
      failingTests: failingTests.slice(0, 10), // Top 10 failing tests
      timestamp: new Date().toISOString(),
    };
  }
  
  private printSummary(report: any): void {
    console.log('\n📊 Flaky Test Detection Report\n');
    
    console.log('Summary:');
    console.log(`  Total tests analyzed: ${report.summary.total}`);
    console.log(`  Reliable tests: ${report.summary.reliable} ✅`);
    console.log(`  Flaky tests: ${report.summary.flaky} ⚡`);
    console.log(`  Failing tests: ${report.summary.failing} ❌`);
    console.log(`  Flakiness threshold: ${report.summary.threshold * 100}%`);
    
    if (report.flakyTests.length > 0) {
      console.log('\n⚡ Top Flaky Tests:');
      report.flakyTests.slice(0, 5).forEach((test: any) => {
        console.log(`  - ${test.test}`);
        console.log(`    Pass rate: ${(test.passRate * 100).toFixed(1)}%`);
        console.log(`    Results: ${test.history.passed}✅ ${test.history.failed}❌ ${test.history.flaky}⚡`);
      });
    }
    
    if (report.failingTests.length > 0) {
      console.log('\n❌ Consistently Failing Tests:');
      report.failingTests.slice(0, 5).forEach((test: any) => {
        console.log(`  - ${test.test}`);
        console.log(`    Fail rate: ${(test.failRate * 100).toFixed(1)}%`);
      });
    }
    
    console.log(`\nFull report saved to: ${this.outputPath}`);
  }
}