# System Architecture Overview

**Version:** 2.0  
**Date:** January 2025  
**Status:** Current Implementation

## Executive Summary

The IFLA Standards Platform is a modern, monorepo-based system designed to manage, publish, and maintain international library standards. Built on Nx workspace technology, it combines multiple Docusaurus documentation sites with a centralized Next.js admin portal, leveraging Git as the single source of truth for all vocabulary data.

## Core Architecture Principles

### 1. **Git-Centric Data Management**
- All vocabulary content, DCTAP profiles, and configurations are version-controlled
- Changes require PR review process ensuring quality and traceability
- Automatic deployment on merge provides continuous delivery
- No database dependencies during build time ensures reproducible builds

### 2. **Distributed System Architecture**
- **Documentation Sites**: Individual Docusaurus sites for each standard/namespace
- **Admin Portal**: Centralized Next.js application for management tasks
- **Edge Functions**: Serverless API endpoints via Vercel
- **External Services**: Integrated with GitHub, Google Sheets, Clerk, and Supabase

### 3. **Progressive Enhancement**
- Static generation for public documentation (performance)
- Dynamic features layered on top (interactivity)
- Graceful degradation when services unavailable
- Mobile-first responsive design

## Technology Stack

### Frontend Technologies
```yaml
UI Framework: React 19.1.0
Type System: TypeScript 5.7
Styling: Tailwind CSS + shadcn/ui
Documentation: Docusaurus 3.8+
Admin Portal: Next.js 15.2.5 (App Router)
State Management: React Context + SWR
Component Library: @ifla/theme (shared)
```

### Backend Technologies
```yaml
Runtime: Node.js 20+
API Layer: Vercel Edge Functions
Authentication: Clerk + NextAuth.js 5.0
Authorization: Cerbos Policy Engine
Database: Supabase (PostgreSQL)
File Storage: Git/GitHub
Package Manager: pnpm 10.12.4
```

### Development Tools
```yaml
Monorepo: Nx 21.2.2
Build Optimization: Nx Cloud
Testing: Vitest + Playwright
Linting: ESLint + Prettier
CI/CD: GitHub Actions
Version Control: Git + GitHub
```

## Organizational Structure

### IFLA Governance Alignment
The technical architecture mirrors IFLA's organizational structure:

```yaml
IFLA Advisory Committee on Standards (METATEC)
├── International Cataloguing Principles (ICP)
│   └── Namespaces: icp, muldicat
├── Bibliographic Conceptual Models (BCM)
│   └── Namespaces: frbr, lrm, frad
├── International Standard Bibliographic Description (ISBD)
│   └── Namespaces: isbd, isbdm
└── Permanent UNIMARC Committee (PUC)
    └── Namespaces: unimarc, mri
```

### GitHub Organization Structure
The platform leverages GitHub's team management to reflect governance:
- **Organization**: `iflastandards`
- **Teams**: Mirror Review Groups with appropriate permissions
- **Projects**: Time-bound initiatives with specific deliverables
- **Access Control**: Project-based permissions for external contributors

## System Components

### 1. Documentation Sites (Docusaurus)
Each namespace/standard has its own Docusaurus site:
- **Purpose**: Public-facing documentation and vocabulary browsing
- **Examples**: ISBD, UNIMARC, LRM, FRBR, MulDiCat
- **Features**: 
  - Multilingual support
  - Version-controlled content
  - Static generation for performance
  - Integrated vocabulary tables
  - GitHub-integrated feedback

### 2. Admin Portal (Next.js)
Centralized management application at `/admin`:
- **Purpose**: Vocabulary lifecycle management
- **Features**:
  - Import/export workflows
  - DCTAP validation
  - Version publishing
  - Translation management
  - User and role administration
- **Architecture**: 
  - App Router with React Server Components
  - basePath configuration for environment flexibility
  - Integrated with all backend services

### 3. Shared Packages
Reusable libraries across the monorepo:
- **@ifla/theme**: UI components and styling
- **@ifla/validation**: DCTAP and schema validation
- **@ifla/rdf-tools**: RDF generation and parsing
- **@ifla/shared-config**: Centralized configuration

### 4. API Layer (Vercel Edge Functions)
Serverless endpoints for dynamic operations:
- **Authentication**: OAuth flows and session management
- **RDF Operations**: Generation and validation
- **Spreadsheet Integration**: Google Sheets import/export
- **Admin Operations**: User and namespace management

## Data Flow Architecture

```mermaid
graph LR
    A[User] --> B[Admin Portal]
    A --> C[Documentation Sites]
    
    B --> D[Edge Functions]
    D --> E[Clerk Auth]
    D --> F[Cerbos Policies]
    D --> G[GitHub API]
    D --> H[Google Sheets]
    D --> I[Supabase]
    
    G --> J[Git Repository]
    J --> K[Build Process]
    K --> C
    
    I --> L[Operational Data]
    H --> M[Bulk Editing]
```

## Deployment Architecture

### Environment Strategy
```yaml
Local Development:
  - URL: http://localhost:3000
  - Purpose: Development and testing
  - Features: Hot reload, debug tools

Preview Environment:
  - URL: https://iflastandards.github.io/platform/
  - Purpose: Staging and review
  - Features: PR previews, stakeholder review

Production Environment:
  - URL: https://www.iflastandards.info/
  - Purpose: Live platform
  - Features: Full optimization, monitoring
```

### Build and Deployment Pipeline
1. **Local Development**: Nx affected commands for incremental builds
2. **Pre-commit Hooks**: Type checking, linting, unit tests
3. **Pre-push Validation**: Integration tests, build verification
4. **CI/CD Pipeline**: Environment validation, deployment
5. **Post-deployment**: Monitoring, error tracking

## Security Architecture

### Authentication Layers
- **Primary**: Clerk for user identity and SSO
- **Session Management**: NextAuth.js 5.0
- **API Security**: JWT tokens with short expiry

### Authorization Model
- **Policy Engine**: Cerbos for fine-grained permissions
- **Role Hierarchy**: Superadmin → Review Group Admin → Namespace Admin → Editor → Translator → Reviewer
- **Resource-based**: Permissions tied to specific namespaces/resources

### Data Security
- **At Rest**: Git encryption, Supabase RLS
- **In Transit**: HTTPS everywhere, API encryption
- **Secrets Management**: Environment variables, GitHub secrets
- **Audit Trail**: Comprehensive logging of all changes

## Performance Optimizations

### Build Performance
- **Nx Caching**: Computation memoization
- **Incremental Builds**: Only affected projects rebuild
- **Parallel Execution**: Multi-core utilization
- **Distributed Cache**: Nx Cloud for team sharing

### Runtime Performance
- **Static Generation**: Pre-built documentation pages
- **Edge Computing**: Vercel Edge Functions
- **CDN Distribution**: Global content delivery
- **Image Optimization**: Next.js automatic optimization

### Developer Experience
- **Fast Feedback**: <5s for unit tests
- **Smart Testing**: Affected-only test runs
- **Hot Reload**: Instant development updates
- **Type Safety**: Full TypeScript coverage

## Scalability Considerations

### Horizontal Scaling
- **Documentation Sites**: Unlimited namespace sites
- **Edge Functions**: Auto-scaling serverless
- **CDN**: Global distribution
- **Database**: Supabase connection pooling

### Vertical Scaling
- **Build Optimization**: Nx Cloud agents
- **Caching Strategy**: Multi-level caching
- **Lazy Loading**: Code splitting
- **Progressive Enhancement**: Feature flags

## Integration Points

### External Services
1. **GitHub**: Organization, teams, version control
2. **Google Sheets**: Bulk vocabulary editing
3. **Clerk**: User authentication and profiles
4. **Supabase**: Operational data and logs
5. **Crowdin**: Translation management
6. **TinaCMS**: Content editing (planned)

### Internal Integration
- **Monorepo Structure**: Shared dependencies
- **Configuration Matrix**: Centralized settings
- **Component Library**: Consistent UI
- **Testing Framework**: Unified approach

## Future Architecture Considerations

### Planned Enhancements
1. **GraphQL API**: For complex queries
2. **Real-time Updates**: WebSocket integration
3. **Advanced Search**: Elasticsearch integration
4. **AI Integration**: Vocabulary suggestions
5. **Mobile Apps**: React Native clients

### Architecture Evolution
- Maintain backward compatibility
- Progressive migration strategies
- Feature flag deployments
- Continuous architecture review

## Key Architecture Decisions

### Decision Log
1. **Monorepo over Multirepo**: Simplified dependency management
2. **Git as Source of Truth**: Version control for all data
3. **Static First**: Performance and reliability
4. **TypeScript Everywhere**: Type safety across stack
5. **Edge Functions**: Scalability without servers
6. **Centralized Config**: Maintainability over flexibility

### Trade-offs Accepted
- Build complexity for developer experience
- Initial setup time for long-term maintainability
- Multiple services for specialized functionality
- Static generation limitations for real-time features

## Success Metrics

### Technical Metrics
- Build time: <5 minutes with caching
- Page load: <3 seconds globally
- API response: <200ms average
- Uptime: 99.9% availability

### Quality Metrics
- Test coverage: >90% critical paths
- Type coverage: 100% for core modules
- Accessibility: WCAG 2.1 AA compliant
- Documentation: 100% API coverage

This architecture provides a robust, scalable foundation for managing international library standards while maintaining excellent developer experience and platform performance.