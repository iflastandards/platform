# AGENTS.md

> **Note:** This document has been updated to include the core architectural principles from the "Prime Directive." Please review the new **"Prime Directive: Core Principles for `apps/admin`"** section for the fundamental rules governing all development work on the admin application.

Essential guidance for coding agents working in this IFLA Standards monorepo.

---

## Tech Stack Overview

### Core Monorepo Infrastructure
- **Monorepo Tool**: Nx 21.3.11
- **Package Manager**: pnpm 10.13.1 (ALWAYS use pnpm, never npm/yarn)
- **Node Version**: 22 LTS
- **Language**: TypeScript 5.8.3
- **Build Tools**: Vite 7.0.6 (packages), Next.js 15.4.4 (admin), Docusaurus 3.8.1 (sites)
- **Testing**: Vitest 3.2.4 + Playwright 1.50.1
- **Linting**: ESLint 9.32.0 with TypeScript ESLint 8.38.0

### Docusaurus Substack (Documentation Sites)
- **Framework**: Docusaurus 3.8.1 with React 19.1.1
- **Sites**: portal, isbd, isbdm, unimarc, mri, frbr, lrm, mia, pressoo, muldicat
- **Content**: MDX 3.1.0 format
- **Styling**: Sass 1.89.2 + TailwindCSS 4.1.11
- **Search**: @easyops-cn/docusaurus-search-local 0.52.1

### Next.js Substack (Admin Application)
- **Framework**: Next.js 15.4.4 with App Router + React 19.1.1
- **Authentication**: Clerk middleware with custom RBAC in user metadata
- **Database**: Supabase (PostgreSQL) with Supabase JS 2.53.0
- **API Layer**: Next.js App Router API routes (/app/api/*) with standard fetch (NOT tRPC)
- **Authorization**: Custom role-based system using Clerk publicMetadata
- **State Management**: TanStack Query 5.83.0
- **UI Components**: Ant Design 5.23.8
- **Forms**: React Hook Form 7.61.1 + Zod 4.0.14 validation
- **Styling**: Ant Design theme system with ConfigProvider

---

## Prime Directive: Core Principles for `apps/admin`

These are the non-negotiable architectural laws for the `apps/admin` project. Adherence is mandatory.

### 1. Core Philosophy: The "Why"

- **Contracts are the Single Source of Truth:** All data shapes are defined once in `/packages/contracts` using Zod. The entire application (UI, adapters, tests) consumes these contracts.
- **Type-Safety is Non-Negotiable:** Data is validated with Zod at every boundary, especially from external APIs. The `any` type is forbidden for data structures.
- **Develop Mock-First, Live-Second:** Every feature must be fully functional and testable using a mock service layer (MSW) before it is connected to a live backend service.
- **The `dataProvider` is the Sole Gateway:** UI components are "dumb" and do not fetch data directly. All data operations (CRUD, etc.) **must** be routed through the single, centralized `refine.dev` `dataProvider`.
- **Standardize on the Unified Job Model:** All long-running, asynchronous operations must be modeled as a `Job` using the master `Job.zod.ts` schema for consistent tracking and UI.
- **Build for Everyone (Accessibility):** All features **must** conform to WCAG 2.1 Level AA. This includes full keyboard navigability, screen reader compatibility (semantic HTML/ARIA), and sufficient color contrast.

### 2. Architectural Blueprint: The "Where"

File placement within `/apps/admin/` is strict and predictable.

- `/src/app/`: **Pages.** All Next.js App Router pages, organized by `refine` resource (e.g., `/jobs/[id]/page.tsx`).
- `/src/providers/`: **Data Layer.**
  - `dataProvider.ts`: The central data provider with mock/live switching logic.
  - `/adapters/`: Modules that interact with live services (e.g., `supabaseJobs.adapter.ts`). They fetch, transform, and **validate** data.
- `/src/mocks/`: **Mock Service Layer.**
  - `handlers.ts`: MSW request handlers that intercept API calls and return mock data.
  - `fixtures.ts`: Functions to generate dynamic mock data.
- `/src/components/`: **Shared UI.** Reusable React components.

### 3. Implementation Guardrails: The "How"

- **Data Flow:** The data lifecycle is always: `UI Component` -> `refine Hook (e.g., useList)` -> `dataProvider` -> `Service Adapter` -> `Live API / MSW`.
- **Validation:** Every function within a service adapter that receives external data **must** parse it with its corresponding Zod schema before returning it. Throw a structured error on failure.
- **State Management:** Server state, caching, and re-fetching are managed by `refine` and `@tanstack/react-query`. Do not use `useState` for server data.
- **UI Components:** Use Ant Design (`antd`) components wherever possible. Custom styling should be minimal and handled via the theme.
- **Authentication & Authorization:** Auth is handled by Clerk. RBAC is implemented by checking `user.publicMetadata` on both the frontend (to hide/disable UI) and backend (to secure API endpoints).
- **Decision-Making Precedent:** When in doubt, use the existing "RDF Builds" feature as your primary reference and template. It exemplifies the correct implementation of all principles.

---

## Specialized Task Guidance (Domain-Specific Prompts)

While this document contains the core principles, the following documents provide detailed, mandatory instructions for specific development tasks. Always consult the relevant guide *after* reviewing the Prime Directive.

- **System Architecture & Guiding Principles:** The source of truth for the Prime Directive.
  - `developer_notes/prompts/system-architecture-prime-directive.md`
- **Test Development Specification:** Detailed addendum for test creation.
  - `developer_notes/prompts/test-development-specification.md`
- **QA & Release Plan:** For Phase 5 QA and release verification procedures.
  - `developer_notes/prompts/qa-release-verification-plan.md`
- **Backend & Integration Planning:** For generating backend and integration strategies.
  - `developer_notes/prompts/backend-integration-plan-generation.md`
- **Feature Brief Generation:** For using the AI feature factory prompt.
  - `developer_notes/prompts/ai-brief-feature-factory.md`

---

## Commands
- **Build**: `pnpm nx build {site}` (e.g., `pnpm nx build portal`, `pnpm nx build admin`)
- **Dev server**: `pnpm nx start {site}` or `pnpm nx dev admin --turbopack` (Next.js with Turbopack)
- **Single test**: `pnpm nx test {project}` or `pnpm nx test --testNamePattern="test name"`
- **Test all**: `pnpm test` (pnpm nx affected parallel), `pnpm test:all` (all projects)
- **Server-dependent tests**: `cd apps/admin && pnpm test:server-dependent` (requires live servers)
- **Type check**: `pnpm typecheck` (pnpm nx affected parallel)
- **Lint**: `pnpm lint` (pnpm nx affected parallel), `pnpm lint:fix` for auto-fix
- **E2E**: `pnpm nx run standards-dev:e2e` or `pnpm nx run {site}:e2e`

## Admin App Configuration
- **Routing**: Standard Next.js App Router
- **API routes**: Located at `/api/*`
- **Static assets**: Served from root
- **Links**: Use standard Next.js routing
- **Development**: Uses Turbopack for fast refresh

## Code Style
- **Imports**: Use path aliases (`@ifla/theme`, `@site/*`), remove unused imports (enforced)
- **Formatting**: Single quotes, Prettier config in `.prettierrc`
- **Types**: Prefer explicit types over `any` (warn level), use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` when needed
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **React**: No React import needed (JSX transform), hooks rules enforced
- **Error handling**: Use proper TypeScript error types, avoid generic catches
- **Comments**: DO NOT ADD comments unless explicitly requested

## ESLint Configuration
- **Centralized config**: All projects use `@ifla/eslint-config` shared package
- **Root config**: `eslint.config.mjs` imports from `@ifla/eslint-config`
- **Project configs**: Individual projects import the shared config with `import config from '@ifla/eslint-config'`
- **Consistent rules**: Same linting behavior across all projects (admin, docs, packages)
- **Test-specific rules**: Relaxed rules for test files (allows `any`, console logs, longer functions)
- **Auto-fix**: Use `pnpm lint:fix` to automatically fix unused imports and other fixable issues

## Critical Rules
- **NEVER** use `any` without eslint-disable comment
- **ALWAYS** run `pnpm typecheck && pnpm lint` after edits
- **ALWAYS** fix code to pass tests, never fix tests to pass
- **ALWAYS** ensure local validation (Phases 1-4) passes before pushing
- **NEVER commit secrets or API keys** - pre-commit hooks will block commits with secrets
- Use `workspaceUtils` in integration tests, not `process.cwd()`
- Include `experimental_faster: true` in all `docusaurus.config.ts` files

## MCP Server Usage Strategy
- **CRITICAL**: Default to using MCP servers for current API information rather than relying on potentially outdated training data
- **Always use Context7 MCP** for library documentation, API references, and implementation patterns
- **Knowledge drift problem**: Libraries evolve rapidly with breaking changes - my training data may be outdated
- **High-risk scenarios requiring MCP**: React 19, Next.js 15, Ant Design 5.x, TypeScript 5.8+, build tool configurations
- **Proactive MCP usage**: Check current docs even when I "think" I know the answer
- **Better to over-use MCP than provide outdated information** that causes bugs or frustration

## Tool Selection Decision Framework

### JetBrains Tools - Use When:
**Direct codebase operations are needed:**
- Finding specific functions, classes, or patterns in the codebase
- Making targeted edits to existing files
- Searching for implementations or usage patterns
- Running tests or build configurations
- Debugging with breakpoints
- File management and project structure exploration
- **JetBrains excels at**: Indexed codebase knowledge, precise search, direct manipulation, IDE integration

### Sequential Thinking - Use When:
**Complex problem-solving is required:**
- Multi-step architectural decisions
- Debugging complex issues that require hypothesis testing
- Planning implementation strategies
- Analyzing trade-offs between different approaches
- Breaking down large features into smaller tasks
- Understanding system interactions and dependencies
- **Sequential Thinking excels at**: Iterative reasoning, hypothesis generation, complex analysis, planning and design

### Decision Framework:
```
Is this a straightforward code task?
├─ YES → Use JetBrains directly
└─ NO → Is this complex/multi-faceted?
   ├─ YES → Start with Sequential Thinking
   └─ MAYBE → Use JetBrains first, fall back to Sequential Thinking if needed
```

### Hybrid Approach - Common Workflow:
1. **Sequential Thinking** to understand the problem and plan approach
2. **JetBrains** to explore the codebase and gather specific information
3. **Sequential Thinking** to synthesize findings and refine the plan
4. **JetBrains** to implement the solution

### Example Task Routing:
- "Find all uses of UserService" → **JetBrains**
- "Why is authentication failing intermittently?" → **Sequential Thinking** + JetBrains
- "Add a new API endpoint" → **JetBrains** (if pattern is clear)
- "Design a new feature architecture" → **Sequential Thinking** first
- "Debug this complex error" → **Sequential Thinking** to analyze, **JetBrains** to investigate
- "Refactor this component" → **JetBrains** (if straightforward), **Sequential Thinking** (if architectural implications)

## Testing Philosophy & Strategy
- **Integration-first approach**: Prefer real I/O and actual data over mocks
- **5-phase testing strategy**: Selective → Pre-commit → Pre-push → Comprehensive → CI
- **MANDATORY**: Read `developer_notes/TESTING_QUICK_REFERENCE.md` before writing tests
- **Templates**: Use `developer_notes/TEST_TEMPLATES.md` for proper test structure
- **Default to @integration tests** with real files, databases, and services
- **Use @unit tests only for pure functions** (rare)
- **Command format**: `pnpm nx test [project]` (NEVER forget pnpm prefix)
- **Performance targets**: <30s per integration test, <5s per unit test
- **Real test data**: Create actual files, use temp directories, clean up in afterEach

## Phase 5 CI/CD Compliance
- **CI/CD focuses ONLY on environment validation** - no code testing
- **All code quality validation must happen locally** (Phases 1-4)
- **Never bypass git hooks** with `--no-verify` unless absolute emergency
- **Understand**: CI assumes your code is already validated locally

## Secrets Protection
- **Automatic Detection**: Pre-commit hooks automatically scan for secrets using secretlint
- **Blocked Commits**: Commits containing API keys, tokens, or secrets will be automatically blocked
- **Manual Check**: Use `pnpm check:secrets` to scan entire codebase for secrets
- **Staged Files**: Use `pnpm check:secrets:staged` to check only staged files
- **Configuration**: Secrets detection rules configured in `.secretlintrc.json`
- **Exclusions**: Test files, documentation, and build artifacts are excluded from scanning
- **Emergency Override**: If absolutely necessary, remove secrets and commit clean version

## System Design Documentation - CONSULT BEFORE CODING
- **Location**: `@system-design-docs/` - Authoritative architecture documentation
- **Index**: `@system-design-docs/README.md` - Task-based navigation guide
- **MANDATORY**: Check relevant docs before implementing features or making architectural changes
- **Task-Based Quick Reference**:
  - **API Development** → Docs 5, 2, 14 (endpoints, data patterns, RBAC)
  - **UI Components** → Doc 11 (design system), Docs 12-13 (permissions)
  - **Import/Export** → **Doc 33** (active implementation checklist)
  - **Authentication/RBAC** → Docs 12, 13, 14
  - **Testing** → Doc 6 (5-phase strategy)
  - **Database changes** → Doc 2 (data architecture)
  - **Docusaurus sites** → Docs 3, 4 (configuration, workflow)
- **When to consult**: Before writing code for any non-trivial feature or architectural component

## Development Best Practices

**Comprehensive Guidance** (uses conditional blocks for smart loading):
- **Core Development**: `@developer_notes/development-best-practices-augmented.md`
- **UI/UX & Accessibility**: `@developer_notes/ui-ux-accessibility-best-practices.md`
- **Documentation Standards**: `@developer_notes/documentation-best-practices.md`

**Note**: The development-best-practices file uses conditional blocks - only relevant sections load based on your current task context.

## Deployment & Hosting
- **Preview Environment**: GitHub Pages (iflastandards.github.io/platform)
- **Production Environment**: GitHub Pages (www.iflastandards.info)
- **Admin Preview**: Render.com (admin-iflastandards-preview.onrender.com)
- **Admin Production**: Render.com (admin.iflastandards.info)
- **CI/CD Platform**: GitHub Actions with Nx Cloud distributed builds
- **Database Hosting**: Supabase managed PostgreSQL
- **Environment Management**: Branch-based (preview/main)

## Shared Libraries & Utilities
- **Theme Package**: @ifla/theme (workspace package with shared components)
- **Dev Servers**: @ifla/dev-servers (workspace package for development tooling)
- **ESLint Config**: @ifla/eslint-config (shared linting configuration)
- **Data Processing**: ExcelJS 4.4.0, PapaParse 5.5.3, CSV utilities
- **RDF/Semantic**: N3 1.26.0, JSON-LD 8.3.3 for semantic data processing
- **HTTP Client**: Node Fetch 3.3.2
- **Icons**: Lucide React 0.536.0
- **Fonts**: Fontsource Roboto 5.2.6

## Server-Dependent Testing
- **Location**: `apps/admin/src/test/integration/server-dependent/`
- **Purpose**: Tests requiring live servers (admin + Docusaurus sites)
- **Command**: `cd apps/admin && pnpm test:server-dependent`
- **Debug mode**: `TEST_SERVER_DEBUG=1 pnpm test:server-dependent`
- **Features**: Automatic server lifecycle, health checks, port cleanup
- **Documentation**: See `apps/admin/docs/server-dependent-testing.md`
- **Status**: ✅ 14/14 tests passing (CORS, cross-site auth, server management)

## Ant Design Spacing Guide

### Global Spacing with ConfigProvider
- **Compact Theme**: Use `theme.compactAlgorithm` for quickest global spacing reduction
- **Multiple Algorithms**: Combine algorithms: `[theme.darkAlgorithm, theme.compactAlgorithm]`
- **Custom Tokens**: Override padding, margin, controlHeight tokens globally
- **Component-Specific**: Use `components` in theme config for targeted adjustments

### Key Spacing Tokens
```javascript
theme: {
  token: {
    // Padding tokens
    padding: 8,
    paddingXS: 4,
    paddingSM: 8,
    paddingLG: 16,
    // Margin tokens
    margin: 12,
    marginXS: 4,
    marginSM: 8,
    marginLG: 16,
    // Control heights
    controlHeight: 28,
    controlHeightSM: 24,
    controlHeightLG: 36,
  },
  components: {
    Table: { cellPaddingBlock: 8, cellPaddingInline: 12 },
    Form: { itemMarginBottom: 12 },
    Button: { paddingBlock: 4, paddingInline: 12 },
    Layout: { headerHeight: 48 },
    Menu: { itemHeight: 36 },
  }
}
```

### Component-Level Spacing
- **Space Component**: Control spacing between elements with `size` prop
- **Row/Col Gutter**: Use `gutter={[horizontal, vertical]}` for grid spacing
- **Inline Styles**: Override individual components with `style={{ marginBottom: 8 }}`
- **Badge Positioning**: Use `offset={[x, y]}` to adjust badge position

### Best Practices
- **Prefer theme config** over CSS overrides for maintainability
- **Use compact algorithm** as base for tight layouts
- **Combine with custom tokens** for fine-tuning
- **Avoid !important** in CSS overrides
- **Test responsive behavior** when adjusting spacing
