# IFLA Standards Platform - System Design Documentation

**Version:** 2.0  
**Date:** July 2025  
**Status:** Current Architecture

## Overview

This directory contains the comprehensive system design documentation for the IFLA Standards Platform. These documents consolidate and update all previous design specifications, incorporating the latest architectural decisions and implementation patterns.

## 🎯 Quick Platform Reference

**Working on the Admin Portal?** (Next.js, MUI Theme)
- Start with **[Doc 20 - Platform-Specific Architecture Guide](./20-platform-specific-architecture-guide.md)**
- Location: `apps/admin/`
- Tests: `apps/admin/src/test*/`, `apps/admin/e2e/`
- API Routes: `apps/admin/src/app/api/`
- **UI Components: Material-UI with MUI theme (NO Tailwind CSS)**

**Working on Documentation Sites?** (Docusaurus, Infima, SASS)
- Start with **[Doc 20 - Platform-Specific Architecture Guide](./20-platform-specific-architecture-guide.md)**
- Location: `standards/*/`
- Tests: `packages/theme/src/tests/`
- No API routes - static generation only

## Document Structure

### Core Architecture Documents
1. **[System Architecture Overview](./01-system-architecture-overview.md)** - High-level architecture, technology stack, and design principles
2. **[Data Architecture](./02-data-architecture.md)** - Data storage strategy, models, and flow patterns
3. **[Configuration Architecture](./03-configuration-architecture.md)** - Site configuration, environment management, and routing

### Development & Workflow
4. **[Development Workflow](./04-development-workflow.md)** - Standards development lifecycle, roles, and processes
5. **[API Architecture](./05-api-architecture.md)** - API design, authentication, and integration patterns
6. **[Testing Strategy](./06-testing-strategy.md)** - Five-phase testing approach and quality gates

### System Components
7. **[Subsystems Architecture](./07-subsystems-architecture.md)** - Major platform subsystems and their interactions
8. **[Architecture Evolution](./08-architecture-evolution.md)** - How the architecture has evolved and future directions
9. **[Collaboration Architecture](./09-collaboration-architecture.md)** - GitHub-based collaboration model and workflows
10. **[Implementation Strategy](./10-implementation-strategy.md)** - Phased implementation approach and timeline

### UI/UX & Design
11. **[Design System and UI Patterns](./11-design-system-ui-patterns.md)** - UI/UX guidelines and component library
34. **[Accessibility Best Practices](./34-accessibility-best-practices.md)** - Standards leadership approach to digital accessibility

### Security & Authorization
12. **[RBAC Authorization Model](./12-rbac-authorization-model.md)** - Comprehensive role-based access control specification
13. **[Permission Matrix Detailed](./13-permission-matrix-detailed.md)** - Detailed permission mappings for all platform activities
14. **[RBAC Implementation](./14-rbac-implementation.md)** - Current custom RBAC implementation using Clerk publicMetadata

### Organization & Teams
16. **[Projects, Teams, and Review Groups Architecture](./16-projects-teams-review-groups-architecture.md)** - Organizational structure and team management

### Platform-Specific Guidance
20. **[Platform-Specific Architecture Guide](./20-platform-specific-architecture-guide.md)** - Comprehensive guide distinguishing Next.js admin from Docusaurus sites

### Import/Export & Data Management
31. **[Spreadsheet Export/Import Comprehensive Guide](./31-spreadsheet-export-import-comprehensive-guide.md)** - Complete round-trip workflow for vocabulary management
32. **[Phase 1 Import/Export Implementation Plan](./32-phase1-import-export-implementation-plan.md)** - Initial implementation roadmap
33. **[Spreadsheet Import/Export Implementation Checklist](./33-spreadsheet-import-export-implementation-checklist.md)** - Active implementation checklist

### Development Standards
35. **[AI Development Guidelines](./35-ai-development-guidelines.md)** - 🆕 Comprehensive guidelines for AI-assisted development
36. **[Platform Coding Standards](./36-platform-coding-standards.md)** - 🆕 Coding standards for Next.js, TypeScript, and platform patterns

### Feature Architecture
37. **[Vocabulary Management Architecture](./37-vocabulary-management-architecture.md)** - 🆕 Complete vocabulary lifecycle and management system

## Quick Reference

### Technology Stack
- **Monorepo**: Nx 21.2.2 with pnpm workspace
- **Frontend**: React 19.1.0, TypeScript 5.7
- **Documentation**: Docusaurus 3.8+
- **Admin Portal**: Next.js 15.2.5 with App Router
- **Backend**: Render API endpoints
- **Authentication**: Clerk
- **Authorization**: Custom RBAC via Clerk publicMetadata
- **Database**: Supabase (operational data)
- **Version Control**: Git/GitHub (source of truth)
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Nx Cloud

### Key Architectural Decisions
- Git as single source of truth for all vocabulary data
- MDX with RDF front matter for vocabulary definitions
- Distributed storage across multiple systems
- Five-phase progressive testing strategy
- Four-phase vocabulary lifecycle management
- Centralized TypeScript configuration matrix
- Role-based workflow governance
- Platform serves from root (no basePath)

### Recent Updates (December 2024 - August 2025)
- Migration from 36+ environment files to centralized configuration
- Introduction of OMR25 vocabulary management system
- Enhanced testing strategy with Nx optimizations
- Simplified environment structure (local/preview/production)
- Platform now serves from root (basePath removed)
- MDX-based vocabulary management with RDF front matter
- Four-phase vocabulary lifecycle implementation
- AI development guidelines and coding standards

## Task-Based Navigation

### 🎯 Platform-Specific Starting Points
- **Working on Admin Portal (Next.js)** → Start with Doc 20, then 1, 5, 11 (MUI section), 36
  - **IMPORTANT: Use Material-UI components exclusively - NO Tailwind CSS classes**
- **Working on Documentation Sites (Docusaurus)** → Start with Doc 20, then 1, 3, 11 (Infima section), 36
- **Understanding platform differences** → **Doc 20** (comprehensive guide)
- **AI-assisted development** → **Doc 35** (AI guidelines), then 36 (coding standards)

### 🚀 Getting Started & Project Setup
- **New to the project** → Docs 1, 20 (platform guide), 10, 35 (AI guidelines)
- **Environment configuration** → Doc 3, plus `developer_notes/`
- **Understanding the architecture** → Docs 1, 2, 7, 20
- **Coding standards** → Doc 36 (platform standards), 35 (AI guidelines)

### 🔌 API Development [Admin Portal Only]
- **Adding new API endpoints** → Docs 20 (admin API patterns), 5, 14 (RBAC)
- **Next.js API routes** → Docs 20, 5, 2 (data patterns)
- **Database schema changes** → Doc 2, plus migration guides
- **Authentication implementation** → Docs 12, 14
- **Authorization & permissions** → Docs 12, 13, 14

### 🎨 UI Component Development
#### Admin Portal (Next.js)
- **Building MUI components** → Docs 20 (MUI section), 11 (admin patterns)
- **Styling approach** → **Material-UI theme system ONLY (NO Tailwind CSS)**
- **Component location** → Doc 20 (`apps/admin/src/components/`)
- **Implementing permissions in UI** → Docs 12, 13
- **Theme customization** → Use MUI's `createTheme()` and `ThemeProvider`

#### Documentation Sites (Docusaurus)
- **Building Infima components** → Docs 20 (Infima section), 11 (docs patterns)
- **Using SASS/SCSS** → Doc 20 (docs styling)
- **Component location** → Doc 20 (`packages/theme/src/components/`)
- **MDX components** → Docs 20, 3

### 🧪 Testing Implementation
#### Admin Portal Testing
- **Unit tests location** → Doc 20 (`apps/admin/src/**/__tests__/`)
- **Integration tests** → Doc 20 (`apps/admin/src/tests/`)
- **E2E tests** → Doc 20 (`apps/admin/e2e/`)
- **API route testing** → Docs 6, 20

#### Docusaurus Testing
- **Component tests** → Doc 20 (`packages/theme/src/tests/components/`)
- **Build tests** → Doc 20 (`standards/*/tests/build/`)
- **Static site testing** → Docs 6, 20

#### General Testing
- **5-phase testing strategy** → Doc 6
- **AI testing guide** → **Doc 35** (AI development guidelines)
- **Test placement** → Doc 35 (decision tree)
- **Test templates** → Doc 35 (examples)

### 📊 Import/Export Features [Admin Portal]
- **Spreadsheet import/export** → **Doc 31** (comprehensive guide), **Doc 33** (checklist), **Doc 37** (architecture)
- **Vocabulary management** → **Doc 37** (complete lifecycle)
- **Four-phase lifecycle** → Docs 2, 31, 37
- **Google Sheets integration** → Docs 31, 33, 37, plus `tools/sheet-sync/`
- **DCTAP validation** → Docs 31, 33, 37

### 🔄 RDF & Semantic Processing [Both Platforms]
- **RDF generation (build-time)** → Doc 2, Docusaurus static generation
- **RDF API endpoints (runtime)** → Doc 5, Admin portal APIs
- **DCTAP profile handling** → Doc 33, plus converter documentation
- **Static RDF serving** → Doc 20 (Docusaurus static files)

### 📚 Docusaurus Site Management
- **Adding new vocabulary sites** → Docs 20, 3 (configuration), 4 (workflow)
- **Site scaffolding** → Doc 3, plus `scripts/scaffold-site.ts`
- **Static content management** → Doc 20 (MDX patterns)
- **Multi-site configuration** → Doc 3
- **Infima theming** → Doc 20 (styling section)

### 🔐 Authentication & Authorization [Admin Portal Only]
- **Clerk integration** → Docs 20, 14 (current implementation)
- **RBAC system** → Docs 12, 13, 14
- **Permission matrix** → Doc 13
- **Team structure** → Doc 16 (projects, teams, review groups)
- **Protected routes** → Doc 20 (admin auth section)
- **withAuth middleware** → Doc 14 (implementation pattern)

### ⚡ Performance & Optimization
#### Admin Portal
- **SSR/CSR optimization** → Doc 20 (admin architecture)
- **API response caching** → Docs 1, 20
- **Dynamic imports** → Doc 20

#### Docusaurus Sites
- **Static generation** → Doc 20 (SSG patterns)
- **Build-time optimization** → Docs 1, 20
- **CDN strategy** → Doc 20

#### General
- **Nx configuration** → Doc 1, plus `nx.json`
- **Caching strategies** → Doc 1, Doc 8 (evolution)

### 🚢 Deployment & CI/CD
- **Admin deployment (Render)** → Docs 20, 10
- **Docs deployment (GitHub Pages)** → Docs 20, 10
- **5-phase CI/CD strategy** → Doc 6, Doc 10
- **Environment management** → Doc 3, Doc 10

### 📋 Current Implementation Priorities
- **Vocabulary management** → **Doc 37** (complete architecture)
- **Import/Export workflow** → **Docs 31, 33** (implementation guides)
- **AI-assisted development** → **Doc 35** (guidelines)
- **Coding standards** → **Doc 36** (platform standards)
- **Platform distinctions** → **Doc 20** (must read)
- **PRD compliance** → **PRD-CONFORMANCE-REPORT.md**

## Role-Based Navigation

- **For new developers**: Start with Doc 20 (platform guide), Doc 35 (AI guidelines), then 1, 3, 6, 36
- **For frontend developers (Admin)**: Focus on Docs 20, 11 (MUI), 5 (API integration), 36 (standards)
- **For frontend developers (Docs)**: Focus on Docs 20, 11 (Infima), 3 (configuration), 36 (standards)
- **For backend developers**: Review Docs 20 (admin sections), 5, 2, 14, 37 (vocabulary)
- **For architects**: Focus on documents 1, 2, 5, 7, 8, 20, 37
- **For operations**: Review documents 6, 10, 20 (deployment sections), 31-33 (import/export)
- **For project managers**: See documents 4, 9, 10, 11, 16 (teams)
- **For security & compliance**: Focus on documents 12, 13, 14, 34 (accessibility)
- **For administrators**: Review documents 12, 13, 14, 16 (teams) for role management
- **For AI assistants**: Start with Doc 35 (AI guidelines), then 36 (standards), 20 (platform)

## Document Status

These documents represent the current state of the IFLA Standards Platform as of August 2025. They supersede all previous design documents, incorporating:
- Lessons learned from initial implementation
- MDX-based vocabulary management system
- Four-phase vocabulary lifecycle
- AI development guidelines
- Performance optimizations
- Simplified configuration approach (no basePath)
- Enhanced testing and quality gates
- Improved developer experience

## Related Resources

- `/developer_notes/` - Implementation notes and guides
- `/docs/` - API and workflow documentation
- `/.kiro/` - Recent specifications and steering documents
- `/CLAUDE.md` - AI assistant context and guidelines
