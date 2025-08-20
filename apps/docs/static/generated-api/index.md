---
id: index
title: API Reference
sidebar_position: 1
---

# API Reference

This section contains auto-generated TypeScript and Zod schema documentation.

## Modules

- [Contracts & Schemas](./contracts/schemas/index.md) - Zod validation schemas
- [Supabase Types](./supabase-types/src/database.md) - Database type definitions

## Key Features

### Type Safety
All schemas provide full TypeScript type inference and runtime validation.

### Zod Schemas
- **VocabularySchema** - Vocabulary management with multilingual support
- **JobSchema** - Background job processing and status tracking
- **RdfBuildSchema** - RDF generation configuration

### Database Types
- **Database** - Complete Supabase schema with type safety
- **Tables** - Type-safe table row, insert, and update types
- **Views** - Database view type definitions

## Usage

```typescript
import { VocabularySchema } from '@ifla/contracts/schemas';
import type { Database } from '@ifla/supabase-types';

// Validate data with Zod
const result = VocabularySchema.safeParse(data);

// Type-safe database queries
type Profile = Database['public']['Tables']['profiles']['Row'];
```

---

*Generated at: 2025-08-20T04:04:08.666Z*
