# Epic: GitHub Teams Integration for IFLA Admin Portal

**Epic Owner**: Engineering Team  
**Status**: 🚧 In Progress  
**Target Completion**: 6 weeks  

## Overview

Implement GitHub Teams as the source of truth for IFLA Review Groups and enable multi-team membership with user-centric navigation.

---

## Phase 1: Foundation & Documentation ✅

### Documentation Tasks
- [x] Create PRD document
- [ ] Create architecture documentation
  - [ ] System overview diagrams
  - [ ] Data flow diagrams
  - [ ] Component hierarchy
- [ ] Document navigation patterns
  - [ ] User-centric navbar design
  - [ ] Contextual dashboard patterns
- [ ] Create data model specifications
  - [ ] Clerk metadata structure
  - [ ] GitHub data mapping
  - [ ] Compression strategies
- [ ] Design component architecture
  - [ ] Navbar refactor plan
  - [ ] Dashboard component structure
- [ ] Document test scenarios
  - [ ] Multi-team membership tests
  - [ ] Permission boundary tests
  - [ ] Context switching tests

**Deliverables**: Complete documentation package in `/docs/admin/`

---

## Phase 2: Fix Current Implementation 🚧

### Dashboard Routing Fixes
- [ ] Verify Clerk test users can login
  - [ ] superadmin+clerk_test@example.com
  - [ ] rg_admin+clerk_test@example.com  
  - [ ] editor+clerk_test@example.com
  - [ ] author+clerk_test@example.com
  - [ ] translator+clerk_test@example.com
- [ ] Fix dashboard routing logic
  - [ ] Map Clerk metadata to correct dashboard
  - [ ] Ensure role detection works with Clerk data
  - [ ] Remove hardcoded demo user logic
- [ ] Verify Clerk UserButton displays correctly
  - [ ] Remove mock avatar code
  - [ ] Ensure signout redirects properly
  - [ ] Add theme toggle to navbar

### Mock Data Updates
- [ ] Update mock users for multi-team support
  - [ ] Sarah Admin: ISBD + BCM teams
  - [ ] Maria Editor: ISBD + CAT teams
  - [ ] John Reviewer: ISBD team only
  - [ ] Pierre Translator: No teams, project only
  - [ ] Regular Member: No teams
- [ ] Create realistic GitHub team structure
- [ ] Add project membership data

**Deliverables**: All 5 test users see appropriate dashboards

---

## Phase 3: Navigation Refactor 🔄

### User-Centric Navbar
- [ ] Refactor Navbar component architecture
  - [ ] Extract navigation data logic
  - [ ] Create navigation context hook
  - [ ] Implement permission-based filtering
- [ ] Add team navigation section
  - [ ] Show all user's teams
  - [ ] Highlight current context
  - [ ] Quick team switcher
- [ ] Add namespace dropdown
  - [ ] List all accessible namespaces
  - [ ] Show user's role per namespace
  - [ ] Group by review group
- [ ] Add projects dropdown
  - [ ] List active projects
  - [ ] Show project role
  - [ ] Quick project access

### Route Structure
- [ ] Implement new routes
  - [ ] `/dashboard` - Personal dashboard
  - [ ] `/dashboard/rg/[slug]` - RG admin
  - [ ] `/dashboard/namespace/[namespace]` - Namespace view
  - [ ] `/dashboard/project/[projectId]` - Project view
- [ ] Add breadcrumb navigation
- [ ] Implement context persistence

**Deliverables**: User-centric navigation with contextual routing

---

## Phase 4: GitHub Integration Layer 🔧

### Service Architecture
- [ ] Create GitHub service adapter
  ```typescript
  interface GitHubAdapter {
    getTeams(): Promise<Team[]>
    getProjects(): Promise<Project[]>
    getTeamMembers(teamSlug: string): Promise<Member[]>
  }
  ```
- [ ] Implement mock adapter for development
- [ ] Implement real adapter for production
- [ ] Add environment-based switching

### Mock Service Worker (MSW) Setup
- [ ] Install MSW dependencies
  ```bash
  pnpm add -D msw @faker-js/faker
  ```
- [ ] Create GitHub API mock handlers
  - [ ] Team listing endpoint
  - [ ] Team members endpoint
  - [ ] Add/remove member endpoints
  - [ ] Project endpoints
- [ ] Test error scenarios
  - [ ] Rate limit responses
  - [ ] 401 unauthorized
  - [ ] 404 not found
  - [ ] Network timeouts
- [ ] Create MSW browser setup for development

### Test Data Generation
- [ ] Implement Faker.js data generation
  - [ ] Generate 20+ test users with varied memberships
  - [ ] Create edge cases (users in 3+ teams)
  - [ ] Generate realistic GitHub usernames
  - [ ] Create diverse role combinations
- [ ] Build test data scripts
  ```bash
  pnpm tsx scripts/generate-test-users.ts --count=20
  pnpm tsx scripts/test-multi-team-users.ts
  ```

### Data Models
- [ ] Define TypeScript interfaces
  - [ ] GitHubTeam
  - [ ] GitHubProject
  - [ ] TeamMembership
  - [ ] ProjectAssignment
  - [ ] GitHubAPIError
- [ ] Create data transformers
  - [ ] GitHub → Clerk metadata
  - [ ] Clerk → Application state
- [ ] Implement compression utilities

### Sync Mechanism
- [ ] Post-login synchronization
  - [ ] Fetch user's teams
  - [ ] Fetch user's projects
  - [ ] Update Clerk metadata
- [ ] Manual sync endpoint
- [ ] Error handling with retry logic
- [ ] Rate limit management
- [ ] Webhook handlers (future)

**Deliverables**: Working GitHub integration with mock data

---

## Phase 5: Team Management UI 👥

### Review Group Admin Interface
- [ ] Team member list
  - [ ] Display with roles
  - [ ] Search and filter
  - [ ] Bulk actions
- [ ] Add member flow
  - [ ] Search GitHub users
  - [ ] Assign team role
  - [ ] Sync to GitHub
- [ ] Remove member flow
  - [ ] Confirmation dialog
  - [ ] Permission check
  - [ ] GitHub sync
- [ ] Role management
  - [ ] Change maintainer/member
  - [ ] Audit logging

### Project Management
- [ ] Create project interface
  - [ ] Project details form
  - [ ] Namespace selection
  - [ ] Initial team assignment
- [ ] Project member assignment
  - [ ] Cross-team member search
  - [ ] Role assignment
  - [ ] Permission configuration
- [ ] Project dashboard
  - [ ] Member list
  - [ ] Activity feed
  - [ ] Quick actions

**Deliverables**: Complete team and project management UI

---

## Phase 6: Testing & Validation ✓

### User Acceptance Testing
- [ ] Test each Clerk user persona
  - [ ] Superadmin: Full system access
  - [ ] RG Admin: Team management access
  - [ ] Editor: Multi-namespace editing
  - [ ] Author: Content creation
  - [ ] Translator: Translation interface
- [ ] Multi-team scenarios
  - [ ] User in 2+ teams
  - [ ] Different roles per team
  - [ ] Cross-team projects
- [ ] Permission boundaries
  - [ ] Unauthorized access attempts
  - [ ] Role escalation prevention
  - [ ] Context isolation

### Performance Testing
- [ ] Metadata size validation
  - [ ] Measure actual sizes
  - [ ] Test with max data
  - [ ] Verify < 8KB limit
- [ ] Load time measurements
  - [ ] Dashboard < 2 seconds
  - [ ] Navigation < 100ms
  - [ ] Sync < 30 seconds

### Integration Testing
- [ ] GitHub API integration
  - [ ] Mock API responses
  - [ ] Error handling
  - [ ] Rate limit handling
- [ ] Clerk webhook testing
- [ ] End-to-end workflows

**Deliverables**: Test report with all scenarios passing

---

## Phase 7: Production Readiness 🚀

### Security Hardening Checklist
- [ ] Verify GitHub OAuth scopes
  - [ ] Confirm `admin:org`, `write:org`, `read:org` scopes
  - [ ] Set up token rotation schedule (90 days)
  - [ ] Implement secure token storage
- [ ] Server-side validation
  - [ ] All admin actions validated server-side
  - [ ] Permission checks on every API endpoint
  - [ ] Input validation and sanitization
- [ ] Audit logging implementation
  - [ ] Log all team management actions
  - [ ] Log role assignments
  - [ ] Log failed authorization attempts
  - [ ] Set up log retention policy
- [ ] Rate limiting configuration
  - [ ] Admin action rate limits
  - [ ] GitHub sync rate limits
  - [ ] DDoS protection measures
- [ ] Security testing
  - [ ] Penetration testing checklist
  - [ ] OWASP Top 10 verification
  - [ ] Token exposure audit

### Production Setup
- [ ] Configure production GitHub OAuth
  - [ ] Register OAuth app in GitHub
  - [ ] Set callback URLs
  - [ ] Store credentials securely
- [ ] Set up Jon Phipps as superadmin
  - [ ] Verify GitHub username: jphipps
  - [ ] Configure system admin role
  - [ ] Test all permissions
- [ ] Configure webhook endpoints
- [ ] Enable monitoring
  - [ ] Set up error tracking
  - [ ] Configure performance monitoring
  - [ ] Create alerting rules

### Deployment
- [ ] Deploy to preview environment
- [ ] Run smoke tests
- [ ] Security scan
- [ ] Deploy to production
- [ ] Monitor for 24 hours

### Documentation
- [ ] Update user documentation
- [ ] Create admin guide
- [ ] Document troubleshooting
- [ ] Security best practices guide

**Deliverables**: Live production system

---

## Definition of Done

- [ ] All test users can access appropriate dashboards
- [ ] Multi-team membership works correctly
- [ ] GitHub sync completes successfully
- [ ] Navigation shows all user capabilities
- [ ] RG admins can manage teams
- [ ] Projects support cross-team collaboration
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Production deployed

---

## Risk Register

| Risk | Mitigation | Status |
|------|------------|---------|
| Clerk 8KB limit | Data compression, essential fields only | 🟡 Monitoring |
| GitHub API limits | Caching, batch operations | 🟢 Planned |
| Complex permissions | Clear rules, audit logs | 🟡 In Design |
| Test user issues | Early testing, clear documentation | 🟢 Active |

---

## Progress Tracking

Use this checklist for daily standups:

### This Week
- [ ] Complete documentation
- [ ] Fix dashboard routing
- [ ] Test with Clerk users
- [ ] Start navigation refactor

### Next Week  
- [ ] Complete navigation
- [ ] Build GitHub mock
- [ ] Start team UI

### Week 3-4
- [ ] Complete team management
- [ ] Project assignment UI
- [ ] Integration testing

### Week 5-6
- [ ] Final testing
- [ ] Production deployment
- [ ] Documentation updates