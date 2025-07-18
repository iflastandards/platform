#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { NavigationGenerator } from './navigation-generator';
import { PageTemplateGenerator } from './page-template-generator';
import {
  generateSiteConfigurations,
  parseIFLAReportData,
  validateSiteConfigurations,
} from './parse-ifla-report';
import { SiteConfigurationGenerator } from './site-configuration-generator';

/**
 * Batch Site Generator
 * Orchestrates the complete site generation process for all IFLA vocabulary sites
 */

interface GenerationOptions {
  dryRun?: boolean;
  sitesToGenerate?: string[];
  skipValidation?: boolean;
  verbose?: boolean;
}

interface GenerationResult {
  success: boolean;
  sitesProcessed: string[];
  sitesSkipped: string[];
  errors: Array<{ site: string; error: string }>;
  summary: {
    totalSites: number;
    successfulSites: number;
    failedSites: number;
    skippedSites: number;
  };
}

class BatchSiteGenerator {
  private reportPath: string;
  private outputDir: string;
  private standardsDir: string;

  constructor(
    reportPath: string = 'developer_notes/ifla_standards_complete.json',
    outputDir: string = 'output/site-configurations',
    standardsDir: string = 'standards',
  ) {
    this.reportPath = path.resolve(reportPath);
    this.outputDir = path.resolve(outputDir);
    this.standardsDir = path.resolve(standardsDir);
  }

  /**
   * Generate all vocabulary sites
   */
  async generateAllSites(
    options: GenerationOptions = {},
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    console.log('🚀 Starting Batch Vocabulary Site Generator...\n');

    const result: GenerationResult = {
      success: true,
      sitesProcessed: [],
      sitesSkipped: [],
      errors: [],
      summary: {
        totalSites: 0,
        successfulSites: 0,
        failedSites: 0,
        skippedSites: 0,
      },
    };

    try {
      // Step 1: Parse IFLA report data
      console.log('📊 Step 1: Parsing IFLA report data...');
      const reportData = parseIFLAReportData(this.reportPath);

      // Step 2: Generate site configurations
      console.log('⚙️  Step 2: Generating site configurations...');
      const siteConfigs = generateSiteConfigurations(reportData);

      // Filter sites if specified
      const sitesToProcess = options.sitesToGenerate
        ? Object.fromEntries(
            Object.entries(siteConfigs).filter(([key]) =>
              options.sitesToGenerate!.includes(key),
            ),
          )
        : siteConfigs;

      result.summary.totalSites = Object.keys(sitesToProcess).length;

      // Step 3: Validate configurations (unless skipped)
      if (!options.skipValidation) {
        console.log('🔍 Step 3: Validating site configurations...');
        const isValid = validateSiteConfigurations(sitesToProcess);
        if (!isValid) {
          throw new Error('Site configuration validation failed');
        }
      } else {
        console.log('⏭️  Step 3: Skipping validation (as requested)...');
      }

      if (options.dryRun) {
        console.log('\n🔍 DRY RUN MODE - No files will be modified\n');
        this.logDryRunSummary(sitesToProcess);
        result.sitesSkipped = Object.keys(sitesToProcess);
        result.summary.skippedSites = result.sitesSkipped.length;
        return result;
      }

      // Step 4: Generate site configurations
      console.log('🔧 Step 4: Generating site configuration files...');
      const configGenerator = new SiteConfigurationGenerator(
        this.standardsDir,
        this.outputDir,
      );
      await configGenerator.generateAllSiteConfigurations(sitesToProcess);

      // Step 5: Generate page templates
      console.log('📄 Step 5: Generating page templates...');
      const templateGenerator = new PageTemplateGenerator(this.standardsDir);
      await templateGenerator.generateAllPageTemplates(sitesToProcess);

      // Step 6: Generate navigation
      console.log('🧭 Step 6: Generating navigation configurations...');
      const navigationGenerator = new NavigationGenerator(this.standardsDir);
      await navigationGenerator.generateAllNavigation(sitesToProcess);

      // Process results
      result.sitesProcessed = Object.keys(sitesToProcess);
      result.summary.successfulSites = result.sitesProcessed.length;

      // Step 7: Generate summary report
      console.log('📋 Step 7: Generating summary report...');
      await this.generateSummaryReport(sitesToProcess, result, startTime);

      console.log('\n🎉 Batch Site Generation completed successfully!');
      this.logFinalSummary(result, Date.now() - startTime);
    } catch (error) {
      console.error('\n❌ Batch site generation failed:', error);
      result.success = false;
      result.errors.push({ site: 'batch-process', error: String(error) });
    }

    return result;
  }

  /**
   * Generate individual site
   */
  async generateSite(
    siteName: string,
    options: GenerationOptions = {},
  ): Promise<boolean> {
    console.log(`🔧 Generating ${siteName} site...`);

    try {
      const result = await this.generateAllSites({
        ...options,
        sitesToGenerate: [siteName],
      });

      return result.success && result.sitesProcessed.includes(siteName);
    } catch (error) {
      console.error(`❌ Failed to generate ${siteName}:`, error);
      return false;
    }
  }

  /**
   * Validate all sites without generating
   */
  async validateAllSites(): Promise<boolean> {
    console.log('🔍 Validating all site configurations...');

    try {
      const reportData = parseIFLAReportData(this.reportPath);
      const siteConfigs = generateSiteConfigurations(reportData);
      return validateSiteConfigurations(siteConfigs);
    } catch (error) {
      console.error('❌ Validation failed:', error);
      return false;
    }
  }

  /**
   * Log dry run summary
   */
  private logDryRunSummary(siteConfigs: Record<string, any>): void {
    console.log('📋 Dry Run Summary:');
    console.log('==================');

    for (const [namespace, config] of Object.entries(siteConfigs)) {
      console.log(`\n${config.title}:`);
      console.log(`  • Namespace: ${namespace}`);
      console.log(
        `  • Element Sets: ${config.statistics.elementSets} (${config.statistics.totalElements.toLocaleString()} elements)`,
      );
      console.log(
        `  • Vocabularies: ${config.statistics.vocabularies} (${config.statistics.totalConcepts.toLocaleString()} concepts)`,
      );
      console.log(`  • Navigation: ${config.navigationStrategy}`);
      console.log(`  • Files that would be generated:`);
      console.log(`    - ${this.standardsDir}/${namespace}/site-config.json`);
      console.log(`    - ${this.standardsDir}/${namespace}/namespace.json`);
      console.log(`    - ${this.standardsDir}/${namespace}/docs/index.mdx`);
      console.log(`    - ${this.standardsDir}/${namespace}/sidebars.ts`);

      if (config.statistics.elementSets > 0) {
        console.log(
          `    - ${this.standardsDir}/${namespace}/docs/elements/index.mdx`,
        );
      }

      if (config.statistics.vocabularies > 0) {
        console.log(
          `    - ${this.standardsDir}/${namespace}/docs/vocabularies/index.mdx`,
        );
      }
    }
  }

  /**
   * Generate summary report
   */
  private async generateSummaryReport(
    siteConfigs: Record<string, any>,
    result: GenerationResult,
    startTime: number,
  ): Promise<void> {
    const report = {
      generatedAt: new Date().toISOString(),
      generationTime: Date.now() - startTime,
      summary: result.summary,
      sites: Object.entries(siteConfigs).map(([namespace, config]) => ({
        namespace,
        title: config.title,
        statistics: config.statistics,
        navigationStrategy: config.navigationStrategy,
        status: result.sitesProcessed.includes(namespace)
          ? 'success'
          : result.sitesSkipped.includes(namespace)
            ? 'skipped'
            : 'failed',
      })),
      errors: result.errors,
    };

    const reportPath = path.join(
      this.outputDir,
      'batch-generation-report.json',
    );

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`   📄 Generated batch report: ${reportPath}`);
  }

  /**
   * Log final summary
   */
  private logFinalSummary(result: GenerationResult, duration: number): void {
    console.log('\n📊 Generation Summary:');
    console.log('=====================');
    console.log(`Total Sites: ${result.summary.totalSites}`);
    console.log(`✅ Successful: ${result.summary.successfulSites}`);
    console.log(`❌ Failed: ${result.summary.failedSites}`);
    console.log(`⏭️  Skipped: ${result.summary.skippedSites}`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);

    if (result.sitesProcessed.length > 0) {
      console.log('\n✅ Successfully processed sites:');
      result.sitesProcessed.forEach((site) => console.log(`   • ${site}`));
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach((error) =>
        console.log(`   • ${error.site}: ${error.error}`),
      );
    }
  }

  /**
   * Create rollback point
   */
  async createRollbackPoint(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.outputDir, `backup-${timestamp}`);

    console.log(`💾 Creating rollback point at ${backupDir}...`);

    // This would implement backup logic in a real scenario
    // For now, just create the directory structure
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    return backupDir;
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const options: GenerationOptions = {
    dryRun: args.includes('--dry-run'),
    skipValidation: args.includes('--skip-validation'),
    verbose: args.includes('--verbose'),
  };

  // Parse site filter
  const siteIndex = args.findIndex((arg) => arg === '--sites');
  if (siteIndex !== -1 && args[siteIndex + 1]) {
    options.sitesToGenerate = args[siteIndex + 1].split(',');
  }

  const generator = new BatchSiteGenerator();

  // Handle different commands
  if (args.includes('--validate-only')) {
    const isValid = await generator.validateAllSites();
    process.exit(isValid ? 0 : 1);
  } else if (args.includes('--help')) {
    console.log(`
Batch Vocabulary Site Generator

Usage:
  npx tsx scripts/generate-vocabulary-sites.ts [options]

Options:
  --dry-run              Show what would be generated without making changes
  --sites <list>         Generate only specified sites (comma-separated)
  --skip-validation      Skip configuration validation
  --validate-only        Only validate configurations, don't generate
  --verbose              Enable verbose logging
  --help                 Show this help message

Examples:
  npx tsx scripts/generate-vocabulary-sites.ts
  npx tsx scripts/generate-vocabulary-sites.ts --dry-run
  npx tsx scripts/generate-vocabulary-sites.ts --sites lrm,frbr
  npx tsx scripts/generate-vocabulary-sites.ts --validate-only
`);
    process.exit(0);
  } else {
    const result = await generator.generateAllSites(options);
    process.exit(result.success ? 0 : 1);
  }
}

// Export for testing
export { BatchSiteGenerator, type GenerationOptions, type GenerationResult };

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
