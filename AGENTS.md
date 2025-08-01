# AGENTS.md

Essential guidance for coding agents working in this IFLA Standards monorepo.

## Commands
- **Package manager**: Always use `pnpm` (never npm/yarn)
- **Build**: `nx build {site}` (e.g., `nx build portal`, `nx build admin`)
- **Dev server**: `nx start {site}` or `nx dev admin` (Next.js)
- **Single test**: `nx test {project}` or `nx test --testNamePattern="test name"`
- **Test all**: `pnpm test` (nx affected parallel), `pnpm test:all` (all projects)
- **Server-dependent tests**: `cd apps/admin && pnpm test:server-dependent` (requires live servers)
- **Type check**: `pnpm typecheck` (nx affected parallel)
- **Lint**: `pnpm lint` (nx affected parallel), `pnpm lint:fix` for auto-fix
- **E2E**: `nx run standards-dev:e2e` or `nx run {site}:e2e`

## Code Style
- **Imports**: Use path aliases (`@ifla/theme`, `@site/*`), remove unused imports (enforced)
- **Formatting**: Single quotes, Prettier config in `.prettierrc`
- **Types**: Prefer explicit types over `any` (warn level), use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` when needed
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **React**: No React import needed (JSX transform), hooks rules enforced
- **Error handling**: Use proper TypeScript error types, avoid generic catches
- **Comments**: DO NOT ADD comments unless explicitly requested

## Critical Rules
- **NEVER** use `any` without eslint-disable comment
- **ALWAYS** run `pnpm typecheck && pnpm lint` after edits
- **ALWAYS** fix code to pass tests, never fix tests to pass
- Use `workspaceUtils` in integration tests, not `process.cwd()`
- Include `experimental_faster: true` in all `docusaurus.config.ts` files

## Server-Dependent Testing
- **Location**: `apps/admin/src/test/integration/server-dependent/`
- **Purpose**: Tests requiring live servers (admin + Docusaurus sites)
- **Command**: `cd apps/admin && pnpm test:server-dependent`
- **Debug mode**: `TEST_SERVER_DEBUG=1 pnpm test:server-dependent`
- **Features**: Automatic server lifecycle, health checks, port cleanup
- **Documentation**: See `apps/admin/docs/server-dependent-testing.md`
- **Status**: ✅ 14/14 tests passing (CORS, cross-site auth, server management)