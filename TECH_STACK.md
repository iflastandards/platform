# Tech Stack

## Context

Global tech stack defaults for IFLA Standards Platform, a monorepo with separate substacks for documentation sites and admin application.

## Core Monorepo Infrastructure

- **Monorepo Tool**: Nx 21.3.11
- **Package Manager**: pnpm 10.13.1
- **Node Version**: 22 LTS
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.0.6 (for packages), Next.js (for admin), Docusaurus (for sites)
- **Import Strategy**: ES modules with workspace aliases
- **CSS Framework**: TailwindCSS 4.1.11
- **Testing Framework**: Vitest 3.2.4 + Playwright 1.50.1
- **Linting**: ESLint 9.32.0 with TypeScript ESLint 8.38.0
- **Code Formatting**: Prettier 3.6.2

## Docusaurus Substack (Documentation Sites)

- **Framework**: Docusaurus 3.8.1
- **React Version**: React 19.1.1
- **Content Format**: MDX 3.1.0
- **Styling**: Sass 1.89.2 + Custom CSS
- **Search**: @easyops-cn/docusaurus-search-local 0.52.1
- **Themes**: Classic + Mermaid
- **Plugins**: Client redirects, Content docs, Sass plugin
- **Sites**: portal, isbd, isbdm, unimarc, mri, frbr, lrm, mia, pressoo, muldicat
- **Build Output**: Static HTML/CSS/JS
- **Development**: Hot reload with live editing

## Next.js Substack (Admin Application)

- **Framework**: Next.js 15.4.4 with App Router
- **React Version**: React 19.1.1
- **Authentication**: Clerk (latest)
- **Database**: Supabase (PostgreSQL)
- **ORM/Client**: Supabase JS 2.53.0
- **API Layer**: Next.js App Router API routes with standard fetch
- **State Management**: Not currently implemented (TanStack Query available but unused)
- **UI Components**: Material-UI 7.2.0 + Lucide React 0.536.0
- **Forms**: Not currently implemented (React Hook Form available but unused)
- **Validation**: Not currently implemented (Zod available but unused)
- **Styling**: TailwindCSS 4.1.11 + Material-UI theming
- **Development**: Turbopack for fast refresh

## Shared Libraries & Utilities

- **Theme Package**: @ifla/theme (workspace package)
- **Dev Servers**: @ifla/dev-servers (workspace package)
- **ESLint Config**: @ifla/eslint-config (workspace package)
- **Data Processing**: ExcelJS 4.4.0, PapaParse 5.5.3 (dynamic import), CSV utilities
- **RDF/Semantic**: N3 1.26.0, JSON-LD 8.3.3 (available but minimal usage)
- **HTTP Client**: Node Fetch 3.3.2
- **Date Handling**: date-fns 4.1.0 (available but unused)
- **Icons**: Lucide React 0.536.0
- **Fonts**: Fontsource Roboto 5.2.6

## Development & Testing

- **Git Hooks**: Husky 9.1.7
- **Pre-commit**: Lint-staged 16.1.2 + Secretlint 10.2.2
- **Test Types**: Unit (Vitest), Integration (Vitest), E2E (Playwright)
- **Coverage**: Vitest Coverage V8 3.2.4
- **Visual Testing**: Playwright with snapshot testing
- **Performance**: Bundle analysis, Nx caching, parallel execution

## Deployment & Hosting

- **Preview Environment**: GitHub Pages (iflastandards.github.io/platform)
- **Production Environment**: GitHub Pages (www.iflastandards.info)
- **Admin Preview**: Render.com (admin-iflastandards-preview.onrender.com)
- **Admin Production**: Render.com (admin.iflastandards.info)
- **CI/CD Platform**: GitHub Actions
- **Build Caching**: Nx Cloud with distributed builds
- **Asset Storage**: GitHub Pages static hosting
- **Database Hosting**: Supabase managed PostgreSQL
- **Environment Management**: Branch-based (preview/main)

## External Integrations

- **Authentication Provider**: Clerk
- **Database Service**: Supabase
- **Spreadsheet API**: Google Sheets API
- **Version Control**: GitHub with automated workflows
- **Monitoring**: Health check endpoints
- **Search**: Local search with indexing