# Admin Architecture Mapping: Laravel to Next.js

## Architecture Translation

### Laravel Structure → Next.js/TypeScript Structure

#### Domain Layer Mapping

**Laravel:**
```
app/Domain/
  Project/
  Namespace/
  Vocabulary/
  Profile/
  ActivityLog/
```

**Next.js Equivalent:**
```
apps/admin/src/
  domains/                    # Business domains
    project/
      types.ts               # TypeScript interfaces
      actions.ts             # Server actions (Next.js 14+)
      services.ts            # Business logic
      repositories.ts        # Data access
      hooks.ts               # React hooks for client
    namespace/
    vocabulary/
    profile/
    activity-log/
  services/                  # Technical services
    github/
    google-sheets/
    rdf/
    translation/
```

### Key Architectural Differences

| Laravel Concept | Next.js/TypeScript Equivalent |
|----------------|------------------------------|
| Actions | Server Actions + API Routes |
| Services | Service classes with dependency injection via context |
| DTOs | TypeScript interfaces/types |
| Repositories | Prisma/Database clients + abstraction layer |
| Events/Listeners | Event emitters or webhook handlers |
| Filament UI | Next.js pages with role-based routing |
| Middleware | Next.js middleware + route handlers |
| Jobs/Queues | Background tasks via GitHub Actions or external queue |

## Updated Domain Model for Next.js

### Core Entities (TypeScript)

```typescript
// User entity - integrated with Clerk + GitHub
interface User {
  id: string;                    // Clerk user ID
  githubId: string;             // GitHub user ID
  email: string;
  name: string;
  avatarUrl?: string;
  githubUsername: string;
  githubAccessToken?: string;    // Encrypted
  roles: {
    system?: 'superadmin';
    projects: ProjectRole[];
    namespaces: NamespaceRole[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectRole {
  projectId: string;
  role: 'admin' | 'editor' | 'viewer';
  assignedAt: Date;
  assignedBy: string;
}

interface NamespaceRole {
  namespaceId: string;
  projectId: string;            // Must be member of project
  role: 'admin' | 'editor' | 'viewer';
  assignedAt: Date;
}

// Project entity
interface Project {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  githubOrg?: string;           // Optional GitHub org association
  namespaces: string[];         // Namespace IDs
  profiles: string[];           // DCTAP Profile IDs
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ProjectSettings {
  requireGitHubAuth: boolean;
  defaultBranch: string;
  autoSync: boolean;
  webhookSecret?: string;
}

// Namespace entity - linked to GitHub repo
interface Namespace {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  githubRepo: GitHubRepoLink;
  vocabularies: string[];       // Vocabulary IDs
  versions: Version[];          // GitHub release tags
  visibility: 'public' | 'private';
  status: 'active' | 'archived';
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface GitHubRepoLink {
  owner: string;               // User or org
  repo: string;
  fullName: string;           // owner/repo
  isPrivate: boolean;
  defaultBranch: string;
  lastSyncedAt?: Date;
  webhookId?: string;
}

interface SyncStatus {
  status: 'synced' | 'syncing' | 'error' | 'pending';
  lastSync?: Date;
  lastError?: string;
  pendingChanges: number;
}

// Vocabulary entity
interface Vocabulary {
  id: string;
  namespaceId: string;
  type: 'element-set' | 'value-vocabulary';
  name: string;
  description?: string;
  prefix: string;              // For RDF generation
  baseUri: string;
  terms: VocabularyTerm[];
  validatedAgainst?: string;   // DCTAP Profile ID
  translations: Translation[];
  metadata: VocabularyMetadata;
  createdAt: Date;
  updatedAt: Date;
}

interface VocabularyTerm {
  id: string;
  term: string;
  label: string;
  definition?: string;
  type?: string;
  broader?: string[];
  narrower?: string[];
  related?: string[];
  examples?: string[];
  notes?: string[];
  source?: string;
  status: 'draft' | 'published' | 'deprecated';
}

// Version entity - GitHub release tag
interface Version {
  id: string;
  namespaceId: string;
  tag: string;                 // GitHub release tag
  name: string;
  description?: string;
  githubReleaseId: string;
  githubUrl: string;
  publishedAt: Date;
  publishedBy: string;
  assets: VersionAsset[];
  isLatest: boolean;
  isPrerelease: boolean;
}

interface VersionAsset {
  type: 'rdf-xml' | 'rdf-turtle' | 'json-ld' | 'csv' | 'xlsx';
  url: string;
  size: number;
  downloadCount: number;
}

// DCTAP Profile entity
interface DCTAPProfile {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: string;
  shapes: DCTAPShape[];
  prefixes: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

interface DCTAPShape {
  shapeId: string;
  shapeLabel: string;
  properties: DCTAPProperty[];
}

interface DCTAPProperty {
  propertyId: string;
  propertyLabel: string;
  mandatory: boolean;
  repeatable: boolean;
  valueNodeType?: string;
  valueDataType?: string;
  valueShape?: string;
  valueConstraint?: string;
  notes?: string;
}

// Activity Log entity
interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  category: 'system' | 'project' | 'namespace' | 'vocabulary' | 'auth';
  resourceType: string;
  resourceId?: string;
  projectId?: string;
  changes?: {
    before: any;
    after: any;
  };
  metadata: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

// Translation entity
interface Translation {
  id: string;
  vocabularyId: string;
  termId: string;
  language: string;
  label: string;
  definition?: string;
  notes?: string;
  status: 'draft' | 'reviewed' | 'approved';
  translatedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Service Architecture

### GitHub Integration Service

```typescript
// apps/admin/src/services/github/types.ts
interface GitHubService {
  // Authentication
  authenticateUser(code: string): Promise<GitHubAuthResult>;
  refreshToken(userId: string): Promise<string>;
  
  // Organization management
  getUserOrgs(userId: string): Promise<GitHubOrg[]>;
  verifyOrgAdmin(userId: string, org: string): Promise<boolean>;
  
  // Repository management
  getUserRepos(userId: string): Promise<GitHubRepo[]>;
  getOrgRepos(org: string): Promise<GitHubRepo[]>;
  createRepo(options: CreateRepoOptions): Promise<GitHubRepo>;
  linkRepo(namespaceId: string, repo: GitHubRepoLink): Promise<void>;
  
  // Version management
  getTags(repo: GitHubRepoLink): Promise<GitHubTag[]>;
  createRelease(options: CreateReleaseOptions): Promise<GitHubRelease>;
  syncVersions(namespaceId: string): Promise<Version[]>;
  
  // Webhook management
  createWebhook(repo: GitHubRepoLink, config: WebhookConfig): Promise<string>;
  validateWebhook(signature: string, payload: any): boolean;
  
  // File operations
  getFile(repo: GitHubRepoLink, path: string, ref?: string): Promise<GitHubFile>;
  createOrUpdateFile(options: FileUpdateOptions): Promise<void>;
  
  // Permission checks
  checkRepoAccess(userId: string, repo: GitHubRepoLink): Promise<boolean>;
}
```

### Google Sheets Integration Service

```typescript
// apps/admin/src/services/google-sheets/types.ts
interface GoogleSheetsService {
  // Sheet management
  createSheet(profile: DCTAPProfile): Promise<GoogleSheet>;
  getSheetData(sheetId: string): Promise<SheetData>;
  
  // Validation
  validateSheet(sheetId: string, profile: DCTAPProfile): Promise<ValidationResult>;
  annotateErrors(sheetId: string, errors: ValidationError[]): Promise<void>;
  
  // Import/Export
  importFromSheet(sheetId: string, vocabularyId: string): Promise<ImportResult>;
  exportToSheet(vocabulary: Vocabulary, sheetId?: string): Promise<string>;
  
  // Permissions
  shareWithServiceAccount(sheetId: string): Promise<void>;
  checkAccess(sheetId: string): Promise<boolean>;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}
```

## Implementation Patterns

### Server Actions Pattern

```typescript
// apps/admin/src/domains/project/actions.ts
'use server';

import { auth } from '@/lib/authorization';
import { projectService } from './services';
import { revalidatePath } from 'next/cache';

export async function createProject(data: CreateProjectInput) {
  // Check authorization
  const canCreate = await auth.canCreateProject();
  if (!canCreate) {
    throw new Error('Unauthorized');
  }
  
  // Validate GitHub org if provided
  if (data.githubOrg) {
    const isAdmin = await githubService.verifyOrgAdmin(userId, data.githubOrg);
    if (!isAdmin) {
      throw new Error('Must be GitHub org admin');
    }
  }
  
  // Create project with initial namespace
  const project = await projectService.createWithNamespace(data);
  
  // Log activity
  await activityLog.log({
    action: 'project.created',
    category: 'project',
    resourceType: 'project',
    resourceId: project.id,
  });
  
  // Revalidate cache
  revalidatePath('/admin/projects');
  
  return project;
}
```

### Repository Pattern with Prisma

```typescript
// apps/admin/src/domains/project/repositories.ts
import { prisma } from '@/lib/prisma';
import type { Project, ProjectRole } from './types';

export class ProjectRepository {
  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        namespaces: true,
        profiles: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }
  
  async findByUser(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        OR: [
          { visibility: 'public' },
          { members: { some: { userId } } },
        ],
      },
      include: {
        namespaces: true,
        _count: {
          select: { members: true },
        },
      },
    });
  }
  
  async create(data: CreateProjectData): Promise<Project> {
    return prisma.project.create({
      data: {
        ...data,
        members: {
          create: {
            userId: data.createdBy,
            role: 'admin',
            assignedBy: data.createdBy,
          },
        },
      },
    });
  }
  
  async addMember(projectId: string, userId: string, role: ProjectRole['role']): Promise<void> {
    await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
        assignedAt: new Date(),
      },
    });
  }
}

export const projectRepository = new ProjectRepository();
```

## Migration Strategy

### Phase 1: Core Infrastructure
1. Set up domain-driven directory structure
2. Define all TypeScript interfaces
3. Create base service classes
4. Set up Prisma schema

### Phase 2: Authentication & Authorization
1. Integrate GitHub OAuth with Clerk
2. Update Cerbos policies for GitHub-based permissions
3. Create user onboarding flow
4. Implement role management

### Phase 3: GitHub Integration
1. Create GitHub service with Octokit
2. Implement repository linking
3. Set up webhook handlers
4. Create version synchronization

### Phase 4: Core Features
1. Project management
2. Namespace management
3. Vocabulary CRUD
4. DCTAP profile validation

### Phase 5: Advanced Features
1. Google Sheets integration
2. RDF generation
3. Translation workflow
4. Activity logging

### Phase 6: UI Implementation
1. Project dashboard
2. Namespace management UI
3. Vocabulary editor
4. Version comparison tools