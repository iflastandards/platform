# System Configuration

## Development Machine Specifications

### CPU Configuration
- **Total Cores**: 16
  - **Performance Cores**: 12
  - **Efficiency Cores**: 4
- **Architecture**: Apple Silicon (ARM64)

### Optimal Parallelism Settings

Based on the 16-core configuration, the following parallelism settings are recommended:

#### Build Operations
- **Maximum Parallel Builds**: 8-10 (leave headroom for system processes)
- **Nx Parallel**: 8 (optimal for mixed performance/efficiency cores)
- **Docusaurus Builds**: 6-8 (memory intensive)

#### Test Operations
- **Vitest Workers**: 8-10
- **Playwright Workers**: 4-6 (browser instances are resource heavy)
- **Jest Workers**: 10-12

#### Development Servers
- **Concurrent Dev Servers**: 8-10 (port 3000-3010)

### Environment-Specific Settings

```bash
# Add to .env.nx or .env.local for optimal performance
NX_PARALLEL=8
NX_TASKS_RUNNER_DEFAULT_OPTIONS_MAX_PARALLEL=8
NX_CLOUD_DISTRIBUTED_EXECUTION_AGENT_COUNT=8
```

### Script Optimizations

All build and test scripts should use these parallelism settings:

```javascript
// For Node.js scripts
const MAX_PARALLEL = 8; // Optimal for 16-core machine

// For Nx commands
pnpm nx run-many --parallel=8

// For concurrent operations
concurrently -m 8
```

### Performance Notes

1. **Performance cores** handle CPU-intensive tasks (builds, compilation)
2. **Efficiency cores** handle background tasks (file watching, linting)
3. Leave 20-30% headroom for system processes and IDE operations
4. Memory usage scales with parallelism - monitor RAM when increasing workers

### Environment-Aware Configuration

The project now uses environment-aware parallelism settings:

#### Local Development
- Uses optimized settings from `.env.local`
- Parallel builds: 8
- Test workers: 10
- Automatic detection when `CI` environment variable is not set

#### CI Environment (GitHub Actions)
- Conservative settings for stability
- Parallel builds: 3
- Test workers: 4
- Automatic detection when `CI=true` or `GITHUB_ACTIONS=true`

#### Scripts with Environment Detection
- `scripts/collect-warnings-parallel.js` - Adjusts parallel builds
- `scripts/optimize-parallelism.js` - Configures all settings based on environment

### Updates History

- 2025-08-04: Initial configuration documented for 16-core Apple Silicon machine
- 2025-08-04: Added environment-aware parallelism for CI compatibility