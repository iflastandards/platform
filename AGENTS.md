# AGENTS.md

Essential guidance for coding agents working in this IFLA Standards monorepo.

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
- **UI Components**: Material-UI 7.2.0 + Lucide React 0.536.0
- **Forms**: React Hook Form 7.61.1 + Zod 4.0.14 validation
- **Styling**: Emotion 11.14.0 + Material-UI theming

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
- **Always use MUI MCP** for Material-UI component APIs, props, and usage examples
- **Knowledge drift problem**: Libraries evolve rapidly with breaking changes - my training data may be outdated
- **High-risk scenarios requiring MCP**: React 19, Next.js 15, Material-UI 7.x, TypeScript 5.8+, build tool configurations
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
