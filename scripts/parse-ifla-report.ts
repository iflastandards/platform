#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

// TypeScript interfaces for the data structures
interface ElementSet {
  id: string;
  title: string;
  description?: string;
  elementCount: number;
  languages: string[];
  categories?: string[];
  baseIRI?: string;
  prefix: string;
  url?: string;
}

interface Vocabulary {
  id: string;
  title: string;
  description?: string;
  conceptCount: number;
  languages: string[];
  baseIRI?: string;
  prefix: string;
  category?: string;
  url?: string;
}

interface SiteConfiguration {
  namespace: string;
  title: string;
  description: string;
  statistics: {
    totalElements: number;
    totalConcepts: number;
    elementSets: number;
    vocabularies: number;
  };
  elementSets: ElementSet[];
  vocabularies: Vocabulary[];
  navigationStrategy: 'simple' | 'categorized' | 'hierarchical';
}

interface IFLAReportData {
  metadata: {
    crawlDate: string;
    source: string;
    totalNamespaces: number;
    crawlerVersion: string;
    summary: {
      totalElementSets: number;
      totalElements: number;
      totalValueVocabularies: number;
      totalConcepts: number;
    };
    failedUrls: number;
  };
  namespaces: Record<
    string,
    {
      name: string;
      description: string;
      elementSets: Record<string, any>;
      valueVocabularies: Record<string, any>;
    }
  >;
}

/**
 * Parse the IFLA Standards Complete Analysis Report JSON data
 */
function parseIFLAReportData(reportPath: string): IFLAReportData {
  console.log(`Loading IFLA report data from ${reportPath}...`);

  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report file not found: ${reportPath}`);
  }

  const reportContent = fs.readFileSync(reportPath, 'utf-8');
  const reportData: IFLAReportData = JSON.parse(reportContent);

  console.log(
    `✅ Loaded data for ${reportData.metadata.totalNamespaces} namespaces`,
  );
  console.log(
    `   Total Element Sets: ${reportData.metadata.summary.totalElementSets}`,
  );
  console.log(
    `   Total Elements: ${reportData.metadata.summary.totalElements}`,
  );
  console.log(
    `   Total Vocabularies: ${reportData.metadata.summary.totalValueVocabularies}`,
  );
  console.log(
    `   Total Concepts: ${reportData.metadata.summary.totalConcepts}`,
  );

  return reportData;
}

/**
 * Transform element set data from the report format
 */
function transformElementSet(name: string, data: any): ElementSet {
  return {
    id: data.suggestedPrefix || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    title: data.title || name,
    description: data.description,
    elementCount: data.elementCount || 0,
    languages: data.languages || ['English'],
    prefix:
      data.suggestedPrefix || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    url: data.url,
  };
}

/**
 * Transform vocabulary data from the report format
 */
function transformVocabulary(name: string, data: any): Vocabulary {
  // Determine category from the name for grouping
  let category: string | undefined;
  if (name.toLowerCase().includes('cartographic')) {
    category = 'cartographic';
  } else if (name.toLowerCase().includes('sound')) {
    category = 'sound-recordings';
  } else if (name.toLowerCase().includes('graphics')) {
    category = 'graphics';
  } else if (name.toLowerCase().includes('visual')) {
    category = 'visual-projections';
  } else if (name.toLowerCase().includes('electronic')) {
    category = 'electronic-resources';
  } else if (name.toLowerCase().includes('three-dimensional')) {
    category = '3d-materials';
  } else if (name.toLowerCase().includes('user task')) {
    category = 'user-tasks';
  } else if (name.toLowerCase().includes('content')) {
    category = 'content-form';
  }

  return {
    id: data.suggestedPrefix || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    title: data.title || name,
    description: data.description,
    conceptCount: data.conceptCount || 0,
    languages: data.languages || ['English'],
    prefix:
      data.suggestedPrefix || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    category,
    url: data.url,
  };
}

/**
 * Determine navigation strategy based on complexity
 */
function determineNavigationStrategy(
  elementSetCount: number,
  vocabularyCount: number,
): 'simple' | 'categorized' | 'hierarchical' {
  const totalItems = elementSetCount + vocabularyCount;

  if (totalItems <= 2) {
    return 'simple';
  } else if (totalItems <= 10) {
    return 'categorized';
  } else {
    return 'hierarchical';
  }
}

/**
 * Generate site configurations from the IFLA report data
 */
function generateSiteConfigurations(
  reportData: IFLAReportData,
): Record<string, SiteConfiguration> {
  const siteConfigs: Record<string, SiteConfiguration> = {};

  for (const [namespaceKey, namespaceData] of Object.entries(
    reportData.namespaces,
  )) {
    console.log(`\nProcessing ${namespaceKey} namespace...`);

    // Transform element sets
    const elementSets: ElementSet[] = [];
    let totalElements = 0;

    for (const [name, data] of Object.entries(namespaceData.elementSets)) {
      const elementSet = transformElementSet(name, data);
      elementSets.push(elementSet);
      totalElements += elementSet.elementCount;
    }

    // Transform vocabularies
    const vocabularies: Vocabulary[] = [];
    let totalConcepts = 0;

    for (const [name, data] of Object.entries(
      namespaceData.valueVocabularies,
    )) {
      const vocabulary = transformVocabulary(name, data);
      vocabularies.push(vocabulary);
      totalConcepts += vocabulary.conceptCount;
    }

    // Determine navigation strategy
    const navigationStrategy = determineNavigationStrategy(
      elementSets.length,
      vocabularies.length,
    );

    // Create site configuration
    const siteConfig: SiteConfiguration = {
      namespace: namespaceKey.toLowerCase(),
      title: `${namespaceKey} - ${namespaceData.name}`,
      description: namespaceData.description,
      statistics: {
        totalElements,
        totalConcepts,
        elementSets: elementSets.length,
        vocabularies: vocabularies.length,
      },
      elementSets,
      vocabularies,
      navigationStrategy,
    };

    siteConfigs[namespaceKey.toLowerCase()] = siteConfig;

    console.log(
      `   ✅ ${elementSets.length} element sets, ${totalElements} elements`,
    );
    console.log(
      `   ✅ ${vocabularies.length} vocabularies, ${totalConcepts} concepts`,
    );
    console.log(`   ✅ Navigation strategy: ${navigationStrategy}`);
  }

  return siteConfigs;
}

/**
 * Validate the generated site configurations
 */
function validateSiteConfigurations(
  siteConfigs: Record<string, SiteConfiguration>,
): boolean {
  let isValid = true;

  console.log('\n🔍 Validating site configurations...');

  for (const [namespace, config] of Object.entries(siteConfigs)) {
    // Check required fields
    if (!config.title || !config.description) {
      console.error(`❌ ${namespace}: Missing title or description`);
      isValid = false;
    }

    // Validate statistics
    const calculatedElements = config.elementSets.reduce(
      (sum, es) => sum + es.elementCount,
      0,
    );
    const calculatedConcepts = config.vocabularies.reduce(
      (sum, v) => sum + v.conceptCount,
      0,
    );

    if (config.statistics.totalElements !== calculatedElements) {
      console.error(
        `❌ ${namespace}: Element count mismatch (${config.statistics.totalElements} vs ${calculatedElements})`,
      );
      isValid = false;
    }

    if (config.statistics.totalConcepts !== calculatedConcepts) {
      console.error(
        `❌ ${namespace}: Concept count mismatch (${config.statistics.totalConcepts} vs ${calculatedConcepts})`,
      );
      isValid = false;
    }

    // Check element sets have valid data
    for (const elementSet of config.elementSets) {
      if (!elementSet.id || !elementSet.title || !elementSet.prefix) {
        console.error(
          `❌ ${namespace}: Invalid element set data for ${elementSet.title}`,
        );
        isValid = false;
      }
    }

    // Check vocabularies have valid data
    for (const vocabulary of config.vocabularies) {
      if (!vocabulary.id || !vocabulary.title || !vocabulary.prefix) {
        console.error(
          `❌ ${namespace}: Invalid vocabulary data for ${vocabulary.title}`,
        );
        isValid = false;
      }
    }

    if (isValid) {
      console.log(`   ✅ ${namespace}: Valid configuration`);
    }
  }

  return isValid;
}

/**
 * Save site configurations to output files
 */
function saveSiteConfigurations(
  siteConfigs: Record<string, SiteConfiguration>,
  outputDir: string,
): void {
  console.log(`\n💾 Saving site configurations to ${outputDir}...`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save individual site configurations
  for (const [namespace, config] of Object.entries(siteConfigs)) {
    const configPath = path.join(outputDir, `${namespace}-config.json`);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`   ✅ Saved ${namespace} configuration to ${configPath}`);
  }

  // Save combined configurations
  const allConfigsPath = path.join(outputDir, 'all-site-configs.json');
  fs.writeFileSync(allConfigsPath, JSON.stringify(siteConfigs, null, 2));
  console.log(`   ✅ Saved all configurations to ${allConfigsPath}`);

  // Save summary report
  const summary = {
    generatedAt: new Date().toISOString(),
    totalSites: Object.keys(siteConfigs).length,
    sites: Object.entries(siteConfigs).map(([namespace, config]) => ({
      namespace,
      title: config.title,
      elementSets: config.statistics.elementSets,
      vocabularies: config.statistics.vocabularies,
      totalElements: config.statistics.totalElements,
      totalConcepts: config.statistics.totalConcepts,
      navigationStrategy: config.navigationStrategy,
    })),
  };

  const summaryPath = path.join(outputDir, 'generation-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`   ✅ Saved generation summary to ${summaryPath}`);
}

/**
 * Main function to parse IFLA report and generate site configurations
 */
async function main() {
  try {
    console.log('🚀 Starting IFLA Report Data Parser...\n');

    // Paths
    const reportPath = path.join(
      __dirname,
      '../developer_notes/ifla_standards_complete.json',
    );
    const outputDir = path.join(__dirname, '../output/site-configurations');

    // Parse the IFLA report data
    const reportData = parseIFLAReportData(reportPath);

    // Generate site configurations
    const siteConfigs = generateSiteConfigurations(reportData);

    // Validate configurations
    const isValid = validateSiteConfigurations(siteConfigs);

    if (!isValid) {
      console.error('\n❌ Validation failed. Please check the errors above.');
      process.exit(1);
    }

    // Save configurations
    saveSiteConfigurations(siteConfigs, outputDir);

    console.log(
      '\n🎉 Successfully parsed IFLA report and generated site configurations!',
    );
    console.log(
      `\nGenerated configurations for ${Object.keys(siteConfigs).length} sites:`,
    );

    for (const [namespace, config] of Object.entries(siteConfigs)) {
      console.log(`   • ${config.title}`);
      console.log(
        `     - ${config.statistics.elementSets} element sets (${config.statistics.totalElements} elements)`,
      );
      console.log(
        `     - ${config.statistics.vocabularies} vocabularies (${config.statistics.totalConcepts} concepts)`,
      );
      console.log(`     - Navigation: ${config.navigationStrategy}`);
    }
  } catch (error) {
    console.error('\n❌ Error parsing IFLA report:', error);
    process.exit(1);
  }
}

// Export functions for testing
export {
  determineNavigationStrategy,
  generateSiteConfigurations,
  parseIFLAReportData,
  transformElementSet,
  transformVocabulary,
  validateSiteConfigurations,
  type ElementSet,
  type IFLAReportData,
  type SiteConfiguration,
  type Vocabulary,
};

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}
