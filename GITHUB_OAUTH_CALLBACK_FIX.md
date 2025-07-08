# GitHub OAuth Authentication Issue Analysis

## Issue Summary
The GitHub OAuth authentication is failing with the error:
```
The redirect_uri is not associated with this application.
```

## Updated Status
**CALLBACK URL IS ALREADY CORRECT**: The GitHub OAuth app is already configured with the correct callback URL: `http://localhost:3007/services/api/auth/callback/github`

## Root Cause Analysis - SOLVED
The issue is caused by a **configuration conflict** between Next.js `basePath` and `NEXTAUTH_URL`.

### Error Analysis
From the OAuth error URL:
```
https://github.com/login/oauth/authorize?...&redirect_uri=http%3A%2F%2Flocalhost%3A3007%2Fservices%2Fcallback%2Fgithub&...
```

URL-decoded redirect_uri: `http://localhost:3007/services/callback/github`

### The Configuration Conflict
**Current Configuration:**
- Next.js config: `basePath: '/services'`
- Environment: `NEXTAUTH_URL=http://localhost:3007/services`

**The Problem:**
This creates a "double /services" situation where NextAuth gets confused about URL construction:
- NextAuth sees `NEXTAUTH_URL=http://localhost:3007/services`
- Next.js applies `basePath: '/services'` on top
- Result: NextAuth generates incorrect callback URLs missing `/api/auth`

### The Discrepancy
- **OAuth Error Shows**: `http://localhost:3007/services/callback/github` (missing `/api/auth`)
- **GitHub App Configured**: `http://localhost:3007/services/api/auth/callback/github` ✅
- **NextAuth Should Generate**: `http://localhost:3007/services/api/auth/callback/github` ✅

**NextAuth is generating the wrong redirect_uri due to the basePath/NEXTAUTH_URL conflict.**

## Verification
✅ NextAuth is properly configured (verified via curl test)
✅ Callback endpoint exists at correct path (returns 400 as expected)
✅ NEXTAUTH_URL is correctly set to `http://localhost:3007/services`
✅ GitHub OAuth credentials are properly configured in .env

## Solution

### Fix the NEXTAUTH_URL Configuration
The solution is to remove the basePath from NEXTAUTH_URL and let Next.js handle the `/services` routing automatically.

**Step 1: Update the Environment Variable**
Edit `apps/admin/.env` and change:
```bash
# FROM (current - causes conflict):
NEXTAUTH_URL=http://localhost:3007/services

# TO (correct - works with basePath):
NEXTAUTH_URL=http://localhost:3007
```

**Step 2: Restart the Admin Portal**
```bash
# Stop the current admin portal (Ctrl+C)
# Then restart:
nx dev admin-portal
# OR
pnpm start:admin-portal
```

**Step 3: Test the Fix**
1. Open `http://localhost:3000/admin` in your browser
2. Click "Login with GitHub"
3. You should be redirected to GitHub OAuth (not get an error)
4. After GitHub authentication, you should be redirected back to the portal admin

### Why This Works
- `NEXTAUTH_URL=http://localhost:3007` (base URL)
- Next.js `basePath: '/services'` automatically applies to all routes
- Result: NextAuth generates correct callback URL `http://localhost:3007/services/api/auth/callback/github`

## Environment-Specific Configuration

### Local Development
- **NEXTAUTH_URL**: `http://localhost:3007`
- **Callback URL**: `http://localhost:3007/services/api/auth/callback/github`

### Preview (GitHub Pages)
- **NEXTAUTH_URL**: `https://iflastandards.github.io/platform`
- **Callback URL**: `https://iflastandards.github.io/platform/services/api/auth/callback/github`

### Production
- **NEXTAUTH_URL**: `https://www.iflastandards.info`
- **Callback URL**: `https://www.iflastandards.info/services/api/auth/callback/github`

**Note**: In all environments, the basePath `/services` is handled by Next.js configuration, so NEXTAUTH_URL should be the base URL without the `/services` path.

## Technical Details

### NextAuth Configuration
- **Base URL**: `http://localhost:3007` (from NEXTAUTH_URL)
- **Next.js basePath**: `/services` (automatically applied to all routes)
- **API Routes**: Handled by `/apps/admin/src/app/api/auth/[...nextauth]/route.ts`
- **Callback Pattern**: `{NEXTAUTH_URL}{basePath}/api/auth/callback/{provider}`
- **Final Callback URL**: `http://localhost:3007/services/api/auth/callback/github`

### OAuth Flow
1. User clicks "Login with GitHub" on portal (`localhost:3000/admin`)
2. Portal redirects to admin signin (`localhost:3007/services/auth/signin`)
3. NextAuth redirects to GitHub OAuth with callback URL
4. GitHub redirects back to callback URL after authentication
5. NextAuth processes the callback and creates session
6. User is redirected back to portal admin

## Expected Outcome
After updating the GitHub OAuth app callback URL:
- ✅ No more "redirect_uri not associated" errors
- ✅ Proper redirect to GitHub OAuth
- ✅ Successful authentication and return to portal admin
- ✅ Session persistence across browser tabs/refreshes

## Troubleshooting

### If the error persists:
1. Double-check the callback URL was saved correctly in GitHub
2. Clear browser cache and cookies
3. Restart the admin portal: `nx dev admin-portal`
4. Verify the NEXTAUTH_URL in `.env` is correct

### For other environments:
Make sure to create separate OAuth apps for preview and production with their respective callback URLs.
