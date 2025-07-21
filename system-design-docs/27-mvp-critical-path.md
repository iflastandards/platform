# MVP Critical Path Implementation Plan

**Version:** 1.0  
**Date:** January 2025  
**Status:** Execution Ready

## Overview

This document defines the Minimum Viable Product (MVP) and critical path implementation plan for the IFLA Standards Platform, focusing on the most essential features needed to replace legacy systems and enable core workflows.

## MVP Scope Definition

### Core Requirements

The MVP must support:
1. **Import/Export Workflows**: Google Sheets import for bootstrapping
2. **Basic Admin Functions**: User management, namespace administration
3. **GitHub Integration**: Basic project and issue tracking
4. **TinaCMS integration
5. **Legacy URL Compatibility**: All existing vocabulary URIs must continue to work
6. **Publishing Pipeline**: Ability to publish vocabularies with proper redirects

### Out of Scope for MVP

These features will be implemented post-MVP:
- Advanced translation workflows
- AI-powered features
- Comprehensive analytics
- Advanced project management features

## Critical Path Timeline

### **Weeks 1-3: Vocabulary Server** 🔴 CRITICAL

**Why First**: Without this, we cannot migrate any namespaces from legacy systems.

**Deliverables**:
```yaml
Week 1:
  - Nginx redirect configuration system
  - Pathmap data structure and storage
  - Basic content negotiation logic
  - Development environment setup

Week 2:
  - Lexical alias generation system
  - Version-aware routing
  - Integration with build pipeline
  - Automated deployment scripts

Week 3:
  - Load testing with production traffic patterns
  - Fallback mechanisms for unmapped URIs
  - Monitoring and analytics setup
  - Production deployment
```

**Technical Implementation**:
```typescript
// Pathmap structure
interface VocabularyPathmap {
  namespace: string;
  version: string;
  baseUrl: string;
  lastUpdated: Date;
  mappings: Array<{
    uri: string;
    documentPath: string;
    aliases: Record<string, string>; // lang -> alias
  }>;
  slugRules: {
    case: 'lowercase' | 'uppercase' | 'preserve';
    separator: string;
    normalizeUnicode: boolean;
    maxLength: number;
  };
}

// Nginx config generation
async function generateNginxConfig(pathmap: VocabularyPathmap): Promise<string> {
  // Generate location blocks for each mapping
  // Handle content negotiation
  // Set up alias redirects
}
```

### **Weeks 4-7: Core Admin Portal** 🟡 HIGH PRIORITY

**Why Second**: Needed for user management and basic operations.

**Deliverables**:
```yaml
Week 4-5: Foundation
  - Next.js admin app setup
  - Clerk authentication integration
  - MUI component library setup
  - Basic navigation structure

Week 6: User Management
  - User CRUD operations
  - Role assignment UI
  - Review Group management
  - Namespace access control

Week 7: Basic Workflows
  - Namespace listing and details
  - Activity logging display
  - Basic system status dashboard
  - Error tracking interface
```

**Key Components**:
```typescript
// Core admin routes
/admin/
  ├── dashboard/          // System overview
  ├── users/             // User management
  ├── review-groups/     // RG administration
  ├── namespaces/        // Namespace management
  └── system/            // System configuration
```

### **Weeks 8-10: GitHub Integration** 🟢 IMPORTANT

**Why Third**: Enables project-based collaboration model.

**Deliverables**:
```yaml
Week 8: API Integration
  - GitHub App setup
  - Authentication flow
  - GraphQL API integration
  - Webhook receivers

Week 9: Data Sync
  - Project synchronization
  - Issue/PR tracking
  - Team membership sync
  - Activity timeline

Week 10: UI Implementation
  - Project dashboards
  - Issue management
  - PR review interface
  - Notification system
```

### **Weeks 11-12: Import/Publishing Pipeline** 🔵 NECESSARY

**Why Fourth**: Enables actual vocabulary management.

**Deliverables**:
```yaml
Week 11: Import System
  - Google Sheets authentication
  - Import UI and validation
  - Error handling and reporting
  - Version management

Week 12: Publishing
  - Build triggers
  - Validation pipeline
  - Pathmap generation
  - Deployment automation
```

## Risk Mitigation

### Technical Risks

1. **Vocabulary Server Performance**
   - Mitigation: Extensive load testing, CDN integration
   - Fallback: Keep legacy server running in parallel

2. **Data Migration Errors**
   - Mitigation: Comprehensive validation, rollback procedures
   - Fallback: Maintain read-only legacy access

3. **GitHub API Rate Limits**
   - Mitigation: Implement caching, use webhooks for updates
   - Fallback: Batch operations, queue processing

### Operational Risks

1. **User Adoption**
   - Mitigation: Gradual rollout, extensive documentation
   - Fallback: Maintain legacy interfaces temporarily

2. **Training Requirements**
   - Mitigation: Video tutorials, hands-on workshops
   - Fallback: Extended support period

## Success Metrics

### Week 3 Checkpoint
- [ ] Vocabulary server handling 100% of test traffic
- [ ] Zero legacy URL failures
- [ ] < 50ms redirect response time

### Week 7 Checkpoint
- [ ] Admin portal functional for core operations
- [ ] User management operational
- [ ] Review Groups configured

### Week 10 Checkpoint
- [ ] GitHub Projects synchronized
- [ ] Issues/PRs visible in admin
- [ ] Team workflows functional

### Week 12 - MVP Complete
- [ ] One namespace fully migrated
- [ ] End-to-end workflow tested
- [ ] Performance targets met
- [ ] User acceptance confirmed

## Implementation Dependencies

### Required Before Start
1. **Infrastructure**:
   - GitHub organization access
   - Vercel deployment setup
   - Domain configuration
   - SSL certificates

2. **Decisions Needed**:
   - Vocabulary server hosting (Vercel Edge vs dedicated)
   - GitHub App vs OAuth approach
   - Admin subdomain vs path-based routing
   - Monitoring solution selection

3. **Resources**:
   - Development team availability
   - Test users identified
   - Sample vocabulary data
   - Legacy system access

## Post-MVP Roadmap

### Phase 1 (Months 4-5)
- TinaCMS integration
- Advanced project management
- Translation workflow basics
- Performance optimization

### Phase 2 (Months 6-7)
- Crowdin integration
- AI-powered features
- Advanced analytics
- Bulk operations

### Phase 3 (Months 8-9)
- Full migration of all namespaces
- Legacy system decommission
- Advanced collaboration features
- Public API launch

## Execution Commands

### Week 1 Start
```bash
# Create vocabulary server project
nx g @nx/next:app vocabulary-server

# Set up initial structure
nx g @nx/next:page api/negotiate --project=vocabulary-server
nx g @nx/next:page api/pathmap --project=vocabulary-server

# Create pathmap generator
nx g @nx/node:lib pathmap-generator
```

### Week 4 Start
```bash
# Admin portal is already created
cd apps/admin

# Add core pages
nx g @nx/next:page dashboard/users --project=admin
nx g @nx/next:page dashboard/review-groups --project=admin
nx g @nx/next:page dashboard/namespaces --project=admin
```

### Week 8 Start
```bash
# Create GitHub integration
nx g @nx/node:lib github-integration

# Add API routes
nx g @nx/next:page api/github/webhook --project=admin
nx g @nx/next:page api/github/sync --project=admin
```

This critical path focuses on the absolute essentials needed to replace the legacy system and enable core workflows. Each phase builds on the previous one, with clear dependencies and success metrics.
