# Dev Servers Module Example Usage

The `scripts/dev-servers.ts` module provides a reusable way to start and manage development servers for multiple sites in the IFLA Standards platform.

## 🎉 NEW: @ifla/dev-servers Package Available!

The same `startServers/stopServers` utilities are now available as a lightweight internal package `@ifla/dev-servers`. This makes it much easier to use in integration tests:

```typescript
import { startServers, stopServers } from '@ifla/dev-servers';

let servers;
beforeAll(async () => { 
  servers = await startServers({ sites: ['portal'] }); 
});
afterAll(async () => { 
  await stopServers(servers); 
});
```

See the package documentation at `packages/dev-servers/README.md` for more details.

## Basic Usage

### Start all sites
```bash
pnpm tsx scripts/dev-servers.ts
```

### Start specific sites  
```bash
pnpm tsx scripts/dev-servers.ts --sites=portal,isbd
```

### Using environment variable
```bash
DOCS_SITES=portal,isbd pnpm tsx scripts/dev-servers.ts
```

### Reuse existing servers
```bash
pnpm tsx scripts/dev-servers.ts --sites=portal --reuse-existing
```

## Programmatic Usage

### Starting servers
```typescript
import { startServers, stopServers } from './scripts/dev-servers';

// Start specific sites
const servers = await startServers({ 
  sites: ['portal', 'isbd'],
  reuseExisting: true 
});

// Stop all servers
await stopServers(servers);
```

### Return format
The `startServers` function returns an array of server information:
```typescript
{
  site: string;    // Site name (e.g. 'portal', 'isbd')  
  port: number;    // Port number (e.g. 3000, 3004)
  proc: ChildProcess;  // Node.js child process instance
}
```

## Features

- ✅ **Environment variable support**: `DOCS_SITES=portal,isbd`
- ✅ **CLI flag support**: `--sites=portal,isbd`  
- ✅ **Port cleanup**: Automatically cleans ports before starting
- ✅ **Health checking**: Polls `/api/health`, `/health`, or `/` with exponential backoff
- ✅ **Reuse existing**: `--reuse-existing` flag to skip if already running
- ✅ **Prefixed output**: Each server's logs are prefixed with `[site]`
- ✅ **Different server types**: Admin uses `nx run admin:dev`, others use `nx run site:start:robust`
- ✅ **Graceful shutdown**: Handles SIGTERM and SIGINT properly

## Available Sites

- `portal` (port 3000)
- `isbdm` (port 3001)  
- `lrm` (port 3002)
- `frbr` (port 3003)
- `isbd` (port 3004)
- `muldicat` (port 3005)
- `unimarc` (port 3006)
- `admin` (port 3007)
- `newtest` (port 3008)
