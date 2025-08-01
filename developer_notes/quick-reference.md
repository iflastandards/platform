# Quick Reference Guide

## Common Commands (Nx-Optimized)

### Building and Testing
```bash
# Build theme package
nx build @ifla/theme            # Nx command (recommended)
pnpm build:theme                 # Package.json shortcut

# Build specific site (Nx commands recommended)
nx build portal                  # Portal (port 3000)
nx build isbdm                   # ISBDM (port 3001)
nx build lrm                     # LRM (port 3002)
nx build frbr                    # FRBR (port 3003)
nx build isbd                    # ISBD (port 3004)
nx build muldicat                # Muldicat (port 3005)
nx build unimarc                 # Unimarc (port 3006)
nx build newtest                 # NewTest (port 3008)
nx build admin-portal            # Admin Portal (Next.js app, port 4200)

# Start development server with robust port cleanup (RECOMMENDED)
nx run portal:start:robust       # http://localhost:3000 (with port cleanup)
nx run isbdm:start:robust        # http://localhost:3001 (with port cleanup)
nx run lrm:start:robust          # http://localhost:3002 (with port cleanup)
nx run frbr:start:robust         # http://localhost:3003 (with port cleanup)

# Admin Portal (Next.js) development
nx dev admin-portal              # http://localhost:4200 (Next.js dev server)
nx serve admin-portal            # Serve built admin portal
pnpm dev:admin-portal            # Package.json shortcut for dev server
pnpm serve:admin-portal          # Package.json shortcut to serve built app

# Build/start all sites (Nx optimized)
nx run-many --target=build --all           # Build all sites in parallel
nx affected --target=build                 # Build only affected sites (faster)
nx run standards-dev:start-all:robust      # Start all sites with port cleanup
pnpm start:robust                          # Package.json shortcut for robust start

# Port management
pnpm ports:kill                  # Kill all project ports
pnpm ports:kill:verbose          # Kill all ports with details
pnpm ports:kill:site portal      # Kill specific site port

# Clear build artifacts
pnpm clear:all                   # Removes all .docusaurus and build folders
nx reset                         # Clear Nx cache
pnpm clear:webpack               # Clear webpack cache only

# Testing and validation (Nx optimized)
pnpm test                        # Run affected tests (Nx optimized)
nx test @ifla/theme              # Run theme tests only
nx test admin-portal             # Run admin portal tests (unit + integration)
nx affected --target=test:unit   # Run unit tests for affected projects
nx affected --target=test:integration # Run integration tests for affected projects
pnpm test:ui                     # Run vitest with UI
pnpm test:watch                  # Run tests in watch mode
pnpm typecheck                   # TypeScript checking (affected only)

# Admin Portal (Next.js) Testing
nx run admin-portal:test:unit        # Unit tests only (fast feedback)
nx run admin-portal:test:integration # Integration tests only (API interactions)
nx run admin-portal:test:watch       # Watch mode for TDD
nx run admin-portal:test:coverage    # With coverage reporting
nx run admin-portal:e2e              # E2E tests (uses newtest site)
pnpm test:admin-portal               # Package.json shortcut for all tests

# Deployment
pnpm deploy                      # Trigger GitHub Actions deployment
pnpm deploy:status               # Check deployment status

# Validation scripts
pnpm validate:site-links         # Validate all site links
pnpm validate:navigation         # Validate navigation URLs
pnpm validate:env-urls           # Validate environment URLs
```

### Site Management
```bash
# Create new site directory
mkdir standards/new-site
cd standards/new-site

# Install dependencies after adding new site
pnpm install

# Test site configuration
pnpm build:new-site
```

## Configuration Snippets

### Basic Site Setup
```typescript
// standards/new-site/docusaurus.config.ts
import { createStandardSiteConfig } from '@ifla/theme/config';

export default createStandardSiteConfig({
  siteKey: 'new-site',
  title: 'New Site Title',
  tagline: 'Site description',
  editUrl: 'https://github.com/iflastandards/new-site/tree/main/',
});
```

### Add Site to Core Config
```typescript
// packages/theme/src/config/siteConfigCore.ts
export const sites = {
  // ... existing sites
  'new-site': {
    localhost: { url: 'http://localhost:3000', baseUrl: '/new-site/' },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/new-site/' },
    production: { url: 'https://iflastandards.info', baseUrl: '/new-site/' }
  }
} as const;

export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'fr' | 'isbd' | 'muldicat' | 'unimarc' | 'new-site';
```

### Add Build Script
```json
// package.json (root) - use next available port
{
  "scripts": {
    "build:new-site": "docusaurus build standards/new-site",
    "start:new-site": "docusaurus start standards/new-site --port 3007"
  }
}
```

**Port assignments:** Portal:3000, ISBDM:3001, LRM:3002, FRBR:3003, ISBD:3004, MulDiCat:3005, UniMARC:3006, NewTest:3008

**Also update concurrent scripts:**
```json
{
  "build:all": "concurrently \"pnpm run build:portal\" \"pnpm run build:isbdm\" \"pnpm run build:lrm\" \"pnpm run build:fr\" \"pnpm run build:isbd\" \"pnpm run build:muldicat\" \"pnpm run build:unimarc\" \"pnpm run build:new-site\" \"pnpm run build:theme\"",
  "start:all": "concurrently \"docusaurus start portal --port 3000\" \"docusaurus start standards/ISBDM --port 3001\" \"docusaurus start standards/LRM --port 3002\" \"docusaurus start standards/FR --port 3003\" \"docusaurus start standards/isbd --port 3004\" \"docusaurus start standards/muldicat --port 3005\" \"docusaurus start standards/unimarc --port 3006\" \"docusaurus start standards/new-site --port 3007\""
}
```

## Common Customizations

### Custom Vocabulary
```typescript
vocabularyDefaults: {
  prefix: "custom",
  numberPrefix: "C", // C, E, P, T, etc.
  profile: "custom-values-profile.csv",
  elementDefaults: {
    uri: "https://www.iflastandards.info/CUSTOM/elements",
    profile: "custom-elements-profile.csv",
  }
}
```

### Custom Navigation
```typescript
// Custom navbar items
navbar: {
  items: [
    {
      type: 'dropdown',
      label: 'Documentation',
      position: 'left',
      items: [
        { type: 'doc', docId: 'intro', label: 'Introduction' },
        { type: 'doc', docId: 'guidelines', label: 'Guidelines' },
      ],
    },
  ],
}

// Navigation behavior
navigation: {
  hideCurrentSiteFromStandardsDropdown: true, // Hide this site from dropdown
  standardsDropdownPosition: 'right', // Move standards dropdown to right
  includeResourcesDropdown: false, // Remove resources dropdown
}

// Footer customization
footer: {
  useResourcesInsteadOfSites: true, // Replace "Sites" with "Resources"
  additionalResourceLinks: [
    { label: 'Custom Resource', href: 'https://example.com' },
  ],
}
```

### Redirects
```typescript
redirects: {
  redirects: [
    { from: '/old-path', to: '/new-path' },
  ],
  createRedirects: (existingPath: string) => {
    if (existingPath.includes('/elements/')) {
      return [existingPath.replace('/elements/', '/old-elements/')];
    }
    return undefined;
  },
}
```

## File Templates

### Package.json Template
```json
{
  "name": "@ifla/site-new-site",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "docusaurus": "docusaurus",
    "start": "docusaurus start",
    "build": "docusaurus build",
    "clear": "docusaurus clear",
    "serve": "docusaurus serve"
  },
  "dependencies": {
    "@ifla/theme": "workspace:*"
  },
  "browserslist": {
    "production": [">0.5%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

### Sidebars Template
```typescript
// sidebars.ts
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Documentation',
      items: ['doc1', 'doc2'],
    },
  ],
};

export default sidebars;
```

### CSS Template
```css
/* src/css/custom.css */
:root {
  --ifla-primary: #0066cc;
  --ifla-primary-dark: #0052a3;
  --ifla-primary-light: #1a75d1;
}

[data-theme='dark'] {
  --ifla-primary: #4da6ff;
  --ifla-primary-dark: #1a8cff;
  --ifla-primary-light: #66b3ff;
}
```

## Environment URLs

### Localhost (Development Servers)
- Portal: `http://localhost:3000/portal/` (pnpm start:portal)
- ISBDM: `http://localhost:3001/ISBDM/` (pnpm start:isbdm)
- LRM: `http://localhost:3002/LRM/` (pnpm start:lrm)
- fr: `http://localhost:3003/FR/` (pnpm start:fr)
- isbd: `http://localhost:3004/isbd/` (pnpm start:isbd)
- muldicat: `http://localhost:3005/muldicat/` (pnpm start:muldicat)
- unimarc: `http://localhost:3006/unimarc/` (pnpm start:unimarc)

### Preview (GitHub Pages)
- Portal: `https://iflastandards.github.io/standards-dev/portal/`
- ISBDM: `https://iflastandards.github.io/standards-dev/ISBDM/`
- LRM: `https://iflastandards.github.io/standards-dev/LRM/`
- FRBR: `https://iflastandards.github.io/standards-dev/FRBR/`
- isbd: `https://iflastandards.github.io/standards-dev/isbd/`
- muldicat: `https://iflastandards.github.io/standards-dev/muldicat/`
- unimarc: `https://iflastandards.github.io/standards-dev/unimarc/`

### Production
- Portal: `https://iflastandards.info/portal/`
- ISBDM: `https://iflastandards.info/ISBDM/`
- LRM: `https://iflastandards.info/LRM/`
- FRBR: `https://iflastandards.info/FRBR/`
- isbd: `https://iflastandards.info/isbd/`
- muldicat: `https://iflastandards.info/muldicat/`
- unimarc: `https://iflastandards.info/unimarc/`

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild theme
pnpm build:theme

# Clear Docusaurus cache
cd standards/site-name
pnpm clear

# Check for TypeScript errors
pnpm build:site-name
```

### Build Contamination Issues
If sites are getting incorrect footer links or configuration from other sites:

```bash
# First, try individual builds to verify configuration is correct
pnpm build:muldicat  # Should only have site-specific links

# If individual builds work but parallel builds don't:
pnpm build:all:sequential  # Use sequential builds as workaround

# Check for deep cloning issues in configuration
# Avoid JSON.parse(JSON.stringify()) in config files
# Use normal object spreading instead: {...config}
```

**Note**: Configuration contamination is usually caused by improper object cloning, not parallel builds themselves. See `developer_notes/build_contamination_investigation.md` for details.

### Import Errors
```bash
# Ensure theme is built
pnpm build:theme

# Check dependencies
pnpm install

# Verify imports in docusaurus.config.ts
```

### Navigation Issues
```typescript
// Debug environment detection
import { getCurrentEnv } from '@ifla/theme/config';
console.log('Environment:', getCurrentEnv());

// Debug URL generation
import { getSiteUrl } from '@ifla/theme/config';
console.log('Portal URL:', getSiteUrl('portal', '/', getCurrentEnv()));
```

## Testing Checklist

### New Site Checklist
- [ ] Added to `siteConfigCore.ts`
- [ ] Created directory structure
- [ ] Added `package.json`
- [ ] Created `docusaurus.config.ts` with factory
- [ ] Created `sidebars.ts`
- [ ] Added build script to root `package.json`
- [ ] Site builds successfully
- [ ] Site starts locally
- [ ] Navigation works (standards dropdown includes site)
- [ ] Cross-site links work
- [ ] Environment URLs resolve correctly

### Pre-Deployment Checklist
- [ ] All sites build successfully
- [ ] No broken links (or acceptable broken links documented)
- [ ] Environment-specific URLs work
- [ ] Navigation consistent across sites
- [ ] Theme styling applied correctly
- [ ] Mobile responsive
- [ ] Search functionality works

## Key Files to Remember

### Core Configuration
- `packages/theme/src/config/siteConfigCore.ts` - Site definitions
- `packages/theme/src/config/standardSiteFactory.ts` - Factory function
- `packages/theme/src/config/index.ts` - Main exports

### Site Structure
- `standards/site-name/docusaurus.config.ts` - Site configuration
- `standards/site-name/sidebars.ts` - Sidebar configuration
- `standards/site-name/package.json` - Dependencies
- `standards/site-name/src/css/custom.css` - Site-specific styles

### Root Configuration
- `package.json` - Build scripts
- `pnpm-workspace.yaml` - Workspace configuration
- `.github/workflows/` - Deployment workflows

## Additional Useful Scripts

### Language and Content Validation
```bash
# Check language tags in content
pnpm check:language-tags
pnpm check:language-tags:md      # Markdown output
pnpm check:language-tags:ai      # AI-friendly output

# Check for missing languages
pnpm check:languages
pnpm detect:language-mismatches

# Vocabulary comparison and validation
pnpm compare:vocabulary
pnpm compare:vocabulary:md       # Markdown output
pnpm compare:vocabulary:validate # Skip RDF checks
```

### Content Management
```bash
# Scaffold new standard
pnpm scaffold

# Google Sheets integration
pnpm sheets:import
pnpm sheets:export
pnpm sheet:create

# RDF processing
pnpm rdf:to-csv
pnpm rdf:folder-to-csv

# Vocabulary creation
pnpm vocabulary:create
```

### Linting and Formatting
```bash
# ESLint
pnpm lint
pnpm lint:fix
pnpm lint:mdx

# MDX formatting
pnpm format:mdx
```

## Common Patterns

### Simple Documentation Site
Use factory with minimal configuration - just title, tagline, and editUrl.

### Vocabulary-Heavy Site
Use factory with custom `vocabularyDefaults` for CSV processing and RDF generation.

### Complex Navigation Site
Use factory with custom `navbar.items` for dropdown menus and specialized sections.

### Legacy Site Migration
Use factory with `redirects` configuration to maintain old URL compatibility.

### Unique Requirements Site
Consider custom configuration (like portal) only if factory cannot accommodate needs.
