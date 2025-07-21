# MVP Critical Path Implementation Plan

**Version:** 1.0  
**Date:** January 2025  
**Status:** Execution Ready

## Overview

This document defines the Minimum Viable Product (MVP) and critical path implementation plan for the IFLA Standards Platform, focusing on the most essential features needed to replace legacy systems and enable core workflows.

## MVP Scope Definition

### Core Requirements

The MVP must support (in priority order):
1. **Import/Export Workflows**: Google Sheets import for bootstrapping vocabularies
2. **Basic Admin Functions**: User management, namespace administration
3. **GitHub Integration**: Basic project and issue tracking
4. **TinaCMS Integration**: WYSIWYG content editing capabilities
5. **Legacy URL Compatibility**: All existing vocabulary URIs must continue to work
6. **Publishing Pipeline**: Ability to publish vocabularies with proper redirects

### Out of Scope for MVP

These features will be implemented post-MVP:
- Advanced translation workflows
- AI-powered features
- Comprehensive analytics
- Advanced project management features

## Updated Critical Path Timeline (Reprioritized January 2025)

### **Phase 1 - Weeks 1-4: Import/Export Workflows** 🔴 CRITICAL

**Why First**: Import/Export workflows are the foundation for all vocabulary bootstrapping and data migration. Without the ability to import from Google Sheets and export to various formats, no content can flow through the system.

**Deliverables**:
```yaml
Week 1: Google Sheets Integration Foundation
  - Service account authentication setup
  - Google Sheets API client configuration
  - Basic read/write operations
  - Rate limiting and quota management

Week 2: Import Pipeline Development
  - CSV/DCTAP validation engine
  - Error handling and reporting system
  - Batch processing capabilities
  - Data transformation utilities

Week 3: Export Pipeline Development
  - Multiple format export (CSV, RDF, JSON-LD)
  - Template-based generation system
  - Quality validation before export
  - Integration with existing build pipeline

Week 4: Integration Testing & Optimization
  - End-to-end workflow testing
  - Performance optimization
  - Error recovery mechanisms
  - User interface for import/export operations
```

**Technical Implementation**:
```typescript
// Import/Export Pipeline Structure
interface ImportConfig {
  sourceType: 'google-sheets' | 'csv' | 'json';
  namespace: string;
  validationRules: DCTAPValidationConfig;
  transformationRules: DataTransformationConfig;
  batchSize: number;
  errorThreshold: number;
}

interface ExportConfig {
  targetFormat: 'csv' | 'rdf' | 'json-ld' | 'turtle';
  namespace: string;
  includeMetadata: boolean;
  compressionLevel: 'none' | 'gzip' | 'brotli';
  outputPath: string;
}

// Google Sheets Service
class GoogleSheetsService {
  async authenticate(serviceAccountKey: string): Promise<void>;
  async readSheet(spreadsheetId: string, range: string): Promise<SheetData>;
  async writeSheet(spreadsheetId: string, range: string, data: any[][]): Promise<void>;
  async validatePermissions(spreadsheetId: string): Promise<boolean>;
}

// Import Pipeline
async function importFromGoogleSheets(config: ImportConfig): Promise<ImportResult> {
  // 1. Authenticate and validate permissions
  // 2. Read data with error handling
  // 3. Apply validation rules
  // 4. Transform data format
  // 5. Generate MDX files
  // 6. Update vocabulary metadata
}
```

### **Phase 2 - Weeks 5-8: Basic Admin Functions** 🟡 HIGH PRIORITY

**Why Second**: User management and namespace administration are essential for controlling access to the import/export workflows and maintaining data integrity.

**Deliverables**:
```yaml
Week 5: Authentication & Authorization Foundation
  - Clerk authentication integration
  - Cerbos policy engine setup
  - Role-based access control (RBAC) implementation
  - JWT token validation and refresh

Week 6: User Management System
  - User CRUD operations interface
  - Role assignment and management
  - Review Group administration
  - User activity tracking and auditing

Week 7: Namespace Administration
  - Namespace creation and configuration
  - Permission assignment per namespace
  - Access control validation
  - Namespace metadata management

Week 8: Administrative Dashboard
  - System status and health monitoring
  - Import/export job tracking
  - Error logging and reporting
  - Basic analytics and usage metrics
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

### **Phase 3 - Weeks 9-12: GitHub Integration** 🟢 IMPORTANT

**Why Third**: GitHub integration enables collaborative workflows and project tracking, building on the foundation of user management and import/export capabilities.

**Deliverables**:
```yaml
Week 9: GitHub App & API Setup
  - GitHub App registration and configuration
  - OAuth authentication flow
  - GraphQL API client setup
  - Webhook endpoint configuration

Week 10: Project Synchronization
  - GitHub Projects API integration
  - Issue and Pull Request tracking
  - Repository management
  - Team membership synchronization

Week 11: Collaboration Features
  - Project dashboard interface
  - Issue creation and tracking
  - PR review workflow integration
  - Notification and activity feeds

Week 12: GitHub Workflow Integration
  - Automated issue creation for vocabulary changes
  - PR-based review workflows
  - Integration with import/export processes
  - GitHub Actions for CI/CD pipeline
```

### **Phase 4 - Weeks 13-16: TinaCMS Integration** 🔵 IMPORTANT

**Why Fourth**: TinaCMS provides the WYSIWYG editing interface that makes the system accessible to non-technical users, complementing the import/export workflows.

**Deliverables**:
```yaml
Week 13: TinaCMS Foundation Setup
  - TinaCMS cloud configuration
  - Authentication integration with Clerk
  - Basic Git integration setup
  - Content schema definition for vocabularies

Week 14: WYSIWYG Editing Interface
  - Rich text editor for vocabulary descriptions
  - Form-based metadata editing
  - Real-time validation integration
  - Multi-language content support

Week 15: Advanced Editing Features
  - RDF property and class editing forms
  - Concept scheme management interface
  - Relationship editing (hierarchies, associations)
  - Bulk editing capabilities

Week 16: Integration & Testing
  - Integration with import/export workflows
  - GitHub commit automation
  - User permission integration
  - End-to-end testing with content creators
```

### **Phase 5 - Weeks 17-19: Legacy URL Compatibility** 🔴 CRITICAL

**Why Fifth**: Legacy URL compatibility is essential for maintaining existing integrations and preventing broken links across the library community.

**Deliverables**:
```yaml
Week 17: Vocabulary Server Development
  - Nginx-based redirect configuration system
  - Pathmap data structure and storage
  - Content negotiation logic (HTML/RDF/JSON-LD)
  - URI mapping generation tools

Week 18: Redirect Rule Engine
  - Dynamic pathmap generation from vocabulary data
  - Lexical alias support for multilingual URIs
  - Version-aware routing capabilities
  - Fallback mechanisms for unmapped URIs

Week 19: Testing & Production Deployment
  - Comprehensive URI testing with existing vocabulary links
  - Performance optimization and caching
  - Monitoring and analytics integration
  - Production deployment with zero-downtime migration
```

### **Phase 6 - Weeks 20-22: Publishing Pipeline** 🟡 HIGH PRIORITY

**Why Last**: The publishing pipeline ties together all previous phases, providing the final step to deploy vocabularies with proper redirects and validation.

**Deliverables**:
```yaml
Week 20: Build Pipeline Integration
  - Automated build triggers from content changes
  - Multi-format generation (HTML, RDF, JSON-LD, Turtle)
  - Quality validation and error reporting
  - Version management and semantic versioning

Week 21: Deployment Automation
  - Automated deployment to documentation sites
  - Pathmap generation and vocabulary server updates
  - CDN cache invalidation and optimization
  - Rollback capabilities for failed deployments

Week 22: End-to-End Testing & Launch Preparation
  - Complete workflow testing from import to publication
  - Performance benchmarking and optimization
  - User acceptance testing with stakeholders
  - Documentation and training material finalization
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

## Updated Success Metrics

### Phase 1 Checkpoint (Week 4)
- [ ] Google Sheets import successfully processing test vocabularies
- [ ] Export pipeline generating multiple formats correctly
- [ ] Error handling and validation working properly
- [ ] Integration with existing build pipeline functional

### Phase 2 Checkpoint (Week 8)
- [ ] Admin portal functional for core operations
- [ ] User management and RBAC operational
- [ ] Namespace administration working
- [ ] All authentication flows tested and secured

### Phase 3 Checkpoint (Week 12)
- [ ] GitHub Projects synchronized and functional
- [ ] Issues/PRs integrated with vocabulary workflows
- [ ] Collaborative workflows operational
- [ ] GitHub Actions CI/CD pipeline working

### Phase 4 Checkpoint (Week 16)
- [ ] TinaCMS editing interface functional
- [ ] WYSIWYG editing for all vocabulary content types
- [ ] Real-time validation and Git integration working
- [ ] User acceptance testing completed successfully

### Phase 5 Checkpoint (Week 19)
- [ ] All legacy vocabulary URLs redirecting correctly
- [ ] Vocabulary server handling production traffic
- [ ] Content negotiation working for all formats
- [ ] Zero broken links in legacy systems

### Phase 6 - MVP Complete (Week 22)
- [ ] Complete end-to-end workflow tested
- [ ] One namespace fully migrated and operational
- [ ] Performance targets met across all systems
- [ ] User acceptance confirmed by stakeholders
- [ ] Ready for production launch

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
