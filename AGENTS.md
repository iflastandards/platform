# AGENTS.md

Essential guidance for coding agents working in this IFLA Standards monorepo.

## Commands
- **Package manager**: Always use `pnpm` (never npm/yarn)
- **Build**: `nx build {site}` (e.g., `nx build portal`, `nx build admin-portal`)
- **Dev server**: `nx start {site}` or `nx dev admin-portal` (Next.js)
- **Single test**: `nx test {project}` or `nx test --testNamePattern="test name"`
- **Test all**: `pnpm test` (nx affected parallel), `pnpm test:all` (all projects)
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

## Critical Rules
- **NEVER** use `any` without eslint-disable comment
- **ALWAYS** run `pnpm typecheck && pnpm lint` after edits
- **ALWAYS** fix code to pass tests, never fix tests to pass
- Use `workspaceUtils` in integration tests, not `process.cwd()`
- Include `experimental_faster: true` in all `docusaurus.config.ts` files