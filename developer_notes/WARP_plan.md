# WARP.md Creation Plan

This document tracks the phased approach to creating a comprehensive WARP.md file for the IFLA Standards Platform repository.

## Current Phase: Phase 2 - Draft WARP.md skeleton
*Status*: 🔄 IN PROGRESS

## Master Checklist

### Phase 0 - Planning & Setup
- [x] Create this WARP_plan.md with phased checklist
- [x] Define master checkbox list for each phase and sub-task
- [x] Add "Current Phase:" marker to be updated by agents
- [x] Commit planning document

### Phase 1 - Research & Source-gathering
- [x] Scan and bookmark key files/dirs:
  - [x] README.md, nx.json, package.json, tsconfig.*
  - [x] developer_notes/**/* 
  - [x] system-design-docs/**/*
  - [x] docs/**/*
  - [x] scripts/, packages/theme/src/config/, siteConfig.ts
- [x] Use `rg -i "warp"` & `rg -i "architecture"` for existing notes
- [x] Copy relevant snippets or links into "Research Notes" section below
- [x] Highlight mandatory rules to surface in the final doc
- [x] Fill "Research Notes" section with all source links
- [x] Update checklist, pause for user approval to start Phase 2

### Phase 2 - Draft WARP.md skeleton
- [ ] Create <root>/WARP.md with high-level outline:
  - [ ] 1. Purpose & Audience
  - [ ] 2. Quick-Start Commands  
  - [ ] 3. Repository & Nx Monorepo Structure
  - [ ] 4. High-Level Architecture Patterns
  - [ ] 5. Development Workflows
  - [ ] 6. Testing Strategy & Nx affected usage
  - [ ] 7. Coding Conventions & Common Pitfalls
  - [ ] 8. Troubleshooting & FAQ
  - [ ] 9. Reference Appendix (cheat-sheets, links)
- [ ] Insert "TBD" placeholders in each section
- [ ] Commit as "docs: add WARP.md outline"
- [ ] Pause for approval to populate content

### Phase 2.1 - Populate Quick-Start Commands section
- [ ] Aggregate essential commands from existing rules (`pnpm`, `nx`, testing, performance)
- [ ] Provide copy-paste blocks and short explanations
- [ ] Ensure all commands use non-interactive flags and fast-fail behaviour per rules
- [ ] Mark commands that are CI-only or local-only
- [ ] Update WARP.md and WARP_plan.md, commit, request approval

### Phase 2.2 - Document High-Level Architecture Patterns
- [ ] Describe monorepo layout (apps/, standards/, packages/, scripts/, docs/, system-design-docs/)
- [ ] Explain data-flow: Clerk → Supabase → File-system → GitHub
- [ ] Show relationship between Docusaurus sites and shared theme
- [ ] Provide architecture diagram links (PNG/SVG) if present in system-design-docs
- [ ] Commit and seek approval

### Phase 2.3 - Write Development Workflows & Testing Strategy
- [ ] Branching (feature → preview → main)
- [ ] Nx affected usage, selective vs comprehensive tests
- [ ] Pre-commit hooks, Husky, typecheck exclusions
- [ ] E2E/site-oriented testing, authentication test users, performance targets
- [ ] Deployment pipeline overview (GitHub Pages, Vercel previews)
- [ ] Ensure alignment with Critical Rules docs
- [ ] Commit; pause for approval

### Phase 2.4 - Integrate Coding Conventions & Common Pitfalls
- [ ] Summarise basePath rules, path utilities, strict typing, no `any`, no hard-coding URLs
- [ ] Include code snippets showing correct/incorrect usage (already provided in rules)
- [ ] Emphasise rule precedence and automated checks
- [ ] Commit; pause for approval

### Phase 2.5 - Add Troubleshooting & Reference Appendices
- [ ] Common errors & fixes (port conflicts, cache issues, slow builds)
- [ ] Cheat-sheet tables for ports, env vars, CLI shortcuts
- [ ] Link out to deeper docs in docs/ and system-design-docs/
- [ ] Commit; pause for approval

### Phase 3 - Quality Review
- [ ] Run remark-lint, prettier, markdown-link-check on WARP.md
- [ ] Ensure zero lint errors, all internal links resolve
- [ ] Add CI badge section if desired
- [ ] Commit "docs: lint WARP.md"; pause for approval

### Phase 4 - Finalize & Cleanup
- [ ] Tick remaining boxes in WARP_plan.md, update status to COMPLETE
- [ ] Push branch, optionally open PR to main if separate branch
- [ ] Remove any temporary research files
- [ ] Announce completion

## Research Notes
*Completed during Phase 1*

### Key Files Analyzed:
- **README.md** - High-level overview, tech stack, quick start, site URLs, deployment
- **package.json** - Massive script library (400+ scripts), tech versions, port mappings
- **nx.json** - Monorepo configuration, target defaults, parallelism settings (12 cores)
- **tsconfig.json** - TypeScript config with strict settings, path mappings (@ifla/*)
- **vitest.config.nx.ts** - Nx-optimized test config with global mocks and exclusions
- **packages/theme/src/config/siteConfig.ts** - SINGLE SOURCE OF TRUTH for all site URLs across environments
- **system-design-docs/** - 38 comprehensive architecture documents (numbered 00-38)
- **developer_notes/** - Implementation guides, testing strategies, auth architecture

### Important Rules Identified:
1. **MANDATORY**: Use `pnpm` exclusively (never npm/yarn) 
2. **MANDATORY**: All git commands must exit immediately on errors (no hanging)
3. **MANDATORY**: No basePath hardcoding - use root-relative paths (/dashboard) and addBasePath() utility
4. **MANDATORY**: Always use ES Module import/export syntax, never require()
5. **MANDATORY**: Strict TypeScript - no `any` without documented justification
6. **MANDATORY**: Nx affected commands for performance (`nx affected -t test --parallel=3`)
7. **MANDATORY**: Pre-commit hooks with typecheck/lint/test validation
8. **AUTH**: Only Clerk for authentication (Cerbos eliminated)
9. **TESTING**: 5-phase testing strategy (selective→comprehensive→pre-commit→pre-push→CI)
10. **ADMIN**: Next.js admin uses Material-UI (NO Tailwind CSS)
11. **DOCS**: Docusaurus sites use Infima + SASS/SCSS

### Architecture Patterns Found:
- **Nx Monorepo**: 21.3.11 with aggressive parallelization (12 cores)
- **Two-Platform System**: 
  - Admin Portal: Next.js 15.2.5 + MUI + Clerk + API routes
  - Doc Sites: Docusaurus 3.8+ + Infima + Static generation
- **Data Storage Strategy**: Distributed across Git→Clerk(8KB)→Supabase→GitHub
- **Single Config Source**: `packages/theme/src/config/siteConfig.ts` for all URLs
- **Environment Matrix**: local|preview|production with TypeScript config (not .env files)
- **Git-Centric Workflow**: Git as source of truth, PR-based review, branch protection
- **Role-Based Architecture**: Custom RBAC via Clerk publicMetadata
- **Progressive Enhancement**: Static-first with dynamic layers

### Commands & Scripts Found:
- **Essential Dev**: `pnpm nx dev admin --turbopack`, `pnpm dev:servers`, `pnpm health`
- **Testing**: `pnpm test` (affected), `pnpm test:comprehensive`, `pnpm test:e2e`
- **Building**: `pnpm build:all`, `pnpm nx build {site}`, `pnpm nx affected -t build`
- **Performance**: `pnpm nx:optimize`, `pnpm nx:daemon:start`, `pnpm nx:cache:clear`
- **Port Management**: `pnpm ports:kill`, development servers on 3000-3008
- **Quality**: `pnpm typecheck`, `pnpm lint`, pre-commit/pre-push hooks via Husky
- **Site Management**: `pnpm tsx scripts/scaffold-site.ts`, vocabulary tools
- **Database**: Supabase integration, Google Sheets API for bulk editing

### Links to Deeper Documentation:
- **System Design**: `system-design-docs/README.md` - 38 numbered docs (00-38)
- **Platform Guide**: `system-design-docs/20-platform-specific-architecture-guide.md` - **CRITICAL**
- **Testing Strategy**: `system-design-docs/06-testing-strategy.md` + `developer_notes/TESTING_STRATEGY.md`
- **Development Workflow**: `system-design-docs/04-development-workflow.md` - 8-phase lifecycle
- **Auth Architecture**: `developer_notes/authentication-authorization-architecture.md`
- **AI Development**: `system-design-docs/35-ai-development-guidelines.md`
- **Coding Standards**: `system-design-docs/36-platform-coding-standards.md`
- **Performance Config**: `developer_notes/SYSTEM_CONFIGURATION.md` (16-core Apple Silicon)
- **Import/Export**: `system-design-docs/31-spreadsheet-export-import-comprehensive-guide.md`

---
*Last Updated*: 2025-01-18 by Warp Agent
