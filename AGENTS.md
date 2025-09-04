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

- **CRITICAL: Feature Factory Workflow for Admin Features:** For ALL new admin features, follow the 4-phase Feature Factory workflow:
  - **Phase 1: Discovery & Refinement** - Clarify requirements through dialogue
  - **Phase 2: UI Mockup & Approval** - Generate and approve high-fidelity SVG mockups
  - **Phase 3: Development Plan & Approval** - Create TDD-based technical checklist
  - **Phase 4: Implementation & Progress Tracking** - Execute tasks with TDD workflow
  - See `developer_notes/prompts/ai-brief-feature-factory.md` for complete workflow
- **TDD + Refine.dev Integration:** Within the Feature Factory workflow:
  1. Define Zod contracts and generate resource metadata (steps 2-3)
  2. Write failing tests that define expected behavior (RED phase - step 4)
  3. Create MSW handlers with contract-compliant data (step 5)
  4. Use Inferencer with metadata to generate UI from MSW responses (step 7)
  5. Customize generated code to make all tests pass (GREEN phase - step 9)
  6. Refactor while keeping tests green (REFACTOR phase - step 11)
  - See `developer_notes/TDD_WITH_REFINE_GENERATORS.md` and `developer_notes/REFINE_RESOURCE_METADATA_PATTERN.md`
- **Automated TDD Workflow:** All features MUST follow the automated TDD workflow with 5-phase testing:
  - **Complete Guide**: `developer_notes/AUTOMATED_TDD_WORKFLOW.md`
  - **Agent Prompts**: `developer_notes/prompts/automated-tdd-agent-prompts.md`
  - **Environment Config**: `apps/admin/src/config/environment.ts`
  - Tests are tagged (`@unit`, `@integration`, `@e2e`, `@smoke`) for phase-specific execution
  - All phases use `nx affected` for optimal performance
- **Data Flow:** The data lifecycle is always: `UI Component` -> `refine Hook (e.g., useList)` -> `dataProvider` -> `Service Adapter` -> `Live API / MSW`.
- **Validation:** Every function within a service adapter that receives external data **must** parse it with its corresponding Zod schema before returning it. Throw a structured error on failure.
- **State Management:** Server state, caching, and re-fetching are managed by `refine` and `@tanstack/react-query`. Do not use `useState` for server data.
- **UI Components:** Use Ant Design (`antd`) components wherever possible, preferably through Refine.dev's Ant Design integration (`@refinedev/antd`). Custom styling should be minimal and handled via the theme.
- **Admin Development Priority Order:** 1) Refine.dev generators and hooks, 2) Refine.dev + custom logic, 3) Pure custom implementation (only when necessary).
- **Authentication & Authorization:** Auth is handled by Clerk. RBAC is implemented by checking `user.publicMetadata` on both the frontend (to hide/disable UI) and backend (to secure API endpoints).
- **Decision-Making Precedent:** When in doubt, use the existing "RDF Builds" feature as your primary reference and template. It exemplifies the correct implementation of all principles.

---

## Testing Strategy - Critical for All Features

### Environment-Based Testing & TDD Workflow
**MANDATORY: Follow the Automated TDD Workflow for all feature development**
- **Complete Guide**: `developer_notes/AUTOMATED_TDD_WORKFLOW.md`
- **Agent Prompts**: `developer_notes/prompts/automated-tdd-agent-prompts.md`
- **Environment Config**: `apps/admin/src/config/environment.ts`

**All features MUST support seamless mock/real switching:**

```typescript
// Every service follows this pattern
const service = new FeatureService({
  provider: process.env.USE_MOCKS === 'true' 
    ? mockProvider 
    : realProvider
});
```

### 5-Phase Testing Strategy (All Using nx affected)

| Phase | Trigger | Timing | Test Tags | Environment | What Runs |
|-------|---------|--------|-----------|-------------|-----------|
| **1: Selective** | On Save | Instant | N/A | N/A | Type check + Lint only |
| **2: Pre-commit** | Git commit | <10s | `@unit` | `USE_MOCKS=true` | Unit tests with mocks |
| **3: Pre-push** | Git push | <1m | `@unit` + `@integration` | `USE_MOCKS=true` | Unit + Integration with MSW |
| **4: Comprehensive** | PR/Manual | <5m | `@unit` + `@integration` + `@e2e` | Real services | Full suite with local services |
| **5: CI/Deployment** | Deploy | <30s | `@smoke` | Production | Critical path validation only |

### Phase-Aware Test Commands
```bash
# Phase 1: During development (instant feedback)
pnpm typecheck       # Type checking only
pnpm lint           # Linting only

# Phase 2: Before committing (fast unit tests)
pnpm test:unit      # Runs @unit tagged tests with mocks

# Phase 3: Before pushing (integration with MSW)
pnpm test:integration # Runs @unit + @integration with MSW mocks

# Phase 4: Before PR/merge (full validation)
pnpm test:e2e       # Full suite with real local services

# Phase 5: Production deployment (smoke tests)
pnpm test:smoke     # Critical path validation in production
```

### Test Tagging System
```typescript
// Use tags in your test files
describe('UserService @unit', () => {
  // Fast, isolated unit tests
});

describe('API Integration @integration', () => {
  // Tests with MSW mocks or real services
});

describe('User Flow @e2e', () => {
  // Full end-to-end scenarios
});

describe('Health Check @smoke', () => {
  // Critical production validations
});
```

See `developer_notes/AUTOMATED_TDD_WORKFLOW.md` for complete TDD methodology.

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
- **Feature Factory Workflow:** Complete 4-phase interactive feature development process with TDD.
  - `developer_notes/prompts/ai-brief-feature-factory.md` - Standard workflow
  - `developer_notes/COMPLETE_FEATURE_FACTORY_WORKFLOW.md` - Production features with jobs
  - `developer_notes/FEATURE_WORKFLOWS_BY_TYPE.md` - Specialized by feature type
  - `developer_notes/WORKFLOW_TESTING_EMPHASIS.md` - Testing patterns for all workflows

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

## Decision Tree for Feature Development

```
New Feature Request
    ↓
Is it CRUD (forms/tables)?
├─ YES → Is it complex?
│  ├─ NO → Use Refine.dev generators
│  └─ YES → Use Feature Factory + Refine.dev
└─ NO → Does it take >3 seconds?
   ├─ YES → Use Long-Running Service workflow
   └─ NO → Is it GitHub related?
      ├─ YES → Use GitHub Reflection workflow
      └─ NO → Use appropriate custom pattern
```

## Common Prompt Patterns

### Starting a New Feature
```
"I need a [feature name] feature.
Type: [CRUD/Long-running/GitHub]
Purpose: [what it does]
Testing: Start with mocks
Similar to: [existing feature if any]"
```

### Extending Existing Feature
```
"Extend the [existing feature] to [new capability].
Current code: [location]
Testing: Follow existing patterns
Requirements: [what's new]"
```

### Fixing/Refactoring
```
"Fix/Refactor [feature name].
Issue: [what's wrong]
Tests: [are there existing tests?]
Goal: [desired outcome]"
```

## Critical Rules
- **NEVER** use `any` without eslint-disable comment
- **ALWAYS** run `pnpm typecheck && pnpm lint` after edits
- **ALWAYS** fix code to pass tests, never fix tests to pass
- **ALWAYS** ensure local validation (Phases 1-4) passes before pushing
- **NEVER commit secrets or API keys** - pre-commit hooks will block commits with secrets
- Use `workspaceUtils` in integration tests, not `process.cwd()`
- Include `experimental_faster: true` in all `docusaurus.config.ts` files

## Specialized Subagent Strategy

**Implementation Guide**: See `developer_notes/SUBAGENT_IMPLEMENTATION_GUIDE.md` for detailed usage patterns
**Specifications**: See `developer_notes/SUBAGENT_SPECIFICATIONS.md` for documentation requirements

### Available Specialized Agents

When developing specific feature types, I invoke specialized subagents through the Task tool. Each subagent is an expert in their domain with deep, specific knowledge:

| Subagent | Trigger Keywords | Core Expertise | When to Use |
|----------|-----------------|----------------|-------------|
| **crud-builder** | "management", "CRUD", "admin panel", "forms", "tables" | Refine.dev hooks, Inferencer optimization, Ant Design patterns, Supabase RLS, contract-to-UI generation | Building data management interfaces with forms and tables |
| **job-orchestrator** | "import", "export", "process", "long-running", "batch", "queue" | Job queues, Edge Functions, progress monitoring, chunking strategies, retry policies, graceful cancellation | Any operation taking >3 seconds or processing large datasets |
| **github-syncer** | "GitHub", "sync teams", "repos", "webhooks" | Octokit optimization, webhook security, GraphQL vs REST, rate limiting, caching strategies | Integrating with GitHub API or syncing GitHub data |
| **test-architect** | "test strategy", "test coverage", "testing", "QA" | MSW handlers, contract testing, E2E patterns, coverage analysis, performance benchmarks | Designing comprehensive test suites and strategies |
| **perf-optimizer** | "optimize", "slow", "performance", "lag", "memory" | React memoization, query optimization, bundle splitting, virtualization, caching layers | Fixing performance issues or optimizing slow components |
| **docs-generator** | "API docs", "OpenAPI", "technical docs", "README" | OpenAPI/Swagger, TypeDoc, API references, architecture diagrams | Creating technical/API documentation |
| **docs-specialist** | "user guide", "tutorial", "help", "walkthrough", "onboarding" | User documentation, interactive tours, video tutorials, contextual help, FAQs | Creating user-facing documentation and help systems |
| **db-migrator** | "migration", "database", "schema", "indexes" | Zero-downtime migrations, index optimization, RLS policies, backup strategies | Database schema changes and optimizations |
| **security-auditor** | "security", "vulnerability", "audit", "compliance" | OWASP Top 10, authentication/authorization, encryption, GDPR compliance, penetration testing | Security audits and vulnerability remediation |
| **arch-designer** | "PRD", "architecture", "design", "requirements", "task breakdown" | System design, PRD creation, task decomposition, dependency analysis, architectural validation | Creating PRDs, designing architecture, breaking down features |

### How I Use Subagents

#### 1. Automatic Detection & Invocation
When you mention trigger keywords, I automatically invoke the appropriate specialists in parallel for maximum efficiency.

#### 2. Explicit Request
You can explicitly request specific subagents:
- "Use the job-orchestrator to design the import system"
- "Have the security-auditor review this code"
- "Get the perf-optimizer to fix this slow component"

#### 3. Collaborative Multi-Agent Workflows
For complex features, I coordinate multiple specialists working in parallel:
- **CRUD + Import/Export**: crud-builder + job-orchestrator + test-architect
- **Performance Crisis**: perf-optimizer + db-migrator + test-architect
- **Security Incident**: security-auditor + test-architect + docs-generator
- **Complete Feature**: All relevant agents working together

### Example Multi-Agent Invocations

```typescript
// Building a complete vocabulary management system
const feature = await Promise.all([
  task({
    subagent_type: "general",
    description: "Design CRUD interface",
    prompt: "As crud-builder: Create vocabulary management with search and filters"
  }),
  task({
    subagent_type: "general",
    description: "Design import system",
    prompt: "As job-orchestrator: Create CSV import with validation and progress"
  }),
  task({
    subagent_type: "general",
    description: "Optimize performance",
    prompt: "As perf-optimizer: Handle 10,000+ vocabularies efficiently"
  }),
  task({
    subagent_type: "general",
    description: "Create tests",
    prompt: "As test-architect: Comprehensive test suite with 90% coverage"
  })
]);

// Responding to performance issues
const optimization = await Promise.all([
  task({
    subagent_type: "general",
    description: "Diagnose performance",
    prompt: "As perf-optimizer: Analyze why list is slow with 50k items"
  }),
  task({
    subagent_type: "general",
    description: "Optimize database",
    prompt: "As db-migrator: Add indexes and optimize queries"
  }),
  task({
    subagent_type: "general",
    description: "Implement virtualization",
    prompt: "As crud-builder: Add virtual scrolling to handle large datasets"
  })
]);
```

### Subagent Specializations

Each agent maintains deep expertise and decision-making capabilities:

- **arch-designer**: Creates PRDs, **suggests available features**, validates architecture, decomposes features, ensures alignment
- **crud-builder**: **Suggests Refine.dev capabilities**, knows when to use Inferencer vs custom components, optimal pagination
- **job-orchestrator**: Calculates chunk sizes, selects queue systems, designs retry strategies
- **github-syncer**: Chooses GraphQL vs REST, manages rate limits, implements caching
- **test-architect**: Determines test distribution, coverage targets, mock strategies
- **perf-optimizer**: Decides on memoization, virtualization, bundle splitting
- **docs-generator**: Creates API docs, technical references, architecture diagrams
- **docs-specialist**: Creates user guides, interactive tutorials, contextual help, onboarding flows
- **db-migrator**: Plans zero-downtime migrations, optimizes indexes, designs backup strategies
- **security-auditor**: Identifies vulnerabilities, implements security patterns, ensures compliance

### Benefits of Subagent Architecture

1. **Deeper Expertise**: Each agent masters their specific domain
2. **Parallel Processing**: Multiple agents work simultaneously for faster development
3. **Better Quality**: Specialized knowledge produces superior code
4. **Consistent Patterns**: Each agent enforces domain best practices
5. **Comprehensive Solutions**: Multi-agent collaboration covers all aspects

## MCP Server Usage Strategy

### Context7 MCP - Primary Documentation Source
- **CRITICAL**: Default to using MCP servers for current API information rather than relying on potentially outdated training data
- **Always use Context7 MCP** for library documentation, API references, and implementation patterns
- **Knowledge drift problem**: Libraries evolve rapidly with breaking changes - my training data may be outdated
- **High-risk scenarios requiring MCP**: React 19, Next.js 15, Ant Design 5.x, TypeScript 5.8+, build tool configurations
- **Proactive MCP usage**: Check current docs even when I "think" I know the answer
- **Better to over-use MCP than provide outdated information** that causes bugs or frustration

### Primary Documentation Sources

#### Refine.dev Official Documentation (ALWAYS CHECK FIRST for Admin features)
- **Ant Design Integration**: https://refine.dev/docs/ui-integrations/ant-design/introduction/
- **General Concepts**: https://refine.dev/docs/guides-concepts/general-concepts/
- **Audit Logs**: https://refine.dev/docs/guides-concepts/audit-logs/
- **Realtime**: https://refine.dev/docs/guides-concepts/realtime/
- **Access Control**: https://refine.dev/docs/guides-concepts/access-control/
- **Import/Export**: https://refine.dev/docs/guides-concepts/import-export/
- **Forms**: https://refine.dev/docs/guides-concepts/forms/
- **Tables**: https://refine.dev/docs/guides-concepts/tables/

**Use `webfetch` tool to consult these docs before generating any Refine.dev code!**

### Context7 Library IDs for Quick Reference

```typescript
// Core libraries - use these IDs with Context7
const context7Libraries = {
  // Frontend Core
  react: "/facebook/react",
  nextjs: "/vercel/next.js",
  typescript: "/microsoft/TypeScript",
  
  // Admin UI Stack (check Refine.dev docs first!)
  refine: "/refinedev/refine",
  antDesign: "/ant-design/ant-design",
  tanstackQuery: "/tanstack/query",
  reactHookForm: "/react-hook-form/react-hook-form",
  
  // Backend & Data
  supabase: "/supabase/supabase",
  clerk: "/clerk/javascript",
  zod: "/colinhacks/zod",
  
  // Testing
  msw: "/mswjs/msw",
  vitest: "/vitest-dev/vitest",
  playwright: "/microsoft/playwright",
  testingLibrary: "/testing-library/react-testing-library",
  
  // Build & Performance
  vite: "/vitejs/vite",
  tanstackVirtual: "/tanstack/virtual",
  
  // GitHub Integration
  octokit: "/octokit/octokit.js",
  webhooks: "/octokit/webhooks.js"
};
```

### How to Request Specific Documentation

You can help me get accurate documentation faster by including Context7 library IDs in your requests:

```
// Good - includes library ID
"implement authentication with Clerk. use library /clerk/javascript for docs"

// Better - multiple library IDs
"create CRUD interface using /refinedev/refine and /ant-design/ant-design"

// Best - specific query
"implement virtual scrolling with /tanstack/virtual for 50k items"
```

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
Is this an admin app feature?
├─ YES → Is this CRUD/forms/tables?
│  ├─ YES → Use Refine.dev generators FIRST
│  └─ NO → Continue to general framework
└─ NO → Is this a straightforward code task?
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
- "Create user management interface" → **Refine.dev generators** (`npx refine create resource users`)
- "Add vocabulary CRUD operations" → **Refine.dev generators** (`npx refine create resource vocabularies`)
- "Build settings form" → **Refine.dev useForm** + Ant Design integration
- "Find all uses of UserService" → **JetBrains**
- "Why is authentication failing intermittently?" → **Sequential Thinking** + JetBrains
- "Add a new API endpoint" → **JetBrains** (if pattern is clear)
- "Design a new feature architecture" → **Sequential Thinking** first
- "Debug this complex error" → **Sequential Thinking** to analyze, **JetBrains** to investigate
- "Refactor this component" → **JetBrains** (if straightforward), **Sequential Thinking** (if architectural implications)

## Testing Philosophy & Strategy
- **TDD Red-Green-Refactor**: Write failing tests first, then implementation, then refactor
- **Test-First Development**: ALWAYS write tests before writing implementation code
- **5-phase testing strategy**: Selective → Pre-commit → Pre-push → Comprehensive → CI
- **Automated TDD Workflow**: Follow `developer_notes/AUTOMATED_TDD_WORKFLOW.md` for step-by-step process
- **MANDATORY**: Read `developer_notes/TESTING_STRATEGY_V2.md` for TDD approach
- **Templates**: Use `developer_notes/TEST_TEMPLATES.md` for proper test structure
- **Environment Configuration**: `apps/admin/src/config/environment.ts` for phase-aware testing
- **Test Tagging**: Use `@unit`, `@integration`, `@e2e`, `@smoke` tags for phase-specific execution
- **Write @unit tests first** for components and pure functions
- **Follow with @integration tests** for API and service layers  
- **Command format**: `pnpm nx test [project]` (NEVER forget pnpm prefix)
- **Performance targets**: <30s per integration test, <5s per unit test
- **Real test data**: Create actual files, use temp directories, clean up in afterEach
- **Minimal implementation**: Only write code needed to make tests pass
- **nx affected**: All phases use `nx affected` for optimal performance (except Phase 5)

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

## Quick Start Guide for New Features

### Step 1: Identify Your Feature Type

| Feature Type | Key Indicators | Workflow to Use |
|-------------|----------------|-----------------|
| **Interactive CRUD** | • Database operations<br>• Forms and tables<br>• Immediate responses<br>• Standard create/read/update/delete | Refine.dev generators + standard patterns |
| **Long-Running Service** | • Takes >3 seconds<br>• Progress tracking needed<br>• Batch processing<br>• Import/export operations | Job queues + progress monitoring |
| **GitHub Reflection** | • GitHub API integration<br>• Team/repo sync<br>• Webhooks needed<br>• External API calls | Octokit + sync patterns |

### Step 2: Use the Right Prompt Template

#### For CRUD Features:
```
"I need a [entity] management feature.
This is a CRUD feature for [creating/editing/deleting] [entities].
Testing: Start with mocks.
Related code: [mention any similar features]"
```

#### For Long-Running Services:
```
"I need to [process/import/export] [data type].
This is a long-running service that [describe what it does].
It will take [estimated time] to complete.
Testing: Mock job progress with MSW.
Related code: [any similar jobs]"
```

#### For GitHub Reflection:
```
"I need to sync [GitHub resource] with [our system].
This is a GitHub reflection feature.
Requirements: [webhooks/polling/real-time].
Testing: Mock GitHub API responses.
Related code: [any GitHub integrations]"
```

### Step 3: What I'll Do When You Prompt

1. **Code Discovery (Phase 0)**
   - Search for existing related code
   - Identify reusable components
   - Find established patterns

2. **Requirements Clarification (Phase 1)**
   - Ask about data model
   - Clarify user permissions
   - Identify edge cases

3. **Test-First Planning (Phase 2)**
   - Define test scenarios
   - Set up mock/real switching
   - Plan progressive testing

4. **Implementation (Phase 3-4)**
   - TDD red-green-refactor
   - Continuous test feedback
   - Environment-based validation

## Magic Words That Trigger Specific Actions

### Feature Type Triggers
- **"management feature"** → I'll use CRUD workflow with Refine.dev
- **"import/export"** → I'll set up job queues with progress
- **"sync with"** → I'll use external API patterns
- **"bulk operations"** → I'll implement batch processing
- **"real-time"** → I'll add SSE/WebSocket support
- **"with progress"** → I'll create progress monitoring UI
- **"from GitHub"** → I'll use Octokit and webhooks

### Testing Triggers
- **"use mocks"** → I'll set USE_MOCKS=true
- **"test with real API"** → I'll create staging tests
- **"production ready"** → I'll implement full test suite
- **"quick feedback"** → I'll emphasize fast unit tests
- **"existing tests"** → I'll search for test patterns

### Code Reuse Triggers
- **"like [feature]"** → I'll examine that feature's code
- **"similar to"** → I'll follow existing patterns
- **"extend"** → I'll build on existing code
- **"refactor"** → I'll improve existing implementation

## How to Prompt for Different Features

## Effective Prompting Examples

### Example 1: CRUD Feature
```
You: "I need a vocabulary management feature for CRUD operations"
Me: *Searches for vocabulary-related code*
    *Finds existing vocabulary contracts and services*
    *Uses Refine.dev generators*
    *Sets up MSW mocks for testing*
```

### Example 2: Long-Running Service
```
You: "I need to import namespaces from prefix.cc with progress tracking"
Me: *Searches for import services and job patterns*
    *Finds existing job queue infrastructure*
    *Creates job contracts and progress UI*
    *Mocks progress updates for testing*
```

### Example 3: GitHub Reflection
```
You: "I need to sync GitHub teams with our RBAC system"
Me: *Searches for GitHub integration code*
    *Finds existing Octokit setup*
    *Creates webhook handlers*
    *Mocks GitHub API for development*
```

## What to Tell Me for Best Results

### Always Specify:
1. **Feature type** (CRUD/Long-running/GitHub)
2. **Testing approach** (mocks first/need real API)
3. **Related existing code** (if you know of any)
4. **Special requirements** (real-time, progress, webhooks)

### Optional but Helpful:
- Performance requirements
- User permissions needed
- Expected data volume
- Integration points
- Deployment target

## Feature Factory Workflow Summary

### Phase 0: Code Discovery (Always First!)
Before starting any feature:
- Search for existing related code
- Identify reusable services and utilities
- Find established patterns
- Review existing tests

### 4-Phase Interactive Development Process

1. **Phase 1: Discovery & Refinement**
   - User provides initial feature description
   - AI asks clarifying questions covering:
     - **User Goal:** Primary objective for the user
     - **Data Model:** Zod schemas needed with fields and types
     - **User Actions:** Available actions (create, update, delete, filter, etc.)
     - **Access Control (RBAC):** Roles and specific permissions per role
     - **Service Interactions:** Backend services and external APIs involved
     - **Edge Cases:** Success, failure, and invalid input scenarios
   - Continue dialogue until requirements are agreed
   - AI summarizes final requirements for confirmation

2. **Phase 2: Resource Metadata & Inferencer Planning**
   - Generate resource metadata from Zod contracts
   - Configure field types, UI components, validation rules
   - Define RBAC permissions for each action
   - Identify custom features beyond Inferencer capabilities
   - Review until user says "Resource metadata approved"

3. **Phase 3: Development Plan & Approval**
   - Create git branch (first task always)
   - Define PRD with user story and acceptance criteria
   - Generate 11-step TDD technical checklist
   - Review and revise until "Plan approved. Begin implementation."

4. **Phase 4: Implementation & Progress Tracking**
   - Execute tasks one by one following TDD principles
   - Stop and present output after each task completion
   - Show updated checklist with completed items marked
   - Wait for "Continue" before proceeding to next task

### Workflow Selection Guide

| If your feature involves... | Use this workflow |
|----------------------------|-------------------|
| Standard CRUD operations | `ai-brief-feature-factory.md` |
| Long-running jobs/queues | `COMPLETE_FEATURE_FACTORY_WORKFLOW.md` |
| GitHub API integration | `FEATURE_WORKFLOWS_BY_TYPE.md` → Type 3 |
| Import/Export with progress | `FEATURE_WORKFLOWS_BY_TYPE.md` → Type 2 |
| Simple forms and tables | `ai-brief-feature-factory.md` + Refine.dev |

See workflow documents for detailed guidance.

## Automated TDD Workflow - MANDATORY for All Features

### Complete TDD Methodology
- **Main Guide**: `developer_notes/AUTOMATED_TDD_WORKFLOW.md`
- **Agent Prompts**: `developer_notes/prompts/automated-tdd-agent-prompts.md`
- **Environment Config**: `apps/admin/src/config/environment.ts`

### TDD Process Overview
1. **RED Phase**: Write failing tests that define expected behavior
2. **GREEN Phase**: Write minimal code to make tests pass
3. **REFACTOR Phase**: Improve code while keeping tests green

### Test Tagging & Phases
- **@unit**: Fast, isolated tests (Phase 2: Pre-commit)
- **@integration**: Tests with MSW mocks (Phase 3: Pre-push)
- **@e2e**: Full end-to-end tests (Phase 4: Comprehensive)
- **@smoke**: Production validation (Phase 5: CI/Deploy)

### Environment-Based Execution
```typescript
// Tests automatically adapt to environment
if (process.env.USE_MOCKS === 'true') {
  // Use MSW handlers (Phases 2-3)
} else {
  // Use real services (Phase 4)
}
```

### Commands by Phase
```bash
# Phase 1: Development (instant feedback)
pnpm typecheck && pnpm lint

# Phase 2: Pre-commit (unit tests)
pnpm nx affected --target=test --tag=unit

# Phase 3: Pre-push (integration with mocks)
pnpm nx affected --target=test --tag=unit,integration

# Phase 4: PR/Manual (full suite)
pnpm nx affected --target=test --tag=unit,integration,e2e

# Phase 5: Production (smoke tests)
pnpm nx run-many --target=test --tag=smoke
```

## Git Workflow for Feature Development

### MANDATORY: Create Feature Branch Before Coding
- **ALWAYS create a feature branch** before starting any development work
- **Branch naming convention**: `feature/[feature-name]` (e.g., `feature/vocabulary-crud`, `feature/user-management`)
- **Command**: `git checkout -b feature/[feature-name]`
- **Never code directly on main/master branch**
- **Pull latest changes** before creating branch: `git pull origin main`
- **This is Task #1 in the Feature Factory workflow**

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
