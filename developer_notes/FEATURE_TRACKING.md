# Feature Factory Tracking System

## Overview

This document defines how we track Feature Factory progress, manage git branches, and handle work interruptions during admin feature development.

## Starting a New Feature

### Automatic Branch Creation
```bash
# Always creates a feature branch automatically
pnpm admin:feature "csv imports"

# This will:
1. Check current git status
2. Create branch: feature/csv-imports
3. Initialize feature tracking in .feature-state.json
4. Start Phase 1 with TodoWrite tracking
```

### Feature State File
**Location**: `.feature-state.json` (gitignored)

```json
{
  "currentFeature": "csv-imports",
  "branch": "feature/csv-imports",
  "phase": 2,
  "status": "in_progress",
  "startedAt": "2024-01-15T10:00:00Z",
  "lastCheckpoint": "2024-01-15T11:30:00Z",
  "phases": {
    "1": {
      "name": "Feature Identification & Requirements",
      "status": "completed",
      "completedAt": "2024-01-15T10:30:00Z",
      "artifacts": [
        "packages/contracts/schemas/CsvImport.zod.ts",
        "docs/features/csv-imports/requirements.md"
      ]
    },
    "2": {
      "name": "Code Discovery & Analysis",
      "status": "in_progress",
      "startedAt": "2024-01-15T10:31:00Z",
      "discoveries": [
        "scripts/csv-processor.ts - HIGH refactor potential",
        "tools/data-validator.js - MEDIUM refactor potential"
      ]
    }
  },
  "todos": [
    {
      "id": "1",
      "phase": 1,
      "content": "Define user stories",
      "status": "completed"
    },
    {
      "id": "2",
      "phase": 1,
      "content": "Create Zod schemas",
      "status": "completed"
    },
    {
      "id": "3",
      "phase": 2,
      "content": "Search for existing CSV scripts",
      "status": "in_progress"
    }
  ]
}
```

## Status Commands

### Check Current Status
```bash
pnpm admin:status
# or just ask: "where are we in the csv imports feature?"

# Output:
📊 Feature: CSV Imports
🌿 Branch: feature/csv-imports
📍 Phase 2: Code Discovery & Analysis (in progress)
⏱️ Time in phase: 15 minutes
✅ Completed: Phase 1 (Requirements)
📝 Current task: Searching for existing CSV scripts

Recent progress:
✅ Created CsvImport.zod.ts schema
✅ Defined RBAC matrix (admin: all, editor: read/create)
🔄 Found 3 scripts with refactor potential
⏳ Analyzing integration opportunities
```

### Detailed Progress View
```bash
pnpm admin:progress --verbose

# Shows:
- All completed phases with artifacts
- Current phase tasks with status
- Time spent per phase
- Files created/modified
- Pending decisions
```

## Checkpoint & Pause System

### Creating Checkpoints

**Automatic Checkpoints**
- Every 30 minutes during active work
- After completing each phase
- Before risky operations

**Manual Checkpoints**
```bash
pnpm admin:checkpoint
# or say: "let's save our progress here"

# Creates:
- Git commit with WIP message
- Updates .feature-state.json
- Saves TodoWrite state
- Records open files and cursor positions
```

### Pausing Work

**Quick Pause**
```bash
pnpm admin:pause
# or say: "let's take a break" / "let's park this for now"

# Actions:
1. Creates checkpoint
2. Commits WIP with descriptive message
3. Saves detailed state for resume
4. Shows resume instructions
```

**Switch to Different Work**
```bash
pnpm admin:switch
# or say: "let's work on something else" / "let's come back to this"

# Actions:
1. Creates checkpoint on current feature
2. Stashes uncommitted changes
3. Switches to main/develop branch
4. Shows how to resume later
```

### Resuming Work

**Resume Last Feature**
```bash
pnpm admin:resume
# or say: "let's continue with the csv imports feature"

# Actions:
1. Switches to feature branch
2. Applies stashed changes
3. Loads .feature-state.json
4. Restores TodoWrite state
5. Shows current phase and next steps
```

**Resume Specific Feature**
```bash
pnpm admin:resume csv-imports
# Lists all paused features if none specified
```

## Git Branch Management

### Branch Naming Convention
```
feature/[feature-name]  # New features
fix/[issue-desc]        # Bug fixes
refactor/[area]         # Refactoring
docs/[topic]            # Documentation
```

### Automatic Branch Operations

**Feature Start**
```bash
pnpm admin:feature "user roles"
# Creates: feature/user-roles
# Never works on main/develop directly
```

**Phase Commits**
```bash
# Automatic commit after each phase completion
git commit -m "feat(admin): complete Phase 1 - user roles requirements"
git commit -m "feat(admin): complete Phase 2 - code discovery for user roles"
```

**WIP Commits**
```bash
# During pause/checkpoint
git commit -m "WIP(admin): user roles - Phase 3 scaffolding in progress"
```

## Task Tracking Integration

### TodoWrite Synchronization

The system maintains todos in two places:
1. **TodoWrite** - For active session tracking
2. **.feature-state.json** - For persistence across sessions

```typescript
// Automatic sync on:
- Todo status changes
- Phase completion
- Checkpoint creation
- Pause/resume operations
```

### Phase-Specific Todos

**Phase 1 Tasks** (Requirements)
- [ ] Define user stories
- [ ] Create RBAC matrix
- [ ] Draft Zod schemas
- [ ] Identify resource name

**Phase 2 Tasks** (Discovery)
- [ ] Search for existing scripts
- [ ] Analyze refactor potential
- [ ] Identify dependencies
- [ ] Plan integration approach

**Phase 3 Tasks** (Scaffolding)
- [ ] Run refine generator
- [ ] Verify generated files
- [ ] Test basic CRUD operations
- [ ] Connect MSW handlers

[... continues for all 7 phases]

## Quick Reference

### Status Queries
- "Where are we?" → Shows current phase and progress
- "What's left?" → Lists remaining tasks in current phase
- "Show me the plan" → Displays full feature roadmap
- "What did we complete?" → Shows completed phases/artifacts

### Work Control
- "Let's take a break" → Pause with checkpoint
- "Let's park this" → Pause and switch to main
- "Let's come back to this later" → Full checkpoint and branch switch
- "Let's continue" → Resume last feature
- "Let's switch to [feature]" → Change active feature

### Progress Commands
```bash
pnpm admin:status          # Current status
pnpm admin:checkpoint      # Save progress
pnpm admin:pause          # Pause work
pnpm admin:resume         # Continue work
pnpm admin:switch         # Change features
pnpm admin:list-features  # Show all features
pnpm admin:archive        # Archive completed feature
```

## Memory Patterns

### Session Persistence
```typescript
// Saved on every checkpoint
{
  feature: "csv-imports",
  phase: 3,
  currentTask: "Adding file upload widget",
  lastActivity: "2024-01-15T12:00:00Z",
  nextSteps: [
    "Complete upload preview",
    "Add validation display",
    "Test with sample CSV"
  ]
}
```

### Cross-Session Continuity
When you ask "where are we?", the system checks:
1. Current git branch
2. .feature-state.json
3. Recent commits
4. TodoWrite state
5. Modified files since checkpoint

## Best Practices

1. **Always use feature branches** - Never work directly on main
2. **Checkpoint frequently** - Every 30 minutes or major milestone
3. **Use descriptive pauses** - Add context when pausing
4. **Complete phases** - Try to finish current phase before switching
5. **Clean checkpoints** - Ensure code compiles before checkpoint

## Integration with Feature Factory

This tracking system enhances the 7-phase workflow by:
- **Automatic branch management** per feature
- **Persistent state** across sessions
- **Clear progress visibility** at any time
- **Safe work interruptions** with easy resume
- **Historical tracking** of all features

## Example Workflow

```bash
# Monday morning - Start new feature
$ pnpm admin:feature "invoice management"
✅ Created branch: feature/invoice-management
📍 Starting Phase 1: Requirements

# Work for 2 hours...
"Let's take a lunch break"
✅ Checkpoint saved
✅ Phase 1 completed, Phase 2 in progress
💾 State saved to .feature-state.json

# After lunch
"Where are we with invoice management?"
📊 Feature: Invoice Management
📍 Phase 2: Code Discovery (30% complete)
📝 Current: Analyzing existing invoice scripts
⏭️ Next: Evaluate refactor potential

# Emergency bug comes in
"Let's park this and fix the auth bug"
✅ Feature state saved
✅ Switched to fix/auth-timeout branch

# Next day
"Let's continue with invoice management"
✅ Restored feature/invoice-management
📍 Resuming Phase 2: Code Discovery
📝 Found 3 scripts to refactor...
```

This system ensures we never lose track of where we are in any feature!