# CLAUDE.md

AI assistant guidance for the IFLA Standards Platform codebase.

## 🚀 Quick Commands

### Core Development
```bash
pnpm setup                   # Initial project setup
pnpm dev:servers            # All dev servers with helper
pnpm dev:interactive        # With Chrome browser  
pnpm dev:headless          # No browser windows
pnpm nx start [site]       # Specific site (portal/isbd/admin)
```

### Build & Test (5-Phase Strategy)
```bash
# Build
pnpm build:all             # All sites
pnpm build:affected        # Changed only (Nx optimized)
pnpm nx build [site]       # Specific site

# Phase 1: Selective Testing (Development)
pnpm test                  # Affected only (nx affected --target=test)
pnpm test --grep "@unit"   # Unit tests only
pnpm test --grep "@integration" # Integration tests (default)
pnpm test --grep "@critical"    # Critical tests only
pnpm nx test [project]     # Specific project

# Phase 2-3: Automated (Git Hooks)
pnpm test:pre-commit       # Phase 2: TypeScript + Lint + Unit (affected)
pnpm test:pre-push         # Phase 3: Integration + Builds + Smart E2E

# Phase 4: Comprehensive Testing (Manual)
pnpm test:comprehensive    # All tests, parallelized (<300s)
pnpm test:comprehensive:unit   # All unit tests
pnpm test:comprehensive:e2e    # All E2E tests

# AI Test Tagging (Required)
pnpm test:tag              # Auto-tag all tests (dry-run)
pnpm test:tag --staged     # Tag staged files before commit
pnpm test:tag --affected --no-dry-run  # Apply to changed files
pnpm test:tag --provider anthropic     # Use Claude for accuracy

# E2E with On-Demand Servers
pnpm playwright test e2e/portal/*.spec.ts    # Auto-starts portal server
pnpm playwright test e2e/admin/*.spec.ts     # Auto-starts admin server
pnpm test:servers status   # Check server status
pnpm test:servers stop     # Stop all test servers
```

### Quality & Utilities
```bash
pnpm typecheck            # TypeScript validation
pnpm lint                 # ESLint check
pnpm lint:fix            # Auto-fix issues
pnpm nx:cache:clear      # Clear build cache
pnpm ports:kill          # Kill dev servers
pnpm health              # System check
```

## 📁 Architecture

```
standards-dev/
├── apps/
│   ├── admin/              # Next.js 15.4 admin (App Router + Feature Factory)
│   └── docs/               # System docs (Docusaurus on port 3030)
├── portal/                 # Main docs (Docusaurus 3.8)
├── standards/              # Individual sites (Docusaurus)
│   └── {ISBDM,LRM,FRBR,isbd,muldicat,unimarc}/
├── packages/
│   ├── theme/              # Shared Docusaurus components
│   ├── unified-spreadsheet/# Spreadsheet processing
│   ├── contracts/          # Zod schemas & configs
│   └── dev-servers/        # Dev server management
├── developer_notes/        # Development workflows & guidance
├── docs/                   # System & user docs & guidance
├── system-design-docs/     # Architecture docs (00-38)
├── e2e/                    # Playwright E2E tests (on-demand servers)
└── scripts/                # Build & utility scripts + AI test tagging
```

## 🛠️ Tech Stack

| Layer | Technology | Version/Notes |
|-------|------------|---------------|
| **Build** | Nx monorepo + pnpm | v21.3.11, affected commands |
| **Frontend** | React + TypeScript | 19.1.1 / 5.8.3 |
| **Frameworks** | Docusaurus / Next.js | 3.8.1 / 15.4.4 (App Router) |
| **Testing** | Vitest / Playwright | Unit / E2E, tag-based |
| **Auth** | Clerk + GitHub OAuth | Custom RBAC via publicMetadata |
| **Data** | Git (primary) / Supabase | Version control / Temp storage |
| **Deploy** | GitHub Pages | preview/production branches |

## 🔑 Key Decisions

1. **Git-Centric**: All content version-controlled, PR-based workflow
2. **Static-First**: Docusaurus for docs, Next.js for dynamic admin
3. **Shared Theme**: `@ifla/theme` package for cross-site consistency
4. **Env Config**: TypeScript configs, not `.env` files
5. **Test Strategy**: Integration > Unit, tags for selective execution

## 🧪 Testing Philosophy (Mock-First Strategy)

### Testing Trophy Approach (Integration-Heavy)
- **Integration Tests (Primary)**: `@integration` - Components with MSW mocks, multiple components working together
- **Unit Tests**: `@unit` - Pure logic, algorithms, Zod schemas (isolated functions only)  
- **E2E Tests**: `@e2e` - User journeys with `NEXT_PUBLIC_USE_MOCK=true` for deterministic CI behavior
- **Environment Tests**: `@env` - Live service validation, deployment verification

### Mock-First Development
- **Phase 3 (Refinement)**: MSW mocks for UI development (Feature Factory)
- **Phase 4 (Implementation)**: Integration tests with MSW data providers
- **Phase 5 (Testing)**: E2E with controlled mock data for CI consistency
- **Environment Switching**: Mock/live toggling via `NEXT_PUBLIC_USE_MOCK` flag

### 5-Phase Testing Strategy
1. **Phase 1 - Selective** (Development): Tag-based testing, affected only
2. **Phase 2 - Pre-commit** (Auto): TypeScript + Lint + Unit tests (affected)
3. **Phase 3 - Pre-push** (Auto): Integration + Builds + Smart E2E
4. **Phase 4 - Comprehensive** (Manual): Full validation for releases (<300s)
5. **Phase 5 - CI Environment** (Auto): Smoke tests against deployed URLs

### On-Demand Server Management
- **Smart Detection**: Tests auto-start servers based on file paths and tags
- **Reuse**: Running servers are reused, not restarted
- **Persist**: Servers stay running after tests for debugging
- **Commands**: `pnpm test:servers status|start|stop`

### Test Tags (Required)
| Category | Functional | Priority |
|----------|------------|----------|
| `@integration` (default) | `@api` `@auth` `@rbac` | `@critical` |
| `@unit` (rare) | `@ui` `@validation` | `@happy-path` |
| `@e2e` | `@security` `@cache` | `@error-handling` |
| `@env` (CI only) | `@performance` `@a11y` | `@edge-case` |

### Test Implementation Patterns

**Integration Tests (Primary):**
```typescript
// ComponentName.test.tsx - alongside component
describe('UserForm Integration @integration @ui @validation', () => {
  beforeAll(() => {
    // Setup MSW handlers for data provider
    server.use(mockUserHandlers);
  });
  
  it('should submit form with mocked API', async () => {
    render(<UserForm />);
    // Component doesn't know it's using mocked data
    await userEvent.type(screen.getByRole('textbox'), 'test');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    // Verify MSW mock was called correctly
  });
});
```

**E2E Tests (Mock-First):**
```typescript
// user-workflow.e2e.test.ts
test('user creates account @e2e @critical @auth', async ({ page }) => {
  // Runs with NEXT_PUBLIC_USE_MOCK=true in CI
  // Deterministic behavior with controlled data
  await page.goto('/register');
  // ... user flow with predictable mock responses
});
```

### AI Test Tagging (Required)
```bash
# One-time setup (choose provider)
echo "ANTHROPIC_API_KEY=key" >> .env  # Most accurate (recommended)
echo "OPENAI_API_KEY=key" >> .env     # GPT-4 alternative
echo "GEMINI_API_KEY=key" >> .env     # Free tier
echo "PERPLEXITY_API_KEY=key" >> .env # Budget option

# Usage (auto-validates in pre-commit hook)
pnpm test:tag --provider anthropic --staged  # Before commit
pnpm test:tag --affected --no-dry-run       # Apply to changed files
pnpm test:tag --move-files                  # Get file placement suggestions
```

## 📍 Component Map

| Area | Location | Purpose |
|------|----------|---------|
| **Admin (Next.js)** |
| Components | `apps/admin/src/components/` | UI components |
| API Routes | `apps/admin/src/app/api/` | Backend endpoints |
| Tests | `apps/admin/src/test{,s}/` | Test suites |
| Services | `apps/admin/src/lib/` | Business logic |
| **Docusaurus Sites** |
| Shared | `packages/theme/src/components/` | Reusable components |
| Site-specific | `[site]/src/components/` | Custom components |
| Content | `[site]/docs/` | MDX documentation |
| Tests | `packages/theme/src/tests/` | Component tests |

## ⚙️ Critical Configs

| File | Purpose |
|------|---------|
| `nx.json` | Project deps & build config |
| `tsconfig.json` | Path aliases & compiler |
| `vitest.config.nx.ts` | Test runner config |
| `playwright.config.ts` | E2E test config |
| `packages/theme/src/config/siteConfig.ts` | Multi-site URLs |

## 🔄 Workflow

### Feature Development
```
preview branch → feature branch → tests → implement → lint → PR
```

### Git Hooks
- **Pre-commit**: Secrets + TypeScript + Unit tests (affected)
- **Pre-push**: Integration tests + Builds + Critical E2E

## 🎯 Common Tasks

### Admin Feature Development (6-Phase Feature Factory)
```bash
# Phase 1: Discovery (15-30 min)
pnpm admin:feature "user-imports"    # Interactive feature discovery

# Phase 2: Instant Scaffolding (5 min)  
pnpm admin:scaffold                  # Generate refine.dev CRUD + MSW mocks

# Phase 3: Iterative Refinement (2-3 hours)
pnpm admin:refine                    # Polish UI with mock data (NO BACKEND)

# Phase 4: Backend Implementation (2 hours)
pnpm admin:backend                   # Implement Supabase + services

# Phase 5: Testing (1 hour)
pnpm admin:test                      # Integration + E2E + accessibility

# Phase 6: Documentation (1 hour) - NEW!
pnpm admin:docs                      # Generate docs + user guides

# Utilities
pnpm admin:status                    # Check current feature status
pnpm admin:checkpoint                # Save stable state  
pnpm admin:resume                    # Resume from last checkpoint
```

### Site & Vocabulary Management
```bash
# New Docusaurus Site
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard"
pnpm tsx scripts/page-template-generator.ts --namespace=newsite

# Vocabulary Management
pnpm vocabulary:create                                    # Create sheet
pnpm compare:vocabulary --markdown                        # Compare
npx tsx scripts/generate-vocabulary-sites.ts --sites new  # Generate

# Performance & Analysis
pnpm nx:optimize          # Optimize Nx config
pnpm nx:graph            # View dependency graph
```

## 🚪 Port Allocation

| Port | Service | Type | URLs |
|------|---------|------|------|
| 3000 | Portal | Docusaurus | Local dev |
| 3001-3006 | ISBDM→UNIMARC | Docusaurus | Local dev |
| 3007 | Admin | Next.js | Local dev |
| 3030 | Docs Server | Docusaurus | Local: `localhost:3030` |

### Environment URLs
| Service | Preview | Production |
|---------|---------|------------|
| Docs Server | `docs-iflastandards-preview.onrender.com` | `docs.iflastandards.info` |

## ⚠️ Development Rules

### 🔴 Critical (Never Compromise)
- **Git Safety**: `git status && git branch` → feature branch only, never preview/production
- **Quality Gates**: `pnpm typecheck && pnpm lint` before completion  
- **Test Validation**: Never skip tests or use `--no-verify` (ask permission first)
- **Root Cause Analysis**: Debug failures systematically, fix don't workaround

### 🟡 Important (Strong Preference) 
- **Task Planning**: TodoWrite for >3 step tasks, parallel operations when possible
- **Implementation**: Complete features to working state, no TODO comments
- **Architecture**: Follow multi-site patterns, use `packages/theme/` for shared components
- **Professional**: Evidence-based claims, no marketing language ("blazingly fast")

### 🟢 Workflow Patterns
- **Nx Commands**: Use `pnpm nx affected` over individual commands for efficiency
- **Testing**: Integration-first with `pnpm test:tag --staged` before commits
- **Multi-Site**: Theme changes affect all sites, test comprehensively
- **File Placement**: Check existing patterns before creating new directories

### Git Workflow (IFLA-Specific)
```
preview branch → feature branch → tests → implement → lint → PR to preview
```
- **Branch Model**: Never work directly on preview/production branches
- **Hooks**: Pre-commit (secrets + TypeScript + unit), Pre-push (integration + builds)
- **Deployment**: GitHub Pages from preview/production branches

### Quick Decision Trees

**🔴 Before File Operations**
```
├─ Writing/Editing? → Read existing → Understand patterns → Edit
├─ Creating new? → Check existing structure → Place appropriately  
└─ Multi-site impact? → Test all affected sites
```

**🟡 Starting New Feature**
```
├─ Scope clear? → No → Clarify requirements first
├─ >3 steps? → Yes → TodoWrite required
├─ Affects theme? → Yes → Test all sites
└─ Framework deps? → Check package.json first
```

**🟢 Tool Selection**
- Multi-file edits → MultiEdit over individual Edits
- Code operations → JetBrains MCP first, Serena fallback
- Search operations → JetBrains search > Grep tool (ripgrep-based) > never bash grep
- Symbol refactoring → JetBrains rename_refactoring (LSP-aware)
- Complex analysis → Task agents over native reasoning
- Nx operations → Use affected commands for efficiency
- Session management → Serena MCP for `/sc:load` `/sc:save`

## 📚 Essential Docs

- **Testing Strategy**: `developer_notes/TESTING_STRATEGY.md` (5-phase approach)
- **Testing Quick Ref**: `developer_notes/TESTING_QUICK_REFERENCE.md` (integration-first)
- **Admin Workflow**: `developer_notes/ADMIN_FEATURE_WORKFLOW.md` (6-phase Feature Factory)
- **Architecture**: `system-design-docs/` (00-38 numbered docs)
- **AI Testing Guide**: `developer_notes/AI_TESTING_INSTRUCTIONS.md`

### Key Rules Summary
- **Test Tags Required**: All tests must have `@integration/@unit/@e2e/@env` + functional tags
- **Mock-First Strategy**: MSW mocks for integration tests, `NEXT_PUBLIC_USE_MOCK=true` for E2E CI
- **Testing Trophy**: Heavy integration testing, minimal unit tests (pure logic only)
- **Environment Switching**: Mock/live toggling for controlled vs real data testing
- **Tests During Development**: Written in Phase 4 (Implementation), not afterthoughts
- **Component Isolation**: Components don't know they're being tested (MSW transparency)
- **5-Phase Validation**: Selective → Pre-commit → Pre-push → Comprehensive → CI
- **On-Demand Servers**: Tests auto-start needed servers, reuse running ones
- **Feature Factory**: 6-phase workflow for admin features (UI-first, backend-last)