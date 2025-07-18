# Vitest Configuration Guide

## Overview

This project uses Vitest for testing with Nx for orchestration. The configuration is optimized to work with `nx affected` commands and properly excludes build artifacts.

## Configuration Files

### Main Configuration: `vite.config.ts`
- Base Vite configuration used for development
- Includes test configuration but can be slow with many files

### Nx-Optimized Configuration: `vitest.config.nx.ts`
- Optimized for use with `nx affected` commands
- Properly excludes all build artifacts (.next, .nx, .docusaurus)
- Uses single thread for predictable behavior with Nx
- Enables `passWithNoTests` for projects without tests

### CI Configuration: `vitest.config.ci.ts`
- Focused on deployment-critical tests only
- Excludes development tool tests
- Optimized for faster CI execution

## Key Features

### Proper Exclusions
The configuration excludes:
- `**/.next/**` - Next.js build artifacts
- `**/.nx/**` - Nx cache directories
- `**/.docusaurus/**` - Docusaurus build artifacts
- `**/node_modules/**` - Dependencies
- `**/dist/**` and `**/build/**` - Build outputs
- `**/coverage/**` - Coverage reports

### Nx Integration
- Tests run independently from typecheck and lint
- Optimized for `nx affected` commands
- Supports parallel execution across projects
- Proper caching configuration

## Usage

### Running Tests
```bash
# Standard nx affected test
pnpm test

# Using nx-optimized vitest config directly
pnpm test:vitest

# Run tests for a specific project
nx test @ifla/theme
```

### Running Typecheck and Lint Separately
```bash
# Typecheck only
pnpm typecheck

# Lint only
pnpm lint

# Both in parallel
pnpm typecheck && pnpm lint
```

### Pre-commit Workflow
The pre-commit hook runs typecheck, lint, and tests separately:
1. TypeScript type checking (`nx affected --target=typecheck`)
2. ESLint (`nx affected --target=lint`)
3. Unit tests (`nx affected --target=test`)

This separation ensures that:
- Tests don't interfere with typecheck/lint
- Each tool runs with its own configuration
- Failures are easier to diagnose

## Performance Optimization

### For Development
- Use `nx affected` commands to only test changed files
- Run typecheck/lint separately from tests
- Use `--parallel=3` for better performance

### For CI
- Use `vitest.config.ci.ts` for critical tests only
- Enable Nx Cloud for distributed caching
- Run with process forking for better isolation

## Troubleshooting

### Tests Including Build Artifacts
If tests are scanning .next or other build directories:
1. Check the exclude patterns in `vitest.config.nx.ts`
2. Clear Nx cache: `pnpm nx:cache:clear`
3. Remove build artifacts: `pnpm clear:all`

### Slow Test Execution
1. Ensure Nx daemon is running: `pnpm nx:daemon:start`
2. Use affected commands instead of running all tests
3. Check that vitest is using the nx-optimized config

### Type Errors During Tests
- Run `pnpm typecheck` separately to diagnose
- Tests use relaxed TypeScript config (`tsconfig.test.json`)
- Production code uses strict TypeScript config

## Best Practices

1. **Always use nx affected**: Don't run all tests unless necessary
2. **Keep tests fast**: Unit tests should complete in <30s
3. **Separate concerns**: Run typecheck/lint/test as separate steps
4. **Use proper exclusions**: Ensure build artifacts are excluded
5. **Monitor performance**: Use `pnpm nx:performance` to check