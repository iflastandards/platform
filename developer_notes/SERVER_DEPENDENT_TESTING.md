# Server-Dependent Testing Guide

## Overview

This guide explains how server-dependent tests are organized and executed in the IFLA Standards Platform monorepo. Server-dependent tests are integration tests that require actual servers (admin, portal, or documentation sites) to be running.

## Architecture

### Test Organization

```
apps/admin/
├── src/
│   └── test/
│       ├── components/          # Unit tests (no servers needed)
│       ├── integration/         # Regular integration tests (no servers)
│       │   └── server-dependent/  # Tests that require servers
│       │       ├── api/         # API endpoint tests
│       │       ├── auth/        # Authentication flow tests
│       │       └── full-stack/  # Full application tests
│       └── e2e/                # End-to-end tests (separate config)
```

### Key Files

1. **Server Manager**: `apps/admin/src/lib/test-helpers/server-manager.ts`
   - Provides `TestServerManager` class
   - Manages starting/stopping test servers
   - Configures admin, portal, and newtest servers

2. **Vitest Configs**:
   - `apps/admin/vitest.config.ts` - Main config (excludes server-dependent)
   - `apps/admin/vitest.config.server-dependent.ts` - Server-dependent config

3. **Project Configuration**: `apps/admin/project.json`
   - `test:integration` - Runs regular integration tests (excludes server-dependent)
   - `test:server-dependent` - Runs only server-dependent tests

## Types of Tests

### 1. Regular Integration Tests
- **Location**: `src/test/integration/` (excluding server-dependent folder)
- **Characteristics**: 
  - Test file I/O, database operations, external services
  - Do NOT require servers to be running
  - Use real implementations (not mocks) where possible
- **Example**: `packages/unified-spreadsheet/tests/integration/`

### 2. Server-Dependent Tests
- **Location**: `src/test/integration/server-dependent/`
- **Characteristics**:
  - Require actual servers to be running
  - Test API endpoints, auth flows, full-stack features
  - Start servers explicitly in `beforeAll` hooks
- **Example**:
  ```typescript
  import { testServerManager } from '@/lib/test-helpers/server-manager';

  describe('API Integration', () => {
    beforeAll(async () => {
      await testServerManager.startServers(['admin']);
    });

    afterAll(async () => {
      await testServerManager.stopServers();
    });

    test('health check endpoint', async () => {
      const response = await fetch('http://localhost:3007/admin/api/health');
      expect(response.ok).toBe(true);
    });
  });
  ```

### 3. Unit Tests
- **Location**: `src/test/components/` or next to source files
- **Characteristics**: Test individual components/functions in isolation
- **No servers required**

### 4. E2E Tests
- **Location**: `e2e/` directory at root
- **Tool**: Playwright
- **Separate configuration and execution**

## Running Tests

### Command Reference

```bash
# Run all tests (unit + integration, excluding server-dependent)
pnpm nx test admin

# Run only integration tests (excluding server-dependent)
pnpm nx test:integration admin

# Run only server-dependent tests
pnpm nx test:server-dependent admin

# Run specific package tests
pnpm nx test unified-spreadsheet
```

### Why This Separation?

1. **Performance**: Regular tests run fast without server overhead
2. **Reliability**: Server startup/shutdown can be flaky in CI
3. **Developer Experience**: Most tests don't need servers
4. **Resource Usage**: Prevents unnecessary server processes

## Writing Server-Dependent Tests

### When to Use

Create server-dependent tests when you need to:
- Test actual API endpoints
- Verify authentication/authorization flows
- Test full request/response cycles
- Validate server-side rendering
- Test WebSocket connections

### Best Practices

1. **Always clean up**: Use `afterAll` to stop servers
2. **Be specific**: Only start the servers you need
3. **Use health checks**: Verify server is ready before tests
4. **Handle timeouts**: Server startup can be slow
5. **Isolate tests**: Don't depend on other test's server state

### Example Template

```typescript
import { testServerManager } from '@/lib/test-helpers/server-manager';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

describe('My Server-Dependent Feature', () => {
  beforeAll(async () => {
    // Start only required servers
    await testServerManager.startServers(['admin']);
    
    // Wait for server to be ready
    await testServerManager.waitForHealth('admin');
  }, 30000); // Increase timeout for server startup

  afterAll(async () => {
    await testServerManager.stopServers();
  });

  test('should handle API request', async () => {
    const response = await fetch('http://localhost:3007/admin/api/my-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: 'test' })
    });

    expect(response.ok).toBe(true);
    const result = await response.json();
    expect(result).toHaveProperty('success', true);
  });
});
```

## Troubleshooting

### Common Issues

1. **"Port already in use"**
   - Solution: Run `pnpm ports:kill` before tests
   - Check for zombie processes

2. **"Server health check timeout"**
   - Increase timeout in `beforeAll`
   - Check server logs for startup errors
   - Ensure dependencies are installed

3. **"Cannot find server-manager"**
   - Ensure you're importing from correct path
   - Check tsconfig paths are configured

4. **Tests hang on "Starting servers..."**
   - This was the original issue - fixed by proper test separation
   - Ensure you're not running server-dependent tests accidentally

### Debug Mode

Enable debug output:
```bash
DEBUG=test:server pnpm nx test:server-dependent admin
```

## Integration with CI/CD

In CI environments:
1. Regular tests run in parallel across multiple agents
2. Server-dependent tests run in dedicated job
3. E2E tests run after deployment

Example GitHub Actions config:
```yaml
- name: Run Integration Tests
  run: pnpm nx affected -t test:integration

- name: Run Server-Dependent Tests
  run: pnpm nx affected -t test:server-dependent
  if: ${{ needs.changes.outputs.admin == 'true' }}
```

## Migration Guide

If you have existing tests that require servers:

1. Move test files to `src/test/integration/server-dependent/`
2. Add server startup in `beforeAll`
3. Add server cleanup in `afterAll`
4. Update imports if needed
5. Run `pnpm nx test:server-dependent admin` to verify

## Related Documentation

- [Testing Strategy](./TESTING_STRATEGY.md) - Overall testing approach
- [AI Testing Instructions](./AI_TESTING_INSTRUCTIONS.md) - Guidelines for AI agents
- [Test Placement Guide](./TEST_PLACEMENT_GUIDE.md) - Where to put different test types