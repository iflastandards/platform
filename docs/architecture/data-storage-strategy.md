# Data Storage Strategy

## Overview

This document outlines the data storage architecture for the IFLA Standards Platform, defining where different types of data are stored and why.

## Storage Systems

### 1. Clerk (User & Authentication)
**Purpose**: User identity, preferences, and cached organizational data

**Storage Limit**: 8KB per user (combined public and private metadata)

**Stores**:
- User preferences and settings (minimized format)
- Project roles and permissions
- GitHub OAuth tokens
- Google OAuth tokens
- Cached Review Group memberships (from GitHub Teams)
- Cached Project memberships (from GitHub Projects)

**Space Optimization Strategies**:
- Store user export preferences in compressed format
- Use short keys and minimal JSON structure
- Cache only essential data (IDs, not full objects)
- Regularly clean up stale cache entries
- Consider storing detailed preferences in Supabase with just IDs in Clerk

**Access Pattern**: Direct API calls, available at runtime

### 2. GitHub (Organizational Structure)
**Purpose**: Primary source of truth for organizational structure and version control

**Stores**:
- Review Groups (as GitHub Teams in `iflastandards` organization)
- Projects (as GitHub Projects)
- Project Teams (as GitHub Project collaborators)
- Source code and static data files

**Access Pattern**: GitHub API with caching in Clerk

### 3. File System (Static/Versioned Data)
**Purpose**: Version-controlled static data that defines standards structure

**Stores**:
- Namespace metadata (`namespace.json`)
- Element Set definitions (`element-sets/*.json`)
- Concept Scheme definitions (`concept-schemes/*.json`)
- DCTAP profiles (`dctap/*.json`)
- Build configuration (`docusaurus.config.ts`)

**Structure**:
```
standards/
  isbd/
    namespace.json          # Namespace metadata
    element-sets/
      isbd-core.json       # Element set definitions
      isbd-areas.json
    concept-schemes/
      content-types.json   # Vocabulary definitions
      media-types.json
    dctap/
      element-sets.json    # DCTAP for element sets
      vocabularies.json    # DCTAP for concept schemes
    docusaurus.config.ts   # Build-time config
```

**Access Pattern**: 
- Build time: Direct imports
- Runtime: File system reads via API endpoints
- All changes require commits for version control

### 4. Supabase (Processing & Dynamic Data)
**Purpose**: Temporary processing data and workflow state

**Stores**:
- Active import sessions
- Processing status and progress
- Validation results
- Workflow state
- Adoption "birth certificates"
- Temporary workspace data

**Access Pattern**: Direct database queries with Row Level Security

## Decision Rationale

### Why File System for Metadata?

1. **Version Control**: All schema changes are tracked in Git
2. **Review Process**: Changes go through PR review
3. **Build Performance**: No database calls during build
4. **Deployment Simplicity**: Static files deploy with code
5. **Single Source of Truth**: GitHub repository

### Why Supabase for Processing?

1. **Dynamic Updates**: Real-time status changes
2. **Queryability**: Filter and search capabilities
3. **Temporary Data**: Can be cleaned up after processing
4. **User Isolation**: RLS for user-specific data

## Implementation Guidelines

### Adding New Metadata

1. **Namespace**: Create `standards/{namespace}/namespace.json`
2. **Element Set**: Add to `standards/{namespace}/element-sets/`
3. **Concept Scheme**: Add to `standards/{namespace}/concept-schemes/`
4. **DCTAP**: Update `standards/{namespace}/dctap/`

All additions require:
- Pull request
- Review by team
- Commit to main branch
- Automatic deployment

### API Access Patterns

```typescript
// List namespaces from file system
GET /api/namespaces
// Reads all namespace.json files

// Get specific namespace
GET /api/namespaces/{id}
// Reads standards/{id}/namespace.json

// Get element sets for namespace
GET /api/namespaces/{id}/element-sets
// Reads standards/{id}/element-sets/*.json
```

### Caching Strategy

1. **Build Time**: Next.js static generation caches file content
2. **Runtime**: API endpoints can implement memory caching
3. **Client**: React Query or SWR for client-side caching

## Clerk Storage Optimization

### User Export Preferences Example

Given the 8KB limit, here's how to efficiently store user preferences:

```typescript
// Inefficient (verbose keys, nested objects)
{
  "exportPreferences": {
    "spreadsheetFormat": {
      "includeHeaders": true,
      "includeDescriptions": true,
      "includeExamples": false,
      "languageColumns": ["en", "fr", "es"]
    },
    "defaultNamespace": "isbd",
    "lastUsedProjects": ["project-1", "project-2", "project-3"]
  }
}

// Efficient (compressed format)
{
  "exp": {
    "fmt": "h1d1e0",  // headers=1, descriptions=1, examples=0
    "lang": "en,fr,es",
    "ns": "isbd",
    "proj": "p1,p2,p3"
  }
}
```

### Storage Guidelines

1. **Use abbreviated keys**: `exp` instead of `exportPreferences`
2. **Encode boolean flags**: `h1d1e0` instead of separate boolean fields
3. **Comma-separated lists**: `"en,fr,es"` instead of arrays
4. **Store IDs only**: Reference full data from GitHub/filesystem
5. **Regular cleanup**: Remove unused preferences periodically

## Migration Notes

- Existing Supabase namespace data should be migrated to file system
- Keep Supabase tables for processing workflows only
- GitHub Teams/Projects integration to be implemented
- Monitor Clerk storage usage and optimize as needed