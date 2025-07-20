# API Architecture

**Version:** 2.0  
**Date:** January 2025  
**Status:** Current Implementation

## Overview

The IFLA Standards Platform API layer consists of Vercel Edge Functions providing serverless endpoints for authentication, vocabulary management, RDF operations, and administrative tasks. This document details the API design patterns, security model, and integration architecture.

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
- Fine-grained authorization via Cerbos
- Input validation on all requests
- Rate limiting and abuse prevention

## API Structure

### Base URL Patterns
```
Development: http://localhost:3007/admin/api/
Preview:     https://iflastandards.github.io/platform/admin/api/
Production:  https://www.iflastandards.info/admin/api/
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

### NextAuth.js 5.0 Configuration
```typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { ClerkAdapter } from "@auth/clerk-adapter";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email read:org",
        },
      },
    }),
  ],
  adapter: ClerkAdapter(),
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Store GitHub teams for authorization
        const teams = await fetchGitHubTeams(account.access_token);
        token.teams = teams;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.teams = token.teams;
      return session;
    },
  },
  pages: {
    signIn: "/admin/auth/signin",
    error: "/admin/auth/error",
  },
});
```

### Session Management
```typescript
// Middleware to protect API routes
export async function requireAuth(
  req: Request,
  context: { params: Params }
): Promise<Response | void> {
  const session = await auth();
  
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Attach session to request
  (req as any).session = session;
}

// Usage in API route
export async function GET(req: Request) {
  await requireAuth(req, { params: {} });
  const session = (req as any).session;
  
  // Proceed with authenticated request
  return Response.json({ user: session.user });
}
```

## Authorization Architecture

### Cerbos Integration
```typescript
import { GRPC as Cerbos } from "@cerbos/grpc";

const cerbos = new Cerbos(process.env.CERBOS_SERVER_URL, {
  tls: process.env.NODE_ENV === "production",
});

export async function checkPermission(
  principal: Principal,
  resource: Resource,
  action: string
): Promise<boolean> {
  const decision = await cerbos.checkResource({
    principal,
    resource,
    actions: [action],
  });
  
  return decision.isAllowed(action);
}
```

### Resource Definitions
```typescript
interface Principal {
  id: string;
  roles: string[];
  attributes: {
    teams: string[];
    namespaces: string[];
  };
}

interface Resource {
  kind: "namespace" | "vocabulary" | "element" | "concept";
  id: string;
  attributes: {
    namespace?: string;
    status?: "draft" | "published";
    owner?: string;
  };
}
```

### Authorization Middleware
```typescript
export function authorize(action: string) {
  return async function(req: Request, context: { params: Params }) {
    const session = (req as any).session;
    const { namespace } = context.params;
    
    const principal: Principal = {
      id: session.user.id,
      roles: deriveRoles(session.user.teams),
      attributes: {
        teams: session.user.teams,
        namespaces: session.user.namespaces,
      },
    };
    
    const resource: Resource = {
      kind: "namespace",
      id: namespace,
      attributes: { namespace },
    };
    
    const allowed = await checkPermission(principal, resource, action);
    
    if (!allowed) {
      return new Response("Forbidden", { status: 403 });
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
  - url: https://www.iflastandards.info/admin/api
    description: Production
  - url: https://iflastandards.github.io/platform/admin/api
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

This API architecture provides a secure, scalable foundation for vocabulary management while maintaining flexibility for future enhancements and integrations.