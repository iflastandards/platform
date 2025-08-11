# AI Agent File Placement Guide

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Concrete guidance for AI agents on normalized file placement patterns

## Overview

This document provides definitive guidance for AI agents on where to place different types of files in the IFLA Standards monorepo. It addresses the distinction between Next.js (admin) and Docusaurus (documentation sites) platforms and documents current inconsistencies.

## Platform Architecture

### Next.js Platform (Admin Portal)
- **Location**: `apps/admin/`
- **Framework**: Next.js 15.4.4 with App Router
- **Purpose**: Administrative interface with authentication and RBAC

### Docusaurus Platform (Documentation Sites)
- **Location**: `standards/{site}/` (isbd, isbdm, unimarc, etc.)
- **Framework**: Docusaurus 3.8.1
- **Purpose**: Static documentation sites
- **Shared Components**: `packages/theme/src/components/`

## Test File Placement (NORMALIZED)

### Current Standard: Centralized Test Structure

**IMPORTANT**: The codebase has migrated from co-located tests to centralized test directories. AI agents should follow the centralized pattern.

### Unit Tests

#### Next.js Admin Portal
```
apps/admin/
├── src/
│   ├── components/
│   │   └── **/__tests__/           # Component unit tests
│   ├── app/api/
│   │   └── **/__tests__/           # API route unit tests
│   ├── lib/
│   │   └── __tests__/              # Utility unit tests
│   └── test/
│       ├── unit/                   # Additional unit tests
│       ├── components/             # Component test helpers
│       └── lib/                    # Library test helpers
```

#### Docusaurus Sites (Shared Components)
```
packages/theme/
├── src/
│   ├── components/
│   │   └── **/__tests__/           # Component unit tests
│   └── tests/
│       ├── components/             # Additional component tests
│       ├── config/                 # Configuration tests
│       └── utils/                  # Utility tests
```

### Integration Tests

#### Next.js Admin Portal
```
apps/admin/
├── src/
│   ├── test/integration/           # Main integration tests
│   │   ├── server-dependent/       # Tests requiring live servers
│   │   ├── api-*.test.ts          # API integration tests
│   │   └── dashboard-*.test.tsx    # Dashboard integration tests
│   └── tests/integration/          # Alternative location (legacy)
```

#### Docusaurus Sites
```
packages/theme/
└── src/tests/
    ├── deployment/                 # Environment tests
    ├── scripts/                    # Script integration tests
    └── config/                     # Configuration integration tests
```

### E2E Tests

#### Centralized E2E Structure
```
e2e/                               # Root-level E2E tests
├── smoke/                         # Smoke tests (@smoke)
├── integration/                   # Cross-service integration
├── accessibility/                 # Accessibility tests (@a11y)
├── e2e/                          # Full E2E workflows
│   ├── admin/                    # Admin-specific E2E
│   ├── standards/                # Standards site E2E
│   ├── visual/                   # Visual regression
│   └── performance/              # Performance tests
├── fixtures/                     # Test data fixtures
├── utils/                        # E2E utilities
└── examples/                     # Example tests
```

#### Project-Specific E2E (Legacy)
```
apps/admin/e2e/                   # Admin-specific E2E (if needed)
standards/{site}/e2e/             # Site-specific E2E (if needed)
```

### Test Fixtures and Mocks

#### Centralized Fixtures
```
fixtures/                         # Root-level test fixtures
├── resources/
│   ├── namespaces.yaml
│   └── sites.yaml
└── test-scenarios.yaml

e2e/fixtures/                     # E2E-specific fixtures
├── database.fixture.ts
└── test-data.fixture.ts
```

#### Platform-Specific Mocks
```
# Next.js Admin
apps/admin/src/
├── test/mocks/                   # Test mocks
├── lib/mock-data/               # Mock data for development
└── test-config/                 # Test configuration

# Docusaurus Shared
packages/theme/src/tests/
├── __mocks__/                   # Component mocks
├── fixtures/                    # Test fixtures
└── setup/                       # Test setup files
```

## Shared Component Placement

### UI Components (NORMALIZED)

#### Docusaurus Sites (Shared Globally)
```
packages/theme/src/components/    # PREFERRED for shared components
├── VocabularyTable/
│   ├── index.tsx
│   ├── styles.module.scss
│   ├── __tests__/               # Component tests
│   └── hooks/                   # Component-specific hooks
├── Figure/
├── ElementReference/
└── index.ts                     # Export barrel
```

#### Next.js Admin (Admin-Specific)
```
apps/admin/src/components/        # Admin-only components
├── dashboard/
│   ├── admin/
│   ├── editor/
│   └── shared/
├── common/                      # Reusable admin components
├── accessibility/               # Accessibility components
└── import/                      # Feature-specific components
```

### Backend Components

#### Next.js API Routes
```
apps/admin/src/app/api/          # Next.js API routes
├── admin/                       # Admin-specific endpoints
├── auth/                        # Authentication endpoints
├── actions/                     # Server actions
└── health/                      # Health check endpoints
```

#### Shared Services and Utilities
```
apps/admin/src/lib/              # Admin-specific services
├── services/                    # Business logic services
├── supabase/                    # Database client
├── auth.ts                      # Authentication logic
└── authorization.ts             # RBAC logic

packages/theme/src/lib/          # Shared utilities (if needed)
```

## Tools and Processing

### Backend Processing Tools
```
tools/                           # Processing and utility tools
├── typescript/
│   ├── rdf-converters/         # RDF processing tools
│   ├── site-generators/        # Site generation tools
│   └── vocabulary-tools/       # Vocabulary processing
├── python/
│   ├── isbd-processor/         # ISBD-specific processing
│   ├── language-detection/     # Language processing
│   └── quality-assurance/      # QA tools
└── sheet-sync/                 # Google Sheets integration
```

### Scripts
```
scripts/                        # Build and utility scripts
├── utils/                      # Script utilities
├── scaffold-template/          # Template generation
└── *.test.ts                  # Script tests (co-located)
```

## Configuration File Patterns

### Vitest Configurations
```
# Root level
vitest.config.nx.ts             # Primary Nx-optimized config
vitest.config.ci.ts             # CI-specific config
vitest.config.ci-env.ts         # CI environment config

# Project level
apps/admin/vitest.config.ts                    # Admin unit tests
apps/admin/vitest.config.integration.ts        # Admin integration tests
apps/admin/vitest.config.server-dependent.ts   # Server-dependent tests

packages/*/vitest.config.ts                    # Package-specific configs
tools/*/vitest.config.ts                       # Tool-specific configs
```

### TypeScript Configurations
```
# Root level
tsconfig.json                   # Root TypeScript config
tsconfig.test.json             # Test-specific config

# Project level
apps/admin/tsconfig.json       # Admin TypeScript config
packages/*/tsconfig.json       # Package TypeScript configs
standards/*/tsconfig.json      # Site TypeScript configs

# Specialized configs
packages/theme/tsconfig.build.json        # Build-specific
packages/theme/tsconfig.declarations.json # Declaration files
tools/*/tsconfig.json                     # Tool-specific
```

### Nx Project Configurations
```
# Root level
nx.json                        # Nx workspace configuration
project.json                   # Root project configuration

# Project level
apps/admin/project.json        # Admin project config
packages/*/project.json        # Package project configs
standards/*/project.json       # Site project configs
tools/*/project.json          # Tool project configs
```

## Inconsistencies and Migration Notes

### Historical Changes

1. **Test Co-location → Centralization**
   - **Old Pattern**: Tests next to source files
   - **New Pattern**: Centralized test directories
   - **Status**: Mostly migrated, some legacy co-located tests remain

2. **Multiple Test Directories**
   - `apps/admin/src/test/` (primary)
   - `apps/admin/src/tests/` (legacy)
   - **Recommendation**: Use `src/test/` for new tests

3. **E2E Test Distribution**
   - **Centralized**: `e2e/` (preferred)
   - **Distributed**: `apps/*/e2e/` (legacy)
   - **Recommendation**: Use centralized `e2e/` for new tests

### Current Inconsistencies

1. **Mixed Test Placement**
   - Some tests still co-located with source
   - Some in centralized directories
   - **Action**: Follow centralized pattern for new tests

2. **Multiple Vitest Configs**
   - Different configs for different test types
   - **Reason**: Separation of concerns (unit vs integration vs server-dependent)
   - **Status**: Intentional, not an inconsistency

3. **TypeScript Config Proliferation**
   - Many specialized tsconfig files
   - **Reason**: Different build targets and environments
   - **Status**: Necessary for monorepo complexity

## Decision Trees for AI Agents

### Where to Place a New Test?

```
1. What type of test?
   ├─ Unit Test
   │  ├─ Admin component? → apps/admin/src/components/**/__tests__/
   │  ├─ Admin API route? → apps/admin/src/app/api/**/__tests__/
   │  ├─ Admin utility? → apps/admin/src/lib/__tests__/
   │  ├─ Shared component? → packages/theme/src/components/**/__tests__/
   │  └─ Tool/script? → tools/**/tests/ or co-located
   │
   ├─ Integration Test
   │  ├─ Admin integration? → apps/admin/src/test/integration/
   │  ├─ Shared component integration? → packages/theme/src/tests/
   │  └─ Cross-service? → e2e/integration/
   │
   ├─ E2E Test
   │  ├─ Smoke test? → e2e/smoke/
   │  ├─ Admin workflow? → e2e/e2e/admin/
   │  ├─ Standards site? → e2e/e2e/standards/
   │  └─ Cross-platform? → e2e/integration/
   │
   └─ Server-Dependent Test
      └─ Admin only → apps/admin/src/test/integration/server-dependent/
```

### Where to Place a New Component?

```
1. What type of component?
   ├─ UI Component
   │  ├─ Used across multiple Docusaurus sites? → packages/theme/src/components/
   │  ├─ Admin-specific? → apps/admin/src/components/
   │  └─ Site-specific? → standards/{site}/src/components/
   │
   ├─ Service/Utility
   │  ├─ Admin-specific? → apps/admin/src/lib/
   │  ├─ Shared across platforms? → packages/theme/src/lib/
   │  └─ Processing tool? → tools/
   │
   └─ API Route
      └─ Admin only → apps/admin/src/app/api/
```

### Where to Place Configuration?

```
1. What type of config?
   ├─ Test Configuration
   │  ├─ Project-specific? → {project}/vitest.config.ts
   │  ├─ Integration tests? → {project}/vitest.config.integration.ts
   │  └─ Server-dependent? → {project}/vitest.config.server-dependent.ts
   │
   ├─ TypeScript Configuration
   │  ├─ Project root? → {project}/tsconfig.json
   │  ├─ Build-specific? → {project}/tsconfig.build.json
   │  └─ Test-specific? → {project}/tsconfig.test.json
   │
   └─ Nx Configuration
      ├─ Project-specific? → {project}/project.json
      └─ Workspace-wide? → nx.json
```

## Best Practices for AI Agents

### File Placement Principles

1. **Follow the Platform Pattern**
   - Next.js admin: Use App Router conventions
   - Docusaurus sites: Use shared component pattern

2. **Prefer Centralized Test Structure**
   - Use `src/test/` directories over co-location
   - Group related tests in subdirectories

3. **Respect Separation of Concerns**
   - Admin-specific code in `apps/admin/`
   - Shared components in `packages/theme/`
   - Processing tools in `tools/`

4. **Use Existing Patterns**
   - Check similar files for placement patterns
   - Follow established directory structures
   - Maintain consistency within projects

### Common Mistakes to Avoid

1. **Don't co-locate new tests** - Use centralized directories
2. **Don't mix platform patterns** - Keep Next.js and Docusaurus separate
3. **Don't create new config files** without checking existing patterns
4. **Don't place shared components** in project-specific directories

## Quick Reference Commands

```bash
# Find existing test patterns
find . -name "*.test.*" -not -path "./node_modules/*" | head -20

# Find component patterns
find . -name "index.tsx" -not -path "./node_modules/*" | grep components

# Find configuration patterns
find . -name "vitest.config.*" -not -path "./node_modules/*"
find . -name "tsconfig*.json" -not -path "./node_modules/*"

# Check project structure
ls -la apps/admin/src/
ls -la packages/theme/src/
ls -la e2e/
```

## Summary

This guide provides concrete, actionable guidance for AI agents working in the IFLA Standards monorepo. The key principles are:

1. **Platform Awareness**: Distinguish between Next.js admin and Docusaurus documentation platforms
2. **Centralized Testing**: Use centralized test directories, not co-location
3. **Shared Components**: Use `packages/theme/` for components shared across Docusaurus sites
4. **Consistent Patterns**: Follow established patterns within each platform
5. **Configuration Hierarchy**: Understand the multiple config files and their purposes

By following these patterns, AI agents can place files correctly and maintain the established architecture of the monorepo.