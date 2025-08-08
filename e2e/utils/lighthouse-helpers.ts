import { Page } from '@playwright/test';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

/**
 * Lighthouse accessibility audit utilities
 * Provides comprehensive accessibility auditing using Google Lighthouse
 */

export interface LighthouseAccessibilityOptions {
  /** Minimum accessibility score (0-100) */
  minScore?: number;
  /** Categories to audit */
  categories?: string[];
  /** Device type for audit */
  device?: 'mobile' | 'desktop';
  /** Custom Lighthouse config */
  config?: any;
}

export interface LighthouseViolation {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  details?: any;
}

export interface LighthouseAccessibilityResult {
  score: number;
  violations: LighthouseViolation[];
  url: string;
  timestamp: string;
  device: string;
}

/**
 * Run Lighthouse accessibility audit
 */
export async function runLighthouseAccessibilityAudit(
  url: string,
  options: LighthouseAccessibilityOptions = {}
): Promise<LighthouseAccessibilityResult> {
  const {
    minScore = 90,
    categories = ['accessibility'],
    device = 'desktop',
    config
  } = options;

  // Launch Chrome
  const chrome = await launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  });

  try {
    // Configure Lighthouse options
    const lighthouseOptions = {
      logLevel: 'info' as const,
      output: 'json' as const,
      onlyCategories: categories,
      port: chrome.port,
      ...config
    };

    // Configure for mobile or desktop
    const lighthouseConfig = device === 'mobile' ? {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'mobile' as const,
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        },
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2
        }
      }
    } : undefined;

    // Run Lighthouse audit
    const runnerResult = await lighthouse(url, lighthouseOptions, lighthouseConfig);
    
    if (!runnerResult || !runnerResult.lhr) {
      throw new Error('Lighthouse audit failed to produce results');
    }

    const { lhr } = runnerResult;
    const accessibilityCategory = lhr.categories.accessibility;
    
    if (!accessibilityCategory) {
      throw new Error('Accessibility category not found in Lighthouse results');
    }

    // Extract accessibility violations
    const violations: LighthouseViolation[] = [];
    
    for (const auditRef of accessibilityCategory.auditRefs) {
      const audit = lhr.audits[auditRef.id];
      
      if (audit && (audit.score === null || audit.score < 1)) {
        violations.push({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          scoreDisplayMode: audit.scoreDisplayMode,
          details: audit.details
        });
      }
    }

    const result: LighthouseAccessibilityResult = {
      score: Math.round((accessibilityCategory.score || 0) * 100),
      violations,
      url,
      timestamp: new Date().toISOString(),
      device
    };

    // Check if score meets minimum requirement
    if (result.score < minScore) {
      throw new Error(
        `Accessibility score ${result.score} is below minimum required score of ${minScore}. ` +
        `Found ${violations.length} violations.`
      );
    }

    return result;

  } finally {
    await chrome.kill();
  }
}

/**
 * Run Lighthouse accessibility audit on multiple URLs
 */
export async function runLighthouseAccessibilityAuditBatch(
  urls: string[],
  options: LighthouseAccessibilityOptions = {}
): Promise<LighthouseAccessibilityResult[]> {
  const results: LighthouseAccessibilityResult[] = [];
  
  for (const url of urls) {
    try {
      const result = await runLighthouseAccessibilityAudit(url, options);
      results.push(result);
    } catch (error) {
      console.error(`Lighthouse audit failed for ${url}:`, error);
      // Continue with other URLs
    }
  }
  
  return results;
}

/**
 * Generate Lighthouse accessibility report
 */
export async function generateLighthouseAccessibilityReport(
  results: LighthouseAccessibilityResult[]
): Promise<string> {
  let report = '# Lighthouse Accessibility Audit Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Summary
  const totalUrls = results.length;
  const passedUrls = results.filter(r => r.violations.length === 0).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalUrls;
  
  report += '## Summary\n\n';
  report += `- **Total URLs tested**: ${totalUrls}\n`;
  report += `- **URLs with no violations**: ${passedUrls}\n`;
  report += `- **Average accessibility score**: ${Math.round(averageScore)}/100\n\n`;
  
  // Individual results
  report += '## Individual Results\n\n';
  
  for (const result of results) {
    report += `### ${result.url}\n\n`;
    report += `- **Score**: ${result.score}/100\n`;
    report += `- **Device**: ${result.device}\n`;
    report += `- **Violations**: ${result.violations.length}\n\n`;
    
    if (result.violations.length > 0) {
      report += '#### Violations:\n\n';
      
      for (const violation of result.violations) {
        report += `- **${violation.title}** (${violation.id})\n`;
        report += `  - ${violation.description}\n`;
        if (violation.score !== null) {
          report += `  - Score: ${Math.round(violation.score * 100)}/100\n`;
        }
        report += '\n';
      }
    }
    
    report += '---\n\n';
  }
  
  return report;
}

/**
 * Playwright integration for Lighthouse accessibility testing
 */
export async function runLighthouseAccessibilityFromPlaywright(
  page: Page,
  options: LighthouseAccessibilityOptions = {}
): Promise<LighthouseAccessibilityResult> {
  // Get the current page URL
  const url = page.url();
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Run Lighthouse audit
  return await runLighthouseAccessibilityAudit(url, options);
}

/**
 * Compare accessibility scores between different versions/environments
 */
export async function compareAccessibilityScores(
  baselineResults: LighthouseAccessibilityResult[],
  currentResults: LighthouseAccessibilityResult[]
): Promise<{
  improved: string[];
  degraded: string[];
  unchanged: string[];
  summary: {
    averageBaselineScore: number;
    averageCurrentScore: number;
    scoreDifference: number;
  };
}> {
  const improved: string[] = [];
  const degraded: string[] = [];
  const unchanged: string[] = [];
  
  // Create maps for easy lookup
  const baselineMap = new Map(baselineResults.map(r => [r.url, r.score]));
  const currentMap = new Map(currentResults.map(r => [r.url, r.score]));
  
  // Compare scores
  for (const [url, currentScore] of currentMap) {
    const baselineScore = baselineMap.get(url);
    
    if (baselineScore !== undefined) {
      const difference = currentScore - baselineScore;
      
      if (difference > 2) { // Improved by more than 2 points
        improved.push(`${url}: ${baselineScore} → ${currentScore} (+${difference})`);
      } else if (difference < -2) { // Degraded by more than 2 points
        degraded.push(`${url}: ${baselineScore} → ${currentScore} (${difference})`);
      } else {
        unchanged.push(`${url}: ${currentScore} (±${Math.abs(difference)})`);
      }
    }
  }
  
  // Calculate summary statistics
  const averageBaselineScore = baselineResults.reduce((sum, r) => sum + r.score, 0) / baselineResults.length;
  const averageCurrentScore = currentResults.reduce((sum, r) => sum + r.score, 0) / currentResults.length;
  const scoreDifference = averageCurrentScore - averageBaselineScore;
  
  return {
    improved,
    degraded,
    unchanged,
    summary: {
      averageBaselineScore: Math.round(averageBaselineScore),
      averageCurrentScore: Math.round(averageCurrentScore),
      scoreDifference: Math.round(scoreDifference * 100) / 100
    }
  };
}