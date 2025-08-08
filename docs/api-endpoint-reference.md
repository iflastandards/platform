# API Endpoint Reference

## Overview

The IFLA Standards Admin application uses Next.js App Router API routes for all backend functionality. All API routes are located in `apps/admin/src/app/api/`.

**Base URL**: `/api`
**Authentication**: Clerk middleware (automatic on protected routes)
**Authorization**: Custom RBAC using Clerk publicMetadata

## Authentication & Authorization Flow

1. **Authentication**: Handled automatically by Clerk middleware
2. **Authorization**: Each endpoint checks permissions using `canPerformAction()`
3. **Response Format**: Standard JSON responses with consistent error handling

## Public Endpoints

These endpoints do not require authentication:

### GET /api/health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/hello
Simple test endpoint.

**Response:**
```text
Hello, from API!
```

### POST /api/request-invite
Request an invitation to join the platform.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "organization": "IFLA",
  "reason": "Contributing to standards"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation request received"
}
```

## Protected Endpoints

All protected endpoints require authentication via Clerk and return 401 if unauthenticated.

### Admin Endpoints

#### GET /api/admin/users
List users with optional filtering.

**Query Parameters:**
- `reviewGroupId` (optional): Filter by review group

**Required Permission:** `user:read`

**Response:**
```json
{
  "users": [
    {
      "id": "user_123",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "reviewGroups": ["icp"],
      "roles": ["ns_editor"]
    }
  ]
}
```

#### GET /api/admin/namespaces
List all namespaces accessible to the user.

**Required Permission:** `namespace:read`

**Response:**
```json
{
  "namespaces": [
    {
      "id": "ns_123",
      "name": "ISBD",
      "reviewGroup": "isbd",
      "description": "International Standard Bibliographic Description"
    }
  ]
}
```

#### GET /api/admin/namespace/[namespace]/element-sets
Get element sets for a specific namespace.

**URL Parameters:**
- `namespace`: The namespace identifier

**Required Permission:** `elementSet:read` for the namespace

**Response:**
```json
{
  "elementSets": [
    {
      "id": "es_123",
      "name": "Core Elements",
      "namespace": "isbd",
      "elements": []
    }
  ]
}
```

#### GET /api/admin/namespace/[namespace]/pending-spreadsheets
Get pending spreadsheets for a namespace.

**URL Parameters:**
- `namespace`: The namespace identifier

**Required Permission:** `spreadsheet:read` for the namespace

**Response:**
```json
{
  "spreadsheets": [
    {
      "id": "sheet_123",
      "name": "ISBD Updates 2024",
      "status": "pending_review",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/admin/adopt-spreadsheet
Adopt a spreadsheet into the system.

**Required Permission:** `spreadsheet:import`

**Request Body:**
```json
{
  "spreadsheetUrl": "https://docs.google.com/...",
  "namespace": "isbd",
  "metadata": {
    "exportedBy": "user@example.com",
    "contentType": "element-sets",
    "languages": ["en", "fr"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "adoptedSpreadsheetId": "adopted_123",
  "message": "Spreadsheet successfully adopted"
}
```

#### POST /api/admin/validate-spreadsheet
Validate a spreadsheet before adoption.

**Required Permission:** `spreadsheet:read`

**Request Body:**
```json
{
  "spreadsheetUrl": "https://docs.google.com/..."
}
```

**Response:**
```json
{
  "valid": true,
  "warnings": [],
  "errors": [],
  "metadata": {
    "worksheets": 5,
    "rows": 150
  }
}
```

#### GET /api/admin/roles
Get available roles in the system.

**Required Permission:** `user:read`

**Response:**
```json
{
  "roles": [
    {
      "id": "superadmin",
      "name": "Super Administrator",
      "description": "Full system access"
    },
    {
      "id": "rg_admin",
      "name": "Review Group Admin",
      "description": "Manage review group"
    }
  ]
}
```

### Action Endpoints

#### POST /api/actions/scaffold-from-spreadsheet
Generate scaffold code from a spreadsheet.

**Required Permission:** `spreadsheet:export`

**Request Body:**
```json
{
  "spreadsheetData": {},
  "targetFormat": "docusaurus",
  "options": {
    "generateTests": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "generatedFiles": [
    "/path/to/file1.md",
    "/path/to/file2.tsx"
  ]
}
```

### Authentication Endpoints

#### GET /api/auth/callback
OAuth callback handler for Clerk authentication.

**Note:** This is handled automatically by Clerk and should not be called directly.

#### POST /api/auth/signin
Sign in endpoint (handled by Clerk).

**Note:** Use Clerk's client-side components instead of calling directly.

#### POST /api/auth/sync-github
Sync user's GitHub team memberships with their roles.

**Required Permission:** `user:update` (own profile only)

**Request Body:**
```json
{
  "githubUsername": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "syncedTeams": ["ifla-editors", "isbd-reviewers"]
}
```

### Validation Endpoints

#### POST /api/validate-csv
Validate CSV file format and content.

**Request Body (multipart/form-data):**
- `file`: CSV file to validate
- `schema`: Validation schema name

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "rowCount": 100,
  "columnCount": 10
}
```

## Error Responses

All endpoints use consistent error response format:

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to perform this action"
}
```

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": {
    "field": "error description"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

Currently not implemented but planned for Phase 8.

## Versioning

API versioning strategy to be implemented in Phase 5. Current version is considered v1.

## Authorization Context

All protected endpoints have access to the following authorization context:

```typescript
interface AuthContext {
  userId: string;
  email: string;
  roles: {
    systemRole?: 'superadmin';
    reviewGroups: Array<{
      reviewGroupId: string;
      role: 'admin';
    }>;
    teams: Array<{
      teamId: string;
      role: 'editor' | 'author';
      reviewGroup: string;
      namespaces: string[];
    }>;
    translations: Array<{
      language: string;
      namespaces: string[];
    }>;
  };
}
```

## Testing Endpoints

To test protected endpoints during development:

1. Ensure you're authenticated via Clerk
2. Use the browser's developer tools or a tool like Postman
3. Include cookies from authenticated browser session
4. Or use Clerk's testing tokens in development

---

*Last updated: 2025-08-08*
*API Version: 1.0.0 (unversioned)*