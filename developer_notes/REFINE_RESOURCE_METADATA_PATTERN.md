# Refine Resource Metadata Pattern - Contract-Driven Configuration

## Overview

The `meta` property in Refine's resource configuration is our bridge between Zod contracts and UI generation. By enriching resource definitions with contract-derived metadata, we get precise scaffolding that matches our type-safe requirements.

## Core Pattern: Contract → Metadata → Inferencer → UI

### Step 1: Define the Contract (Source of Truth)

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
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type Vocabulary = z.infer<typeof VocabularyContract>;

// Derive input schemas for operations
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
      ...inferFieldMeta(key, zodType)
    };
  }
  
  return {
    contract,
    fields,
    // Additional metadata for Inferencer
    inferencer: {
      excludeFields: ['id', 'createdAt', 'updatedAt', 'createdBy'],
      fieldOverrides: generateFieldOverrides(fields),
    },
    // RBAC hints
    permissions: {
      list: ['admin', 'editor', 'viewer'],
      create: ['admin', 'editor'],
      edit: ['admin', 'editor'],
      delete: ['admin']
    },
    // API configuration
    api: {
      path: `/api/${resourceName}`,
      timeout: 5000
    }
  };
}

function inferFieldType(zodType: any): string {
  if (zodType instanceof z.ZodString) {
    const checks = zodType._def.checks || [];
    if (checks.some(c => c.kind === 'email')) return 'email';
    if (checks.some(c => c.kind === 'url')) return 'url';
    if (checks.some(c => c.kind === 'max' && c.value > 255)) return 'longtext';
    return 'text';
  }
  if (zodType instanceof z.ZodNumber) return 'number';
  if (zodType instanceof z.ZodBoolean) return 'boolean';
  if (zodType instanceof z.ZodDate) return 'date';
  if (zodType instanceof z.ZodEnum) return 'select';
  if (zodType instanceof z.ZodArray) return 'array';
  if (zodType instanceof z.ZodObject) return 'object';
  return 'text';
}

function inferFieldMeta(key: string, zodType: any) {
  const meta: any = {};
  
  // String validations
  if (zodType instanceof z.ZodString) {
    const checks = zodType._def.checks || [];
    const minCheck = checks.find(c => c.kind === 'min');
    const maxCheck = checks.find(c => c.kind === 'max');
    const regexCheck = checks.find(c => c.kind === 'regex');
    
    if (minCheck) meta.minLength = minCheck.value;
    if (maxCheck) meta.maxLength = maxCheck.value;
    if (regexCheck) meta.pattern = regexCheck.regex.source;
    
    // UI component hints
    if (maxCheck && maxCheck.value > 255) {
      meta.component = 'TextArea';
      meta.rows = 4;
    } else if (checks.some(c => c.kind === 'url')) {
      meta.component = 'Input';
      meta.addonBefore = 'https://';
    } else {
      meta.component = 'Input';
    }
  }
  
  // Enum options
  if (zodType instanceof z.ZodEnum) {
    meta.component = 'Select';
    meta.options = zodType._def.values.map(value => ({
      label: formatLabel(value),
      value
    }));
  }
  
  // Boolean
  if (zodType instanceof z.ZodBoolean) {
    meta.component = 'Switch';
  }
  
  // Array
  if (zodType instanceof z.ZodArray) {
    meta.component = 'Select';
    meta.mode = 'tags';
  }
  
  // Special field handling
  if (key === 'metadata' || key === 'config') {
    meta.component = 'JsonEditor';
  }
  
  return meta;
}

function generateFieldOverrides(fields: Record<string, any>) {
  const overrides: Record<string, any> = {};
  
  for (const [key, field] of Object.entries(fields)) {
    if (field.component) {
      overrides[key] = {
        component: field.component,
        props: {
          placeholder: field.placeholder || `Enter ${field.label}`,
          ...field
        }
      };
    }
  }
  
  return overrides;
}
```

### Step 3: Create Central Resource Configuration

```typescript
// apps/admin/src/config/resources.ts
import { VocabularyContract } from '@/packages/contracts';
import { generateResourceMeta } from '@/packages/contracts/utils';

export const vocabularyResource = {
  name: 'vocabularies',
  identifier: 'vocabulary',
  list: '/vocabularies',
  create: '/vocabularies/create',
  edit: '/vocabularies/edit/:id',
  show: '/vocabularies/show/:id',
  meta: {
    ...generateResourceMeta(VocabularyContract, 'vocabularies'),
    
    // Custom overrides specific to this resource
    label: 'Vocabulary Management',
    icon: 'BookOutlined',
    
    // Table configuration
    table: {
      defaultSort: [{ field: 'name', order: 'asc' }],
      defaultPageSize: 20,
      columnsOrder: ['name', 'prefix', 'namespace', 'status', 'version'],
      columnVisibility: {
        id: false,
        createdAt: false,
        updatedAt: false,
        createdBy: false,
      },
      columnRenderers: {
        status: {
          component: 'StatusTag',
          props: {
            colorMap: {
              draft: 'orange',
              published: 'green',
              deprecated: 'red'
            }
          }
        },
        tags: {
          component: 'TagList'
        },
        namespace: {
          component: 'Link',
          props: { external: true }
        }
      }
    },
    
    // Form configuration
    form: {
      layout: 'vertical',
      sections: [
        {
          title: 'Basic Information',
          fields: ['name', 'prefix', 'description']
        },
        {
          title: 'Technical Details',
          fields: ['namespace', 'version', 'status']
        },
        {
          title: 'Additional',
          fields: ['tags', 'isActive', 'metadata'],
          collapsible: true
        }
      ]
    },
    
    // Validation hooks
    validation: {
      onCreate: async (data) => {
        // Check namespace uniqueness
        const existing = await checkNamespaceExists(data.namespace);
        if (existing) throw new Error('Namespace already exists');
        return VocabularyCreateInput.parse(data);
      },
      onUpdate: async (data) => {
        return VocabularyUpdateInput.parse(data);
      }
    }
  }
};

// Export all resources
export const resources = [
  vocabularyResource,
  // ... other resources
];
```

### Step 4: Configure Refine with Metadata-Rich Resources

```typescript
// apps/admin/src/app/layout.tsx
import { Refine } from "@refinedev/core";
import { resources } from "@/config/resources";
import { dataProvider } from "@/providers/dataProvider";

export default function AdminLayout({ children }) {
  return (
    <Refine
      dataProvider={dataProvider}
      resources={resources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
      }}
    >
      {children}
    </Refine>
  );
}
```

### Step 5: Create Metadata-Aware Components

```typescript
// apps/admin/src/components/resource/MetadataAwareList.tsx
import { useResource } from "@refinedev/core";
import { List, useTable } from "@refinedev/antd";
import { Table, Tag } from "antd";

export const MetadataAwareList = () => {
  const { resource } = useResource();
  const meta = resource?.meta;
  
  const { tableProps } = useTable({
    resource: resource?.name,
    sorters: {
      initial: meta?.table?.defaultSort
    },
    pagination: {
      pageSize: meta?.table?.defaultPageSize || 10
    },
    queryOptions: {
      // Validate with contract
      select: (data) => ({
        ...data,
        data: data.data.map(item => meta?.contract?.parse(item) || item)
      })
    }
  });
  
  // Generate columns from metadata
  const columns = generateColumnsFromMeta(meta);
  
  return (
    <List 
      title={meta?.label}
      canCreate={userHasPermission('create', meta?.permissions)}
    >
      <Table {...tableProps} columns={columns} rowKey="id" />
    </List>
  );
};

function generateColumnsFromMeta(meta: any) {
  if (!meta?.fields) return [];
  
  const columnsOrder = meta.table?.columnsOrder || Object.keys(meta.fields);
  const columnVisibility = meta.table?.columnVisibility || {};
  const columnRenderers = meta.table?.columnRenderers || {};
  
  return columnsOrder
    .filter(key => columnVisibility[key] !== false)
    .map(key => {
      const field = meta.fields[key];
      const renderer = columnRenderers[key];
      
      return {
        dataIndex: key,
        title: field.label,
        sorter: field.sortable !== false,
        ...(renderer && {
          render: (value) => renderField(value, renderer)
        })
      };
    });
}
```

### Step 6: Use Inferencer with Metadata Enhancement

```typescript
// apps/admin/src/app/vocabularies/page.tsx (Development)
"use client";

import { AntdInferencer } from "@refinedev/inferencer/antd";
import { useResource } from "@refinedev/core";

export default function VocabularyList() {
  const { resource } = useResource();
  
  // During development, use Inferencer with metadata hints
  if (process.env.NODE_ENV === 'development') {
    return (
      <AntdInferencer 
        resource="vocabularies"
        action="list"
        meta={resource?.meta}
        // Inferencer will use both API response AND metadata
      />
    );
  }
  
  // Production uses the generated and customized component
  return <VocabularyListComponent />;
}
```

### Step 7: OpenAPI Integration (Optional)

```typescript
// packages/contracts/src/utils/generateOpenAPI.ts
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function generateOpenAPISpec(resources: ResourceConfig[]) {
  const paths = {};
  const schemas = {};
  
  for (const resource of resources) {
    const contract = resource.meta?.contract;
    if (!contract) continue;
    
    // Convert Zod schema to JSON Schema
    const jsonSchema = zodToJsonSchema(contract);
    schemas[resource.identifier] = jsonSchema;
    
    // Generate paths
    paths[`/api/${resource.name}`] = {
      get: {
        summary: `List ${resource.name}`,
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: `#/components/schemas/${resource.identifier}` }
                    },
                    total: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: `Create ${resource.identifier}`,
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${resource.identifier}` }
            }
          }
        }
      }
    };
  }
  
  return {
    openapi: '3.0.0',
    info: { title: 'Admin API', version: '1.0.0' },
    paths,
    components: { schemas }
  };
}
```

## NX Task Integration

```typescript
// tools/scripts/generate-resource.ts
import { generateResourceMeta } from '@/packages/contracts/utils';
import { generateOpenAPISpec } from '@/packages/contracts/utils';

export async function generateResource(name: string) {
  // 1. Read contract
  const contract = await import(`@/packages/contracts/src/${name}.zod.ts`);
  
  // 2. Generate metadata
  const meta = generateResourceMeta(contract, name);
  
  // 3. Generate MSW handlers
  await generateMSWHandlers(contract, name);
  
  // 4. Generate resource config
  await generateResourceConfig(meta, name);
  
  // 5. Update OpenAPI spec
  await updateOpenAPISpec();
  
  // 6. Generate initial components with Inferencer
  await generateInferencerComponents(name);
  
  console.log(`Resource ${name} generated with full metadata and type safety!`);
}
```

```json
// nx.json task configuration
{
  "targetDefaults": {
    "generate-resource": {
      "executor": "@nrwl/workspace:run-commands",
      "options": {
        "command": "ts-node tools/scripts/generate-resource.ts {args.name}"
      }
    }
  }
}
```

## Testing with Metadata

```typescript
// apps/admin/src/test/vocabularies.test.tsx
describe('Vocabulary Resource', () => {
  it('should use contract for validation', async () => {
    const { resource } = renderHook(() => useResource());
    const contract = resource?.meta?.contract;
    
    // Invalid data should fail contract validation
    const invalidData = { name: '' }; // Missing required fields
    expect(() => contract.parse(invalidData)).toThrow();
  });
  
  it('should generate correct form fields from metadata', () => {
    const meta = vocabularyResource.meta;
    const formFields = Object.entries(meta.fields)
      .filter(([key]) => !meta.inferencer.excludeFields.includes(key));
    
    // Should have all editable fields
    expect(formFields).toHaveLength(8); // Excluding system fields
    
    // Status should be a select with options
    const statusField = meta.fields.status;
    expect(statusField.component).toBe('Select');
    expect(statusField.options).toHaveLength(3);
  });
  
  it('should respect RBAC permissions from metadata', () => {
    const meta = vocabularyResource.meta;
    
    // Viewer can list but not create
    expect(meta.permissions.list).toContain('viewer');
    expect(meta.permissions.create).not.toContain('viewer');
  });
});
```

## Benefits of This Approach

1. **Single Source of Truth**: Zod contracts drive everything
2. **Rich Metadata**: Resource configuration knows about types, validation, UI hints
3. **Better Inferencer Output**: Metadata helps Inferencer generate more accurate UI
4. **Type Safety**: TypeScript types flow from contracts through metadata to UI
5. **RBAC Built-in**: Permissions are part of resource metadata
6. **OpenAPI Compatible**: Can generate OpenAPI specs from contracts
7. **NX Integration**: Resource generation is an NX task
8. **Test Coverage**: Metadata is testable and ensures consistency

## Key Insights

- **Metadata bridges the gap** between Zod contracts and Refine's UI generation
- **Inferencer + Metadata = Smart Scaffolding** that matches our data model
- **Resource configuration is code** - testable, versionable, reusable
- **OpenAPI integration** provides another layer of type safety
- **NX tasks** automate the resource creation workflow

This pattern ensures that our Feature Factory workflow produces consistent, type-safe resources that leverage Refine's capabilities while maintaining our contract-driven architecture.