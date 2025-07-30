/**
 * Test Categorizer - Analyzes and categorizes tests based on their tags
 * Useful for reporting and test organization
 */

import { TestTags } from './test-tags';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface TestInfo {
  file: string;
  title: string;
  tags: string[];
  category: 'smoke' | 'integration' | 'e2e' | 'uncategorized';
  priority?: 'critical' | 'high' | 'normal' | 'low';
  features: string[];
  environment?: string;
}

interface TestReport {
  total: number;
  byCategory: Record<string, number>;
  byFeature: Record<string, number>;
  byPriority: Record<string, number>;
  uncategorized: TestInfo[];
  criticalTests: TestInfo[];
  flakyTests: TestInfo[];
}

/**
 * Extract test information from a test file
 */
export async function extractTestsFromFile(filePath: string): Promise<TestInfo[]> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const tests: TestInfo[] = [];
  
  // Match test declarations with tags
  const testRegex = /(?:test|it)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = testRegex.exec(content)) !== null) {
    const title = match[1];
    const tags = extractTagsFromTitle(title);
    
    tests.push({
      file: filePath,
      title: title,
      tags: tags,
      category: categorizeTest(tags),
      priority: getPriority(tags),
      features: getFeatures(tags),
      environment: getEnvironment(tags),
    });
  }
  
  return tests;
}

/**
 * Extract tags from test title
 */
function extractTagsFromTitle(title: string): string[] {
  const tagMatches = title.match(/@[\w-]+/g) || [];
  return tagMatches;
}

/**
 * Categorize test based on tags
 */
function categorizeTest(tags: string[]): 'smoke' | 'integration' | 'e2e' | 'uncategorized' {
  if (tags.includes(TestTags.SMOKE)) return 'smoke';
  if (tags.includes(TestTags.INTEGRATION)) return 'integration';
  if (tags.includes(TestTags.E2E)) return 'e2e';
  return 'uncategorized';
}

/**
 * Get priority from tags
 */
function getPriority(tags: string[]): 'critical' | 'high' | 'normal' | 'low' | undefined {
  if (tags.includes(TestTags.CRITICAL)) return 'critical';
  if (tags.includes(TestTags.HIGH_PRIORITY)) return 'high';
  if (tags.includes(TestTags.LOW_PRIORITY)) return 'low';
  return 'normal';
}

/**
 * Extract feature areas from tags
 */
function getFeatures(tags: string[]): string[] {
  const featureTags = [
    TestTags.AUTH,
    TestTags.RBAC,
    TestTags.API,
    TestTags.UI,
    TestTags.DASHBOARD,
    TestTags.ADMIN,
    TestTags.DOCS,
    TestTags.NAVIGATION,
    TestTags.SEARCH,
    TestTags.VOCABULARY,
  ];
  
  return tags.filter(tag => featureTags.includes(tag as any));
}

/**
 * Get environment restrictions from tags
 */
function getEnvironment(tags: string[]): string | undefined {
  if (tags.includes(TestTags.LOCAL_ONLY)) return 'local';
  if (tags.includes(TestTags.CI_ONLY)) return 'ci';
  if (tags.includes(TestTags.PREVIEW_ONLY)) return 'preview';
  if (tags.includes(TestTags.PRODUCTION_ONLY)) return 'production';
  return undefined;
}

/**
 * Generate a test report for all tests in a directory
 */
export async function generateTestReport(testDir: string = './e2e'): Promise<TestReport> {
  const testFiles = glob.sync(path.join(testDir, '**/*.{spec,test}.{ts,js}'));
  const allTests: TestInfo[] = [];
  
  for (const file of testFiles) {
    const tests = await extractTestsFromFile(file);
    allTests.push(...tests);
  }
  
  // Generate report
  const report: TestReport = {
    total: allTests.length,
    byCategory: {
      smoke: 0,
      integration: 0,
      e2e: 0,
      uncategorized: 0,
    },
    byFeature: {},
    byPriority: {
      critical: 0,
      high: 0,
      normal: 0,
      low: 0,
    },
    uncategorized: [],
    criticalTests: [],
    flakyTests: [],
  };
  
  // Process each test
  for (const test of allTests) {
    // Count by category
    report.byCategory[test.category]++;
    
    // Count by feature
    for (const feature of test.features) {
      report.byFeature[feature] = (report.byFeature[feature] || 0) + 1;
    }
    
    // Count by priority
    if (test.priority) {
      report.byPriority[test.priority]++;
    }
    
    // Collect special tests
    if (test.category === 'uncategorized') {
      report.uncategorized.push(test);
    }
    
    if (test.priority === 'critical') {
      report.criticalTests.push(test);
    }
    
    if (test.tags.includes(TestTags.FLAKY)) {
      report.flakyTests.push(test);
    }
  }
  
  return report;
}

/**
 * Print a formatted test report
 */
export function printTestReport(report: TestReport): void {
  console.log('\n📊 Test Report\n');
  console.log(`Total Tests: ${report.total}`);
  
  console.log('\nBy Category:');
  Object.entries(report.byCategory).forEach(([category, count]) => {
    const percentage = ((count / report.total) * 100).toFixed(1);
    console.log(`  ${category}: ${count} (${percentage}%)`);
  });
  
  console.log('\nBy Priority:');
  Object.entries(report.byPriority).forEach(([priority, count]) => {
    if (count > 0) {
      const percentage = ((count / report.total) * 100).toFixed(1);
      console.log(`  ${priority}: ${count} (${percentage}%)`);
    }
  });
  
  console.log('\nBy Feature:');
  Object.entries(report.byFeature)
    .sort(([, a], [, b]) => b - a)
    .forEach(([feature, count]) => {
      console.log(`  ${feature}: ${count}`);
    });
  
  if (report.uncategorized.length > 0) {
    console.log(`\n⚠️  Uncategorized Tests: ${report.uncategorized.length}`);
    report.uncategorized.forEach(test => {
      console.log(`  - ${test.file}: ${test.title}`);
    });
  }
  
  if (report.criticalTests.length > 0) {
    console.log(`\n🚨 Critical Tests: ${report.criticalTests.length}`);
  }
  
  if (report.flakyTests.length > 0) {
    console.log(`\n⚡ Flaky Tests: ${report.flakyTests.length}`);
    report.flakyTests.forEach(test => {
      console.log(`  - ${test.file}: ${test.title}`);
    });
  }
}

/**
 * Generate a JSON report file
 */
export async function generateJSONReport(outputPath: string = './test-report.json'): Promise<void> {
  const report = await generateTestReport();
  await fs.promises.writeFile(outputPath, JSON.stringify(report, null, 2));
  console.log(`Test report generated: ${outputPath}`);
}

/**
 * CLI interface
 */
if (require.main === module) {
  const command = process.argv[2];
  
  if (!command || command === '--help') {
    console.log(`
Test Categorizer - Analyze and categorize Playwright tests

Usage: test-categorizer [command] [options]

Commands:
  report       Generate and print a test report
  json         Generate a JSON report file
  validate     Check for uncategorized or improperly tagged tests

Options:
  --dir        Test directory (default: ./e2e)
  --output     Output file for JSON report (default: ./test-report.json)

Examples:
  test-categorizer report
  test-categorizer json --output ./reports/test-analysis.json
  test-categorizer validate --dir ./e2e
    `);
    process.exit(0);
  }
  
  const testDir = process.argv.includes('--dir') 
    ? process.argv[process.argv.indexOf('--dir') + 1] 
    : './e2e';
  
  switch (command) {
    case 'report':
      generateTestReport(testDir).then(report => {
        printTestReport(report);
      });
      break;
      
    case 'json':
      const outputPath = process.argv.includes('--output')
        ? process.argv[process.argv.indexOf('--output') + 1]
        : './test-report.json';
      generateJSONReport(outputPath);
      break;
      
    case 'validate':
      generateTestReport(testDir).then(report => {
        if (report.uncategorized.length > 0) {
          console.error(`❌ Found ${report.uncategorized.length} uncategorized tests`);
          process.exit(1);
        } else {
          console.log('✅ All tests are properly categorized');
        }
      });
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}