# Environment-Aware Parallelism Configuration

## Overview

The project now uses environment-aware parallelism settings that automatically detect whether code is running locally or in CI, adjusting parallelism accordingly.

## Key Features

### Automatic Environment Detection
- **Local Development**: Detects when `CI` environment variable is not set
- **CI Environment**: Detects when `CI=true` or `GITHUB_ACTIONS=true`

### Optimized Settings

#### Local Development (16-core machine)
- **Parallel builds**: 8
- **Test workers**: 10
- **Lint operations**: 10
- **Typecheck**: 8
- **E2E tests**: 4
- **Nx daemon**: Enabled

#### CI Environment (GitHub Actions)
- **Parallel builds**: 3
- **Test workers**: 4
- **Lint operations**: 4
- **Typecheck**: 3
- **E2E tests**: 2
- **Nx daemon**: Disabled

## Implementation

### Scripts with Environment Detection
1. **`scripts/collect-warnings-parallel.js`**
   - Automatically adjusts parallel builds based on environment
   - Shows mode in output: "Local mode: 8 parallel builds" or "CI mode: 3 parallel builds"

2. **`scripts/optimize-parallelism.js`**
   - Updates all package.json scripts with environment-appropriate settings
   - Creates `.env.local` for local development or `.env.ci` for CI

### Configuration Files
- **`.env.local`**: Contains optimized settings for local development
- **`.env.ci`**: Contains conservative settings for CI (created when script runs in CI)
- **`nx.json`**: Updated with appropriate parallel settings

## Usage

### Local Development
1. Settings are automatically applied from `.env.local`
2. Run `source .env.local` to ensure environment variables are loaded
3. Restart Nx daemon: `pnpm nx:daemon:stop && pnpm nx:daemon:start`

### CI Environment
- No action needed - GitHub Actions automatically sets `GITHUB_ACTIONS=true`
- Scripts detect CI environment and use conservative settings
- No risk of overwhelming CI runners

## Testing

### Test Local Mode
```bash
node scripts/collect-warnings-parallel.js
# Output: "Local mode: 8 parallel builds"
```

### Test CI Mode
```bash
CI=true node scripts/collect-warnings-parallel.js
# Output: "CI mode: 3 parallel builds"
```

## Benefits
1. **Maximum performance locally**: Leverages all 16 cores for faster builds
2. **CI stability**: Conservative settings prevent resource exhaustion
3. **Zero configuration**: Automatic detection means no manual switching
4. **Backwards compatible**: Existing CI workflows continue to work unchanged