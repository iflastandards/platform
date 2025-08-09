# API Architecture

**Version:** 2.0  
**Date:** July 2025  
**Status:** Current Implementation

## Overview

The IFLA Standards Platform API layer consists of Render API endpoints providing serverless endpoints for authentication, vocabulary management, RDF operations, and administrative tasks. This document details the API design patterns, security model, and integration architecture.

## API Design Principles

### 1. **RESTful Resource Design**
- Resources represent domain entities (namespaces, vocabularies, elements)
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent URL patterns
- HATEOAS for discoverability

### 2. **Edge-First Architecture**
- Serverless functions for scalability
- Geographic distribution
- Minimal cold starts
- Stateless design

### 3. **Security by Default**
- All endpoints require authentication
- Fine-grained authorization via custom RBAC middleware
- Input validation on all requests
- Rate limiting and abuse prevention

## API Structure

### Base URL Patterns
```
Development: http://localhost:3007/admin/api/
Preview:     https://admin-iflastandards-preview.onrender.com/api/
Production:  https://admin.iflastandards.info/api/
```

### Resource Hierarchy
```
/api/
├── auth/               # Authentication endpoints
│   ├── signin         # OAuth initiation
│   ├── callback       # OAuth callback
│   ├── session        # Session management
│   └── signout        # Session termination
├── vocabularies/       # Vocabulary CRUD
│   ├── :namespace/    # Namespace operations
│   │   ├── elements   # Element sets
│   │   └── concepts   # Concept schemes
│   └── import/        # Import workflows
├── rdf/               # RDF operations
│   ├── generate       # RDF generation
│   ├── validate       # RDF validation
│   └── transform      # Format conversion
├── sheets/            # Google Sheets integration
│   ├── export         # Export to sheets
│   ├── import         # Import from sheets
│   └── validate       # Sheet validation
└── admin/             # Administrative operations
    ├── users          # User management
    ├── roles          # Role assignments
    └── audit          # Audit logs
```

## Authentication Architecture

### Clerk Authentication
```typescript
// Authentication is handled by Clerk middleware
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ["/", "/api/public/(.*)"],
  afterAuth(auth, req) {
    // Custom logic after authentication
    if (auth.userId && !auth.orgId) {
      // Redirect to organization selection if needed
    }
  }
});
```

### Session Management
```typescript
// Using Clerk's auth() helper in API routes
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Usage in API route
export async function GET(req: Request) {
  const { userId, sessionClaims } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Proceed with authenticated request
  return NextResponse.json({ 
    user: { 
      id: userId,
      role: sessionClaims?.publicMetadata?.role 
    } 
  });
}
```

## Authorization Architecture

### Custom RBAC Implementation
```typescript
// Custom RBAC using Clerk's publicMetadata
import { auth } from "@clerk/nextjs/server";
import { checkUserPermission } from "@/lib/authorization";

export async function checkPermission(
  resource: string,
  action: string,
  namespace?: string
): Promise<boolean> {
  const { userId, sessionClaims } = auth();
  
  if (!userId) return false;
  
  // Check user's role and permissions from publicMetadata
  const userRole = sessionClaims?.publicMetadata?.role;
  const namespacePermissions = sessionClaims?.publicMetadata?.namespacePermissions;
  
  return checkUserPermission(userRole, resource, action, namespace, namespacePermissions);
}
```

### Authorization Types
```typescript
// Types for custom RBAC system
interface UserRole {
  role: 'superadmin' | 'admin' | 'editor' | 'translator' | 'reviewer' | 'viewer';
  namespaces?: string[];
}

interface NamespacePermissions {
  [namespace: string]: {
    role: string;
    permissions: string[];
  };
}

interface AuthorizedUser {
  id: string;
  role: UserRole;
  namespacePermissions?: NamespacePermissions;
}
```

### Authorization Middleware
```typescript
export function authorize(resource: string, action: string) {
  return async function(req: Request, context: { params: Params }) {
    const { userId, sessionClaims } = auth();
    const { namespace } = context.params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userRole = sessionClaims?.publicMetadata?.role;
    const namespacePerms = sessionClaims?.publicMetadata?.namespacePermissions;
    
    const allowed = checkUserPermission(
      userRole,
      resource,
      action,
      namespace,
      namespacePerms
    );
    
    if (!allowed) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
  };
}
```

## Core API Endpoints

### Vocabulary Management

#### List Vocabularies
```typescript
// GET /api/vocabularies/:namespace
export async function GET(
  req: Request,
  { params }: { params: { namespace: string } }
) {
  await requireAuth(req, { params });
  await authorize("read")(req, { params });
  
  const vocabularies = await readVocabularies(params.namespace);
  
  return Response.json({
    data: vocabularies,
    links: {
      self: `/api/vocabularies/${params.namespace}`,
      elements: `/api/vocabularies/${params.namespace}/elements`,
      concepts: `/api/vocabularies/${params.namespace}/concepts`,
    },
  });
}
```

#### Create Element
```typescript
// POST /api/vocabularies/:namespace/elements
export async function POST(
  req: Request,
  { params }: { params: { namespace: string } }
) {
  await requireAuth(req, { params });
  await authorize("create")(req, { params });
  
  const body = await req.json();
  const validated = ElementSchema.parse(body);
  
  const element = await createElement(params.namespace, validated);
  
  return Response.json(
    { 
      data: element,
      links: {
        self: `/api/vocabularies/${params.namespace}/elements/${element.id}`,
      },
    },
    { status: 201 }
  );
}
```

### Import/Export Workflows

#### Export to Google Sheets
```typescript
// POST /api/sheets/export
export async function POST(req: Request) {
  await requireAuth(req, { params: {} });
  
  const body = await req.json();
  const { namespace, vocabularyIds, languages } = body;
  
  await authorize("export")(req, { params: { namespace } });
  
  // Create Google Sheet
  const sheet = await createSheet({
    title: `${namespace} Vocabulary Export`,
    vocabularies: await loadVocabularies(vocabularyIds),
    languages,
  });
  
  // Log export in Supabase
  await logExport({
    namespace,
    sheetId: sheet.id,
    userId: req.session.user.id,
  });
  
  return Response.json({
    data: {
      sheetId: sheet.id,
      sheetUrl: sheet.url,
    },
  });
}
```

#### Import from Google Sheets
```typescript
// POST /api/sheets/import
export async function POST(req: Request) {
  await requireAuth(req, { params: {} });
  
  const body = await req.json();
  const { namespace, sheetId, dryRun = false } = body;
  
  await authorize("import")(req, { params: { namespace } });
  
  // Create import job
  const job = await createImportJob({
    namespace,
    sheetId,
    userId: req.session.user.id,
  });
  
  // Fetch and validate sheet data
  const sheetData = await fetchSheetData(sheetId);
  const validation = await validateAgainstDCTAP(namespace, sheetData);
  
  if (validation.errors.length > 0 && !dryRun) {
    await updateJobStatus(job.id, "failed", validation);
    return Response.json(
      { 
        error: "Validation failed",
        details: validation.errors,
      },
      { status: 400 }
    );
  }
  
  if (!dryRun) {
    // Process import
    const result = await processImport(namespace, sheetData);
    await updateJobStatus(job.id, "completed", result);
  }
  
  return Response.json({
    data: {
      jobId: job.id,
      validation,
      dryRun,
    },
  });
}
```

### RDF Operations

#### Generate RDF
```typescript
// POST /api/rdf/generate
export async function POST(req: Request) {
  await requireAuth(req, { params: {} });
  
  const body = await req.json();
  const { namespace, format = "turtle" } = body;
  
  await authorize("read")(req, { params: { namespace } });
  
  const vocabulary = await loadVocabulary(namespace);
  const rdf = await generateRDF(vocabulary, format);
  
  const contentType = {
    turtle: "text/turtle",
    xml: "application/rdf+xml",
    jsonld: "application/ld+json",
    ntriples: "application/n-triples",
  }[format];
  
  return new Response(rdf, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${namespace}.${format}"`,
    },
  });
}
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  links?: {
    documentation?: string;
    support?: string;
  };
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: any
): Response {
  const body: ErrorResponse = {
    error: {
      code,
      message,
      details,
    },
    links: {
      documentation: `https://docs.iflastandards.info/api/errors/${code}`,
    },
  };
  
  return Response.json(body, { status });
}
```

### Error Types
```typescript
// Validation error
if (!isValid) {
  return errorResponse(
    "VALIDATION_ERROR",
    "The provided data failed validation",
    400,
    validationErrors
  );
}

// Not found
if (!resource) {
  return errorResponse(
    "RESOURCE_NOT_FOUND",
    "The requested resource does not exist",
    404
  );
}

// Unauthorized
if (!session) {
  return errorResponse(
    "UNAUTHORIZED",
    "Authentication required",
    401
  );
}

// Forbidden
if (!allowed) {
  return errorResponse(
    "FORBIDDEN",
    "You do not have permission to perform this action",
    403
  );
}
```

## Rate Limiting

### Implementation
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"),
});

export async function rateLimit(req: Request): Promise<Response | void> {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(reset).toISOString(),
      },
    });
  }
}
```

## API Versioning

### Strategy
- URL-based versioning for major changes
- Header-based feature flags for minor changes
- Backward compatibility for 2 major versions
- Deprecation warnings in headers

### Implementation
```typescript
// Version in URL
/api/v1/vocabularies
/api/v2/vocabularies

// Feature flags in headers
X-API-Features: new-validation,bulk-operations

// Deprecation warnings
Deprecation: true
Sunset: 2025-12-31
Link: <https://docs.iflastandards.info/api/v2>; rel="successor-version"
```

## Performance Optimization

### Caching Strategy
```typescript
export function withCache(ttl: number = 3600) {
  return function(handler: Function) {
    return async function(req: Request, context: any) {
      const cacheKey = `${req.method}:${req.url}`;
      const cached = await cache.get(cacheKey);
      
      if (cached) {
        return new Response(cached, {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": `public, max-age=${ttl}`,
          },
        });
      }
      
      const response = await handler(req, context);
      const body = await response.text();
      
      await cache.set(cacheKey, body, ttl);
      
      return new Response(body, {
        status: response.status,
        headers: {
          ...response.headers,
          "X-Cache": "MISS",
          "Cache-Control": `public, max-age=${ttl}`,
        },
      });
    };
  };
}
```

### Response Compression
```typescript
export async function compress(response: Response): Promise<Response> {
  const acceptEncoding = response.headers.get("accept-encoding") || "";
  
  if (acceptEncoding.includes("br")) {
    const compressed = await brotliCompress(await response.text());
    return new Response(compressed, {
      headers: {
        ...response.headers,
        "Content-Encoding": "br",
      },
    });
  }
  
  if (acceptEncoding.includes("gzip")) {
    const compressed = await gzipCompress(await response.text());
    return new Response(compressed, {
      headers: {
        ...response.headers,
        "Content-Encoding": "gzip",
      },
    });
  }
  
  return response;
}
```

## Monitoring and Observability

### Logging
```typescript
interface APILog {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  namespace?: string;
  error?: string;
}

export async function logAPIRequest(
  req: Request,
  response: Response,
  startTime: number
): Promise<void> {
  const log: APILog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: new URL(req.url).pathname,
    status: response.status,
    duration: Date.now() - startTime,
    userId: req.session?.user?.id,
    namespace: req.params?.namespace,
    error: response.status >= 400 ? await response.text() : undefined,
  };
  
  await supabase.from("api_logs").insert(log);
}
```

### Metrics
- Request rate by endpoint
- Response time percentiles
- Error rate by type
- Cache hit ratio
- Authentication success rate

## API Documentation

### OpenAPI Specification
```yaml
openapi: 3.1.0
info:
  title: IFLA Standards API
  version: 2.0.0
  description: API for managing IFLA library standards
servers:
  - url: https://admin.iflastandards.info/api
    description: Production
  - url: https://admin-iflastandards-preview.onrender.com/api
    description: Preview
paths:
  /vocabularies/{namespace}:
    get:
      summary: List vocabularies in namespace
      parameters:
        - name: namespace
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of vocabularies
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VocabularyList'
```

## Testing

### API Testing Strategy
```typescript
describe("API: Vocabularies", () => {
  it("should require authentication", async () => {
    const response = await fetch("/api/vocabularies/isbd");
    expect(response.status).toBe(401);
  });
  
  it("should check authorization", async () => {
    const response = await authenticatedFetch(
      "/api/vocabularies/restricted",
      { user: { teams: ["wrong-team"] } }
    );
    expect(response.status).toBe(403);
  });
  
  it("should validate input", async () => {
    const response = await authenticatedPost(
      "/api/vocabularies/isbd/elements",
      { invalid: "data" }
    );
    expect(response.status).toBe(400);
  });
});
```

## Future API Enhancements

### Planned Features
1. **GraphQL Layer**: Complex query support
2. **WebSocket Support**: Real-time updates
3. **Batch Operations**: Bulk create/update/delete
4. **Webhook System**: Event notifications
5. **API Gateway**: Advanced routing and transformation

### API Evolution
- Maintain backward compatibility
- Progressive enhancement via feature flags
- Clear deprecation timelines
- Migration guides for breaking changes

## Comprehensive API Specification
*Source: Previously documented in Doc 24 - Admin UI API Specification*

### Complete Endpoint Catalog

The platform provides 170+ RESTful API endpoints covering all aspects of vocabulary management, project collaboration, and system administration.

#### Project Management APIs

```typescript
// Project CRUD
GET    /api/admin/projects                        // List all projects
POST   /api/admin/projects                        // Create new project
GET    /api/admin/projects/:projectId             // Get project details
PUT    /api/admin/projects/:projectId             // Update project
DELETE /api/admin/projects/:projectId             // Delete project
POST   /api/admin/projects/:projectId/archive     // Archive project

// Project Charter
GET    /api/admin/projects/:projectId/charter     // Get project charter
PUT    /api/admin/projects/:projectId/charter     // Update charter
POST   /api/admin/projects/:projectId/charter/approve // Approve charter

// Project Teams
GET    /api/admin/projects/:projectId/teams       // List project teams
POST   /api/admin/projects/:projectId/teams       // Add team to project
PUT    /api/admin/projects/:projectId/teams/:teamId // Update team role
DELETE /api/admin/projects/:projectId/teams/:teamId // Remove team

// Project Boards (GitHub Projects sync)
GET    /api/admin/projects/:projectId/board       // Get board state
PUT    /api/admin/projects/:projectId/board       // Update board
POST   /api/admin/projects/:projectId/board/sync  // Sync with GitHub
GET    /api/admin/projects/:projectId/board/columns // Get columns
POST   /api/admin/projects/:projectId/board/columns // Create column

// Project Analytics
GET    /api/admin/projects/:projectId/analytics   // Get project metrics
GET    /api/admin/projects/:projectId/velocity   // Velocity chart data
GET    /api/admin/projects/:projectId/burndown   // Burndown chart data
```

#### Issue and Pull Request Management

```typescript
// Issues CRUD
GET    /api/admin/issues                          // List all issues
POST   /api/admin/issues                          // Create issue
GET    /api/admin/issues/:issueId                 // Get issue details
PUT    /api/admin/issues/:issueId                 // Update issue
POST   /api/admin/issues/:issueId/close          // Close issue
POST   /api/admin/issues/:issueId/assign         // Assign issue
POST   /api/admin/issues/:issueId/labels         // Add labels
POST   /api/admin/issues/:issueId/comments       // Add comment
POST   /api/admin/issues/:issueId/convert        // Convert to PR

// Pull Request CRUD
GET    /api/admin/pulls                           // List all PRs
GET    /api/admin/pulls/:prId                     // Get PR details
POST   /api/admin/pulls/:prId/merge              // Merge PR
GET    /api/admin/pulls/:prId/reviews            // List reviews
POST   /api/admin/pulls/:prId/reviews            // Request review
GET    /api/admin/pulls/:prId/diff               // Get diff
GET    /api/admin/pulls/:prId/commits            // List commits
```

#### Content and RDF Management

```typescript
// Content Management
GET    /api/admin/namespaces/:nsId/content        // List content pages
POST   /api/admin/namespaces/:nsId/content/page   // Create new page
POST   /api/admin/namespaces/:nsId/content/scaffold/elements // Scaffold element pages
POST   /api/admin/namespaces/:nsId/content/scaffold/vocabularies // Scaffold vocabulary pages
GET    /api/admin/namespaces/:nsId/content/examples // List examples
POST   /api/admin/namespaces/:nsId/content/examples // Add example
PUT    /api/admin/namespaces/:nsId/content/navigation // Update navigation

// RDF Management
POST   /api/admin/namespaces/:nsId/rdf/csv-to-rdf // Convert CSV to RDF
POST   /api/admin/namespaces/:nsId/rdf/rdf-to-csv // Extract CSV from RDF
POST   /api/admin/namespaces/:nsId/rdf/sheets/sync // Sync with Google Sheets
POST   /api/admin/namespaces/:nsId/rdf/validate   // Validate RDF
GET    /api/admin/namespaces/:nsId/rdf/dctap      // Get DCTAP profile
PUT    /api/admin/namespaces/:nsId/rdf/dctap      // Update DCTAP profile
PUT    /api/admin/namespaces/:nsId/rdf/context    // Update JSON-LD context
POST   /api/admin/namespaces/:nsId/rdf/release    // Generate RDF release
```

#### Translation and Quality Management

```typescript
// Translation Workflows
GET    /api/admin/translations                    // Translation overview
GET    /api/admin/translations/:nsId              // Namespace translations
POST   /api/admin/translations/:nsId/export       // Export for translation
POST   /api/admin/translations/:nsId/import       // Import translations
POST   /api/admin/translations/:nsId/sync         // Sync with spreadsheet

// Quality Assurance
POST   /api/admin/vocabularies/validate           // Validate vocabulary
POST   /api/admin/namespaces/:nsId/quality/links  // Validate links
POST   /api/admin/namespaces/:nsId/quality/consistency // Check consistency
POST   /api/admin/namespaces/:nsId/quality/accessibility // Run accessibility audit
GET    /api/admin/namespaces/:nsId/quality/translation // Translation status
POST   /api/admin/namespaces/:nsId/quality/performance // Performance test
```

#### Global Navigation and Activity

```typescript
// Global Navigation Support
GET    /api/admin/navigation/menu                 // Get personalized navigation menu
GET    /api/admin/navigation/context             // Get current context (namespace/project)
PUT    /api/admin/navigation/context             // Set current context
GET    /api/admin/navigation/quickactions        // Get role-based quick actions
GET    /api/admin/navigation/switcher            // Get namespace/project switcher data

// Activity Feed
GET    /api/admin/activity/feed                   // Get activity feed items
GET    /api/admin/activity/feed/:type             // Filter by activity type
GET    /api/admin/activity/user/:userId           // Get user-specific activity
GET    /api/admin/activity/namespace/:nsId        // Get namespace activity
GET    /api/admin/activity/project/:projectId     // Get project activity
```

### UI Architecture and Patterns

#### Global Navigation Architecture

The admin portal features a sophisticated personalized navigation system:

**Personal Navigation Bar (Persistent)**:
- Context-aware global navigation tailored to user's roles and permissions
- Dynamic adaptation based on system role, review group memberships, and active projects
- Responsive behavior from full desktop to mobile hamburger menu

**Navigation Components by Role**:
1. **System Administrators**: System dropdown, quick actions for platform management
2. **Review Group Administrators**: Review groups dropdown, project management
3. **Project Members**: My projects dropdown, accessible namespaces
4. **Common Elements**: Logo/home, context switcher, user menu, notifications, help

#### MUI Component Standards

The platform exclusively uses Material-UI (MUI) components for consistency:

```typescript
// Navigation Components
<Drawer variant="permanent" aria-label="Main navigation">
  <nav role="navigation" aria-label="Primary navigation">
    <List>
      <ListItem>
        <ListItemButton aria-current={isActive ? "page" : undefined}>
          <ListItemIcon><DashboardIcon aria-hidden="true" /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>
    </List>
  </nav>
</Drawer>

// DataTable Implementation
<DataGrid
  aria-label="Users table"
  columns={[
    { 
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <IconButton aria-label={`Actions for ${params.row.name}`}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ]}
  // Advanced features
  checkboxSelection
  disableRowSelectionOnClick
  pagination
  sortingMode="server"
  filterMode="server"
/>
```

#### Accessibility Compliance (WCAG 2.1 Level AA)

The platform meets EU Web Accessibility Directive and UK Public Sector Bodies Accessibility Regulations:

**Keyboard Navigation**:
- All interactive elements accessible via Tab key
- Skip navigation links at page start
- Logical tab order throughout interface
- Arrow keys navigate within menus and tables

**Screen Reader Support**:
- Proper ARIA labels for all controls
- ARIA landmarks for page regions
- Live regions for dynamic updates
- Descriptive button labels (not just icons)

**Color and Contrast**:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio
- Never rely on color alone to convey information

### Advanced API Features

#### Spreadsheet Adoption Workflow

```typescript
// Adopt Spreadsheet Workflow
POST   /api/admin/vocabularies/adopt              // Initiate spreadsheet adoption
POST   /api/admin/vocabularies/adopt/analyze      // Analyze spreadsheet structure
GET    /api/admin/vocabularies/adopt/:jobId       // Check adoption status
POST   /api/admin/vocabularies/adopt/validate     // Validate before adoption
POST   /api/admin/vocabularies/adopt/confirm      // Confirm and execute adoption
GET    /api/admin/vocabularies/adopt/templates    // Get available templates
```

This workflow enables seamless integration of existing vocabulary spreadsheets into the platform.

### Implementation Priorities

**Phase 1: Core Functionality (Weeks 1-2)**
- Authentication & authorization
- User management
- Basic dashboard
- Review group management
- Namespace CRUD

**Phase 2: Project Management (Weeks 3-4)**
- Project creation and charter management
- GitHub Projects sync
- Issue and PR management
- Basic kanban boards

**Phase 3: Vocabulary Management (Weeks 5-6)**
- Spreadsheet import/export
- MDX generation with dry-run
- Validation framework
- Basic versioning

**Phase 4: Advanced Features (Weeks 7-8)**
- Translation workflows
- TinaCMS integration
- Backup & rollback
- Publishing pipeline

**Phase 5: Collaboration & Polish (Weeks 9-10)**
- Discussion forums
- Advanced analytics
- Audit logging
- System monitoring

This API architecture provides a secure, scalable foundation for vocabulary management while maintaining flexibility for future enhancements and integrations. The comprehensive endpoint catalog ensures complete coverage of all platform functionality, while the UI patterns and accessibility standards ensure a consistent, inclusive user experience.
