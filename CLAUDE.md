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

### Build & Test
```bash
# Build
pnpm build:all             # All sites
pnpm build:affected        # Changed only
pnpm nx build [site]       # Specific site

# Test (Integration-First)
pnpm test                  # Affected only
pnpm test:comprehensive    # Full suite
pnpm test:pre-commit:robust # Fast validation
pnpm nx test [project]     # Specific project

# AI Test Tagging (NEW)
pnpm test:tag              # Auto-tag all tests (dry-run)
pnpm test:tag --staged     # Tag staged files before commit
pnpm test:tag --affected --no-dry-run  # Apply to changed files

# Single Test Execution
pnpm vitest run path/to/test.test.ts      # Unit
pnpm playwright test path/to/test.spec.ts  # E2E
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
├── apps/admin/              # Next.js 15.4 admin (App Router)
├── portal/                  # Main docs (Docusaurus 3.8)
├── standards/               # Individual sites (Docusaurus)
│   └── {ISBDM,LRM,FRBR,isbd,muldicat,unimarc}/
├── packages/
│   ├── theme/              # Shared Docusaurus components
│   ├── unified-spreadsheet/# Spreadsheet processing
│   └── dev-servers/        # Dev server management
├── system-design-docs/     # Architecture docs (00-38)
├── e2e/                    # Playwright E2E tests
└── scripts/                # Build & utility scripts
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

## 🧪 Testing Philosophy

### Integration-First Approach
- **Default**: Real I/O, actual files, multiple components
- **Unit tests**: Only for pure functions (rare)
- **E2E tests**: Complete user journeys via browser
- **5-Phase Strategy**: Dev → Pre-commit → Pre-push → Comprehensive → CI

### Test Tags (Required)
| Category | Functional | Priority |
|----------|------------|----------|
| `@integration` (default) | `@api` `@auth` `@rbac` | `@critical` |
| `@unit` (rare) | `@ui` `@validation` | `@happy-path` |
| `@e2e` | `@security` `@cache` | `@error-handling` |
| `@env` (CI only) | `@performance` `@a11y` | `@edge-case` |

### AI Test Tagging Setup
```bash
# One-time setup (choose provider)
echo "ANTHROPIC_API_KEY=key" >> .env  # Most accurate
echo "OPENAI_API_KEY=key" >> .env     # Alternative
echo "GEMINI_API_KEY=key" >> .env     # Free tier
echo "PERPLEXITY_API_KEY=key" >> .env # Budget

# Usage
pnpm test:tag --provider anthropic --staged  # Before commit
pnpm test:tag --affected --no-dry-run       # Apply changes
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

```bash
# Admin Feature Development (NEW!)
pnpm admin:feature "user-imports"    # Start Feature Factory
pnpm admin:scaffold                  # Generate refine.dev UI
pnpm admin:refine                    # Iterate on UI/mocks
pnpm admin:backend                   # Implement backend
pnpm admin:test                      # Run tests

# New Docusaurus Site
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard"
pnpm tsx scripts/page-template-generator.ts --namespace=newsite

# Vocabulary Management
pnpm vocabulary:create                                    # Create sheet
pnpm compare:vocabulary --markdown                        # Compare
npx tsx scripts/generate-vocabulary-sites.ts --sites new  # Generate

# Performance
pnpm nx:optimize          # Optimize config
pnpm nx:graph            # View dep graph
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

- Testing: `developer_notes/AI_TESTING_INSTRUCTIONS.md`
- Quick Ref: `developer_notes/TESTING_QUICK_REFERENCE.md`
- Architecture: `system-design-docs/` (00-38 numbered docs)