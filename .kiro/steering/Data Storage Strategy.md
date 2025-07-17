---
inclusion: always
---

# Data Storage Strategy

## Overview

This document outlines the data storage architecture for the IFLA Standards Platform, defining where different types of data are stored, how they should be accessed, and implementation patterns to follow.

## Storage Systems

### 1. Clerk (User & Authentication)

**Purpose**: User identity, authentication state, and minimal user metadata

**Storage Limit**: 8KB per user (combined public and private metadata)

**Stores**:
- User authentication state
- User preferences and settings (minimized format)
- Project roles and permissions
- GitHub OAuth tokens
- Google OAuth tokens
- Cached Review Group memberships

**Implementation Pattern**:
```typescript
// Access user data from Clerk
import { currentUser } from '@clerk/nextjs';

export async function getUserPreferences() {
  const user = await currentUser();
  return user?.publicMetadata?.exp || DEFAULT_PREFERENCES;
}
```

**Storage Optimization**:
- Use abbreviated keys: `exp` instead of `exportPreferences`
- Encode boolean flags: `h1d1e0` instead of separate boolean fields
- Use comma-separated lists instead of arrays
- Store IDs only, reference full data from other sources

### 2. GitHub (Organizational Structure)

**Purpose**: Source of truth for organizational structure

**Stores**:
- Review Groups (as GitHub Teams in `iflastandards` organization)
- Projects (as GitHub Projects)
- Project Teams (as GitHub Project collaborators)
- Source code and static data files

**Access Pattern**:
```typescript
// Fetch GitHub team data
import { getGitHubTeams } from '@ifla/admin/lib/github';

export async function getReviewGroups(userId: string) {
  // Use cached data from Clerk when possible
  const cachedGroups = await getUserCachedGroups(userId);
  if (cachedGroups && !isStale(cachedGroups)) {
    return cachedGroups;
  }
  
  // Fall back to direct GitHub API
  const teams = await getGitHubTeams(userId);
  await cacheGroupsInClerk(userId, teams);
  return teams;
}
```

### 3. File System (Static/Versioned Data)

**Purpose**: Version-controlled static data that defines standards structure

**Stores**:
- Namespace metadata (`namespace.json`)
- Element Set definitions (`element-sets/*.json`)
- Concept Scheme definitions (`concept-schemes/*.json`)
- DCTAP profiles (`dctap/*.json`)
- Build configuration (`docusaurus.config.ts`)

**Directory Structure**:
```
standards/
  {namespace}/
    namespace.json          # Namespace metadata
    element-sets/           # Element set definitions
    concept-schemes/        # Vocabulary definitions
    dctap/                  # DCTAP profiles
    docusaurus.config.ts    # Build-time config
```

**Access Pattern**:
```typescript
// Build-time access (Next.js/Docusaurus)
import { getNamespaceData } from '@ifla/theme/config';

// Runtime API access
export async function getNamespaceAPI(req, res) {
  const { namespace } = req.query;
  const data = await fs.readFile(`standards/${namespace}/namespace.json`);
  return res.json(JSON.parse(data));
}
```

### 4. Supabase (Processing & Dynamic Data)

**Purpose**: Temporary processing data and workflow state

**Stores**:
- Active import sessions
- Processing status and progress
- Validation results
- Workflow state
- Temporary workspace data

**Access Pattern**:
```typescript
// Direct database access with Row Level Security
import { supabase } from '@ifla/admin/lib/supabase';

export async function getActiveImports(userId: string) {
  const { data, error } = await supabase
    .from('import_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');
    
  if (error) throw new Error(error.message);
  return data;
}
```

## Implementation Guidelines

### 1. Data Access Hierarchy

Always follow this access hierarchy:
1. **Memory Cache**: Check in-memory cache first
2. **Clerk Metadata**: For user-specific data
3. **File System**: For standard definitions and schemas
4. **Supabase**: For dynamic processing data
5. **GitHub API**: As last resort (rate limited)

### 2. File System Data Conventions

- All schema files must be valid JSON
- Use kebab-case for filenames
- Include schema version in all files
- Follow consistent naming patterns:
  - `{namespace}/element-sets/{set-name}.json`
  - `{namespace}/concept-schemes/{scheme-name}.json`

### 3. Data Validation

- Validate all file system data against JSON Schema
- Implement runtime validation for API responses
- Use zod for TypeScript validation:

```typescript
import { z } from 'zod';

const NamespaceSchema = z.object({
  id: z.string(),
  label: z.record(z.string(), z.string()),
  description: z.record(z.string(), z.string()),
  version: z.string(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
});

export type Namespace = z.infer<typeof NamespaceSchema>;

// Validate data
const validateNamespace = (data: unknown): Namespace => {
  return NamespaceSchema.parse(data);
};
```

### 4. Error Handling

- Implement graceful fallbacks for missing data
- Log detailed errors but return user-friendly messages
- Cache errors to prevent repeated failures

```typescript
try {
  const data = await fetchNamespaceData(id);
  return data;
} catch (error) {
  console.error(`Failed to fetch namespace ${id}:`, error);
  logErrorToMonitoring(error);
  return DEFAULT_NAMESPACE;
}
```

## Best Practices

### 1. Clerk Storage Optimization

Given the 8KB limit per user, follow these patterns:

```typescript
// AVOID: Verbose storage
const inefficientPreferences = {
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
};

// PREFER: Compressed format
const efficientPreferences = {
  "exp": {
    "fmt": "h1d1e0",  // headers=1, descriptions=1, examples=0
    "lang": "en,fr,es",
    "ns": "isbd",
    "proj": "p1,p2,p3"
  }
};
```

### 2. File System Access

- Use the `fs/promises` API for file operations
- Implement caching for frequently accessed files
- Handle file not found errors gracefully

### 3. Supabase Queries

- Always use parameterized queries
- Implement Row Level Security (RLS) for all tables
- Keep temporary data tables separate from permanent data

### 4. GitHub API Usage

- Minimize direct GitHub API calls
- Implement aggressive caching
- Use webhooks for real-time updates when possible

## Testing Requirements

- Mock file system in unit tests
- Use test fixtures for standard file structures
- Implement integration tests for Supabase interactions
- Test Clerk storage limits with maximum-sized user data

## Common Patterns

### Loading Namespace Data

```typescript
import fs from 'fs/promises';
import path from 'path';

export async function getAllNamespaces() {
  const standardsDir = path.join(process.cwd(), 'standards');
  const namespaces = await fs.readdir(standardsDir);
  
  const namespaceData = await Promise.all(
    namespaces.map(async (namespace) => {
      try {
        const filePath = path.join(standardsDir, namespace, 'namespace.json');
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        console.error(`Error loading namespace ${namespace}:`, error);
        return null;
      }
    })
  );
  
  return namespaceData.filter(Boolean);
}
```

### Updating User Preferences

```typescript
import { clerkClient } from '@clerk/nextjs';

export async function updateUserPreferences(userId: string, preferences: any) {
  // Compress preferences to minimize storage
  const compressedPrefs = compressPreferences(preferences);
  
  // Update Clerk metadata
  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      exp: compressedPrefs
    }
  });
}
```

### Supabase Data Access with RLS

```typescript
// Table definition with RLS
/*
create table import_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  namespace text not null,
  status text not null,
  created_at timestamp with time zone default now(),
  data jsonb
);

-- Row level security
alter table import_sessions enable row level security;

create policy "Users can only access their own import sessions"
  on import_sessions
  for all
  using (user_id = auth.uid());
*/

// Access pattern
const { data, error } = await supabase
  .from('import_sessions')
  .insert({
    user_id: userId,
    namespace: 'isbd',
    status: 'active',
    data: initialData
  })
  .select()
  .single();
```