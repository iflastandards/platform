# Environment Simplification Plan

## Current State Analysis
- **4 environments**: local, preview, development, production
- **Dual CI**: Development fork (jonphipps/standards-dev) + Preview repo (iflastandards/standards-dev)
- **Current workflow**: Work on local `dev` branch → push to fork for testing → push to origin for preview

## Proposed New Structure

### 1. Three Environments Only
- **local**: Development on your machine
- **preview**: Vercel-hosted previews from `iflastandards/platform`
- **production**: Final production deployment

### 2. New Repository Structure
```
iflastandards/platform
├── main (protected, empty initially)
└── preview (your working branch, monitored by Vercel)
```

### 3. Your Local Setup
```
standards-dev (keep current name)
├── dev (rename to 'preview' to match remote)
└── main (tracks platform/main)
```

## Step-by-Step Migration Plan

### Phase 1: Create New Repository
1. **Create `iflastandards/platform`**
   - Empty repository with protected `main` branch
   - Create `preview` branch as default working branch
   - Configure Vercel to monitor `preview` branch

### Phase 2: Update Configuration
2. **Simplify `siteConfig.ts`**
   - Remove `development` environment
   - Update `preview` URLs to point to Vercel domains
   - Keep `local` and `production` unchanged

### Phase 3: Local Repository Changes
3. **Update your local setup**
   - **DON'T rename your local repo** (keep `standards-dev`)
   - Rename your `dev` branch to `preview`
   - Add new remote pointing to `iflastandards/platform`
   - Remove the fork remote

### Phase 4: Vercel Configuration
4. **Setup Vercel**
   - Connect to `iflastandards/platform`
   - Monitor `preview` branch
   - Configure build settings for Nx monorepo

## Detailed Implementation

### Configuration Changes Needed

**Updated `siteConfig.ts` (removing development environment):**

```typescript
export type Environment = 'local' | 'preview' | 'production'; // Remove 'development'

// Update preview URLs to use Vercel domains
export const SITE_CONFIG: Record<SiteKey, Record<Environment, SiteConfigEntry>> = {
  portal: {
    local: { url: 'http://localhost:3000', baseUrl: '/', port: 3000 },
    preview: {
      url: 'https://platform-preview.vercel.app', // New Vercel domain
      baseUrl: '/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/' },
  },
  ISBDM: {
    local: { url: 'http://localhost:3001', baseUrl: '/ISBDM/', port: 3001 },
    preview: {
      url: 'https://platform-preview.vercel.app',
      baseUrl: '/ISBDM/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/ISBDM/' },
  },
  // ... similar updates for all sites
};

// Update admin portal config
export const ADMIN_PORTAL_CONFIG: Record<Environment, AdminPortalConfig> = {
  local: {
    url: 'http://localhost:3007/admin',
    signinUrl: 'http://localhost:3007/admin/auth/signin',
    dashboardUrl: 'http://localhost:3007/admin/dashboard',
    signoutUrl: 'http://localhost:3007/admin/api/auth/signout',
    sessionApiUrl: 'http://localhost:3007/admin/api/auth/session',
    port: 3007,
  },
  preview: {
    url: 'https://platform-preview.vercel.app/admin',
    signinUrl: 'https://platform-preview.vercel.app/admin/auth/signin',
    dashboardUrl: 'https://platform-preview.vercel.app/admin/dashboard',
    signoutUrl: 'https://platform-preview.vercel.app/admin/api/auth/signout',
    sessionApiUrl: 'https://platform-preview.vercel.app/admin/api/auth/session',
  },
  production: {
    url: 'https://www.iflastandards.info/admin',
    signinUrl: 'https://www.iflastandards.info/admin/auth/signin',
    dashboardUrl: 'https://www.iflastandards.info/admin/dashboard',
    signoutUrl: 'https://www.iflastandards.info/admin/api/auth/signout',
    sessionApiUrl: 'https://www.iflastandards.info/admin/api/auth/session',
  },
};
```

### Git Migration Commands

```bash
# 1. Rename your current dev branch to preview
git branch -m dev preview

# 2. Add new platform remote
git remote add platform git@github.com:iflastandards/platform.git

# 3. Remove fork remote (optional)
git remote remove fork

# 4. Push to new platform repository
git push -u platform preview

# 5. Create and push main branch
git checkout -b main
git push -u platform main
```

## Recommended Workflow

### Your New Daily Workflow
1. **Work locally** on `preview` branch
2. **Commit changes** (your messy history style is fine)
3. **Push to `platform/preview`** → triggers Vercel preview
4. **When ready for production**: merge `preview` → `main`

### Git Commands You'll Use
```bash
# Daily work
git add .
git commit -m "work in progress"
git push platform preview

# Production release
git checkout main
git merge preview
git push platform main
```

### Vercel Configuration

**Project Settings:**
- **Repository**: `iflastandards/platform`
- **Branch**: `preview` (for automatic deployments)
- **Build Command**: `pnpm build:all`
- **Output Directory**: `dist` (or wherever Nx outputs builds)
- **Install Command**: `pnpm install`

**Environment Variables:**
```
DOCS_ENV=preview
NODE_VERSION=22
```

**Build Settings for Nx Monorepo:**
```json
{
  "buildCommand": "npx nx run-many --target=build --all --parallel=3",
  "outputDirectory": "dist",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

## Benefits of This Approach

1. **Simpler**: Only 3 environments instead of 4
2. **No fork needed**: Direct push to organization repo
3. **Vercel integration**: Automatic previews on every push
4. **Nx optimization preserved**: No changes to build system
5. **Clean production**: Empty main branch for clean releases
6. **Your workflow preserved**: Keep working the way you prefer

## Risks and Considerations

1. **Nx Cloud**: May need to update workspace ID for new repo
2. **Environment detection**: Update logic in `getCurrentEnvironment()`
3. **CI workflows**: Need to update for new repository
4. **Vercel build**: Ensure it handles Nx monorepo correctly

## Files That Need Updates

### 1. Configuration Files
- `packages/theme/src/config/siteConfig.ts` - Remove development environment
- `nx.json` - May need workspace ID update
- `.github/workflows/*` - Update for new repository structure

### 2. Environment Detection Logic
Update `getCurrentEnvironment()` function:
```typescript
export function getCurrentEnvironment(): Environment {
  if (typeof window === 'undefined') {
    return 'local';
  }

  const { hostname } = window.location;

  if (hostname === 'standards.ifla.org' || hostname.includes('ifla.org')) {
    return 'production';
  }

  if (hostname.includes('vercel.app')) {
    return 'preview';
  }

  return 'local';
}
```

### 3. Test Files
- Update any tests that reference 'development' environment
- Update E2E tests that check environment-specific URLs

## Implementation Checklist

- [ ] Create `iflastandards/platform` repository
- [ ] Set up protected `main` branch
- [ ] Create `preview` branch
- [ ] Configure Vercel project
- [ ] Update `siteConfig.ts`
- [ ] Update environment detection logic
- [ ] Rename local `dev` branch to `preview`
- [ ] Add platform remote
- [ ] Push code to new repository
- [ ] Test Vercel deployment
- [ ] Update CI workflows
- [ ] Remove old remotes and repositories

## Next Steps

1. **Start with configuration changes** (update siteConfig.ts)
2. **Create the new repository structure**
3. **Set up Vercel integration**
4. **Migrate git configuration**
5. **Test end-to-end workflow**

The plan preserves your Nx optimizations while dramatically simplifying your environment management. Your local repo name can stay `standards-dev` - only the remote repository changes.