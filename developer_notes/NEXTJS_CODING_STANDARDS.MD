## Hard and Fast Rules for Internal Link Handling with `basePath` in a Next.js Monorepo

When using a `basePath` (e.g., `/admin`) in your monorepo, especially with an LLM generating code, you must enforce strict conventions to avoid subtle routing bugs and ensure maintainability. Below are explicit rules to provide to your LLM for both page and API route handling.

### 1. **Always Use Next.js Routing Utilities for Internal Links**

- **Use `<Link>` and `next/router` for navigation between pages.**
  - Never use raw `<a href="...">` tags for internal navigation.
  - Always provide the path as if the app is deployed at the root (e.g., `/dashboard`, not `/admin/dashboard`).
  - Next.js will automatically prepend the `basePath` to all internal links when rendering[1][2][3].

### 2. **API Calls: Always Reference the Base Path Explicitly**

- **When making API calls from the client:**
  - Use relative paths (e.g., `/api/route`) so that the browser includes the `basePath` automatically.
  - Never hardcode the `basePath` in the fetch URL; let the browser resolve it.

- **When making API calls from the server (e.g., getServerSideProps, server components):**
  - You must prepend the `basePath` to the API route (e.g., `/admin/api/route`), as the server does not know about the browser's current path context[4][5].
  - Consider centralizing the base path in a utility constant to avoid duplication and mistakes.

### 3. **Static Assets and Images**

- **For static assets (public folder) and images:**
  - Manually prepend the `basePath` to asset URLs when using `<img>` or Next.js `<Image>` components (e.g., `/admin/logo.png` if your basePath is `/admin`)[1][6].
  - Do not assume Next.js will add the basePath for static assets.

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
| API Calls (Client)   | `fetch("/api/route")`                                        | `fetch("/admin/api/route")`                          |
| API Calls (Server)   | `fetch(\`\${basePath}/api/route\`)`              | `fetch("/api/route")` (will miss basePath) |                                                      |
| Static Assets/Images | `<img src="/admin/logo.png" />`                              | `<img src="/logo.png" />` (will break with basePath) |
| Middleware Matchers  | `matcher: "/dashboard/:path*"`                               | `matcher: "/admin/dashboard/:path*"`                 |

### 8. **Special Cases**

- **If using custom wrappers or utilities for links or fetch:** Ensure they are basePath-aware and follow the above rules.
- **For NextAuth and third-party integrations:** Set environment variables like `NEXTAUTH_URL` to include the basePath if needed[8].

