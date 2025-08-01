# RBAC (Role-Based Access Control) Implementation Plan

## Overview
This document outlines the implementation of a comprehensive role-based access control system for IFLA Standards using Cerbos for policy management. The system supports review group-based permissions, site-specific permissions, and interactive role testing capabilities.

## Key Concepts

### 1. Review Groups (RG)
- Each review group (rg) represents a standards committee responsible for managing related standards
- IFLA currently has 4 review groups:
  - **ICP** (International Cataloguing Principles): MulDiCat
  - **BCM** (Bibliographic Conceptual Models): LRM, FRBR, FRAD, FRBRer, FRBRoo, FRSAD
  - **ISBD** (International Standard Bibliographic Description): ISBD, ISBDM, ISBDW, ISBDE, ISBDI, ISBDAP, ISBDAC, ISBDN, ISBDP, ISBDT
  - **PUC** (Permanent UNIMARC Committee): UNIMARC elements (OXX, 1XX-8XX)
- Review groups have members with different responsibilities
- Review groups can contain multiple sites (e.g., ISBD review group contains both isbd and isbdm sites)

### 2. Three-Tier Permission Model
```
System Level (Global)
    └── Review Group Level (RG)
            └── Site Level (Individual Site)
```

- **System Level**: Global administrators managing entire system
- **Review Group Level**: Review group administrators managing their review group
- **Site Level**: Site administrators managing individual sites

### 3. Role Types

#### Administrative Roles
- `system-admin`: Full system administration
- `ifla-admin`: IFLA organization admin
- `{rg}-admin`: Full control of review group (e.g., `isbd-admin`)
- `{site}-admin`: Site administration (e.g., `isbdm-admin`)

#### Editorial Roles
- `{rg}-editor`: Edit content across review group
- `{rg}-reviewer`: Review/approve changes in review group
- `{rg}-contributor`: Propose changes in review group
- `{site}-editor`: Edit specific site content
- `{site}-contributor`: Contribute to specific site

#### Specialized Roles
- `{rg}-translator`: Translate content in review group
- `{site}-translator`: Translate specific site content

### 4. Technology Stack
- **Authorization**: Cerbos (policy-as-code)
- **Authentication**: NextAuth with GitHub OAuth
- **Policy Management**: Cerbos Hub (GitOps)
- **Development Testing**: Mock authentication provider
- **User Data**: Private GitHub repository (future: Supabase cache)

## Implementation Epics

### Epic 1: Cerbos Policy Framework
**Goal**: Establish authorization policies for review group and site permissions  
**Value**: Declarative, version-controlled permission management

### Epic 2: Interactive Role Testing Tool
**Goal**: Enable developers to test different role scenarios interactively  
**Value**: Rapid development and debugging of permission-based features

### Epic 3: Mock Authentication System
**Goal**: Support role-based testing without real GitHub accounts  
**Value**: Comprehensive testing coverage for all role combinations

### Epic 4: User Administration Interface
**Goal**: Enable admins to manage user roles at appropriate levels  
**Value**: Self-service role management reducing developer overhead

### Epic 5: E2E Testing Framework
**Goal**: Automated testing of role-based access scenarios  
**Value**: Confidence in permission system correctness

## Detailed Task List

### Phase 1: Cerbos Setup (Epic 1)

#### Task 1.1: Create Cerbos Directory Structure ✅
- [x] Create `cerbos/` directory
- [x] Create `cerbos/policies/` directory
- [x] Create `cerbos/fixtures/` directory
- [x] Create `cerbos/.cerbos-hub.yaml` configuration

#### Task 1.2: Define Resource Policies ✅
- [x] Create `resource_rg.yaml` - review group permissions
- [x] Create `resource_site.yaml` - site permissions
- [x] Create `resource_user_admin.yaml` - user management permissions
- [x] Create `resource_translation.yaml` - translation permissions

#### Task 1.3: Define Role Derivations ✅
- [x] Create `derived_roles.yaml` with rg/site role logic
- [x] Define role inheritance rules
- [x] Add translator role with language attributes

#### Task 1.4: Create Test Fixtures ✅
- [x] Create user fixtures for each role type
- [x] Create rg/site resource fixtures
- [x] Create permission test scenarios

#### Task 1.5: Set up Cerbos Hub
- [ ] Sign up for Cerbos Hub account
- [ ] Connect GitHub repository
- [ ] Configure policy sync
- [ ] Test policy deployment

### Phase 2: Interactive Testing Tool (Epic 2)

#### Task 2.1: Create Base Testing Script ✅
- [x] Create `scripts/test-admin-roles.js`
- [x] Add command-line argument parsing
- [x] Add interactive prompt system
- [x] Add to package.json as `pnpm test:admin:roles`

#### Task 2.2: Implement Role Selection
- [ ] Add role hierarchy menu
- [ ] Add review group selection (dynamic from config)
- [ ] Add site selection (filtered by review group)
- [ ] Add custom role combination support

#### Task 2.3: Integrate with Cerbos
- [ ] Create `apps/admin-portal/src/lib/cerbos.ts` client
- [ ] Add permission checking in test script
- [ ] Display permission results interactively

#### Task 2.4: Connect to Demo Script
- [ ] Integrate with existing `demo:admin:simple`
- [ ] Pass mock auth credentials
- [ ] Start servers with role context

### Phase 3: Mock Authentication (Epic 3)

#### Task 3.1: Update NextAuth Configuration
- [ ] Add Credentials provider for development
- [ ] Support mock user sessions
- [ ] Add role attributes to session

#### Task 3.2: Create Mock User System
- [ ] Create `apps/admin-portal/src/lib/mock-auth.ts`
- [ ] Define mock user generator
- [ ] Support role combinations

#### Task 3.3: Add Development Indicators
- [ ] Visual indicator for mock auth
- [ ] Display current mock user/roles
- [ ] Add role switcher in dev mode

### Phase 4: Admin Interface Foundation (Epic 4)

#### Task 4.1: Create Role Management Types
- [ ] Define TypeScript interfaces for roles
- [ ] Create role assignment types
- [ ] Add validation schemas

#### Task 4.2: Design API Routes
- [ ] Plan user listing endpoints
- [ ] Plan role assignment endpoints
- [ ] Plan permission checking endpoints

#### Task 4.3: Create UI Mockups
- [ ] System admin dashboard design
- [ ] Review group admin interface design
- [ ] Site admin interface design

### Phase 5: E2E Testing (Epic 5)

#### Task 5.1: Update Auth Helpers
- [ ] Enhance `e2e/utils/auth-helpers.ts`
- [ ] Add rg/site role support
- [ ] Create role-based test users

#### Task 5.2: Create Role Test Scenarios
- [ ] System admin full access test
- [ ] Review group admin scoped access test
- [ ] Site admin limited access test
- [ ] Translator workflow test

#### Task 5.3: Add Permission Tests
- [ ] Test permission inheritance
- [ ] Test permission denial
- [ ] Test role combinations

## Usage Examples

### Interactive Role Testing
```bash
# Interactive mode - prompts for role and site selection
pnpm test:admin:roles

# Command-line mode - direct role specification
pnpm test:admin:roles --role rg-admin --rg ISBD
pnpm test:admin:roles --role site-admin --site isbdm
pnpm test:admin:roles --role translator --rgs ISBD,BCM
```

### E2E Testing with Roles
```typescript
// Test review group admin capabilities
await setupMockAuth(context, {
  username: 'test-rg-admin',
  roles: ['user'],
  rgs: { ISBD: 'admin' }
});

// Test multi-review group translator
await setupMockAuth(context, {
  username: 'test-translator',
  roles: ['user'],
  rgs: { 
    ISBD: 'translator',
    BCM: 'translator'
  },
  languages: ['en', 'es', 'fr']
});
```

### Cerbos Policy Example
```yaml
# Check if user can edit a site
principal:
  id: "user123"
  roles: ["user"]
  attributes:
    rgs:
      ISBD: "editor"
    sites:
      isbdm: "admin"

resource:
  kind: "site"
  id: "isbdm"
  attributes:
    rg: "ISBD"
    siteKey: "isbdm"

actions: ["edit", "manage", "delete"]
```

## File Structure
```
standards-dev/
├── cerbos/
│   ├── policies/
│   │   ├── resource_rg.yaml           # Review group permissions
│   │   ├── resource_site.yaml         # Site permissions
│   │   ├── resource_user_admin.yaml   # User management permissions
│   │   ├── resource_translation.yaml  # Translation permissions
│   │   └── derived_roles.yaml         # Role derivations
│   ├── fixtures/
│   │   ├── users/                     # Test user configurations
│   │   └── resources/                 # Test resources
│   └── .cerbos-hub.yaml              # Cerbos Hub configuration
├── scripts/
│   ├── test-admin-roles.js           # Interactive role tester
│   ├── sync-cerbos-policies.js       # Policy sync helper
│   └── generate-test-users.js        # Test user generator
└── apps/admin-portal/
    └── src/
        ├── lib/
        │   ├── auth.ts               # NextAuth with mock provider
        │   ├── cerbos.ts             # Cerbos client
        │   ├── mock-auth.ts          # Mock authentication
        │   └── roles.ts              # Role definitions
        └── app/
            └── admin/
                ├── users/             # User management UI
                └── roles/             # Role assignment UI
```

## Security Considerations

1. **Development vs Production**
   - Mock authentication only available in NODE_ENV=development
   - Visual indicators show when using mock auth
   - Production uses GitHub OAuth exclusively

2. **Policy Management**
   - All Cerbos policies version controlled in Git
   - Changes require PR review
   - Cerbos Hub provides audit trail

3. **Data Protection**
   - User role assignments in private repository
   - No sensitive data in Cerbos policies
   - Server-side permission checks only

4. **Future Considerations**
   - Migration path to GitHub Enterprise
   - Potential Supabase integration for performance
   - Crowdin integration for translator workflows

## Success Criteria

- [ ] Developers can test any role combination interactively
- [ ] Cerbos policies correctly enforce rg/site boundaries
- [ ] Mock authentication works seamlessly in development
- [ ] E2E tests cover all major role scenarios
- [ ] Admins can manage users at their permission level
- [ ] Documentation enables new developers to understand system

## Next Steps

1. Complete Cerbos policy definitions
2. Build interactive role testing tool
3. Implement mock authentication
4. Create basic admin UI components
5. Develop comprehensive E2E tests

## References

- [Cerbos Documentation](https://docs.cerbos.dev)
- [Cerbos Hub](https://hub.cerbos.dev)
- [NextAuth Documentation](https://next-auth.js.org)
- [IFLA Standards Repository](https://github.com/iflastandards/standards-dev)