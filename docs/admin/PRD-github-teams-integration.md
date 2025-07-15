# Product Requirements Document: GitHub Teams Integration

## Executive Summary

Integrate GitHub Teams and Projects with the IFLA Standards Admin Portal to enable role-based access control and project management using GitHub as the source of truth for team membership and organizational structure.

## Problem Statement

The current admin portal uses mock authentication and role management that doesn't reflect the production reality:

- **Production uses GitHub-only authentication** - no email/password login
- **Team memberships are managed in GitHub** - not in our application
- **Users can belong to multiple teams** with different roles in each
- **Projects need cross-team collaboration** beyond rigid team boundaries
- **Navigation is role-specific** rather than showing all user capabilities

## Solution Overview

### Core Concepts

1. **GitHub Teams = IFLA Review Groups** (1:1 mapping)
   - 5 permanent teams matching IFLA's organizational structure
   - Team membership determines review group access
   - Team maintainers = Review Group administrators

2. **GitHub Projects = Ad-hoc Working Groups**
   - Temporary project teams drawn from multiple review groups
   - Project-specific roles and permissions
   - Lifecycle matches project duration

3. **User-Centric Navigation**
   - Navbar shows ALL accessible areas for the user
   - Dashboards provide contextual, role-appropriate interfaces
   - Personal dashboard aggregates all roles and activities

## User Stories

### As a System Administrator
- I can manage all review groups and projects across the organization
- I can see system-wide analytics and activity
- I can assign review group administrators

### As a Review Group Administrator
- I can manage my team's membership through GitHub
- I can create projects and assign team members
- I can invite members from other teams to collaborate

### As an Editor/Author
- I can see all namespaces I have access to
- I can work on multiple projects across different teams
- I can switch contexts easily between projects

### As a Translator
- I can access specific namespaces for translation
- I can see only the projects I'm assigned to
- I can work independently of review group membership

## Functional Requirements

### 1. Authentication & Authorization

- **GitHub OAuth** as the only production authentication method
- **Role extraction** from GitHub team membership
- **Permission caching** in Clerk metadata (8KB limit)
- **Multi-team support** with role inheritance

### 2. Navigation Structure

#### User-Centric Navbar
- Personal dashboard link (always visible)
- Review Group admin sections (for maintainers)
- Namespace dropdown (all accessible namespaces)
- Projects dropdown (all active projects)
- User profile/settings

#### Contextual Dashboards
- `/dashboard` - Personal aggregated view
- `/dashboard/rg/[slug]` - Review group administration
- `/dashboard/namespace/[namespace]` - Namespace-specific tools
- `/dashboard/project/[projectId]` - Project workspace

### 3. Team Management

- **List team members** with their roles
- **Add/remove members** (syncs to GitHub)
- **Change member roles** (maintainer/member)
- **Create projects** for the team
- **View team activity** and metrics

### 4. Project Management

- **Create cross-team projects**
- **Assign members** from any review group
- **Define project-specific roles** (lead, editor, reviewer, translator)
- **Set namespace permissions** per project
- **Track project lifecycle**

### 5. Data Synchronization

- **Post-login sync** of GitHub team data
- **Webhook updates** for team changes
- **Manual sync option** for administrators
- **Conflict resolution** for permission changes

## Non-Functional Requirements

### Performance
- Dashboard load time < 2 seconds
- GitHub sync completion < 30 seconds
- Navbar render < 100ms

### Scalability
- Support 100+ users across teams
- Handle 20+ active projects
- Manage 10+ namespaces per user

### Security
- GitHub OAuth tokens encrypted at rest
- Permission checks on every request
- Audit logging for all changes
- No sensitive data in public metadata

### Constraints
- Clerk metadata limit: 8KB per user
- GitHub API rate limits (5000/hour authenticated)
- Next.js App Router architecture
- Material-UI component library

## Success Metrics

1. **Authentication Success Rate** > 99%
2. **Correct Dashboard Display** for 100% of test users
3. **GitHub Sync Reliability** > 99.5%
4. **Metadata Size** < 6KB average (75% of limit)
5. **User Navigation Time** < 5 seconds to any section

## Test Users

| Email | Role | Expected Access |
|-------|------|-----------------|
| superadmin+clerk_test@example.com | System Admin | All review groups, all projects |
| rg_admin+clerk_test@example.com | RG Admin | 1-2 review groups as maintainer |
| editor+clerk_test@example.com | Editor | Multiple teams as member |
| author+clerk_test@example.com | Author | Single team as member |
| translator+clerk_test@example.com | Translator | Project-specific access only |
| jphipps@madcreek.com | Real Superadmin | Production testing |

## Technical Architecture

### Data Flow
```
GitHub OAuth → Clerk Authentication → Metadata Sync → Application State
                                          ↓
                                    GitHub Teams API
```

### Component Architecture
```
Navbar (User-Centric)
  ├── User Menu
  ├── Dashboard Link
  ├── RG Admin Links (conditional)
  ├── Namespace Dropdown
  └── Projects Dropdown

Dashboards (Contextual)
  ├── Personal Dashboard (aggregated)
  ├── RG Admin Dashboard (team-specific)
  ├── Namespace Dashboard (content-specific)
  └── Project Dashboard (project-specific)
```

## Implementation Phases

1. **Foundation** - Documentation and architecture
2. **Current State Fix** - Repair existing dashboard routing
3. **Navigation Refactor** - User-centric navbar
4. **GitHub Integration** - Mock then real implementation
5. **Team Management** - RG admin features
6. **Testing** - All user scenarios
7. **Production** - Real GitHub integration

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|---------|------------|
| Clerk 8KB limit exceeded | High | Compress data, store only essential fields |
| GitHub API rate limits | Medium | Implement caching, batch operations |
| Complex permission conflicts | Medium | Clear precedence rules, audit logging |
| Migration from mock data | Low | Parallel run period, data validation |

## Dependencies

- GitHub Organization with Teams configured
- Clerk authentication with GitHub OAuth
- GitHub API access tokens
- Test user accounts in Clerk

## Timeline

- **Week 1**: Documentation and current state fixes
- **Week 2**: Navigation refactor and mock data
- **Week 3**: GitHub integration layer
- **Week 4**: Team management UI
- **Week 5**: Testing and refinement
- **Week 6**: Production deployment

## Approvals

- [ ] Engineering Lead
- [ ] Product Owner
- [ ] Security Review
- [ ] UX Review