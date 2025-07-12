# Teams and Review Groups Structure

## Overview

This document defines the organizational structure for IFLA Standards Development Platform, introducing the concepts of Review Groups and Teams to provide flexible, scalable collaboration while maintaining clear governance and permissions.

## Key Concepts

### Review Groups
Review Groups are **perpetual entities** that manage related standards and namespaces. Unlike GitHub's finite "projects", Review Groups represent ongoing organizational units within IFLA.

**Examples:**
- ISBD Review Group (International Standard Bibliographic Description)
- BCM Review Group (Bibliographic Conceptual Models)
- ICP Review Group (International Cataloguing Principles)
- PUC Review Group (Permanent UNIMARC Committee)

### Teams
Teams are **collaborative units** within Review Groups that enable flexible role assignment across multiple namespaces while maintaining consistent permissions.

**Key Characteristics:**
- Belong to ONE Review Group
- Can be assigned to MULTIPLE namespaces
- Members have consistent roles across all assigned namespaces
- Enable cross-namespace collaboration

### Namespaces
Technical vocabulary collections managed by Review Groups.

**Examples:**
- `isbd`, `isbdm` (managed by ISBD Review Group)
- `lrm`, `frbr`, `frad` (managed by BCM Review Group)
- `muldicat` (managed by ICP Review Group)
- `unimarc` (managed by PUC Review Group)

## Data Model

```typescript
// Core Entities
interface ReviewGroup {
  id: string;
  slug: string;              // e.g., "isbd", "bcm"
  name: string;              // e.g., "ISBD Review Group"
  description: string;
  namespaces: Namespace[];   // Namespaces managed by this RG
  teams: Team[];             // Teams within this RG
  admins: User[];            // RG administrators
  createdAt: Date;
  updatedAt: Date;
}

interface Team {
  id: string;
  name: string;              // e.g., "ISBD Editorial Team"
  description: string;
  reviewGroup: ReviewGroup;  // Parent Review Group
  members: TeamMember[];     // Team members with roles
  assignedNamespaces: Namespace[]; // Namespaces this team works on
  createdAt: Date;
  updatedAt: Date;
}

interface TeamMember {
  id: string;
  user: User;
  team: Team;
  role: TeamRole;
  joinedAt: Date;
}

type TeamRole = 'editor' | 'reviewer' | 'translator';

interface User {
  id: string;
  email: string;
  name: string;
  githubUsername?: string;
  teamMemberships: TeamMember[]; // All team memberships
  reviewGroupAdminOf: ReviewGroup[]; // RGs where user is admin
  createdAt: Date;
  updatedAt: Date;
}

interface Namespace {
  id: string;
  slug: string;              // e.g., "isbd", "lrm"
  name: string;              // e.g., "International Standard Bibliographic Description"
  description: string;
  reviewGroup: ReviewGroup;  // Managing Review Group
  assignedTeams: Team[];     // Teams working on this namespace
  vocabularies: Vocabulary[];
  elementSets: ElementSet[];
  dctapProfiles: DCTAPProfile[]; // Exactly 2 profiles
  createdAt: Date;
  updatedAt: Date;
}

interface Vocabulary {
  id: string;
  name: string;
  namespace: Namespace;
  versions: VocabularyVersion[];
}

interface ElementSet {
  id: string;
  name: string;
  namespace: Namespace;
  elements: Element[];
}

interface DCTAPProfile {
  id: string;
  name: string;              // e.g., "Minimum", "Recommended"
  namespace: Namespace;
  constraints: ProfileConstraint[];
}
```

## Business Rules

### Review Group Rules
1. Each Review Group manages one or more namespaces
2. Review Groups have designated administrators
3. Review Groups contain one or more teams
4. Review Groups are perpetual (no end date)

### Team Rules
1. Teams belong to exactly ONE Review Group
2. Teams can be assigned to MULTIPLE namespaces within their Review Group
3. Team members maintain the same role across all namespaces the team is assigned to
4. Teams cannot work on namespaces outside their Review Group

### User Rules
1. Users can be members of multiple teams
2. Users can have different roles in different teams
3. Users can be administrators of multiple Review Groups
4. A user's effective permissions for a namespace depend on their team memberships

### Namespace Rules
1. Each namespace belongs to exactly ONE Review Group
2. Namespaces can have multiple teams assigned to them
3. Namespaces must have exactly 2 DCTAP profiles
4. Namespaces contain one or more vocabularies and element sets

## Permission Model

### Hierarchical Permissions

```typescript
interface Permissions {
  // System Level
  'system-admin': boolean;         // Full system access
  'ifla-admin': boolean;          // IFLA-wide administration
  
  // Review Group Level
  '{rg}-admin': boolean;          // Admin of specific Review Group
  
  // Team Level (derived from team membership)
  'namespace:{ns}:edit': boolean;    // Editor permissions
  'namespace:{ns}:review': boolean;  // Reviewer permissions
  'namespace:{ns}:translate': boolean; // Translator permissions
}
```

### Permission Inheritance

1. **System Admins** can do everything
2. **IFLA Admins** can manage all Review Groups
3. **Review Group Admins** can:
   - Create/manage teams within their RG
   - Assign teams to namespaces within their RG
   - Manage RG settings and members
4. **Team Members** inherit permissions based on:
   - Their role in the team (editor/reviewer/translator)
   - Which namespaces their team is assigned to

## Use Cases

### Scenario 1: Cross-Namespace Editorial Work
The ISBD Review Group has multiple namespaces (`isbd`, `isbdm`, planned expansions). They create an "ISBD Editorial Team" with editors who need to work across all ISBD namespaces.

- Team is assigned to all ISBD namespaces
- Editors have consistent permissions across all assigned namespaces
- New namespaces can be added to the team's assignments as created

### Scenario 2: Specialized Translation Team
The BCM Review Group creates a "French Translation Team" specifically for French translations.

- Team members all have the "translator" role
- Team is assigned to `lrm`, `frbr`, and `frad` namespaces
- Translators can work across all BCM namespaces with consistent permissions

### Scenario 3: Multi-Team Membership
A user is both an editor and a translator:

- Member of "ISBD Editorial Team" as an editor
- Member of "Spanish Translation Team" as a translator
- Has edit permissions on ISBD namespaces
- Has translation permissions on assigned namespaces for Spanish team

## Implementation Considerations

### Database Schema
- Many-to-many relationships between teams and namespaces
- Role stored at the team membership level
- Efficient permission checking through indexed lookups

### User Interface
- Review Group dashboard showing all teams and namespaces
- Team management interface for adding/removing members
- Namespace view showing all assigned teams
- User profile showing all team memberships

### Integration Points
- GitHub team synchronization
- Cerbos policy generation from team assignments
- Activity tracking by team and namespace
- Audit trails for all team/permission changes

## Migration Strategy

### From Current System
1. Convert existing "projects" to Review Groups
2. Create initial teams based on current user roles
3. Assign teams to appropriate namespaces
4. Migrate user permissions to team-based model

### Data Preservation
- All existing permissions maintained
- Audit trail of migration preserved
- Rollback capability if needed

## Benefits

1. **Flexibility**: Teams can work across namespaces without complex permission management
2. **Clarity**: Clear separation between Review Groups (organizational) and GitHub projects (tasks)
3. **Scalability**: Easy to add new namespaces to existing teams
4. **Simplicity**: Users have consistent roles within a team
5. **Governance**: Maintains IFLA's organizational structure while enabling collaboration