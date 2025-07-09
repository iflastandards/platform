# Server-Dependent Integration Tests

This directory contains integration tests that require running servers to execute properly. These tests are separated from regular unit and integration tests to avoid blocking the main test suite when servers aren't available.

## 📚 **Complete Documentation**

For comprehensive documentation, see: **[Server-Dependent Testing System](../../docs/server-dependent-testing.md)**

## Quick Start

```bash
# Run all server-dependent tests (will start/stop servers automatically)
cd apps/admin
pnpm test:server-dependent

# Run with debug output
TEST_SERVER_DEBUG=1 pnpm test:server-dependent
```

## Overview

Server-dependent tests automatically:
- ✅ **Start required servers** before running tests
- ✅ **Wait for servers to be ready** with health checks  
- ✅ **Run tests against live servers** for realistic integration testing
- ✅ **Clean up servers** after tests complete
- ✅ **Handle timeouts and errors** gracefully

## Current Test Results: ✅ 14/14 Passing

### ✅ Working Test Categories:
1. **Basic Server Management** - Server startup/shutdown lifecycle
2. **Admin Server Startup** - Detailed server startup with health checks
3. **Cross-Site Authentication** - Admin ↔ Docusaurus site auth flows
4. **CORS Integration** - Cross-origin request handling
5. **Process Management** - Command execution and process spawning

## Test Categories

### CORS Integration Tests
**File**: `cors-integration.test.ts`
**Servers**: Admin (port 3007)
**Tests**:
- CORS headers for allowed origins
- Preflight OPTIONS request handling
- Rejection of unauthorized origins
- Multi-origin support validation

### Cross-Site Authentication Tests
**File**: `cross-site-auth.test.ts`
**Servers**: Admin (port 3007) + NewTest (port 3008)
**Tests**:
- Cross-origin authentication requests
- Session state synchronization
- Authentication dropdown integration
- CORS for cross-site auth flows

## Server Configuration

### Supported Servers
- **Admin**: Next.js app on port 3007 (`pnpm nx dev admin`)
- **Portal**: Docusaurus site on port 3000 (`pnpm nx start portal`)
- **NewTest**: Docusaurus site on port 3008 (`pnpm nx start newtest`)

### Server Lifecycle
1. **Startup**: Servers are spawned with `pnpm nx dev/start {server}`
2. **Health Check**: Tests wait for HTTP responses on health check URLs
3. **Test Execution**: Tests run against live servers
4. **Cleanup**: All servers are terminated after tests complete

### Timeouts
- **Server Startup**: 45 seconds (Next.js), 30 seconds (Docusaurus)
- **Test Execution**: 2 minutes per test
- **Server Shutdown**: 10 seconds graceful, then force kill

## Writing Server-Dependent Tests

### Basic Structure
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testServerManager } from '../../utils/test-server-manager';

describe('My Server-Dependent Tests', () => {
  beforeAll(async () => {
    // Start required servers
    await testServerManager.startServers(['admin', 'newtest']);
  }, 90000); // 90 second timeout

  afterAll(async () => {
    // Clean up all servers
    await testServerManager.stopAllServers();
  }, 20000); // 20 second timeout

  it('should test server functionality', async () => {
    const adminUrl = testServerManager.getServerUrl('admin');
    const response = await fetch(`${adminUrl}/api/auth/session`);
    expect(response.status).toBeLessThan(500);
  });
});
```

### Server Manager API
```typescript
// Start single server
await testServerManager.startServer('admin');

// Start multiple servers in parallel
await testServerManager.startServers(['admin', 'newtest']);

// Check if server is running
const isRunning = testServerManager.isServerRunning('admin');

// Get server URL
const url = testServerManager.getServerUrl('admin');

// Stop specific server
await testServerManager.stopServer('admin');

// Stop all servers
await testServerManager.stopAllServers();
```

## Troubleshooting

### Common Issues

**Port conflicts**: The server manager automatically kills processes on required ports before starting servers.

**Slow startup**: Next.js can take 30-45 seconds to start. Increase timeout if needed.

**Tests hanging**: Check that `afterAll` cleanup is properly configured.

**Server not responding**: Enable debug mode with `TEST_SERVER_DEBUG=1` to see server output.

### Manual Server Management
```bash
# Kill all test servers manually
pnpm ports:kill

# Start servers manually for debugging
pnpm nx dev admin    # Port 3007
pnpm nx start newtest # Port 3008
```

## Integration with CI/CD

Server-dependent tests are designed to run in CI environments:
- ✅ **Automatic port cleanup** prevents conflicts
- ✅ **Proper timeouts** handle slow CI environments
- ✅ **Graceful error handling** provides clear failure messages
- ✅ **Resource cleanup** ensures no hanging processes

### CI Configuration
```yaml
# Example GitHub Actions step
- name: Run Server-Dependent Tests
  run: |
    cd apps/admin
    pnpm test:server-dependent
  timeout-minutes: 10
```

## Performance Considerations

- **Parallel server startup**: Multiple servers start simultaneously
- **Health check optimization**: Minimal 500ms polling interval
- **Process isolation**: Uses Vitest forks for test isolation
- **Resource cleanup**: Automatic cleanup prevents resource leaks
- **Selective execution**: Only runs when explicitly requested

## Future Enhancements

- [ ] **Docker integration** for consistent server environments
- [ ] **Database seeding** for tests requiring specific data
- [ ] **Mock external services** for isolated testing
- [ ] **Performance benchmarking** for server response times
- [ ] **Load testing** capabilities for stress testing