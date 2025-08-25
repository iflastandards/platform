# Configuration Optimization Plan - Central Zod Config Package

## Executive Summary

Analysis reveals significant configuration duplication and inconsistencies across the codebase. A central Zod-validated configuration package would provide type safety, runtime validation, and single source of truth for all configuration needs.

## Current State Analysis

### Configuration Fragmentation
- **100+ config files** scattered across apps/packages
- **3 duplicate site config implementations** (packages/contracts, apps/admin, packages/theme)
- **No runtime validation** for environment variables
- **Inconsistent environment detection** logic across apps
- **Mixed config formats**: JSON, TypeScript, JavaScript

### Key Issues Identified

1. **Duplication**
   - `packages/contracts/src/config/siteConfig.ts` - Full site configuration
   - `apps/admin/src/lib/config.ts` - Partial duplicate of site config
   - Multiple tsconfig files with overlapping settings

2. **Type Safety Gaps**
   - Environment variables accessed without validation
   - No compile-time guarantees for config shape
   - Runtime errors from missing/invalid config

3. **Maintenance Burden**
   - Config updates require changes in multiple locations
   - Risk of drift between duplicated configs
   - No centralized validation logic

## Proposed Solution: @ifla/config Package

### Package Structure
```
packages/config/
├── src/
│   ├── schemas/           # Zod schemas
│   │   ├── site.schema.ts
│   │   ├── env.schema.ts
│   │   ├── build.schema.ts
│   │   └── runtime.schema.ts
│   ├── validators/         # Validation utilities
│   │   ├── env.validator.ts
│   │   └── config.validator.ts
│   ├── types/             # Generated TypeScript types
│   │   └── index.ts
│   ├── configs/           # Actual configurations
│   │   ├── sites.config.ts
│   │   ├── ports.config.ts
│   │   └── environments.config.ts
│   └── index.ts           # Public API
├── tests/
└── package.json
```

### Core Features

#### 1. Zod Schema Definitions
```typescript
// src/schemas/env.schema.ts
import { z } from 'zod';

export const EnvSchema = z.object({
  // Required
  NODE_ENV: z.enum(['development', 'test', 'production']),
  
  // Optional with defaults
  PORT: z.coerce.number().default(3000),
  
  // Clerk Auth
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  
  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  
  // GitHub
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_APP_ID: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;
```

#### 2. Site Configuration Schema
```typescript
// src/schemas/site.schema.ts
export const SiteConfigSchema = z.object({
  key: z.enum(['portal', 'ISBDM', 'LRM', 'FRBR', 'isbd', 'muldicat', 'unimarc']),
  environments: z.object({
    local: EnvironmentConfigSchema,
    preview: EnvironmentConfigSchema,
    production: EnvironmentConfigSchema,
  }),
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    vocabularyDefaults: VocabularyDefaultsSchema.optional(),
  }),
});
```

#### 3. Validation Utilities
```typescript
// src/validators/env.validator.ts
export function validateEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    throw new Error('Environment validation failed');
  }
  
  return parsed.data;
}

// With caching for performance
let cachedEnv: Env | null = null;
export function getValidatedEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
```

#### 4. Type-Safe Config Access
```typescript
// src/index.ts - Public API
export { getValidatedEnv } from './validators/env.validator';
export { getSiteConfig, getAllSiteConfigs } from './configs/sites.config';
export { getPortConfig } from './configs/ports.config';
export * from './types';

// Usage in apps
import { getValidatedEnv, getSiteConfig } from '@ifla/config';

const env = getValidatedEnv();
const siteConfig = getSiteConfig('portal', env.NODE_ENV);
```

## Migration Strategy

### Phase 1: Package Creation (Week 1)
1. Create `@ifla/config` package
2. Define Zod schemas for all config types
3. Implement validation utilities
4. Add comprehensive tests

### Phase 2: Gradual Adoption (Week 2-3)
1. **Start with new features** - Use @ifla/config for any new development
2. **Update critical paths** - Admin app auth, API routes
3. **Migrate build scripts** - Replace hardcoded configs
4. **Update tests** - Use validated configs in test setup

### Phase 3: Full Migration (Week 4)
1. Replace `packages/contracts/src/config/siteConfig.ts`
2. Update all Docusaurus sites to use @ifla/config
3. Migrate admin app config
4. Remove duplicate config files

### Phase 4: Cleanup (Week 5)
1. Remove old config files
2. Update documentation
3. Add lint rules to prevent config duplication
4. Create config migration guide

## Benefits

### Immediate
- **Type safety**: Compile-time config validation
- **Runtime validation**: Fail fast on invalid config
- **Single source of truth**: No more duplication
- **Better DX**: Autocomplete and type hints

### Long-term
- **Easier testing**: Mock configs with confidence
- **Config versioning**: Schema evolution support
- **Environment parity**: Guaranteed config consistency
- **Reduced bugs**: Catch config issues early

## Implementation Checklist

- [ ] Create @ifla/config package structure
- [ ] Define Zod schemas for all config types
- [ ] Implement validation utilities
- [ ] Add caching for performance
- [ ] Create migration utilities
- [ ] Write comprehensive tests
- [ ] Update build scripts
- [ ] Migrate admin app
- [ ] Migrate Docusaurus sites
- [ ] Update developer documentation
- [ ] Add CI validation step

## Risk Mitigation

1. **Backward Compatibility**: Maintain compatibility layer during migration
2. **Performance**: Cache validated configs to avoid repeated parsing
3. **Testing**: Extensive test coverage before migration
4. **Rollback Plan**: Keep old configs until migration verified

## Success Metrics

- Zero config-related runtime errors
- 50% reduction in config-related code
- 100% type coverage for configuration
- Sub-1ms config access time (with caching)
- Single location for all config updates

## Next Steps

1. Review and approve this plan
2. Create @ifla/config package
3. Begin with Phase 1 implementation
4. Set up weekly migration checkpoints

## Alternative Considerations

### Why Not .env Files?
- No type safety without additional tooling
- No runtime validation
- Requires dotenv setup in every context
- Poor IDE support compared to TypeScript

### Why Not JSON Schema?
- Less expressive than Zod
- Requires separate type generation step
- Worse TypeScript integration
- No runtime transformation capabilities

### Why Zod?
- **Best-in-class TypeScript integration**
- **Runtime and compile-time validation**
- **Transformation capabilities** (coerce, default, transform)
- **Excellent error messages**
- **Active maintenance and community**
- **Already used in packages/contracts**

## Conclusion

A central Zod-validated configuration package addresses all identified issues while providing a foundation for future configuration needs. The phased migration approach ensures minimal disruption while delivering immediate benefits to new development.