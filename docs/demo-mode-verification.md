# Demo Mode Verification Guide

## Overview
Demo mode uses mock GitHub data instead of real GitHub API calls to simulate different user roles and permissions.

## How to Tell if Demo Mode is Working

### 1. Visual Indicators

**Check the Navigation Bar:**
- Look for the **role chip** next to the user avatar (top right)
- In demo mode, this shows the role based on mock data:
  - **Red "admin" chip** = System administrator
  - **Blue "maintainer" chip** = Review group maintainer  
  - **Default "member" chip** = Team member
  - **"guest" chip** = No permissions

**Check the Dashboard:**
- Look for the **orange "DEMO MODE" chip** on the Personal Dashboard
- Should appear near your name/avatar on dashboard pages
- Located at `/dashboard` route

### 2. Test User Accounts

Demo mode recognizes these test email patterns with different permission levels:

| Email | Role | Permissions |
|-------|------|-------------|
| `superadmin+clerk_test@example.com` | Admin | Full system access, all review groups |
| `rg_admin+clerk_test@example.com` | RG Admin | ISBD maintainer, BCM member |
| `editor+clerk_test@example.com` | Editor | Member of ISBD and CAT groups |
| `author+clerk_test@example.com` | Author | ISBD member only |
| `translator+clerk_test@example.com` | Translator | No groups, project access only |
| `jphipps@madcreek.com` | Admin | Your real account with admin privileges |

### 3. Functional Tests

**Test Role-Based Navigation:**
1. Sign in with different test accounts
2. Verify menu items change based on role:
   - **Admin/Staff only**: GitHub Integration, Build Pipeline, Editorial Cycles
   - **All users**: Dashboard, Namespaces, Import, Translation, Review Queue

**Test Mock Data Loading:**
1. Navigate to `/dashboard`
2. Should see mock review groups and projects
3. No "GitHub rate limit" errors should appear
4. Data loads instantly (no API calls)

**Test Namespace Access:**
1. Go to `/namespaces`
2. Should see namespaces based on mock user's groups:
   - Superadmin: All namespaces
   - RG Admin: ISBD, ISBDM, BCM
   - Editor: ISBD, ISBDM, CAT
   - Author: ISBD only

### 4. Console Verification

Open browser DevTools console and check for:
- No GitHub API calls (network tab should not show requests to api.github.com)
- No authentication errors
- Mock data should be returned immediately

### 5. Environment Variable Check

```bash
# In your terminal, verify the environment variable is set
echo $NEXT_PUBLIC_IFLA_DEMO
# Should output: true
```

### 6. Quick Test Sequence

1. **Start the admin server:**
   ```bash
   cd apps/admin
   pnpm dev --turbopack
   ```

2. **Open browser to:** http://localhost:3007

3. **Sign in with a test account** (e.g., `editor+clerk_test@example.com`)

4. **Verify these indicators:**
   - [ ] Orange "DEMO MODE" chip on dashboard
   - [ ] Correct role chip in navbar (member/maintainer/admin)
   - [ ] Menu items match expected role permissions
   - [ ] Mock review groups appear in dashboard
   - [ ] No GitHub API errors in console
   - [ ] Namespace list matches mock user's access

## Troubleshooting

**Demo mode not activating:**
- Check `.env.local` has `NEXT_PUBLIC_IFLA_DEMO=true`
- Restart the dev server after changing environment variables
- Clear browser cache and cookies

**Wrong role showing:**
- Verify email matches one of the test patterns exactly
- Check `apps/admin/src/lib/github-mock-service.ts` for email mappings
- For custom emails, add them to the `mockDataByEmail` object

**GitHub API calls still happening:**
- Demo mode might not be fully implemented in all components
- Check for components that directly import GitHub services
- Look for `process.env.NEXT_PUBLIC_IFLA_DEMO` conditionals

## Common Issues

1. **"DEMO MODE" chip not visible**: Component may not check `isDemo` flag
2. **Real GitHub data loading**: Some routes may bypass demo mode check
3. **Role not updating**: Clerk cache may need clearing (sign out/in)
4. **Mock data not matching**: Check email pattern in `github-mock-service.ts`