# TypeScript Type Checking Reliability Guide

## Overview

This guide documents the solutions implemented to address flaky typecheck results in the Nx monorepo. The core issue was that Nx caching mechanisms were interfering with TypeScript's incremental compilation, leading to inconsistent type checking results.

## Key Principles

1. **Always use `--skip-nx-cache` for typechecks** where complete fidelity is essential
2. **Clean build artifacts** before critical typechecks to ensure fresh state
3. **Configure Nx properly** to understand typecheck outputs
4. **Monitor cache drift** and clean periodically

## Implementation Details

### 1. Nx Configuration Updates (`nx.json`)

The typecheck target has been configured to:
- **Disable caching**: `"cache": false` prevents stale cache issues
- **Define proper inputs**: Includes all TypeScript config files
- **Define outputs**: Uses marker files in `tmp/` directory

```json
"typecheck": {
  "dependsOn": ["^build"],
  "cache": false,
  "inputs": [
    "default",
    "{projectRoot}/tsconfig.json",
    "{projectRoot}/tsconfig.*.json",
    "{workspaceRoot}/tsconfig.json",
    "{workspaceRoot}/tsconfig.base.json"
  ],
  "outputs": [
    "{workspaceRoot}/tmp/typecheck-{projectName}.done"
  ]
}
```

### 2. Package.json Commands

All typecheck commands now use `--skip-nx-cache`:

```json
"typecheck": "pnpm nx affected --target=typecheck --parallel=3 --skip-nx-cache",
"typecheck:all": "pnpm nx run-many --target=typecheck --all --parallel=6 --skip-nx-cache",
"typecheck:clean": "node scripts/typecheck-clean.js",
"typecheck:clean:all": "node scripts/typecheck-clean.js --all",
"typecheck:diagnose": "node scripts/typecheck-diagnose.js",
"typecheck:ci": "node scripts/typecheck-clean.js --ci --all",
"typecheck:clean-markers": "node scripts/clean-typecheck-markers.js"
```

### 3. New Scripts

#### `scripts/typecheck-clean.js`
Comprehensive clean typecheck script that:
- Resets Nx cache (`nx reset`)
- Removes TypeScript build info files (`.tsbuildinfo`)
- Cleans node_modules cache
- Removes dist folders
- Runs typecheck with `--skip-nx-cache`
- Supports `--all` and `--ci` flags

#### `scripts/typecheck-diagnose.js`
Diagnostic tool that:
- Checks environment configuration
- Detects cache inconsistencies
- Validates TypeScript configurations
- Generates detailed report with recommendations
- Outputs to `typecheck-diagnostic-report.json`

#### `scripts/fix-typecheck-config.js`
Automated fix script that:
- Updates nx.json typecheck configuration
- Disables caching for typecheck target
- Adds proper inputs and outputs
- Creates backup before modifications

#### `scripts/mark-typecheck-complete.js`
Marker script that:
- Creates output files for Nx tracking
- Enables proper dependency tracking
- Stores completion timestamps

#### `scripts/clean-typecheck-markers.js`
Cleanup script that:
- Removes accumulated marker files
- Keeps tmp directory clean
- Can be run periodically

### 4. Git Hooks Updates

All git hook scripts now use `--skip-nx-cache`:
- `scripts/pre-commit-check-optimized.js`
- `scripts/pre-commit-check.js`
- `scripts/pre-push-check.js`

## Usage Guidelines

### Local Development

For day-to-day development, use standard commands:
```bash
pnpm typecheck          # Check affected projects
pnpm typecheck:all      # Check all projects
```

### When Issues Occur

If you encounter flaky typecheck results:

1. **Quick fix**: Clear Nx cache
   ```bash
   pnpm nx reset
   pnpm typecheck
   ```

2. **Thorough fix**: Run clean typecheck
   ```bash
   pnpm typecheck:clean      # Clean and check affected
   pnpm typecheck:clean:all  # Clean and check all
   ```

3. **Diagnose issues**: Run diagnostic
   ```bash
   pnpm typecheck:diagnose
   ```

### CI/CD Pipeline

For CI environments, always use the clean CI command:
```bash
pnpm typecheck:ci
```

This ensures:
- Fresh environment
- No cache interference
- Consistent results across runs
- Proper error reporting

### Maintenance

Periodically clean marker files:
```bash
pnpm typecheck:clean-markers
```

## Troubleshooting

### Common Issues and Solutions

1. **"Cannot find module" errors**
   - Cause: Stale cache or missing dependencies
   - Solution: Run `pnpm typecheck:clean`

2. **Type errors that appear/disappear randomly**
   - Cause: Nx cache interference
   - Solution: Disable cache in nx.json (already done)

3. **Slow typecheck performance**
   - Cause: No incremental compilation
   - Solution: This is expected when using `--skip-nx-cache`

4. **Missing type definitions**
   - Cause: Build order issues
   - Solution: Ensure `dependsOn: ["^build"]` in nx.json

### Debug Process

1. Run diagnostic tool: `pnpm typecheck:diagnose`
2. Review `typecheck-diagnostic-report.json`
3. Check for issues listed in the report
4. Run appropriate clean command
5. If issues persist, check TypeScript version consistency

## Best Practices

1. **Always use pnpm commands** - Never run bare `nx` commands
2. **Use --skip-nx-cache for critical checks** - Ensures reliability
3. **Clean periodically** - Prevent cache accumulation
4. **Monitor CI results** - Catch environment-specific issues
5. **Keep TypeScript versions consistent** - Check with diagnostic tool

## Technical Background

The core issue stems from the interaction between:
- Nx's aggressive caching mechanisms
- TypeScript's incremental compilation
- Monorepo interdependencies
- Build artifact management

By disabling Nx cache for typechecks and implementing proper cleanup procedures, we ensure consistent and reliable type checking across all environments.