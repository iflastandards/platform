# IFLA Standards Platform - Architectural Analysis Report

**Date**: July 13, 2025  
**Analyst**: Architecture Review Team  
**Scope**: Complete codebase analysis including architecture, code quality, security, and performance

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Architectural Analysis](#architectural-analysis)
4. [Code Quality Assessment](#code-quality-assessment)
5. [Component Coupling & Dependencies](#component-coupling--dependencies)
6. [Security Analysis](#security-analysis)
7. [Performance Analysis](#performance-analysis)
8. [Recommendations & Roadmap](#recommendations--roadmap)
9. [Technical Debt Register](#technical-debt-register)
10. [Appendices](#appendices)

---

## Executive Summary

The IFLA Standards platform is a well-architected monorepo leveraging modern JavaScript frameworks and tooling. Built on Nx for build orchestration, it combines Docusaurus for documentation sites with a Next.js admin portal. While the foundation is solid, the analysis identified opportunities for improvement in type safety, performance optimization, security hardening, and modular architecture.

### Key Metrics
- **Codebase Size**: ~50,000 lines of TypeScript/JavaScript
- **Applications**: 1 admin portal + 7 documentation sites
- **Shared Packages**: 2 (theme, standards-cli)
- **Test Coverage**: ~75% (estimated from test files)
- **Linting Issues**: 44 warnings (0 errors)
- **TypeScript Coverage**: ~85% (19 `any` types found)

### Overall Health Score: B+ (Good with room for improvement)

---

## Project Overview

### Technology Stack

#### Core Frameworks
- **Monorepo Management**: Nx 20.3.0
- **Package Manager**: PNPM 9.15.2
- **Language**: TypeScript 5.8.3
- **Runtime**: Node.js (version unspecified)

#### Frontend Technologies
- **Documentation Sites**: Docusaurus 3.8.1
- **Admin Portal**: Next.js 15.2.4
- **UI Framework**: React 19.1.0
- **Component Library**: Material-UI 7.2.0
- **Styling**: Tailwind CSS + SASS/SCSS

#### Backend & Services
- **Authentication**: Clerk
- **Authorization**: Cerbos (RBAC)
- **API Integration**: GitHub API, Google Sheets API
- **AI Integration**: Anthropic SDK, MCP servers

#### Development Tools
- **Testing**: Vitest, Playwright, Jest
- **Linting**: ESLint with custom configuration
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions + Nx Cloud

### Project Structure

```
standards-dev/
├── apps/
│   ├── admin/          # Next.js admin portal
│   └── ...            # Other apps
├── standards/          # Docusaurus documentation sites
│   ├── portal/
│   ├── isbdm/
│   ├── lrm/
│   ├── frbr/
│   └── ...
├── packages/
│   ├── theme/          # Shared UI components and utilities
│   └── standards-cli/  # Command-line tools
├── scripts/            # Build and utility scripts
├── e2e/               # End-to-end tests
└── developer_notes/   # Technical documentation
```

---

## Architectural Analysis

### 1. System Architecture

#### High-Level Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Documentation  │     │      Admin      │     │    External     │
│     Sites       │     │     Portal      │     │    Services     │
│  (Docusaurus)   │     │   (Next.js)     │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────┬───────────┘                         │
                     │                                     │
         ┌───────────▼───────────┐                         │
         │    Theme Package      │                         │
         │  (Shared Components)  │                         │
         └───────────────────────┘                         │
                                                          │
         ┌───────────────────────────────────────────────▼────────┐
         │                    Infrastructure                      │
         │  (Nx Build System, GitHub Actions, Vercel Hosting)    │
         └────────────────────────────────────────────────────────┘
```

#### Key Architectural Decisions

1. **Monorepo Strategy**
   - **Decision**: Nx-based monorepo
   - **Rationale**: Code sharing, consistent tooling, atomic commits
   - **Trade-offs**: Complexity, longer CI times, steeper learning curve

2. **Framework Choices**
   - **Docusaurus**: Optimized for technical documentation
   - **Next.js**: Modern React framework with SSR/SSG capabilities
   - **Material-UI**: Comprehensive component library with theming

3. **Authentication & Authorization**
   - **Clerk**: Managed authentication service
   - **Cerbos**: Fine-grained RBAC with policy-as-code
   - **Pattern**: Middleware-based auth checks

4. **Build & Deployment**
   - **Nx**: Task orchestration and caching
   - **Nx Cloud**: Distributed builds and remote caching
   - **Vercel**: Hosting platform (presumed from Next.js)

### 2. Component Architecture

#### Admin Portal Architecture
```
admin/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authenticated routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout with providers
├── components/            # UI components
│   ├── common/           # Shared components
│   ├── layout/           # Layout components
│   └── vocabulary/       # Domain-specific components
├── lib/                  # Business logic
│   ├── auth/            # Authentication utilities
│   ├── mock-data/       # Development data
│   └── utils/           # Helper functions
└── test/                # Test suites
```

#### Theme Package Architecture
```
theme/
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── config/         # Shared configuration
│   └── theme/          # Theming and styles
├── dist/               # Build output
└── tsup.config.ts      # Build configuration
```

### 3. Data Flow Architecture

#### Authentication Flow
```
User → Clerk Auth → Middleware → Protected Route → Cerbos Check → Resource Access
```

#### Configuration Flow
```
Theme Package (siteConfig) → Admin App → Dynamic Site Selection → Environment-based URLs
```

#### Build Flow
```
Source Code → Nx Affected → Parallel Builds → Cache Check → Output → Deploy
```

---

## Code Quality Assessment

### 1. Linting Analysis Summary

**Total Issues**: 44 warnings (0 errors)

#### Issue Breakdown by Type:
| Issue Type | Count | Severity |
|------------|-------|----------|
| `@typescript-eslint/no-explicit-any` | 19 | Medium |
| `unused-imports/no-unused-vars` | 23 | Low |
| Unused eslint-disable directives | 2 | Low |

#### Most Affected Files:
1. `/apps/admin/src/lib/mock-data/` - 8 issues (heavy use of `any`)
2. `/apps/admin/src/test/` - 12 issues (test utilities with loose typing)
3. `/apps/admin/src/app/` - 6 issues (component props and event handlers)

### 2. Code Patterns Analysis

#### Good Patterns Observed

**1. Component Organization**
```typescript
// Well-structured component with clear props
interface NamespaceDashboardProps {
  namespace: string;
  userId?: string;
  isDemo?: boolean;
}

export default function NamespaceDashboard({ 
  namespace, 
  userId: _userId = 'user-admin-1',
  isDemo: _isDemo = false 
}: NamespaceDashboardProps) {
  // Component logic
}
```

**2. Custom Hooks Pattern**
```typescript
// Reusable hook for previous value tracking
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

**3. Mock Data Structure**
```typescript
// Well-typed mock data interfaces
export interface MockActivityLog {
  id: string;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: string;
  causer_type: string;
  causer_id: string;
  properties: {
    old?: any;  // Should be properly typed
    new?: any;  // Should be properly typed
    attributes?: any;  // Should be properly typed
  };
  created_at: string;
}
```

#### Anti-Patterns Identified

**1. Excessive Use of `any`**
```typescript
// Bad: Using any type
const renderIssueCard = (issue: any) => {
  // Logic
};

// Good: Define proper interface
interface Issue {
  id: string;
  title: string;
  number: number;
  state: 'open' | 'closed';
  labels: Label[];
}

const renderIssueCard = (issue: Issue) => {
  // Logic
};
```

**2. Unused Variables Not Following Convention**
```typescript
// Bad: Unused variable without underscore
const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

// Good: Prefix with underscore if intentionally unused
const [_selectedIssue, setSelectedIssue] = useState<string | null>(null);
```

**3. Large Component Files**
- `NamespaceDashboard.tsx`: 500+ lines (should be split)
- `ProfilesManager.tsx`: 400+ lines (needs refactoring)

### 3. Testing Patterns

#### Test Coverage Analysis
- **Unit Tests**: Limited component testing
- **Integration Tests**: Comprehensive RBAC and auth testing
- **E2E Tests**: Playwright tests for critical flows
- **Mock Infrastructure**: Well-implemented test utilities

#### Example Test Pattern
```typescript
describe('RBAC Implementation', () => {
  it('should check vocabulary edit permissions', async () => {
    mockCerbos.isAllowed.mockResolvedValueOnce(true);
    
    const canEdit = await mockCerbos.isAllowed({
      principal: {
        id: 'editor-123',
        roles: ['namespace-editor:ISBD'],
      },
      resource: {
        kind: 'vocabulary',
        id: 'vocab-456',
        attributes: {
          namespace: 'ISBD',
          status: 'draft',
        },
      },
      action: 'edit',
    });
    
    expect(canEdit).toBe(true);
  });
});
```

### 4. TypeScript Usage

#### Coverage Metrics
- **Files with TypeScript**: ~95%
- **Strict Mode**: Enabled
- **Type Coverage**: ~85% (due to `any` usage)

#### Type Definition Quality
```typescript
// Good: Well-defined types
export type Environment = 'local' | 'preview' | 'production';
export type SiteKey = 'portal' | 'isbdm' | 'lrm' | 'frbr' | 'unimarc' | 'isbd' | 'muldicat';

// Bad: Loose typing in mock data
properties: {
  old?: any;
  new?: any;
  attributes?: any;
  [key: string]: any;
}
```

---

## Component Coupling & Dependencies

### 1. Dependency Graph

```
┌─────────────┐
│   Admin     │──────depends on──────┐
└─────────────┘                      │
                                     ▼
┌─────────────┐                ┌─────────────┐
│   Sites     │────────────────│   Theme     │
└─────────────┘                └─────────────┘
       │                              │
       └──────depends on──────────────┘

Legend:
- Admin imports: config from theme
- Sites import: components, utils, config from theme
- Theme: self-contained, no external package dependencies
```

### 2. Shared Dependencies Analysis

#### Duplicated Dependencies
```json
// Both admin and theme have:
"@mui/material": "^7.2.0",
"@mui/icons-material": "^7.2.0",
"@emotion/react": "^11.14.0",
"@emotion/styled": "^11.14.1"
```

**Impact**: 
- Potential bundle size increase
- Version synchronization challenges
- Maintenance overhead

### 3. Coupling Analysis

#### Tight Coupling Points
1. **Configuration Coupling**
   - Admin depends on theme's `siteConfig.ts`
   - Changes affect multiple packages

2. **Type Coupling**
   - Shared types create implicit contracts
   - No dedicated types package

3. **Component Coupling**
   - Direct imports from theme package
   - No abstraction layer

#### Loose Coupling Achievements
1. **No Circular Dependencies**: Clean dependency flow
2. **Clear Module Boundaries**: Well-defined package exports
3. **Build Independence**: Packages can build separately

### 4. Import Analysis

```typescript
// Admin imports from theme:
import { SITE_CONFIG, Environment } from '@ifla/theme/config/siteConfig';

// Sites import from theme:
import { VocabularyTable } from '@ifla/theme';
import { InLink, OutLink } from '@ifla/theme';
import { getSiteConfig } from '@ifla/theme/config/siteConfig';
```

### 5. Recommendations for Decoupling

1. **Extract Shared Types**
   ```
   packages/
   ├── types/           # New package for shared types
   ├── ui-kit/          # Extract UI components
   ├── config/          # Configuration management
   └── theme/           # Docusaurus-specific components
   ```

2. **Implement Dependency Injection**
   ```typescript
   // Instead of direct imports
   import { SITE_CONFIG } from '@ifla/theme/config/siteConfig';
   
   // Use dependency injection
   interface ConfigProvider {
     getSiteConfig(): SiteConfig;
   }
   ```

3. **Create API Contracts**
   ```typescript
   // Define clear interfaces between packages
   export interface ThemeAPI {
     components: ComponentLibrary;
     config: ConfigurationAPI;
     utils: UtilityFunctions;
   }
   ```

---

## Security Analysis

### 1. Authentication & Authorization

#### Clerk Integration (Authentication)
**Implementation Quality**: ✅ Good

```typescript
// Proper middleware implementation
export async function middleware(request: NextRequest) {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  
  if (!userId) {
    return redirectToSignIn();
  }
  
  // Additional checks...
}
```

**Strengths**:
- Middleware-based protection
- Session management
- User context extraction

**Weaknesses**:
- No rate limiting visible
- Missing brute force protection
- No MFA enforcement configuration

#### Cerbos RBAC (Authorization)
**Implementation Quality**: ✅ Good

```typescript
// Well-structured permission checks
const canEdit = await cerbos.isAllowed({
  principal: {
    id: userId,
    roles: userRoles,
  },
  resource: {
    kind: 'vocabulary',
    id: resourceId,
    attributes: resourceAttributes,
  },
  action: 'edit',
});
```

**Role Hierarchy**:
```
ifla-admin (super admin)
├── namespace-admin:{namespace}
│   ├── namespace-reviewer:{namespace}
│   ├── namespace-editor:{namespace}
│   └── namespace-translator:{namespace}
└── site-admin:{site}
    └── site-editor:{site}
```

### 2. Security Vulnerabilities

#### Critical Issues

**1. Missing Security Headers** 🔴
```typescript
// Not found in codebase
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

**2. Cerbos TLS Disabled** 🔴
```typescript
// Current implementation
const cerbos = new GRPC('localhost:3593', { tls: false });

// Should be
const cerbos = new GRPC(
  process.env.CERBOS_URL || 'localhost:3593',
  { tls: process.env.NODE_ENV === 'production' }
);
```

**3. CSRF Protection Unclear** 🟡
- Tests reference CSRF tokens but implementation not visible
- Clerk may handle this, needs verification

#### Medium Priority Issues

**1. Input Validation Gaps** 🟡
```typescript
// Current: Manual validation
if (!spreadsheetUrl || typeof spreadsheetUrl !== 'string') {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}

// Better: Schema validation
const schema = z.object({
  spreadsheetUrl: z.string().url().regex(/^https:\/\/docs\.google\.com/),
  namespace: z.string().min(1).max(50),
});
```

**2. Environment Variable Security** 🟡
- No clear separation of public/private vars
- Missing validation for required env vars

### 3. API Security

#### Good Practices
- Authentication required for all API routes
- Proper HTTP status codes
- Generic error messages (no stack traces)

#### Areas for Improvement
- No API rate limiting
- Missing request size limits
- No API versioning strategy
- CORS configuration incomplete

### 4. Data Security

#### Strengths
- No hardcoded secrets found
- Proper use of environment variables
- Good separation of mock/real data

#### Concerns
- No data encryption at rest mentioned
- No audit logging for sensitive operations
- Missing data retention policies

### 5. Security Recommendations

#### Immediate Actions (Critical)
1. Implement security headers in middleware
2. Enable TLS for Cerbos in production
3. Add CSRF protection explicitly
4. Implement rate limiting

#### Short-term Improvements
1. Add Zod validation for all API inputs
2. Implement audit logging
3. Add security monitoring
4. Create security documentation

#### Long-term Enhancements
1. Implement WAF rules
2. Add penetration testing
3. Create incident response plan
4. Implement secret rotation

---

## Performance Analysis

### 1. Build Performance

#### Nx Build Optimization
**Configuration Quality**: ✅ Excellent

```json
{
  "parallel": 8,
  "cacheDirectory": ".nx/cache",
  "defaultBase": "main",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": ["default", "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?"]
  }
}
```

**Metrics**:
- Parallel execution: Up to 8 tasks
- Cache hit rate: Not measured
- Average build time: ~2-3 minutes (estimated)

### 2. Runtime Performance

#### Bundle Size Analysis 🔴
**First Load JS by Route**:
| Route | Size | Status |
|-------|------|--------|
| `/` | 101 kB | ⚠️ High |
| `/admin` | 153 kB | 🔴 Too High |
| `/dashboard` | 182 kB | 🔴 Too High |
| `/namespaces/[namespace]` | 200 kB | 🔴 Too High |

**Issues**:
- No code splitting implemented
- Large vendor bundles
- Missing tree shaking optimization

#### Rendering Strategy Issues 🔴

```typescript
// Excessive use of force-dynamic
export const dynamic = 'force-dynamic';
```

**Problems**:
- Almost all pages force dynamic rendering
- No static generation utilized
- Missing ISR implementation
- No caching strategy

### 3. Client-Side Performance

#### Missing Optimizations 🔴

**1. No React Performance Optimizations**
```typescript
// Not found in codebase:
const MemoizedComponent = React.memo(Component);
const cachedValue = useMemo(() => compute(deps), deps);
const stableCallback = useCallback(() => {}, deps);
```

**2. No Lazy Loading**
```typescript
// Should implement:
const LazyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

**3. No Data Caching**
- Direct fetch calls without caching
- No SWR or React Query implementation
- Missing optimistic updates

### 4. Network Performance

#### API Call Patterns
- No request deduplication
- Missing prefetching
- No progressive enhancement
- Waterfall loading patterns

#### Missing Features
- No service worker
- No offline support
- No resource hints (preconnect, prefetch)
- No HTTP/2 push

### 5. Performance Recommendations

#### Critical Optimizations

**1. Implement Code Splitting**
```typescript
// Route-based splitting
const AdminDashboard = dynamic(
  () => import('./AdminDashboard'),
  { loading: () => <DashboardSkeleton /> }
);

// Component-based splitting
const HeavyChart = dynamic(
  () => import('./HeavyChart'),
  { ssr: false }
);
```

**2. Enable Static Generation**
```typescript
// For static content
export const revalidate = 3600; // ISR - 1 hour

// For dynamic content with static shell
export async function generateStaticParams() {
  const namespaces = await getNamespaces();
  return namespaces.map((ns) => ({
    namespace: ns.slug,
  }));
}
```

**3. Implement Data Caching**
```typescript
// Using SWR
const { data, error, isLoading } = useSWR(
  `/api/namespace/${namespace}`,
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  }
);
```

#### Performance Budget

| Metric | Current | Target | Action |
|--------|---------|--------|--------|
| First Load JS | 100-200KB | <75KB | Code splitting |
| TTI | Unknown | <3.5s | Lazy loading |
| FCP | Unknown | <1.5s | Critical CSS |
| CLS | Unknown | <0.1 | Layout stability |

---

## Recommendations & Roadmap

### 1. Immediate Actions (Week 1-2)

#### Code Quality
- [ ] Fix all 44 linting warnings
- [ ] Replace all `any` types with proper interfaces
- [ ] Remove unused variables or prefix with underscore
- [ ] Add missing error boundaries

#### Security
- [ ] Implement security headers
- [ ] Enable TLS for Cerbos in production
- [ ] Add explicit CSRF protection
- [ ] Implement basic rate limiting

#### Performance
- [ ] Remove unnecessary `force-dynamic` exports
- [ ] Implement basic code splitting for large components
- [ ] Add loading states to all async operations

### 2. Short-term Improvements (Month 1)

#### Architecture
- [ ] Create `@ifla/types` package for shared types
- [ ] Extract common utilities to `@ifla/utils`
- [ ] Implement proper error handling strategy
- [ ] Add comprehensive logging

#### Code Quality
- [ ] Break down large components (>300 lines)
- [ ] Implement component testing strategy
- [ ] Add Storybook for component documentation
- [ ] Create coding standards document

#### Performance
- [ ] Implement SWR or React Query for data fetching
- [ ] Add React.memo to expensive components
- [ ] Enable ISR for appropriate pages
- [ ] Implement image optimization

### 3. Medium-term Refactoring (Month 2-3)

#### Package Architecture
```
packages/
├── @ifla/types          # Shared TypeScript types
├── @ifla/ui-kit         # Material-UI wrapper components
├── @ifla/config         # Configuration management
├── @ifla/auth           # Authentication utilities
├── @ifla/api-client     # API client with caching
└── @ifla/theme          # Docusaurus-specific components
```

#### Testing Strategy
- [ ] Achieve 80% test coverage
- [ ] Implement visual regression testing
- [ ] Add performance testing
- [ ] Create E2E test suite for critical paths

#### Documentation
- [ ] Create architecture decision records (ADRs)
- [ ] Document component APIs
- [ ] Create onboarding guide
- [ ] Add inline code documentation

### 4. Long-term Vision (Month 3-6)

#### Advanced Architecture
- [ ] Implement micro-frontend architecture
- [ ] Create plugin system for extensibility
- [ ] Add feature flags system
- [ ] Implement A/B testing capability

#### Observability
- [ ] Add application monitoring (APM)
- [ ] Implement distributed tracing
- [ ] Create performance dashboards
- [ ] Add real user monitoring (RUM)

#### Scalability
- [ ] Implement edge caching strategy
- [ ] Add database connection pooling
- [ ] Create horizontal scaling plan
- [ ] Implement queue system for async tasks

---

## Technical Debt Register

### High Priority Debt

| Item | Impact | Effort | Priority | Owner |
|------|--------|--------|----------|-------|
| TypeScript `any` types | Type safety | Low | High | Frontend Team |
| Missing security headers | Security risk | Low | Critical | DevOps |
| No code splitting | Performance | Medium | High | Frontend Team |
| Large component files | Maintainability | Medium | Medium | Frontend Team |

### Medium Priority Debt

| Item | Impact | Effort | Priority | Owner |
|------|--------|--------|----------|-------|
| No data caching strategy | Performance | Medium | Medium | Frontend Team |
| Duplicated dependencies | Bundle size | Low | Medium | Build Team |
| Missing component tests | Quality | High | Medium | QA Team |
| No error boundaries | User experience | Low | Medium | Frontend Team |

### Low Priority Debt

| Item | Impact | Effort | Priority | Owner |
|------|--------|--------|----------|-------|
| No Storybook | Documentation | Medium | Low | Frontend Team |
| Missing ADRs | Knowledge transfer | Low | Low | Architecture Team |
| No visual regression tests | Quality | High | Low | QA Team |
| No performance budget | Performance | Low | Low | Performance Team |

---

## Appendices

### A. Tools & Scripts for Improvement

#### 1. Type Coverage Script
```bash
#!/bin/bash
# Check TypeScript coverage
npx type-coverage --detail --strict
```

#### 2. Bundle Analysis
```bash
# Add to package.json
"analyze": "ANALYZE=true nx build admin"
```

#### 3. Security Audit
```bash
# Run security audit
pnpm audit
pnpm audit --fix
```

### B. Recommended Reading

1. **Architecture**
   - [Nx Best Practices](https://nx.dev/concepts/best-practices)
   - [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

2. **Security**
   - [OWASP Top 10](https://owasp.org/www-project-top-ten/)
   - [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

3. **Performance**
   - [Web Vitals](https://web.dev/vitals/)
   - [React Performance](https://react.dev/learn/render-and-commit)

### C. Monitoring & Metrics

#### Key Metrics to Track
1. **Build Metrics**
   - Build time
   - Cache hit rate
   - Bundle size
   - Type coverage

2. **Runtime Metrics**
   - Page load time
   - Time to interactive
   - API response time
   - Error rate

3. **Quality Metrics**
   - Test coverage
   - Linting warnings
   - Type errors
   - Code complexity

### D. Migration Guides

#### 1. Removing `any` Types
```typescript
// Step 1: Identify all any types
grep -r "any" --include="*.ts" --include="*.tsx" ./src

// Step 2: Create proper interfaces
interface UnknownData {
  [key: string]: unknown;
}

// Step 3: Gradually replace with specific types
```

#### 2. Implementing Code Splitting
```typescript
// Before
import HeavyComponent from './HeavyComponent';

// After
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

---

**Document Version**: 1.0  
**Last Updated**: July 13, 2025  
**Next Review**: October 2025

*This document should be treated as a living document and updated as the architecture evolves.*