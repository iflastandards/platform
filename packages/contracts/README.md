# @ifla/contracts

**Single source of truth for all data shapes, schemas, and API contracts**

This package provides type-safe data contracts for the IFLA Standards Platform using a **contract-first development approach**.

## Directory Structure

```
packages/contracts/
├── openapi/                    # OpenAPI specifications for external APIs
├── schemas/                    # Zod schemas for runtime validation
│   ├── Job.zod.ts             # Job management schemas
│   └── Vocabulary.zod.ts      # Vocabulary and term schemas
└── types/ts/                  # Auto-generated TypeScript types
    └── generated.ts           # Types generated from OpenAPI specs
```

## Key Principles

### 1. Contract-First Development
- **Define schemas first** using Zod for runtime validation
- **Generate types** from OpenAPI specifications
- **Validate at boundaries** - all data entering/leaving services must be validated

### 2. Type Safety Everywhere
- **Runtime validation** with Zod schemas
- **Compile-time safety** with TypeScript types
- **No 'any' types** - everything must be properly typed

### 3. Single Source of Truth
- **One schema definition** used across admin portal, API clients, and tests
- **Consistent data shapes** throughout the entire platform
- **Centralized validation logic**

## Usage

### Import Schemas
```typescript
// Import Zod schemas for runtime validation
import { JobSchema, JobCreateSchema, Job } from '@ifla/contracts/schemas/Job.zod';

// Validate data at service boundaries
const job = JobSchema.parse(rawJobData);
```

### Import Generated Types
```typescript
// Import auto-generated types from OpenAPI specs
import { ExternalApiResponse } from '@ifla/contracts/types';
```

### Use in Service Adapters
```typescript
// Example service adapter with validation
export class JobsService {
  async getJob(id: string): Promise<Job> {
    const rawData = await this.fetchFromDatabase(id);
    
    // ✅ Always validate with Zod before returning
    return JobSchema.parse(rawData);
  }
}
```

## Schema Development Patterns

### 1. Core Schema Definition
```typescript
export const JobSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['queued', 'running', 'success', 'failed']),
  // ... other fields
});

export type Job = z.infer<typeof JobSchema>;
```

### 2. Operation-Specific Schemas
```typescript
// Create schema - subset of main schema
export const JobCreateSchema = JobSchema.pick({
  type: true,
  vocabularyId: true,
}).extend({
  description: z.string().min(1),
});

// Update schema - partial subset
export const JobUpdateSchema = JobSchema.pick({
  status: true,
  progress: true,
  error: true,
}).partial();
```

### 3. Query Schemas
```typescript
export const JobQuerySchema = z.object({
  status: z.enum(['queued', 'running', 'success', 'failed']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});
```

## Type Guards and Utilities

```typescript
// Type guards for better type narrowing
export const isCompletedJob = (job: Job): job is Job & { status: 'success' | 'failed' } => {
  return ['success', 'failed'].includes(job.status);
};

// Use in components for type narrowing
if (isCompletedJob(job)) {
  // TypeScript knows job.status is 'success' | 'failed'
  console.log('Job completed with status:', job.status);
}
```

## Integration with Admin Portal

The admin portal integrates these contracts through:

1. **Service Adapters** - Always validate data with Zod schemas
2. **Refine Data Providers** - Use validated types throughout
3. **Form Validation** - Use Zod schemas with react-hook-form
4. **MSW Handlers** - Mock data must conform to schemas

## Development Commands

```bash
# Build contracts package
pnpm build

# Generate types from OpenAPI specs
pnpm generate:types

# Validate existing schemas
pnpm typecheck
```

## Adding New Contracts

### 1. Add Zod Schema
```typescript
// packages/contracts/schemas/NewResource.zod.ts
import { z } from 'zod';

export const NewResourceSchema = z.object({
  // Define schema here
});

export type NewResource = z.infer<typeof NewResourceSchema>;
```

### 2. Add to Package Exports
Update `package.json` exports to include new schema:
```json
{
  "exports": {
    "./schemas/new-resource": {
      "import": "./dist/schemas/NewResource.zod.js",
      "types": "./dist/schemas/NewResource.zod.d.ts"
    }
  }
}
```

### 3. Create Fixture Data
Add corresponding fixture data in `packages/fixtures/`.

### 4. Update Client Wrappers
Create or update client adapters in `packages/clients/ts/`.

## Testing

All schemas should include comprehensive test coverage:
- Valid data validation
- Invalid data rejection
- Edge cases and boundary conditions
- Type guard functionality

See the admin portal tests for integration examples.
