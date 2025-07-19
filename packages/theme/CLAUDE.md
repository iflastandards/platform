# CLAUDE.md - Theme Package Guide

This file provides comprehensive guidance for Claude Code when working in the packages/theme directory.

## 📦 THEME PACKAGE CONTEXT - YOU ARE HERE!

You are working in the **shared theme package** that provides global Docusaurus components for all IFLA documentation sites.

### 🎯 Package Purpose

This package provides:
- **Global Docusaurus components** that are auto-registered and available in all MDX files
- **Utility functions** (cn for className merging, addBasePath for admin app)
- **Type definitions** for vocabularies, standards, and component props
- **Site configuration** via `siteConfig.ts` for managing URLs across environments
- **Shared test infrastructure** with global mocks for Docusaurus

---

## 🏗️ Package Structure

```
packages/theme/
├── src/
│   ├── components/                 # Global Docusaurus components
│   │   ├── CompactButton/         # Navigation button
│   │   │   ├── index.tsx          # Component export
│   │   │   └── styles.module.scss # Component styles
│   │   ├── DownloadPanel/         # RDF download component
│   │   ├── ElementReference/      # Element cross-reference
│   │   ├── ElementSetCard/        # Element set display card
│   │   ├── ExampleTable/          # Example display table
│   │   ├── Figure/                # Figure with caption
│   │   ├── InLink/                # Internal navigation
│   │   ├── Mandatory/             # Mandatory field indicator
│   │   ├── NamespaceHub/          # Namespace navigation hub
│   │   ├── OutLink/               # External link component
│   │   ├── QuickStart/            # Quick start guide
│   │   ├── SeeAlso/               # Related links section
│   │   ├── SiteManagement/        # Site management panel
│   │   ├── SiteManagementLink/    # Management link variants
│   │   ├── Sitemap/               # Site navigation map
│   │   ├── Unique/                # Unique field indicator
│   │   ├── VocabularyCard/        # Vocabulary display card
│   │   ├── VocabularyTable/       # Complex multilingual table
│   │   ├── SiteLink.tsx           # Cross-site navigation
│   │   └── index.ts               # All component exports
│   ├── utils/                     # Utility functions
│   │   ├── basePath.ts            # addBasePath for admin
│   │   ├── cn.ts                  # className merging
│   │   └── index.ts               # Utils exports
│   ├── types/                     # TypeScript definitions
│   │   ├── google-sheets.ts       # Google Sheets types
│   │   └── index.ts               # All type exports
│   ├── config/                    # Configuration
│   │   ├── siteConfig.ts          # URL configuration
│   │   └── index.ts               # Config exports
│   ├── tests/                     # Test infrastructure
│   │   ├── __mocks__/             # Global Docusaurus mocks
│   │   ├── components/            # Component tests
│   │   ├── config/                # Config tests
│   │   ├── utils/                 # Utility tests
│   │   └── setup.ts               # Test setup
│   └── index.ts                   # Main package exports
├── package.json                   # Package configuration
├── tsconfig.json                 # TypeScript config
├── tsup.config.ts                # Build configuration
└── project.json                  # Nx project config
```

---

## 🎨 Docusaurus Component Standards

### Component Structure (MANDATORY)

Every component **MUST** follow this structure:
```
ComponentName/
├── index.tsx          # Component logic and export
└── styles.module.scss # Component styles (SCSS modules)
```

### Component Guidelines

1. **Folder/Index Pattern**: Always use folder with index.tsx
2. **Global Registration**: All components are auto-available in MDX
3. **SCSS Modules**: Use `.module.scss` for component isolation
4. **Infima Framework**: Use Infima CSS variables and utilities
5. **Simple Props**: MDX-compatible, serializable props only
6. **Documentation**: Always include user AND developer docs
7. **Testing**: Every component has tests in `src/tests/components/`

### Infima CSS Framework

We use Infima design system variables:
```scss
// Color variables
var(--ifla-color-primary)
var(--ifla-color-text)
var(--ifla-color-text-secondary)
var(--ifla-color-background)
var(--ifla-color-background-card)
var(--ifla-color-border)
var(--ifla-color-border-subtle)

// Spacing (use Infima utilities)
.margin--sm, .margin--md, .margin--lg
.padding--sm, .padding--md, .padding--lg

// Typography
.text--center, .text--left, .text--right
.text--primary, .text--secondary
```

### Example Component Structure

```tsx
// CompactButton/index.tsx
import React from 'react';
import InLink from '../InLink';
import styles from './styles.module.scss';

interface CompactButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function CompactButton({ href, children, className }: CompactButtonProps) {
  return (
    <InLink 
      href={href} 
      className={`button button--primary button--sm ${styles.compactButton} ${className || ''}`}
    >
      <span>{children}</span>
    </InLink>
  );
}

export default CompactButton;
```

```scss
// CompactButton/styles.module.scss
.compactButton {
  display: inline-block;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
```

---

## 📚 Component Documentation

### User Documentation
Every component should have user-facing documentation:
```mdx
# CompactButton

A navigation button for quick access to site sections.

## Usage

```mdx
import { CompactButton } from '@ifla/theme/components';

<CompactButton href="/vocabularies">
  View Vocabularies
</CompactButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| href | string | required | Navigation destination |
| children | ReactNode | required | Button content |
| className | string | '' | Additional CSS classes |
```

### Developer Documentation
Include implementation details in component README:
- Architecture decisions
- Integration patterns  
- Testing approach
- Performance considerations

---

## 🧪 Testing Infrastructure

### Global Test Setup

All tests use shared mocks from `src/tests/__mocks__/`:
```typescript
// Global mocks available to all tests
- @docusaurus/Link
- @docusaurus/useDocusaurusContext  
- @docusaurus/theme-common
- @theme/Tabs
- @theme/TabItem
- @theme/CodeBlock
- @theme/Heading
```

### Test Structure
```typescript
// src/tests/components/ComponentName.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ComponentName } from '@ifla/theme/components';
import { expect, describe, it, vi } from 'vitest';

describe('ComponentName', () => {
  it('renders with required props', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
  
  it('handles user interactions', async () => {
    // Test interactions
  });
});
```

### Running Tests
```bash
# All tests
nx test theme

# Watch mode
nx test theme --watch

# With UI
nx test theme --ui

# Coverage
nx test theme --coverage
```

---

## 🌍 Site Configuration

### siteConfig.ts
Central configuration for all site URLs:
```typescript
// Usage
import { getSiteConfig } from '@ifla/theme/config/siteConfig';

const config = getSiteConfig('production');
const portalUrl = config.portal.url;
```

### Environment Support
- `local`: Local development URLs
- `preview`: GitHub Pages staging
- `development`: Development environment
- `production`: Production URLs

---

## 📦 Major Components

### VocabularyTable
Most complex component with multilingual support:
- CSV import/export
- Language switching
- Filtering and search
- RDF metadata
- URI generation
- Extensive documentation

### SiteManagement
Central management interface:
- Site navigation grid
- GitHub integration
- Team management links

### ElementReference
Cross-reference component for linking between elements:
```mdx
<ElementReference 
  elements={['isbd:P1001', 'isbd:P1002']} 
  site="isbd" 
/>
```

### Figure
Accessible figure with caption:
```mdx
<Figure 
  src="/img/diagram.png" 
  alt="Architecture diagram"
  caption="Figure 1: System architecture"
/>
```

---

## 🛠️ Development Workflow

### Adding a New Component

1. **Create folder structure**:
   ```
   src/components/NewComponent/
   ├── index.tsx
   └── styles.module.scss
   ```

2. **Export from index.ts**:
   ```typescript
   // src/components/index.ts
   export { NewComponent } from './NewComponent';
   ```

3. **Add tests**:
   ```
   src/tests/components/NewComponent.test.tsx
   ```

4. **Document for users**:
   - Add to component README
   - Include MDX examples

5. **Build and test**:
   ```bash
   nx build theme
   nx test theme
   ```

### Modifying Components

1. **Check existing tests** before making changes
2. **Update documentation** if props change
3. **Test in a Docusaurus site** not just isolation
4. **Run full test suite** before committing

---

## 🐛 Common Issues & Solutions

### Issue: Component not available in MDX
**Fix**: Ensure exported from `src/components/index.ts`

### Issue: Styles not applying
**Fix**: Check SCSS module import and className usage

### Issue: Type errors in consuming sites
**Fix**: Run `nx build theme` to regenerate type definitions

### Issue: Test failures with Docusaurus imports
**Fix**: Check mocks in `__mocks__` directory are complete

### Issue: Changes not reflected in sites
**Fix**: Rebuild theme (`nx build theme`) and restart dev server

---

## 📋 Component Checklist

Before marking a component complete:
- [ ] Folder/index structure with SCSS module
- [ ] Exported from components/index.ts
- [ ] Props interface with JSDoc comments
- [ ] Tests with >80% coverage
- [ ] User documentation with examples
- [ ] Developer documentation if complex
- [ ] Works in MDX files
- [ ] Follows Infima design patterns
- [ ] Handles edge cases gracefully

---

## ♿ Accessibility Requirements (EU/GB Compliance)

### Legal Requirements
All components **MUST** comply with:
- **EU**: Web Accessibility Directive (WAD) 2016/2102 - WCAG 2.1 Level AA
- **UK**: Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018
- **Standard**: WCAG 2.1 Level AA minimum (working towards AAA where possible)

### Component Accessibility Standards

#### 1. **Semantic HTML Structure**
```tsx
// ✅ CORRECT - Semantic HTML
export function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  return (
    <article className={styles.card} aria-labelledby={`vocab-${vocabulary.id}`}>
      <header>
        <h2 id={`vocab-${vocabulary.id}`}>{vocabulary.name}</h2>
      </header>
      <div className={styles.content}>
        <p>{vocabulary.description}</p>
      </div>
      <footer>
        <CompactButton href={`/vocabularies/${vocabulary.id}`}>
          View Details <span className="sr-only">for {vocabulary.name}</span>
        </CompactButton>
      </footer>
    </article>
  );
}

// ❌ WRONG - Divs everywhere
export function VocabularyCard({ vocabulary }) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{vocabulary.name}</div>
      <div>{vocabulary.description}</div>
      <div onClick={() => navigate(`/vocabularies/${vocabulary.id}`)}>
        View Details
      </div>
    </div>
  );
}
```

#### 2. **Keyboard Navigation Support**
```tsx
// ✅ CORRECT - Full keyboard support
export function InteractiveElement({ onClick, children }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={styles.interactive}
      type="button"
    >
      {children}
    </button>
  );
}

// ❌ WRONG - Mouse only
export function InteractiveElement({ onClick, children }) {
  return (
    <div onClick={onClick} className={styles.interactive}>
      {children}
    </div>
  );
}
```

#### 3. **ARIA Labels and Descriptions**
```tsx
// ✅ CORRECT - Descriptive ARIA
export function DownloadPanel({ formats }: DownloadPanelProps) {
  return (
    <section aria-labelledby="download-heading" className={styles.panel}>
      <h2 id="download-heading" className="sr-only">
        Download Options
      </h2>
      <ul role="list" aria-label="Available download formats">
        {formats.map(format => (
          <li key={format.type} role="listitem">
            <a 
              href={format.url}
              download
              aria-label={`Download ${format.label} format, ${format.size}`}
            >
              {format.label}
              <span aria-hidden="true" className={styles.size}>
                ({format.size})
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

#### 4. **Color Contrast in SCSS**
```scss
// ✅ CORRECT - WCAG AA compliant
.button {
  // Ensure 4.5:1 contrast ratio
  color: #ffffff;
  background-color: #0066cc;  // Contrast: 5.4:1 ✓
  
  &:hover {
    background-color: #0052a3;  // Maintain contrast on hover
  }
  
  &:focus {
    outline: 3px solid #0066cc;
    outline-offset: 2px;
  }
}

// ❌ WRONG - Poor contrast
.button {
  color: #cccccc;
  background-color: #f0f0f0;  // Contrast: 1.5:1 ✗
}
```

#### 5. **Screen Reader Support**
```tsx
// ✅ CORRECT - Screen reader friendly
export function VocabularyTable({ concepts }: Props) {
  return (
    <div role="region" aria-label="Vocabulary concepts">
      <table role="table">
        <caption className="sr-only">
          List of vocabulary concepts with definitions
        </caption>
        <thead>
          <tr>
            <th scope="col">Term</th>
            <th scope="col">Definition</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {concepts.map(concept => (
            <tr key={concept.id}>
              <th scope="row">{concept.term}</th>
              <td>{concept.definition}</td>
              <td>
                <button aria-label={`Edit ${concept.term}`}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Testing Component Accessibility

#### In Component Tests
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Component Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      React.createElement(VocabularyCard, { vocabulary: mockData })
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('is keyboard navigable', async () => {
    const { getByRole } = render(
      React.createElement(CompactButton, { href: "/test" }, "Test")
    );
    const button = getByRole('link');
    
    // Should be focusable
    button.focus();
    expect(document.activeElement).toBe(button);
  });
});
```

### Accessibility Checklist for Components
- [ ] Uses semantic HTML elements
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels for complex interactions
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators clearly visible
- [ ] Screen reader announcements work
- [ ] No information conveyed by color alone
- [ ] Works at 200% zoom
- [ ] Tested with axe-core
- [ ] Manual keyboard navigation tested

---

## 💡 Best Practices

1. **Keep props simple** - MDX compatibility is crucial
2. **Use Infima variables** - Consistent theming
3. **Test in real sites** - Not just unit tests
4. **Document everything** - Users and developers
5. **Global mocks only** - No local test mocks
6. **SCSS modules always** - Component isolation
7. **Semantic HTML** - Accessibility first

---

## 🚨 BEFORE YOU CODE

Ask yourself:
- [ ] Am I following the folder/index pattern?
- [ ] Will this work in MDX files?
- [ ] Have I checked existing components for patterns?
- [ ] Am I using Infima CSS variables?
- [ ] Is this documented for users AND developers?
- [ ] Have I added comprehensive tests?

Remember: **Every component is globally available to all Docusaurus sites!**