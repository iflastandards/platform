# Design Document: Vocabulary Site Scaffolding Enhancement

## Overview

This design document outlines the approach for enhancing the vocabulary site scaffolding system to create all necessary files referenced by the navigation sidebar. The current system generates navigation that references files that don't exist, causing build errors. This enhancement will ensure all referenced files are created with appropriate placeholder content.

## Architecture

The enhancement will modify the existing page template generator to create additional files:

1. **Individual element set pages** - Create index pages for each element set
2. **Individual vocabulary pages** - Create standalone pages for each vocabulary
3. **Documentation pages** - Create all documentation pages referenced in the sidebar

The system will follow the ISBD site structure as the reference implementation.

## Components and Interfaces

### 1. Enhanced Page Template Generator

The existing `PageTemplateGenerator` class will be extended with new methods:

```typescript
class PageTemplateGenerator {
  // Existing methods
  async generateSitePageTemplates(namespace: string, config: SiteConfiguration): Promise<void>;
  private generateLandingPage(config: SiteConfiguration): PageTemplate;
  private generateElementSetsIndexPage(config: SiteConfiguration): PageTemplate;
  private generateVocabulariesIndexPage(config: SiteConfiguration): PageTemplate;
  
  // New methods
  private generateIndividualElementSetPages(config: SiteConfiguration): PageTemplate[];
  private generateIndividualVocabularyPages(config: SiteConfiguration): PageTemplate[];
  private generateDocumentationPages(config: SiteConfiguration): PageTemplate[];
  private generateToolsPages(config: SiteConfiguration): PageTemplate[];
}
```

### 2. File Structure Validator

A new component to validate that all files referenced in the sidebar exist:

```typescript
class FileStructureValidator {
  validateSidebarReferences(namespace: string): ValidationResult;
  generateMissingFiles(namespace: string, missingFiles: string[]): void;
}
```

### 3. Template Content Provider

A component to generate appropriate placeholder content for different page types:

```typescript
class TemplateContentProvider {
  generateElementSetContent(elementSet: ElementSet): string;
  generateVocabularyContent(vocabulary: Vocabulary): string;
  generateDocumentationContent(docType: string, config: SiteConfiguration): string;
}
```

## Data Models

The system will use the existing data models from the IFLA report parser:

```typescript
interface SiteConfiguration {
  namespace: string;
  title: string;
  description: string;
  navigationStrategy: 'simple' | 'categorized' | 'hierarchical';
  elementSets: ElementSet[];
  vocabularies: Vocabulary[];
  statistics: {
    totalElements: number;
    totalConcepts: number;
    elementSets: number;
    vocabularies: number;
  };
}

interface ElementSet {
  id: string;
  title: string;
  description?: string;
  elementCount: number;
  languages: string[];
  url?: string;
}

interface Vocabulary {
  id: string;
  title: string;
  description?: string;
  conceptCount: number;
  languages: string[];
  category?: string;
  url?: string;
}
```

## Implementation Plan

### 1. Individual Element Set Pages

For each element set in the configuration:

1. Create directory: `docs/elements/{element-set-id}/`
2. Create index page: `docs/elements/{element-set-id}/index.mdx`
3. For complex element sets (like ISBD), create subdirectories with their own index pages

Example element set index page:

```mdx
---
title: [Element Set Title]
sidebar_position: 1
---

# [Element Set Title]

[Element Set Description]

This element set contains [elementCount] elements.

## Available Elements

Elements will be listed here when imported.

## Languages

This element set is available in the following languages:
[List of languages]
```

### 2. Individual Vocabulary Pages

For each vocabulary in the configuration:

1. Create vocabulary page: `docs/vocabularies/{vocabulary-id}.mdx`
2. For categorized vocabularies, create appropriate directory structure

Example vocabulary page:

```mdx
---
title: [Vocabulary Title]
sidebar_position: 1
---

# [Vocabulary Title]

[Vocabulary Description]

This vocabulary contains [conceptCount] concepts.

## Concepts

Concepts will be listed here when imported.

## Languages

This vocabulary is available in the following languages:
[List of languages]
```

### 3. Documentation Pages

Create standard documentation pages:

1. `docs/introduction.mdx` - Introduction to the standard
2. `docs/examples.mdx` - Usage examples
3. `docs/about.mdx` - About the standard
4. `docs/assessment.mdx` - Assessment guidelines (if referenced)
5. `docs/glossary.mdx` - Terminology glossary (if referenced)

Example documentation page:

```mdx
---
title: Introduction
sidebar_position: 1
---

# Introduction to [Standard Name]

This page provides an introduction to the [Standard Name] standard.

## Overview

[Standard Name] is a standard for [brief description].

## Purpose

The purpose of [Standard Name] is to [purpose description].

## History

[Brief history of the standard]
```

### 4. Tools & Resources Pages

For hierarchical navigation sites, create tools pages:

1. `docs/search.mdx` - Search functionality
2. `docs/cross-set-browser.mdx` - Cross-set browser
3. `docs/field-guide.mdx` - Field guide

## Error Handling

1. **Missing Directories**: Create directories if they don't exist
2. **Existing Files**: Preserve existing files, don't overwrite
3. **Invalid References**: Log warnings for sidebar references that can't be resolved

## Testing Strategy

1. **Unit Tests**: Test each template generation function
2. **Integration Tests**: Test the complete file generation process
3. **Validation Tests**: Verify that all sidebar references have corresponding files
4. **Build Tests**: Ensure sites build without "document ids do not exist" errors

## Backward Compatibility

The enhanced system will:

1. Preserve existing files
2. Only create files that don't already exist
3. Maintain the same directory structure as existing sites
4. Follow the ISBD pattern for consistency

## Future Enhancements

1. **Template Customization**: Allow customization of generated templates
2. **Content Import**: Integrate with content import system
3. **Automatic Updates**: Update files when navigation changes