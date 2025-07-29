# Server Modes

This document covers the different server modes available in the IFLA Standards Platform, when to use each mode, port management, shutdown procedures, and how they interact with testing frameworks like Playwright.

## When to Use Each Mode

### Headless Mode (Default)
```bash
pnpm dev:servers --mode=headless
# or
pnpm dev:headless
```

**Use when:**
- Running automated tests
- CI/CD environments
- Background development work
- Performance testing

**Features:**
- No browser windows opened
- Faster startup times
- Lower resource consumption
- Ideal for server-only testing

### Interactive Mode
```bash
pnpm dev:servers --mode=interactive --browser=chrome
# or
pnpm dev:interactive
```

**Use when:**
- Active development and debugging
- Manual testing of UI components
- Visual verification of changes
- Interactive debugging sessions

**Features:**
- Opens browser windows automatically
- Live reload and hot module replacement
- Full developer tools access
- Visual feedback during development

### Robust Mode
```bash
nx run portal:start:robust
# or
pnpm start:robust
```

**Use when:**
- Port conflicts are expected
- Clean server startup required
- Integration testing
- CI environments with potential conflicts

**Features:**
- Automatic port cleanup before startup
- Process conflict resolution
- Graceful shutdown handling
- Enhanced error recovery

## Port Table & Shutdown Endpoint

| Site       | Port | Command Used                    | Shutdown Endpoint        |
|------------|------|---------------------------------|--------------------------|
| Portal     | 3000 | `nx run portal:start:robust`    | `POST /__shutdown`       |
| ISBDM      | 3001 | `nx run isbdm:start:robust`     | `POST /__shutdown`       |
| LRM        | 3002 | `nx run lrm:start:robust`       | `POST /__shutdown`       |
| FRBR       | 3003 | `nx run frbr:start:robust`      | `POST /__shutdown`       |
| ISBD       | 3004 | `nx run isbd:start:robust`      | `POST /__shutdown`       |
| MulDiCat   | 3005 | `nx run muldicat:start:robust`  | `POST /__shutdown`       |
| UNIMARC    | 3006 | `nx run unimarc:start:robust`   | `POST /__shutdown`       |
| Admin      | 3007 | `nx run admin:dev`              | `POST /__shutdown`       |
| NewTest    | 3008 | `nx run newtest:start:robust`   | `POST /__shutdown`       |

### Shutdown Procedure

1. **Graceful Shutdown via Endpoint**: First attempts `POST /__shutdown`
2. **SIGTERM Signal**: If endpoint fails, sends SIGTERM to process
3. **Force Kill (SIGKILL)**: Final fallback after 3-second timeout
4. **Port Cleanup**: Uses `lsof` to clean up any remaining port usage

### Port Management Commands

```bash
# Kill all development ports
pnpm ports:kill

# Kill specific site port
pnpm ports:kill:site isbd

# Verbose port cleanup (shows detailed process information)
pnpm ports:kill:verbose

# Check server status
pnpm dev:servers --status
```

## Browser Override Instructions

### Playwright Configuration

To override browser settings in Playwright tests, modify `playwright.config.ts`:

```typescript
export default defineConfig({
  // Global browser settings
  use: {
    baseURL: 'http://localhost:3000',
    headless: true, // Override to false for debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // Project-specific browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'], headless: false }, // Debug mode
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

### Development Server Browser Override

```bash
# Override default browser for dev servers
pnpm dev:servers --browser=firefox
pnpm dev:servers --browser=safari
pnpm dev:servers --browser=edge

# Disable browser opening in interactive mode
pnpm dev:servers --mode=interactive --no-open
```

### Environment Variables

```bash
# Set default browser globally
export BROWSER=firefox
pnpm dev:servers

# Override for single run
BROWSER=chrome pnpm dev:interactive
```

## Interaction with Playwright

### Global Setup and Teardown

Playwright uses global setup/teardown files to manage servers:

- **Setup**: `e2e/playwright/global-setup.ts`
- **Teardown**: `e2e/playwright/global-teardown.ts`

### Health Check System

Before running tests, servers are verified through multiple health check endpoints:

1. `http://localhost:{port}/{baseUrl}api/health` (Primary)
2. `http://localhost:{port}/{baseUrl}health` (Secondary) 
3. `http://localhost:{port}/{baseUrl}` (Base URL)
4. `http://localhost:{port}/api/health` (Root fallback)
5. `http://localhost:{port}/health` (Root fallback)
6. `http://localhost:{port}/` (Final fallback)

### Test Integration Examples

#### Vitest Integration
```typescript
import { startServers, stopServers } from '@ifla/dev-servers';

describe('Integration Tests', () => {
  let servers;

  beforeAll(async () => {
    servers = await startServers({ 
      sites: ['portal', 'admin'],
      mode: 'headless' 
    });
  }, 90000);

  afterAll(async () => {
    await stopServers(servers);
  }, 20000);

  it('should test server functionality', async () => {
    const response = await fetch('http://localhost:3000');
    expect(response.status).toBe(200);
  });
});
```

#### Playwright Test Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./e2e/playwright/global-setup'),
  globalTeardown: require.resolve('./e2e/playwright/global-teardown'),
  
  use: {
    baseURL: 'http://localhost:3000',
  },
  
  // Server management handled by global setup
});
```

### Server Reuse Options

```bash
# Reuse existing servers (faster for repeated test runs)
pnpm dev:servers --reuse-existing

# Start fresh servers (clean state guaranteed)
pnpm dev:servers --no-reuse

# Leave servers running after tests
pnpm dev:servers --no-kill
```

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using ports
lsof -i :3000-3008

# Force cleanup all project ports
pnpm ports:kill:verbose

# Start with robust mode
pnpm start:robust
```

**Server not ready:**
```bash
# Check server logs
pnpm dev:servers --verbose

# Extend health check timeout
HEALTH_CHECK_TIMEOUT=60000 pnpm dev:servers
```

**Browser issues:**
```bash
# Reset browser preferences
rm -rf ~/.config/google-chrome/Default/Preferences

# Use different browser
pnpm dev:servers --browser=firefox

# Run headless to avoid browser issues
pnpm dev:headless
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=dev-servers:* pnpm dev:servers

# Show all health check attempts
HEALTH_CHECK_VERBOSE=true pnpm dev:servers
```
