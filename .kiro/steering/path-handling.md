---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.md']
---

# Path Handling Guidelines

## Critical Rules for All Developers

### Next.js Admin Portal (`/admin` basePath)

1. **NEVER hardcode the `/admin` basePath in any code**
2. **Always write paths as if the app is at the root**
3. **Always use the provided utilities for path handling**

```typescript
// ✅ CORRECT - Write paths without basePath
import Link from 'next/link';
<Link href="/dashboard">Dashboard</Link>

// ❌ INCORRECT - Never hardcode basePath
<a href="/admin/dashboard">Dashboard</a>
```

### API Calls and Static Assets

```typescript
// ✅ CORRECT - Use addBasePath utility
import { addBasePath } from '@ifla/theme/utils';
fetch(addBasePath('/api/users'))
<img src={addBasePath('/images/logo.png')} alt="Logo" />

// ❌ INCORRECT - Never hardcode paths
fetch('/admin/api/users')
<img src="/admin/images/logo.png" alt="Logo" />
```

### Environment-Aware URLs

1. **NEVER hardcode environment-specific URLs**
2. **Always use the configuration utilities**

```typescript
// ✅ CORRECT - Use environment-aware config
import { getSiteConfig } from '@ifla/theme/config';
const siteConfig = getSiteConfig('portal', process.env.DOCS_ENV);
const apiUrl = siteConfig.apiUrl;

// ❌ INCORRECT - Never hardcode environment URLs
const apiUrl = 'https://production-api.iflastandards.info';
```

### Cross-Site Navigation

```typescript
// ✅ CORRECT - Use SiteLink component
import { SiteLink } from '@ifla/theme/components';
<SiteLink to="/element/123" site="isbd">View in ISBD</SiteLink>

// ❌ INCORRECT - Never hardcode cross-site URLs
<a href="https://iflastandards.info/isbd/element/123">View in ISBD</a>
```

## Common Mistakes to Avoid

1. **Hardcoding basePath in tests** - Tests must use dynamic paths too
2. **Hardcoding URLs in documentation** - Use placeholders or environment variables
3. **Direct string concatenation** - Use proper utilities instead
4. **Forgetting basePath in API routes** - All API routes must account for basePath

## Quick Reference

| Context | Correct Approach | Incorrect Approach |
|---------|-----------------|-------------------|
| Next.js Links | `<Link href="/path">` | `<a href="/admin/path">` |
| API Calls | `fetch(addBasePath('/api/route'))` | `fetch('/admin/api/route')` |
| Static Assets | `addBasePath('/images/logo.png')` | `'/admin/images/logo.png'` |
| Cross-site Links | `<SiteLink to="/path" site="isbd">` | `<a href="https://site/path">` |
| Environment URLs | `getSiteConfig(site, env).baseUrl` | `'https://env-specific-url'` |