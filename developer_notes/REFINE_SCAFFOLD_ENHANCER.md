# Refine Scaffold Enhancer Pattern

## The Problem

Refine.dev's CLI generator creates generic scaffolds that don't know about:
- Our Zod contracts (field types, validations)
- Our mock data structure
- Our business rules
- Our RBAC requirements

This means we generate "dumb" scaffolds and then spend significant time customizing them.

## The Solution: Contract-Driven Scaffold Enhancement

### Step 1: Define Contract First (Source of Truth)

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

// Derived schemas for different operations
export const VocabularyCreateInput = VocabularyContract.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const VocabularyUpdateInput = VocabularyCreateInput.partial();
```

### Step 2: Generate Field Metadata from Contract

```typescript
// packages/contracts/src/utils/inferFieldMeta.ts
import { z } from 'zod';

export function inferFieldMetadata(schema: z.ZodObject<any>) {
  const shape = schema.shape;
  const fields = [];

  for (const [key, value] of Object.entries(shape)) {
    const field = {
      name: key,
      type: inferFieldType(value),
      required: !value.isOptional(),
      validation: inferValidation(value),
      uiComponent: inferUIComponent(value),
    };
    fields.push(field);
  }
  
  return fields;
}

function inferFieldType(zodType: any): string {
  if (zodType instanceof z.ZodString) return 'string';
  if (zodType instanceof z.ZodNumber) return 'number';
  if (zodType instanceof z.ZodBoolean) return 'boolean';
  if (zodType instanceof z.ZodDate) return 'date';
  if (zodType instanceof z.ZodEnum) return 'enum';
  if (zodType instanceof z.ZodArray) return 'array';
  // ... more types
}

function inferUIComponent(zodType: any): string {
  // Check for specific patterns
  if (zodType instanceof z.ZodString) {
    const checks = zodType._def.checks || [];
    
    // Email
    if (checks.some(c => c.kind === 'email')) return 'EmailInput';
    
    // URL
    if (checks.some(c => c.kind === 'url')) return 'UrlInput';
    
    // Long text
    if (checks.some(c => c.kind === 'max' && c.value > 200)) return 'TextArea';
    
    // Regex patterns
    if (checks.some(c => c.kind === 'regex')) {
      const regex = checks.find(c => c.kind === 'regex').regex;
      if (regex.source.includes('\\d+\\.\\d+\\.\\d+')) return 'VersionInput';
    }
    
    return 'Input';
  }
  
  if (zodType instanceof z.ZodEnum) return 'Select';
  if (zodType instanceof z.ZodBoolean) return 'Switch';
  if (zodType instanceof z.ZodArray) return 'TagInput';
  
  return 'Input';
}
```

### Step 3: Custom Generator Script

```typescript
// scripts/generate-resource.ts
import { inferFieldMetadata } from '@/packages/contracts/utils/inferFieldMeta';
import { execSync } from 'child_process';
import fs from 'fs';

export async function generateResource(resourceName: string, contract: z.ZodObject<any>) {
  // 1. Run basic Refine generator
  execSync(`npx @refinedev/cli add resource ${resourceName} --actions list,create,edit,show`);
  
  // 2. Get field metadata from contract
  const fields = inferFieldMetadata(contract);
  
  // 3. Enhance the generated files
  await enhanceListPage(resourceName, fields);
  await enhanceCreatePage(resourceName, fields);
  await enhanceEditPage(resourceName, fields);
  await enhanceShowPage(resourceName, fields);
}

async function enhanceListPage(resourceName: string, fields: FieldMeta[]) {
  const listPath = `apps/admin/src/app/${resourceName}/page.tsx`;
  const original = fs.readFileSync(listPath, 'utf-8');
  
  // Generate table columns from fields
  const columns = fields
    .filter(f => !['createdAt', 'updatedAt', 'createdBy'].includes(f.name))
    .map(field => generateTableColumn(field))
    .join('\n');
  
  // Replace generic columns with contract-based ones
  const enhanced = original.replace(
    /<Table .*?>/,
    `<Table {...tableProps} rowKey="id">
      ${columns}
    </Table>`
  );
  
  fs.writeFileSync(listPath, enhanced);
}

function generateTableColumn(field: FieldMeta): string {
  switch (field.uiComponent) {
    case 'Select':
      return `
        <Table.Column 
          dataIndex="${field.name}" 
          title="${field.name.charAt(0).toUpperCase() + field.name.slice(1)}"
          render={(value) => <Tag>{value}</Tag>}
        />`;
    
    case 'UrlInput':
      return `
        <Table.Column 
          dataIndex="${field.name}" 
          title="${field.name.charAt(0).toUpperCase() + field.name.slice(1)}"
          render={(value) => <a href={value} target="_blank">{value}</a>}
        />`;
    
    default:
      return `
        <Table.Column 
          dataIndex="${field.name}" 
          title="${field.name.charAt(0).toUpperCase() + field.name.slice(1)}"
        />`;
  }
}

async function enhanceCreatePage(resourceName: string, fields: FieldMeta[]) {
  const createPath = `apps/admin/src/app/${resourceName}/create/page.tsx`;
  const original = fs.readFileSync(createPath, 'utf-8');
  
  // Generate form fields from contract
  const formFields = fields
    .filter(f => !['id', 'createdAt', 'updatedAt', 'createdBy'].includes(f.name))
    .map(field => generateFormField(field))
    .join('\n');
  
  const enhanced = original.replace(
    /<Form .*?>(.*?)<\/Form>/s,
    `<Form {...formProps} layout="vertical">
      ${formFields}
    </Form>`
  );
  
  fs.writeFileSync(createPath, enhanced);
}

function generateFormField(field: FieldMeta): string {
  const rules = [];
  if (field.required) rules.push(`{ required: true, message: "${field.name} is required" }`);
  if (field.validation?.min) rules.push(`{ min: ${field.validation.min}, message: "Minimum ${field.validation.min} characters" }`);
  if (field.validation?.max) rules.push(`{ max: ${field.validation.max}, message: "Maximum ${field.validation.max} characters" }`);
  if (field.validation?.pattern) rules.push(`{ pattern: ${field.validation.pattern}, message: "Invalid format" }`);
  
  const rulesAttr = rules.length > 0 ? `rules={[${rules.join(', ')}]}` : '';
  
  switch (field.uiComponent) {
    case 'TextArea':
      return `
        <Form.Item label="${field.label}" name="${field.name}" ${rulesAttr}>
          <Input.TextArea rows={4} />
        </Form.Item>`;
    
    case 'Select':
      return `
        <Form.Item label="${field.label}" name="${field.name}" ${rulesAttr}>
          <Select>
            ${field.validation?.enum?.map(opt => 
              `<Select.Option value="${opt}">${opt}</Select.Option>`
            ).join('\n')}
          </Select>
        </Form.Item>`;
    
    case 'Switch':
      return `
        <Form.Item label="${field.label}" name="${field.name}" valuePropName="checked">
          <Switch />
        </Form.Item>`;
    
    case 'TagInput':
      return `
        <Form.Item label="${field.label}" name="${field.name}" ${rulesAttr}>
          <Select mode="tags" />
        </Form.Item>`;
    
    default:
      return `
        <Form.Item label="${field.label}" name="${field.name}" ${rulesAttr}>
          <Input />
        </Form.Item>`;
  }
}
```

### Step 4: Integration with Mock Data

```typescript
// scripts/generate-mock-from-contract.ts
import { faker } from '@faker-js/faker';

export function generateMockFromContract(contract: z.ZodObject<any>, count = 10) {
  const mocks = [];
  
  for (let i = 0; i < count; i++) {
    const mock = {};
    
    for (const [key, zodType] of Object.entries(contract.shape)) {
      mock[key] = generateMockValue(key, zodType);
    }
    
    mocks.push(mock);
  }
  
  return mocks;
}

function generateMockValue(fieldName: string, zodType: any): any {
  // Smart generation based on field name and type
  if (fieldName === 'id') return faker.string.uuid();
  if (fieldName === 'email') return faker.internet.email();
  if (fieldName === 'name') return faker.person.fullName();
  if (fieldName === 'description') return faker.lorem.paragraph();
  if (fieldName.includes('url') || fieldName.includes('namespace')) return faker.internet.url();
  if (fieldName.includes('date') || fieldName.includes('At')) return faker.date.recent().toISOString();
  
  if (zodType instanceof z.ZodEnum) {
    const options = zodType._def.values;
    return faker.helpers.arrayElement(options);
  }
  
  if (zodType instanceof z.ZodString) return faker.lorem.word();
  if (zodType instanceof z.ZodNumber) return faker.number.int();
  if (zodType instanceof z.ZodBoolean) return faker.datatype.boolean();
  if (zodType instanceof z.ZodArray) return [generateMockValue('item', zodType._def.type)];
  
  return null;
}
```

### Step 5: Complete Workflow

```bash
# 1. Define your contract
# packages/contracts/src/Vocabulary.zod.ts

# 2. Generate enhanced scaffold
pnpm generate:resource vocabulary

# This runs:
# - Refine CLI to create base files
# - Contract analyzer to extract field metadata
# - File enhancer to add proper fields, validations, UI components
# - Mock generator to create test data

# 3. Generated files now have:
# - Correct form fields based on Zod schema
# - Proper validation rules
# - Appropriate UI components (TextArea for long text, Select for enums)
# - Type-safe mock data
```

## Benefits of This Approach

1. **Single Source of Truth**: Zod contract drives everything
2. **Less Manual Work**: Generated code is much closer to final
3. **Type Safety**: Everything derives from typed contracts
4. **Consistent UI**: Field types map to appropriate components
5. **Better Mocks**: Mock data matches contract structure

## Implementation Priority

### Phase 1: Manual Enhancement Pattern
Document the pattern of manually enhancing Refine scaffolds based on contracts

### Phase 2: Helper Functions
Create utilities to infer field metadata from Zod schemas

### Phase 3: Code Generation Scripts
Build scripts that enhance Refine output automatically

### Phase 4: Custom CLI
Create `pnpm generate:resource` that combines everything

## Example: Before and After

### Before (Generic Refine Output)
```tsx
// Generic form with no knowledge of our data
<Form {...formProps}>
  <Form.Item label="Field" name="field">
    <Input />
  </Form.Item>
</Form>
```

### After (Contract-Enhanced)
```tsx
// Form generated from Zod contract
<Form {...formProps} layout="vertical">
  <Form.Item 
    label="Name" 
    name="name" 
    rules={[
      { required: true, message: "Name is required" },
      { min: 1, max: 100, message: "Name must be 1-100 characters" }
    ]}
  >
    <Input />
  </Form.Item>
  
  <Form.Item 
    label="Namespace" 
    name="namespace"
    rules={[
      { required: true, message: "Namespace is required" },
      { type: 'url', message: "Must be a valid URL" }
    ]}
  >
    <Input />
  </Form.Item>
  
  <Form.Item 
    label="Status" 
    name="status"
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
```

This enhanced scaffold is much closer to our final implementation!