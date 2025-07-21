#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { ElementSet, SiteConfiguration, Vocabulary } from './parse-ifla-report';

/**
 * Page Template Generator
 * Generates MDX page templates from site configurations
 */

interface PageTemplate {
  path: string;
  content: string;
}

class PageTemplateGenerator {
  private standardsDir: string;

  constructor(standardsDir: string = 'standards') {
    this.standardsDir = standardsDir;
  }

  /**
   * Generate page templates for all sites
   */
  async generateAllPageTemplates(
    siteConfigs: Record<string, SiteConfiguration>,
  ): Promise<void> {
    console.log('📄 Starting Page Template Generator...\n');

    for (const [namespace, config] of Object.entries(siteConfigs)) {
      console.log(`Generating page templates for ${namespace}...`);

      try {
        await this.generateSitePageTemplates(namespace, config);
        console.log(`✅ Generated ${namespace} page templates`);
      } catch (error) {
        console.error(`❌ Failed to generate ${namespace} templates:`, error);
      }
    }

    console.log('\n🎉 Page Template Generator completed!');
  }

  /**
   * Generate page templates for a single site
   */
  async generateSitePageTemplates(
    namespace: string,
    config: SiteConfiguration,
  ): Promise<void> {
    const sitePath = path.join(this.standardsDir, namespace);
    const docsPath = path.join(sitePath, 'docs');

    // Ensure docs directory exists
    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, { recursive: true });
    }

    // Generate templates based on site content
    const templates: PageTemplate[] = [];

    // 1. Landing page (always generated)
    templates.push(this.generateLandingPage(config));

    // 2. Element sets index page (if site has element sets)
    if (config.elementSets.length > 0) {
      templates.push(this.generateElementSetsIndexPage(config));

      // Generate individual element set pages
      templates.push(...this.generateIndividualElementSetPages(config));
    }

    // 3. Vocabularies index page (if site has vocabularies)
    if (config.vocabularies.length > 0) {
      templates.push(this.generateVocabulariesIndexPage(config));

      // Generate individual vocabulary pages
      templates.push(...this.generateIndividualVocabularyPages(config));
    }

    // 4. Documentation pages (always generated)
    templates.push(...this.generateDocumentationPages(config));

    // 5. Tools & Resources pages (for hierarchical navigation)
    if (config.navigationStrategy === 'hierarchical') {
      templates.push(...this.generateToolsPages(config));
    }

    // Write all templates
    for (const template of templates) {
      const fullPath = path.join(docsPath, template.path);
      const dir = path.dirname(fullPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Skip if file already exists to preserve existing content
      if (fs.existsSync(fullPath)) {
        console.log(`   ⏭️  Skipping existing file ${template.path}`);
        continue;
      }

      fs.writeFileSync(fullPath, template.content);
      console.log(`   📝 Generated ${template.path}`);
    }
  }

  /**
   * Get the base landing page template as a string to avoid JSX parsing issues
   */
  private getLandingPageBaseTemplate(config: SiteConfiguration): string {
    const templateString = [
      '---',
      'sidebar_position: 1',
      `title: ${config.title}`,
      'sidebar_label: Overview',
      `description: ${config.description}`,
      'hide_table_of_contents: true',
      '---',
      '',
      'import { NamespaceHub } from \'@ifla/theme/components/NamespaceHub\';',
      'import { ElementSetCard } from \'@ifla/theme/components/ElementSetCard\';',
      'import { VocabularyCard } from \'@ifla/theme/components/VocabularyCard\';',
      'import { CompactButton } from \'@ifla/theme/components/CompactButton\';',
      '',
      `# ${config.title}`,
      '',
      config.description,
      '',
      '## Namespace Statistics',
      '',
      '<div style=\{{ display: \'flex\', gap: \'20px\', marginBottom: \'40px\', flexWrap: \'wrap\' }}>',
      '  <div style=\{{ background: \'#e3f2fd\', padding: \'20px\', borderRadius: \'8px\', flex: \'1\', minWidth: \'200px\' }}>',
      '    <div style=\{{ fontSize: \'0.9rem\', color: \'#666\' }}>Total Elements</div>',
      `    <div style=\{{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>${config.statistics.totalElements.toLocaleString()}</div>`,
      `    <div style=\{{ fontSize: '0.8rem', color: '#999' }}>Across ${config.statistics.elementSets} element set${config.statistics.elementSets !== 1 ? 's' : ''}</div>`,
      '  </div>'
    ].join('\n');
    
    return templateString;
  }

  /**
   * Generate landing page template
   */
  private generateLandingPage(config: SiteConfiguration): PageTemplate {
    const hasElementSets = config.elementSets.length > 0;
    const hasVocabularies = config.vocabularies.length > 0;

    let content = this.getLandingPageBaseTemplate(config);

    if (config.statistics.totalConcepts > 0) {
      content += `
  <div style=\{{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', flex: '1', minWidth: '200px' }}>
    <div style=\{{ fontSize: '0.9rem', color: '#666' }}>Total Concepts</div>
    <div style=\{{ fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2' }}>${config.statistics.totalConcepts.toLocaleString()}</div>
    <div style=\{{ fontSize: '0.8rem', color: '#999' }}>Across ${config.statistics.vocabularies} vocabular${config.statistics.vocabularies !== 1 ? 'ies' : 'y'}</div>
  </div>`;
    }

    content += `
</div>
`;

    // Element Sets Section
    if (hasElementSets) {
      content += `
## Element Sets

${this.getElementSetsDescription(config)}

<div style=\{{ display: 'grid', gap: '20px', marginBottom: '40px' }}>`;

      for (const elementSet of config.elementSets) {
        content += `
  <ElementSetCard 
    elementSet=\{{
      id: '${elementSet.id}',
      title: '${elementSet.title}',
      description: '${elementSet.description || ''}',
      elementCount: ${elementSet.elementCount},
      languages: ${JSON.stringify(elementSet.languages)},
      url: '${elementSet.url || ''}'
    }}
  />`;
      }

      content += `
</div>`;

      if (config.elementSets.length > 1) {
        content += `
<div style=\{{ textAlign: 'center', marginBottom: '40px' }}>
  <CompactButton to="/elements">Browse All Element Sets</CompactButton>
</div>`;
      }
    }

    // Vocabularies Section
    if (hasVocabularies) {
      content += `
## Vocabularies

${this.getVocabulariesDescription(config)}

<div style=\{{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>`;

      for (const vocabulary of config.vocabularies) {
        content += `
  <VocabularyCard 
    vocabulary=\{{
      id: '${vocabulary.id}',
      title: '${vocabulary.title}',
      description: '${vocabulary.description || ''}',
      conceptCount: ${vocabulary.conceptCount},
      languages: ${JSON.stringify(vocabulary.languages)},
      category: '${vocabulary.category || ''}',
      url: '${vocabulary.url || ''}'
    }}
  />`;
      }

      content += `
</div>`;

      if (config.vocabularies.length > 1) {
        content += `
<div style=\{{ textAlign: 'center', marginBottom: '40px' }}>
  <CompactButton to="/vocabularies">Browse All Vocabularies</CompactButton>
</div>`;
      }
    }

    // Navigation section based on strategy
    if (config.navigationStrategy === 'hierarchical') {
      content += `
## Navigation

This namespace contains a large number of element sets and vocabularies. Use the sidebar navigation to browse by category, or use the search functionality to find specific items.`;
    }

    return {
      path: 'index.mdx',
      content,
    };
  }

  /**
   * Get element sets index page template as string to avoid JSX parsing issues
   */
  private getElementSetsIndexTemplate(config: SiteConfiguration): string {
    const templateString = [
      '---',
      `title: ${config.title} Element Sets`,
      'sidebar_position: 10',
      '---',
      '',
      `# ${config.title} Element Sets`,
      '',
      this.getElementSetsDescription(config),
      '',
      '## Available Element Sets',
      '',
      '<div style=\{{ display: \'grid\', gap: \'20px\', marginTop: \'24px\' }}>'
    ].join('\n');
    
    return templateString;
  }

  /**
   * Generate element sets index page
   */
  private generateElementSetsIndexPage(
    config: SiteConfiguration,
  ): PageTemplate {
    let content = this.getElementSetsIndexTemplate(config);

    // Group element sets by category if hierarchical navigation
    if (config.navigationStrategy === 'hierarchical') {
      const categories = this.groupElementSetsByCategory(config.elementSets);

      for (const [category, elementSets] of Object.entries(categories)) {
        content += `
### ${this.formatCategoryName(category)}

<div style=\{{ display: 'grid', gap: '16px', marginBottom: '32px' }}>`;

        for (const elementSet of elementSets) {
          content += this.generateElementSetCard(elementSet);
        }

        content += `
</div>`;
      }
    } else {
      // Simple list for non-hierarchical navigation
      for (const elementSet of config.elementSets) {
        content += this.generateElementSetCard(elementSet);
      }
    }

    content += `
</div>`;

    return {
      path: 'elements/index.mdx',
      content,
    };
  }

  /**
   * Generate individual element set pages
   * Creates a page for each element set in the configuration
   */
  private generateIndividualElementSetPages(
    config: SiteConfiguration,
  ): PageTemplate[] {
    const templates: PageTemplate[] = [];

    for (const elementSet of config.elementSets) {
      // Create the main index page for this element set
      const elementSetPath = `elements/${elementSet.id}/index.mdx`;
      const elementSetContent = `---
title: ${elementSet.title}
sidebar_position: 1
---

# ${elementSet.title}

${elementSet.description || `Element set in the ${config.title} standard.`}

This element set contains ${elementSet.elementCount} elements.

## Overview

The ${elementSet.title} element set provides a structured way to describe ${config.title.toLowerCase()} resources.

## Elements

Elements will be listed here when imported.

## Languages

This element set is available in the following languages:
${this.formatLanguagesList(elementSet.languages)}
`;

      templates.push({
        path: elementSetPath,
        content: elementSetContent,
      });

      // For complex element sets with subcategories (like ISBD), create subdirectory index pages
      if (elementSet.id === 'isbd') {
        // Create subdirectory index pages for ISBD categories
        const categories = [
          'statements',
          'notes',
          'attributes',
          'relationships',
        ];

        for (const category of categories) {
          const categoryPath = `elements/${elementSet.id}/${category}/index.mdx`;
          const categoryTitle = this.formatCategoryName(category);

          const categoryContent = `---
title: ${elementSet.title} ${categoryTitle}
sidebar_position: 1
---

# ${elementSet.title} ${categoryTitle}

This section contains the ${categoryTitle.toLowerCase()} elements in the ${elementSet.title} element set.

## Available Elements

Elements in this category will be listed here when imported.
`;

          templates.push({
            path: categoryPath,
            content: categoryContent,
          });
        }
      } else if (elementSet.id === 'unconstrained') {
        // Create elements subdirectory for unconstrained
        const elementsPath = `elements/${elementSet.id}/elements/index.mdx`;
        const elementsContent = `---
title: ${elementSet.title} Elements
sidebar_position: 1
---

# ${elementSet.title} Elements

This section contains all elements in the ${elementSet.title} element set.

## Available Elements

Elements will be listed here when imported.
`;

        templates.push({
          path: elementsPath,
          content: elementsContent,
        });
      }
    }

    return templates;
  }

  /**
   * Format a list of languages for display
   */
  private formatLanguagesList(languages: string[]): string {
    if (!languages || languages.length === 0) {
      return '- None specified';
    }

    const languageNames: Record<string, string> = {
      en: 'English',
      fr: 'French',
      de: 'German',
      es: 'Spanish',
      it: 'Italian',
      ru: 'Russian',
      zh: 'Chinese',
      ar: 'Arabic',
      ja: 'Japanese',
    };

    return languages
      .map((lang) => {
        const name = languageNames[lang] || lang;
        return `- ${name} (${lang})`;
      })
      .join('\n');
  }

  /**
   * Generate vocabularies index page
   */
  private generateVocabulariesIndexPage(
    config: SiteConfiguration,
  ): PageTemplate {
    let content = `---
title: ${config.title} Vocabularies
sidebar_position: 20
---

# ${config.title} Vocabularies

${this.getVocabulariesDescription(config)}

## Available Vocabularies`;

    // Group vocabularies by category if they have categories
    const hasCategories = config.vocabularies.some((v) => v.category);

    if (hasCategories) {
      const categories = this.groupVocabulariesByCategory(config.vocabularies);

      for (const [category, vocabularies] of Object.entries(categories)) {
        content += `

### ${this.formatCategoryName(category)}

<div style=\{{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>`;

        for (const vocabulary of vocabularies) {
          content += this.generateVocabularyCard(vocabulary);
        }

        content += `
</div>`;
      }
    } else {
      content += `

<div style=\{{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '24px' }}>`;

      for (const vocabulary of config.vocabularies) {
        content += this.generateVocabularyCard(vocabulary);
      }

      content += `
</div>`;
    }

    return {
      path: 'vocabularies/index.mdx',
      content,
    };
  }

  /**
   * Get description for element sets section
   */
  private getElementSetsDescription(config: SiteConfiguration): string {
    const count = config.elementSets.length;
    const totalElements = config.statistics.totalElements;

    if (count === 1) {
      return `This namespace contains one element set with ${totalElements.toLocaleString()} elements.`;
    } else {
      return `This namespace contains ${count} element sets with a total of ${totalElements.toLocaleString()} elements.`;
    }
  }

  /**
   * Get description for vocabularies section
   */
  private getVocabulariesDescription(config: SiteConfiguration): string {
    const count = config.vocabularies.length;
    const totalConcepts = config.statistics.totalConcepts;

    if (count === 1) {
      return `This namespace contains one vocabulary with ${totalConcepts.toLocaleString()} concepts.`;
    } else {
      return `This namespace contains ${count} vocabularies with a total of ${totalConcepts.toLocaleString()} concepts.`;
    }
  }

  /**
   * Generate element set card markup
   */
  private generateElementSetCard(elementSet: ElementSet): string {
    return `
  <ElementSetCard 
    elementSet=\{{
      id: '${elementSet.id}',
      title: '${elementSet.title}',
      description: '${elementSet.description || ''}',
      elementCount: ${elementSet.elementCount},
      languages: ${JSON.stringify(elementSet.languages)},
      url: '${elementSet.url || ''}'
    }}
  />`;
  }

  /**
   * Generate vocabulary card markup
   */
  private generateVocabularyCard(vocabulary: Vocabulary): string {
    return `
  <VocabularyCard 
    vocabulary=\{{
      id: '${vocabulary.id}',
      title: '${vocabulary.title}',
      description: '${vocabulary.description || ''}',
      conceptCount: ${vocabulary.conceptCount},
      languages: ${JSON.stringify(vocabulary.languages)},
      category: '${vocabulary.category || ''}',
      url: '${vocabulary.url || ''}'
    }}
  />`;
  }

  /**
   * Generate individual vocabulary pages
   * Creates a page for each vocabulary in the configuration
   */
  private generateIndividualVocabularyPages(
    config: SiteConfiguration,
  ): PageTemplate[] {
    const templates: PageTemplate[] = [];

    for (const vocabulary of config.vocabularies) {
      // Determine the path based on vocabulary structure
      let vocabularyPath: string;

      // Handle nested vocabularies (like content qualification)
      if (vocabulary.id.includes('/')) {
        // For nested vocabularies, create the full path
        vocabularyPath = `vocabularies/${vocabulary.id}.mdx`;
      } else {
        // For top-level vocabularies, create a direct file
        vocabularyPath = `vocabularies/${vocabulary.id}.mdx`;
      }

      const vocabularyContent = `---
title: ${vocabulary.title}
sidebar_position: 1
---

# ${vocabulary.title}

${vocabulary.description || `Vocabulary in the ${config.title} standard.`}

This vocabulary contains ${vocabulary.conceptCount} concepts.

## Concepts

Concepts will be listed here when imported.

## Languages

This vocabulary is available in the following languages:
${this.formatLanguagesList(vocabulary.languages)}
`;

      templates.push({
        path: vocabularyPath,
        content: vocabularyContent,
      });

      // For nested vocabularies with categories, create parent index pages if needed
      if (vocabulary.category && vocabulary.id.includes('/')) {
        const categoryPath = vocabulary.id.split('/')[0];
        const categoryIndexPath = `vocabularies/${categoryPath}/index.mdx`;

        // Check if we already created this category index
        if (!templates.some((t) => t.path === categoryIndexPath)) {
          const categoryTitle = this.formatCategoryName(vocabulary.category);

          const categoryContent = `---
title: ${categoryTitle}
sidebar_position: 1
---

# ${categoryTitle}

This section contains vocabularies related to ${categoryTitle.toLowerCase()}.

## Available Vocabularies

Vocabularies in this category will be listed here when imported.
`;

          templates.push({
            path: categoryIndexPath,
            content: categoryContent,
          });
        }
      }
    }

    return templates;
  }

  /**
   * Group element sets by category for hierarchical navigation
   */
  private groupElementSetsByCategory(
    elementSets: ElementSet[],
  ): Record<string, ElementSet[]> {
    const categories: Record<string, ElementSet[]> = {};

    for (const elementSet of elementSets) {
      // Determine category from element set name/id
      let category = 'General';

      if (elementSet.id.includes('0XX') || elementSet.id.includes('1XX')) {
        category = 'Control & Coded Fields';
      } else if (
        elementSet.id.includes('2XX') ||
        elementSet.id.includes('3XX')
      ) {
        category = 'Descriptive Fields';
      } else if (
        elementSet.id.includes('4') ||
        elementSet.id.includes('linking')
      ) {
        category = 'Linking Fields';
      } else if (
        elementSet.id.includes('5XX') ||
        elementSet.id.includes('6XX') ||
        elementSet.id.includes('7XX')
      ) {
        category = 'Subject & Added Entry Fields';
      } else if (elementSet.id.includes('8')) {
        category = 'Holdings & Location Fields';
      } else if (elementSet.title.toLowerCase().includes('frbr')) {
        category = 'FRBR Models';
      }

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(elementSet);
    }

    return categories;
  }

  /**
   * Group vocabularies by category
   */
  private groupVocabulariesByCategory(
    vocabularies: Vocabulary[],
  ): Record<string, Vocabulary[]> {
    const categories: Record<string, Vocabulary[]> = {};

    for (const vocabulary of vocabularies) {
      const category = vocabulary.category || 'General';

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(vocabulary);
    }

    return categories;
  }

  /**
   * Format category name for display
   */
  private formatCategoryName(category: string): string {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate documentation pages
   * Creates all documentation pages referenced in the sidebar
   */
  private generateDocumentationPages(
    config: SiteConfiguration,
  ): PageTemplate[] {
    const templates: PageTemplate[] = [];

    // Standard documentation pages that all sites should have
    const standardPages = [
      {
        id: 'introduction',
        title: 'Introduction',
        position: 1000,
        content: `# ${config.title} Introduction

Overview of ${config.namespace.toUpperCase()} principles, scope, and application guidelines.

## Purpose

The ${config.title} standard provides a framework for ${config.namespace.toUpperCase()} implementation.

## Key Concepts

Key concepts and principles of the ${config.namespace.toUpperCase()} standard.

## How to Use This Documentation

This documentation is organized into sections covering different aspects of the ${config.namespace.toUpperCase()} standard.

*This page is under development.*
`,
      },
      {
        id: 'examples',
        title: 'Examples',
        position: 1010,
        content: `# ${config.title} Examples

Practical examples of ${config.namespace.toUpperCase()} implementation and usage.

## Basic Examples

Simple examples demonstrating core concepts of ${config.namespace.toUpperCase()}.

## Advanced Examples

More complex examples showing advanced usage of ${config.namespace.toUpperCase()}.

## Implementation Patterns

Common patterns and best practices for implementing ${config.namespace.toUpperCase()}.

*This page is under development.*
`,
      },
      {
        id: 'about',
        title: 'About',
        position: 1020,
        content: `# About ${config.title}

Information about the ${config.namespace.toUpperCase()} standard, its development, and maintenance.

## History

Brief history of the ${config.namespace.toUpperCase()} standard.

## Governance

Information about the governance and maintenance of the ${config.namespace.toUpperCase()} standard.

## Contributors

List of contributors to the ${config.namespace.toUpperCase()} standard.

## Related Standards

Standards related to or compatible with ${config.namespace.toUpperCase()}.

*This page is under development.*
`,
      },
    ];

    // Additional documentation pages for more complex standards
    const additionalPages = [
      {
        id: 'assessment',
        title: 'Assessment',
        position: 1030,
        content: `# ${config.title} Assessment

Guidelines for assessing ${config.namespace.toUpperCase()} implementation and compliance.

## Compliance Levels

Different levels of compliance with the ${config.namespace.toUpperCase()} standard.

## Assessment Criteria

Criteria for evaluating ${config.namespace.toUpperCase()} implementations.

## Self-Assessment Tools

Tools and checklists for self-assessment of ${config.namespace.toUpperCase()} implementations.

*This page is under development.*
`,
      },
      {
        id: 'glossary',
        title: 'Glossary',
        position: 1040,
        content: `# ${config.title} Glossary

Definitions of key terms used in the ${config.namespace.toUpperCase()} standard.

## A

### Term A1
Definition of Term A1.

### Term A2
Definition of Term A2.

## B

### Term B1
Definition of Term B1.

*This page is under development.*
`,
      },
      {
        id: 'faq',
        title: 'FAQ',
        position: 1050,
        content: `# ${config.title} FAQ

Frequently asked questions about the ${config.namespace.toUpperCase()} standard.

## General Questions

### What is ${config.namespace.toUpperCase()}?
${config.namespace.toUpperCase()} is a standard for...

### Who maintains ${config.namespace.toUpperCase()}?
${config.namespace.toUpperCase()} is maintained by...

## Implementation Questions

### How do I implement ${config.namespace.toUpperCase()}?
To implement ${config.namespace.toUpperCase()}, you should...

*This page is under development.*
`,
      },
    ];

    // Create templates for standard pages
    for (const page of standardPages) {
      templates.push({
        path: `${page.id}.mdx`,
        content: `---
title: ${page.title}
sidebar_position: ${page.position}
---

${page.content}`,
      });
    }

    // Add additional pages for more complex standards
    if (
      config.navigationStrategy === 'categorized' ||
      config.navigationStrategy === 'hierarchical'
    ) {
      for (const page of additionalPages) {
        templates.push({
          path: `${page.id}.mdx`,
          content: `---
title: ${page.title}
sidebar_position: ${page.position}
---

${page.content}`,
        });
      }
    }

    return templates;
  }

  /**
   * Generate tools & resources pages for hierarchical navigation
   * Creates pages for search, cross-set browser, field guide, and other tools
   */
  private generateToolsPages(config: SiteConfiguration): PageTemplate[] {
    const templates: PageTemplate[] = [];

    // Tools pages for hierarchical navigation
    const toolsPages = [
      {
        id: 'search',
        title: 'Search',
        position: 900,
        content: `# ${config.title} Search

Advanced search functionality for ${config.namespace.toUpperCase()} elements and vocabularies.

import { SearchPage } from '@ifla/theme/components/SearchPage';

<SearchPage namespace="${config.namespace}" />

## Search Tips

- Use quotes for exact phrase matching: "title proper"
- Use wildcards for partial matching: catalog*
- Use boolean operators: AND, OR, NOT
- Filter by element set or vocabulary using the dropdown menus

*This page is under development.*
`,
      },
      {
        id: 'cross-set-browser',
        title: 'Cross-Set Browser',
        position: 910,
        content: `# ${config.title} Cross-Set Browser

Browse elements across multiple element sets in the ${config.namespace.toUpperCase()} standard.

import { CrossSetBrowser } from '@ifla/theme/components/CrossSetBrowser';

<CrossSetBrowser namespace="${config.namespace}" />

## Using the Cross-Set Browser

The Cross-Set Browser allows you to:

- Compare similar elements across different element sets
- See relationships between elements
- Understand how concepts map between different models
- Export comparison tables for reference

*This page is under development.*
`,
      },
      {
        id: 'field-guide',
        title: 'Field Guide',
        position: 920,
        content: `# ${config.title} Field Guide

Quick reference guide for ${config.namespace.toUpperCase()} fields and elements.

import { FieldGuide } from '@ifla/theme/components/FieldGuide';

<FieldGuide namespace="${config.namespace}" />

## About the Field Guide

The Field Guide provides a compact reference for all elements in the ${config.namespace.toUpperCase()} standard. Use it to:

- Quickly look up element definitions
- Find usage examples
- Check element properties and constraints
- Access related documentation

*This page is under development.*
`,
      },
      {
        id: 'export-tools',
        title: 'Export Tools',
        position: 930,
        content: `# ${config.title} Export Tools

Tools for exporting ${config.namespace.toUpperCase()} data in various formats.

import { ExportTools } from '@ifla/theme/components/ExportTools';

<ExportTools namespace="${config.namespace}" />

## Available Export Formats

- RDF/XML
- Turtle
- JSON-LD
- CSV/Excel
- HTML Documentation

## How to Use Exports

Instructions for using the exported data in different contexts.

*This page is under development.*
`,
      },
      {
        id: 'visualization',
        title: 'Visualization',
        position: 940,
        content: `# ${config.title} Visualization

Visual representations of ${config.namespace.toUpperCase()} elements and relationships.

import { VisualizationTools } from '@ifla/theme/components/VisualizationTools';

<VisualizationTools namespace="${config.namespace}" />

## Available Visualizations

- Element relationship graphs
- Hierarchy diagrams
- Concept maps
- Usage statistics

*This page is under development.*
`,
      },
    ];

    // Create templates for tools pages
    for (const page of toolsPages) {
      templates.push({
        path: `${page.id}.mdx`,
        content: `---
title: ${page.title}
sidebar_position: ${page.position}
---

${page.content}`,
      });
    }

    return templates;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Load site configurations
    const configsPath = path.join(
      __dirname,
      '../output/site-configurations/all-site-configs.json',
    );

    if (!fs.existsSync(configsPath)) {
      throw new Error(
        `Site configurations not found. Please run parse-ifla-report.ts first.`,
      );
    }

    const siteConfigs: Record<string, SiteConfiguration> = JSON.parse(
      fs.readFileSync(configsPath, 'utf-8'),
    );

    // Generate page templates
    const generator = new PageTemplateGenerator();
    await generator.generateAllPageTemplates(siteConfigs);
  } catch (error) {
    console.error('❌ Error generating page templates:', error);
    process.exit(1);
  }
}

// Export for testing
export { PageTemplateGenerator };

// Run if called directly
if (require.main === module) {
  main();
}
