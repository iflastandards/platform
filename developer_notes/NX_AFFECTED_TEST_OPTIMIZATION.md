# Nx Affected Test Optimization Summary

## Overview

Our testing strategy is fully optimized for nx affected commands, eliminating redundant testing between phases and maximizing developer efficiency.

## Key Optimizations

### 1. Nx Affected at Every Level
- **All commands use `nx affected`** - only test what changed
- **Smart caching** - Nx caches results to avoid re-running unchanged tests
- **Parallel execution** - Use `--parallel=3` for optimal performance

### 2. No Redundant Testing Between Phases
Each phase assumes the previous phase passed:

#### Pre-Commit (Phase 2)
```bash
nx affected --target=typecheck --parallel=3
nx affected --target=lint --parallel=3       # warnings allowed
nx affected --target=test --parallel=3       # unit tests only
```
- **Time**: < 60 seconds
- **Focus**: Fast feedback, catch basic errors

#### Pre-Push (Phase 3)
```bash
nx affected --target=test:integration --parallel=3
nx affected --target=build --parallel=3
nx affected --target=e2e                    # if portal/admin affected
```
- **Time**: < 180 seconds
- **Assumes**: typecheck ✓, lint ✓, unit tests ✓
- **Focus**: Integration and deployment readiness

#### CI Environment Tests (Phase 5)
```bash
pnpm test:ci:env    # ONLY environment-specific tests
```
- **Time**: < 180 seconds
- **Assumes**: All local tests passed
- **Focus**: Environment variables, API tokens, external services

### 3. Vitest Configuration Optimizations

**vitest.config.nx.ts** is optimized for nx:
- `passWithNoTests: true` - Projects without tests don't fail
- Comprehensive exclusions for build artifacts (.next, .nx, .docusaurus)
- Single thread execution for predictable nx behavior
- No force rerun triggers

### 4. Nx Daemon Always Running

All test scripts ensure nx daemon is running:
- `scripts/ensure-nx-daemon.js` - Starts daemon if not running
- 80-90% performance improvement
- Automatic in all test commands

### 5. Smart E2E Triggers

E2E tests only run when needed:
- Auto-triggers when portal or admin are affected
- Can be manually enabled in `.prepushrc.json`
- Skipped otherwise to save time

## Developer Commands

### On-Demand Testing
```bash
# Run affected unit tests
pnpm test

# Test specific project
nx test @ifla/theme

# Watch mode for TDD
nx test @ifla/theme --watch

# Run with specific config
pnpm test:nx
```

### Manual Phase Triggers
```bash
# Simulate pre-commit
pnpm test:pre-commit

# Simulate pre-push
pnpm test:pre-push

# Run everything
pnpm test:comprehensive
```

### Configuration Files
- `.precommitrc.json` - Configure pre-commit behavior
- `.prepushrc.json` - Configure pre-push behavior
- `vitest.config.nx.ts` - Nx-optimized vitest configuration

## Performance Tips

1. **Keep nx daemon running**: `pnpm nx:daemon:start`
2. **Use affected commands**: Don't run `--all` unless necessary
3. **Trust the phases**: Don't re-run tests that passed in earlier phases
4. **Monitor cache**: `pnpm nx:cache:stats`

## Troubleshooting

### Tests running slowly?
```bash
pnpm nx:daemon:health    # Check daemon
pnpm nx:cache:clear      # Clear stale cache
```

### Tests not using nx affected?
- Ensure using `pnpm test` not `vitest` directly
- Check that nx daemon is running
- Verify git has tracked changes

### Build artifacts being tested?
- vitest.config.nx.ts excludes all build directories
- Check for new build output locations

## Summary

- **Zero redundancy**: Each phase builds on the previous
- **Maximum speed**: Nx affected + caching + parallel execution
- **Developer friendly**: Fast feedback, smart defaults
- **CI efficient**: Only test environment-specific issues in CI