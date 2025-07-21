# Environment Strategy Migration Guide

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Guide for updating documentation and code to reflect the final 3-environment strategy

## Overview

This guide provides step-by-step instructions for migrating from the old 4-environment strategy to the final 3-environment approach.

## Quick Reference

### Old vs New

| Old Strategy | New Strategy | Action Required |
|--------------|--------------|-----------------|
| local | local | No change |
| development | ~~REMOVED~~ | Delete references |
| preview | preview | Update URLs |
| production | production | No change |

### Repository Changes

| Old | New |
|-----|-----|
| `iflastandards/standards-dev` | `iflastandards/platform` |
| `jonphipps/standards-dev` (fork) | ~~DEPRECATED~~ |

## Migration Checklist

### 1. Configuration Files

#### Update Site Configuration
**File**: `packages/shared-config/src/lib/site-config.ts`

```typescript
// REMOVE any 'development' environment
export const SITE_CONFIG: Record<SiteKey, Record<Environment, SiteConfigEntry>> = {
  portal: {
    local: { /* ... */ },
    // development: { /* REMOVE THIS */ },
    preview: { /* ... */ },
    production: { /* ... */ }
  }
  // Repeat for all sites
};
```

#### Update Environment Types
**File**: `packages/shared-config/src/lib/types.ts`

```typescript
// OLD
export type Environment = 'local' | 'development' | 'preview' | 'production';

// NEW
export type Environment = 'local' | 'preview' | 'production';
```

### 2. CI/CD Workflows

#### GitHub Actions Updates
**Files**: `.github/workflows/*.yml`

Remove any references to development environment:

```yaml
# OLD
if: github.ref == 'refs/heads/dev' || github.ref == 'refs/heads/development'

# NEW - Remove these conditions entirely
```

Update deployment triggers:

```yaml
# Preview deployment
on:
  push:
    branches: [preview]

# Production deployment  
on:
  pull_request:
    branches: [main]
    types: [closed]
```

### 3. Documentation Updates

#### CLAUDE.md
Search and replace:
- Remove all mentions of "development environment"
- Update repository references from `standards-dev` to `platform`
- Remove fork workflow instructions

#### Developer Notes
**Files to update**:
- `developer_notes/configuration-architecture.md`
- `developer_notes/site-configuration-architecture.md`
- `developer_notes/comprehensive-prd.md`

### 4. Environment Detection Code

#### Update Detection Logic
**Search for files containing environment detection**:

```bash
grep -r "development.*environment" --include="*.ts" --include="*.js"
```

Update patterns like:

```typescript
// OLD
if (hostname.includes('dev.')) return 'development';

// NEW - Remove this line
```

### 5. Build Scripts

#### Package.json Scripts
**File**: `package.json`

```json
{
  "scripts": {
    // REMOVE any dev/development specific scripts
    "build:dev": "REMOVE THIS",
    "deploy:dev": "REMOVE THIS",
    
    // KEEP these
    "build:local": "...",
    "build:preview": "...",
    "build:production": "..."
  }
}
```

### 6. Environment Variables

#### .env Files
Remove any `.env.development` files:

```bash
find . -name ".env.development*" -delete
```

#### Environment Variable References
Update any code that checks for development environment:

```typescript
// OLD
if (process.env.NODE_ENV === 'development') { }

// NEW
if (process.env.NODE_ENV === 'preview') { }
```

## Common Patterns to Update

### Repository URLs

```typescript
// OLD
const REPO_URL = 'https://github.com/iflastandards/standards-dev';

// NEW
const REPO_URL = 'https://github.com/iflastandards/platform';
```

### Environment Checks

```typescript
// OLD
const isDevelopment = env === 'development';
const isStaging = env === 'preview';

// NEW
const isStaging = env === 'preview'; // This is now the only staging env
```

### Deployment URLs

```typescript
// OLD
const URLS = {
  development: 'https://dev.iflastandards.info',
  preview: 'https://preview.iflastandards.info',
  // ...
};

// NEW
const URLS = {
  preview: 'https://iflastandards.github.io/platform/',
  production: 'https://www.iflastandards.info/',
};
```

## Testing the Migration

### 1. Local Testing

```bash
# Ensure local still works
pnpm nx dev portal

# Test preview build
pnpm build:preview

# Test production build
pnpm build:production
```

### 2. Configuration Validation

```bash
# Run the configuration test script
node scripts/test-site-configs.js

# Should only show 3 environments
```

### 3. CI/CD Testing

1. Create a test feature branch
2. Push to preview: `git push origin test-branch:preview`
3. Verify deployment to `iflastandards.github.io/platform/`
4. Create PR to main and verify production workflow

## Rollback Plan

If issues arise during migration:

1. **Configuration Rollback**:
   ```bash
   git revert [migration-commit]
   ```

2. **Temporary Compatibility**:
   ```typescript
   // Add temporary mapping if needed
   const envMap = {
     'development': 'preview', // Temporary compatibility
   };
   ```

3. **Gradual Migration**:
   - Keep development references but map to preview
   - Deprecate gradually over 2-3 sprints

## Communication Template

### Team Announcement

Subject: Environment Strategy Update - Action Required

Team,

We're simplifying our environment strategy from 4 to 3 environments:
- **Removed**: development environment 
- **Keeping**: local, preview, production

**What this means**:
- Use preview branch for all staging/testing
- No more personal forks needed
- Simpler, faster deployments

**Action required**:
- Update your local git remotes
- Remove any development environment bookmarks
- Use feature branches, not forks

Details: [Link to this guide]

## Verification Checklist

After migration, verify:

- [ ] No "development" references in configuration files
- [ ] All CI/CD workflows updated
- [ ] Documentation reflects 3-environment strategy
- [ ] Preview deployments work correctly
- [ ] Production deployments require PR approval
- [ ] No errors in build processes
- [ ] Team informed of changes

## Long-term Maintenance

### Prevent Regression

1. **Linting Rules**: Add ESLint rule to flag "development" environment
2. **PR Template**: Include environment check in PR checklist
3. **Documentation**: Keep this guide updated

### Future Considerations

- Monitor for Vercel integration decision
- Consider regional deployment needs
- Evaluate performance of 3-env strategy after 3 months

This migration solidifies our commitment to a simpler, more maintainable environment strategy that better serves our development and deployment needs.