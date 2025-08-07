# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 CONTEXT DETECTION - START HERE

### What am I working on?
**ASK MYSELF FIRST**: Which part of the monorepo?
1. **🔴 Admin app** (apps/admin) → Next.js with standard routing (no basePath)
2. **🟢 Documentation sites** (standards/*) → Docusaurus with standard routing
3. **📦 Shared packages** (packages/*) → Used by both
4. **📚 System Design** (@system-design-docs/) → Authoritative architecture documentation

**💡 USER TIP**: Start prompts with "Working on admin:" or "Working on docs:" to help me focus!

---

## 🚨 CRITICAL RULES - ALWAYS CHECK

### 📋 Universal Checklist (BEFORE EVERY TASK)
- [ ] **Working directory**: Am I in the root? (All commands run from root)
- [ ] **Project context**: Admin app or documentation site?
- [ ] **Standard routing**: Both admin and docs use standard Next.js/Docusaurus routing
- [ ] **Scripts first**: Check `package.json` scripts before writing bash
- [ ] **MCP usage**: Could Context7/MUI help with this task?
- [ ] **Testing**: Use `nx affected` not full test runs
- [ ] **Writing tests?**: Read `developer_notes/AI_TESTING_INSTRUCTIONS.md` FIRST
- [ ] **TypeScript**: Follow strict typing rules - NO undocumented `any` or `require`

### 🔧 Monorepo Essentials
- **Package manager**: Always `pnpm` (never npm/yarn)
- **Dependencies**: All in root `package.json`
- **Commands**: Run from root directory
- **Nx commands**: `nx build {project}`, `nx test {project}`
- **Shared code**: `packages/*` directory

---

## 🔴 ADMIN APP RULES (apps/admin)

### ✅ Standard Next.js Routing
The admin app uses standard Next.js routing (no basePath):

#### 1. **Links - Standard Next.js**
```tsx
// ✅ STANDARD NEXT.JS ROUTING
<Link href="/dashboard">Dashboard</Link>
<Link href="/settings">Settings</Link>
<Link href={`/users/${userId}`}>User Profile</Link>
```

#### 2. **API Calls - Standard fetch**
```tsx
// ✅ STANDARD FETCH CALLS
const response = await fetch('/api/vocabularies');
const data = await fetch(`/api/users/${id}`);
```

#### 3. **Static Assets - Standard paths**
```tsx
// ✅ STANDARD ASSET PATHS
<img src="/logo.png" />
<link rel="icon" href="/favicon.ico" />
```

### Admin-Specific Details
- **Framework**: Next.js 15.1.3 with App Router
- **Start dev**: `nx dev admin --turbopack`
- **Build**: `nx build admin`
- **Dependencies**: React 19, TypeScript 5.7, Tailwind CSS, shadcn/ui
- **API routes**: `apps/admin/src/app/api/`
- **Routing**: Standard Next.js routing patterns

---

## 🟢 DOCUMENTATION SITES RULES (standards/*)

### Docusaurus Sites
- **Framework**: Docusaurus 3.6.3
- **Standard routing** - Standard Docusaurus patterns
- **Sites**: portal, isbd, isbdm, unimarc, mri, frbr, lrm, mia, pressoo, muldicat, etc.

### Documentation Commands
- **Start dev**: `nx start {site}` (e.g., `nx start portal`)
- **Build**: `nx build {site}`
- **Serve built**: `nx serve {site}`
- **Build all**: `pnpm build:all`
- **With port cleanup**: `nx run {site}:start:robust`

### Site Scaffolding
```bash
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"
```
- **Template**: `scripts/scaffold-template/`
- **Generated**: `docusaurus.config.ts`, `project.json`, content pages, CompactButton
- **Documentation**: See `developer_notes/current-scaffolding-plan.md`

---

## 🎯 QUICK TASK REFERENCE

### "I'm building a UI component"
1. **Admin?** → Check basePath rules, use `addBasePath()`
2. **Docs?** → Standard Docusaurus patterns
3. Use **MUI MCP** for component examples
4. Use **Context7 MCP** for React patterns
5. Run `pnpm typecheck` after coding

### "I'm adding an API route"
1. **Admin app** → MUST use `addBasePath()` for all fetches
2. Check existing patterns in `apps/admin/src/app/api/`
3. Use **Context7 MCP** for Next.js App Router patterns

### "I'm fixing routing issues"
1. **Admin**: 90% of issues = missing `addBasePath()` or hardcoded `/admin`
2. **Docs**: Standard Docusaurus routing
3. Reference: `developer_notes/NEXTJS_CODING_STANDARDS.MD`

### "I'm running tests"
1. Use `pnpm test` (runs `nx affected`)
2. Never run all tests - always use affected
3. Reference: `developer_notes/TESTING_STRATEGY.md`

### "I'm writing tests" 
**🚨 MANDATORY**: Read `developer_notes/AI_TESTING_INSTRUCTIONS.md` FIRST!
Quick rules:
1. **Decide test type**: env vars? → @env | multiple components? → @integration | browser? → @e2e | else → @unit
2. **Tag properly**: @unit/@integration/@e2e + @api/@auth/@ui + @critical (if needed)
3. **Place correctly**: Unit tests next to source, integration in tests/, E2E in e2e/
4. **Use templates**: Copy from `developer_notes/TEST_TEMPLATES.md`

---

## 📚 ESSENTIAL REFERENCES

### Next.js Coding Standards (ALWAYS CHECK THESE FIRST)
1. **Internal Links**: Always use `<Link href="/dashboard">` - NEVER `<a href="/admin/dashboard">`
2. **API Calls**: Always use `fetch(addBasePath('/api/route'))` - NEVER hardcode basePath
3. **Static Assets**: Always use `addBasePath('/logo.png')` - NEVER manual prepending
4. **Write paths as if app is at root** - Next.js adds basePath automatically
5. **Import utility**: `import { addBasePath } from '@ifla/theme/utils';`

### Testing Strategy (MANDATORY FOR ALL TESTS)
1. **🚨 ALWAYS run tests as: `pnpm nx test [project] --skip-nx-cache`** - NEVER forget pnpm or skip-nx-cache!
2. **AI AGENTS**: MUST read `@developer_notes/AI_TESTING_INSTRUCTIONS.md` before writing any tests
3. **Integration-first philosophy**: We test with real I/O, not mocks - see AI_TESTING_INSTRUCTIONS.md
4. **Pre-commit target**: < 60 seconds (use `pnpm nx affected --skip-nx-cache`)
5. **Use 5-phase strategy**: On-demand → Pre-commit → Pre-push → Comprehensive → CI
6. **Test placement**: Check `@developer_notes/TEST_PLACEMENT_GUIDE.md` before writing tests
7. **NEVER use bare `nx` commands** - Always prefix with `pnpm`
8. **NEVER trust nx cache for tests** - Always use `--skip-nx-cache`

### Critical File References
- **AI Testing Guide**: `@developer_notes/AI_TESTING_INSTRUCTIONS.md` (MANDATORY for AI agents)
- **Complete Testing Strategy**: `@developer_notes/TESTING_STRATEGY.md`
- **Test Placement Guide**: `@developer_notes/TEST_PLACEMENT_GUIDE.md` (use when writing tests)
- **Test Templates**: `@developer_notes/TEST_TEMPLATES.md` (copy for new tests)
- **Nx Test Optimizations**: `@developer_notes/NX_AFFECTED_TEST_OPTIMIZATION.md`
- **Complete Next.js Standards**: `@developer_notes/NEXTJS_CODING_STANDARDS.MD`

---

## 🛠️ DEVELOPMENT WORKFLOWS

### Essential Commands
- **Package manager**: Always use `pnpm` (never npm or yarn)
- **Build single site**: `nx build {name}` (e.g., `nx build portal`, `nx build isbdm`, `nx build admin`)
- **Build all sites**: `pnpm build:all` (optimized with Nx caching and parallelization)
- **Start dev server**: `nx start {site}` or `nx run {site}:start:robust` (with port cleanup)
- **Start Next.js dev**: `nx dev admin --turbopack` (for admin development)
- **Serve built site**: `nx serve {site}` or `nx run {site}:serve:robust` (with port cleanup)
- **Test execution**: `pnpm test` (nx affected with parallel execution)
- **Type checking**: `pnpm typecheck` (nx affected with parallel execution)
- **Linting**: `pnpm lint` (nx affected with parallel execution)
- **Health check**: `pnpm health` (comprehensive system check)
- **Fresh install**: `pnpm fresh` (clean install with cache clear)

### Performance Optimization Commands
- **Optimize Nx**: `pnpm nx:optimize` (run performance optimization script)
- **Start Nx daemon**: `pnpm nx:daemon:start` (speeds up all Nx commands)
- **Clear cache**: `pnpm nx:cache:clear` (when you need a fresh build)
- **View cache stats**: `pnpm nx:cache:stats` (monitor cache effectiveness)
- **View dependency graph**: `pnpm nx:graph` (visualize project dependencies)

### Code Development Guidelines
- **ALWAYS CHECK MUI MCP AND CONTEXT7 MCP FOR EXAMPLES BEFORE WRITING CODE**
- **ALWAYS RUN TYPECHECK AND ESLINT AFTER WRITING CODE BEFORE MOVING TO THE NEXT TASK**

### AI Agent TypeScript & Import Compliance Rules

#### ALWAYS DO THIS
- **Always use ES Module `import`/`export` syntax** for all TypeScript, React, Next.js, or Docusaurus code
  ```typescript
  import { Component } from "react";
  import util from "@workspace/shared/utils";
  ```
- **Always follow workspace path aliases** as defined in root `tsconfig.json` and Nx configuration
- **Always use strict, explicit types** in all code—both production and test files
- **Always provide clear comment explaining any use of `any`** and tag for human review
  ```typescript
  // Using `any` here to simulate invalid API input for edge case testing. Review required.
  const malformedPayload: any = getUserSuppliedData();
  expect(() => processPayload(malformedPayload)).toThrow();
  ```
- **Always write code that passes all linting and type checks**
- **Always include at least one minimal test** for any new logic/UI
- **Always add JSDoc comments** for all exported functions/types/interfaces

#### NEVER DO THIS
- **Never use `require` for module imports** - breaks compatibility
  ```typescript
  // ❌ WRONG
  const config = require("./config");
  ```
- **Never import using deep paths or absolute paths** outside workspace/NX aliases
  ```typescript
  // ❌ WRONG
  import X from "../../../lib/foo/internal/bar";
  ```
- **Never use `any`, `@ts-ignore`, or unsafe type casts** without:
  - Explicit, documented rationale in comment
  - Tagged for reviewer attention
  - Treated as temporary exception
- **Never merge code that fails CI, lint/type checks, or lacks test coverage**
- **Never use `any` in tests without clear justification and reviewer signoff**

#### Quick Reference Table
| Context | ✅ Always | ❌ Never |
|---------|-----------|----------|
| Imports | ES modules + workspace aliases | `require` or deep paths |
| Types | Explicit, precise, documented | Undocumented `any` |
| Test edge cases | Document & justify `any` | Routine `any` in tests |
| CI/Lint | Pass all checks | Merge failing code |

---

## 🧪 TESTING & QUALITY

### Test File Linting
- **Test files use relaxed linting rules**: See `pnpm lint:test-rules` for details
- **Less strict TypeScript**: Tests use `tsconfig.test.json` with relaxed type checking
- **⚠️ `any` in tests**: Only allowed with documented justification and review tag
  ```typescript
  // Using `any` to test malformed input handling. Review required.
  const invalidData: any = { malformed: true };
  ```
- **Test patterns**: `**/*.{test,spec}.{js,jsx,ts,tsx}`, `**/tests/**/*`, `**/e2e/**/*`
- **Commands**: 
  - `pnpm lint:tests` (lint only test files)
  - `pnpm lint:test-rules` (show relaxed rules explanation)

### Git Hooks (Layered Testing)

#### Pre-commit (Fast Feedback - ~30s)
- **Purpose**: Catch basic errors before commit
- **Command**: `pnpm test:pre-commit`
- **Runs**: TypeScript check, ESLint, Unit tests (affected)
- **Philosophy**: Warnings allowed, errors block commit
- **Goal**: Fast feedback loop for developers

#### Pre-push (Production Readiness - ~2-5min)
- **Purpose**: Ensure production readiness before push
- **Command**: `pnpm test:pre-push:flexible`
- **Assumes**: Pre-commit tests already passed
- **Runs**: Integration tests, Production builds (affected), Smart E2E
- **Goal**: Confidence that code works in production
- **Uses Nx affected**: Only tests what changed
- **E2E Strategy**: Auto-triggers when portal/admin affected

#### Post-push (GitHub Pages)
- **Purpose**: Verify deployment and external integrations
- **Runs**: Full site builds, GitHub Pages deployment, External service validation
- **Goal**: Catch issues that only appear in production environment

#### E2E Test Triggers
- **Auto-trigger**: When `portal` or `admin` projects are affected
- **Manual override**: Set `"runE2E": true` in `.prepushrc.json`
- **Critical changes**: UI/UX, navigation, search, auth flows, vocabulary functionality
- **Rationale**: E2E can be slow/flaky locally, only run when high-impact changes

#### Configuration
- **`.precommitrc.json`**: Pre-commit behavior
- **`.prepushrc.json`**: Pre-push behavior (integration tests, builds, smart e2e)
- **Philosophy**: No redundant testing between layers

---

## 🔗 INTEGRATIONS & TOOLS

### Development Tools
- **Ripgrep (rg)**: Fast file search tool installed and available
  - Use via the Grep tool (not bash commands)
  - Supports regex patterns, file type filtering, and context lines
  - Example: Search for "github" in TypeScript files with context
- **Flexible Linting**: Different strictness levels for production vs test code
  - Production code: Strict linting with warnings as errors
  - Test code: Relaxed rules allowing `any`, console logs, longer functions
  - Scripts: `scripts/pre-commit-check.js`, `scripts/pre-push-check.js`

### MCP Server Usage
1. **Context7**: Documentation, patterns, best practices
   - Use for: Library docs, API references, framework patterns
2. **MUI**: Material-UI components and patterns  
   - Use for: Component examples, theming, styling
3. **Playwright/Puppeteer**: Browser automation
   - Use for: E2E testing, browser interactions

### GitHub Services Integration

#### Mock GitHub Package
- **Package**: `@kie/mock-github` (v2.0.1 installed)
- **Documentation**: https://github.com/kiegroup/mock-github?tab=readme-ov-file
- **Purpose**: Mock GitHub API responses for testing without hitting real endpoints
- **Key Features**: Simulates GitHub API, repositories, issues, pull requests, and webhooks

#### Octokit.js (JavaScript GitHub SDK)
- **Official SDK**: The all-batteries-included GitHub SDK for Browsers, Node.js, and Deno
- **Documentation**: https://github.com/octokit/octokit.js
- **Installation**: `pnpm add octokit`
- **Basic Usage**:
  ```javascript
  import { Octokit } from "octokit";
  const octokit = new Octokit({ auth: `personal-access-token` });
  const { data } = await octokit.rest.users.getAuthenticated();
  ```

#### GitHub API References
- **REST API**: https://docs.github.com/en/rest
- **GraphQL API**: https://docs.github.com/en/graphql
- **Common Endpoints**:
  - Issues: `POST /repos/{owner}/{repo}/issues`
  - Pull Requests: `POST /repos/{owner}/{repo}/pulls`
  - Repositories: `GET /repos/{owner}/{repo}`
  - Webhooks: `POST /repos/{owner}/{repo}/hooks`

#### GitHub MCP Server
- **Docker Image**: `ghcr.io/github/github-mcp-server`
- **Features**: Direct GitHub API access for AI tools
- **Environment Variables**:
  - `GITHUB_PERSONAL_ACCESS_TOKEN`: Required for authentication
  - `GITHUB_TOOLSETS`: Comma-separated list of toolsets
  - `GITHUB_HOST`: For GitHub Enterprise Server

---

## ⚙️ PERFORMANCE & DEPLOYMENT

### Performance Optimizations

#### pnpm Configuration
The project uses optimized pnpm settings configured in `.npmrc`:
- **Workspace hoisting**: Optimized for monorepo with shared dependencies
- **Auto peer deps**: Automatically installs peer dependencies (helps with React 19)
- **Deep linking**: Better cross-package dependency resolution
- **Performance caching**: Side effects cache enabled for faster installs

#### Nx Configuration
Nx is configured for maximum performance:
- **Daemon process**: Always running for faster command execution
- **Distributed caching**: Nx Cloud enabled for team cache sharing
- **Parallel execution**: Configured to use 8 cores (adjustable)
- **Remote caching**: Enabled for CI/CD pipeline optimization

#### CI/CD Pipeline
The project has optimized GitHub Actions workflows:
- **Preview deployments**: Push to `preview` branch → GitHub Pages at `iflastandards.github.io/platform`
- **Production deployments**: PR from `preview` to `main` → GitHub Pages at `www.iflastandards.info`
- **Vercel previews**: Automatic preview deployments for each push to preview branch
- **Nx Cloud integration**: Distributed builds with 6-8 agents depending on environment

#### Development Environment
- **VS Code**: Configured with `.vscode/settings.json` for optimal development
- **JetBrains IDEs**: Pre-configured run configurations and code styles in `.idea/`
- **Environment variables**: Use `.env.nx` for Nx-specific optimizations
- **Health check**: Run `pnpm health` to verify system configuration

### Deployment Workflow (Phase 5 Compliant)

#### Branch Strategy
1. **Development**: Work on feature branches
2. **Preview**: Merge to `preview` branch for staging
3. **Production**: Create PR from `preview` to `main` (protected branch)

#### Deployment URLs
- **Preview**: https://iflastandards.github.io/platform/
- **Production**: https://www.iflastandards.info/
- **Admin Preview**: https://admin-preview.iflastandards.info
- **Admin Production**: https://admin.iflastandards.info

#### Phase 5 CI/CD Process
1. **Environment Validation**: API tokens, environment variables, service connectivity
2. **Build and Deploy**: Assumes code quality validated locally (Phases 1-4)
3. **Post-Deployment Validation**: Health checks on deployed infrastructure
4. **No Code Testing**: CI focuses only on environment-specific aspects

#### ⚠️ Critical Developer Requirement
**All code quality validation must happen locally before pushing:**
- ✅ Pre-commit hooks must pass (Phase 2)
- ✅ Pre-push hooks must pass (Phase 3)
- ✅ Never bypass with `--no-verify` unless emergency
- ✅ CI assumes your code is already validated

---

## 📚 SYSTEM DESIGN DOCUMENTATION

### Authoritative Architecture Documentation
- **Location**: `@system-design-docs/` - Comprehensive system design and architecture
- **Numbered Sequence**: Documents are numbered 00-32 for logical reading order
- **Key Documents**:
  - `00-executive-summary.md` - High-level system overview
  - `01-system-architecture-overview.md` - Core architecture patterns
  - `10-implementation-strategy.md` - Implementation roadmap
  - `31-spreadsheet-export-import-comprehensive-guide.md` - Import/export workflows
  - `32-phase1-import-export-implementation-plan.md` - Phase 1 integration approach
- **Usage**: Consult these documents for authoritative architectural decisions and design patterns

---

## 🚨 TROUBLESHOOTING

### Common Issues & Solutions

#### Top 5 Mistakes (and fixes)
1. **Hardcoding /admin in admin app**
   - Fix: Remove /admin, use relative paths
   - Check: All Links, fetches, and assets
   
2. **Not using pnpm scripts**
   - Fix: Check package.json first
   - Use: `pnpm test`, `pnpm build:all`, etc.
   
3. **Running commands from subdirectories**
   - Fix: Always cd to root first
   - Remember: All commands run from root
   
4. **Not using MCP servers**
   - Fix: Context7 for docs, MUI for components
   - Check: Before writing new code
   
5. **Running all tests instead of affected**
   - Fix: Use `pnpm test` which runs nx affected
   - Never: `nx run-many -t test`

### Performance Issues
1. **Slow builds**: Run `pnpm nx:optimize` and ensure daemon is running
2. **Cache issues**: Run `pnpm nx:cache:clear` for a fresh build
3. **Dependency conflicts**: Run `pnpm fresh` for clean install
4. **Port conflicts**: Use `pnpm ports:kill` to free up ports

### Performance Tips
1. Always have Nx daemon running: `pnpm nx:daemon:start`
2. Use affected commands when possible: `nx affected -t build`
3. Monitor cache effectiveness: `pnpm nx:cache:stats`
4. Run health check regularly: `pnpm health`

---

## 💡 HELPFUL USER PROMPTS

To help me work better, consider starting prompts with:
- **"Working on admin:"** → Activates admin-specific rules & basePath awareness
- **"Working on docs:"** → Activates documentation rules & Docusaurus patterns
- **"Need to add API route"** → Triggers basePath checks & Next.js patterns
- **"Building UI component"** → Triggers MCP usage & component patterns
- **"Running tests"** → Triggers nx affected usage & test strategy

Examples:
- "Working on admin: Add a new user management page"
- "Working on docs: Create a new vocabulary section for ISBD"
- "Need to debug why API calls fail in production"

---

## important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

<!-- ===== APPENDED BY CONTEXT FORGE RETROFIT - 2025-08-04 ===== -->

## Retrofit Updates - 2025-08-04

# standards-dev - Claude Code Context

This file provides comprehensive guidance to Claude Code when working with this Next.js 15 application with React 19 and TypeScript.

## Project Overview

IFLA Standards Platform

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed.

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification
- **Component-First**: Build with reusable, composable components
- **Fail Fast**: Validate inputs early, throw errors immediately

## 🧱 Code Structure & Modularity

### File and Component Limits

- **Never create a file longer than 500 lines of code**
- **Components should be under 200 lines** for better maintainability
- **Functions should be short and focused (sub 50 lines)**

## 🚀 Next.js 15 & React 19 Key Features

### TypeScript Integration (MANDATORY)

- **MUST use `ReactElement` instead of `JSX.Element`** for return types
- **MUST import types from 'react'** explicitly
- **NEVER use `JSX.Element` namespace**

```typescript
// ✅ CORRECT
import { ReactElement } from 'react';

function MyComponent(): ReactElement {
  return <div>Content</div>;
}

// ❌ FORBIDDEN
function MyComponent(): JSX.Element {  // Cannot find namespace 'JSX'
  return <div>Content</div>;
}
```

## 🏗️ Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (routes)/          # Route groups
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Shared components
│   ├── ui/                # Base UI components
│   └── features/          # Feature components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities
└── types/                 # TypeScript types
```

## 🎯 TypeScript Configuration

### Strict Requirements

- **NEVER use `any` type** - use `unknown` if type is truly unknown
- **MUST have explicit return types** for all functions
- **MUST use type inference from Zod schemas** using `z.infer<typeof schema>`

## 🛡️ Data Validation (MANDATORY)

### Zod Validation Rules

- **MUST validate ALL external data**: API responses, form inputs, URL params
- **MUST use branded types** for IDs
- **MUST fail fast**: Validate at system boundaries

```typescript
import { z } from 'zod';

// Branded types for IDs
const UserIdSchema = z.string().uuid().brand<'UserId'>();
type UserId = z.infer<typeof UserIdSchema>;

// Environment validation
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

## 🧪 Testing Strategy

### Requirements

- **MINIMUM 80% code coverage**
- **MUST co-locate tests** with components in `__tests__` folders
- **MUST use React Testing Library**
- **MUST test user behavior** not implementation details

## 🎨 Component Guidelines

### Documentation Requirements

```typescript
/**
 * Component description
 *
 * @component
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 */
```

## 🔄 State Management Hierarchy

1. **Local State**: `useState` for component-specific state
2. **Context**: For cross-component state within a feature
3. **URL State**: Use search params for shareable state
4. **Server State**: TanStack Query for ALL API data
5. **Global State**: Zustand ONLY when truly needed

## 🔐 Security Requirements

- **MUST sanitize ALL user inputs** with Zod
- **MUST validate file uploads**: type, size, content
- **MUST prevent XSS** with proper escaping
- **MUST implement CSRF protection**
- **NEVER use dangerouslySetInnerHTML** without sanitization

## 💅 Code Style & Quality

### ESLint Rules

- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/explicit-function-return-type`: error
- `no-console`: error (except warn/error)

## 📋 Development Commands

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint --max-warnings 0",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit"
  }
}
```

## ⚠️ CRITICAL GUIDELINES

1. **ENFORCE strict TypeScript** - ZERO compromises
2. **VALIDATE everything with Zod** - ALL external data
3. **MINIMUM 80% test coverage** - NO EXCEPTIONS
4. **MAXIMUM 500 lines per file** - Split if larger
5. **MUST handle ALL states** - Loading, error, empty, success
6. **NEVER use `any` type** - Use proper typing or `unknown`

## 📋 Pre-commit Checklist

- [ ] TypeScript compiles with ZERO errors
- [ ] Tests passing with 80%+ coverage
- [ ] ESLint passes with ZERO warnings
- [ ] All components have JSDoc documentation
- [ ] Zod schemas validate ALL external data
- [ ] No console.log statements
- [ ] Component files under 200 lines

## Workflow Rules

### Before Starting Any Task

- Consult `/Docs/Implementation.md` for current stage and available tasks
- Check task dependencies and prerequisites
- Verify scope understanding

### Task Execution Protocol

1. Read task from Implementation.md
2. Check relevant documentation
3. Implement following existing patterns
4. Test thoroughly
5. Mark task complete only when fully working

### File Reference Priority

1. `/Docs/Bug_tracking.md` - Check for known issues first
2. `/Docs/Implementation.md` - Main task reference
3. `/Docs/project_structure.md` - Structure guidance
4. `/Docs/UI_UX_doc.md` - Design requirements


### PRP Workflow

- Check `/PRPs/` directory for detailed implementation prompts
- Follow validation loops defined in PRPs
- Use ai_docs/ for additional context when needed
