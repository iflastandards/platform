# Phase 4: Epic Task Breakdown (Two-Person Team)

## Epic 0: ISBD Immediate Integration (URGENT - Week 1)

### 0.1 Process Existing ISBD Spreadsheet
**Priority**: P0 - Immediate requirement
**Effort**: 2-3 days
**Owner**: Claude implements, You validate

**Tasks**:
- [ ] Download current ISBD spreadsheet from Google Sheets
- [ ] Analyze CSV structure and create/update DCTAP profile
- [ ] Run CSV through populate-from-csv.ts
- [ ] Generate MDX pages for ISBD vocabulary
- [ ] Validate output against expected results

**Success Criteria**:
- ISBD MDX pages generated correctly
- All vocabulary terms imported
- Proper language handling
- Valid RDF in frontmatter

### 0.2 Complete Orphan Sheet Integration
**Priority**: P0 - Required for tracking
**Effort**: 1-2 days
**Owner**: Joint implementation

**Tasks**:
- [ ] Create "birth certificate" for ISBD sheet
- [ ] Add namespace_sheets database record
- [ ] Link sheet ID to ISBD namespace
- [ ] Set up initial tracking metadata
- [ ] Document the orphan sheet process

**Deliverables**:
- Database record created
- Sheet properly linked
- Process documented

### 0.3 Design Update Workflow
**Priority**: P0 - Required for updates
**Effort**: 2 days
**Owner**: You design, Claude documents

**Design Decisions**:
- [ ] How to detect sheet changes
- [ ] When to trigger updates (manual vs automatic)
- [ ] Validation before applying updates
- [ ] Rollback mechanism
- [ ] User notification approach

**Deliverables**:
- Update workflow diagram
- Technical specification
- UI mockups for update process

## Epic 1: Architecture & Design Phase

### 1.1 Architecture Decision Records
**Priority**: P0 - Must complete before full implementation
**Effort**: 3 days (reduced - leverage existing patterns)
**Owner**: Joint (You decide, Claude documents)

**Decisions to Make**:
- [ ] Build on sheet-sync vs new implementation
- [ ] Update detection mechanism
- [ ] Manual vs automatic update triggers
- [ ] Validation workflow
- [ ] Rollback strategy

**Deliverables**:
- ADR documents for each decision
- Integration with existing tools
- Risk assessment

### 1.2 Proof of Concepts
**Priority**: P0 - Risk reduction
**Effort**: 3 days (focused on updates)
**Owner**: Claude implements, You validate

**PoCs to Build**:
- [ ] Sheet change detection mechanism
- [ ] Incremental update processor
- [ ] Validation preview generator
- [ ] Rollback implementation
- [ ] Progress tracking

**Success Criteria**:
- Can detect changes in sheets
- Can preview what will change
- Can rollback if needed

### 1.3 Technical Design Documents
**Priority**: P0 - Blueprint for implementation
**Effort**: 2 days
**Owner**: Claude writes, You review

**Documents to Create**:
- [ ] Update workflow architecture
- [ ] Integration with existing tools
- [ ] API specification for UI
- [ ] Database schema updates
- [ ] User journey maps

## Epic 1: Google Sheets Integration Foundation

### 1.1 Authentication Setup
**Priority**: P0 - Blocker for all sheet operations
**Effort**: 3-5 days

**Tasks**:
- [ ] Create Google Cloud project and service account
- [ ] Generate and securely store service account key
- [ ] Implement authentication module with key rotation support
- [ ] Add environment variable management
- [ ] Create authentication tests

**Dependencies**: None
**Risks**: Key management complexity

### 1.2 Basic Sheet Operations
**Priority**: P0 - Core functionality
**Effort**: 5-7 days

**Tasks**:
- [ ] Implement sheet creation from template
- [ ] Add CSV to sheet data upload
- [ ] Create sheet to CSV download
- [ ] Implement basic formatting (headers, freeze rows)
- [ ] Add error handling and retries

**Dependencies**: 1.1 Authentication
**Risks**: API quota limits

### 1.3 Advanced Sheet Management
**Priority**: P1 - Enhanced functionality
**Effort**: 3-5 days

**Tasks**:
- [ ] Implement sheet sharing and permissions
- [ ] Add data validation rules
- [ ] Create named ranges for DCTAP sections
- [ ] Implement change tracking
- [ ] Add batch operations for performance

**Dependencies**: 1.2 Basic Operations
**Risks**: Complex permission models

## Epic 2: Pipeline Orchestrator Core

### 2.1 State Machine Design
**Priority**: P0 - Architecture foundation
**Effort**: 3-4 days

**Tasks**:
- [ ] Design pipeline state transitions
- [ ] Implement state machine library integration
- [ ] Create state persistence layer
- [ ] Add state recovery mechanisms
- [ ] Write state machine tests

**Dependencies**: None
**Risks**: State complexity

### 2.2 Job Management System
**Priority**: P0 - Core tracking
**Effort**: 5-7 days

**Tasks**:
- [ ] Create job creation and tracking
- [ ] Implement job status updates
- [ ] Add job metadata storage
- [ ] Create job query APIs
- [ ] Implement job cleanup routines

**Dependencies**: 2.1 State Machine
**Risks**: Database performance

### 2.3 Pipeline Step Implementation
**Priority**: P0 - Core workflow
**Effort**: 7-10 days

**Tasks**:
- [ ] Implement RDF to CSV step
- [ ] Create CSV to Sheets upload step
- [ ] Add Sheets monitoring step
- [ ] Implement Sheets to CSV download step
- [ ] Create CSV to MDX generation step
- [ ] Add validation between steps

**Dependencies**: 2.2 Job Management, Epic 1
**Risks**: Step coordination complexity

## Epic 3: Database Integration

### 3.1 Schema Implementation
**Priority**: P0 - Data persistence
**Effort**: 2-3 days

**Tasks**:
- [ ] Create Supabase migrations
- [ ] Implement database models
- [ ] Add indexes for performance
- [ ] Create database views
- [ ] Write schema documentation

**Dependencies**: None
**Risks**: Migration complexity

### 3.2 Data Access Layer
**Priority**: P0 - Application integration
**Effort**: 3-5 days

**Tasks**:
- [ ] Create TypeScript interfaces
- [ ] Implement repository pattern
- [ ] Add transaction support
- [ ] Create query builders
- [ ] Implement caching layer

**Dependencies**: 3.1 Schema
**Risks**: ORM limitations

### 3.3 Audit System
**Priority**: P1 - Compliance
**Effort**: 3-4 days

**Tasks**:
- [ ] Implement audit log tables
- [ ] Create audit triggers
- [ ] Add user tracking
- [ ] Implement audit queries
- [ ] Create audit reports

**Dependencies**: 3.2 Data Access
**Risks**: Performance impact

## Epic 4: Error Handling & Recovery

### 4.1 Error Detection
**Priority**: P0 - Reliability
**Effort**: 2-3 days

**Tasks**:
- [ ] Implement error classification
- [ ] Add error context capture
- [ ] Create error notification system
- [ ] Implement error metrics
- [ ] Add error dashboard

**Dependencies**: Epic 2
**Risks**: Error cascade

### 4.2 Recovery Mechanisms
**Priority**: P0 - Reliability
**Effort**: 3-5 days

**Tasks**:
- [ ] Implement automatic retries
- [ ] Add manual retry options
- [ ] Create checkpoint system
- [ ] Implement partial rollback
- [ ] Add recovery documentation

**Dependencies**: 4.1 Error Detection
**Risks**: State corruption

### 4.3 Rollback System
**Priority**: P1 - Data safety
**Effort**: 5-7 days

**Tasks**:
- [ ] Design rollback strategy
- [ ] Implement version snapshots
- [ ] Create rollback API
- [ ] Add rollback UI
- [ ] Test rollback scenarios

**Dependencies**: Epic 3
**Risks**: Data consistency

## Epic 5: Admin UI & Integration

### 5.1 API Development (UI-First)
**Priority**: P0 - System integration
**Effort**: 5-7 days

**Tasks**:
- [ ] Design REST API with UI needs first
- [ ] Implement WebSocket/SSE for progress
- [ ] Create status endpoints with UI-friendly data
- [ ] Add job management APIs with filtering
- [ ] Build validation preview endpoints

**Dependencies**: Epic 2
**Risks**: Real-time communication complexity

### 5.2 Admin UI Implementation
**Priority**: P0 - Critical for adoption
**Effort**: 10-12 days

**Tasks**:
- [ ] Create vocabulary export wizard
- [ ] Build Google Sheets management interface
- [ ] Implement real-time progress dashboard
- [ ] Design import workflow with preview
- [ ] Add user-friendly error displays
- [ ] Create rollback interface
- [ ] Build job history with filters

**UI Components Needed**:
- Export workflow wizard
- Sheet status dashboard
- Import validation preview
- Progress indicators with steps
- Error display with suggestions
- Success confirmations
- Rollback confirmation dialog

**Dependencies**: 5.1 API
**Risks**: User experience complexity

### 5.3 GitHub Integration
**Priority**: P1 - Version control
**Effort**: 3-5 days

**Tasks**:
- [ ] Implement branch creation
- [ ] Add PR automation
- [ ] Create commit linking
- [ ] Add status checks
- [ ] Implement webhooks

**Dependencies**: Epic 2
**Risks**: GitHub API limits

## Epic 6: Testing & Documentation

### 6.1 Test Suite Development
**Priority**: P0 - Quality assurance
**Effort**: 5-7 days

**Tasks**:
- [ ] Create unit test suite
- [ ] Implement integration tests
- [ ] Add E2E test scenarios
- [ ] Create performance tests
- [ ] Implement test automation

**Dependencies**: All other epics
**Risks**: Test flakiness

### 6.2 Documentation
**Priority**: P1 - Adoption
**Effort**: 3-5 days

**Tasks**:
- [ ] Write user guides
- [ ] Create API documentation
- [ ] Add code examples
- [ ] Write troubleshooting guide
- [ ] Create video tutorials

**Dependencies**: All other epics
**Risks**: Documentation drift

### 6.3 Performance Optimization
**Priority**: P2 - Enhancement
**Effort**: 3-5 days

**Tasks**:
- [ ] Profile pipeline performance
- [ ] Optimize database queries
- [ ] Implement caching strategies
- [ ] Add performance monitoring
- [ ] Create performance reports

**Dependencies**: Testing complete
**Risks**: Premature optimization

## Timeline Overview (Two-Person Team)

### ISBD Integration (Week 1)
- **Day 1-2**: Process ISBD spreadsheet → MDX
- **Day 3**: Complete orphan sheet integration
- **Day 4-5**: Design update workflow

### Design & Architecture (Weeks 2-3)
- Week 2: Epic 1 (Architecture) - Focused on update workflow
- Week 3: Environment setup + PoCs

### Implementation Phase 1 (Weeks 4-6)
- Week 4: Extend sheet-sync for updates
- Week 5: Pipeline integration
- Week 6: Database + basic UI

### Implementation Phase 2 (Weeks 7-9)
- Week 7-8: Update workflow UI
- Week 9: Testing + validation

### Polish & Documentation (Weeks 10-12)
- Week 10: Error handling + rollback
- Week 11: Final UI polish
- Week 12: Documentation + handoff

## Resource Allocation

### Two-Person Team Model
**You (Product Owner/Reviewer)**:
- 20-30% time commitment
- Decision making sessions (2-3 hours/week)
- Review and testing (4-5 hours/week)
- Final approvals

**Claude (Developer/Architect)**:
- Primary implementation
- Documentation creation
- Test development
- Technical recommendations

### Adjusted Scope
**Priority Features**:
- Admin UI for all operations
- Visual progress indicators
- User-friendly error messages
- Workflow wizards
- Real-time status updates

**Enhanced for UI**:
- API with WebSocket/SSE support
- Progress events for long operations
- Detailed validation messages
- Preview before commit
- Visual diff display

**Deferred/Simplified**:
- Advanced monitoring dashboards
- Video tutorials (written guides with screenshots)
- Complex automation (manual triggers OK)

### Infrastructure (Simplified)
- Google Cloud project (single environment)
- Supabase free tier for development
- GitHub Actions for basic CI
- Local testing environment

### External Dependencies
- Google Sheets API quotas (monitor closely)
- Single Google account for testing
- Minimal external services
- Focus on built-in solutions

## Risk Mitigation Strategies

### Technical Risks
1. **API Quotas**: Implement batching and caching
2. **Performance**: Design for streaming large datasets
3. **Reliability**: Add comprehensive monitoring
4. **Security**: Implement key rotation and audit logs

### Project Risks
1. **Scope Creep**: Maintain clear epic boundaries
2. **Dependencies**: Start parallel tracks early
3. **Integration**: Test early and often
4. **Timeline**: Build in buffer time

## UI Design Principles for Non-Technical Users

### Core Principles
1. **Hide Complexity**: No Git, GitHub, or technical jargon visible
2. **Visual Feedback**: Every action has clear visual confirmation
3. **Guided Workflows**: Step-by-step wizards for complex tasks
4. **Plain Language**: Use vocabulary domain terms, not technical terms
5. **Error Recovery**: Clear messages with suggested actions

### Key UI Workflows

#### 1. Export to Google Sheets
```
Select Vocabulary → Choose Languages → Create Sheet → Share with Team
```
- Visual preview of what will be exported
- Automatic sharing with team members
- Clear status of "Active Sheets"

#### 2. Import from Sheets
```
Select Sheet → Preview Changes → Validate → Review Errors → Apply Changes
```
- Side-by-side diff view
- Plain English validation messages
- "What will change" summary
- One-click rollback option

#### 3. Progress Monitoring
- Visual progress bars with steps
- Estimated time remaining
- Clear error messages if something fails
- Ability to retry or cancel

### Technical Complexity Abstraction
- **Git Branches** → "Working Copies"
- **Pull Requests** → "Change Proposals"
- **Commits** → "Save Points"
- **Merge** → "Apply Changes"
- **Repository** → "Document Library"

## Two-Person Team Workflow

### Communication Protocol
1. **Daily Async Updates** via GitHub issues
2. **Weekly Sync** for decisions and reviews
3. **Shared Document** for decision log
4. **PR-based Code Reviews** for all changes

### Development Workflow
1. **Claude Creates Branch** with feature implementation
2. **Automated Tests Run** on push
3. **You Review PR** with specific feedback
4. **Claude Addresses Feedback**
5. **You Approve and Merge**

### Decision Making Process
```
Claude proposes options → You evaluate → Decision recorded → Claude implements
```

### Documentation Standards
- Every PR includes updated docs
- ADRs for all architectural decisions
- Runbooks for operations
- Comments in code for complex logic

## Success Criteria (Adjusted for Two-Person Team)

### Per Epic
- Epic 0: All architectural decisions documented and validated
- Epic 1: Google Sheets integration works with rate limiting
- Epic 2: Pipeline runs via CLI without manual intervention
- Epic 3: Database operations are transactional and safe
- Epic 4: Errors are caught and logged (manual recovery OK)
- Epic 5: API works, CLI is primary interface
- Epic 6: Critical paths tested (80% coverage acceptable)

### Overall
- Complete vocabulary round-trip in < 10 minutes via UI
- Zero data loss during operations
- Audit trail visible in UI (simplified view)
- Non-technical users can operate independently
- System demonstrates value for community buy-in
- Clear documentation for both users and developers