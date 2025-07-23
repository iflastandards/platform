# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 CONTEXT DETECTION - START HERE

### What am I working on?
**ASK MYSELF FIRST**: Which part of the monorepo?
1. **🔴 Admin app** (apps/admin) → Next.js with **CRITICAL basePath rules**
2. **🟢 Documentation sites** (standards/*) → Docusaurus with simpler routing
3. **📦 Shared packages** (packages/*) → Used by both
4. **📚 System Design** (@system-design-docs/) → Authoritative architecture documentation

**💡 USER TIP**: Start prompts with "Working on admin:" or "Working on docs:" to help me focus!

---

## 🚨 CRITICAL RULES - ALWAYS CHECK

### 📋 Universal Checklist (BEFORE EVERY TASK)
- [ ] **Working directory**: Am I in the root? (All commands run from root)
- [ ] **Project context**: Admin app or documentation site?
- [ ] **If admin**: Apply basePath rules (see red section below)
- [ ] **Scripts first**: Check `package.json` scripts before writing bash
- [ ] **MCP usage**: Could Context7/MUI help with this task?
- [ ] **Testing**: Use `nx affected` not full test runs

### 🔧 Monorepo Essentials
- **Package manager**: Always `pnpm` (never npm/yarn)
- **Dependencies**: All in root `package.json`
- **Commands**: Run from root directory
- **Nx commands**: `nx build {project}`, `nx test {project}`
- **Shared code**: `packages/*` directory

---

## 🔴 ADMIN APP RULES (apps/admin)

### ⚠️ basePath Configuration - MOST COMMON MISTAKES
The admin app runs at `/admin` basePath. This affects EVERYTHING:

#### 1. **Links - NEVER hardcode /admin**
```tsx
// ✅ CORRECT - Next.js adds /admin automatically
<Link href="/dashboard">Dashboard</Link>
<Link href="/settings">Settings</Link>

// ❌ WRONG - Results in /admin/admin/dashboard
<Link href="/admin/dashboard">Dashboard</Link>
```

#### 2. **API Calls - ALWAYS use addBasePath**
```tsx
// ✅ CORRECT
import { addBasePath } from '@ifla/theme/utils';
const response = await fetch(addBasePath('/api/vocabularies'));
const data = await fetch(addBasePath(`/api/users/${id}`));

// ❌ WRONG - Will fail in production
const response = await fetch('/api/vocabularies');
const response2 = await fetch('/admin/api/vocabularies');
```

#### 3. **Static Assets - ALWAYS use addBasePath**
```tsx
// ✅ CORRECT
<img src={addBasePath('/logo.png')} />
<link rel="icon" href={addBasePath('/favicon.ico')} />

// ❌ WRONG
<img src="/admin/logo.png" />
<img src="/logo.png" />
```

### Admin-Specific Details
- **Framework**: Next.js 15.1.3 with App Router
- **Start dev**: `nx dev admin --turbopack`
- **Build**: `nx build admin`
- **Dependencies**: React 19, TypeScript 5.7, Tailwind CSS, shadcn/ui
- **API routes**: `apps/admin/src/app/api/`
- **Critical import**: `import { addBasePath } from '@ifla/theme/utils';`

---

## 🟢 DOCUMENTATION SITES RULES (standards/*)

### Docusaurus Sites (No basePath Issues!)
- **Framework**: Docusaurus 3.6.3
- **No basePath complexity** - Standard routing works
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

---

## 📚 ESSENTIAL REFERENCES

### Next.js Coding Standards (ALWAYS CHECK THESE FIRST)
1. **Internal Links**: Always use `<Link href="/dashboard">` - NEVER `<a href="/admin/dashboard">`
2. **API Calls**: Always use `fetch(addBasePath('/api/route'))` - NEVER hardcode basePath
3. **Static Assets**: Always use `addBasePath('/logo.png')` - NEVER manual prepending
4. **Write paths as if app is at root** - Next.js adds basePath automatically
5. **Import utility**: `import { addBasePath } from '@ifla/theme/utils';`

### Testing Strategy (MANDATORY FOR ALL TESTS)
1. **Pre-commit target**: < 60 seconds (use `nx affected`)
2. **Use 5-phase strategy**: On-demand → Pre-commit → Pre-push → Comprehensive → CI
3. **Always use `nx affected`** for development testing
4. **Parallel execution**: `--parallel=3` for performance
5. **Speed targets**: On-demand <5s, Pre-commit <60s, Pre-push <180s
6. **Test placement**: Check `@developer_notes/TEST_PLACEMENT_GUIDE.md` before writing tests

### Critical File References
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

---

## 🧪 TESTING & QUALITY

### Test File Linting
- **Test files use relaxed linting rules**: See `pnpm lint:test-rules` for details
- **Less strict TypeScript**: Tests use `tsconfig.test.json` with relaxed type checking
- **Allowed in tests**: `any` types, console logs, longer functions, empty mocks
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

### Deployment Workflow

#### Branch Strategy
1. **Development**: Work on feature branches
2. **Preview**: Merge to `preview` branch for staging
3. **Production**: Create PR from `preview` to `main` (protected branch)

#### Deployment URLs
- **Preview**: https://iflastandards.github.io/platform/
- **Production**: https://www.iflastandards.info/
- **Vercel Previews**: Automatic for each preview branch commit

#### Build Process
1. **Unified build**: Scripts create a single deployment directory
2. **Environment-specific**: Different configurations for preview/production
3. **Validation**: Automated checks before deployment
4. **Caching**: Aggressive caching for faster builds

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