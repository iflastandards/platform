# Admin Portal Authentication Architecture

**Date:** January 2025  
**Status:** Implemented  
**Components:** Admin Portal, Docusaurus Sites, E2E Testing  

## Overview

This document describes the comprehensive authentication and testing architecture implemented for the IFLA Standards admin portal and its integration with Docusaurus sites.

## Architecture Components

### 1. Cross-Domain Authentication System

#### Problem Solved
- **CORS Issues**: Admin portal (port 3007) and Docusaurus sites (port 3008) were unable to communicate due to cross-origin restrictions
- **Hardcoded URLs**: Components had hardcoded `localhost:3007` URLs that broke in different environments
- **Environment Agnostic**: No automatic adaptation to preview/development/production environments

#### Solution Implemented
- **CORS Configuration**: Added proper CORS headers in `apps/admin-portal/next.config.js`
- **Environment-Aware URLs**: Centralized configuration in `packages/theme/src/config/siteConfig.ts`
- **Dynamic Detection**: Automatic environment detection based on hostname

### 2. URL Configuration Matrix

#### Design Decision: `/admin/` Paths vs Subdomains
**Chosen**: `/admin/` paths  
**Reason**: Subdomains create deployment complexity and certificate management issues

```typescript
// Environment-specific admin portal URLs
export const ADMIN_PORTAL_CONFIG: Record<Environment, AdminPortalConfig> = {
  local: {
    url: 'http://localhost:3007',
    signinUrl: 'http://localhost:3007/signin',
    // ...
  },
  preview: {
    url: 'https://iflastandards.github.io/standards-dev/admin',
    signinUrl: 'https://iflastandards.github.io/standards-dev/admin/signin',
    // ...
  },
  production: {
    url: 'https://www.iflastandards.info/admin',
    signinUrl: 'https://www.iflastandards.info/admin/signin',
    // ...
  }
};
```

#### Environment Detection Logic
```typescript
export function getAdminPortalConfigAuto(): AdminPortalConfig {
  if (typeof window === 'undefined') {
    return getAdminPortalConfig('local'); // SSR default
  }

  const { hostname } = window.location;
  
  if (hostname === 'standards.ifla.org' || hostname.includes('ifla.org')) {
    return getAdminPortalConfig('production');
  }
  
  if (hostname === 'iflastandards.github.io') {
    return getAdminPortalConfig('preview');
  }
  
  if (hostname.includes('github.io') || hostname.includes('netlify') || hostname.includes('vercel')) {
    return getAdminPortalConfig('development');
  }
  
  return getAdminPortalConfig('local');
}
```

### 3. CORS Configuration

#### Admin Portal CORS Setup
```javascript
// apps/admin-portal/next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.NODE_ENV === 'production' 
            ? 'https://www.iflastandards.info'
            : 'http://localhost:3008', // Allow newtest site to access admin API
        },
        {
          key: 'Access-Control-Allow-Credentials',
          value: 'true',
        },
        // ... additional headers
      ],
    },
  ];
}
```

## Authentication Flow

### 1. Session Tracking
- **AuthStatus Component**: Background component that polls admin portal for session status
- **Cross-Site Communication**: Uses localStorage and storage events for real-time updates
- **Automatic Detection**: Checks session every 5 minutes and on window focus

### 2. Navbar Integration
- **Dynamic Links**: AuthDropdownNavbarItem uses environment-aware URLs
- **State Synchronization**: Reflects authentication state across all Docusaurus sites
- **Keep Logged In**: User preference stored in localStorage

### 3. Session Persistence
```typescript
// Session check implementation
const checkSession = async () => {
  try {
    const adminConfig = getAdminPortalConfigAuto();
    const response = await fetch(adminConfig.sessionApiUrl, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    // ... handle response and update localStorage
  } catch (error) {
    // ... graceful fallback
  }
};
```

## E2E Testing Architecture

### 1. Enhanced NX Integration

#### Problem Solved
- **Poor NX Integration**: E2E tests weren't leveraging NX affected commands
- **No Fail-Fast Option**: Tests ran all the way through instead of stopping on first failure
- **Limited Reporting**: No proper NX test status integration

#### Solution Implemented

#### New NX Targets
```json
{
  "e2e:fail-fast": {
    "executor": "nx:run-commands",
    "options": {
      "command": "FAIL_FAST=true playwright test --max-failures=1"
    }
  },
  "e2e:admin-portal": {
    "executor": "nx:run-commands",
    "options": {
      "command": "playwright test --project=admin-portal"
    },
    "dependsOn": ["admin-portal:build"]
  },
  "e2e:admin-portal:fail-fast": {
    "executor": "nx:run-commands",
    "options": {
      "command": "FAIL_FAST=true playwright test --project=admin-portal --max-failures=1"
    }
  }
}
```

### 2. Fail-Fast Configuration

#### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: !process.env.FAIL_FAST, // Disable parallel when fail-fast is enabled
  globalTimeout: process.env.FAIL_FAST ? 5 * 60 * 1000 : undefined, // 5 minutes for fail-fast
  // ...
});
```

#### Environment Variables
- **FAIL_FAST**: When set to `true`, configures Playwright for immediate failure on first error
- **Disables Parallel Execution**: Ensures predictable test ordering when fail-fast is enabled
- **Global Timeout**: 5-minute timeout for fail-fast scenarios

### 3. Test Environment Configuration

#### Dynamic URL Configuration in Tests
```typescript
// e2e/admin-portal/cross-site-auth-communication.e2e.test.ts
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

test.describe('Cross-Site Authentication Communication', () => {
  let adminConfig: any;
  
  test.beforeAll(async () => {
    adminConfig = getAdminPortalConfig('local');
  });

  test('should reflect admin login status in newtest navbar', async ({ page, context }) => {
    // Use dynamic URLs
    await page.goto(adminConfig.signinUrl);
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);
    // ...
  });
});
```

## Usage Examples

### 1. Development Workflow

```bash
# Start admin portal and sites
nx dev admin-portal
nx run newtest:start:robust

# Run authentication tests
nx run standards-dev:e2e:admin-portal

# Fail-fast testing for quick feedback
nx run standards-dev:e2e:admin-portal:fail-fast
```

### 2. Component Usage

```typescript
// Using dynamic admin portal configuration
import { getAdminPortalConfigAuto } from '@ifla/theme/config/siteConfig';

const MyComponent = () => {
  const adminConfig = getAdminPortalConfigAuto();
  
  return (
    <a href={adminConfig.signinUrl}>
      Sign In to Admin Portal
    </a>
  );
};
```

### 3. Testing Commands

```bash
# All E2E tests with fail-fast
nx run standards-dev:e2e:fail-fast

# Admin portal specific tests
nx run standards-dev:e2e:admin-portal

# Admin portal with fail-fast
nx run standards-dev:e2e:admin-portal:fail-fast

# Affected E2E tests only
nx run standards-dev:e2e:affected
```

## Performance Optimizations

### 1. NX Caching
- **Proper Input Tracking**: E2E targets include correct input patterns for optimal caching
- **Dependency Management**: Admin portal e2e tests depend on admin-portal:build
- **Affected Detection**: Only runs tests for changed components

### 2. Test Execution
- **Parallel vs Sequential**: Automatic switching based on fail-fast mode
- **Resource Management**: Proper port cleanup and server coordination
- **Timeout Management**: Global timeouts prevent hanging tests

## Security Considerations

### 1. CORS Policy
- **Restrictive Origins**: Only allows specific origins per environment
- **Credential Handling**: Secure cookie transmission with `credentials: 'include'`
- **Header Validation**: Proper Accept and Content-Type header handling

### 2. Session Management
- **HttpOnly Cookies**: Session tokens stored in HttpOnly cookies
- **Secure Transmission**: HTTPS in production, proper local development setup
- **Automatic Cleanup**: Session cleanup on sign out and expiration

## Troubleshooting

### 1. Common Issues

#### CORS Errors
- **Symptom**: Network errors when checking authentication status
- **Solution**: Verify CORS configuration in admin portal Next.js config
- **Debug**: Check browser developer tools Network tab for CORS headers

#### Wrong URLs in Different Environments
- **Symptom**: 404 errors or incorrect redirects
- **Solution**: Verify environment detection logic in `getAdminPortalConfigAuto()`
- **Debug**: Log `window.location.hostname` to verify environment detection

#### E2E Test Failures
- **Symptom**: Tests fail with timeout or element not found errors
- **Solution**: Ensure admin portal is running on correct port (3007)
- **Debug**: Use `nx run standards-dev:e2e:admin-portal:fail-fast` for quick feedback

### 2. Development Tips

#### Local Development
1. Start admin portal: `nx dev admin-portal`
2. Start test site: `nx run newtest:start:robust`
3. Run authentication tests: `nx run standards-dev:e2e:admin-portal`

#### Environment Testing
- **Preview**: Push to `origin/dev` to test GitHub Pages environment
- **Development**: Push to `fork/dev` to test personal GitHub Pages
- **Production**: Manual verification on production domains

## Future Improvements

### 1. Potential Enhancements
- **Real-time Session Sync**: WebSocket-based session synchronization
- **Enhanced Error Handling**: Better error recovery and user feedback
- **Performance Monitoring**: Session check performance metrics
- **Multi-tenant Support**: Support for multiple admin portal instances

### 2. Technical Debt
- **Type Safety**: Improve TypeScript types for admin configuration
- **Test Coverage**: Additional E2E scenarios for edge cases
- **Documentation**: Component-level documentation for authentication hooks

## References

- **Configuration**: `packages/theme/src/config/siteConfig.ts`
- **Components**: `packages/theme/src/components/AuthStatus.tsx`
- **Navbar**: `packages/theme/src/theme/NavbarItem/AuthDropdownNavbarItem.tsx`
- **E2E Tests**: `e2e/admin-portal/cross-site-auth-communication.e2e.test.ts`
- **NX Configuration**: `project.json` (workspace root)
- **Playwright Config**: `playwright.config.ts`