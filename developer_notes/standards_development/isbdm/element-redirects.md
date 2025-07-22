# Element Redirects Documentation

## Overview

This document explains how client-side redirects are implemented for ISBDM element pages to maintain backward compatibility with old URLs.

## Background

Previously, all elements were accessible under `/docs/elements/{id}`. Now elements are organized into four categories:
- `/docs/attributes/{id}`
- `/docs/statements/{id}` 
- `/docs/notes/{id}`
- `/docs/relationships/{id}` (including subdirectories like `/agents/`, `/nomens/`, etc.)

## Implementation

### 1. Redirect Plugin Configuration

The `@docusaurus/plugin-client-redirects` plugin is configured in `docusaurus.config.ts`:

```typescript
plugins: [
  'docusaurus-plugin-sass',
  [
    '@docusaurus/plugin-client-redirects',
    {
      redirects: [],
      createRedirects(existingPath) {
        // Check if this is an element path that needs redirection
        const elementMatch = existingPath.match(/^\/docs\/(attributes|statements|notes|relationships)\/(\d+)$/);
        if (elementMatch) {
          const elementId = elementMatch[2];
          // Create redirect from old elements path
          return [`/docs/elements/${elementId}`];
        }
        return undefined;
      },
    },
  ],
],
```

### 2. How It Works

The `createRedirects` function is called for each page during the build process. For element pages (those matching the pattern with a numeric ID), it returns the old `/docs/elements/{id}` path that should redirect to the current path.

### 3. Redirect Generation Script

The `scripts/generate-element-redirects.js` script can be used to analyze all MDX files and generate a comprehensive list of redirects. While not currently used in the build, it's useful for:
- Debugging redirect issues
- Generating static redirect rules for server-side redirects
- Verifying all elements are properly mapped

To run the script:
```bash
yarn generate-redirects
```

## Testing Redirects

1. Build the site: `yarn build`
2. Serve locally: `yarn serve`
3. Test old URLs like `http://localhost:3000/ISBDM/docs/elements/1022`
4. Verify they redirect to the new location like `http://localhost:3000/ISBDM/docs/attributes/1022`

## Notes

- Redirects are client-side only and require JavaScript
- For better SEO and non-JS browsers, consider adding server-side redirects on your hosting platform
- The redirects work with all locales (en, fr, es, de)