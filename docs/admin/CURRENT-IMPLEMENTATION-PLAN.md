# 🎯 CURRENT IMPLEMENTATION PLAN - IFLA Standards Admin Platform

**Status**: ACTIVE PLAN  
**Last Updated**: 2025-01-15  
**Priority**: Import ISBD vocabularies to enable namespace completion

---

## Executive Summary

This document represents our current implementation plan for the IFLA Standards Admin Platform, incorporating insights from early design work while focusing on the immediate goal: using the admin interface to import ISBD spreadsheets and complete namespace development.

### Key Realizations
1. **TinaCMS integration status**: Not integrated yet - need to evaluate before building custom editor
2. **DCTAP approach**: Adapt from comprehensive CSV rather than create from scratch
3. **Existing assets**: Working spreadsheet integration scripts and ISBD data ready to import
4. **Core innovation**: Spreadsheet → MDX documentation → RDF generation pipeline

## Current State Assessment

### What We Have
- ✅ GitHub Teams authentication working
- ✅ Basic admin dashboard with navigation
- ✅ Spreadsheet integration scripts (tested and working)
- ✅ ISBD spreadsheets ready for import
- ✅ Comprehensive CSV that can be adapted to DCTAP
- ✅ MDX generation capabilities

### What We Need
- ❌ Import wizard UI to trigger existing scripts
- ❌ DCTAP adaptation from CSV
- ❌ Editorial interface (TinaCMS or custom)
- ❌ Project/Team implementation aligned with "chartered initiatives" concept
- ❌ Supabase integration for operational data
- ❌ 4-phase vocabulary lifecycle implementation

## Implementation Strategy

### Phase 1: Enable ISBD Import (Week 1)
**Goal**: Get ISBD vocabularies imported and generating documentation

1. **Minimal Import UI**
   - Simple wizard at `/admin/import`
   - Connect to existing spreadsheet scripts
   - Generate MDX files with RDF frontmatter
   - Create preview branch

2. **Supabase Integration**
   - Set up minimal schema (import jobs, activity logs)
   - Track import progress and validation results
   - Store operational data only (content stays in Git)

3. **Validation Display**
   - Show validation results from DCTAP
   - Allow proceeding with warnings
   - Clear error reporting

### Phase 2: DCTAP Management (Week 2)
**Goal**: Create namespace-specific profiles from master CSV

1. **CSV Adapter**
   - Load comprehensive CSV
   - Extract namespace-relevant fields
   - Infer additional fields from existing RDF
   - Generate namespace DCTAP profile

2. **Profile UI**
   - View current profile
   - Select/deselect fields
   - Save namespace-specific configuration
   - Use for import validation

### Phase 3: Editorial Interface Decision (Week 3)
**Goal**: Implement best editing solution

#### Option A: TinaCMS Integration (Preferred if feasible)
- Research integration approach
- Configure for MDX with RDF frontmatter
- Add DCTAP validation
- Implement Git backend

#### Option B: Custom Editor (If TinaCMS proves difficult)
- Form-based frontmatter editing
- Monaco/CodeMirror for MDX content
- Real-time preview
- Git commit integration

### Phase 4: Project/Team Structure (Week 4)
**Goal**: Implement proper organizational model

1. **Fix Project Model**
   - Projects as chartered initiatives (not just GitHub projects)
   - One team per project
   - Namespace assignment to projects
   - Proper navigation reflecting access

2. **Implement Cerbos**
   - Real-time authorization
   - Context-aware permissions
   - Policy as code

## Critical Path Tasks

### Week 1 Sprint: ISBD Import
- [ ] Create import wizard component
- [ ] Add API route for spreadsheet import
- [ ] Set up Supabase with minimal schema
- [ ] Implement import job tracking
- [ ] Test with actual ISBD data
- [ ] Generate preview branch
- [ ] Display validation results

### Week 2 Sprint: DCTAP Foundation
- [ ] Build CSV adapter service
- [ ] Create namespace profile extraction
- [ ] Implement RDF inference for profiles
- [ ] Build profile management UI
- [ ] Store profiles in Supabase
- [ ] Use profiles in import validation

### Week 3 Sprint: Editorial Interface
- [ ] **Decision Point**: Evaluate TinaCMS integration
- [ ] If TinaCMS: Research, configure, integrate
- [ ] If custom: Build form editor, integrate Monaco
- [ ] Add real-time validation
- [ ] Implement preview capability
- [ ] Connect to Git for saves

### Week 4 Sprint: Projects & Permissions
- [ ] Redesign Project model (chartered initiatives)
- [ ] Update navigation for complete access view
- [ ] Implement team management
- [ ] Add namespace assignment
- [ ] Integrate Cerbos policies
- [ ] Test authorization flows

## Technical Decisions

### TinaCMS Evaluation Criteria
Before building custom editor, evaluate TinaCMS on:

1. **MDX Support**: Can it handle our MDX structure?
2. **Frontmatter Forms**: Can we create RDF metadata forms?
3. **Validation Integration**: Can we add DCTAP validation?
4. **Git Backend**: Does it work with our Git flow?
5. **Multi-language**: Support for multilingual content?
6. **Learning Curve**: How complex for editors?

**Decision Deadline**: End of Week 2

### Supabase Schema Philosophy
- Store operational data only
- Content lives in Git/MDX files
- Focus on job tracking and state management
- Activity logs for audit trail
- Lightweight and performant

## Success Metrics

### Week 1 Success
- ✅ ISBD vocabularies successfully imported
- ✅ MDX files generated with correct RDF
- ✅ Preview branch created and viewable
- ✅ Validation results clearly displayed

### Week 2 Success
- ✅ DCTAP profiles extracted from CSV
- ✅ Namespace-specific profiles created
- ✅ Validation using adapted profiles

### Week 3 Success
- ✅ Editorial interface decision made
- ✅ Basic editing capability implemented
- ✅ Validation integrated with editing

### Week 4 Success
- ✅ Projects properly modeled
- ✅ Navigation reflects user access
- ✅ Cerbos authorization working

## Risks and Mitigations

### Risk: TinaCMS Integration Complexity
- **Mitigation**: Time-boxed evaluation (3 days max)
- **Fallback**: Custom editor with Monaco

### Risk: DCTAP CSV Adaptation Issues
- **Mitigation**: Start with minimal fields
- **Fallback**: Manual profile creation UI

### Risk: Import Script Failures
- **Mitigation**: Extensive error handling
- **Fallback**: Manual MDX creation tools

## Long-term Vision Alignment

This tactical plan supports the strategic vision from the executive briefing:

1. **Integrated Workflow**: Spreadsheet → Documentation → RDF
2. **GitHub-Centric**: Teams, Projects, and version control
3. **4-Phase Lifecycle**: Bootstrap → Edit → Assembly → Publish
4. **External Participation**: Through GitHub Projects
5. **Quality Assurance**: Automated validation and versioning

## Next Actions

### Immediate (Today)
1. Set up Supabase project
2. Create import wizard component structure
3. Plan TinaCMS evaluation approach

### This Week
1. Complete Week 1 Sprint tasks
2. Test with real ISBD data
3. Document any issues found

### Next Week
1. Begin DCTAP adaptation
2. Evaluate TinaCMS integration
3. Make editorial interface decision

---

**Note**: This is a living document. Update as decisions are made and progress occurs.