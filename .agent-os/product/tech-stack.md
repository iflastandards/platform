# Technical Stack

## Frontend Architecture

**Application Framework:** Next.js 15.4.4 (Admin Portal)  
**Documentation Framework:** Docusaurus 3.8.1 (Standards Sites)  
**JavaScript Framework:** React 19.1.1  
**TypeScript:** 5.8.3 (strict mode)  
**Package Manager:** pnpm 10.15.0 with workspace protocol  

## Styling and UI

**CSS Framework:** Tailwind CSS 4.1.11 (Admin), Infima CSS + SCSS (Documentation)  
**UI Component Library:** Ant Design 5.22.6 (Admin), Custom theme components (Documentation)  
**Fonts Provider:** Google Fonts (@fontsource/roboto)  
**Icon Library:** @ant-design/icons 5.5.2, Lucide React 0.536.0  

## Backend and Data

**Database System:** Supabase (PostgreSQL)  
**Authentication:** Clerk latest with GitHub OAuth and RBAC  
**API Layer:** Next.js API Routes + @refinedev/core 4.57.11  
**Data Storage:** Git (primary source of truth), Supabase (metadata)  
**RDF Processing:** N3.js 1.26.0, JSONLD 8.3.3, rdfxml-streaming-parser 3.1.0  

## Development and Build

**Build System:** Nx 21.4.0 (monorepo orchestration)  
**Bundler:** Turbopack (admin dev), Webpack (documentation)  
**Compiler:** SWC 1.13.2 with TypeScript support  
**Task Running:** Nx with distributed caching (Nx Cloud 19.1.0)  
**Development Servers:** Custom orchestration with port management  

## Testing and Quality

**Unit Testing:** Vitest 3.2.4 with @vitest/coverage-v8  
**E2E Testing:** Playwright 1.54.2 with axe-core accessibility testing  
**API Mocking:** MSW 2.10.5 with deterministic test data  
**Linting:** ESLint 9.32.0 with TypeScript rules and React hooks  
**Code Formatting:** Prettier 3.6.2 with automated fixes  
**Testing Strategy:** Tag-based testing (@unit, @integration, @e2e, @critical)  

## Monorepo Architecture

**Applications:**
- `apps/admin/` - Next.js 15.4 admin portal with Ant Design UI
- `apps/docs/` - Docusaurus admin documentation site
- `portal/` - Main portal Docusaurus site
- `standards/FRBR/` - FRBR standard documentation site
- `standards/LRM/` - LRM standard documentation site  
- `standards/ISBD/` - ISBD standard documentation site
- `standards/ISBDM/` - ISBDM standard documentation site
- `standards/MULDICAT/` - MULDICAT standard documentation site
- `standards/UNIMARC/` - UNIMARC standard documentation site

**Packages:**
- `packages/theme/` - Shared Docusaurus theme and components
- `packages/contracts/` - TypeScript schemas and OpenAPI definitions
- `packages/dev-servers/` - Development server orchestration utilities
- `packages/unified-spreadsheet/` - CSV/Excel processing with ExcelJS 4.4.0
- `packages/eslint-config/` - Shared ESLint configuration

## Hosting and Deployment

**Documentation Hosting:** GitHub Pages with custom domain  
**Admin Portal Hosting:** TBD (likely Vercel or similar)  
**Database Hosting:** Supabase Cloud  
**Asset Hosting:** GitHub Pages with CDN optimization  
**Deployment Pipeline:** GitHub Actions with Nx affected builds  
**Domain Management:** GitHub Pages custom domain with SSL  

## Development Workflow

**Version Control:** Git with GitHub, feature branch workflow  
**CI/CD Pipeline:** GitHub Actions with 5-phase testing validation  
**Dependency Management:** pnpm workspace with lockfile consistency  
**Code Quality:** Pre-commit hooks with lint-staged and Husky 9.1.7  
**Performance Monitoring:** Lighthouse CI integration  
**Development Tools:** Nx Console, TypeScript strict mode, ESLint autofix  

## Command-Line Tools

**Vocabulary Processing:** Custom TypeScript scripts for CSV/RDF conversion  
**Site Generation:** Automated site scaffolding with templates  
**Testing Utilities:** Tagged test execution with parallel processing  
**Build Optimization:** Nx affected commands for efficient CI/CD  
**Development Servers:** Multi-site orchestration with port management  

## Security and Compliance

**Authentication Provider:** Clerk with organization-level RBAC  
**Secret Management:** GitHub Secrets with secretlint validation  
**Content Security:** DOMPurify 3.2.6 for sanitization  
**HTTPS Enforcement:** GitHub Pages SSL with custom domain  
**Dependency Scanning:** Automated security updates via Dependabot  

## Code Repository

**Primary Repository:** Private GitHub repository with comprehensive documentation  
**Documentation Deployment:** Automated GitHub Pages deployment  
**Admin Portal Deployment:** TBD - likely separate deployment pipeline  
**Backup Strategy:** Git-based distributed version control with GitHub redundancy  
**Documentation Strategy:** Comprehensive README files, inline code documentation, system design docs