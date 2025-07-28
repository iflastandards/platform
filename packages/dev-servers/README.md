# @ifla/dev-servers

Lightweight development server utilities for IFLA Standards Platform integration testing.

This package provides simple `startServers` and `stopServers` utilities that can be used in Vitest or other integration test suites to automatically manage development servers.

## Installation

This package is internal to the IFLA Standards Platform monorepo and is not published to npm.

```bash
# Within the monorepo, install dependencies
pnpm install
```

## Usage

### Basic Usage

```typescript
import { startServers, stopServers } from '@ifla/dev-servers';

// Start specific servers
const servers = await startServers({ sites: ['portal', 'admin'] });

// Stop all servers
await stopServers(servers);
```

### Vitest Integration Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startServers, stopServers } from '@ifla/dev-servers';

describe('Integration Tests', () => {
  let servers;

  beforeAll(async () => {
    servers = await startServers({ sites: ['portal'] });
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

## API Reference

### `startServers(options?)`

Starts development servers for the specified sites.

**Parameters:**
- `options.sites?: string[]` - Array of site names to start. Defaults to all available sites.
- `options.reuseExisting?: boolean` - Whether to reuse existing servers if they're already running. Defaults to `false`.

**Returns:** `Promise<ServerInfo[]>` - Array of server information objects.

**Available Sites:**
- `portal` - Main documentation portal (port 3000)
- `isbdm` - ISBD Manifestation standard (port 3001)
- `lrm` - Library Reference Model (port 3002)
- `frbr` - Functional Requirements (port 3003)
- `isbd` - International Standard Bibliographic Description (port 3004)
- `muldicat` - Multilingual Dictionary of Cataloguing Terms (port 3005)
- `unimarc` - UNIMARC formats (port 3006)
- `admin` - Admin portal (port 3007)
- `newtest` - Test site (port 3008)

### `stopServers(servers)`

Stops all provided servers and cleans up their ports.

**Parameters:**
- `servers: ServerInfo[]` - Array of server information objects returned by `startServers()`.

**Returns:** `Promise<void>`

### Types

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

## Features

- **Automatic Port Management**: Kills existing processes on required ports before starting
- **Health Check Monitoring**: Waits for servers to be ready before proceeding
- **Process Isolation**: Proper signal handling and cleanup
- **Timeout Management**: Configurable startup and shutdown timeouts
- **Site-Specific Commands**: Uses appropriate commands for different server types
- **Reuse Existing Servers**: Option to skip startup if servers are already running

## Environment Variables

- `DOCS_ENV` - Environment setting passed to servers (defaults to 'local')

## Example Output

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

## Error Handling

The utilities include comprehensive error handling:

- Unknown sites are skipped with error messages
- Port conflicts are automatically resolved
- Server startup failures are logged
- Graceful shutdown with fallback to force kill
- Proper cleanup on process exit

## Development

To build the package:

```bash
cd packages/dev-servers
pnpm build
```

To watch for changes during development:

```bash
pnpm dev
```

## Related

This package is used by the server-dependent testing system in the admin portal. See `apps/admin/src/test/integration/server-dependent/` for usage examples.
