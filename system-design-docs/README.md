# IFLA Standards Platform - System Design Documentation

**Version:** 2.0  
**Date:** July 2025  
**Status:** Current Architecture

## Overview

This directory contains the comprehensive system design documentation for the IFLA Standards Platform. These documents consolidate and update all previous design specifications, incorporating the latest architectural decisions and implementation patterns.

## 🎯 Quick Platform Reference

**Working on the Admin Portal?** (Next.js, MUI, Tailwind)
- Start with **[Doc 20 - Platform-Specific Architecture Guide](./20-platform-specific-architecture-guide.md)**
- Location: `apps/admin/`
- Tests: `apps/admin/src/test*/`, `apps/admin/e2e/`
- API Routes: `apps/admin/src/app/api/`

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
34. **[Accessibility Best Practices](./34-accessibility-best-practices.md)** - 🆕 Standards leadership approach to digital accessibility

### Security & Authorization
12. **[RBAC Authorization Model](./12-rbac-authorization-model.md)** - Comprehensive role-based access control specification
13. **[Permission Matrix Detailed](./13-permission-matrix-detailed.md)** - Detailed permission mappings for all platform activities
14. **[RBAC Implementation](./14-rbac-implementation.md)** - Current custom RBAC implementation using Clerk publicMetadata

### Platform-Specific Guidance
20. **[Platform-Specific Architecture Guide](./20-platform-specific-architecture-guide.md)** - 🆕 Comprehensive guide distinguishing Next.js admin from Docusaurus sites

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
- Distributed storage across multiple systems
- Five-phase progressive testing strategy
- Centralized TypeScript configuration matrix
- Role-based workflow governance
- Environment-aware basePath handling

### Recent Updates (December 2024 - July 2025)
- Migration from 36+ environment files to centralized configuration
- Introduction of OMR25 vocabulary management system
- Enhanced testing strategy with Nx optimizations
- Simplified environment structure (local/preview/production)
- Admin portal basePath architecture implementation

## Task-Based Navigation

### 🎯 Platform-Specific Starting Points
- **Working on Admin Portal (Next.js)** → Start with Doc 20, then 1, 5, 11 (MUI section)
- **Working on Documentation Sites (Docusaurus)** → Start with Doc 20, then 1, 3, 11 (Infima section)
- **Understanding platform differences** → **Doc 20** (comprehensive guide)

### 🚀 Getting Started & Project Setup
- **New to the project** → Docs 1, 20 (platform guide), 10
- **Environment configuration** → Doc 3, plus `developer_notes/`
- **Understanding the architecture** → Docs 1, 2, 7, 20

### 🔌 API Development [Admin Portal Only]
- **Adding new API endpoints** → Docs 20 (admin API patterns), 5, 14 (RBAC)
- **Next.js API routes** → Docs 20, 5, 2 (data patterns)
- **Database schema changes** → Doc 2, plus migration guides
- **Authentication implementation** → Docs 12, 14
- **Authorization & permissions** → Docs 12, 13, 14

### 🎨 UI Component Development
#### Admin Portal (Next.js)
- **Building MUI components** → Docs 20 (MUI section), 11 (admin patterns)
- **Using Tailwind CSS** → Doc 20 (admin styling)
- **Component location** → Doc 20 (`apps/admin/src/components/`)
- **Implementing permissions in UI** → Docs 12, 13

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
- **AI testing guide** → `developer_notes/AI_TESTING_INSTRUCTIONS.md`
- **Test templates** → `developer_notes/TEST_TEMPLATES.md`

### 📊 Import/Export Features [Admin Portal]
- **Spreadsheet import/export** → **Doc 33** (implementation checklist)
- **Dynamic data operations** → Doc 20 (admin data flow)
- **Google Sheets integration** → Doc 33, plus `tools/sheet-sync/`
- **Data validation patterns** → Docs 2, 33

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
- **Protected routes** → Doc 20 (admin auth section)

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
- **Phase 1 Import/Export** → **Doc 33** (active checklist)
- **Platform distinctions** → **Doc 20** (NEW - must read)
- **PRD compliance** → **PRD-CONFORMANCE-REPORT.md**
- **MVP scope management** → Doc 10, PRD-CONFORMANCE-REPORT.md

## Role-Based Navigation

- **For new developers**: Start with Doc 20 (platform guide), then 1, 3, and 6
- **For frontend developers (Admin)**: Focus on Docs 20, 11 (MUI), 5 (API integration)
- **For frontend developers (Docs)**: Focus on Docs 20, 11 (Infima), 3 (configuration)
- **For backend developers**: Review Docs 20 (admin sections), 5, 2, 14
- **For architects**: Focus on documents 1, 2, 5, 7, 8, and 20
- **For operations**: Review documents 6, 10, 20 (deployment sections)
- **For project managers**: See documents 4, 9, 10, and 11
- **For security & compliance**: Focus on documents 12, 13, 14 for RBAC
- **For administrators**: Review documents 12, 13, 14 for role management

## Document Status

These documents represent the current state of the IFLA Standards Platform as of July 2025. They supersede all previous design documents, incorporating:
- Lessons learned from initial implementation
- Performance optimizations
- Simplified configuration approach
- Enhanced testing and quality gates
- Improved developer experience

## Related Resources

- `/developer_notes/` - Implementation notes and guides
- `/docs/` - API and workflow documentation
- `/.kiro/` - Recent specifications and steering documents
- `/CLAUDE.md` - AI assistant context and guidelines
