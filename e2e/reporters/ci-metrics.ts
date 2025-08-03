/**
 * CI Metrics Reporter
 * Collects and reports metrics for CI/CD pipeline optimization
 */

import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface CIMetrics {
  runId: string;
  branch: string;
  commit: string;
  timestamp: string;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    flaky: number;
    skipped: number;
  };
  performance: {
    slowestTests: Array<{
      title: string;
      duration: number;
      file: string;
    }>;
    averageDuration: number;
    totalDuration: number;
  };
  resources: {
    workers: number;
    shards?: {
      current: number;
      total: number;
    };
  };
  failures: Array<{
    title: string;
    file: string;
    error: string;
    retry: number;
  }>;
  tags: {
    [tag: string]: {
      total: number;
      passed: number;
      failed: number;
      avgDuration: number;
    };
  };
}

export default class CIMetricsReporter implements Reporter {
  private metrics: CIMetrics;
  private testDurations: Array<{ title: string; duration: number; file: string }> = [];
  private tagStats: Map<string, any> = new Map();
  private outputPath: string;
  
  constructor(options: { outputPath?: string } = {}) {
    this.outputPath = options.outputPath || './tmp/playwright-results/ci-metrics.json';
    
    this.metrics = {
      runId: process.env.GITHUB_RUN_ID || process.env.CI_RUN_ID || 'local',
      branch: process.env.GITHUB_REF_NAME || process.env.CI_BRANCH || 'unknown',
      commit: process.env.GITHUB_SHA || process.env.CI_COMMIT || 'unknown',
      timestamp: new Date().toISOString(),
      duration: 0,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        flaky: 0,
        skipped: 0,
      },
      performance: {
        slowestTests: [],
        averageDuration: 0,
        totalDuration: 0,
      },
      resources: {
        workers: parseInt(process.env.WORKERS || '1'),
        shards: process.env.SHARD ? {
          current: parseInt(process.env.SHARD_CURRENT || '1'),
          total: parseInt(process.env.SHARD_TOTAL || '1'),
        } : undefined,
      },
      failures: [],
      tags: {},
    };
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    // Update summary
    this.metrics.summary.total++;
    this.metrics.summary[result.status as keyof typeof this.metrics.summary]++;
    
    // Track duration
    this.testDurations.push({
      title: test.title,
      duration: result.duration,
      file: test.location.file,
    });
    
    // Track failures
    if (result.status === 'failed') {
      this.metrics.failures.push({
        title: test.title,
        file: test.location.file,
        error: result.error?.message || 'Unknown error',
        retry: result.retry,
      });
    }
    
    // Extract and track tags
    const tags = this.extractTags(test.title);
    tags.forEach(tag => {
      const stats = this.tagStats.get(tag) || {
        total: 0,
        passed: 0,
        failed: 0,
        durations: [],
      };
      
      stats.total++;
      if (result.status === 'passed') stats.passed++;
      if (result.status === 'failed') stats.failed++;
      stats.durations.push(result.duration);
      
      this.tagStats.set(tag, stats);
    });
  }
  
  async onEnd(result: FullResult): Promise<void> {
    // Calculate performance metrics
    this.calculatePerformanceMetrics();
    
    // Process tag statistics
    this.processTagStats();
    
    // Set total duration
    this.metrics.duration = result.duration;
    
    // Write metrics
    await this.writeMetrics();
    
    // Print summary
    this.printSummary();
    
    // Send metrics to monitoring service if configured
    await this.sendToMonitoring();
  }
  
  private extractTags(title: string): string[] {
    const tagMatches = title.match(/@[\w-]+/g) || [];
    return tagMatches;
  }
  
  private calculatePerformanceMetrics(): void {
    if (this.testDurations.length === 0) return;
    
    // Sort by duration
    this.testDurations.sort((a, b) => b.duration - a.duration);
    
    // Get slowest tests
    this.metrics.performance.slowestTests = this.testDurations.slice(0, 10);
    
    // Calculate total and average
    this.metrics.performance.totalDuration = this.testDurations.reduce(
      (sum, test) => sum + test.duration, 
      0
    );
    
    this.metrics.performance.averageDuration = 
      this.metrics.performance.totalDuration / this.testDurations.length;
  }
  
  private processTagStats(): void {
    this.tagStats.forEach((stats, tag) => {
      const avgDuration = stats.durations.reduce((a: number, b: number) => a + b, 0) / stats.durations.length;
      
      this.metrics.tags[tag] = {
        total: stats.total,
        passed: stats.passed,
        failed: stats.failed,
        avgDuration: Math.round(avgDuration),
      };
    });
  }
  
  private async writeMetrics(): Promise<void> {
    // Ensure output directory exists
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write metrics
    fs.writeFileSync(this.outputPath, JSON.stringify(this.metrics, null, 2));
  }
  
  private printSummary(): void {
    console.log('\n📈 CI Metrics Summary\n');
    
    console.log(`Run ID: ${this.metrics.runId}`);
    console.log(`Branch: ${this.metrics.branch}`);
    console.log(`Duration: ${(this.metrics.duration / 1000).toFixed(2)}s`);
    
    console.log('\nTest Results:');
    console.log(`  Total: ${this.metrics.summary.total}`);
    console.log(`  Passed: ${this.metrics.summary.passed} ✅`);
    console.log(`  Failed: ${this.metrics.summary.failed} ❌`);
    console.log(`  Flaky: ${this.metrics.summary.flaky} ⚡`);
    console.log(`  Skipped: ${this.metrics.summary.skipped} ⏭️`);
    
    const passRate = this.metrics.summary.total > 0 
      ? (this.metrics.summary.passed / this.metrics.summary.total * 100).toFixed(1)
      : '0';
    console.log(`  Pass Rate: ${passRate}%`);
    
    if (this.metrics.performance.slowestTests.length > 0) {
      console.log('\n🐌 Slowest Tests:');
      this.metrics.performance.slowestTests.slice(0, 5).forEach(test => {
        console.log(`  - ${test.title} (${(test.duration / 1000).toFixed(2)}s)`);
      });
    }
    
    // Tag summary
    const tagEntries = Object.entries(this.metrics.tags);
    if (tagEntries.length > 0) {
      console.log('\n🏷️  Test Coverage by Tag:');
      tagEntries
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 5)
        .forEach(([tag, stats]) => {
          const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
          console.log(`  ${tag}: ${stats.total} tests (${passRate}% pass rate)`);
        });
    }
    
    console.log(`\nFull metrics saved to: ${this.outputPath}`);
  }
  
  private async sendToMonitoring(): Promise<void> {
    // Send metrics to monitoring service if configured
    const monitoringUrl = process.env.CI_METRICS_URL;
    if (!monitoringUrl) return;
    
    try {
      // TODO: Implement actual metrics sending
      console.log('Sending metrics to monitoring service...');
      
      // Example: Send to DataDog, New Relic, or custom monitoring
      // await fetch(monitoringUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.metrics),
      // });
    } catch (error) {
      console.error('Failed to send metrics to monitoring:', error);
    }
  }
}