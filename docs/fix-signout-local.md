# Fixing Sign-Out Issues in Local Development

## Common Causes & Solutions

### 1. Browser Cookie Issues
The most common cause is stale cookies from previous sessions.

**Quick Fix - Clear Browser Data:**
1. Open DevTools (F12)
2. Go to Application tab → Storage
3. Click "Clear site data"
4. Refresh the page

**Alternative - Use Incognito/Private Window:**
- Open a new incognito/private browser window
- Navigate to http://localhost:3007
- Sign in and test sign out

### 2. Force Sign-Out via API
Use the force sign-out endpoint:
```bash
curl http://localhost:3007/api/force-signout
```

Then clear your browser cookies and refresh.

### 3. Manual Cookie Cleanup
In browser DevTools Console:
```javascript
// Clear all Clerk-related cookies
document.cookie.split(";").forEach(function(c) { 
  if(c.includes('__session') || c.includes('__client') || c.includes('__clerk')) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  }
});
// Reload the page
window.location.reload();
```

### 4. Clerk Dashboard Sign-Out
1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to "Sessions" tab
4. Find your session and revoke it

### 5. Update UserButton Configuration
The UserButton component has a deprecated `afterSignOutUrl` prop. Update it in `Navbar.tsx`:

```tsx
// Old (deprecated)
<UserButton afterSignOutUrl="/" />

// New (recommended)
<UserButton>
  <UserButton.MenuItems>
    <UserButton.Action label="Sign out" onClick={() => window.location.href = '/'} />
  </UserButton.MenuItems>
</UserButton>
```

### 6. Environment Variable Check
Ensure these are set correctly:
```bash
# In apps/admin/.env.local or root .env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/
```

### 7. Middleware Configuration
Add sign-out route to public routes in `middleware.ts`:
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/sign-out', // Add this
  // ... other routes
]);
```

### 8. Development Server Restart
Sometimes Clerk's dev mode gets stuck:
1. Stop the server (Ctrl+C)
2. Clear `.next` folder: `rm -rf apps/admin/.next`
3. Restart: `cd apps/admin && pnpm dev --turbopack`

## Immediate Workaround
If you need to test with different accounts quickly:

1. **Use different browsers** - Sign in with different accounts in Chrome, Firefox, Safari
2. **Use browser profiles** - Chrome/Edge support multiple profiles
3. **Use private/incognito windows** - Each window has isolated cookies

## Testing Sign-Out
After applying fixes, test sign-out:
1. Sign in at http://localhost:3007
2. Click user avatar → Sign out
3. Should redirect to home page
4. Verify you can't access protected routes like /dashboard

## If Nothing Works
As a last resort:
1. Stop all servers
2. Clear all browser data for localhost
3. Delete `apps/admin/.next` folder
4. Restart your computer (clears any stuck ports/processes)
5. Start fresh with `cd apps/admin && pnpm dev`