# TinaCMS POC Implementation Guide

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Step-by-step guide for TinaCMS proof of concept

## Quick Start

### Prerequisites
- Node.js 18+
- Access to the platform repository
- Understanding of MDX structure
- Test vocabulary files

### Initial Setup

```bash
# Create POC branch
git checkout -b feature/tinacms-poc

# Install TinaCMS
pnpm add --save-dev tinacms @tinacms/cli

# Initialize TinaCMS
npx @tinacms/cli init
```

## POC Scope

### What We're Testing
1. **MDX Compatibility**: Can TinaCMS handle our complex frontmatter?
2. **Multilingual Support**: Can we edit multiple languages efficiently?
3. **Performance Impact**: What's the build time cost?
4. **User Experience**: Is it actually easier than current workflow?
5. **Customization**: Can we build the fields we need?

### Test Environment: standards/newtest
- **Primary Testing Site**: `standards/newtest` - Safe POC environment
- **No Risk**: Isolated from live production sites
- **Full Features**: Supports all platform capabilities
- **Clean Slate**: Can reset/rebuild as needed

### Secondary Testing (Read-Only)
- **Live Site Analysis**: ISBDM for real-world complexity assessment
- **No Modifications**: Only read operations on live sites
- **Data Validation**: Test against real vocabulary structures

## Implementation Steps

### Step 1: Configure TinaCMS Schema

Create `tina/config.ts`:

```typescript
import { defineConfig, Schema } from "tinacms";

// Custom field for multilingual content
const multilingualTextField = {
  name: "multilingual",
  type: "object",
  fields: [
    { name: "en", type: "string", label: "English" },
    { name: "fr", type: "string", label: "French" },
    { name: "es", type: "string", label: "Spanish" },
    { name: "de", type: "string", label: "German" },
  ],
};

// Vocabulary schema matching our MDX structure
const vocabularySchema: Schema = {
  collections: [
    {
      name: "vocabulary",
      label: "Vocabulary Terms",
      path: "standards/newtest/docs/vocabularies",
      format: "mdx",
      fields: [
        {
          name: "uri",
          type: "string",
          label: "URI",
          required: true,
          ui: {
            validate: (value) => {
              if (!value?.startsWith("http://iflastandards.info/ns/")) {
                return "URI must start with http://iflastandards.info/ns/";
              }
            },
          },
        },
        {
          ...multilingualTextField,
          name: "label",
          label: "Label",
          required: true,
        },
        {
          ...multilingualTextField,
          name: "definition",
          label: "Definition",
          ui: {
            component: "textarea",
          },
        },
        {
          ...multilingualTextField,
          name: "scopeNote",
          label: "Scope Note",
          ui: {
            component: "textarea",
          },
        },
        {
          name: "broader",
          type: "string",
          label: "Broader Terms",
          list: true,
          ui: {
            component: "relationship-picker", // Custom component
          },
        },
        {
          name: "body",
          type: "rich-text",
          label: "Additional Content",
          isBody: true,
        },
      ],
    },
  ],
};

export default defineConfig({
  branch: process.env.HEAD || "feature/tinacms-poc",
  clientId: process.env.TINA_CLIENT_ID!,
  token: process.env.TINA_TOKEN!,
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  
  schema: vocabularySchema,
});
```

### Step 2: Create Custom Field Components

Create `tina/field-components/MultilingualField.tsx`:

```tsx
import React from 'react';
import { wrapFieldsWithMeta } from 'tinacms';

const MultilingualField = wrapFieldsWithMeta(({ field, input, meta }) => {
  const [activeLanguage, setActiveLanguage] = React.useState('en');
  const languages = ['en', 'fr', 'es', 'de'];
  
  return (
    <div className="multilingual-field">
      <div className="language-tabs">
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => setActiveLanguage(lang)}
            className={activeLanguage === lang ? 'active' : ''}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
      
      <div className="language-content">
        <input
          type="text"
          value={input.value?.[activeLanguage] || ''}
          onChange={(e) => {
            input.onChange({
              ...input.value,
              [activeLanguage]: e.target.value
            });
          }}
          placeholder={`${field.label} in ${activeLanguage.toUpperCase()}`}
        />
      </div>
      
      {meta.error && <div className="error">{meta.error}</div>}
    </div>
  );
});

export default MultilingualField;
```

### Step 3: Integrate with Admin Portal

Modify `apps/admin/src/app/layout.tsx`:

```tsx
import { TinaProvider, TinaCMS } from 'tinacms';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TinaProvider>
          {children}
        </TinaProvider>
      </body>
    </html>
  );
}
```

### Step 4: Create Test Workflows

#### Workflow 1: Create New Term
```typescript
// Test creating a new vocabulary term
const testNewTerm = async () => {
  const newTerm = {
    uri: "http://iflastandards.info/ns/isbd/terms/test001",
    label: {
      en: "Test Term",
      fr: "Terme de Test"
    },
    definition: {
      en: "A term created for testing TinaCMS integration",
      fr: "Un terme créé pour tester l'intégration TinaCMS"
    }
  };
  
  // Measure time and complexity
  console.time('Create Term');
  // ... creation process ...
  console.timeEnd('Create Term');
};
```

#### Workflow 2: Edit Existing Term
```typescript
// Test editing multilingual content
const testEditTerm = async () => {
  // Load existing term
  // Make changes
  // Save and validate
  // Check Git diff
};
```

### Step 5: Performance Testing

Create `scripts/measure-tina-impact.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

// Baseline build time (without TinaCMS)
console.log('Measuring baseline build time...');
const baselineStart = Date.now();
execSync('pnpm nx build newtest', { stdio: 'inherit' });
const baselineTime = Date.now() - baselineStart;

// Install and configure TinaCMS
console.log('Setting up TinaCMS...');
execSync('pnpm add --save-dev tinacms @tinacms/cli', { stdio: 'inherit' });

// Build with TinaCMS
console.log('Measuring TinaCMS build time...');
const tinaStart = Date.now();
execSync('pnpm nx build newtest', { stdio: 'inherit' });
const tinaTime = Date.now() - tinaStart;

// Results
const increase = ((tinaTime - baselineTime) / baselineTime) * 100;
console.log(`
Build Time Impact:
- Baseline: ${baselineTime}ms
- With TinaCMS: ${tinaTime}ms
- Increase: ${increase.toFixed(2)}%
- Acceptable: ${increase < 20 ? 'YES' : 'NO'}
`);

// Bundle size impact
const baselineSize = fs.statSync('dist/newtest/main.js').size;
// ... measure with TinaCMS
```

## Testing Checklist

### Technical Validation

- [ ] **Setup**
  - [ ] TinaCMS initializes without errors
  - [ ] Schema correctly represents MDX structure
  - [ ] Git integration works

- [ ] **Editing**
  - [ ] Can create new vocabulary terms
  - [ ] Can edit existing terms
  - [ ] Multilingual fields work correctly
  - [ ] Validation rules enforce DCTAP

- [ ] **Performance**
  - [ ] Build time increase < 20%
  - [ ] Bundle size increase < 100KB
  - [ ] Editor responsiveness < 200ms

- [ ] **Integration**
  - [ ] Changes commit to Git correctly
  - [ ] MDX files maintain correct format
  - [ ] Preview functionality works
  - [ ] No conflicts with Nx build

### User Experience Testing

- [ ] **Editor Tasks**
  - [ ] Create term faster than current method
  - [ ] Edit without syntax errors
  - [ ] Switch languages easily
  - [ ] Preview changes accurately

- [ ] **Error Handling**
  - [ ] Validation messages are clear
  - [ ] Recovery from errors is simple
  - [ ] No data loss on errors

## Evaluation Framework

### Success Criteria

**Must Have**:
- ✅ Edit vocabulary MDX files
- ✅ Multilingual support
- ✅ Git integration
- ✅ Build time impact < 20%

**Should Have**:
- ⚡ Real-time preview
- ⚡ Batch operations
- ⚡ Relationship management
- ⚡ Image handling

**Nice to Have**:
- 🎯 Workflow automation
- 🎯 AI-assisted content
- 🎯 Version comparison
- 🎯 Collaborative editing

### Decision Matrix

| Criteria | Weight | TinaCMS | Custom | Hybrid |
|----------|--------|---------|---------|---------|
| Technical Fit | 30% | ? | 10 | 8 |
| User Experience | 25% | ? | 8 | 9 |
| Cost | 20% | ? | 4 | 6 |
| Maintenance | 15% | ? | 3 | 5 |
| Flexibility | 10% | ? | 10 | 7 |

## Risk Log

### Identified Risks

1. **MDX Complexity**
   - **Risk**: Frontmatter too complex for TinaCMS
   - **Test**: Create vocabulary schema
   - **Fallback**: Custom field components

2. **Performance Impact**
   - **Risk**: Significant build time increase
   - **Test**: Measure with full namespace
   - **Fallback**: Selective integration

3. **User Adoption**
   - **Risk**: Editors prefer current workflow
   - **Test**: User acceptance testing
   - **Fallback**: Optional usage

## Safe Testing Protocol

### Primary Testing (standards/newtest)
1. **Full Write Access**: All modifications on newtest site
2. **Reset Capability**: Can wipe and rebuild as needed
3. **Isolation**: No impact on production sites
4. **Test Data**: Copy sample vocabularies from live sites

### Live Site Testing (Read-Only)
When testing against live sites for real-world validation:

```typescript
// Safe testing configuration
const safeTestingConfig = {
  // Read-only mode for live sites
  liveTestSites: {
    'standards/isbdm': { mode: 'read-only', purpose: 'complexity-validation' },
    'standards/isbd': { mode: 'read-only', purpose: 'scale-testing' },
    'standards/unimarc': { mode: 'read-only', purpose: 'multilingual-testing' }
  },
  
  // Full access for test site
  testSite: {
    'standards/newtest': { mode: 'read-write', purpose: 'poc-development' }
  },
  
  // Safety checks
  beforeEdit: (site, operation) => {
    if (site !== 'standards/newtest' && operation !== 'read') {
      throw new Error('Write operations only allowed on newtest site');
    }
  }
};
```

### Data Corruption Prevention
1. **Git Branch Protection**: POC work only on feature branches
2. **No Direct Commits**: All changes through PRs
3. **Backup Before Testing**: Full backup of newtest before major changes
4. **Rollback Plan**: Git reset procedures documented

## Next Steps

### Week 1 Goals
1. Set up newtest site with sample vocabulary
2. Complete technical setup on newtest
3. Create custom components
4. Test with copied vocabulary files
5. Measure performance impact

### Week 2 Goals
1. Validate against live site structures (read-only)
2. User testing sessions on newtest
3. Document findings
4. Prepare recommendation

## Recommendation Template

After POC completion, document:

```markdown
## TinaCMS POC Results

### Technical Feasibility: [YES/NO/PARTIAL]
- MDX editing: [✅/❌]
- Performance: [✅/❌]
- Customization: [✅/❌]

### User Experience: [IMPROVED/SAME/WORSE]
- Task completion time: [X]% change
- Error rate: [X]% change
- Satisfaction: [X]/10

### Recommendation: [ADOPT/CUSTOM/HYBRID/ABANDON]
- Rationale: ...
- Next steps: ...
- Timeline: ...
- Resources: ...
```

This POC guide provides a structured approach to validate TinaCMS integration quickly and make an informed decision based on real data rather than assumptions.