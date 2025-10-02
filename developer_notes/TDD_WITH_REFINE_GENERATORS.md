# TDD with Refine.dev Code Generators

## Overview

This document explains how to integrate Test-Driven Development (TDD) with Refine.dev's code generators, maintaining our test-first philosophy while leveraging Refine's powerful scaffolding capabilities.

## Core Principle: Test the Generated Code

Refine.dev generators create boilerplate code that still needs to be tested and customized. Our approach:

1. **Write tests for expected behavior** (before generating)
2. **Generate the scaffold** (using Refine CLI)
3. **Run tests against generated code** (they should partially pass)
4. **Customize to make all tests pass** (fill in business logic)
5. **Refactor** (improve while keeping tests green)

## Workflow: TDD + Refine Generators

### Understanding Refine.dev's Role

Refine.dev generators create standard CRUD scaffolding:
- **List page**: Table with pagination, sorting, and basic actions
- **Create page**: Form with fields from your data model
- **Edit page**: Form pre-populated with existing data
- **Show page**: Read-only display of record details

The key insight: We don't need to mock the standard CRUD UI since Refine generates it. Instead, we focus on:
1. **Data contracts** (what shape the data must have)
2. **Business logic** (validation, computed fields, workflows)
3. **Customizations** (special UI requirements beyond basic CRUD)

### Step 1: Create Feature Branch & Contracts

```bash
# Create feature branch
git checkout -b feature/vocabulary-management

# Define contract first
```

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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type Vocabulary = z.infer<typeof VocabularyContract>;
```

### Step 2: Write Tests BEFORE Generating (RED)

```typescript
// apps/admin/src/app/vocabularies/__tests__/VocabularyList.test.tsx

/**
 * @unit @critical @ui
 * Tests for the Vocabulary List page that will be generated
 */
describe('VocabularyList (Pre-Generation)', () => {
  // These tests define what we expect from the generated code
  
  it('should display vocabularies in a table', async () => {
    // This will fail - component doesn't exist yet
    render(
      <RefineProvider dataProvider={mockDataProvider}>
        <VocabularyList />
      </RefineProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Dublin Core')).toBeInTheDocument();
      expect(screen.getByText('SKOS')).toBeInTheDocument();
    });
  });

  it('should have create button with proper permissions', () => {
    // This will fail - no component yet
    const { getByRole } = render(
      <RefineProvider dataProvider={mockDataProvider}>
        <VocabularyList canCreate={true} />
      </RefineProvider>
    );
    
    expect(getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('should filter vocabularies by status', async () => {
    // This will fail - no filtering yet
    const { getByRole, queryByText } = render(
      <RefineProvider dataProvider={mockDataProvider}>
        <VocabularyList />
      </RefineProvider>
    );
    
    // Select 'published' filter
    fireEvent.change(getByRole('combobox', { name: /status/i }), {
      target: { value: 'published' }
    });
    
    await waitFor(() => {
      expect(queryByText('Draft Vocabulary')).not.toBeInTheDocument();
      expect(getByText('Published Vocabulary')).toBeInTheDocument();
    });
  });

  it('should validate vocabulary data with contract', () => {
    // This will fail - no validation yet
    const invalidVocab = { name: 'Test' }; // Missing required fields
    expect(() => VocabularyContract.parse(invalidVocab)).toThrow();
  });
});
```

```typescript
// apps/admin/src/app/vocabularies/__tests__/VocabularyCreate.test.tsx

describe('VocabularyCreate (Pre-Generation)', () => {
  it('should validate form fields before submission', async () => {
    // This will fail - form doesn't exist
    const { getByLabelText, getByRole } = render(
      <RefineProvider dataProvider={mockDataProvider}>
        <VocabularyCreate />
      </RefineProvider>
    );
    
    // Try to submit empty form
    fireEvent.click(getByRole('button', { name: /save/i }));
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/namespace is required/i)).toBeInTheDocument();
    });
  });

  it('should submit valid vocabulary data', async () => {
    const createSpy = jest.fn().mockResolvedValue({ data: mockVocabulary });
    const mockProvider = {
      ...mockDataProvider,
      create: createSpy
    };
    
    const { getByLabelText, getByRole } = render(
      <RefineProvider dataProvider={mockProvider}>
        <VocabularyCreate />
      </RefineProvider>
    );
    
    // Fill form
    fireEvent.change(getByLabelText(/name/i), {
      target: { value: 'Test Vocabulary' }
    });
    fireEvent.change(getByLabelText(/namespace/i), {
      target: { value: 'http://example.org/vocab' }
    });
    
    // Submit
    fireEvent.click(getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith('vocabularies', {
        data: expect.objectContaining({
          name: 'Test Vocabulary',
          namespace: 'http://example.org/vocab'
        })
      });
    });
  });
});
```

### Step 3: Generate Refine Scaffold (Partial GREEN)

```bash
# Generate CRUD pages with Refine CLI
npx refine create resource vocabularies

# This creates:
# - apps/admin/src/app/vocabularies/page.tsx (list)
# - apps/admin/src/app/vocabularies/create/page.tsx
# - apps/admin/src/app/vocabularies/edit/[id]/page.tsx
# - apps/admin/src/app/vocabularies/show/[id]/page.tsx
```

### Step 4: Run Tests Against Generated Code

```bash
# Some tests will pass (basic structure)
# Some will fail (custom business logic)
pnpm nx test admin --testFile=VocabularyList.test.tsx

# Results:
# ✓ Component renders (Refine provides this)
# ✗ Custom filtering (needs implementation)
# ✗ Contract validation (needs implementation)
# ✗ Permission checks (needs implementation)
```

### Step 5: Enhance Generated Code to Pass All Tests (Full GREEN)

```typescript
// apps/admin/src/app/vocabularies/page.tsx
// Enhanced version of generated code

"use client";

import { List, useTable, FilterDropdown } from "@refinedev/antd";
import { Table, Space, Button, Select, Tag } from "antd";
import { VocabularyContract } from "@/packages/contracts";
import { usePermissions } from "@/hooks/usePermissions";

export default function VocabularyList() {
  const { can } = usePermissions();
  const { tableProps, filters } = useTable({
    resource: "vocabularies",
    filters: {
      initial: [
        {
          field: "status",
          operator: "eq",
          value: "published"
        }
      ]
    },
    // Add contract validation
    dataProviderName: "default",
    queryOptions: {
      select: (data) => ({
        ...data,
        // Validate each item with contract
        data: data.data.map(item => VocabularyContract.parse(item))
      })
    }
  });

  return (
    <List
      canCreate={can('create', 'vocabularies')}
      createButtonProps={{
        children: "Create Vocabulary"
      }}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="prefix" title="Prefix" />
        <Table.Column dataIndex="namespace" title="Namespace" />
        <Table.Column 
          dataIndex="status" 
          title="Status"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                style={{ minWidth: 200 }}
                placeholder="Select Status"
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                  { label: "Deprecated", value: "deprecated" }
                ]}
              />
            </FilterDropdown>
          )}
          render={(status) => (
            <Tag color={
              status === 'published' ? 'green' : 
              status === 'draft' ? 'orange' : 
              'red'
            }>
              {status}
            </Tag>
          )}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              {can('delete', 'vocabularies') && (
                <DeleteButton hideText size="small" recordItemId={record.id} />
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
```

```typescript
// apps/admin/src/app/vocabularies/create/page.tsx
// Enhanced create form with validation

"use client";

import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { VocabularyContract } from "@/packages/contracts";

export default function VocabularyCreate() {
  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "vocabularies",
    // Add contract validation before submission
    onSubmit: async (values) => {
      try {
        // Validate with contract
        const validated = VocabularyContract.parse({
          ...values,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current-user-id' // Get from auth context
        });
        
        // Submit validated data
        return onFinish(validated);
      } catch (error) {
        // Show validation errors
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            form.setFields([{
              name: err.path,
              errors: [err.message]
            }]);
          });
        }
        throw error;
      }
    }
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: "Name is required" },
            { max: 100, message: "Name must be less than 100 characters" }
          ]}
        >
          <Input placeholder="e.g., Dublin Core" />
        </Form.Item>

        <Form.Item
          label="Prefix"
          name="prefix"
          rules={[
            { required: true, message: "Prefix is required" },
            { pattern: /^[a-z]+$/, message: "Prefix must be lowercase letters only" }
          ]}
        >
          <Input placeholder="e.g., dc" />
        </Form.Item>

        <Form.Item
          label="Namespace"
          name="namespace"
          rules={[
            { required: true, message: "Namespace is required" },
            { type: "url", message: "Must be a valid URL" }
          ]}
        >
          <Input placeholder="e.g., http://purl.org/dc/terms/" />
        </Form.Item>

        <Form.Item
          label="Version"
          name="version"
          rules={[
            { required: true, message: "Version is required" },
            { pattern: /^\d+\.\d+\.\d+$/, message: "Must be semantic version (e.g., 1.0.0)" }
          ]}
        >
          <Input placeholder="e.g., 1.0.0" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          initialValue="draft"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="published">Published</Select.Option>
            <Select.Option value="deprecated">Deprecated</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Create>
  );
}
```

### Step 6: Refactor for Better Structure (REFACTOR)

```typescript
// Extract reusable components
// apps/admin/src/components/vocabularies/VocabularyForm.tsx

import { Form, Input, Select } from "antd";
import { VocabularyContract } from "@/packages/contracts";

export const VocabularyForm: FC<{ form: FormInstance }> = ({ form }) => {
  const validateWithContract = (field: string) => ({
    validator: async (_: any, value: any) => {
      try {
        // Validate individual field with contract
        const partialSchema = VocabularyContract.pick({ [field]: true });
        partialSchema.parse({ [field]: value });
        return Promise.resolve();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return Promise.reject(error.errors[0].message);
        }
        return Promise.reject(error);
      }
    }
  });

  return (
    <>
      <Form.Item
        label="Name"
        name="name"
        rules={[
          { required: true },
          validateWithContract('name')
        ]}
      >
        <Input placeholder="e.g., Dublin Core" />
      </Form.Item>
      {/* Other fields... */}
    </>
  );
};

// Extract status tag component
// apps/admin/src/components/vocabularies/VocabularyStatusTag.tsx

export const VocabularyStatusTag: FC<{ status: string }> = ({ status }) => {
  const colors = {
    published: 'green',
    draft: 'orange',
    deprecated: 'red'
  };

  return (
    <Tag color={colors[status] || 'default'}>
      {status.toUpperCase()}
    </Tag>
  );
};
```

## Generator + TDD Patterns

### Pattern 1: Test Generator Output Assumptions

```typescript
// Test that generated code meets our standards
describe('Generated Vocabulary Pages', () => {
  it('should use our data provider', () => {
    const { container } = render(<VocabularyList />);
    // Verify it's using our configured provider
    expect(mockDataProvider.getList).toHaveBeenCalledWith(
      'vocabularies',
      expect.any(Object)
    );
  });

  it('should apply our theme', () => {
    const { container } = render(<VocabularyList />);
    // Check for Ant Design components with our theme
    expect(container.querySelector('.ant-table')).toHaveClass('compact');
  });
});
```

### Pattern 2: Test Custom Business Logic

```typescript
// Test business logic added to generated code
describe('Vocabulary Business Rules', () => {
  it('should prevent publishing draft with errors', async () => {
    const vocabulary = {
      ...mockVocabulary,
      status: 'draft',
      namespace: 'invalid-url' // Invalid
    };

    const { getByRole } = render(
      <VocabularyEdit vocabulary={vocabulary} />
    );

    const publishButton = getByRole('button', { name: /publish/i });
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText(/fix validation errors/i)).toBeInTheDocument();
    });
  });

  it('should auto-generate prefix from name', () => {
    const { getByLabelText } = render(<VocabularyCreate />);
    
    fireEvent.change(getByLabelText(/name/i), {
      target: { value: 'Dublin Core Terms' }
    });

    // Should auto-fill prefix
    expect(getByLabelText(/prefix/i)).toHaveValue('dcterms');
  });
});
```

### Pattern 3: Test Enhanced Features

```typescript
// Test features added beyond basic CRUD
describe('Enhanced Vocabulary Features', () => {
  it('should validate RDF namespace uniqueness', async () => {
    server.use(
      http.get('/api/vocabularies/check-namespace', () => {
        return HttpResponse.json({ exists: true });
      })
    );

    const { getByLabelText, getByText } = render(<VocabularyCreate />);
    
    fireEvent.change(getByLabelText(/namespace/i), {
      target: { value: 'http://existing.namespace.org' }
    });

    await waitFor(() => {
      expect(getByText(/namespace already exists/i)).toBeInTheDocument();
    });
  });

  it('should show related terms count', async () => {
    const { getByTestId } = render(
      <VocabularyShow vocabularyId="123" />
    );

    await waitFor(() => {
      expect(getByTestId('terms-count')).toHaveTextContent('42 terms');
    });
  });
});
```

## Refine CLI Commands with TDD

### Before Running Generator

```bash
# 1. Write tests for expected behavior
pnpm nx test admin --testFile=VocabularyList.test.tsx --watch

# 2. See tests fail (RED)
# ✗ VocabularyList › should display vocabularies
```

### Run Generator

```bash
# 3. Generate scaffold
npx refine create resource vocabularies

# Or with specific options
npx refine create resource vocabularies \
  --actions list,create,edit,show,delete \
  --path /vocabularies
```

### After Generation

```bash
# 4. Run tests again - some pass, some fail
pnpm nx test admin --testFile=VocabularyList.test.tsx

# Results:
# ✓ Basic rendering (from generator)
# ✗ Custom validations (need to add)
# ✗ Business logic (need to add)
```

### Customize Until Green

```bash
# 5. Keep running tests while customizing
pnpm nx test admin --testFile=VocabularyList.test.tsx --watch

# All tests passing:
# ✓ VocabularyList › should display vocabularies
# ✓ VocabularyList › should filter by status
# ✓ VocabularyList › should validate with contract
```

## Integration with MSW

### Mock Service Worker Tests for Generated Code

```typescript
// apps/admin/src/mocks/handlers/vocabularies.ts

export const vocabularyHandlers = [
  http.get('/api/vocabularies', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    let filtered = mockVocabularies;
    if (status) {
      filtered = mockVocabularies.filter(v => v.status === status);
    }
    
    return HttpResponse.json({
      data: filtered,
      total: filtered.length
    });
  }),

  http.post('/api/vocabularies', async ({ request }) => {
    const data = await request.json();
    
    // Validate with contract
    try {
      const validated = VocabularyContract.parse({
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return HttpResponse.json({ data: validated });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      );
    }
  })
];
```

## Best Practices

### 1. Test First, Generate Second

```typescript
// Write behavior tests
describe('Expected Behavior', () => {
  it('should do X', () => { /* ... */ });
});

// Generate scaffold
// npx refine create resource

// Enhance to pass tests
```

### 2. Validate Generated Code

```typescript
// Always test that generated code uses your patterns
it('should use contract validation', () => {
  // Verify generated code validates data
});

it('should respect RBAC', () => {
  // Verify generated code checks permissions
});
```

### 3. Progressive Enhancement

```typescript
// Level 1: Basic CRUD (from generator)
// Level 2: Add validation
// Level 3: Add business logic
// Level 4: Add advanced features

// Test each level independently
describe('Level 1: Basic CRUD', () => { /* ... */ });
describe('Level 2: Validation', () => { /* ... */ });
describe('Level 3: Business Logic', () => { /* ... */ });
```

### 4. Keep Generator Output Recognizable

```typescript
// Mark sections clearly
export default function VocabularyList() {
  // --- GENERATED CODE START ---
  const { tableProps } = useTable({
    resource: "vocabularies"
  });
  // --- GENERATED CODE END ---

  // --- CUSTOM ENHANCEMENTS START ---
  const { can } = usePermissions();
  const validateData = (data) => {
    return data.map(item => VocabularyContract.parse(item));
  };
  // --- CUSTOM ENHANCEMENTS END ---

  return (/* ... */);
}
```

## Checklist: TDD with Refine Generators

Before generating:
- [ ] Created feature branch
- [ ] Defined Zod contracts
- [ ] Written behavior tests
- [ ] Tests are failing (RED)

During generation:
- [ ] Run generator command
- [ ] Verify generated file locations
- [ ] Run tests against generated code
- [ ] Identify what needs customization

After generation:
- [ ] Add contract validation
- [ ] Add permission checks
- [ ] Add business logic
- [ ] All tests passing (GREEN)
- [ ] Refactor for clarity
- [ ] Extract reusable components
- [ ] Document customizations

## Common Pitfalls and Solutions

### Pitfall 1: Over-customizing Generated Code

**Problem**: Making so many changes that regeneration becomes impossible

**Solution**: Keep customizations in separate files/components
```typescript
// Keep generated structure
export default function VocabularyList() {
  return <CustomVocabularyList />;
}

// All customizations in separate component
export const CustomVocabularyList = () => {
  // Your enhanced implementation
};
```

### Pitfall 2: Not Testing Generated Defaults

**Problem**: Assuming generated code works correctly

**Solution**: Write tests for generator assumptions
```typescript
it('should use correct resource name', () => {
  // Verify generator used right resource
});

it('should include all CRUD actions', () => {
  // Verify all actions were generated
});
```

### Pitfall 3: Skipping Contract Validation

**Problem**: Generated code doesn't validate data

**Solution**: Always add contract validation
```typescript
const { data } = await dataProvider.getList('vocabularies');
// Always validate
const validated = data.map(item => VocabularyContract.parse(item));
```

## Summary

The integration of TDD with Refine.dev generators follows this flow:

1. **Define contracts** (Zod schemas)
2. **Write tests** for expected behavior (RED)
3. **Generate scaffold** with Refine CLI
4. **Run tests** to see what passes/fails
5. **Enhance generated code** to pass all tests (GREEN)
6. **Refactor** for better structure (REFACTOR)
7. **Document** customizations for team

This approach gives us:
- Speed from generators
- Quality from TDD
- Confidence from tests
- Maintainability from clear structure