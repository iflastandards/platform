# Multi-Site Architecture for Docusaurus

## Overview

The IFLA Standards Platform manages multiple Docusaurus sites through a centralized shared theme package and coordinated build system. This architecture enables consistent branding and functionality across all documentation sites while allowing site-specific customization.

## Architecture Principles

### Centralized Theme System
- **Single Source of Truth**: `packages/theme/` contains all shared components and configuration
- **Site Independence**: Each site can override or extend shared functionality
- **Consistent Branding**: Unified design system across all IFLA sites
- **Development Efficiency**: Changes to shared components propagate to all sites

### Site Hierarchy
```
Portal (Main Hub)
├── Individual Standards
│   ├── ISBD (International Standard Bibliographic Description)
│   ├── ISBDM (ISBD for Manifestations)
│   ├── LRM (Library Reference Model)
│   ├── FRBR (Functional Requirements for Bibliographic Records)
│   ├── MULDICAT (Multilingual Dictionary of Cataloguing Terms)
│   └── UNIMARC (Universal MARC Format)
├── Admin Interface (Next.js)
└── System Documentation
```

## Shared Theme Package

### Core Components Location
**Path**: `packages/theme/src/components/`

Essential shared components:
- `VocabularyTable/` - Interactive vocabulary browser
- `NavigationCard/` - Standardized navigation elements
- `SearchBox/` - Site-wide search functionality
- `HeaderNav/` - Consistent navigation header
- `FooterLinks/` - Standardized footer

### Configuration Management
**Path**: `packages/theme/src/config/siteConfig.ts`

```typescript
export const siteConfig = {
  // Centralized URLs for cross-site linking
  urls: {
    portal: 'https://iflastandards.info',
    isbd: 'https://iflastandards.info/isbd',
    isbdm: 'https://iflastandards.info/isbdm',
    lrm: 'https://iflastandards.info/lrm',
    frbr: 'https://iflastandards.info/frbr',
    muldicat: 'https://iflastandards.info/muldicat',
    unimarc: 'https://iflastandards.info/unimarc',
    admin: 'https://admin.iflastandards.info',
  },
  
  // Shared default configurations
  defaults: {
    favicon: 'img/favicon.ico',
    organizationName: 'ifla',
    projectName: 'standards',
    trailingSlash: false,
    
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },
    
    // SEO defaults
    metadata: [
      { name: 'keywords', content: 'IFLA, library standards, cataloging, bibliography' },
      { name: 'author', content: 'International Federation of Library Associations' },
    ],
  },
  
  // Theme configuration shared across sites
  theme: {
    defaults: {
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      
      // Algolia search configuration
      algolia: {
        appId: 'IFLA_STANDARDS_SEARCH',
        apiKey: process.env.ALGOLIA_API_KEY,
        indexName: 'ifla-standards',
        contextualSearch: true,
      },
    },
    
    // Shared navigation structure
    navbar: {
      items: [
        {
          type: 'dropdown',
          label: 'Standards',
          position: 'left',
          items: [
            { label: 'ISBD', href: '/isbd' },
            { label: 'ISBDM', href: '/isbdm' },
            { label: 'LRM', href: '/lrm' },
            { label: 'FRBR', href: '/frbr' },
            { label: 'MULDICAT', href: '/muldicat' },
            { label: 'UNIMARC', href: '/unimarc' },
          ],
        },
        {
          href: 'https://github.com/ifla/standards',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  },
};
```

## Site-Specific Configuration Pattern

### Individual Site Setup
Each site inherits from shared configuration and adds customization:

```typescript
// standards/isbd/docusaurus.config.ts
import type { Config } from '@docusaurus/types';
import { siteConfig } from '@ifla/theme/config';

const config: Config = {
  // Inherit shared defaults
  ...siteConfig.defaults,
  
  // Site-specific identity
  title: 'ISBD - International Standard Bibliographic Description',
  tagline: 'Consolidated Edition 2024',
  url: siteConfig.urls.isbd,
  baseUrl: '/isbd/',
  
  // Site-specific navigation
  themeConfig: {
    ...siteConfig.theme.defaults,
    navbar: {
      title: 'ISBD',
      logo: {
        alt: 'ISBD Logo',
        src: 'img/isbd-logo.svg',
        srcDark: 'img/isbd-logo-dark.svg',
      },
      items: [
        // Site-specific navigation
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        // Inherit shared navigation
        ...siteConfig.theme.navbar.items,
      ],
    },
  },
};

export default config;
```

## Cross-Site Linking Strategy

### URL Management
All site URLs are centrally managed in `siteConfig.urls` for easy maintenance and consistency.

```typescript
// In any component
import { siteConfig } from '@ifla/theme/config';

function CrossSiteNavigation() {
  return (
    <nav>
      <Link href={siteConfig.urls.portal}>Documentation Hub</Link>
      <Link href={siteConfig.urls.isbd}>ISBD Standard</Link>
      <Link href={siteConfig.urls.admin}>Admin Interface</Link>
    </nav>
  );
}
```

### Inter-Site References
```mdx
<!-- In any MDX file -->
For related vocabulary terms, see the [MULDICAT dictionary]({siteConfig.urls.muldicat}/docs/terms).

The [ISBD standard]({siteConfig.urls.isbd}) provides detailed cataloging guidelines.
```

## Build System Integration

### Coordinated Builds
**Command**: `pnpm build:all`

The Nx build system coordinates all site builds:

```json
{
  "scripts": {
    "build:all": "nx run-many --target=build --all --parallel=3",
    "build:affected": "nx affected --target=build --parallel=3",
    "dev:servers": "nx run-many --target=start --projects=portal,isbd,isbdm,lrm,frbr,muldicat,unimarc --parallel=true"
  }
}
```

### Dependency Management
```json
// nx.json project configuration
{
  "projects": {
    "isbd": {
      "implicitDependencies": ["theme"],
      "tags": ["site:docusaurus", "scope:isbd"]
    },
    "theme": {
      "tags": ["scope:shared", "type:lib"]
    }
  }
}
```

## Development Workflow

### Local Development
Start all sites simultaneously:
```bash
pnpm dev:servers
```

Individual site development:
```bash
pnpm nx start isbd  # Starts ISBD site on port 3001
pnpm nx start portal # Starts portal on port 3000
```

### Theme Development
When working on shared components:

1. **Make changes** in `packages/theme/src/components/`
2. **Test across sites**: Changes automatically propagate to all running sites
3. **Run affected builds**: `pnpm build:affected` to verify all dependent sites

### Port Allocation
| Port | Service | URL |
|------|---------|-----|
| 3000 | Portal | `localhost:3000` |
| 3001 | ISBD | `localhost:3001` |
| 3002 | ISBDM | `localhost:3002` |
| 3003 | LRM | `localhost:3003` |
| 3004 | FRBR | `localhost:3004` |
| 3005 | MULDICAT | `localhost:3005` |
| 3006 | UNIMARC | `localhost:3006` |
| 3007 | Admin (Next.js) | `localhost:3007` |
| 3030 | System Docs | `localhost:3030` |

## Content Management

### Vocabulary Integration
Shared vocabulary components automatically adapt to site-specific content:

```typescript
// Site-specific vocabulary data
// standards/isbd/src/data/vocabulary.ts
export const isbdVocabulary: VocabularyTerm[] = [
  {
    id: 'area-0',
    term: 'Area 0',
    definition: 'Content form and media type area',
    category: 'structural',
    examples: ['[cartographic material]', '[electronic resource]'],
  },
  // ... more terms
];

// Usage in MDX
import { VocabularyTable } from '@ifla/theme/components';
import { isbdVocabulary } from '../data/vocabulary';

<VocabularyTable vocabulary={isbdVocabulary} />
```

### Cross-Site Content Sharing
```typescript
// packages/theme/src/data/sharedContent.ts
export const sharedContent = {
  about: {
    ifla: 'The International Federation of Library Associations...',
    mission: 'IFLA Standards promote...',
  },
  
  legal: {
    copyright: `Copyright © ${new Date().getFullYear()} IFLA. All rights reserved.`,
    license: 'Creative Commons Attribution 4.0 International License',
  },
};
```

## SEO and Analytics

### Shared SEO Configuration
```typescript
// packages/theme/src/config/seoConfig.ts
export const seoDefaults = {
  metadata: [
    { name: 'keywords', content: 'IFLA, library standards, cataloging, bibliography' },
    { name: 'author', content: 'International Federation of Library Associations' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'IFLA Standards' },
  ],
  
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'International Federation of Library Associations',
    url: 'https://iflastandards.info',
    sameAs: [
      'https://www.ifla.org',
      'https://twitter.com/ifla_org',
    ],
  },
};
```

### Site-Specific SEO
```typescript
// In site configuration
themeConfig: {
  metadata: [
    ...seoDefaults.metadata,
    { property: 'og:title', content: 'ISBD - International Standard Bibliographic Description' },
    { property: 'og:description', content: 'Official ISBD documentation and guidelines' },
  ],
}
```

## Deployment Strategy

### Multi-Site Deployment
All sites deploy to GitHub Pages from coordinated branches:

- **Preview Branch**: `preview` → Preview deployments
- **Production Branch**: `production` → Production deployments

### Build Optimization
```bash
# Build only changed sites (Nx optimization)
pnpm build:affected

# Build all sites for production
pnpm build:all --configuration=production
```

### Asset Optimization
Shared assets are optimized once and reused:
- **Images**: Processed and optimized in theme package
- **Fonts**: Loaded once, cached across sites
- **Icons**: SVG sprite system for consistent iconography

This multi-site architecture enables efficient management of the IFLA Standards Platform while maintaining consistency and allowing for site-specific customization.