# Authentication & Authorization Architecture

## Overview

This document defines the authentication and authorization architecture for the IFLA Standards Development Platform, using Clerk for both identity management and role-based authorization, integrated with GitHub Projects for project management.

**Note**: This architecture has been simplified from the original Clerk+Cerbos design to use Clerk-only authorization for better maintainability and reduced complexity.

## Architecture Components

### 1. Authentication & Identity (Clerk)

**Purpose**: Handle all user authentication, onboarding, and role-based authorization

**Key Features**:
- **User Onboarding**: Streamlined signup flow for both IFLA members and external contributors
- **Organizations**: Review Groups as Clerk organizations with proper role hierarchy
- **User Metadata**: Comprehensive role structure stored in Clerk user metadata
- **Role-Based Authorization**: Built-in authorization logic using user metadata

**Implementation**:
```typescript
// Clerk user metadata structure
interface UserMetadata {
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
}
```

### 2. Authorization Logic (Built-in)

**Purpose**: Enforce fine-grained permissions based on user roles and resource context

**Key Features**:
- **Role Hierarchy**: Clear permission levels from superadmin to translator
- **Context-Aware**: Decisions based on user role + namespace + review group
- **Resource-Based**: Different permissions for different resource types
- **Maintainable**: Simple TypeScript functions instead of external policy engine

**Policy Structure**:
```yaml
# Example Cerbos policy for namespace access
apiVersion: api.cerbos.dev/v1
resourcePolicy:
  version: "default"
  resource: "namespace"
  rules:
    - actions: ["edit"]
      effect: EFFECT_ALLOW
      roles: ["editor"]
      condition:
        match:
          expr: P.attr.projectId in request.principal.attr.projectIds
    
    - actions: ["review"]
      effect: EFFECT_ALLOW
      roles: ["reviewer"]
      condition:
        match:
          expr: P.attr.projectId in request.principal.attr.projectIds
```

### 3. Project Management (GitHub Projects)

**Purpose**: Track work, manage tasks, and coordinate team activities

**Key Features**:
- **Project Boards**: Kanban/table views for task management
- **Issue Integration**: Link issues and PRs to projects
- **Milestone Tracking**: Deliverables and timeline management
- **Team Sync**: Integrate with Clerk teams for access control

## Integration Architecture

### User Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Clerk
    participant A as Admin Portal
    participant CB as Cerbos
    participant GH as GitHub

    Note over U,GH: Project Team Invitation Flow
    
    U->>C: Accept invitation email
    C->>C: Create/update user account
    C->>C: Assign project role metadata
    C->>A: Redirect to admin portal
    
    A->>C: Get user + metadata
    A->>CB: Check permissions with context
    CB->>CB: Evaluate policies
    CB->>A: Return authorization decision
    
    A->>GH: Sync team membership
    GH->>GH: Grant repository access
    
    Note over U,GH: User now has appropriate access
```

### Data Flow

1. **Clerk → Cerbos**: Pass user metadata for authorization
2. **Cerbos → Application**: Return permission decisions
3. **Application → GitHub**: Sync team memberships based on permissions
4. **GitHub → Clerk**: Webhook updates for team changes

## Implementation Details

### Clerk Configuration

```typescript
// Clerk webhook handler for team updates
export async function handleClerkWebhook(event: WebhookEvent) {
  switch (event.type) {
    case 'user.created':
      // Set up default permissions
      await createUserInCerbos(event.data);
      break;
      
    case 'user.updated':
      // Sync role changes to Cerbos
      await updateUserPermissions(event.data);
      break;
      
    case 'organizationMembership.created':
      // Add to GitHub team
      await syncGitHubTeam(event.data);
      break;
  }
}
```

### Cerbos Integration

```typescript
// Cerbos client setup
import { GRPC } from "@cerbos/grpc";

const cerbos = new GRPC({
  hostname: process.env.CERBOS_HOST,
  tls: true,
});

// Authorization check
export async function canUserEditNamespace(
  user: ClerkUser,
  projectId: string,
  namespaceId: string
) {
  const result = await cerbos.checkResource({
    principal: {
      id: user.id,
      roles: [user.role],
      attributes: {
        projectIds: user.projectMemberships.map(p => p.projectId),
        reviewGroups: user.reviewGroupAdmin || [],
      },
    },
    resource: {
      kind: "namespace",
      id: namespaceId,
      attributes: {
        projectId,
        reviewGroup: getNamespaceReviewGroup(namespaceId),
      },
    },
    actions: ["edit"],
  });
  
  return result.isAllowed("edit");
}
```

### GitHub Integration

```typescript
// Sync Clerk teams to GitHub
export async function syncProjectTeamToGitHub(
  projectId: string,
  teamMembers: ClerkUser[]
) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  // Get or create GitHub team
  const team = await octokit.teams.getByName({
    org: "iflastandards",
    team_slug: `project-${projectId}`,
  });
  
  // Sync members
  for (const member of teamMembers) {
    if (member.githubUsername) {
      await octokit.teams.addOrUpdateMembershipForUserInOrg({
        org: "iflastandards",
        team_slug: team.slug,
        username: member.githubUsername,
        role: member.role === 'editor' ? 'maintainer' : 'member',
      });
    }
  }
}
```

## Security Considerations

### Authentication Security
- **MFA Required**: For Review Group admins and editors
- **Session Management**: 24-hour sessions with refresh tokens
- **Email Verification**: Required for all accounts
- **Rate Limiting**: Prevent brute force attacks

### Authorization Security
- **Principle of Least Privilege**: Users only get necessary permissions
- **Context-Aware**: Permissions evaluated with full context
- **Audit Logging**: All authorization decisions logged
- **Policy Version Control**: All policy changes tracked in Git

### Integration Security
- **Webhook Validation**: Verify all webhook signatures
- **API Authentication**: Secure API keys with rotation
- **TLS Everywhere**: All communications encrypted
- **Secret Management**: Use environment variables and key vaults

## Benefits

1. **Streamlined Onboarding**: Clerk handles complex invitation flows
2. **Fine-Grained Control**: Cerbos enables sophisticated permission rules
3. **Familiar Tools**: GitHub Projects for project management
4. **External Participation**: Easy to invite non-IFLA contributors
5. **Audit Compliance**: Complete trail of access decisions
6. **Scalability**: Each component scales independently

## Migration Path

### Phase 1: Clerk Integration
1. Set up Clerk organization
2. Configure authentication flows
3. Migrate existing users
4. Enable invitations

### Phase 2: Cerbos Deployment
1. Deploy Cerbos PDP
2. Define initial policies
3. Integrate with Clerk metadata
4. Test authorization flows

### Phase 3: GitHub Sync
1. Create GitHub teams structure
2. Implement sync webhooks
3. Map Clerk roles to GitHub permissions
4. Enable automated team management

### Phase 4: Full Integration
1. Enable all integration points
2. Monitor and optimize
3. Train administrators
4. Document workflows