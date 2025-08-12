# Demo Mode Testing Guide

## Overview
This guide covers testing demo mode on both local and preview environments.

## Test Files Created

### 1. Integration Test
**Location**: `apps/admin/src/test/integration/demo-mode-preview.test.ts`
**Purpose**: Automated test suite for CI/CD
**Run**: `TEST_PREVIEW=true pnpm test demo-mode-preview`

### 2. Node.js Test Script  
**Location**: `scripts/test-preview-demo.js`
**Purpose**: Interactive testing with colored output
**Run**: `node scripts/test-preview-demo.js`

### 3. Bash Check Script
**Location**: `scripts/check-preview-demo.sh`
**Purpose**: Quick check for CI/CD pipelines
**Run**: `./scripts/check-preview-demo.sh`

## Current Preview Server Status

### Test Results (as of now)
```
✅ Server is accessible
✅ Health endpoint is working  
✅ Clerk authentication is configured
✅ Sign-in UI is present
✅ Protected routes redirect to sign-in
⚠️ Demo status endpoint not deployed (404)
```

### What This Means
- The preview server is running correctly
- Authentication is working
- The new demo mode code hasn't been deployed yet
- Need to push changes and wait for deployment

## How to Enable Demo Mode on Preview

### 1. Deploy the Code
```bash
# Commit the demo mode changes
git add .
git commit -m "Add demo mode support and testing"
git push origin preview

# Render will automatically deploy
```

### 2. Set Environment Variables on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select the `admin-iflastandards-preview` service
3. Go to Environment → Environment Variables
4. Add these variables:
   ```
   NEXT_PUBLIC_IFLA_DEMO=true
   IFLA_DEMO=true
   ```
5. Save and let the service redeploy

### 3. Verify Deployment
```bash
# Check if demo mode is enabled
node scripts/test-preview-demo.js

# Or use the bash script
./scripts/check-preview-demo.sh

# Or check the API directly
curl https://admin-iflastandards-preview.onrender.com/api/demo-status
```

## Expected Behavior When Demo Mode is Enabled

### Visual Indicators
1. **Orange "DEMO MODE" chip** on dashboard
2. **Role chip** in navbar showing mock role
3. **Mock data** instead of real GitHub data
4. **No API rate limit errors**

### Test Accounts
When demo mode is enabled, these accounts will have mock roles:

| Email | Mock Role | Access |
|-------|-----------|--------|
| `superadmin+clerk_test@example.com` | Admin | Full system |
| `rg_admin+clerk_test@example.com` | Maintainer | ISBD, BCM |
| `editor+clerk_test@example.com` | Member | ISBD, CAT |
| `author+clerk_test@example.com` | Member | ISBD only |
| `translator+clerk_test@example.com` | Translator | Projects only |

## Running Tests

### Local Testing
```bash
# Start local server with demo mode
cd apps/admin
echo "NEXT_PUBLIC_IFLA_DEMO=true" > .env.local
echo "IFLA_DEMO=true" >> .env.local
pnpm dev --turbopack

# Test the API
curl http://localhost:3007/api/demo-status
```

### Preview Testing
```bash
# Run the comprehensive test
node scripts/test-preview-demo.js

# Quick check (returns exit code)
./scripts/check-preview-demo.sh
echo $?  # 0=enabled, 1=disabled, 2=unknown
```

### CI/CD Integration
```bash
# In your CI/CD pipeline
./scripts/check-preview-demo.sh
if [ $? -eq 0 ]; then
  echo "Demo mode is enabled"
else
  echo "Demo mode is not enabled"
fi
```

## Test Coverage

The tests check for:
1. **Server accessibility** - Is the preview server running?
2. **Demo status endpoint** - Is demo mode enabled?
3. **Health endpoint** - Basic server health
4. **Authentication setup** - Is Clerk configured?
5. **Route protection** - Are admin routes protected?
6. **Demo indicators** - Are demo components present?

## Troubleshooting

### Demo Status Returns 404
- The code hasn't been deployed yet
- Check Render deployment logs
- Ensure you pushed to the correct branch

### Demo Mode Shows Disabled
- Environment variables not set on Render
- Check Render environment settings
- Redeploy after setting variables

### Tests Fail to Connect
- Preview server might be sleeping (Render free tier)
- Visit the URL in browser first to wake it up
- Check Render service status

## Next Steps

1. **Deploy the code** - Push changes to preview branch
2. **Set env variables** - Configure on Render dashboard
3. **Run tests** - Verify demo mode is working
4. **Document results** - Update this guide with findings

## Related Documentation
- [Demo Mode Verification](./demo-mode-verification.md)
- [Demo Mode Test Results](./demo-mode-test-results.md)
- [Fix Sign-Out Issues](./fix-signout-local.md)