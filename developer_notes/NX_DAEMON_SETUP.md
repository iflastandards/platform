# Nx Daemon Setup Guide

## Overview

The Nx daemon significantly improves performance for all Nx operations by maintaining a background process that caches project graph computations and file watching. This guide ensures the daemon is always running for testing and development.

## Configuration

### nx.json Settings
The project is already configured with:
- `useDaemonProcess: true` - Enables daemon usage globally
- Daemon support in task runner options
- Proper cache configuration

### .nxdaemonrc Configuration
Controls automatic daemon behavior:
```json
{
  "autoStart": true,
  "ensureRunning": true,
  "restartOnFailure": true,
  "healthCheckInterval": 300000,
  "startupTimeout": 10000,
  "scripts": {
    "test": true,
    "build": true,
    "lint": true,
    "typecheck": true
  }
}
```

## Commands

### Basic Daemon Management
```bash
# Check daemon status
pnpm nx:daemon

# Start daemon manually
pnpm nx:daemon:start

# Stop daemon
pnpm nx:daemon:stop

# Ensure daemon is running (starts if not)
pnpm nx:daemon:ensure

# Health check with diagnostics
pnpm nx:daemon:health
```

### Testing with Daemon
```bash
# Run tests with automatic daemon start
pnpm test

# Run tests using nx-optimized config
pnpm test:nx

# Run tests without daemon check (fallback)
pnpm test:no-daemon
```

## Automatic Daemon Management

### Pre-commit and Pre-push Hooks
Both hooks automatically ensure the daemon is running:
- `scripts/pre-commit-check.js` - Starts daemon before typecheck/lint/test
- `scripts/pre-push-check.js` - Starts daemon before integration tests and builds

### Test Scripts
All test-related scripts check and start the daemon:
- `scripts/test-with-daemon.js` - Main test runner
- `scripts/nx-test.js` - Nx-specific test runner
- `scripts/ensure-nx-daemon.js` - Core daemon management utility

### VS Code Integration
The `.vscode/tasks.json` includes:
- Auto-start on folder open
- Daemon health check task
- Test task with daemon dependency

## Performance Benefits

With daemon running:
- **Project graph computation**: ~90% faster
- **Affected detection**: ~80% faster
- **File watching**: Instant change detection
- **Cache lookups**: Near-instantaneous

Without daemon:
- Cold start penalty: 2-5 seconds per operation
- Repeated graph computation
- No persistent file watching

## Troubleshooting

### Daemon Not Starting
```bash
# Clear any stale daemon files
rm -rf .nx/daemon*

# Clear cache and restart
pnpm nx:cache:clear
pnpm nx:daemon:start
```

### Performance Issues
```bash
# Check daemon health
pnpm nx:daemon:health

# Monitor performance
pnpm nx:performance

# Optimize configuration
pnpm nx:optimize
```

### Common Issues

1. **Port conflicts**: Daemon uses local socket, check `.nx/daemon.socket`
2. **Memory usage**: Daemon uses ~200-500MB RAM, scales with project size
3. **Stale cache**: Run `pnpm nx:cache:clear` if seeing outdated results

## Best Practices

1. **Always keep daemon running**: Use `pnpm setup` after clone
2. **Health checks**: Run `pnpm nx:daemon:health` if performance degrades
3. **Restart after major changes**: When updating nx.json or workspace structure
4. **Monitor resources**: Daemon should use <500MB RAM for this project

## Environment Variables

Control daemon behavior:
```bash
# Disable daemon temporarily
NX_DAEMON=false pnpm test

# Enable verbose logging
NX_VERBOSE_LOGGING=true pnpm nx:daemon:start

# Custom daemon port (if conflicts)
NX_DAEMON_PORT=4211 pnpm nx:daemon:start
```

## Integration with CI

For CI environments:
- Daemon starts automatically via nx.json config
- Nx Cloud provides distributed caching
- No manual daemon management needed

## Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `pnpm test` | Run tests with daemon | Default testing |
| `pnpm nx:daemon:health` | Check daemon status | Performance issues |
| `pnpm nx:daemon:ensure` | Start if not running | Before batch operations |
| `pnpm nx:cache:clear` | Reset cache | Stale results |
| `pnpm setup` | Full setup with daemon | After git clone |