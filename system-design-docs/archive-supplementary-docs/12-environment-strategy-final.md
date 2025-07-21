# Environment Strategy - Current Implementation

**Version:** 1.0  
**Date:** January 2025  
**Status:** Documenting Existing Architecture

## Executive Summary

This document finalizes the environment strategy for the IFLA Standards Platform, resolving previous ambiguities and establishing the definitive 3-environment approach: local, preview, and production.

## Final Environment Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    3-ENVIRONMENT STRATEGY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOCAL DEVELOPMENT                                           │
│     └─> Developer machines                                      │
│     └─> http://localhost:3000-3008                            │
│     └─> Full feature development                               │
│                                                                  │
│  2. PREVIEW (STAGING)                                           │
│     └─> iflastandards/platform:preview                         │
│     └─> https://iflastandards.github.io/platform/             │
│     └─> Client review & integration testing                    │
│                                                                  │
│  3. PRODUCTION                                                  │
│     └─> iflastandards/platform:main                           │
│     └─> https://www.iflastandards.info/                       │
│     └─> Live platform (PR-only updates)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Environment Details

### 1. Local Development Environment

**Purpose**: Active development and testing

**Configuration**:
```yaml
environment: local
urls:
  portal: http://localhost:3000
  admin: http://localhost:3007/admin
  other_sites: http://localhost:3001-3008
authentication: Development tokens
database: Local Supabase or mocks
features: All features enabled, debug mode
```

**Key Characteristics**:
- Hot module replacement
- Debug tooling enabled
- Mock services available
- No deployment restrictions
- Direct database access

### 2. Preview Environment (Staging)

**Purpose**: Client review, integration testing, and final validation

**Configuration**:
```yaml
environment: preview
repository: iflastandards/platform
branch: preview
deployment: GitHub Pages
url: https://iflastandards.github.io/platform/
baseUrl: /platform/
authentication: Real Clerk (staging)
database: Staging Supabase instance
```

**Key Characteristics**:
- Automated deployment on push to preview branch
- Full integration with external services
- Client-accessible for review
- Performance monitoring enabled
- Near-production configuration

**Deployment Trigger**:
```bash
git push origin feature-branch:preview
# OR
# Create PR to preview branch and merge
```

### 3. Production Environment

**Purpose**: Live platform serving end users

**Configuration**:
```yaml
environment: production
repository: iflastandards/platform
branch: main (protected)
deployment: GitHub Pages
url: https://www.iflastandards.info/
baseUrl: /
authentication: Real Clerk (production)
database: Production Supabase instance
```

**Key Characteristics**:
- Protected branch (no direct pushes)
- Updates only via approved PRs from preview
- Full monitoring and alerting
- CDN-distributed assets
- Maximum security restrictions

**Deployment Trigger**:
```bash
# Only via Pull Request from preview to main
# Requires:
# - Code review approval
# - All CI checks passing
# - Authorized merger
```

## Deprecated Strategies

### What's Been Removed

1. **Development Environment** ❌
   - Previously: Fourth environment between local and preview
   - Reason: Redundant, added complexity without value
   - Migration: Features consolidated into preview environment

2. **Personal Fork Workflow** ❌
   - Previously: Developers used personal forks
   - Reason: Complicated collaboration, difficult CI/CD
   - Migration: Direct feature branches on main repository

3. **Dual CI Architecture** ❌
   - Previously: Separate CI for development and preview
   - Reason: Overly complex, maintenance burden
   - Migration: Single CI pipeline with branch-based logic

## Deployment Platforms

### Primary: GitHub Pages

**Preview Deployment**:
- Repository: `iflastandards/platform`
- Branch: `preview`
- URL: `https://iflastandards.github.io/platform/`
- Build: Automated via GitHub Actions

**Production Deployment**:
- Repository: `iflastandards/platform`
- Branch: `main`
- URL: `https://www.iflastandards.info/`
- Custom domain with CNAME

### Secondary: Vercel (Under Consideration)

**Current Status**:
- ✅ Edge Functions for API endpoints
- ⚠️ Preview deployments (evaluating)

**Potential Vercel Uses**:
```yaml
Confirmed:
  - Edge API functions
  - Serverless compute
  
Under Evaluation:
  - PR preview deployments
  - Feature branch previews
  - A/B testing capabilities
  - Regional edge deployment
```

**Decision Pending**:
- Cost-benefit analysis needed
- Integration complexity assessment
- Performance comparison with GitHub Pages

## Configuration Management

### Environment Detection

```typescript
// Centralized environment detection
export function getCurrentEnvironment(): Environment {
  const hostname = typeof window !== 'undefined' 
    ? window.location.hostname 
    : process.env.HOSTNAME || 'localhost';
    
  if (hostname.includes('localhost')) return 'local';
  if (hostname.includes('github.io')) return 'preview';
  if (hostname.includes('iflastandards.info')) return 'production';
  
  // Fallback
  return 'local';
}
```

### Configuration Matrix

```typescript
export const ENVIRONMENT_CONFIG = {
  local: {
    apiUrl: 'http://localhost:3007',
    authDomain: 'localhost',
    features: {
      debug: true,
      analytics: false,
      errorReporting: false
    }
  },
  preview: {
    apiUrl: 'https://iflastandards.github.io/platform/api',
    authDomain: 'preview.clerk.dev',
    features: {
      debug: false,
      analytics: true,
      errorReporting: true
    }
  },
  production: {
    apiUrl: 'https://www.iflastandards.info/api',
    authDomain: 'prod.clerk.dev',
    features: {
      debug: false,
      analytics: true,
      errorReporting: true
    }
  }
};
```

## Workflow Implications

### Development Workflow

```mermaid
graph LR
    A[Local Development] -->|Feature Complete| B[Push to Feature Branch]
    B -->|Ready for Review| C[Deploy to Preview]
    C -->|Client Approved| D[PR to Main]
    D -->|Approved & Merged| E[Production]
```

### Branch Strategy

```
main (protected)
├── preview (integration branch)
└── feature/* (development branches)
    ├── feature/add-vocabulary
    ├── feature/fix-navigation
    └── feature/update-schemas
```

### Deployment Automation

**Preview Deployment** (`.github/workflows/preview-deploy.yml`):
```yaml
on:
  push:
    branches: [preview]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pnpm install
      - name: Build all sites
        run: pnpm build:all
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
```

## Migration Path

### For Existing Documentation

1. **Search and Replace**:
   ```bash
   # Find references to 4 environments
   grep -r "development.*preview.*production" .
   
   # Update to 3 environments
   # local, preview, production
   ```

2. **Configuration Updates**:
   - Remove `development` from all config matrices
   - Update environment detection logic
   - Simplify CI/CD pipelines

3. **Repository Updates**:
   - Archive any `standards-dev` references
   - Update to `platform` repository
   - Remove fork-based workflows

## Benefits of Final Strategy

### Simplicity
- Clear progression: local → preview → production
- No ambiguity about environment purposes
- Simplified configuration management

### Efficiency
- Faster deployments with fewer environments
- Reduced CI/CD complexity
- Lower maintenance overhead

### Clarity
- Each environment has distinct purpose
- No overlap in functionality
- Clear deployment triggers

## Open Questions for Future

### Vercel Integration
- **Question**: Should we use Vercel for PR previews?
- **Consideration**: Cost vs benefit analysis needed
- **Timeline**: Decision by Q2 2025

### Regional Deployments
- **Question**: Need for geographic distribution?
- **Consideration**: User base analysis required
- **Timeline**: Evaluate after 6 months production

## Implementation Checklist

### Immediate Actions
- [x] Document final environment strategy
- [ ] Update all configuration files
- [ ] Remove deprecated environment references
- [ ] Update CI/CD workflows
- [ ] Communicate changes to team

### Documentation Updates Needed
1. `CLAUDE.md` - Update environment references
2. `developer_notes/*.md` - Remove development environment
3. `.github/workflows/*` - Simplify for 3 environments
4. `packages/shared-config/*` - Remove development configs

### Team Communication
- [ ] Team meeting to announce changes
- [ ] Update onboarding documentation
- [ ] Create migration guide for developers
- [ ] Update external documentation

## Conclusion

The 3-environment strategy (local, preview, production) provides the optimal balance of simplicity and functionality. By removing the redundant development environment and deprecated fork workflow, we achieve a cleaner, more maintainable architecture that serves all stakeholder needs effectively.

This decision is final and should be reflected in all documentation, configuration, and communication going forward.