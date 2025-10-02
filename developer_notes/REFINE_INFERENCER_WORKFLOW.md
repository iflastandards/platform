# Refine Inferencer Workflow - Contract to UI Generation

## Overview

Refine's Inferencer package can analyze API responses and automatically generate matching UI components. This means we can leverage our Zod contracts and MSW mocks to generate accurate scaffolds WITHOUT manual customization.

## The Complete Flow: Contracts → MSW → Inferencer → UI

### Step 1: Define Zod Contract (Source of Truth)

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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type Vocabulary = z.infer<typeof VocabularyContract>;
```

### Step 2: Create MSW Handler with Contract-Based Data

```typescript
// apps/admin/src/mocks/handlers/vocabularies.ts
import { http, HttpResponse } from 'msw';
import { VocabularyContract } from '@/packages/contracts';

const mockVocabularies: Vocabulary[] = [
  {
    id: '1',
    name: 'Dublin Core',
    description: 'Dublin Core Metadata Element Set',
    namespace: 'http://purl.org/dc/elements/1.1/',
    prefix: 'dc',
    version: '1.1.0',
    status: 'published',
    tags: ['metadata', 'standard'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    createdBy: 'user-1',
  },
  // ... more mock data matching the contract exactly
];

export const vocabularyHandlers = [
  // LIST endpoint - returns array matching contract
  http.get('/api/vocabularies', () => {
    return HttpResponse.json({
      data: mockVocabularies,
      total: mockVocabularies.length,
    });
  }),

  // GET single - returns one item matching contract
  http.get('/api/vocabularies/:id', ({ params }) => {
    const vocabulary = mockVocabularies.find(v => v.id === params.id);
    return HttpResponse.json({ data: vocabulary });
  }),

  // CREATE - validates against contract
  http.post('/api/vocabularies', async ({ request }) => {
    const body = await request.json();
    const validated = VocabularyContract.parse({
      ...body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
    });
    return HttpResponse.json({ data: validated });
  }),
];
```

### Step 3: Configure Resource with Inferencer

```typescript
// apps/admin/src/app/layout.tsx or App.tsx
import { Refine } from "@refinedev/core";
import { AntdInferencer } from "@refinedev/inferencer/antd";

export default function AdminLayout() {
  return (
    <Refine
      dataProvider={mockDataProvider} // Uses MSW in dev
      resources={[
        {
          name: "vocabularies",
          list: "/vocabularies",
          create: "/vocabularies/create",
          edit: "/vocabularies/edit/:id",
          show: "/vocabularies/show/:id",
          meta: {
            // Additional hints for Inferencer
            inferencer: {
              fieldTransforms: {
                // Tell Inferencer how to handle specific fields
                status: { 
                  component: "Select",
                  options: ['draft', 'published', 'deprecated']
                },
                tags: { 
                  component: "Select", 
                  mode: "tags" 
                },
                description: { 
                  component: "TextArea" 
                },
                namespace: { 
                  component: "Input",
                  validation: "url"
                },
              }
            }
          }
        }
      ]}
    />
  );
}
```

### Step 4: Use Inferencer to Generate Initial Components

```typescript
// apps/admin/src/app/vocabularies/page.tsx
"use client";

import { AntdInferencer } from "@refinedev/inferencer/antd";

// During development - Inferencer analyzes API response
export default function VocabularyList() {
  return (
    <AntdInferencer 
      resource="vocabularies"
      action="list"
      // Inferencer will:
      // 1. Call GET /api/vocabularies (handled by MSW)
      // 2. Analyze the response structure
      // 3. Generate a table with appropriate columns
      // 4. Show you the generated code
    />
  );
}
```

```typescript
// apps/admin/src/app/vocabularies/create/page.tsx
"use client";

import { AntdInferencer } from "@refinedev/inferencer/antd";

export default function VocabularyCreate() {
  return (
    <AntdInferencer 
      resource="vocabularies"
      action="create"
      // Inferencer will:
      // 1. Call GET /api/vocabularies/:id for field structure
      // 2. Generate form fields based on data types
      // 3. Add appropriate validation
      // 4. Show the generated code
    />
  );
}
```

### Step 5: Copy Generated Code and Customize

After Inferencer generates the code, it shows a "Show Code" button. Click it to see the generated component:

```typescript
// Generated by Inferencer (example)
export const VocabularyList: React.FC = () => {
  const { tableProps } = useTable<Vocabulary>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column 
          dataIndex="status" 
          title="Status"
          render={(value) => <Tag>{value}</Tag>}
        />
        <Table.Column dataIndex="namespace" title="Namespace" />
        <Table.Column dataIndex="prefix" title="Prefix" />
        <Table.Column dataIndex="version" title="Version" />
        <Table.Column
          dataIndex="tags"
          title="Tags"
          render={(value: string[]) => (
            <>
              {value?.map((tag) => <Tag key={tag}>{tag}</Tag>)}
            </>
          )}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
```

### Step 6: Add Contract Validation to Generated Code

```typescript
// Enhanced with contract validation
export const VocabularyList: React.FC = () => {
  const { tableProps } = useTable<Vocabulary>({
    syncWithLocation: true,
    queryOptions: {
      // Validate API response with contract
      select: (data) => ({
        ...data,
        data: data.data.map(item => VocabularyContract.parse(item))
      })
    }
  });

  // Rest of generated code...
};
```

## Complete Workflow with Inferencer

### Development Phase:

1. **Define Contract** (Zod schema)
2. **Create MSW handlers** returning contract-compliant data
3. **Add resource** to Refine configuration
4. **Use Inferencer** components initially
5. **Copy generated code** when ready
6. **Add validation & business logic**
7. **Write tests** for customizations

### The Key Insight:

**MSW + Inferencer = Contract-Driven UI Generation**

By having MSW return data that exactly matches our Zod contracts, the Inferencer generates UI that matches our data model perfectly!

## Resource Configuration with Metadata

```typescript
// Advanced resource configuration
const resources = [
  {
    name: "vocabularies",
    list: "/vocabularies",
    create: "/vocabularies/create",
    edit: "/vocabularies/edit/:id",
    show: "/vocabularies/show/:id",
    meta: {
      label: "Vocabulary Management",
      icon: <BookOutlined />,
      
      // Contract reference
      contract: VocabularyContract,
      
      // Field metadata for Inferencer
      fields: {
        name: {
          required: true,
          maxLength: 100,
          placeholder: "Enter vocabulary name"
        },
        status: {
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Deprecated", value: "deprecated" }
          ]
        },
        tags: {
          type: "tags",
          placeholder: "Add tags..."
        },
        description: {
          type: "textarea",
          rows: 4
        },
        namespace: {
          type: "url",
          validation: {
            pattern: /^https?:\/\/.+/,
            message: "Must be a valid URL"
          }
        }
      },
      
      // RBAC configuration
      permissions: {
        list: ["admin", "editor", "viewer"],
        create: ["admin", "editor"],
        edit: ["admin", "editor"],
        delete: ["admin"]
      },
      
      // API configuration
      api: {
        path: "/api/vocabularies",
        timeout: 5000
      }
    }
  }
];
```

## Testing with Inferencer

```typescript
// Test that Inferencer generates correct UI from contract
describe('Vocabulary Inferencer', () => {
  it('should generate form fields matching contract', async () => {
    // MSW returns contract-compliant data
    const { container } = render(
      <Refine dataProvider={mockDataProvider} resources={[...]}>
        <AntdInferencer resource="vocabularies" action="create" />
      </Refine>
    );

    // Wait for Inferencer to analyze and generate
    await waitFor(() => {
      // Check all contract fields are present
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/namespace/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/prefix/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/version/i)).toBeInTheDocument();
    });
  });

  it('should infer correct field types from API response', async () => {
    render(<AntdInferencer resource="vocabularies" action="create" />);

    await waitFor(() => {
      // Status should be a select
      const statusField = screen.getByLabelText(/status/i);
      expect(statusField.tagName).toBe('SELECT');

      // Description should be textarea
      const descField = screen.getByLabelText(/description/i);
      expect(descField.tagName).toBe('TEXTAREA');
    });
  });
});
```

## Benefits of This Approach

1. **Contract-Driven**: Zod schemas drive everything
2. **Automatic UI Generation**: Inferencer creates UI from API responses
3. **Type Safety**: TypeScript types flow from contract to UI
4. **Rapid Prototyping**: See working UI immediately
5. **Progressive Enhancement**: Start with generated, add custom logic
6. **Test Coverage**: MSW ensures consistent data during development

## Migration Path

### Phase 1: Use Inferencer for New Features
- Start using Inferencer for all new resources
- Keep existing manual components

### Phase 2: Document Patterns
- Document how to configure metadata
- Create examples of field transforms

### Phase 3: Retrofit Existing Features
- Gradually replace manual components with Inferencer-generated ones
- Add contract validation throughout

### Phase 4: Automation
- Create scripts to generate resource configs from contracts
- Automate MSW handler creation from contracts

## Commands

```bash
# Install Inferencer
pnpm add @refinedev/inferencer

# Development workflow
pnpm dev              # Start with MSW
# Navigate to resource pages
# Inferencer analyzes and generates UI
# Click "Show Code" to copy generated component
# Replace Inferencer with generated code
# Add customizations
```

## Key Takeaways

1. **Inferencer needs live data** - That's why MSW is critical
2. **MSW data must match contracts** - This ensures accurate generation
3. **Metadata enhances inference** - Use meta property for hints
4. **Generated code is a starting point** - Always add validation and business logic
5. **Keep Inferencer in development** - Replace with real components for production