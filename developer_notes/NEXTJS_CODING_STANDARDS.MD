# Next.js Coding Standards

## Core Rules for Next.js Development in the IFLA Standards Platform

These standards ensure consistent, maintainable code across the monorepo. The platform now serves from root without basePath configuration.

### 1. **Always Use Next.js Routing Utilities for Internal Links**

- **Use `<Link>` and `next/router` for navigation between pages.**
  - Never use raw `<a href="...">` tags for internal navigation.
  - Use standard paths starting with `/` (e.g., `/dashboard`, `/settings`).
  - Next.js Link component handles client-side navigation automatically.

### 2. **API Calls: Use Standard Fetch**

- **For all API calls (client and server):**
  - Use standard fetch with relative paths: `fetch('/api/route')`
  - Include proper headers and error handling
  - Use environment variables for external API endpoints

- **Examples:**
  ```javascript
  // Internal API
  const response = await fetch('/api/vocabularies');
  
  // External API
  const response = await fetch(process.env.NEXT_PUBLIC_EXTERNAL_API);
  ```

### 3. **Static Assets and Images**

- **For static assets (public folder) and images:**
  - Use standard paths starting with `/`
  - Leverage Next.js Image component for optimization
  - Store assets in the `public` folder

- **Examples:**
  ```javascript
  // Images
  <img src="/logo.png" alt="Logo" />
  <Image src="/images/hero.jpg" alt="Hero" width={1200} height={600} />
  
  // Favicon in layout
  export const metadata = {
    icons: { icon: '/favicon.ico' }
  };
  ```

### 4. **Middleware and Matchers**

- **Write middleware matchers for your route patterns:**
  - Use standard path patterns
  - Group related routes for efficiency
  - Exclude static files and Next.js internals

- **Example:**
  ```javascript
  export const config = {
    matcher: [
      "/((?!.+\\.[\\w]+$|_next).*)",
      "/",
      "/(api)(.*)"
    ]
  };
  ```

### 5. **Route Organization**

- Organize routes using Next.js App Router conventions
- Use route groups for logical organization without affecting URLs
- Implement proper loading and error boundaries

### 6. **Testing and Linting**

- Enforce lint rules to prevent usage of raw `<a>` tags for internal navigation.
- Add tests to verify that all internal links and API calls resolve correctly.
- Test both client-side and server-side navigation.

### 7. **Summary Table of Do's and Don'ts**

| Scenario             | Do                                                           | Don't                                                |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| Page Links           | `<Link href="/dashboard">`                                   | `<a href="/dashboard">` for internal navigation      |
| API Calls            | `fetch('/api/route')`                                        | Hard-code domain names                              |
| Static Assets/Images | `<img src="/logo.png" />`                                    | Use external CDN for local assets                   |
| Middleware Matchers  | `matcher: "/dashboard/:path*"`                               | Over-complicate matcher patterns                    |

### 8. **Environment Configuration**

- **Development**: Local development server runs on `http://localhost:3000`
- **Preview**: Preview deployments on Render.com
- **Production**: Production deployment at `https://admin.iflastandards.info`
- **API Endpoints**: Use environment variables for external services
- **Static Assets**: Served from `/public` directory

### 9. **Special Cases**

- **External API Integration:** Use environment variables for external API endpoints
- **Authentication:** Clerk handles auth routing automatically
- **File Uploads:** Use Next.js API routes with proper multipart handling

### 10. **TypeScript & Import Compliance Rules for Next.js**

#### **ALWAYS DO THIS**
- **Always use ES Module `import`/`export` syntax** for all TypeScript and React code
  ```typescript
  // ✅ CORRECT
  import { useState } from 'react';
  import { addBasePath } from '@ifla/theme/utils';
  import type { NextPage } from 'next';
  ```
- **Always follow workspace path aliases** as defined in `tsconfig.json`
- **Always use strict, explicit types** in all code—both production and test files
- **Always provide clear comment explaining any use of `any`** and tag for human review
  ```typescript
  // Using `any` here to handle third-party library with missing types. Review required.
  const externalData: any = await untyped3rdPartyLib.getData();
  ```
- **Always type Next.js API routes properly**
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  
  export async function GET(request: NextRequest): Promise<NextResponse> {
    // Typed implementation
  }
  ```
- **Always add JSDoc comments** for exported functions and components

#### **NEVER DO THIS**
- **Never use `require` for module imports**
  ```typescript
  // ❌ WRONG - Breaks Next.js optimization
  const config = require('./config');
  ```
- **Never import using deep paths** outside workspace aliases
  ```typescript
  // ❌ WRONG
  import util from '../../../packages/shared/src/utils/helper';
  // ✅ CORRECT
  import util from '@ifla/shared/utils/helper';
  ```
- **Never use `any` without documentation**, especially in:
  - API route handlers
  - Component props
  - Server/Client component boundaries
- **Never mix server and client code** without proper boundaries
  ```typescript
  // ❌ WRONG - Server code in client component
  'use client';
  import fs from 'fs'; // This will fail
  ```

### 11. **Next.js-Specific TypeScript Rules**

| Context | ✅ Always | ❌ Never |
|---------|-----------|----------|
| Page Components | Type with `NextPage` or `NextPageWithLayout` | Use untyped function components |
| API Routes | Use `NextRequest`/`NextResponse` types | Use plain `Request`/`Response` |
| Dynamic Routes | Type params: `{ params: { id: string } }` | Use untyped params |
| Metadata | Use `Metadata` type from `next` | Use plain objects |
| Server Actions | Mark with `'use server'` directive | Mix server/client code |

### 12. **Testing Next.js Code**

- **Always mock Next.js router in tests**
  ```typescript
  import { useRouter } from 'next/navigation';
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      pathname: '/dashboard'
    })
  }));
  ```
- **Test API routes with proper mocking**
  ```typescript
  const response = await fetch('/api/test');
  expect(response.status).toBe(200);
  ```
- **Always follow the AI Testing Instructions** at `@developer_notes/AI_TESTING_INSTRUCTIONS.md`

