# Admin API Specification

## Overview

This document defines the RESTful API for the IFLA Standards Admin application, implementing the authorization model defined in `admin-authorization-model.md`.

## Authentication

All API endpoints require authentication via Clerk JWT tokens.

```typescript
// Request header
Authorization: Bearer <clerk-jwt-token>
```

## Common Response Formats

### Success Response
```typescript
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Error Response
```typescript
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to perform this action",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Pagination
```typescript
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

## API Endpoints

### User & Role Management

#### Get Current User
```http
GET /api/admin/users/me
```

Response:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": {
    "system": "superadmin" | null,
    "reviewGroups": [
      {
        "reviewGroupId": "rg_isbd",
        "role": "admin"
      }
    ],
    "teams": [
      {
        "teamId": "team_123",
        "role": "editor",
        "reviewGroup": "rg_isbd",
        "namespaces": ["ns_isbd", "ns_isbdm"]
      }
    ],
    "translations": [
      {
        "language": "fr",
        "namespaces": ["ns_isbd"]
      }
    ]
  }
}
```

#### List Users
```http
GET /api/admin/users?reviewGroup=rg_isbd&role=editor&page=1&pageSize=20
```

#### Update User Roles
```http
PUT /api/admin/users/:userId/roles
```

Request:
```json
{
  "reviewGroups": [
    {
      "reviewGroupId": "rg_isbd",
      "role": "admin"
    }
  ],
  "teams": [
    {
      "teamId": "team_123",
      "role": "editor"
    }
  ]
}
```

### Review Group Management

#### List Review Groups
```http
GET /api/admin/review-groups
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "rg_isbd",
      "name": "ISBD Review Group",
      "description": "International Standard Bibliographic Description",
      "namespaces": ["ns_isbd", "ns_isbdm"],
      "projects": ["proj_isbd_2024"],
      "teams": ["team_isbd_core", "team_isbd_translators"],
      "memberCount": 25,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Review Group
```http
POST /api/admin/review-groups
```

Request:
```json
{
  "name": "New Review Group",
  "description": "Description of the review group",
  "initialAdmins": ["user_123", "user_456"]
}
```

#### Update Review Group
```http
PUT /api/admin/review-groups/:rgId
```

#### Delete Review Group
```http
DELETE /api/admin/review-groups/:rgId
```

### Namespace Management

#### List Namespaces
```http
GET /api/admin/review-groups/:rgId/namespaces
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "ns_isbd",
      "name": "ISBD Core",
      "reviewGroup": "rg_isbd",
      "projects": ["proj_isbd_2024"],
      "elementSets": ["es_isbd_core"],
      "vocabularies": ["vocab_content_types"],
      "translations": ["en", "fr", "es"],
      "releases": ["v1.0", "v1.1"],
      "status": "active",
      "visibility": "public"
    }
  ]
}
```

#### Create Namespace
```http
POST /api/admin/review-groups/:rgId/namespaces
```

Request:
```json
{
  "name": "New Namespace",
  "description": "Namespace description",
  "visibility": "public" | "private",
  "initialTeams": ["team_123"]
}
```

### Project Management

#### Create Project
```http
POST /api/admin/review-groups/:rgId/projects
```

Request:
```json
{
  "name": "ISBD 2024 Revision",
  "description": "Major revision of ISBD standard",
  "namespaces": ["ns_isbd", "ns_isbdm"],
  "teams": ["team_isbd_core"],
  "githubDiscussion": "https://github.com/org/repo/discussions/123"
}
```

#### Assign Team to Project
```http
POST /api/admin/projects/:projectId/teams
```

Request:
```json
{
  "teamId": "team_123",
  "permissions": ["read", "write", "review"]
}
```

### Team Management

#### Create Team
```http
POST /api/admin/review-groups/:rgId/teams
```

Request:
```json
{
  "name": "ISBD Translators",
  "description": "Translation team for ISBD",
  "type": "translators",
  "namespaces": ["ns_isbd"]
}
```

#### Add Team Member
```http
POST /api/admin/teams/:teamId/members
```

Request:
```json
{
  "userId": "user_123",
  "role": "editor",
  "namespaces": ["ns_isbd"]
}
```

### Content Management

#### Create Element Set
```http
POST /api/admin/namespaces/:nsId/element-sets
```

Request:
```json
{
  "name": "ISBD Core Elements",
  "description": "Core bibliographic elements",
  "elements": [
    {
      "name": "title",
      "label": "Title",
      "description": "The title of the resource",
      "cardinality": "1",
      "datatype": "string"
    }
  ]
}
```

#### Import Spreadsheet
```http
POST /api/admin/namespaces/:nsId/import
```

Request (multipart/form-data):
```
file: spreadsheet.xlsx
type: "element-set" | "vocabulary"
options: {
  "overwrite": false,
  "validate": true
}
```

### Translation Management

#### List Translations
```http
GET /api/admin/namespaces/:nsId/translations
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "trans_123",
      "language": "fr",
      "namespace": "ns_isbd",
      "progress": {
        "total": 100,
        "translated": 85,
        "reviewed": 70,
        "approved": 65
      },
      "assignedTranslators": ["user_789"]
    }
  ]
}
```

#### Update Translation
```http
PUT /api/admin/translations/:transId/items/:itemId
```

Request:
```json
{
  "translation": "Titre",
  "notes": "Standard translation for title",
  "status": "translated" | "reviewed" | "approved"
}
```

### Release Management

#### Create Release
```http
POST /api/admin/namespaces/:nsId/releases
```

Request:
```json
{
  "version": "1.2.0",
  "name": "ISBD 2024",
  "description": "2024 revision of ISBD",
  "includedContent": {
    "elementSets": ["es_isbd_core"],
    "vocabularies": ["vocab_content_types"],
    "translations": ["en", "fr", "es"]
  },
  "status": "draft" | "published"
}
```

#### Publish Release
```http
POST /api/admin/releases/:releaseId/publish
```

Request:
```json
{
  "publishNotes": "This release includes...",
  "notifySubscribers": true
}
```

## Batch Operations

### Bulk User Import
```http
POST /api/admin/users/import
```

Request:
```json
{
  "users": [
    {
      "email": "user@example.com",
      "name": "User Name",
      "reviewGroups": [
        {
          "reviewGroupId": "rg_isbd",
          "role": "editor"
        }
      ]
    }
  ],
  "sendInvites": true
}
```

### Bulk Permission Update
```http
POST /api/admin/permissions/bulk-update
```

Request:
```json
{
  "updates": [
    {
      "userId": "user_123",
      "operation": "add" | "remove",
      "permission": {
        "type": "team",
        "teamId": "team_123",
        "role": "editor"
      }
    }
  ]
}
```

## Webhooks

### Webhook Events
- `user.created`
- `user.role.changed`
- `reviewGroup.created`
- `namespace.created`
- `project.created`
- `team.member.added`
- `release.published`
- `translation.completed`

### Webhook Payload
```json
{
  "event": "user.role.changed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "userId": "user_123",
    "changes": {
      "before": { ... },
      "after": { ... }
    }
  },
  "actor": {
    "userId": "admin_456",
    "ip": "192.168.1.1"
  }
}
```

## Rate Limiting

- Standard users: 100 requests per minute
- Editors: 200 requests per minute
- Admins: 500 requests per minute
- Superadmins: No limit

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `PERMISSION_DENIED` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Input validation failed |
| `CONFLICT` | Resource conflict (e.g., duplicate name) |
| `RATE_LIMITED` | Rate limit exceeded |
| `SERVER_ERROR` | Internal server error |

## Audit Log

All write operations are logged:

```json
{
  "id": "audit_123",
  "timestamp": "2024-01-01T00:00:00Z",
  "actor": {
    "userId": "user_123",
    "email": "user@example.com",
    "ip": "192.168.1.1"
  },
  "action": "namespace.create",
  "resource": {
    "type": "namespace",
    "id": "ns_new",
    "reviewGroup": "rg_isbd"
  },
  "changes": {
    "before": null,
    "after": { ... }
  },
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "apiVersion": "1.0"
  }
}
```