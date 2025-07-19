# CLAUDE.md - Standards Documentation Sites Guide

This file provides guidance for Claude Code when working in the standards directory with Docusaurus sites.

## 📚 STANDARDS DIRECTORY CONTEXT - YOU ARE HERE!

You are working with **Docusaurus documentation sites** for IFLA standards. Each subdirectory is a complete Docusaurus v3.8 site.

### 🎯 Directory Purpose

This directory contains:
- **Individual standard sites** (isbd, isbdm, unimarc, frbr, lrm, etc.)
- **Shared Docusaurus configuration patterns**
- **Standard-specific content and customizations**
- **MDX documentation with global components**

---

## 🏗️ Site Structure Pattern

Each site follows this structure:
```
standards/{sitename}/
├── docs/                          # MDX documentation files
│   ├── intro.mdx                 # Introduction page
│   ├── about.mdx                 # About the standard
│   ├── elements/                 # Element documentation
│   │   ├── index.mdx            # Elements overview
│   │   └── {namespace}/         # Namespaced elements
│   ├── vocabularies/            # Vocabulary documentation
│   │   ├── index.mdx           # Vocabularies overview
│   │   └── {vocab}.mdx         # Individual vocabularies
│   └── examples.mdx            # Usage examples
├── src/
│   ├── components/              # Site-specific components
│   │   └── HomepageFeatures/  # Landing page features
│   ├── css/                    # Site-specific styles
│   │   └── custom.css         # Infima customizations
│   └── pages/                  # Additional pages
│       └── index.tsx          # Homepage
├── static/                     # Static assets
│   ├── img/                   # Images
│   └── data/                  # CSV vocabularies
├── docusaurus.config.ts       # Site configuration
├── sidebars.ts                # Sidebar configuration
├── project.json               # Nx project config
└── package.json               # Dependencies (empty)
```

---

## 📝 MDX Documentation Standards

### Using Global Components

All components from `@ifla/theme` are globally available:
```mdx
---
sidebar_position: 1
---

# Vocabulary Documentation

<VocabularyTable 
  csv="/data/vocabulary.csv"
  namespace="isbd"
  prefix="isbd"
/>

<CompactButton href="/elements">
  View Elements
</CompactButton>

<SeeAlso 
  links={[
    { href: "/intro", label: "Introduction" },
    { href: "/examples", label: "Examples" }
  ]} 
/>
```

### Component Availability
No imports needed! These are auto-registered:
- `VocabularyTable` - Multilingual vocabulary display
- `CompactButton` - Navigation buttons
- `ElementReference` - Cross-references
- `Figure` - Images with captions
- `InLink` - Internal navigation
- `OutLink` - External links
- `SeeAlso` - Related links
- `Mandatory` / `Unique` - Field indicators
- `ExampleTable` - Code examples
- And more...

---

## ⚙️ Docusaurus Configuration

### docusaurus.config.ts Pattern
```typescript
import type { Config } from '@docusaurus/types';
import { getDocusaurusConfig } from '@ifla/theme/config/docusaurus';
import { getSiteConfig } from '@ifla/theme/config/siteConfig';

const siteKey = 'isbd'; // Change for each site
const config = getSiteConfig()[siteKey];

export default {
  title: config.title,
  tagline: config.tagline,
  url: config.url,
  baseUrl: config.baseUrl,
  
  // CRITICAL: Prevents cross-site contamination
  future: {
    v4: true,
    experimental_faster: true,
  },
  
  // Site-specific customizations
  themeConfig: {
    navbar: {
      title: config.title,
      items: [
        // Navigation items
      ],
    },
  },
  
  // Custom fields for components
  customFields: {
    siteKey,
    vocabularyDefaults: {
      // Default vocabulary settings
    },
  },
} satisfies Config;
```

### Sidebar Configuration (sidebars.ts)
```typescript
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'about',
    {
      type: 'category',
      label: 'Elements',
      link: {
        type: 'doc',
        id: 'elements/index',
      },
      items: [
        'elements/namespace/element1',
        'elements/namespace/element2',
      ],
    },
    {
      type: 'category',
      label: 'Vocabularies',
      items: ['vocabularies/index', 'vocabularies/vocab1'],
    },
  ],
};

export default sidebars;
```

---

## 🎨 Styling with Infima

### Custom CSS (src/css/custom.css)
```css
/* Infima variable overrides */
:root {
  --ifla-color-primary: #2e8555;
  --ifla-color-primary-dark: #29784c;
  --ifla-color-primary-darker: #277148;
  --ifla-color-primary-darkest: #205d3b;
  
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  --ifla-color-primary: #25c2a0;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
}

/* Site-specific styles */
.hero--primary {
  --ifla-hero-background: linear-gradient(135deg, var(--ifla-color-primary) 0%, var(--ifla-color-primary-dark) 100%);
}
```

### Using Infima Utilities
```mdx
<div className="container margin-vert--lg">
  <div className="row">
    <div className="col col--6">
      <div className="card shadow--md padding--md">
        Content here
      </div>
    </div>
  </div>
</div>
```

---

## 🚀 Development Commands

All commands run from **repository root**:

```bash
# Start development server
nx start {sitename}         # e.g., nx start isbd
nx run {sitename}:start:robust  # With port cleanup

# Build site
nx build {sitename}

# Serve built site
nx serve {sitename}
nx run {sitename}:serve:robust  # With port cleanup

# Type check
nx typecheck {sitename}

# Lint
nx lint {sitename}

# Test (if tests exist)
nx test {sitename}
```

### Port Assignments
- portal: 3000
- isbdm: 3001
- lrm: 3002
- frbr: 3003
- isbd: 3004
- muldicat: 3005
- unimarc: 3006

---

## 📊 Vocabulary Management

### CSV Vocabulary Files
Store in `static/data/`:
```csv
Concept ID,Label (English),Label (French),Definition (English),Definition (French)
P1001,Title,Titre,The name of the resource,Le nom de la ressource
```

### Using in MDX
```mdx
<VocabularyTable 
  csv="/data/vocabulary.csv"
  namespace="isbd"
  prefix="isbd"
  languages={['en', 'fr']}
  defaultLanguage="en"
/>
```

### CSV Profile Support
For validation and export:
```mdx
<VocabularyTable 
  csv="/data/vocabulary.csv"
  csvProfile={{
    name: "IFLA Vocabulary Profile",
    version: "1.0",
    columns: {
      "Concept ID": { required: true },
      "Label (English)": { required: true }
    }
  }}
/>
```

---

## 🔗 Cross-Site Navigation

### Using SiteLink Component
For navigation between IFLA sites:
```tsx
import { getSiteConfig } from '@ifla/theme/config/siteConfig';

const siteUrls = getSiteConfig();

// In component
<a href={`${siteUrls.isbdm.url}/vocabularies`}>
  View ISBDM Vocabularies
</a>
```

### Environment Awareness
Sites automatically adapt to environment:
- Local: `http://localhost:3001`
- Preview: `https://iflastandards.github.io/platform/isbdm`
- Production: `https://www.iflastandards.info/isbdm`

---

## 🏭 Site Scaffolding

### Creating New Sites
```bash
pnpm tsx scripts/scaffold-site.ts \
  --siteKey=newsite \
  --title="New Standard" \
  --tagline="A new IFLA standard"
```

This creates:
- Complete Docusaurus structure
- Pre-configured with theme
- Example content
- Nx integration
- Port assignment

---

## 🐛 Common Issues

### Issue: Component not found in MDX
**Fix**: Component should be in theme package exports

### Issue: Broken navigation between sites
**Fix**: Use `getSiteConfig()` for dynamic URLs

### Issue: Styles not applying
**Fix**: Check Infima variable names and custom.css

### Issue: Build contamination
**Fix**: Ensure `experimental_faster: true` in config

### Issue: Port conflicts
**Fix**: Use `nx run {site}:start:robust`

---

## 📋 Site Development Checklist

When developing a documentation site:
- [ ] Use standard folder structure
- [ ] Configure with theme imports
- [ ] Set unique port in project.json
- [ ] Use global components (no imports needed)
- [ ] Follow Infima design system
- [ ] Test cross-site navigation
- [ ] Validate vocabulary CSVs
- [ ] Check responsive design
- [ ] Test in dark mode

---

## ♿ Accessibility Requirements (EU/GB Compliance)

### Legal Requirements
All documentation sites **MUST** comply with:
- **EU**: Web Accessibility Directive (WAD) 2016/2102 - WCAG 2.1 Level AA
- **UK**: Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018
- **Standard**: WCAG 2.1 Level AA minimum (working towards AAA where possible)

### Documentation Accessibility Standards

#### 1. **Semantic MDX Structure**
```mdx
---
sidebar_position: 1
---

# Main Heading (Only One per Page)

## Section Heading

### Subsection Heading

Use semantic headings in proper hierarchy. Never skip levels.

<article>
  <header>
    <h2>Article Title</h2>
  </header>
  <p>Article content...</p>
</article>
```

#### 2. **Accessible Components in MDX**
```mdx
<!-- ✅ CORRECT - Accessible table -->
<VocabularyTable 
  csv="/data/vocabulary.csv"
  namespace="isbd"
  prefix="isbd"
  aria-label="ISBD Vocabulary Terms"
/>

<!-- ✅ CORRECT - Accessible navigation -->
<CompactButton href="/elements">
  View Elements <span className="sr-only">for ISBD Standard</span>
</CompactButton>

<!-- ✅ CORRECT - Accessible figure -->
<Figure 
  src="/img/diagram.png" 
  alt="Detailed flowchart showing the relationship between ISBD elements and their hierarchical structure"
  caption="Figure 1: ISBD Element Relationships"
/>

<!-- ❌ WRONG - Missing accessibility -->
<img src="/img/diagram.png" />
<button onClick={() => navigate('/elements')}>View</button>
```

#### 3. **Language and Locale Support**
```mdx
<!-- For multilingual content -->
<div lang="fr">
  <h2>Titre en français</h2>
  <p>Contenu en français...</p>
</div>

<div lang="es">
  <h2>Título en español</h2>
  <p>Contenido en español...</p>
</div>

<!-- Using language-aware components -->
<VocabularyTable 
  languages={['en', 'fr', 'es', 'de']}
  defaultLanguage="en"
  showLanguageSelector={true}
/>
```

#### 4. **Keyboard Navigation Support**
```tsx
// In custom components
export function InteractiveCard({ title, onClick }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${title}`}
    >
      <h3>{title}</h3>
    </div>
  );
}
```

#### 5. **Color Contrast in Custom Styles**
```css
/* src/css/custom.css - WCAG AA compliant */
:root {
  /* Ensure 4.5:1 contrast ratio for normal text */
  --ifla-color-text: #1a1a1a;  /* on white: 19.5:1 ✓ */
  --ifla-color-text-secondary: #4a4a4a;  /* on white: 8.9:1 ✓ */
  
  /* Ensure 3:1 contrast for large text and UI */
  --ifla-color-primary: #0066cc;  /* on white: 5.4:1 ✓ */
  --ifla-color-link: #0052a3;  /* on white: 6.8:1 ✓ */
}

[data-theme='dark'] {
  /* Dark mode must also meet contrast requirements */
  --ifla-color-text: #f0f0f0;  /* on dark bg: 15.1:1 ✓ */
  --ifla-color-primary: #4da6ff;  /* on dark bg: 7.2:1 ✓ */
}
```

#### 6. **Accessible Tables and Lists**
```mdx
<!-- ✅ CORRECT - Accessible table -->
| Term | Definition | Usage |
|------|------------|-------|
| ISBD | International Standard Bibliographic Description | Cataloging standard |
| FRBR | Functional Requirements for Bibliographic Records | Conceptual model |

The table above shows common IFLA standards and their meanings.

<!-- For complex tables, use components -->
<table role="table">
  <caption>Comparison of IFLA Standards</caption>
  <thead>
    <tr>
      <th scope="col">Standard</th>
      <th scope="col">Year</th>
      <th scope="col">Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">ISBD</th>
      <td>2011</td>
      <td>Bibliographic description</td>
    </tr>
  </tbody>
</table>
```

#### 7. **Accessible Code Examples**
```mdx
<!-- Provide context for code blocks -->
The following example shows how to implement a vocabulary table:

```typescript
// VocabularyTable implementation with accessibility
<VocabularyTable 
  vocabularyId="content-types"
  title="Content Type Vocabulary"
  description="Types of content in bibliographic resources"
  // Accessibility features
  aria-label="Content types vocabulary with definitions"
  showLanguageSelector={true}
  defaultLanguage={userLocale}
/>
```

### Testing Documentation Accessibility

#### Automated Testing
```bash
# Install pa11y for accessibility testing
npm install -g pa11y

# Test a built site
nx build isbd
pa11y http://localhost:3004

# Test multiple pages
pa11y http://localhost:3004 http://localhost:3004/elements http://localhost:3004/vocabularies
```

#### Manual Testing Checklist
- [ ] Navigate entire site using only keyboard
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify all images have meaningful alt text
- [ ] Check heading hierarchy is logical
- [ ] Ensure links have descriptive text
- [ ] Verify color contrast in light and dark modes
- [ ] Test at 200% zoom
- [ ] Check language declarations
- [ ] Verify form labels and errors
- [ ] Test skip navigation links

### Accessibility Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [EU Web Accessibility Directive](https://eur-lex.europa.eu/eli/dir/2016/2102/oj)
- [UK Accessibility Regulations](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps)
- [Docusaurus Accessibility Guide](https://docusaurus.io/docs/accessibility)
- [MDX Accessibility Best Practices](https://mdxjs.com/guides/accessibility/)

---

## 💡 Best Practices

1. **Use MDX features** - Tabs, admonitions, code blocks
2. **Leverage global components** - No imports needed
3. **Follow Infima** - Consistent design system
4. **Test navigation** - Cross-site links work
5. **Validate content** - Check broken links
6. **Responsive first** - Mobile-friendly design
7. **Accessibility first** - WCAG 2.1 AA compliance
8. **Semantic HTML** - Proper structure and meaning
9. **Keyboard support** - All interactions keyboard accessible
10. **Screen reader friendly** - Meaningful labels and descriptions

---

## 🚨 BEFORE YOU CODE

Ask yourself:
- [ ] Am I in the repository root for commands?
- [ ] Is this component already in theme package?
- [ ] Am I using standard Docusaurus patterns?
- [ ] Have I checked the site's specific configuration?
- [ ] Will navigation work across environments?
- [ ] Is my content accessible to all users?
- [ ] Have I tested with keyboard navigation?
- [ ] Do all images have appropriate alt text?
- [ ] Are my color contrasts WCAG AA compliant?

Remember: **These are standard Docusaurus sites with shared theme components and must be accessible to everyone!**