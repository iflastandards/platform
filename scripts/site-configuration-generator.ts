#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { ElementSet, SiteConfiguration, Vocabulary } from './parse-ifla-report';

/**
 * Site Configuration Generator
 * Generates site-config.json and namespace.json files from parsed IFLA data
 */

interface ExistingSiteConfig {
  namespace?: string;
  namespaceTitle?: string;
  elementSets?: any[];
  vocabularies?: any[];
  features?: Record<string, any>;
  [key: string]: any;
}

interface NamespaceMetadata {
  id: string;
  label: Record<string, string>;
  description: Record<string, string>;
  version: string;
  created: string;
  modified: string;
  elementSets?: Record<string, any>;
  vocabularies?: Record<string, any>;
}

class SiteConfigurationGenerator {
  private standardsDir: string;
  private outputDir: string;

  constructor(
    standardsDir: string = 'standards',
    outputDir: string = 'output/site-configurations',
  ) {
    this.standardsDir = standardsDir;
    this.outputDir = outputDir;
  }

  /**
   * Generate site configurations for all sites
   */
  async generateAllSiteConfigurations(
    siteConfigs: Record<string, SiteConfiguration>,
  ): Promise<void> {
    console.log('🔧 Starting Site Configuration Generator...\n');

    for (const [namespace, config] of Object.entries(siteConfigs)) {
      console.log(`Processing ${namespace} site configuration...`);

      try {
        await this.generateSiteConfiguration(namespace, config);
        console.log(`✅ Generated ${namespace} site configuration`);
      } catch (error) {
        console.error(
          `❌ Failed to generate ${namespace} configuration:`,
          error,
        );
      }
    }

    console.log('\n🎉 Site Configuration Generator completed!');
  }

  /**
   * Generate configuration for a single site
   */
  async generateSiteConfiguration(
    namespace: string,
    config: SiteConfiguration,
  ): Promise<void> {
    const sitePath = path.join(this.standardsDir, namespace);

    // Ensure site directory exists
    if (!fs.existsSync(sitePath)) {
      fs.mkdirSync(sitePath, { recursive: true });
      console.log(`   📁 Created directory: ${sitePath}`);
    }

    // Generate site-config.json
    await this.generateSiteConfigFile(sitePath, config);

    // Generate namespace.json
    await this.generateNamespaceFile(sitePath, config);
  }

  /**
   * Generate site-config.json file
   */
  private async generateSiteConfigFile(
    sitePath: string,
    config: SiteConfiguration,
  ): Promise<void> {
    const configPath = path.join(sitePath, 'site-config.json');

    // Load existing config if it exists
    let existingConfig: ExistingSiteConfig = {};
    if (fs.existsSync(configPath)) {
      try {
        const existingContent = fs.readFileSync(configPath, 'utf-8');
        existingConfig = JSON.parse(existingContent);
        console.log(`   📄 Loaded existing site-config.json`);
      } catch (error) {
        console.warn(
          `   ⚠️  Could not parse existing site-config.json, creating new one`,
        );
      }
    }

    // Generate new site config
    const siteConfig = this.createSiteConfig(config, existingConfig);

    // Write to file
    fs.writeFileSync(configPath, JSON.stringify(siteConfig, null, 2));
    console.log(`   💾 Updated site-config.json`);
  }

  /**
   * Generate namespace.json file
   */
  private async generateNamespaceFile(
    sitePath: string,
    config: SiteConfiguration,
  ): Promise<void> {
    const namespacePath = path.join(sitePath, 'namespace.json');

    // Load existing namespace if it exists
    let existingNamespace: NamespaceMetadata | null = null;
    if (fs.existsSync(namespacePath)) {
      try {
        const existingContent = fs.readFileSync(namespacePath, 'utf-8');
        existingNamespace = JSON.parse(existingContent);
        console.log(`   📄 Loaded existing namespace.json`);
      } catch (error) {
        console.warn(
          `   ⚠️  Could not parse existing namespace.json, creating new one`,
        );
      }
    }

    // Generate new namespace metadata
    const namespaceMetadata = this.createNamespaceMetadata(
      config,
      existingNamespace,
    );

    // Write to file
    fs.writeFileSync(namespacePath, JSON.stringify(namespaceMetadata, null, 2));
    console.log(`   💾 Updated namespace.json`);
  }

  /**
   * Create site configuration object
   */
  private createSiteConfig(
    config: SiteConfiguration,
    existing: ExistingSiteConfig,
  ): any {
    const navigationStrategy = config.navigationStrategy;

    return {
      // Core namespace info
      namespace: config.namespace,
      namespaceTitle: config.title,
      namespaceDescription: config.description,

      // Statistics
      statistics: config.statistics,

      // Element sets
      elementSets: config.elementSets.map((es) =>
        this.transformElementSetForSiteConfig(es),
      ),

      // Vocabularies
      vocabularies: config.vocabularies.map((v) =>
        this.transformVocabularyForSiteConfig(v),
      ),

      // Features based on navigation strategy and content
      features: {
        enableMultipleElementSets: config.elementSets.length > 1,
        enableVocabularyCategories: this.hasVocabularyCategories(
          config.vocabularies,
        ),
        enableHierarchicalNavigation: navigationStrategy === 'hierarchical',
        enableSearch:
          config.statistics.totalElements + config.statistics.totalConcepts >
          50,
        enableCrossSetBrowsing: config.elementSets.length > 3,
        enableLanguageSwitching: this.hasMultipleLanguages(config),
        ...existing.features, // Preserve existing features
      },

      // Navigation strategy
      navigationStrategy,

      // Preserve any existing custom configuration
      ...this.preserveCustomConfig(existing),
    };
  }

  /**
   * Create namespace metadata object
   */
  private createNamespaceMetadata(
    config: SiteConfiguration,
    existing: NamespaceMetadata | null,
  ): NamespaceMetadata {
    const now = new Date().toISOString();

    return {
      id: config.namespace,
      label: {
        en: config.title,
        ...(existing?.label || {}),
      },
      description: {
        en: config.description,
        ...(existing?.description || {}),
      },
      version: existing?.version || '1.0.0',
      created: existing?.created || now,
      modified: now,

      // Element sets metadata
      elementSets:
        config.elementSets.length > 0
          ? Object.fromEntries(
              config.elementSets.map((es) => [
                es.id,
                {
                  title: es.title,
                  description: es.description,
                  elementCount: es.elementCount,
                  languages: es.languages,
                  prefix: es.prefix,
                  url: es.url,
                },
              ]),
            )
          : undefined,

      // Vocabularies metadata
      vocabularies:
        config.vocabularies.length > 0
          ? Object.fromEntries(
              config.vocabularies.map((v) => [
                v.id,
                {
                  title: v.title,
                  description: v.description,
                  conceptCount: v.conceptCount,
                  languages: v.languages,
                  prefix: v.prefix,
                  category: v.category,
                  url: v.url,
                },
              ]),
            )
          : undefined,
    };
  }

  /**
   * Transform element set for site config format
   */
  private transformElementSetForSiteConfig(elementSet: ElementSet): any {
    return {
      id: elementSet.id,
      title: elementSet.title,
      description: elementSet.description,
      elementCount: elementSet.elementCount,
      languages: elementSet.languages,
      prefix: elementSet.prefix,
      url: elementSet.url,
      categories: elementSet.categories,
    };
  }

  /**
   * Transform vocabulary for site config format
   */
  private transformVocabularyForSiteConfig(vocabulary: Vocabulary): any {
    return {
      id: vocabulary.id,
      title: vocabulary.title,
      description: vocabulary.description,
      conceptCount: vocabulary.conceptCount,
      languages: vocabulary.languages,
      prefix: vocabulary.prefix,
      category: vocabulary.category,
      url: vocabulary.url,
    };
  }

  /**
   * Check if vocabularies have categories for grouping
   */
  private hasVocabularyCategories(vocabularies: Vocabulary[]): boolean {
    return vocabularies.some((v) => v.category !== undefined);
  }

  /**
   * Check if the site has multiple languages
   */
  private hasMultipleLanguages(config: SiteConfiguration): boolean {
    const allLanguages = new Set<string>();

    config.elementSets.forEach((es) => {
      es.languages.forEach((lang) => allLanguages.add(lang));
    });

    config.vocabularies.forEach((v) => {
      v.languages.forEach((lang) => allLanguages.add(lang));
    });

    return allLanguages.size > 1;
  }

  /**
   * Preserve custom configuration that shouldn't be overwritten
   */
  private preserveCustomConfig(existing: ExistingSiteConfig): any {
    const customFields: any = {};

    // List of fields to preserve from existing config
    const fieldsToPreserve = [
      'customization',
      'theme',
      'plugins',
      'deployment',
      'analytics',
      'seo',
    ];

    fieldsToPreserve.forEach((field) => {
      if (existing[field]) {
        customFields[field] = existing[field];
      }
    });

    return customFields;
  }

  /**
   * Validate generated configuration
   */
  validateConfiguration(config: any): boolean {
    const required = [
      'namespace',
      'namespaceTitle',
      'statistics',
      'navigationStrategy',
    ];

    for (const field of required) {
      if (!config[field]) {
        console.error(`❌ Missing required field: ${field}`);
        return false;
      }
    }

    // Validate statistics match actual counts
    const actualElementSets = config.elementSets?.length || 0;
    const actualVocabularies = config.vocabularies?.length || 0;
    const actualElements =
      config.elementSets?.reduce(
        (sum: number, es: any) => sum + (es.elementCount || 0),
        0,
      ) || 0;
    const actualConcepts =
      config.vocabularies?.reduce(
        (sum: number, v: any) => sum + (v.conceptCount || 0),
        0,
      ) || 0;

    if (
      config.statistics.elementSets !== actualElementSets ||
      config.statistics.vocabularies !== actualVocabularies ||
      config.statistics.totalElements !== actualElements ||
      config.statistics.totalConcepts !== actualConcepts
    ) {
      console.error(`❌ Statistics mismatch in configuration`);
      return false;
    }

    return true;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Load site configurations from parser output
    const configsPath = path.join(
      __dirname,
      '../output/site-configurations/all-site-configs.json',
    );

    if (!fs.existsSync(configsPath)) {
      throw new Error(
        `Site configurations not found at ${configsPath}. Please run parse-ifla-report.ts first.`,
      );
    }

    const siteConfigs: Record<string, SiteConfiguration> = JSON.parse(
      fs.readFileSync(configsPath, 'utf-8'),
    );

    // Generate site configurations
    const generator = new SiteConfigurationGenerator();
    await generator.generateAllSiteConfigurations(siteConfigs);
  } catch (error) {
    console.error('❌ Error generating site configurations:', error);
    process.exit(1);
  }
}

// Export for testing
export { SiteConfigurationGenerator };

// Run if called directly
if (require.main === module) {
  main();
}
