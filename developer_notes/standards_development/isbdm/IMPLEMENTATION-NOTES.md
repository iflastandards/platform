# Implementation Notes

This document captures key implementation details, design decisions, and solutions developed during the ISBDM project. Each section represents a specific feature or pattern that has been implemented successfully.

## Project Overview

The ISBDM (International Standard Bibliographic Description for Manifestation) project is not just a documentation site but a complete workflow and toolchain for creating, maintaining, and publishing RDF vocabularies. Key aspects include:

### Project Context for ISBDM
For this specific project, the working group responsible for ISBDM started with the traditional process and created both the spreadsheet and HTML documentation independently. This HTML documentation (located in the ISBDM folder) serves as our prototype for designing the Docusaurus version. Since the content and design have already been approved by the working group, our conversion must be:

- **Visually Similar**: Maintain the same look and feel as the original
- **Semantically Lossless**: Preserve all meaning and relationships
- **Structurally Enhanced**: While changing the underlying implementation completely

This situation presents unique requirements for the development process, as we must balance fidelity to the approved design with the implementation of our new RDF-focused workflow.

### Workflow and Lifecycle
1. **Initial Development**: Vocabularies begin as spreadsheets for drafting and review
2. **Formal Approval**: Working group reviews and approves vocabularies
3. **Documentation Creation**: Approved vocabularies are scaffolded into MDX with RDF in front matter
4. **Ongoing Maintenance**: Working group transitions to documentation development
5. **RDF Publication**: CI/CD extracts and validates RDF from front matter into formal vocabularies

### Architecture
- **Component-Driven Display**: Reusable React components render RDF data from front matter
- **Templates**: Non-technical editors can create elements using templates with standardized front matter
- **Global Defaults**: Reduce duplication and maintain consistency
- **CI/CD Pipeline**: GitHub Actions for RDF extraction, validation, and publication

### Versioning Strategy
- **RDF Versioning**: Semantic versioning with AI recommendations
- **Documentation Versioning**: Date-based, independent of RDF versioning
- **Translation Versioning**: Language-specific metadata tracking translation status
- **Release Management**: English primary, translations follow English releases

### Upcoming Development
- **DCTAP Profiles**: Will control vocabulary structure, front matter, and validation
- **Validation Tools**: Ensure consistency across RDF elements
- **Enhanced Publishing**: Automated release management

## Table of Contents
- [Global Component Defaults](#global-component-defaults)
- [Image Size Module Fix](#image-size-module-fix)

---

## Global Component Defaults

**Date: 2025-05-11**

### Overview
We implemented a system for providing global default values to components via Docusaurus's `customFields` configuration. This reduces duplication in front matter across similar content types while maintaining the ability to override any value when needed.

### Implementation Details

1. **Configuration in docusaurus.config.ts**:
   ```typescript
   // docusaurus.config.ts
   const config = {
     // ... other config
     customFields: {
       vocabularyDefaults: {
         prefix: "isbdm",
         startCounter: 1000,
         uriStyle: "numeric",
         caseStyle: "kebab-case",
         showFilter: true,
         filterPlaceholder: "Filter vocabulary terms...",
         showTitle: false,
         RDF: {
           "rdf:type": ["skos:ConceptScheme"]
         }
       }
     }
   };
   ```

2. **Access in Components**:
   ```typescript
   import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

   export function MyComponent(props) {
     // Get site config for default values
     const { siteConfig } = useDocusaurusContext();
     const defaults = siteConfig.customFields?.vocabularyDefaults || {};
     
     // Merge props with defaults, prioritizing props
     const resolvedPrefix = props.prefix || defaults.prefix || 'hardcoded-fallback';
     
     // Use resolved values in rendering
     // ...
   }
   ```

3. **Handle Static Methods**:
   For static methods that can't use React hooks, access defaults via `window.__DOCUSAURUS__`:
   ```typescript
   // Static method
   MyComponent.staticMethod = (props) => {
     let defaults = {};
     
     if (typeof window !== 'undefined' && 
         window.__DOCUSAURUS__ && 
         window.__DOCUSAURUS__.siteConfig &&
         window.__DOCUSAURUS__.siteConfig.customFields) {
       defaults = window.__DOCUSAURUS__.siteConfig.customFields.vocabularyDefaults || {};
     }
     
     // Use defaults...
   };
   ```

4. **TypeScript Support**:
   ```typescript
   // TypeScript declaration for window.__DOCUSAURUS__
   declare global {
     interface Window {
       __DOCUSAURUS__?: {
         siteConfig: {
           customFields?: {
             vocabularyDefaults?: {
               prefix?: string;
               // other properties...
             };
           };
         };
       };
     }
   }
   ```

### Testing Approach

We created comprehensive tests to verify the defaults system:

1. **Test with Site Defaults**: Mock `useDocusaurusContext` to return configured defaults
2. **Test with No Site Defaults**: Test fallback to hardcoded values
3. **Test Property Overriding**: Verify that props correctly override defaults
4. **Test Real-World Examples**: Test with actual content examples

Example test suite: 
- `/src/tests/components/VocabularyTableDefaults.test.tsx`
- `/src/tests/components/VocabularyTableNoDefaults.test.tsx`
- `/src/tests/components/VocabularyTableRealExamples.test.tsx`

### Usage Examples

**Before** - Requiring all properties in front matter:
```mdx
---
vocabularyId: "1275"
title: "My Vocabulary"
prefix: "isbdm"
startCounter: 1000
uriStyle: "numeric"
caseStyle: "kebab-case"
showFilter: true
filterPlaceholder: "Filter vocabulary terms..."
showTitle: false
RDF:
  rdf:type: 
    - skos:ConceptScheme
  values:
    - value: term1
      definition: Definition of term
---
```

**After** - Using defaults:
```mdx
---
vocabularyId: "1275" 
title: "My Vocabulary"
RDF:
  values:
    - value: term1
      definition: Definition of term
---
```

### Documentation

- `COMPONENT-DEFAULTS.md`: Detailed explanation of the pattern
- `docs/examples/VocabularyTable.mdx`: Updated component documentation
- `docs/examples/MinimalVocabulary.mdx`: Example using defaults

---

## Image Size Module Fix

**Date: 2025-05-11**

### Problem
We encountered an issue with the `image-size` module when using Yarn Berry in PnP mode:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "buffer" argument must be an instance of Buffer, TypedArray, or DataView. Received an instance of ArrayBuffer
```

### Solution
The simplest solution was to switch from Yarn Berry's PnP mode to the traditional node_modules resolution strategy:

1. Create `.yarnrc.yml` in the project root:
   ```yaml
   nodeLinker: node-modules
   ```

2. Reinstall dependencies:
   ```bash
   yarn
   ```

3. Update `package.json` scripts to use standard Docusaurus commands:
   ```json
   "scripts": {
     "start": "docusaurus start",
     "build": "docusaurus build",
     "start:patched": "node start-patched.js",
     "build:patched": "node build-patched.js"
   }
   ```

### Root Cause Analysis
- Yarn Berry's PnP mode uses a custom module resolution system that affects Node.js internals
- The `image-size` module uses Node.js filesystem operations with binary data (Buffers/ArrayBuffers)
- In PnP mode, there's a compatibility issue between ArrayBuffer and Buffer conversions

### Alternative Approaches (Not Used)
We attempted several patches before finding the simpler solution:
- `buffer-patch.js`: Enhanced Buffer.from to handle ArrayBuffers 
- `filehandle-patch.js`: Patched FileHandle.read for ArrayBuffer conversion
- `image-size-direct-patch.js`: Direct interception of the image-size module

### Documentation
See `IMAGE-SIZE-FIX.md` for detailed explanation.

---
