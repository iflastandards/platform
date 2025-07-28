# Development Servers Helper Package

This document explains how to use the `@ifla/dev-servers` package and the `pnpm dev:servers` command for development and testing workflows.

## Quick Usage

### Starting Development Servers

```bash
# Start all development servers
pnpm dev:servers

# Start specific sites only  
pnpm dev:servers --sites=portal,admin

# Start servers and reuse existing ones if already running
pnpm dev:servers --reuse-existing

# Leave servers running after script ends
pnpm dev:servers --no-kill

# Check status of all development ports
pnpm dev:servers --status
```

### Using in Test Files

```typescript
import { startServers, stopServers } from '@ifla/dev-servers';

describe('Integration Tests', () => {
  let servers;

  beforeAll(async () => {
    servers = await startServers({ sites: ['portal', 'admin'] });
  }, 90000); // 90 second timeout for server startup

  afterAll(async () => {
    await stopServers(servers);
  }, 20000); // 20 second timeout for shutdown

  it('should test server functionality', async () => {
    const response = await fetch('http://localhost:3000');
    expect(response.status).toBe(200);
  });
});
```

## Developer Guide

### Package Location

- **Source**: `packages/dev-servers/`
- **Main script**: `scripts/dev-servers.ts`
- **Port utilities**: `scripts/utils/port-manager.js`

### How It Works

The dev-servers system provides utilities for:

1. **Automatic Port Management**: Kills existing processes on required ports before starting
2. **Health Check Monitoring**: Waits for servers to be ready before proceeding
3. **Process Isolation**: Proper signal handling and cleanup
4. **Timeout Management**: Configurable startup and shutdown timeouts
5. **Site-Specific Commands**: Uses appropriate commands for different server types

### Available Sites and Ports

| Site | Port | Command Used |
|------|------|--------------|
| portal | 3000 | `nx run portal:start:robust` |
| isbdm | 3001 | `nx run isbdm:start:robust` |
| lrm | 3002 | `nx run lrm:start:robust` |
| frbr | 3003 | `nx run frbr:start:robust` |
| isbd | 3004 | `nx run isbd:start:robust` |
| muldicat | 3005 | `nx run muldicat:start:robust` |
| unimarc | 3006 | `nx run unimarc:start:robust` |
| admin | 3007 | `nx run admin:dev` |
| newtest | 3008 | `nx run newtest:start:robust` |

### Environment Variables

- `DOCS_ENV` - Environment setting passed to servers (defaults to 'local')
- `DOCS_SITES` - Comma-separated list of sites to start (alternative to --sites flag)

### API Reference

#### `startServers(options?)`

Starts development servers for the specified sites.

**Parameters:**
- `options.sites?: string[]` - Array of site names to start. Defaults to all available sites.
- `options.reuseExisting?: boolean` - Whether to reuse existing servers if they're already running. Defaults to `false`.

**Returns:** `Promise<ServerInfo[]>` - Array of server information objects.

#### `stopServers(servers)`

Stops all provided servers and cleans up their ports.

**Parameters:**
- `servers: ServerInfo[]` - Array of server information objects returned by `startServers()`.

**Returns:** `Promise<void>`

#### Types

```typescript
interface StartServerOptions {
  sites?: string[];
  reuseExisting?: boolean;
}

interface ServerInfo {
  site: string;
  port: number;
  proc: ChildProcess;
}
```

### Example Output

```
🚀 Starting servers for sites: portal, admin
♻️  Reuse existing: false

🔧 Processing site: portal (port 3000)
🧹 Cleaning up port 3000 for portal...
📡 Starting server: nx run portal:start:robust
⏳ Waiting for portal to be ready on port 3000...
✅ Server for portal is ready on port 3000

🔧 Processing site: admin (port 3007)
🧹 Cleaning up port 3007 for admin...
📡 Starting server: nx run admin:dev
⏳ Waiting for admin to be ready on port 3007...
✅ Server for admin is ready on port 3007

🎉 Started 2 servers successfully!
```

### Integration with Testing

The dev-servers package is particularly useful for integration tests that need real servers running. It's used by:

- **Admin portal integration tests**: See `apps/admin/src/test/integration/server-dependent/`
- **E2E tests**: Playwright tests that need servers running
- **Cross-site authentication tests**: Tests that need multiple sites running simultaneously

### Error Handling

The utilities include comprehensive error handling:

- Unknown sites are skipped with error messages
- Port conflicts are automatically resolved
- Server startup failures are logged
- Graceful shutdown with fallback to force kill
- Proper cleanup on process exit

### Building the Package

To build the dev-servers package:

```bash
cd packages/dev-servers
pnpm build
```

To watch for changes during development:

```bash
pnpm dev
```

### Related Commands

- `pnpm ports:kill` - Kill all development ports
- `pnpm ports:kill:site <site>` - Kill specific site port
- `pnpm start:all` - Legacy command for starting all sites (being deprecated)
- `pnpm serve:all` - Legacy command for serving all sites (being deprecated)

### Troubleshooting

**Server not starting:**
- Check if the port is already in use: `pnpm dev:servers --status`
- Try killing all ports: `pnpm ports:kill`
- Check server logs for specific error messages

**Health check failing:**
- The system tries multiple health check URLs: `/api/health`, `/health`, `/`
- Increase timeout if servers are slow to start
- Check network connectivity and firewall settings

**Process cleanup issues:**
- Use `pnpm ports:kill:verbose` to see detailed port cleanup
- Manual cleanup: `lsof -ti:3000 | xargs kill -9` (replace 3000 with specific port)

### Migration from Legacy Commands

If you're updating from the old system:

- Replace `pnpm serve:all` with `pnpm dev:servers`
- Replace manual server startup in tests with `startServers()` and `stopServers()`
- Use the `--reuse-existing` flag to speed up repeated test runs
- Use `--sites` to limit which servers are started for faster development
