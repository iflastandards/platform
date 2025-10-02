# Environment-Based Testing Setup

## Overview

The admin app now supports multiple testing environments with seamless switching between mock and real services. This provides production parity without the complexity of full Docker containerization.

## Environment Hierarchy

1. **test_mock** - Pure mocks, no external dependencies (fastest)
2. **test_local** - Local Supabase via Orbstack, mocked external APIs
3. **test_integration** - Local Supabase, real external APIs
4. **staging** - Remote staging services (Render.com preview)
5. **production** - Production services (use with caution)

## Quick Start

### 1. Install Prerequisites

```bash
# Install Orbstack (lighter than Docker Desktop)
brew install --cask orbstack

# Install Supabase CLI
brew install supabase/tap/supabase
```

### 2. Start Local Services (When Needed)

```bash
# Start Orbstack
open -a OrbStack

# Navigate to admin app
cd apps/admin

# Initialize Supabase (first time only)
supabase init

# Start local Supabase
supabase start
# This provides:
# - PostgreSQL on port 54322
# - Supabase API on port 54321
# - Studio UI on port 54323
```

### 3. Switch Environments

```bash
# For pure mock testing (no dependencies)
pnpm env:mock

# For local database testing
pnpm env:local

# For full integration testing
pnpm env:integration

# For staging environment
pnpm env:staging
```

## Testing Workflows

### Unit Testing (Fastest - No Dependencies)
```bash
pnpm env:mock        # Switch to mock environment
pnpm test:unit       # Run unit tests with pure mocks
```

### Integration Testing (With Local Database)
```bash
pnpm supabase:start  # Start local Supabase
pnpm env:local       # Switch to local environment
pnpm test:integration # Run integration tests
```

### E2E Testing (Full Stack)
```bash
pnpm supabase:start  # Ensure Supabase is running
pnpm env:integration # Use real APIs
pnpm test:e2e        # Run E2E tests
```

### Development Workflows

```bash
# Develop with mocks (fastest iteration)
pnpm dev:mock

# Develop with local database
pnpm dev:local

# Develop against staging
pnpm dev:staging
```

## Environment Detection in Code

The environment configuration automatically detects which environment is active:

```typescript
import { config } from '@/config/environment';

// Check current environment
if (config.runtime.isTestMock) {
  // Running with pure mocks
}

if (config.runtime.isTestLocal) {
  // Running with local Supabase
}

if (config.env.isLocalSupabase) {
  // Using local Supabase (either test_local or test_integration)
}

// In tests, ensure correct environment
describe('My Feature', () => {
  beforeAll(() => {
    config.testHelpers.ensureMockEnvironment();
    // or
    config.testHelpers.ensureLocalServices();
  });
  
  it('should work', () => {
    // Test implementation
  });
});
```

## Service Switching Pattern

All services support environment-based switching:

```typescript
export class MyService {
  private provider: DataProvider;
  
  constructor() {
    // Automatic environment detection
    this.provider = config.env.useMock
      ? new MockDataProvider()
      : new LiveDataProvider(config.env.supabaseUrl);
  }
}
```

## CI/CD Integration

```yaml
# GitHub Actions example
jobs:
  test-unit:
    env:
      NEXT_PUBLIC_ENV_NAME: test_mock
    run: pnpm test:unit
    
  test-integration:
    services:
      supabase:
        image: supabase/postgres:15
    env:
      NEXT_PUBLIC_ENV_NAME: test_local
    run: pnpm test:integration
```

## Troubleshooting

### Orbstack Not Running
```bash
# Check if Docker daemon is running
docker ps

# Start Orbstack
open -a OrbStack
```

### Supabase Not Responding
```bash
# Check status
pnpm supabase:status

# Restart if needed
pnpm supabase:stop
pnpm supabase:start
```

### Environment Not Switching
```bash
# Check current environment
cat apps/admin/.env.local

# Force switch
pnpm env:mock  # or env:local, etc.

# Restart dev server
pnpm dev
```

## Benefits of This Approach

1. **No Complex Docker Setup** - Apps run natively with Nx
2. **Fast Iteration** - No container rebuilds for code changes
3. **Production Parity** - Local Supabase matches production
4. **Flexible Testing** - Easy switching between mock/real
5. **Render.com Compatible** - Matches deployment environment
6. **Debugging Friendly** - Native Node.js debugging works

## Next Steps

1. Run `pnpm env:mock` to start with mock testing
2. When ready for database testing, start Orbstack and run `supabase start`
3. Use `pnpm env:local` for local integration testing
4. Graduate to `pnpm env:integration` for full stack testing

## Environment Variables Reference

See the `.env.*` files in `apps/admin/` for complete variable lists:
- `.env.test.mock` - Mock environment variables
- `.env.test.local` - Local Supabase variables
- `.env.test.integration` - Full integration variables
- `.env.staging` - Staging environment
- `.env.production` - Production (handle with care)