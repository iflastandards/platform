# CLAUDE.md

AI guidance for IFLA Standards Platform.

## 🚀 Commands

**Dev**: `setup` • `dev:servers` • `dev:interactive` • `dev:headless` • `nx start [site]`

**Build**: `build:all` • `build:affected` • `nx build [site]`

**Test (5-Phase)**:
- Phase 1: `test` • `test --grep "@unit|@integration|@critical"` • `nx test [project]`  
- Phase 2-3: `test:pre-commit` • `test:pre-push` (auto git hooks)
- Phase 4: `test:comprehensive` • `test:comprehensive:unit|e2e` (<300s)
- AI Tag: `test:tag --staged --provider anthropic` (required)
- E2E: `playwright test e2e/[portal|admin]/*.spec.ts` (auto-starts servers)
- Servers: `test:servers status|stop`

**Quality**: `typecheck` • `lint` • `lint:fix` • `nx:cache:clear` • `ports:kill` • `health`

## 📁 Structure

```
apps/admin (Next.js 15.4 + Feature Factory) • apps/docs (3030) • portal (Docusaurus 3.8)
standards/{ISBDM,LRM,FRBR,isbd,muldicat,unimarc} • packages/theme (shared components)
packages/{unified-spreadsheet,contracts,dev-servers} • e2e (Playwright + on-demand servers)
developer_notes • docs • system-design-docs (00-38) • scripts (AI test tagging)
```

## 🛠️ Stack

**Build**: Nx v21.3.11 + pnpm (affected commands)  
**Frontend**: React 19.1.1 + TypeScript 5.8.3  
**Frameworks**: Docusaurus 3.8.1 / Next.js 15.4.4 (App Router)  
**Test**: Vitest/Playwright (tag-based) • **Auth**: Clerk + GitHub OAuth (RBAC)  
**Data**: Git (primary) / Supabase • **Deploy**: GitHub Pages (preview/production)

## 🔑 Decisions

Git-centric (PR workflow) • Static-first (Docusaurus/Next.js) • Shared theme (`@ifla/theme`)  
TypeScript configs (not `.env`) • Integration > Unit testing (tag-based)

## 🧪 Testing (Mock-First)

**Strategy**: Integration > Unit • MSW mocks • Tag-based execution

**Types**: `@integration` (primary, MSW) • `@unit` (pure logic) • `@e2e` (NEXT_PUBLIC_USE_MOCK=true) • `@env` (CI only)

**5-Phase**: Selective → Pre-commit → Pre-push → Comprehensive → CI  

**Servers**: Auto-start/reuse based on file paths • `test:servers status|start|stop`

**Tags**: `@api @auth @rbac` • `@ui @validation` • `@security @cache` • `@critical @happy-path @error-handling @edge-case`

**AI Tagging**: `test:tag --provider anthropic --staged` (required, auto-validates pre-commit)

## 📍 Locations

**Admin**: `apps/admin/src/{components,app/api,test,lib}` (UI, endpoints, tests, logic)  
**Sites**: `packages/theme/src/components` (shared) • `[site]/src/components` • `[site]/docs` (MDX)  
**Config**: `nx.json` • `tsconfig.json` • `vitest.config.nx.ts` • `playwright.config.ts` • `packages/theme/src/config/siteConfig.ts`

## 🔄 Workflow

**Git**: preview → feature branch → tests → implement → lint → PR  
**Hooks**: Pre-commit (secrets + TypeScript + unit) • Pre-push (integration + builds + E2E)

## 🎯 Tasks

**Admin (7-Phase Factory)**: 
- **Start**: `admin:feature "name"` (auto-creates `feature/name` branch)
- **Workflow**: `admin:{scaffold,refine,backend,test,docs}`
- **Tracking**: `admin:{status,checkpoint,pause,resume,switch}`
- **Natural**: "Where are we?" • "Let's take a break" • "Let's park this"

**Sites**: `tsx scripts/scaffold-site.ts --siteKey=X --title="Y"` • `tsx scripts/page-template-generator.ts --namespace=X`

**Vocabulary**: `vocabulary:create` • `compare:vocabulary --markdown` • `tsx scripts/generate-vocabulary-sites.ts --sites new`

**Analysis**: `nx:optimize` • `nx:graph`

## 🚪 Ports

3000 (Portal) • 3001-3006 (ISBDM→UNIMARC) • 3007 (Admin) • 3030 (Docs)  
**URLs**: `docs-iflastandards-preview.onrender.com` • `docs.iflastandards.info`

## ⚠️ Rules

### 🔴 Critical
**NEVER `git push` WITHOUT EXPLICIT REQUEST** • **NEVER use `--no-verify` unless user EXPLICITLY requests it** • `git status && git branch` → feature branch only • `typecheck && lint` before completion • Debug systematically (fix don't workaround)

### 🟡 Important  
**Refine.dev first** for admin CRUD/forms/tables • TodoWrite >3 steps • Complete features (no TODO comments) • Multi-site patterns (`packages/theme/`) • Evidence-based claims (no marketing)

### 🟢 Patterns
`nx affected` commands • Integration-first + `test:tag --staged` • Theme changes → test all sites • Check patterns before creating

### Decision Trees
**Admin Features**: Admin CRUD? → Refine generators first → Customize if needed  
**File Ops**: Write/Edit → Read existing → Understand patterns → Edit  
**Features**: Scope clear? → >3 steps? → TodoWrite → Theme impact? → Test all  
**Tools**: Refine > custom admin • MultiEdit > Edit • JetBrains > Serena • Grep > bash grep • Task agents > native • `/sc:load` `/sc:save`

## 📚 Docs

`developer_notes/{TESTING_STRATEGY,TESTING_QUICK_REFERENCE,ADMIN_FEATURE_WORKFLOW,AI_TESTING_INSTRUCTIONS}.md` • `system-design-docs/` (00-38)

### Key Rules
- Test tags required: `@integration/@unit/@e2e/@env` + functional
- MSW mocks + `NEXT_PUBLIC_USE_MOCK=true` for CI deterministic behavior  
- Integration > Unit (pure logic only) • Component isolation (MSW transparency)
- 5-Phase validation • On-demand servers • 6-phase Feature Factory (UI-first)