# EPIC: Vocabulary Management System

**Epic ID**: VMS-001  
**Priority**: P0 - Critical Path  
**Duration**: 4 Weeks  
**Start Date**: 2025-01-15

## Epic Overview

Implement the core vocabulary management system for the IFLA Standards Admin Platform, enabling import of existing vocabularies, editorial workflows, and the 4-phase vocabulary lifecycle.

## Success Criteria

1. ISBD vocabularies successfully imported and viewable in documentation
2. Editorial workflow operational (TinaCMS or custom solution)
3. DCTAP profiles managing validation
4. 4-phase lifecycle implemented
5. Project/Team structure properly modeled

## User Stories and Tasks

### 🎯 Week 1: Import Pipeline Implementation

#### User Story 1.1: Import Wizard Interface
**As a** Review Group Administrator  
**I want to** import vocabulary spreadsheets through a guided interface  
**So that** I can populate namespaces with validated content

**Tasks:**
- [ ] VMS-001: Create import wizard component structure
- [ ] VMS-002: Implement source selection step (GitHub issue, URL, file)
- [ ] VMS-003: Build spreadsheet preview component
- [ ] VMS-004: Create validation results display
- [ ] VMS-005: Implement import options step
- [ ] VMS-006: Add progress tracking UI
- [ ] VMS-007: Create success/error states

#### User Story 1.2: Backend Import Integration
**As a** System Administrator  
**I want to** connect the UI to existing import scripts  
**So that** spreadsheets are correctly processed

**Tasks:**
- [ ] VMS-008: Create `/api/import/start` endpoint
- [ ] VMS-009: Integrate existing spreadsheet scripts
- [ ] VMS-010: Implement job queue with Supabase
- [ ] VMS-011: Add validation script integration
- [ ] VMS-012: Create branch generation logic
- [ ] VMS-013: Implement error handling and rollback

#### User Story 1.3: Supabase Infrastructure
**As a** Developer  
**I want to** track import jobs and validation results  
**So that** we have operational visibility

**Tasks:**
- [ ] VMS-014: Set up Supabase project
- [ ] VMS-015: Create initial schema (import_jobs, activity_logs)
- [ ] VMS-016: Implement job tracking service
- [ ] VMS-017: Add activity logging
- [ ] VMS-018: Create Supabase client wrapper
- [ ] VMS-019: Add real-time job status updates

### 📋 Week 2: DCTAP Profile Management

#### User Story 2.1: CSV to DCTAP Adapter
**As a** Review Group Administrator  
**I want to** generate DCTAP profiles from the master CSV  
**So that** each namespace has appropriate validation

**Tasks:**
- [ ] VMS-020: Create CSV parsing service
- [ ] VMS-021: Build namespace field extraction logic
- [ ] VMS-022: Implement RDF inference from existing files
- [ ] VMS-023: Create profile merge/reconciliation
- [ ] VMS-024: Add profile persistence to Supabase
- [ ] VMS-025: Build profile versioning system

#### User Story 2.2: Profile Management UI
**As a** Namespace Administrator  
**I want to** view and customize DCTAP profiles  
**So that** validation matches our requirements

**Tasks:**
- [ ] VMS-026: Create profile viewer component
- [ ] VMS-027: Build field selection interface
- [ ] VMS-028: Add constraint editor
- [ ] VMS-029: Implement profile testing tool
- [ ] VMS-030: Create profile comparison view
- [ ] VMS-031: Add profile import/export

### ✏️ Week 3: Editorial Interface

#### User Story 3.1: TinaCMS Evaluation
**As a** Development Team  
**I want to** evaluate TinaCMS integration feasibility  
**So that** we choose the best editorial solution

**Tasks:**
- [ ] VMS-032: Research TinaCMS MDX support
- [ ] VMS-033: Test frontmatter form capabilities
- [ ] VMS-034: Evaluate validation integration options
- [ ] VMS-035: Assess Git backend compatibility
- [ ] VMS-036: Create proof of concept
- [ ] VMS-037: Document decision and rationale

#### User Story 3.2A: TinaCMS Integration (if chosen)
**As an** Editor  
**I want to** edit vocabulary documentation with WYSIWYG tools  
**So that** I can work efficiently

**Tasks:**
- [ ] VMS-038A: Configure TinaCMS for project
- [ ] VMS-039A: Create vocabulary content models
- [ ] VMS-040A: Implement RDF frontmatter forms
- [ ] VMS-041A: Add DCTAP validation
- [ ] VMS-042A: Configure Git backend
- [ ] VMS-043A: Create editorial documentation

#### User Story 3.2B: Custom Editor (if TinaCMS not viable)
**As an** Editor  
**I want to** edit vocabulary content with a custom interface  
**So that** I have the tools I need

**Tasks:**
- [ ] VMS-038B: Create form-based metadata editor
- [ ] VMS-039B: Integrate Monaco for MDX editing
- [ ] VMS-040B: Build real-time preview
- [ ] VMS-041B: Add validation feedback
- [ ] VMS-042B: Implement Git commits
- [ ] VMS-043B: Create keyboard shortcuts

### 🏗️ Week 4: Project/Team Structure

#### User Story 4.1: Project Model Implementation
**As a** Review Group Administrator  
**I want to** create and manage chartered projects  
**So that** work is properly organized

**Tasks:**
- [ ] VMS-044: Redesign Project data model
- [ ] VMS-045: Create project management UI
- [ ] VMS-046: Implement team assignment
- [ ] VMS-047: Add namespace assignment to projects
- [ ] VMS-048: Build project dashboard
- [ ] VMS-049: Create deliverables tracking

#### User Story 4.2: Navigation and Access
**As a** User  
**I want to** see all my accessible resources  
**So that** I can navigate efficiently

**Tasks:**
- [ ] VMS-050: Redesign navigation architecture
- [ ] VMS-051: Implement user-centric navbar
- [ ] VMS-052: Create context-aware dashboards
- [ ] VMS-053: Add role-based UI elements
- [ ] VMS-054: Build access summary page

#### User Story 4.3: Cerbos Authorization
**As a** System Administrator  
**I want to** implement fine-grained authorization  
**So that** access control is properly enforced

**Tasks:**
- [ ] VMS-055: Design Cerbos policies
- [ ] VMS-056: Implement policy loader
- [ ] VMS-057: Create authorization middleware
- [ ] VMS-058: Add permission checking to UI
- [ ] VMS-059: Test authorization scenarios
- [ ] VMS-060: Document permission model

## Dependencies

### Technical Dependencies
- Existing spreadsheet import scripts must be working
- Supabase project must be created
- GitHub API access must be configured
- DCTAP CSV must be available

### Team Dependencies
- UX review of import wizard
- Decision on TinaCMS by end of Week 2
- Review Group admin available for testing

## Risks and Mitigations

### Risk: TinaCMS Integration Complexity
- **Impact**: High - Could delay Week 3
- **Probability**: Medium
- **Mitigation**: Time-boxed evaluation, custom editor as fallback

### Risk: Import Script Compatibility
- **Impact**: High - Blocks entire project
- **Probability**: Low
- **Mitigation**: Early testing, maintain script documentation

### Risk: DCTAP CSV Completeness
- **Impact**: Medium - Manual profile creation needed
- **Probability**: Medium
- **Mitigation**: Start with minimal fields, iterate

## Definition of Done

### For Each User Story:
- [ ] Code complete and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests where applicable
- [ ] Documentation updated
- [ ] UI reviewed for consistency
- [ ] Accessibility requirements met

### For Epic Completion:
- [ ] All user stories completed
- [ ] End-to-end testing performed
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] User documentation created
- [ ] Deployment guide updated

## Metrics and Reporting

### Weekly Metrics
- Stories completed vs planned
- Bugs found and fixed
- Test coverage percentage
- Performance benchmarks

### Success Metrics
- Import success rate: >95%
- Validation accuracy: 100%
- User task completion: <5 minutes
- System uptime: 99.9%

## Next Steps After Epic

1. Implement nightly build assembly
2. Add AI-powered versioning
3. Create publication workflow
4. Build translation management
5. Implement advanced search

---

**Note**: This epic is part of the larger IFLA Standards Platform transformation. See CURRENT-IMPLEMENTATION-PLAN.md for strategic context.