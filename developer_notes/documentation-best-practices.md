# Documentation Best Practices - IFLA Standards Platform

## Overview

This guide establishes comprehensive standards for creating and maintaining documentation across the IFLA Standards Platform, covering APIs, components, user instructions, and technical guidance.

## Documentation Types & Standards

### 1. API Documentation

#### Structure & Format
Follow the established template in `docs/api-documentation-template.md`:

```markdown
# [API Name] API

## Overview
[Brief description and purpose]

**Base URL**: `https://api.iflastandards.info/v1`  
**Authentication**: Bearer token required

## Quick Start
[Simple example of most common use case]

## Endpoints
[Detailed endpoint documentation]
```

#### Required Sections for Each Endpoint
```markdown
## [HTTP Method] [Endpoint Path]

### Request
- **Method**: `GET|POST|PUT|DELETE`
- **Path**: `/api/v1/resource`
- **Headers**: Required/optional headers table
- **Parameters**: Path/query parameters table
- **Body**: Request body schema with validation rules

### Response
- **Success Response**: Status code + JSON schema
- **Error Responses**: All possible error scenarios
- **Examples**: cURL, JavaScript, Python examples

### Authentication & Authorization
- Required permissions
- Role-based access details
```

#### API Documentation Standards
```typescript
// ✅ CORRECT - Complete endpoint documentation
/**
 * Creates a new project in the specified review group
 * 
 * @route POST /api/v1/projects
 * @param {CreateProjectRequest} body - Project creation data
 * @returns {Promise<ProjectResponse>} Created project with generated ID
 * @throws {ValidationError} When required fields are missing
 * @throws {PermissionError} When user lacks create permissions
 * @throws {ConflictError} When project name already exists
 * 
 * @example
 * ```typescript
 * const project = await createProject({
 *   reviewGroupId: 'rg_isbd',
 *   name: 'ISBD 2024 Revision',
 *   description: 'Major revision of ISBD standard',
 *   visibility: 'public'
 * });
 * ```
 */
export async function createProject(body: CreateProjectRequest): Promise<ProjectResponse> {
  // Implementation
}
```

### 2. Component Documentation

#### JSDoc Standards (MANDATORY)
All exported functions, components, and types must have JSDoc comments:

```typescript
/**
 * Multilingual vocabulary table component for Docusaurus sites
 * 
 * @component
 * @param {VocabularyTableProps} props - Component configuration
 * @param {string} props.vocabularyId - Unique identifier for the vocabulary
 * @param {ConceptProps[]} props.data - Array of vocabulary concepts
 * @param {LanguageConfig[]} props.languages - Supported languages
 * @param {VocabularyDefaults} props.defaults - Default configuration values
 * 
 * @returns {ReactElement} Rendered vocabulary table with filtering and multilingual support
 * 
 * @example
 * ```tsx
 * <VocabularyTable
 *   vocabularyId="content-types"
 *   data={vocabularyData}
 *   languages={[
 *     { code: 'en', name: 'English', nativeName: 'English' },
 *     { code: 'fr', name: 'French', nativeName: 'Français' }
 *   ]}
 *   defaults={{
 *     prefix: 'ct',
 *     showFilter: true,
 *     defaultLanguage: 'en'
 *   }}
 * />
 * ```
 * 
 * @see {@link https://iflastandards.info/docs/components/vocabulary-table} Full documentation
 * @since 1.2.0
 */
export function VocabularyTable(props: VocabularyTableProps): ReactElement {
  // Implementation
}
```

#### Component README Structure
Each complex component should have a README.md following this pattern:

```markdown
# ComponentName

[Brief description of component purpose]

## Installation & Usage

### Basic Usage
```tsx
import { ComponentName } from '@ifla/theme/components';

<ComponentName prop1="value" prop2={data} />
```

### Props API
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| prop1 | string | Yes | - | Description of prop1 |
| prop2 | Data[] | No | [] | Description of prop2 |

### Examples
[Multiple usage examples with different configurations]

### Styling
[CSS classes, custom properties, theming information]

### Accessibility
[Accessibility features, ARIA attributes, keyboard navigation]

### Testing
[How to test the component, test utilities available]
```

#### Type Documentation
```typescript
/**
 * Configuration for multilingual vocabulary display
 * 
 * @interface VocabularyTableProps
 * @since 1.0.0
 */
export interface VocabularyTableProps {
  /** Unique identifier for the vocabulary */
  vocabularyId: string;
  
  /** 
   * Array of vocabulary concepts to display
   * @example
   * ```typescript
   * const data = [
   *   {
   *     value: { en: 'Book', fr: 'Livre' },
   *     definition: { en: 'A written work', fr: 'Une œuvre écrite' },
   *     uri: 'https://example.com/book'
   *   }
   * ];
   * ```
   */
  data: ConceptProps[];
  
  /** 
   * Supported languages for multilingual display
   * @default [{ code: 'en', name: 'English', nativeName: 'English' }]
   */
  languages?: LanguageConfig[];
  
  /**
   * Default configuration values
   * @see {@link VocabularyDefaults} for all available options
   */
  defaults?: Partial<VocabularyDefaults>;
}
```

### 3. User Documentation & Guides

#### User Guide Structure
Follow the pattern established in `packages/theme/src/components/VocabularyTable/user-guide.md`:

```markdown
# How to [Task]: A Complete Guide

*A non-technical guide to [specific task or feature]*

## What is [Concept]?
[Clear explanation for non-technical users]

## Overview: [Number] Ways to [Accomplish Task]
[List different approaches with brief descriptions]

## Method 1: [Approach Name]
[Step-by-step instructions with examples]

### Step 1: [Action]
[Detailed instructions with screenshots if needed]

### Step 2: [Next Action]
[Continue with clear, actionable steps]

## Method 2: [Alternative Approach]
[Alternative method with same level of detail]

## Troubleshooting
[Common issues and solutions]

## Advanced Usage
[Power user features and customization]
```

#### Writing Style Guidelines
- **Use active voice**: "Click the button" not "The button should be clicked"
- **Be specific**: "Enter your email address" not "Provide your information"
- **Include context**: Explain why steps are necessary
- **Use consistent terminology**: Maintain a glossary of terms
- **Provide examples**: Show real-world usage scenarios

### 4. Technical Documentation

#### Architecture Documentation
Follow the pattern in `system-design-docs/`:

```markdown
# [System/Feature] Architecture

**Version**: 1.0  
**Date**: [Current Date]  
**Status**: [Draft|Review|Approved]

## Executive Summary
[High-level overview for stakeholders]

## Architecture Overview
[System diagram and component relationships]

## Components
### Component Name
- **Purpose**: What it does
- **Responsibilities**: Key functions
- **Dependencies**: What it relies on
- **Interfaces**: How other components interact with it

## Data Flow
[Sequence diagrams and data flow descriptions]

## Security Considerations
[Authentication, authorization, data protection]

## Performance Requirements
[Scalability, response times, throughput]

## Deployment Architecture
[Infrastructure, environments, CI/CD]
```

#### Implementation Guides
Follow the pattern in `developer_notes/RBAC_IMPLEMENTATION_GUIDE.md`:

```markdown
# [Feature] Implementation Guide

**Purpose**: Developer guide for implementing [feature]  
**Audience**: Developers, Technical Leads  
**Prerequisites**: [Required knowledge/setup]

## Overview
[What this guide covers and expected outcomes]

## Implementation Steps

### Step 1: [Setup/Configuration]
```typescript
// Code examples with full context
const config = {
  // Configuration details
};
```

### Step 2: [Core Implementation]
[Detailed implementation with code examples]

### Step 3: [Testing]
[How to test the implementation]

## Code Examples
[Real-world usage examples]

## Best Practices
[Do's and don'ts, performance considerations]

## Troubleshooting
[Common issues and solutions]

## References
[Links to related documentation]
```

### 5. Testing Documentation

#### Test Documentation Standards
Follow the pattern in `developer_notes/AI_TESTING_INSTRUCTIONS.md`:

```markdown
# [Feature] Testing Guide

**Purpose**: Testing strategy and implementation for [feature]  
**Philosophy**: Integration-first testing with real I/O  
**Prerequisites**: Read `TESTING_QUICK_REFERENCE.md`

## Test Strategy
[Overall approach and test types]

## Test Implementation

### Unit Tests
```typescript
describe('ComponentName @unit', () => {
  it('should handle basic functionality', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Feature Workflow @integration @api', () => {
  it('should process real data end-to-end', async () => {
    // Integration test with real I/O
  });
});
```

## Test Data & Fixtures
[How to set up test data]

## Performance Targets
[Expected test execution times]
```

## Documentation Maintenance

### Version Control
- **Document versions** alongside code changes
- **Update examples** when APIs change
- **Maintain changelog** for breaking changes
- **Archive outdated** documentation with clear deprecation notices

### Review Process
```markdown
## Documentation Review Checklist

### Content Review
- [ ] **Accuracy**: All information is current and correct
- [ ] **Completeness**: All required sections are present
- [ ] **Clarity**: Language is clear and unambiguous
- [ ] **Examples**: Code examples work and are relevant

### Technical Review
- [ ] **Code samples**: All code compiles and runs
- [ ] **Links**: All internal and external links work
- [ ] **Screenshots**: Images are current and high-quality
- [ ] **Formatting**: Consistent with style guide

### User Experience Review
- [ ] **Navigation**: Easy to find relevant information
- [ ] **Structure**: Logical flow and organization
- [ ] **Accessibility**: Readable by diverse audiences
- [ ] **Searchability**: Proper headings and keywords
```

### Automated Documentation

#### JSDoc Generation
```typescript
// Configure JSDoc for automatic API documentation
{
  "source": {
    "include": ["./src/"],
    "exclude": ["./src/**/*.test.ts"]
  },
  "opts": {
    "destination": "./docs/api/",
    "recurse": true
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": false,
    "monospaceLinks": false
  }
}
```

#### OpenAPI Specification
```yaml
# Generate API documentation from OpenAPI spec
openapi: 3.0.3
info:
  title: IFLA Standards API
  version: 1.0.0
  description: |
    Comprehensive API for managing IFLA library standards,
    vocabularies, and multilingual content.
    
    ## Authentication
    All endpoints require Bearer token authentication.
    
    ## Rate Limiting
    API calls are limited to 1000 requests per hour per API key.

paths:
  /projects:
    get:
      summary: List projects
      description: |
        Retrieve a paginated list of projects accessible to the authenticated user.
        Results can be filtered by review group, visibility, and search terms.
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
          description: Page number for pagination
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectListResponse'
```

## Documentation Tools & Automation

### Recommended Tools
- **JSDoc**: Automatic API documentation generation
- **Docusaurus**: User-facing documentation sites
- **OpenAPI**: REST API specification and documentation
- **Mermaid**: Diagrams and flowcharts in markdown
- **PlantUML**: Complex system diagrams

### Automation Scripts
```bash
#!/bin/bash
# Generate comprehensive documentation

# Generate API docs from JSDoc
npm run docs:api

# Generate OpenAPI documentation
npm run docs:openapi

# Update component documentation
npm run docs:components

# Validate all documentation links
npm run docs:validate

# Deploy to documentation site
npm run docs:deploy
```

### Documentation Testing
```typescript
// Test documentation examples
describe('Documentation Examples @integration @docs', () => {
  it('should execute all code examples successfully', async () => {
    // Extract and test code examples from documentation
    const examples = await extractCodeExamples('./docs/');
    
    for (const example of examples) {
      expect(() => {
        eval(example.code);
      }).not.toThrow();
    }
  });
  
  it('should have working links', async () => {
    const links = await extractLinks('./docs/');
    
    for (const link of links) {
      if (link.startsWith('http')) {
        const response = await fetch(link);
        expect(response.status).toBeLessThan(400);
      }
    }
  });
});
```

## Style Guide

### Writing Standards
- **Tone**: Professional but approachable
- **Voice**: Active voice preferred
- **Tense**: Present tense for current functionality
- **Perspective**: Second person for user instructions ("you can...")
- **Terminology**: Consistent across all documentation

### Formatting Standards
- **Headings**: Use sentence case, not title case
- **Code**: Always use syntax highlighting with language specification
- **Lists**: Use parallel structure and consistent punctuation
- **Links**: Descriptive link text, not "click here"
- **Images**: Alt text for accessibility, captions for context

### Code Example Standards
```typescript
// ✅ CORRECT - Complete, runnable example
import { VocabularyTable } from '@ifla/theme/components';

export function MyComponent() {
  const vocabularyData = [
    {
      value: { en: 'Book', fr: 'Livre' },
      definition: { en: 'A written work', fr: 'Une œuvre écrite' }
    }
  ];

  return (
    <VocabularyTable
      vocabularyId="content-types"
      data={vocabularyData}
      languages={[
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'fr', name: 'French', nativeName: 'Français' }
      ]}
    />
  );
}

// ❌ WRONG - Incomplete, non-runnable example
<VocabularyTable data={data} />
```

## Integration with Development Workflow

### Documentation in Pull Requests
- **API changes**: Update API documentation
- **Component changes**: Update component README and JSDoc
- **New features**: Create user guides and implementation docs
- **Breaking changes**: Update migration guides

### Documentation Review Process
1. **Technical accuracy**: Code examples work
2. **Content quality**: Clear, complete, helpful
3. **Consistency**: Follows style guide and templates
4. **Accessibility**: Readable by target audience
5. **Maintenance**: Easy to keep up-to-date

### Metrics & Quality Assurance
- **Coverage**: All public APIs documented
- **Freshness**: Documentation updated with code changes
- **Usage**: Analytics on most/least used documentation
- **Feedback**: User feedback and improvement suggestions

This comprehensive documentation framework ensures that all IFLA Standards Platform documentation is consistent, maintainable, and valuable to its intended audiences.