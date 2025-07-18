# Project Structure

## Root Directory Organization

```
standards-dev/
├── apps/                      # Next.js applications
│   └── admin/                 # Admin portal (Next.js + GitHub OAuth)
├── portal/                    # Main documentation portal (Docusaurus)
├── standards/                 # Individual standard sites (Docusaurus)
│   ├── ISBDM/                # ISBD Manifestation
│   ├── LRM/                  # Library Reference Model
│   ├── FRBR/                 # Functional Requirements
│   ├── isbd/                 # International Standard Bibliographic Description
│   ├── muldicat/             # Multilingual Dictionary of Cataloguing Terms
│   └── unimarc/              # UNIMARC formats
├── packages/                  # Shared packages
│   ├── theme/                # Custom Docusaurus theme (@ifla/theme)
│   ├── ui/                   # Shared UI components
│   └── standards-cli/        # CLI tools
├── scripts/                   # Build and utility scripts (Nx project with isolated tests)
│   ├── project.json         # Nx project configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vitest.config.ts     # Test configuration
│   ├── *.test.ts           # Script-specific tests
│   └── utils/              # Shared script utilities
├── e2e/                      # End-to-end tests
├── developer_notes/          # Comprehensive developer documentation
├── docs/                     # Comprehensive specifications
├── output/                   # Generated files to keep (tracked by git)
└── tmp/                      # Temporary files (auto-cleaned, not tracked)
```

## Key Conventions

### File Organization Strategy

- **`output/`**: Permanent artifacts (spreadsheets, vocabularies, reports) - tracked by git
- **`tmp/`**: Temporary files - auto-cleaned, not tracked by git
- **`developer_notes/`**: Comprehensive documentation for developers and AI assistants
- **`docs/`**: Comprehensive specification documents

### Configuration Architecture

- **Centralized Configuration**: `packages/theme/src/config/siteConfig.ts` - single source of truth
- **No Environment Files**: Replaced .env files with TypeScript configuration matrix
- **Type-Safe URLs**: Environment-aware URL generation across all sites

### Site Structure (Docusaurus)

Each standard site follows this pattern:
```
standards/{SITE}/
├── docs/                     # Markdown documentation
├── src/                      # Custom components and pages
├── static/                   # Static assets
├── docusaurus.config.ts      # Site-specific configuration
├── sidebars.ts              # Navigation structure
└── package.json             # Site dependencies
```

### Admin Portal Structure (Next.js)

```
apps/admin/
├── src/
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities and configurations
│   └── types/                # TypeScript definitions
├── public/                   # Static assets
└── next.config.js           # Next.js configuration
```

## Import Patterns

### Theme Package Imports
```typescript
import { SiteLink } from '@ifla/theme/components';
import { getSiteConfig } from '@ifla/theme/config';
import { validateUrl } from '@ifla/theme/utils';
```

### Site Configuration Usage
```typescript
import { getSiteConfig, mapDocsEnvToEnvironment } from '@ifla/theme/config';

const siteConfig = getSiteConfig('portal', 'production');
const environment = mapDocsEnvToEnvironment(process.env.DOCS_ENV);
```

## Testing Organization

- **Unit Tests**: Co-located with source files (`*.test.ts`)
- **Integration Tests**: `e2e/` directory with Playwright
- **Build Regression**: `scripts/test-site-builds.js`
- **Visual Regression**: `tests/visual-regression.spec.ts`
- **Scripts Tests**: Co-located with scripts (`scripts/*.test.ts`) with isolated Nx configuration

## Build Artifacts

### Nx Cache
- **Location**: `.nx/cache/`
- **Purpose**: Build and test result caching
- **Management**: Automatic cleanup via Nx

### Site Builds
- **Docusaurus**: `{site}/build/` directories
- **Next.js**: `apps/admin/.next/` and `apps/admin/dist/`
- **Theme**: `packages/theme/dist/`

## Port Allocation

Standard development ports:
- **Portal**: 3000
- **ISBDM**: 3001
- **LRM**: 3002
- **FRBR**: 3003
- **ISBD**: 3004
- **Muldicat**: 3005
- **UNIMARC**: 3006
- **Admin**: 3007
- **Newtest**: 3008

## Documentation Patterns

- **Developer Notes**: Comprehensive guides in `developer_notes/`
- **API Documentation**: Generated from TypeScript interfaces
- **Component Documentation**: Storybook-style examples in theme package
- **Developer Notes: Documented in `developer_notes/` with clear status (CURRENT/DEPRECATED)
- **Architecture Decisions**: Documented in `docs/` 
