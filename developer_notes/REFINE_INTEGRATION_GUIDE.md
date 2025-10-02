# Refine.dev Integration Guide - Contract to UI Generation

## Overview

This guide consolidates the Refine.dev patterns from multiple documents to create a unified approach for contract-driven UI generation in the admin app.

## 🎯 The Complete Pattern: Contract → MSW → Inferencer → UI

### Core Insight
Instead of manually writing UI components, we:
1. Define Zod contracts (source of truth)
2. Create MSW handlers that return contract-compliant data
3. Use Refine's Inferencer to analyze the MSW responses
4. Generate accurate UI that matches our contracts
5. Customize only what's needed beyond standard CRUD

## 📝 Step-by-Step Implementation

### Step 1: Define the Contract First

```typescript
// packages/contracts/src/Vocabulary.zod.ts
export const VocabularyContract = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  namespace: z.string().url(),
  prefix: z.string().regex(/^[a-z]+$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  status: z.enum(['draft', 'published', 'deprecated']),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

// Derived schemas for operations
export const VocabularyCreateInput = VocabularyContract.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const VocabularyUpdateInput = VocabularyCreateInput.partial();
```

### Step 2: Generate Resource Metadata from Contract

```typescript
// packages/contracts/src/utils/generateResourceMeta.ts
import { z } from 'zod';

export function generateResourceMeta(contract: z.ZodObject<any>, resourceName: string) {
  const shape = contract.shape;
  const fields: Record<string, any> = {};
  
  for (const [key, zodType] of Object.entries(shape)) {
    fields[key] = {
      type: inferFieldType(zodType),
      label: formatLabel(key),
      required: !zodType.isOptional(),
      component: inferUIComponent(zodType),
      validation: extractValidationRules(zodType),
      ...inferFieldMeta(key, zodType)
    };
  }
  
  return {
    contract,
    fields,
    inferencer: {
      excludeFields: ['id', 'createdAt', 'updatedAt', 'createdBy'],
      fieldOverrides: generateFieldOverrides(fields),
    },
    permissions: {
      list: ['admin', 'editor', 'viewer'],
      create: ['admin', 'editor'],
      edit: ['admin', 'editor'],
      delete: ['admin']
    }
  };
}

function inferUIComponent(zodType: any): string {
  if (zodType instanceof z.ZodString) {
    const checks = zodType._def.checks || [];
    
    if (checks.some(c => c.kind === 'email')) return 'EmailInput';
    if (checks.some(c => c.kind === 'url')) return 'UrlInput';
    if (checks.some(c => c.kind === 'max' && c.value > 200)) return 'TextArea';
    
    return 'Input';
  }
  if (zodType instanceof z.ZodEnum) return 'Select';
  if (zodType instanceof z.ZodBoolean) return 'Switch';
  if (zodType instanceof z.ZodArray) return 'TagInput';
  
  return 'Input';
}
```

### Step 3: Create MSW Handlers with Contract Data

```typescript
// apps/admin/src/mocks/handlers/vocabularies.ts
import { http, HttpResponse } from 'msw';
import { VocabularyContract } from '@/packages/contracts';
import { createMockVocabulary } from '../fixtures/vocabularies';

export const vocabularyHandlers = [
  // LIST - returns array matching contract exactly
  http.get('/api/vocabularies', () => {
    const mockVocabularies = [
      createMockVocabulary({ status: 'published' }),
      createMockVocabulary({ status: 'draft' }),
      createMockVocabulary({ status: 'deprecated' }),
    ];
    
    return HttpResponse.json({
      data: mockVocabularies,
      total: mockVocabularies.length,
    });
  }),

  // CREATE - validates against contract
  http.post('/api/vocabularies', async ({ request }) => {
    const body = await request.json();
    
    try {
      const validated = VocabularyCreateInput.parse(body);
      const created = VocabularyContract.parse({
        ...validated,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user-id',
      });
      
      return HttpResponse.json({ data: created });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      );
    }
  }),
];
```

### Step 4: Configure Refine with Inferencer

```typescript
// apps/admin/src/app/layout.tsx
import { Refine } from "@refinedev/core";
import { AntdInferencer } from "@refinedev/inferencer/antd";
import { generateResourceMeta } from '@/packages/contracts/utils';
import { VocabularyContract } from '@/packages/contracts';

const vocabularyMeta = generateResourceMeta(VocabularyContract, 'vocabularies');

export default function AdminLayout() {
  return (
    <Refine
      dataProvider={mockDataProvider} // Uses MSW in development
      resources={[
        {
          name: "vocabularies",
          meta: vocabularyMeta,
          // Inferencer analyzes MSW responses to generate UI
          list: AntdInferencer,
          create: AntdInferencer,
          edit: AntdInferencer,
          show: AntdInferencer,
        }
      ]}
    />
  );
}
```

### Step 5: Capture and Customize Generated Code

```bash
# After Inferencer generates the UI, capture the code
npx refine swizzle

# Select the components to export:
# - VocabularyList
# - VocabularyCreate  
# - VocabularyEdit
# - VocabularyShow
```

### Step 6: Apply TDD to Customizations

```typescript
// Write tests for customizations BEFORE implementing
describe('VocabularyList Customizations @unit', () => {
  it('should highlight deprecated vocabularies', () => {
    // Test will fail until we add the highlighting
    const { container } = render(<VocabularyList />);
    const deprecatedRow = container.querySelector('[data-status="deprecated"]');
    expect(deprecatedRow).toHaveClass('deprecated-highlight');
  });
  
  it('should show bulk actions for editors', () => {
    // Test will fail until we add bulk actions
    mockUser({ role: 'editor' });
    const { getByText } = render(<VocabularyList />);
    expect(getByText('Bulk Delete')).toBeInTheDocument();
  });
});
```

## 🔄 The Complete TDD + Refine Workflow

### RED Phase (Write Failing Tests)
```typescript
// 1. Test the contract
it('should validate vocabulary data', () => {
  expect(() => VocabularyContract.parse(invalidData)).toThrow();
});

// 2. Test the MSW handler
it('should return contract-compliant data', async () => {
  const response = await fetch('/api/vocabularies');
  const data = await response.json();
  expect(() => VocabularyContract.array().parse(data.data)).not.toThrow();
});

// 3. Test the UI will display data
it('should render vocabulary list', () => {
  render(<VocabularyList />);
  // This fails - component doesn't exist yet
});
```

### GREEN Phase (Generate & Customize)
```typescript
// 1. Use Inferencer to generate UI
<AntdInferencer resource="vocabularies" action="list" />

// 2. Capture generated code
npx refine swizzle

// 3. Add minimal customizations to pass tests
export const VocabularyList = () => {
  // Generated code + minimal additions
};
```

### REFACTOR Phase (Improve)
```typescript
// Extract reusable components
// Add proper types
// Improve performance
// Enhance UX
```

## 📊 Decision Matrix: When to Use Inferencer

### Use Inferencer When:
- ✅ Standard CRUD operations
- ✅ Fields map directly to form inputs
- ✅ Less than 20 fields
- ✅ Standard table/form layout works
- ✅ Rapid prototyping needed

### Skip Inferencer When:
- ❌ Complex multi-step forms
- ❌ Custom layouts required
- ❌ Non-CRUD workflows
- ❌ Heavy business logic in UI
- ❌ Complex field dependencies

## 🎯 Key Benefits

1. **Contract-Driven**: UI always matches data contracts
2. **Type-Safe**: End-to-end type safety from contract to UI
3. **Fast Development**: Generate 80% of CRUD automatically
4. **TDD Compatible**: Test behavior, generate implementation
5. **Maintainable**: Changes to contract cascade through system

## 📚 Related Documents

- `REFINE_INFERENCER_WORKFLOW.md` - Detailed Inferencer patterns
- `REFINE_RESOURCE_METADATA_PATTERN.md` - Metadata generation
- `REFINE_SCAFFOLD_ENHANCER.md` - Enhancement strategies
- `TDD_WITH_REFINE_GENERATORS.md` - TDD integration
- `AUTOMATED_TDD_WORKFLOW.md` - Overall TDD methodology

## ✅ Checklist for Every CRUD Feature

- [ ] Define Zod contract first
- [ ] Generate resource metadata from contract
- [ ] Create MSW handlers with contract data
- [ ] Write tests for expected behavior (RED)
- [ ] Use Inferencer to generate UI
- [ ] Capture generated code with swizzle
- [ ] Customize to pass tests (GREEN)
- [ ] Refactor for quality (REFACTOR)
- [ ] Verify contract validation throughout