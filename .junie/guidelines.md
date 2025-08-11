# IFLA Standards – Advanced Dev Guidelines (Junie)

This file captures project-specific practices for build, configuration, testing, and debugging. It is tailored to this monorepo’s Nx/Docusaurus/Next.js setup. Keep this document up to date as architecture evolves.

## 0) System Design Docs First (Mandatory pre-task step)

- Before starting any task, Junie must consult the navigation map in `system-design-docs/README.md` (System Design Documentation) and identify the relevant documents based on the task type.
- Provide a brief "Setup & Integration Overview" at the top of your first response for each task, using the template below. This ensures consistent environment, platform alignment, and doc references.
- Use Doc 20 (Platform-Specific Architecture Guide) as the primary fork: Admin (Next.js) vs Docusaurus (Docs). Then include additional docs as directed by the README’s Task-Based Navigation.

Template: Setup & Integration Overview
- Platform: Admin (Next.js) | Docusaurus (Docs)
- Key docs: Doc 20 (+ others per task; e.g., 1, 2, 3, 5, 6, 11, 12–14, 31, 33, 35, 36, 37)
- Critical rules: Admin uses Material-UI (MUI) only; NO Tailwind CSS. Docusaurus uses Infima with SASS/SCSS.
- Paths: Admin `apps/admin/`; Docs `standards/*/`, shared `packages/theme/`
- Env/baseline: `pnpm install`; Node/pnpm per repo; caches: `pnpm clear:all`, `nx reset`, `pnpm clear:webpack`
- Commands (examples): build `nx build <project>`; dev `nx run <project>:start:robust`; tests `nx affected --target=test` or `nx test <project>`
- Related integrations (if applicable): Auth (Clerk), RBAC (Docs 12–14), Import/Export (Docs 31, 33, 37), Testing (Doc 6, Doc 35), Deployment (Docs 10, 20)

Quick Doc routes from README
- Admin tasks: Doc 20 → 1 → 5 → 11 (MUI) → 36
- Docs tasks: Doc 20 → 1 → 3 → 11 (Infima) → 36
- RBAC/Permissions: 12, 13, 14
- Import/Export: 31, 33, 37
- Testing: 6, 35
- Deployment/CI: 10, 20

## 1) Build/Configuration Instructions (Nx-first)

- Monorepo structure
  - Apps/Sites: `portal/`, `standards/*` (FRBR, ISBD, ISBDM, LRM, MulDiCat, UniMARC, NewTest), `apps/admin` (Next.js)
  - Shared packages: `packages/theme` (shared components, config, utils), `packages/preset-ifla` (Docusaurus preset)
- Primary tooling
  - Task runner: Nx (preferred; configured for caching and affected detection)
  - Docs: Docusaurus v3.8 (sites under portal/ and standards/*)
  - Next.js: apps/admin (Next.js 15 + Clerk)
  - Tests: Vitest (unit/integration) + Playwright (E2E)
  - Styling: Admin uses Material-UI (MUI) only (NO Tailwind); Docusaurus uses Infima with SASS/SCSS. Docusaurus components are global by default and should be implemented in `packages/theme/src/components/` unless a site-specific override is explicitly required.
- Baseline environment
  - Node and pnpm must match repo standards (see `pnpm-lock.yaml` and CI).
  - Install deps: `pnpm install`
  - Clear caches when in doubt:
    - `pnpm clear:all` (build artifacts)
    - `nx reset` (Nx cache)
    - `pnpm clear:webpack` (webpack cache)
- Build commands (Nx optimized)
  - Per app/site: e.g. `nx build portal`, `nx build isbdm`, `nx build admin`
  - Full build matrix: `nx run-many --target=build --all` or `nx affected --target=build`
  - Legacy pnpm scripts exist but prefer Nx for caching/affected performance.
- Dev servers with robust port cleanup (recommended)
  - Examples: `nx run portal:start:robust`, `nx run admin:start:robust`
  - Start all: `nx run standards-dev:start-all:robust` or `pnpm start:robust`
- Port management
  - Mappings: portal 3000, ISBDM 3001, LRM 3002, FRBR 3003, ISBD 3004, MulDiCat 3005, UniMARC 3006, Admin Portal 3007, NewTest 3008
  - Kill ports: `pnpm ports:kill`, `pnpm ports:kill:site portal`, or `node scripts/utils/port-manager.js port 3004`
- Config architecture
  - Base config: `packages/theme/src/config/siteConfigCore.ts`
  - Site factory: `packages/theme/src/config/standardSiteFactory.ts` (use `createStandardSiteConfig()` to minimize site boilerplate and keep behavior consistent)
  - Site configs: each site has a `docusaurus.config.ts`
  - Environments: Dev (user GH pages), Preview (org GH pages), Production (iflastandards.info)

## 2) Testing Information

### 2.1 Running tests
- Fast unit tests (Vitest):
  - All unit tests: `pnpm test` or `nx run-many --target=test --all`
  - Affected only (recommended during development): `nx affected --target=test`
  - Per project: `nx test @ifla/theme`, `nx test portal`, etc.
  - Run a single file: `npx vitest run path/to/testfile.test.ts`
- E2E (Playwright): per various configs in repo (`playwright.config.*.ts`). Example suites: `pnpm test:comprehensive:e2e` or `pnpm test:portal:e2e`.
- Pre-commit/pre-push hooks (Husky)
  - Pre-commit runs typecheck, ESLint, and unit tests selectively (<60s target)
  - Pre-push runs branch-aware suites; protected branches trigger full builds/E2E
  - You may replicate locally: `pnpm test:pre-commit`, `pnpm test:pre-push`

### 2.2 Vitest configuration specifics
- Config files: root has `vitest.config.nx.ts` (primary), plus CI variants
- Path aliases include `@ifla/theme/utils` → `packages/theme/src/utils`
- Test discovery patterns (see `vitest.config.nx.ts`): include globs under `{packages,apps,standards}/**/*.{test,spec}.*` and `packages/theme/src/tests/**/*.{test,spec}.*`
- Important: tmp and temp directories are excluded by default (`**/tmp/**`, `**/temp/**`). Place ad-hoc tests within a discovered folder (e.g., `packages/theme/src/tests/`)
- Exclusions: heavy/integration suites are excluded or separated; prefer the unit-focused paths during local TDD

### 2.3 Adding new unit tests
- Place tests in the appropriate project area:
  - Theme unit tests: `packages/theme/src/tests/...`
  - Portal/site component tests: under respective project’s src/tests (following existing patterns)
- Naming: `*.test.ts` or `*.test.tsx`
- Import helpers/utilities using path aliases (preferred) to match production import paths
- Classification guidance:
  - Selective (development): run via `nx affected --target=test` or direct `npx vitest run <file>`
  - Comprehensive (release prep): use `pnpm test:comprehensive:*` scripts
  - Avoid long-running/integration behaviors in unit test locations; use designated integration/E2E suites

### 2.4 Example: Verified minimal unit test (validated 2025-08-10 10:16 local)
We validated a minimal test using real repo utilities and vitest config:

- Temporary test file location
  - packages/theme/src/tests/utils/junie-smoke.test.ts
- Content
  - This test uses `formatFileSize` and `isValidUrl` from `@ifla/theme/utils` and verifies expected outputs
- Command used
  - `npx vitest run -c vitest.config.nx.ts packages/theme/src/tests/utils/junie-smoke.test.ts`
- Result
  - Passed: 2/2 tests
- Cleanup
  - The temporary file was removed after validation. If replicating, remember to delete your temporary files or move them into a persistent, properly categorized test suite if they are to be kept

### 2.5 Debugging tests
- Clear caches if results look stale: `nx reset` then re-run
- Verify path aliases: ensure imports like `@ifla/theme/utils` match tsconfig and vitest configuration
- Avoid port conflicts for server-based tests by using `:robust` scripts or the port-manager utilities

## 3) Additional Development Information

- Nx best practices
  - Prefer `nx affected` workflows during development for speed
  - Make small, isolated changes; the cache will skip unrelated builds/tests
  - `dependsOn` orchestrates builds/tests to ensure shared packages (e.g., theme) build first
- Docusaurus configuration
  - When changing shared site behavior, update `standardSiteFactory.ts` instead of per-site configs where possible to ensure consistency and reduce risk
  - Always verify changes against at least one site build locally (e.g., `nx build portal`) before PRs to avoid CI regressions
- Next.js (Admin)
  - Runs on port 3007; ensure environment variables are aligned with Clerk expectations (see apps/admin and test-config helpers)
  - There are testing helpers for Clerk in `apps/admin/src/test-config/`, but for quick unit checks prefer pure functions to avoid auth setup complexity
- Code style & linting
  - ESLint + Prettier are enforced via git hooks; fix on save or run `pnpm lint --quiet`
  - Type safety enforced in hooks as well; run `pnpm typecheck` explicitly when needed
- Port & environment hygiene
  - If local ports get stuck, run `pnpm ports:kill` or site-specific kill
  - For unusual Docusaurus cache issues, `pnpm clear:all` followed by `nx reset`
- CI awareness
  - Protected branches execute full build/E2E; keep PRs green by validating locally with affected builds/tests

## 4) Quick Recipes

- Build a single site: `nx build frbr`
- Start portal with port cleanup: `nx run portal:start:robust`
- Run unit tests for theme only: `nx test @ifla/theme`
- Run only tests affected by your changes: `nx affected --target=test`
- Run one test file: `npx vitest run -c vitest.config.nx.ts packages/theme/src/tests/utils/some.test.ts`
- Validate full regression before release: `pnpm test:comprehensive`

## 5) Maintenance Notes

- Keep this file focused on project-specific guidance; do not duplicate generic docs
- Prefer linking to code locations (files/paths) and commands that are already used by the repo/tooling
- When adding new guidance to the shared team docs, also update the top-level GUIDELINES source if applicable


## 6) AI Development Guidelines (Doc 35 Integration)

This section integrates key actionable rules from `system-design-docs/35-ai-development-guidelines.md` (Doc 35). For complete context and examples, always open Doc 35 directly.

- Core Principles (Evidence > Assumptions)
  - Verify with real code/data before changes; prefer implementation over secondary docs.
  - Read existing implementations first; align to platform (Admin vs Docs) patterns.
  - Use MCP servers for authoritative library and codebase info (see below).

- MCP Server Usage (Quick Rules)
  - Searching/navigating codebase → JetBrains MCP (search, file structure).
  - External libraries: React/Next/TS → Context7; MUI → MUI MCP; others → Context7.
  - Building MUI UI → MUI MCP required; general React patterns → Context7.
  - Complex problems → Sequential Thinking + JetBrains; simple edits → native tools.

- 5‑Phase Testing Strategy (Mapping & Commands)
  - Phase 1 (Selective/dev, <30s/file): `nx test {project}` or `npx vitest run <file>`; use @unit/@critical grep.
  - Phase 2 (Pre‑commit, <60s): runs TS, ESLint, unit (affected) via Husky.
  - Phase 3 (Pre‑push, <180s): integration, builds, E2E when affected.
  - Phase 4 (Comprehensive, <300s): `pnpm test:comprehensive`.
  - Phase 5 (CI env): environment validation only.

- Test Classification, Placement, Naming
  - Decision: env‑dependent → `**/tests/deployment/` (CI only). Else integration? → `*.integration.test.ts`. Else E2E? → `*.e2e.test.ts`. Else unit → `*.test.ts`.
  - Docusaurus tests live under `packages/theme/src/tests/**`; Admin under `apps/admin/src/tests/**`, E2E under `apps/admin/e2e/**`.
  - Tagging examples:
    - `describe('Feature @integration @api @validation', ...)`
    - `describe('Pure Function @unit', ...)`
    - `test('User Workflow @e2e @critical @authentication', ...)`

- Authorization (RBAC) Testing Guidelines (Admin)
  - Custom RBAC via Clerk publicMetadata (not Organizations); 5‑min cache TTL; withAuth middleware required on protected routes.
  - Unit auth tests: fully mock Clerk; focus on logic functions only.
  - Integration auth tests: use real Clerk test users via `apps/admin/src/test-config/` helpers; no mocking; verify DB side‑effects.
  - Debug aids: `AUTH_DEBUG=true AUTH_DEBUG_VERBOSE=true`; debug endpoint `/api/admin/auth/debug?action=logs`.

- Critical Rules for AI Assistants
  - Never use `any` without an eslint‑disable comment explaining why.
  - Always run `pnpm typecheck && pnpm lint` before committing.
  - Fix code to pass tests; do not alter tests to make failures pass.
  - Ensure local Phases 1–4 pass before pushing.
  - Do not commit secrets; hooks will block.
  - Use `workspaceUtils` in integration tests; avoid `process.cwd()`.
  - Docusaurus configs must include `experimental_faster: true`.
  - Imports via path aliases; remove unused imports; prefer explicit types.

- Performance Targets & Optimization
  - Phase targets: P1 <30s/file, P2 <60s, P3 <180s, P4 <300s, P5 <180s.
  - Share expensive resources with `beforeAll/afterAll`; reuse fixtures; parallelize where safe.

- Troubleshooting Highlights
  - Integration tests not found → check `*.integration.test.ts` pattern and vitest globs; `nx reset`.
  - Slow tests → smaller fixtures, shared setup, verbose reporter.
  - Auth issues → verify Clerk publicMetadata; clear caches; consider `vi.useFakeTimers()` for cache TTL tests.

- Quick Reference Commands
  - Admin: `nx dev admin`, `nx build admin`, `nx test admin`.
  - Docs sites: `nx start {site}`, `nx build {site}`.
  - Affected tests: `pnpm test` (affected), or `nx affected -t test --parallel=3`.
  - Type/lint: `pnpm typecheck`, `pnpm lint`.

Refer to Doc 35 for detailed examples (integration I/O tests, anti‑patterns) and deeper guidance.

## 7) Platform Coding Standards (Doc 36 Integration)

This section summarizes key, actionable standards from `system-design-docs/36-platform-coding-standards.md` (Doc 36). Refer to Doc 36 for complete guidance.

- Core Platform Rules
  - Admin (Next.js): Use Next.js Link for internal navigation, standard `fetch('/api/...')` for internal API calls, standard asset paths, and configured middleware matchers. MUI only; NO Tailwind. Types use `NextRequest`/`NextResponse` for API routes. 
  - Docs (Docusaurus): Use Infima classes and SASS/SCSS; DO NOT use MUI. Components live in `packages/theme/src/components/` and are shared globally. If a site-specific override is required, document the rationale and scope it to that site.
  - Docusaurus components are always global unless otherwise required. When exceptions are necessary, prefer minimal, clearly named site overrides.

- Imports & Types (TypeScript)
  - Use ES module imports and workspace path aliases (e.g., `@ifla/theme/...`).
  - Use `import type { ... }` for type-only imports; avoid CommonJS `require`.
  - Prefer explicit types; if `any` is unavoidable, add an eslint-disable with justification.

- Naming & Organization
  - Follow platform file structures (Admin under `apps/admin/src/...`; Docs under `standards/*` with shared components in `packages/theme/src/components/`).
  - Tests mirror source structure and use appropriate suffixes: `.test.ts[x]`, `.integration.test.ts`.

- Error Handling
  - Return consistent JSON error shapes in API routes; use try/catch with typed errors.
  - Use Error Boundaries for component-level failures in React where applicable.

- Security & Auth (Admin)
  - Validate inputs with zod; use `withAuth` middleware on protected routes.

- Performance
  - Use dynamic imports for heavy Admin components; client caching with TanStack Query where applicable.

These standards complement Doc 35 (AI Development Guidelines) and Doc 20 (Platform-Specific Architecture). Always verify changes against at least one site build (e.g., `nx build portal`) or the Admin app (`nx build admin`) before PRs.
