# Phase 4: Pipeline Integration - Planning Document

## Executive Summary

Phase 4 represents a major expansion of the RDF converter tooling to create a complete collaborative workflow system. This phase integrates Google Sheets for collaborative editing, adds comprehensive job tracking, and creates a full pipeline orchestrator. The scope is substantial and requires careful planning and phased implementation.

## Overview

### Vision
Create a complete pipeline that enables teams to:
1. Convert RDF vocabularies to editable spreadsheets
2. Collaborate on vocabulary editing in Google Sheets
3. Track all operations with full audit trails
4. Generate MDX documentation from edited sheets
5. Maintain data integrity with validation and rollback capabilities

### Scope
This phase touches multiple systems:
- Google Sheets API integration
- Database schema design (Supabase)
- Job tracking and orchestration
- File management and versioning
- Integration with existing admin UI
- Authentication and permissions

## Major Components

### 1. Google Sheets Module (`lib/google-sheets.ts`)

#### Purpose
Provide a TypeScript-first interface for all Google Sheets operations needed by the pipeline.

#### Core Responsibilities
- **Authentication**: Service account setup and management
- **CRUD Operations**: Create, read, update, delete sheets and data
- **Formatting**: Apply IFLA-specific formatting and validation
- **Sharing**: Manage permissions and collaboration
- **Data Sync**: Bidirectional sync between CSV and Sheets

#### Key Design Decisions Needed
- [ ] Authentication strategy (service account vs OAuth)
- [ ] Error handling and retry logic
- [ ] Rate limiting and quota management
- [ ] Caching strategy for sheet metadata
- [ ] Conflict resolution for concurrent edits

### 2. Pipeline Orchestrator (`src/pipeline.ts`)

#### Purpose
Coordinate the entire workflow from RDF to final MDX files with full tracking.

#### Core Responsibilities
- **Workflow Steps**: Manage sequential pipeline operations
- **State Management**: Track pipeline state and allow resumption
- **Error Recovery**: Handle failures gracefully with retry logic
- **Progress Tracking**: Provide real-time status updates
- **Rollback Logic**: Enable reverting changes at any step

#### Key Design Decisions Needed
- [ ] State machine design for pipeline steps
- [ ] Async/await vs event-driven architecture
- [ ] Progress reporting mechanism (webhooks, SSE, polling)
- [ ] Failure recovery strategies
- [ ] Concurrency limits and queue management

### 3. Database Schema Design

#### Purpose
Persist pipeline state, job tracking, and sheet associations.

#### Core Tables
1. **pipeline_jobs**: Track all pipeline executions
2. **namespace_sheets**: Associate namespaces with Google Sheets
3. **mdx_files**: Track generated MDX files and their sources

#### Key Design Decisions Needed
- [ ] Indexing strategy for performance
- [ ] Data retention policies
- [ ] Audit log structure
- [ ] Relationship modeling between entities
- [ ] Migration strategy from existing data

## Design & Implementation Phases

### Phase 4.0: Immediate ISBD Integration (Week 1)
**Priority**: Process existing ISBD spreadsheet immediately

1. **ISBD CSV to MDX Generation**
   - Download existing ISBD spreadsheet
   - Create DCTAP profile for ISBD if needed
   - Run CSV through populate-from-csv.ts
   - Generate initial MDX pages
   - Validate generated content

2. **Orphan Spreadsheet Integration**
   - Complete "birth certificate" process
   - Create namespace_sheets record
   - Link spreadsheet to ISBD namespace
   - Set up tracking for updates

3. **Update Workflow Design**
   - Design process for detecting sheet changes
   - Create update trigger mechanism
   - Plan validation workflow
   - Design rollback capability

### Phase 4.1: Architecture & Design (Week 2-3)
**Team**: You (decision maker) + Claude (architect/implementer)

1. **Architecture Decision Records (ADRs)**
   - Build on existing sheet-sync patterns
   - Service account auth (already in sheet-sync)
   - Update detection strategy
   - State management for pipelines
   - Rate limiting approach

2. **Technical Design Documents**
   - Extend sheet-sync for pipeline integration
   - Update workflow architecture
   - API specification for UI
   - Database schema updates
   - Error handling strategy

3. **Proof of Concepts**
   - Sheet change detection
   - Incremental update mechanism
   - Validation preview
   - Rollback implementation

### Phase 4.2: Foundation Enhancement (Week 4-5)
**Focus**: Extend existing tools for pipeline

1. **Enhanced Sheet-Sync Module**
   - Extend existing sheet-sync tool
   - Add change detection capabilities
   - Implement update triggers
   - Add validation hooks
   - Create rollback support

2. **Pipeline Integration**
   - Connect sheet-sync to RDF converters
   - Integrate with populate-from-csv.ts
   - Add progress tracking
   - Implement error recovery
   - Create audit logging

3. **Database Updates**
   - Implement orphan sheet tracking
   - Add pipeline_jobs table
   - Create sheet history tracking
   - Add validation results storage
   - Migration scripts

### Phase 4.2: Pipeline Core (Week 5-6)
**Focus**: Orchestration without UI

1. **State Machine Implementation**
   - Pipeline state definitions
   - Transition handlers
   - Persistence layer
   - Recovery mechanisms
   - State visualization

2. **Pipeline Steps**
   - RDF to CSV converter integration
   - CSV to Sheets uploader
   - Sheets change monitor
   - Sheets to CSV downloader
   - CSV to MDX generator

3. **Job Management**
   - Job creation and tracking
   - Progress reporting
   - Error aggregation
   - Metrics collection
   - Job history

### Phase 4.3: Admin UI & Integration (Week 7-8)
**Focus**: User-friendly interface for review groups

1. **API Development**
   - REST endpoints with progress events
   - WebSocket/SSE for real-time updates
   - Authentication middleware
   - Response formatting for UI
   - OpenAPI documentation

2. **Admin UI Components**
   - Pipeline trigger interface
   - Real-time progress indicators
   - Google Sheets management
   - Job history dashboard
   - Error display with user-friendly messages

3. **User Workflows**
   - Export vocabulary to sheets
   - Monitor collaborative editing
   - Import with validation preview
   - Rollback interface
   - Simple, non-technical UI

### Phase 4.4: Hardening & Polish (Week 9-10)
**Focus**: Production readiness

1. **Resilience Features**
   - Circuit breakers
   - Bulkhead isolation
   - Timeout handling
   - Graceful degradation
   - Health checks

2. **Operational Tools**
   - Monitoring setup
   - Log aggregation
   - Alert configuration
   - Performance profiling
   - Debugging utilities

3. **Documentation**
   - Architecture guide
   - Operations runbook
   - API reference
   - Troubleshooting guide
   - Example workflows

## Technical Considerations

### Dependencies
- Google APIs client library
- Authentication libraries
- Database ORM (for Supabase)
- State machine library
- Testing frameworks

### Performance Requirements
- Pipeline completion: < 5 minutes for standard vocabulary
- API rate limits: Stay within Google's quotas
- Database queries: < 100ms for status checks
- Memory usage: < 500MB per pipeline run

### Security Considerations
- Service account key management
- Sheet access control
- Data encryption in transit
- Audit logging for compliance

## Integration Points

### Existing Systems
1. **RDF Converters**: Already built in Phases 1-3
2. **Template System**: Existing populate-from-csv.ts
3. **Admin App**: Need API endpoints and UI components
4. **GitHub**: Existing PR/branch creation patterns
5. **Supabase**: Existing client and patterns

### New Integrations
1. **Google Workspace**: Service account setup
2. **Monitoring**: Metrics and alerting
3. **Notification System**: Email/webhook alerts
4. **Job Queue**: Potential Redis/Bull integration

## Risk Assessment

### Technical Risks
1. **Google API Quotas**: May hit rate limits with large vocabularies
2. **Data Consistency**: Concurrent edits could cause conflicts
3. **Performance**: Large sheets may be slow to process
4. **Authentication**: Service account key rotation complexity

### Mitigation Strategies
1. **Quotas**: Implement intelligent rate limiting and batching
2. **Consistency**: Add locking mechanisms and conflict resolution
3. **Performance**: Implement streaming and chunking
4. **Auth**: Create key rotation procedures and monitoring

## Success Metrics

### Functional Metrics
- [ ] Complete pipeline execution without errors
- [ ] Successful round-trip data integrity
- [ ] Rollback functionality works correctly
- [ ] All jobs tracked accurately

### Performance Metrics
- [ ] < 5 minute pipeline execution
- [ ] < 100ms status check queries
- [ ] < 1% error rate in production
- [ ] 99.9% job tracking accuracy

### User Experience Metrics
- [ ] Clear progress indication
- [ ] Helpful error messages
- [ ] Intuitive rollback process
- [ ] Comprehensive audit trails

## Open Questions

### Design Questions
1. Should we use service account or OAuth for Google Sheets?
2. How do we handle concurrent edits to the same sheet?
3. What's the optimal chunking strategy for large vocabularies?
4. Should pipeline jobs be queued or run immediately?
5. How long should we retain job history?

### Integration Questions
1. How does this integrate with the existing import workflow?
2. Should we migrate existing sheet-sync functionality?
3. What UI components are needed in the admin app?
4. How do we handle notifications and alerts?
5. What monitoring and metrics do we need?

### Technical Questions
1. Which state machine library should we use?
2. Should we use TypeScript generators for pipeline steps?
3. How do we handle long-running operations?
4. What's the backup strategy for sheets?
5. How do we test Google Sheets integration?

## Two-Person Team Approach

### Division of Responsibilities

**You (Product Owner/Reviewer)**:
- Make architectural decisions
- Review and approve designs
- Test and validate implementations
- Provide domain knowledge
- Set priorities and requirements

**Claude (Architect/Developer)**:
- Create design documents
- Implement proof of concepts
- Write production code
- Create tests and documentation
- Provide technical recommendations

### Working Model

1. **Design Phase** (Interactive)
   - Claude proposes architectural options
   - You make decisions
   - Claude documents decisions in ADRs

2. **Implementation Phase** (Async)
   - Claude implements based on decisions
   - You review and test
   - Claude refines based on feedback

3. **UI Development** (Collaborative)
   - You define user workflows
   - Claude implements UI components
   - Joint testing with real scenarios
   - Iterate based on usability

### Adjusted Timeline

With a two-person team and UI priority:
- Add 2 weeks for design phase
- API must support UI from day 1
- Progressive UI development alongside backend
- Focus on user-friendly abstractions
- Hide technical complexity from users

**Revised Total**: 12-14 weeks

### UI-First Approach

Since the admin UI is critical for:
1. **User Adoption**: Non-technical review groups
2. **Legacy Migration**: Using UI to import existing data
3. **Community Buy-in**: Demonstrable, visual system

We will:
- Design API with UI needs first
- Build UI components progressively
- Create wizards for complex workflows
- Provide visual feedback for all operations
- Hide Git/GitHub complexity behind simple interfaces

## Next Steps

### Week 1: Design Sprint
1. Create ADRs for key decisions
2. Build proof of concepts
3. Validate Google Sheets quotas
4. Design security model
5. Choose technology stack

### Week 2: Architecture Finalization
1. Complete technical design docs
2. Set up development environment
3. Create project scaffolding
4. Implement first integration test
5. Establish coding patterns

### Week 3: Begin Implementation
1. Start with Phase 4.1 Foundation
2. Daily progress reviews
3. Continuous integration setup
4. Documentation as we go
5. Regular architecture reviews

## Appendices

### A. Existing Code References
- `types/google-sheets.ts`: TypeScript definitions
- `tools/sheet-sync/src/index.ts`: Existing sheet sync
- `apps/admin/src/lib/services/import-service.ts`: Import patterns
- `developer_notes/data-storage-architecture.md`: Storage design

### B. External Documentation
- [Google Sheets API v4](https://developers.google.com/sheets/api)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

### C. Related PRDs
- `docs/admin/PRD-vocabulary-import-workflow.md`
- `docs/admin/EPIC-vocabulary-management.md`
- `docs/OMR25_VOCAB_MGMT_SPEC.md`