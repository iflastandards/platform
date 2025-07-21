# System Design Documentation Consolidation Mapping Table

**Purpose:** Map supplementary documents (11-31) to core documents (00-10) for consolidation  
**Date:** January 2025

## Overview

This table shows how to incorporate supplementary documents into the core system design documentation structure.

## Mapping Table

| Doc # | Title | Main Topic/Purpose | Target Core Doc | Key Information to Preserve |
|-------|-------|-------------------|----------------|---------------------------|
| **11** | discussion-points.md | Tracks resolved/unresolved architectural decisions | **10** (Implementation Strategy) | • Environment strategy decision<br>• Repository naming rationale<br>• TinaCMS status and recommendations<br>• Translation complexity notes |
| **12** | environment-strategy-final.md | Documents 3-environment strategy | **01** (System Architecture) | • Final 3-environment approach<br>• Deployment workflow<br>• Domain strategy<br>• Deprecated approaches |
| **13** | environment-migration-guide.md | Step-by-step migration instructions | **04** (Development Workflow) | • Git commands for migration<br>• Deployment updates<br>• Local development setup<br>• CI/CD configuration |
| **14** | repository-structure-current.md | Explains intentional naming difference | **03** (Configuration Architecture) | • Local vs remote naming rationale<br>• Historical context<br>• Warning against "cleanup" |
| **15** | tinacms-integration-design.md | TinaCMS strategy and POC plan | **09** (Collaboration Architecture) | • Integration options<br>• POC evaluation criteria<br>• Risk assessment<br>• User experience goals |
| **16** | tinacms-poc-guide.md | Detailed POC implementation steps | **10** (Implementation Strategy) | • Technical setup steps<br>• Test workflows<br>• Success criteria<br>• Evaluation framework |
| **17** | tinacms-integration-architecture.md | Technical architecture for TinaCMS | **07** (Subsystems Architecture) | • Component architecture<br>• GitHub integration<br>• Version locking<br>• Permission model |
| **18** | multilingual-strategy-design.md | Unified vs separated language approach | **02** (Data Architecture) | • Hybrid approach recommendation<br>• Implementation patterns<br>• Migration strategy<br>• Technical considerations |
| **19** | edit-permissions-workflow.md | Permission matrix and workflows | **09** (Collaboration Architecture) | • User type permissions<br>• TinaCMS integration<br>• Draft site management<br>• External contributor handling |
| **20** | translation-workflow-integration.md | Version-based sync strategy | **09** (Collaboration Architecture) | • Three workflow comparison<br>• Version boundaries concept<br>• English modification handling<br>• Implementation plan |
| **21** | vocabulary-server-requirements.md | Content negotiation server specs | **05** (API Architecture) | • Pathmap requirements<br>• Lexical alias support<br>• Performance metrics<br>• Architecture options |
| **22** | omr25-comparison-analysis.md | Evolution from original spec | **08** (Architecture Evolution) | • Architecture transformation<br>• Technology stack changes<br>• Feature additions/removals<br>• Lessons learned |
| **23** | mdx-generation-safety-design.md | Dry-run and rollback system | **07** (Subsystems Architecture) | • Preview generation system<br>• Backup strategy<br>• Atomic operations<br>• Recovery procedures |
| **24** | admin-ui-api-specification.md | Comprehensive UI/API specs | **05** (API Architecture) | • 170+ API endpoints<br>• 60+ UI screens<br>• Navigation architecture<br>• Accessibility requirements |
| **25** | design-system-specification.md | Complete design tokens and patterns | **New Doc 11** | • Color system<br>• Typography scale<br>• Component specifications<br>• Animation patterns |
| **26** | ui-component-patterns.md | Practical UI implementations | **New Doc 11** | • Navigation components<br>• Data display patterns<br>• Form components<br>• Responsive patterns |
| **27** | mvp-critical-path.md | MVP implementation timeline | **10** (Implementation Strategy) | • 12-week critical path<br>• Vocabulary server priority<br>• Risk mitigation<br>• Success metrics |
| **28** | isbd-csv-to-mdx-plan.md | ISBD integration execution plan | **10** (Implementation Strategy) | • CSV processing approach<br>• Template configuration<br>• Google Sheets integration<br>• Update workflow |
| **29** | admin-dashboard-mockup-reference.md | Maps SVG mockups to design system | **New Doc 11** | • Color mapping<br>• Layout patterns<br>• Component patterns<br>• Implementation guidelines |
| **30** | integration-prd-alignment-analysis.md | Shows how designs enhance PRD | **08** (Architecture Evolution) | • PRD vs implementation comparison<br>• Key innovations<br>• Enhanced features<br>• Technical improvements |
| **31** | multi-element-set-architecture.md | Handles complex namespace structure | **02** (Data Architecture) | • Multi-element set support<br>• Navigation design<br>• Component architecture<br>• Migration path |

## Consolidation Strategy

### 1. Core Document Updates

**Document 01 - System Architecture Overview**
- Add environment strategy details from doc 12
- Include final deployment architecture

**Document 02 - Data Architecture**
- Incorporate multilingual strategy from doc 18
- Add multi-element set architecture from doc 31
- Include vocabulary data structures

**Document 03 - Configuration Architecture**
- Add repository structure explanation from doc 14
- Include environment-specific configurations

**Document 04 - Development Workflow**
- Add environment migration guide from doc 13
- Include Git workflow details

**Document 05 - API Architecture**
- Merge comprehensive API specification from doc 24
- Add vocabulary server requirements from doc 21
- Include all 170+ endpoints

**Document 06 - Testing Strategy**
- No significant additions from supplementary docs

**Document 07 - Subsystems Architecture**
- Add TinaCMS technical architecture from doc 17
- Include MDX generation safety system from doc 23
- Add RDF conversion subsystem

**Document 08 - Architecture Evolution**
- Incorporate OMR25 comparison from doc 22
- Add PRD alignment analysis from doc 30
- Include lessons learned

**Document 09 - Collaboration Architecture**
- Add TinaCMS integration design from doc 15
- Include edit permissions workflow from doc 19
- Add translation workflow integration from doc 20

**Document 10 - Implementation Strategy**
- Add discussion points resolution from doc 11
- Include TinaCMS POC guide from doc 16
- Add MVP critical path from doc 27
- Include ISBD integration plan from doc 28

### 2. New Core Document

**Document 11 - Design System and UI Patterns** (NEW)
- Complete design system specification from doc 25
- UI component patterns from doc 26
- Admin dashboard mockup reference from doc 29
- Implementation guidelines

### 3. Key Information to Preserve

#### Critical Concepts
1. **Version-based translation synchronization** - Revolutionary approach that eliminates sync conflicts
2. **Vocabulary server pathmap system** - Essential for legacy URL compatibility
3. **Repository naming rationale** - Prevents accidental "cleanup" attempts
4. **3-environment strategy** - Current deployment approach
5. **Multi-element set architecture** - Handles complex namespace structures

#### Technical Specifications
1. **Performance metrics** - Specific targets for all subsystems
2. **API endpoint specifications** - All 170+ endpoints with parameters
3. **Design tokens** - Complete color, typography, spacing systems
4. **Component patterns** - Reusable UI implementations
5. **Safety mechanisms** - Dry-run previews and rollback procedures

#### Implementation Details
1. **12-week MVP timeline** - Critical path with clear priorities
2. **POC evaluation criteria** - Measurable success metrics
3. **Migration procedures** - Step-by-step instructions
4. **Risk mitigation strategies** - Fallback plans for each component
5. **User workflows** - Permission models and collaboration patterns

## Recommended Actions

1. **Create Document 11** for the comprehensive design system
2. **Update core documents 01-10** with mapped content
3. **Archive documents 11-31** after consolidation
4. **Create cross-references** between related sections
5. **Add version control** to track consolidation changes