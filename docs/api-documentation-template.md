# API Documentation Template - IFLA Standards Platform

## Overview

This template provides a standardized format for documenting all API endpoints in the IFLA Standards Platform. Each endpoint should be documented following this structure.

---

## API Documentation Structure

### 1. Endpoint Overview Template

```markdown
# [Endpoint Name] API

## Overview
[Brief description of what this endpoint does and its purpose]

**Base URL**: `https://api.iflastandards.info/v1`  
**Authentication**: Bearer token required

## Quick Start
[Simple example showing the most common use case]

## Table of Contents
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)
```

### 2. Individual Endpoint Template

```markdown
## [HTTP Method] [Endpoint Path]

[Brief description of what this endpoint does]

### Request

**Method**: `[GET|POST|PUT|PATCH|DELETE]`  
**Path**: `/api/v1/[resource]/[id]`  
**Content-Type**: `application/json`

#### Headers
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer token |
| X-Request-ID | No | Unique request identifier for tracing |

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Unique identifier of the resource |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number for pagination |
| limit | integer | No | 20 | Number of items per page |
| sort | string | No | created_at | Field to sort by |
| order | string | No | desc | Sort order (asc/desc) |

#### Request Body
```json
{
  "field1": "string",
  "field2": 123,
  "field3": {
    "nested": "value"
  }
}
```

### Response

#### Success Response
**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "resource_123",
    "field1": "value",
    "field2": 123
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

#### Error Response
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field1": "Field is required"
    }
  }
}
```

### Examples

#### cURL
```bash
curl -X POST https://api.iflastandards.info/v1/resource \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field1": "value",
    "field2": 123
  }'
```

#### JavaScript (Fetch)
```javascript
const response = await fetch('https://api.iflastandards.info/v1/resource', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    field1: 'value',
    field2: 123
  })
});

const data = await response.json();
```

#### Python
```python
import requests

response = requests.post(
    'https://api.iflastandards.info/v1/resource',
    headers={
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    json={
        'field1': 'value',
        'field2': 123
    }
)

data = response.json()
```
```

---

## Complete API Documentation Examples

### Projects API Documentation

```markdown
# Projects API

## Overview
The Projects API allows you to manage projects within the IFLA Standards Platform. Projects are the top-level organizational unit that contain namespaces and team members.

**Base URL**: `https://api.iflastandards.info/v1`  
**Authentication**: Bearer token required

## Quick Start
```bash
# List all projects
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.iflastandards.info/v1/projects
```

---

## GET /projects

Retrieve a list of projects accessible to the authenticated user.

### Request

**Method**: `GET`  
**Path**: `/api/v1/projects`

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max: 100) |
| reviewGroup | string | No | - | Filter by review group ID |
| visibility | string | No | - | Filter by visibility (public/private) |
| search | string | No | - | Search in project names |

### Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "proj_isbd_2024",
      "reviewGroupId": "rg_isbd",
      "name": "ISBD 2024 Revision",
      "description": "Major revision of ISBD standard",
      "visibility": "public",
      "githubOrg": "ifla-isbd",
      "namespaces": ["ns_isbd", "ns_isbdm"],
      "memberCount": 12,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

---

## POST /projects

Create a new project.

### Request

**Method**: `POST`  
**Path**: `/api/v1/projects`  
**Content-Type**: `application/json`

#### Request Body
```json
{
  "reviewGroupId": "rg_isbd",
  "name": "New ISBD Project",
  "description": "Description of the project",
  "visibility": "public",
  "githubOrg": "ifla-isbd",
  "initialNamespace": {
    "name": "Core Namespace",
    "description": "Main namespace for the project"
  }
}
```

#### Validation Rules
- `name`: Required, 3-100 characters
- `reviewGroupId`: Required, must exist
- `visibility`: Required, must be "public" or "private"
- `githubOrg`: Optional, must have admin access if provided

### Response

**Status Code**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "proj_new_123",
    "reviewGroupId": "rg_isbd",
    "name": "New ISBD Project",
    "description": "Description of the project",
    "visibility": "public",
    "githubOrg": "ifla-isbd",
    "namespaces": ["ns_auto_created"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "name": "Project name is required",
      "reviewGroupId": "Review group not found"
    }
  }
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to create projects in this review group"
  }
}
```

---

## GET /projects/:id

Retrieve detailed information about a specific project.

### Request

**Method**: `GET`  
**Path**: `/api/v1/projects/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Project identifier |

### Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "proj_isbd_2024",
    "reviewGroupId": "rg_isbd",
    "name": "ISBD 2024 Revision",
    "description": "Major revision of ISBD standard",
    "visibility": "public",
    "githubOrg": "ifla-isbd",
    "settings": {
      "requireGitHubAuth": true,
      "defaultBranch": "main",
      "autoSync": true
    },
    "namespaces": [
      {
        "id": "ns_isbd",
        "name": "ISBD Core",
        "status": "active"
      }
    ],
    "members": [
      {
        "userId": "user_123",
        "role": "admin",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "stats": {
      "namespaceCount": 2,
      "vocabularyCount": 15,
      "memberCount": 12,
      "lastActivity": "2024-01-15T00:00:00Z"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

---

## PUT /projects/:id

Update project information.

### Request

**Method**: `PUT`  
**Path**: `/api/v1/projects/:id`  
**Content-Type**: `application/json`

#### Request Body
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "visibility": "private",
  "settings": {
    "requireGitHubAuth": false,
    "autoSync": false
  }
}
```

### Response

**Status Code**: `200 OK`

Returns the updated project object.

---

## DELETE /projects/:id

Delete a project. This is a soft delete that archives the project.

### Request

**Method**: `DELETE`  
**Path**: `/api/v1/projects/:id`

### Response

**Status Code**: `204 No Content`

No response body on success.

### Error Response

**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "PROJECT_HAS_RESOURCES",
    "message": "Cannot delete project with active namespaces"
  }
}
```
```

### Vocabularies API Documentation

```markdown
# Vocabularies API

## Overview
The Vocabularies API provides endpoints for managing vocabulary elements and their RDF representations within namespaces.

**Base URL**: `https://api.iflastandards.info/v1`  
**Authentication**: Bearer token required

---

## POST /vocabularies/import

Import vocabulary from a spreadsheet.

### Request

**Method**: `POST`  
**Path**: `/api/v1/vocabularies/import`  
**Content-Type**: `multipart/form-data`

#### Form Data
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes* | Spreadsheet file (xlsx, csv) |
| spreadsheetUrl | string | Yes* | Google Sheets URL |
| namespaceId | string | Yes | Target namespace |
| dctapProfileId | string | Yes | DCTAP profile for validation |
| dryRun | boolean | No | Create PR instead of direct import |

*Either file or spreadsheetUrl required

### Response

**Status Code**: `202 Accepted`

```json
{
  "success": true,
  "data": {
    "importId": "import_123",
    "status": "processing",
    "validationResult": {
      "valid": true,
      "warnings": 2,
      "errors": 0
    },
    "preview": {
      "elementsToCreate": 25,
      "elementsToUpdate": 5,
      "documentsToGenerate": 30
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Validation Error Response

**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Spreadsheet validation failed",
    "details": {
      "errors": [
        {
          "row": 5,
          "column": "B",
          "value": "",
          "rule": "mandatory",
          "message": "Label is required"
        }
      ],
      "warnings": [
        {
          "row": 10,
          "column": "D",
          "value": "example",
          "rule": "pattern",
          "message": "Term should use camelCase"
        }
      ]
    }
  }
}
```

### WebSocket Updates

Connect to receive real-time import progress:

```javascript
const ws = new WebSocket('wss://api.iflastandards.info/v1/ws');
ws.send(JSON.stringify({
  type: 'subscribe',
  importId: 'import_123',
  token: 'YOUR_TOKEN'
}));

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`Progress: ${update.progress}%`);
};
```

---

## GET /vocabularies/:id/rdf

Export vocabulary as RDF in various formats.

### Request

**Method**: `GET`  
**Path**: `/api/v1/vocabularies/:id/rdf`

#### Headers
| Header | Required | Description |
|--------|----------|-------------|
| Accept | No | Desired RDF format |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| format | string | No | turtle | Output format |
| version | string | No | latest | Version to export |
| includeDeprecated | boolean | No | false | Include deprecated elements |

#### Supported Formats
- `text/turtle` (default)
- `application/rdf+xml`
- `application/ld+json`
- `text/n3`
- `application/n-triples`

### Response

**Status Code**: `200 OK`  
**Content-Type**: Based on requested format

#### Turtle Format
```turtle
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix isbd: <https://iflastandards.info/ns/isbd/> .

isbd:title a rdf:Property ;
    rdfs:label "Title"@en ;
    rdfs:comment "The title of the resource"@en ;
    skos:notation "title" .
```

#### JSON-LD Format
```json
{
  "@context": {
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "isbd": "https://iflastandards.info/ns/isbd/"
  },
  "@graph": [
    {
      "@id": "isbd:title",
      "@type": "rdf:Property",
      "rdfs:label": {
        "@value": "Title",
        "@language": "en"
      },
      "rdfs:comment": {
        "@value": "The title of the resource",
        "@language": "en"
      },
      "skos:notation": "title"
    }
  ]
}
```
```

### Translation API Documentation

```markdown
# Translation API

## Overview
The Translation API manages multilingual content for vocabularies and documentation.

**Base URL**: `https://api.iflastandards.info/v1`  
**Authentication**: Bearer token required

---

## GET /translations/languages

Get available languages and their translation progress.

### Request

**Method**: `GET`  
**Path**: `/api/v1/translations/languages`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| namespaceId | string | No | Filter by namespace |
| includeProgress | boolean | No | Include translation progress |

### Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "isSource": true,
      "isRTL": false,
      "progress": {
        "total": 1000,
        "translated": 1000,
        "approved": 1000,
        "percentage": 100
      }
    },
    {
      "code": "fr",
      "name": "French",
      "nativeName": "Français",
      "isSource": false,
      "isRTL": false,
      "progress": {
        "total": 1000,
        "translated": 850,
        "approved": 750,
        "percentage": 85
      }
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

---

## PUT /translations/:id

Update a translation.

### Request

**Method**: `PUT`  
**Path**: `/api/v1/translations/:id`  
**Content-Type**: `application/json`

#### Request Body
```json
{
  "translation": "Titre",
  "notes": "Standard translation for title in bibliographic context",
  "status": "reviewed",
  "confidence": 0.95
}
```

### Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "trans_123",
    "elementId": "elem_title",
    "language": "fr",
    "original": "Title",
    "translation": "Titre",
    "notes": "Standard translation for title in bibliographic context",
    "status": "reviewed",
    "confidence": 0.95,
    "translatedBy": "user_456",
    "translatedAt": "2024-01-01T00:00:00Z",
    "reviewedBy": "user_789",
    "reviewedAt": "2024-01-02T00:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

---

## POST /translations/sync

Synchronize translations with Crowdin.

### Request

**Method**: `POST`  
**Path**: `/api/v1/translations/sync`  
**Content-Type**: `application/json`

#### Request Body
```json
{
  "namespaceId": "ns_isbd",
  "version": "1.2.0",
  "languages": ["fr", "es", "de"],
  "direction": "push"
}
```

#### Direction Options
- `push`: Upload source content to Crowdin
- `pull`: Download translations from Crowdin
- `both`: Bidirectional sync

### Response

**Status Code**: `202 Accepted`

```json
{
  "success": true,
  "data": {
    "syncId": "sync_123",
    "status": "in_progress",
    "direction": "push",
    "languages": ["fr", "es", "de"],
    "estimatedCompletion": "2024-01-01T00:05:00Z"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Long Polling for Progress

```javascript
// Poll for sync status
const checkStatus = async (syncId) => {
  const response = await fetch(`/api/v1/translations/sync/${syncId}`);
  const data = await response.json();
  
  if (data.data.status === 'completed') {
    console.log('Sync completed:', data.data.summary);
  } else if (data.data.status === 'failed') {
    console.error('Sync failed:', data.data.error);
  } else {
    // Continue polling
    setTimeout(() => checkStatus(syncId), 2000);
  }
};
```
```

---

## API Client Libraries

### JavaScript/TypeScript SDK

```typescript
import { IFLAClient } from '@ifla/standards-sdk';

const client = new IFLAClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.iflastandards.info/v1'
});

// List projects
const projects = await client.projects.list({
  page: 1,
  limit: 20,
  visibility: 'public'
});

// Import vocabulary
const importResult = await client.vocabularies.import({
  namespaceId: 'ns_isbd',
  spreadsheetUrl: 'https://sheets.google.com/...',
  dctapProfileId: 'profile_isbd',
  dryRun: true
});

// Export RDF
const rdf = await client.vocabularies.exportRDF('vocab_123', {
  format: 'turtle',
  version: '1.2.0'
});
```

### Python SDK

```python
from ifla_standards import IFLAClient

client = IFLAClient(
    api_key='YOUR_API_KEY',
    base_url='https://api.iflastandards.info/v1'
)

# List projects
projects = client.projects.list(
    page=1,
    limit=20,
    visibility='public'
)

# Import vocabulary
import_result = client.vocabularies.import_spreadsheet(
    namespace_id='ns_isbd',
    spreadsheet_url='https://sheets.google.com/...',
    dctap_profile_id='profile_isbd',
    dry_run=True
)

# Export RDF
rdf = client.vocabularies.export_rdf(
    vocabulary_id='vocab_123',
    format='turtle',
    version='1.2.0'
)
```

---

## Webhooks

### Webhook Configuration

```json
{
  "url": "https://your-domain.com/webhooks/ifla",
  "events": ["project.created", "vocabulary.published", "version.released"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "id": "evt_123",
  "type": "vocabulary.published",
  "created": "2024-01-01T00:00:00Z",
  "data": {
    "vocabularyId": "vocab_123",
    "namespaceId": "ns_isbd",
    "version": "1.2.0",
    "publisher": "user_456"
  }
}
```

### Webhook Verification

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return `sha256=${hash}` === signature;
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| INVALID_TOKEN | 401 | Invalid or expired token |
| PERMISSION_DENIED | 403 | Insufficient permissions |
| RESOURCE_NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Input validation failed |
| CONFLICT | 409 | Resource conflict |
| RATE_LIMITED | 429 | Rate limit exceeded |
| SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

---

## Rate Limiting

Rate limits are applied per API key:

| Tier | Requests/Hour | Burst |
|------|---------------|-------|
| Basic | 1,000 | 100 |
| Standard | 10,000 | 500 |
| Premium | 100,000 | 2,000 |

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1672531200
```

---

## Changelog

### Version 1.1.0 (2024-02-01)
- Added translation sync endpoints
- Improved RDF export formats
- Added webhook support

### Version 1.0.0 (2024-01-01)
- Initial API release
- Project management endpoints
- Vocabulary import/export
- Basic authentication