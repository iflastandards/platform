# Server-Dependent Testing System

A comprehensive testing infrastructure for integration tests that require live servers to execute properly. This system automatically manages server lifecycles, handles cross-site authentication testing, and validates CORS functionality.

## Overview

The server-dependent testing system provides:

- ✅ **Automatic server lifecycle management** (start/stop/cleanup)
- ✅ **Multi-server parallel startup** (admin + Docusaurus sites)
- ✅ **Health check monitoring** with timeout handling
- ✅ **Port conflict resolution** with automatic process cleanup
- ✅ **Cross-site authentication testing** between admin and Docusaurus sites
- ✅ **CORS integration validation** for localhost development
- ✅ **Graceful error handling** and resource cleanup

## Quick Start

```bash
# Run all server-dependent tests
cd apps/admin
pnpm test:server-dependent

# Run with debug output to see server logs
TEST_SERVER_DEBUG=1 pnpm test:server-dependent

# Run specific test file
pnpm vitest run --config=vitest.config.server-dependent.ts src/test/integration/server-dependent/basic-server-test.test.ts
```

## Architecture

### Core Components

#### 1. Test Server Manager (`src/test/utils/test-server-manager.ts`)

The central component that manages server lifecycles:

```typescript
import { testServerManager } from '../../utils/test-server-manager';

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

**Key Features:**
- **Automatic port cleanup**: Kills existing processes on required ports
- **Health check monitoring**: Waits for servers to be ready before proceeding
- **Process isolation**: Proper signal handling and cleanup
- **Timeout management**: Configurable startup and shutdown timeouts
- **Debug logging**: Optional verbose output for troubleshooting

#### 2. Server Configurations

Pre-configured server setups for common scenarios:

```typescript
export const SERVER_CONFIGS = {
  ADMIN: {
    name: 'admin',
    command: 'pnpm',
    args: ['nx', 'dev', 'admin'],
    port: 3007,
    healthCheckUrl: 'http://localhost:3007',
    startupTimeout: 45000, // Next.js takes longer to start
    shutdownTimeout: 10000,
    env: {
      NEXTAUTH_URL: 'http://localhost:3007',
      NEXTAUTH_SECRET: 'test-secret-for-integration-tests',
      GITHUB_ID: 'test-github-id',
      GITHUB_SECRET: 'test-github-secret',
      NEXT_PUBLIC_CERBOS_PDP_URL: 'http://localhost:3593',
    },
  },
  
  NEWTEST: {
    name: 'newtest',
    command: 'pnpm',
    args: ['nx', 'start', 'newtest', '--no-open'],
    port: 3008,
    healthCheckUrl: 'http://localhost:3008',
    startupTimeout: 30000,
    shutdownTimeout: 5000,
    env: {
      NODE_ENV: 'development',
      BROWSER: 'none', // Disable browser opening
    },
  },
  
  // Additional servers: PORTAL (3000), ISBDM (3001), etc.
};
```

#### 3. Test Configuration (`vitest.config.server-dependent.ts`)

Specialized Vitest configuration for server-dependent tests:

```typescript
export default defineConfig({
  test: {
    name: 'admin-server-dependent',
    environment: 'node',
    testTimeout: 180000, // 3 minutes for server operations
    hookTimeout: 180000, // 3 minutes for setup/teardown
    include: ['src/test/integration/server-dependent/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', '.next/**'],
    setupFiles: ['src/test/setup-server-dependent.ts'],
    pool: 'forks', // Use separate processes for isolation
    poolOptions: {
      forks: {
        singleFork: true, // Prevent port conflicts
      },
    },
  },
});
```

#### 4. Setup File (`src/test/setup-server-dependent.ts`)

Configures the testing environment:

```typescript
// Import node-fetch for server-dependent tests
import fetch from 'node-fetch';

// Make fetch available globally
global.fetch = fetch as any;

// Filter console output to reduce noise
console.log = (...args: any[]) => {
  const firstArg = args[0];
  if (
    typeof firstArg === 'string' &&
    (firstArg.includes('Starting') ||
      firstArg.includes('Server') ||
      firstArg.includes('ready'))
  ) {
    originalConsoleLog(...args);
  }
};
```

## Test Categories

### 1. Basic Server Management

**File**: `basic-server-test.test.ts`  
**Purpose**: Validates core server lifecycle functionality

```typescript
describe('Basic Server Test', () => {
  it('should be able to start and stop admin server', async () => {
    await testServerManager.startServer('admin');
    
    // Simple health check
    const response = await fetch('http://localhost:3007/api/auth/session');
    expect(response.status).toBeLessThan(500);
    
    await testServerManager.stopServer('admin');
  }, 60000);
});
```

### 2. Cross-Site Authentication Testing

**File**: `cross-site-auth.test.ts`  
**Purpose**: Tests authentication flows between admin and Docusaurus sites

```typescript
describe('Cross-Site Authentication (Server-Dependent)', () => {
  beforeAll(async () => {
    // Start both admin and newtest servers
    await testServerManager.startServers(['admin', 'newtest']);
  }, 90000);

  it('should handle CORS for cross-site authentication requests', async () => {
    const response = await fetch(`${adminBaseUrl}/api/auth/session`, {
      method: 'GET',
      headers: {
        Origin: newtestBaseUrl,
        Accept: 'application/json',
      },
    });

    expect(response.status).toBeLessThan(500);
  });
});
```

### 3. CORS Integration Testing

**File**: `cors-integration.test.ts`  
**Purpose**: Validates CORS configuration for cross-origin requests

```typescript
describe('CORS Integration (Server-Dependent)', () => {
  it('should allow requests from all configured local origins', async () => {
    const allowedOrigins = [
      'http://localhost:3000', // Portal
      'http://localhost:3001', // ISBDM
      'http://localhost:3008', // NewTest
    ];

    for (const origin of allowedOrigins) {
      const response = await fetch(`${adminBaseUrl}/api/auth/session`, {
        method: 'GET',
        headers: { Origin: origin },
      });

      expect(response.status).toBeLessThan(500);
    }
  });
});
```

### 4. Process Management Testing

**File**: `spawn-test.test.ts`, `simple-spawn-test.test.ts`  
**Purpose**: Validates process spawning and command execution

```typescript
describe('Spawn Test', () => {
  it('should be able to spawn admin server process', async () => {
    const serverProcess = spawn('pnpm', ['nx', 'dev', 'admin'], {
      cwd: '/Users/jonphipps/Code/IFLA/standards-dev',
      env: { /* test environment */ },
    });

    // Wait for server ready indicators
    // Handle process lifecycle
    // Clean up resources
  });
});
```

## Writing Server-Dependent Tests

### Basic Test Structure

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

### Best Practices

#### 1. Server Lifecycle Management

```typescript
// ✅ Good: Use testServerManager for consistent lifecycle
beforeAll(async () => {
  await testServerManager.startServer('admin');
}, 60000);

afterAll(async () => {
  await testServerManager.stopAllServers();
}, 20000);

// ❌ Bad: Manual server management
beforeAll(async () => {
  spawn('pnpm', ['nx', 'dev', 'admin']); // No cleanup, health checks, etc.
});
```

#### 2. Timeout Configuration

```typescript
// ✅ Good: Appropriate timeouts for server operations
beforeAll(async () => {
  await testServerManager.startServers(['admin', 'newtest']);
}, 90000); // 90 seconds for multiple servers

it('should test functionality', async () => {
  // Test logic
}, 30000); // 30 seconds for individual tests

// ❌ Bad: Default timeouts (too short for server startup)
beforeAll(async () => {
  await testServerManager.startServer('admin');
}); // Will likely timeout
```

#### 3. Error Handling

```typescript
// ✅ Good: Proper error handling and cleanup
it('should handle server errors gracefully', async () => {
  try {
    const response = await fetch('http://localhost:3007/api/test');
    expect(response.status).toBeLessThan(500);
  } catch (error) {
    console.error('Server request failed:', error);
    throw error; // Re-throw to fail the test
  }
});

// ❌ Bad: Silent failures
it('should test server', async () => {
  const response = await fetch('http://localhost:3007/api/test');
  // No error handling - test might pass even if server is down
});
```

#### 4. Resource Cleanup

```typescript
// ✅ Good: Always clean up in afterAll
afterAll(async () => {
  await testServerManager.stopAllServers();
}, 20000);

// ✅ Good: Handle cleanup on test failure
beforeAll(async () => {
  try {
    await testServerManager.startServer('admin');
  } catch (error) {
    await testServerManager.stopAllServers(); // Cleanup on failure
    throw error;
  }
});
```

## Configuration

### Environment Variables

```bash
# Enable debug logging for server output
TEST_SERVER_DEBUG=1 pnpm test:server-dependent

# Set custom timeouts (in milliseconds)
TEST_TIMEOUT=300000 pnpm test:server-dependent
```

### Port Configuration

Default port mappings (defined in `test-server-manager.ts`):

```typescript
const PORT_MAPPINGS = {
  admin: 3007,    // Next.js admin app
  portal: 3000,   // Portal Docusaurus site
  isbdm: 3001,    // ISBDM standard site
  lrm: 3002,      // LRM standard site
  frbr: 3003,     // FRBR standard site
  isbd: 3004,     // ISBD standard site
  muldicat: 3005, // MulDiCat standard site
  unimarc: 3006,  // UniMARC standard site
  newtest: 3008,  // Test site for development
};
```

### Adding New Server Configurations

```typescript
// 1. Add to SERVER_CONFIGS in test-server-manager.ts
export const SERVER_CONFIGS = {
  // ... existing configs
  
  MY_NEW_SERVER: {
    name: 'my-server',
    command: 'pnpm',
    args: ['nx', 'start', 'my-server'],
    port: 3009,
    healthCheckUrl: 'http://localhost:3009',
    startupTimeout: 30000,
    shutdownTimeout: 5000,
    env: {
      NODE_ENV: 'development',
    },
  } as ServerConfig,
};

// 2. Register the configuration
testServerManager.registerServer(SERVER_CONFIGS.MY_NEW_SERVER);

// 3. Use in tests
await testServerManager.startServer('my-server');
```

## Troubleshooting

### Common Issues

#### Port Conflicts
**Symptom**: Server fails to start with "port already in use" error  
**Solution**: The server manager automatically kills conflicting processes, but you can manually clean up:

```bash
# Kill all test servers
pnpm ports:kill

# Kill specific port
lsof -ti:3007 | xargs kill -9
```

#### Server Startup Timeouts
**Symptom**: Tests fail with "Server failed to start within timeout"  
**Solution**: 
1. Increase timeout in server config
2. Check server logs with `TEST_SERVER_DEBUG=1`
3. Verify server dependencies are installed

```typescript
// Increase timeout for slow servers
const config = {
  startupTimeout: 60000, // Increase from 30s to 60s
  // ... other config
};
```

#### Tests Hanging
**Symptom**: Tests don't complete and hang indefinitely  
**Solution**: Ensure proper cleanup in `afterAll` hooks

```typescript
afterAll(async () => {
  await testServerManager.stopAllServers();
}, 20000); // Always include timeout
```

#### Fetch Errors
**Symptom**: `fetch is not defined` or similar errors  
**Solution**: Ensure `setup-server-dependent.ts` is properly configured:

```typescript
import fetch from 'node-fetch';
global.fetch = fetch as any;
```

### Debug Mode

Enable comprehensive debugging:

```bash
TEST_SERVER_DEBUG=1 pnpm test:server-dependent
```

This will show:
- Server startup/shutdown logs
- Health check attempts
- Process spawn details
- Network request/response details

### Manual Server Management

For debugging, you can start servers manually:

```bash
# Start admin server
pnpm nx dev admin

# Start test site
pnpm nx start newtest

# Check server status
curl http://localhost:3007/api/auth/session
curl http://localhost:3008
```

## Performance Considerations

### Optimization Strategies

1. **Parallel Server Startup**: Start multiple servers simultaneously
```typescript
// ✅ Fast: Parallel startup
await testServerManager.startServers(['admin', 'newtest']);

// ❌ Slow: Sequential startup
await testServerManager.startServer('admin');
await testServerManager.startServer('newtest');
```

2. **Server Reuse**: Share servers across tests in the same suite
```typescript
// ✅ Efficient: Start once per test suite
describe('Multiple Tests', () => {
  beforeAll(async () => {
    await testServerManager.startServer('admin');
  });

  it('test 1', () => { /* uses same server */ });
  it('test 2', () => { /* uses same server */ });
});
```

3. **Selective Testing**: Run only necessary server-dependent tests
```bash
# Run specific test file
pnpm vitest run --config=vitest.config.server-dependent.ts src/test/integration/server-dependent/basic-server-test.test.ts

# Run tests matching pattern
pnpm vitest run --config=vitest.config.server-dependent.ts --testNamePattern="CORS"
```

### Performance Metrics

Typical execution times:
- **Server startup**: 10-45 seconds (Next.js slower than Docusaurus)
- **Health checks**: 1-5 seconds
- **Individual tests**: 1-10 seconds
- **Full suite**: 45-90 seconds

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Server-Dependent Tests

on:
  push:
    branches: [main, preview]
  pull_request:
    branches: [main]

jobs:
  server-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Run server-dependent tests
        run: |
          cd apps/admin
          pnpm test:server-dependent
        timeout-minutes: 10
```

### Key CI Considerations

1. **Timeouts**: Set appropriate timeouts for CI environments (usually longer)
2. **Resource limits**: CI environments may have limited CPU/memory
3. **Port availability**: Ensure ports are available in CI environment
4. **Cleanup**: Always clean up processes to prevent resource leaks

## Future Enhancements

### Planned Improvements

1. **Docker Integration**: Containerized server environments for consistency
2. **Database Seeding**: Automated test data setup for database-dependent tests
3. **Mock External Services**: Isolated testing without external dependencies
4. **Performance Benchmarking**: Automated performance regression detection
5. **Load Testing**: Stress testing capabilities for server endpoints

### Extension Points

The system is designed for easy extension:

```typescript
// Add new server types
interface CustomServerConfig extends ServerConfig {
  customProperty: string;
}

// Add new test categories
describe('Custom Integration Tests', () => {
  // Custom test logic
});

// Add new health check strategies
class CustomHealthChecker {
  async checkHealth(url: string): Promise<boolean> {
    // Custom health check logic
  }
}
```

## Related Documentation

- [Admin Portal Testing Strategy](./admin-portal-testing.md)
- [Cross-Site Authentication Architecture](./admin-authentication-architecture.md)
- [Port Management System](../../../docs/nx-workflow-guide.md#port-management)
- [Development Workflow](../../../developer_notes/DEVELOPMENT_WORKFLOW.md)

## Support

For issues or questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Run tests with `TEST_SERVER_DEBUG=1` for detailed logs
3. Review server logs in the admin application
4. Create an issue in the project repository

---

*This documentation covers the server-dependent testing system as implemented in the IFLA Standards Development project. The system provides robust, automated testing for cross-site authentication and server integration scenarios.*