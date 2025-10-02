# Test Execution Guide - Server Dependency Management

This guide explains how to run tests correctly based on their server dependencies and environment requirements.

## 🎯 Quick Reference

```bash
# Unit tests - NO SERVERS NEEDED
pnpm test --grep "@unit"

# Integration tests (MSW mocked) - NO SERVERS NEEDED  
pnpm test --grep "@integration" --grep-invert "@server-dependent"

# Integration tests (server-dependent) - REQUIRES LOCAL SERVERS
pnpm test --grep "@integration.*@server-dependent"

# API tests (mocked) - NO SERVERS NEEDED
pnpm test --grep "@api" --grep-invert "@live-api"

# API tests (local) - REQUIRES ADMIN SERVER ONLY
nx run admin:dev  # Start in separate terminal first
pnpm test --grep "@api.*@live-api.*@server-dependent"

# E2E tests (local) - REQUIRES SERVERS
pnpm test:servers start  # Start required servers
pnpm test --grep "@e2e.*@server-dependent"

# Post-deployment tests - CI ONLY, after deployment
pnpm test --grep "@post-deploy"
```

## 📊 Test Categories by Server Requirement

### ✅ Tests That NEVER Need Servers (CI-Safe)

| Tag Pattern | Description | Environment |
|------------|-------------|-------------|
| `@unit` | Pure unit tests with mocks | Local, CI |
| `@integration` (without `@server-dependent`) | Integration with MSW mocks | Local, CI |
| `@api` (without `@live-api`) | API tests with MSW | Local, CI |

### 🏃 Tests That Need LOCAL Servers (Local Only)

| Tag Pattern | Required Servers | Command |
|------------|-----------------|---------|
| `@integration @server-dependent` | Various | `pnpm test:servers start` |
| `@api @live-api @server-dependent` | Admin only | `nx run admin:dev` |
| `@e2e @server-dependent` | Full stack | `pnpm test:servers start` |

### 🚀 Tests for DEPLOYED URLs (CI Post-Deploy)

| Tag Pattern | When to Run | Environment |
|------------|------------|-------------|
| `@api @live-api @post-deploy` | After API deploy | CI only |
| `@e2e @post-deploy` | After full deploy | CI only |
| `@smoke @post-deploy` | Final validation | CI only |

## 🔧 Environment-Specific Commands

### Local Development

```bash
# Run all tests that don't need servers (fast feedback)
pnpm test --grep-invert "@server-dependent" --grep-invert "@post-deploy"

# Run tests that need admin server only
nx run admin:dev  # Terminal 1
pnpm test --grep "@api.*@live-api.*@server-dependent"  # Terminal 2

# Run tests that need all servers
pnpm test:servers start  # Terminal 1
pnpm test --grep "@server-dependent" --grep-invert "@post-deploy"  # Terminal 2

# Run only local-compatible tests
pnpm test --grep-invert "@ci-only" --grep-invert "@post-deploy"
```

### CI Pipeline

```yaml
# Pre-deployment tests (no servers needed)
- name: Unit Tests
  run: pnpm test --grep "@unit"

- name: Integration Tests (Mocked)
  run: pnpm test --grep "@integration" --grep-invert "@server-dependent"

- name: API Tests (Mocked)
  run: pnpm test --grep "@api" --grep-invert "@live-api"

# Post-deployment tests (against deployed URLs)
- name: Wait for Deployment
  run: ./scripts/wait-for-deployment.sh

- name: Smoke Tests
  run: pnpm test --grep "@smoke.*@post-deploy"
  env:
    DEPLOYED_URL: ${{ steps.deploy.outputs.url }}
    DEPLOYED_API_URL: ${{ steps.deploy.outputs.api_url }}

- name: E2E Tests (Deployed)
  run: pnpm test --grep "@e2e.*@post-deploy"
  env:
    DEPLOYED_URL: ${{ steps.deploy.outputs.url }}

- name: API Tests (Deployed)
  run: pnpm test --grep "@api.*@live-api.*@post-deploy"
  env:
    DEPLOYED_API_URL: ${{ steps.deploy.outputs.api_url }}
```

## 🚫 Invalid Tag Combinations (Will Break)

These tag combinations are invalid and will cause test failures:

| Invalid Combination | Why It Breaks |
|-------------------|---------------|
| `@unit @server-dependent` | Unit tests must never need servers |
| `@unit @live-api` | Unit tests must use mocks only |
| `@server-dependent @ci-only` | CI doesn't have local servers |
| `@post-deploy @local-only` | Post-deploy runs in CI only |
| `@smoke` without `@post-deploy` | Smoke tests validate deployments |
| `@integration @server-dependent` without `@local-only` | Server-dependent tests can't run in CI |

## 🎮 Smart Server Management

### Starting Only Required Servers

```bash
# For admin-only tests
nx run admin:dev

# For portal tests  
nx run portal:start

# For specific standards site
nx run isbdm:start

# For multiple specific servers
pnpm test:servers start --only admin,portal

# For all servers (heavy - avoid if possible)
pnpm test:servers start --all
```

### Server Health Checks

```bash
# Check if admin is running
curl -f http://localhost:3007/api/health || echo "Admin not running"

# Check if portal is running  
curl -f http://localhost:3000 || echo "Portal not running"

# Check all server statuses
pnpm test:servers status
```

## 📝 Test Tagging Examples

### Correct Tagging

```typescript
// ✅ Unit test - no servers needed
/**
 * @unit @critical @api
 */
describe('UserService', () => {
  // Fully mocked, no external dependencies
});

// ✅ Integration test with MSW - no servers needed
/**
 * @integration @high-priority @api
 */
describe('API Integration', () => {
  // Uses MSW to mock API responses
});

// ✅ Integration test needing servers - local only
/**
 * @integration @server-dependent @api @local-only
 */
describe('Live API Integration', () => {
  // Requires localhost:3007 to be running
});

// ✅ Post-deploy test - CI only
/**
 * @smoke @post-deploy @critical
 */
describe('Deployment Validation', () => {
  // Tests against deployed URLs
});
```

### Incorrect Tagging (Will Fail)

```typescript
// ❌ Unit test that needs servers - INVALID
/**
 * @unit @server-dependent @api
 */

// ❌ Server test in CI - INVALID  
/**
 * @integration @server-dependent @ci-only
 */

// ❌ Smoke without post-deploy - INVALID
/**
 * @smoke @critical @api
 */

// ❌ Conflicting environments - INVALID
/**
 * @e2e @local-only @ci-only
 */
```

## 🔄 Migration Guide

If you have existing tests that need updated tags:

1. **Identify server dependencies**:
   - Does it call `localhost` URLs? → Add `@server-dependent`
   - Does it use MSW/mocks? → No server tags needed
   - Does it test deployed URLs? → Add `@post-deploy`

2. **Fix environment conflicts**:
   - Remove `@ci-only` from `@server-dependent` tests
   - Add `@local-only` to `@server-dependent` tests
   - Add `@post-deploy` to all `@smoke` tests

3. **Validate with**:
   ```bash
   pnpm test:validate-tags
   ```

## 🏆 Best Practices

1. **Prefer mocked tests**: They're faster and more reliable
2. **Minimize server dependencies**: Only when testing actual integration
3. **Use MSW for API testing**: Better than spinning up servers
4. **Keep smoke tests simple**: Just critical path validation
5. **Tag accurately**: Wrong tags break CI/CD pipelines
6. **Start minimal servers**: Don't start all Docusaurus sites for admin tests

## 🆘 Troubleshooting

### "Test requires server but none running"
- Check test tags for `@server-dependent`
- Start required servers with appropriate command
- Verify server health with curl commands

### "Test failed in CI but works locally"  
- Check for `@server-dependent` without `@local-only`
- Verify test doesn't depend on local URLs
- Ensure proper `@post-deploy` tags for deployment tests

### "Smoke tests running before deployment"
- All smoke tests must have `@post-deploy` tag
- Check CI pipeline waits for deployment completion
- Verify environment variables for deployed URLs

## 📊 Performance Considerations

| Test Type | Typical Duration | Server Startup |
|-----------|-----------------|----------------|
| Unit tests | <5s per test | 0s (no servers) |
| Integration (mocked) | 5-15s per test | 0s (no servers) |
| Integration (server) | 10-30s per test | 30-60s startup |
| E2E (local) | 30-60s per test | 60-120s startup |
| E2E (deployed) | 20-40s per test | 0s (already deployed) |
| Smoke tests | 10-20s per test | 0s (already deployed) |

## 🎯 Summary

The key to successful test execution is understanding server dependencies:

1. **Most tests should NOT need servers** (use MSW/mocks)
2. **Server-dependent tests are LOCAL ONLY** (never in CI)
3. **Post-deploy tests are CI ONLY** (test real deployments)
4. **Tag accurately or tests will break**
5. **Start only the servers you need**

Following these guidelines ensures:
- Fast local development (no unnecessary servers)
- Reliable CI pipelines (no server startup failures)
- Proper deployment validation (smoke tests after deploy)
- Clear separation of concerns (mocked vs live testing)