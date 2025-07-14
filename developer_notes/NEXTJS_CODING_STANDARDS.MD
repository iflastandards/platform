## Hard and Fast Rules for Internal Link Handling with `basePath` in a Next.js Monorepo

When using a `basePath` (e.g., `/admin`) in your monorepo, especially with an LLM generating code, you must enforce strict conventions to avoid subtle routing bugs and ensure maintainability. Below are explicit rules to provide to your LLM for both page and API route handling.

### 1. **Always Use Next.js Routing Utilities for Internal Links**

- **Use `<Link>` and `next/router` for navigation between pages.**
  - Never use raw `<a href="...">` tags for internal navigation.
  - Always provide the path as if the app is deployed at the root (e.g., `/dashboard`, not `/admin/dashboard`).
  - Next.js will automatically prepend the `basePath` to all internal links when rendering[1][2][3].

### 2. **API Calls: Use Custom `addBasePath` Utility**

- **For all API calls (client and server):**
  - Use our custom `addBasePath` utility function: `fetch(addBasePath('/api/route'))`
  - Never use raw relative paths or manually prepend basePath
  - The utility automatically handles environment detection and basePath resolution

- **Import the utility:**
  ```javascript
  import { addBasePath } from '@ifla/theme/utils';
  ```

### 3. **Static Assets and Images: Use Custom `addBasePath` Utility**

- **For static assets (public folder) and images:**
  - Use our custom `addBasePath` utility function for all static assets
  - Never manually prepend basePath or use Next.js internal functions
  - The utility automatically handles environment detection (local/preview/production) using `DOCS_ENV` and `window.location`

- **Examples:**
  ```javascript
  import { addBasePath } from '@ifla/theme/utils';
  
  // Images
  <img src={addBasePath('/logo.png')} />
  <Image src={addBasePath('/images/hero.jpg')} />
  
  // Favicon in layout
  export const metadata = {
    icons: { icon: addBasePath('/favicon.ico') }
  };
  
  // API calls
  fetch(addBasePath('/api/request-invite'))
  ```

### 4. **Middleware and Matchers**

- **Write all middleware matchers as if the app is at the root.**
  - Do not include the `basePath` in matcher patterns; Next.js strips it before matching[7].
  - Never manually strip or add the basePath in middleware logic unless proxying to an external service that expects it.

### 5. **Never Hardcode the Base Path in Page or Link Definitions**

- Always write paths in code as if the app is at `/` (root), not `/admin` or any other subdirectory.
- If the basePath changes, your code should not require updates.

### 6. **Testing and Linting**

- Enforce lint rules to prevent usage of raw `<a>` tags for internal navigation.
- Add tests to verify that all internal links and API calls resolve correctly with the basePath set.

### 7. **Summary Table of Do’s and Don’ts**

| Scenario             | Do                                                           | Don’t                                                |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| Page Links           | `<Link href="/dashboard">`                                   | `<a href="/admin/dashboard">`                        |
| API Calls            | `fetch(addBasePath('/api/route'))`                           | `fetch("/admin/api/route")` or `fetch("/api/route")` |
| Static Assets/Images | `<img src={addBasePath('/logo.png')} />`                     | `<img src="/admin/logo.png" />` (manual prepending) |
| Middleware Matchers  | `matcher: "/dashboard/:path*"`                               | `matcher: "/admin/dashboard/:path*"`                 |

### 8. **Custom `addBasePath` Utility Implementation**

Our custom `addBasePath` utility provides environment-aware basePath handling:

- **Server-side**: Uses `DOCS_ENV` environment variable for environment detection
- **Client-side**: Uses `window.location` hostname detection  
- **Environments supported**: `local` (`/admin`), `preview` (`/platform/admin`), `production` (`/admin`)
- **Location**: `packages/theme/src/utils/addBasePath.ts`
- **Benefits**: No dependency on Next.js internals, environment-aware, integrates with existing `ADMIN_PORTAL_CONFIG`

### 9. **Special Cases**

- **If using custom wrappers or utilities for links or fetch:** Ensure they are basePath-aware and follow the above rules.
- **For NextAuth and third-party integrations:** Set environment variables like `NEXTAUTH_URL` to include the basePath if needed[8].

