# IFLA Standards Platform - Product Analysis

## Executive Summary

The IFLA Standards Platform is a large-scale, enterprise monorepo application for managing international library standards and vocabularies. It combines a Next.js admin portal with multiple Docusaurus documentation sites, built on modern web technologies with a focus on accessibility, internationalization, and collaborative standards development.

## Core Technologies

### Frontend Stack
- **React 19.1.1** - Latest React with concurrent features
- **Next.js 15.4.4** - Admin portal with App Router
- **TypeScript 5.8.3** - Type-safe development
- **Material-UI 7** - Component library for admin
- **Docusaurus 3.8+** - Static documentation sites

### Infrastructure
- **Nx 21.3.11** - Monorepo orchestration
- **pnpm** - Package management
- **Clerk** - Authentication service
- **Supabase** - Database/backend
- **GitHub Actions** - CI/CD pipeline
- **Vitest + Playwright** - Testing framework

## Architecture Overview

### Monorepo Structure
```
standards-dev/
├── apps/
│   └── admin/              # Next.js admin portal
├── standards/              # Multiple Docusaurus sites
│   ├── FRBR/
│   ├── isbd/
│   ├── ISBDM/
│   ├── LRM/
│   ├── muldicat/
│   └── unimarc/
├── packages/               # Shared packages
│   ├── theme/              # Shared UI components
│   ├── dev-servers/        # Development tools
│   ├── unified-spreadsheet/ # Data import/export
│   └── eslint-config/      # Shared configs
└── portal/                 # Main documentation portal
```

### Key Architectural Decisions
- **Git as Source of Truth** - All vocabulary data in version control
- **MDX-based Content** - Vocabulary definitions with RDF front matter
- **Custom RBAC** - Role-based access via Clerk publicMetadata
- **5-Phase Testing** - Progressive testing strategy
- **No basePath** - Platform serves from root
- **Hybrid Rendering** - SSR/CSR for admin, SSG for docs

## Platform Components

### Admin Portal (Next.js)
- **Purpose**: Vocabulary lifecycle management, user administration
- **Features**: Import/export workflows, translation management, version publishing
- **Authentication**: Clerk with custom RBAC implementation
- **API**: Next.js API routes with Supabase backend
- **UI**: Material-UI theme system (no Tailwind)

### Documentation Sites (Docusaurus)
- **Purpose**: Public vocabulary documentation and browsing
- **Features**: Multilingual content, static RDF serving, community engagement
- **Rendering**: Static site generation at build time
- **Styling**: Infima CSS framework with SASS/SCSS
- **Content**: MDX files with RDF metadata

## Development Workflow

### Commands & Scripts
- **600+ npm scripts** for comprehensive automation
- **Nx-powered** task orchestration with caching
- **Phase-aligned testing** (pre-commit, pre-push, CI)
- **Automated deployment** via GitHub Actions

### Testing Strategy
1. **Phase 1**: Selective development tests
2. **Phase 2**: Pre-commit hooks (unit, lint, typecheck)
3. **Phase 3**: Pre-push integration tests
4. **Phase 4**: Comprehensive release validation
5. **Phase 5**: CI environment verification

## Summary

The IFLA Standards Platform represents a sophisticated, production-grade web application built with modern technologies and best practices. Its monorepo architecture enables efficient code sharing while maintaining clear separation between the admin portal and documentation sites.
EOF < /dev/null