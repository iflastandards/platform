# Subagent Implementation Guide - How to Use Specialized Agents

## Overview

This guide shows how to implement and invoke the specialized subagents defined in SPECIALIZED_SUBAGENTS_DESIGN.md and SUBAGENT_SPECIFICATIONS.md for optimal feature development.

## 🤖 Available Specialized Subagents

### 1. crud-builder - CRUD Feature Expert
**Expertise**: Refine.dev, Ant Design, forms, tables, RBAC, Supabase RLS
**Use when**: Building data management interfaces with forms and tables

### 2. job-orchestrator - Long-Running Operations Expert  
**Expertise**: Job queues, Edge Functions, progress monitoring, chunking, retries
**Use when**: Any operation taking >3 seconds or processing large datasets

### 3. github-syncer - GitHub Integration Expert
**Expertise**: Octokit, webhooks, GraphQL vs REST, rate limiting, caching
**Use when**: Integrating with GitHub API or syncing GitHub data

### 4. test-architect - Testing Strategy Expert
**Expertise**: MSW, contract testing, E2E patterns, coverage analysis, TDD
**Use when**: Designing comprehensive test suites and strategies

### 5. perf-optimizer - Performance Expert
**Expertise**: React optimization, query tuning, bundle splitting, virtualization
**Use when**: Fixing performance issues or optimizing slow components

## 📋 How to Invoke Subagents

### Pattern 1: Direct Invocation with Task Tool

```typescript
// When you need a CRUD interface
await task({
  subagent_type: "general",
  description: "Create vocabulary CRUD",
  prompt: `
    Acting as crud-builder agent:
    
    Entity: Vocabulary
    Fields: name, uri, prefix, status, description
    
    Requirements:
    - URI validation (must be valid URL)
    - Prefix uniqueness check
    - Status workflow: draft → published → deprecated
    - Bulk operations for import/export
    
    Permissions:
    - Viewers: read only
    - Editors: create/edit drafts
    - Admins: publish and deprecate
    
    Use Refine.dev generators with Ant Design.
    Check current Refine.dev docs for useTable and useForm hooks.
    Implement with TDD approach using RED-GREEN-REFACTOR.
  `
});
```

### Pattern 2: Multi-Agent Collaboration

```typescript
// Building a complete feature with multiple aspects
const results = await Promise.all([
  // CRUD interface
  task({
    subagent_type: "general",
    description: "Design CRUD interface",
    prompt: `As crud-builder: Create namespace management with advanced search, filters, and inline editing`
  }),
  
  // Import/Export functionality
  task({
    subagent_type: "general",
    description: "Design import system",
    prompt: `As job-orchestrator: Create CSV/Excel import with validation, progress tracking, and error recovery`
  }),
  
  // Performance optimization
  task({
    subagent_type: "general", 
    description: "Optimize for scale",
    prompt: `As perf-optimizer: Handle 50,000+ namespaces with virtual scrolling and optimized queries`
  }),
  
  // Comprehensive testing
  task({
    subagent_type: "general",
    description: "Create test suite",
    prompt: `As test-architect: Design TDD test suite with MSW mocks, contract validation, and 90% coverage`
  })
]);
```

### Pattern 3: Sequential Agent Pipeline

```typescript
// Agents working in sequence, each building on the previous
// Step 1: Architecture design
const architecture = await task({
  subagent_type: "general",
  description: "Design architecture",
  prompt: `As test-architect: Design the overall architecture for vocabulary management system with TDD approach`
});

// Step 2: CRUD implementation
const crud = await task({
  subagent_type: "general",
  description: "Implement CRUD",
  prompt: `As crud-builder: Implement the vocabulary management based on this architecture: ${architecture}`
});

// Step 3: Add long-running operations
const jobs = await task({
  subagent_type: "general",
  description: "Add import/export",
  prompt: `As job-orchestrator: Add import/export to this CRUD system: ${crud}`
});

// Step 4: Optimize performance
const optimized = await task({
  subagent_type: "general",
  description: "Optimize performance",
  prompt: `As perf-optimizer: Optimize this implementation for 100k+ records: ${jobs}`
});
```

## 🎯 Subagent Prompt Templates

### crud-builder Prompt Template
```
Acting as crud-builder specialized agent:

MUST CHECK FIRST:
- Refine.dev Ant Design docs: https://refine.dev/docs/ui-integrations/ant-design/
- Current useTable and useForm hook patterns
- Latest Ant Design 5.x component APIs

Entity: [Entity Name]
Fields: [List fields with types and validation]
Relationships: [Related entities]
Business Rules: [Unique constraints, workflows]
RBAC: [Role-based permissions]

Generate:
1. Zod contracts with validation
2. Resource metadata for Refine.dev
3. List view with filters, sorting, pagination
4. Create/Edit forms with validation
5. MSW handlers for testing
6. Unit and integration tests

Use TDD approach: RED → GREEN → REFACTOR
Follow environment switching patterns for mock/real data
```

### job-orchestrator Prompt Template
```
Acting as job-orchestrator specialized agent:

Job Type: [Import/Export/Process/Sync]
Data Volume: [Expected size]
Processing Steps: [List of operations]
Progress Tracking: [How to calculate/report]
Error Handling: [Recovery strategy]
Performance: [Time constraints]

Generate:
1. Job contract with status tracking
2. Edge Function or API route
3. Chunking strategy for large data
4. Progress calculation logic
5. Error recovery and retry logic
6. Client-side progress UI
7. MSW handlers for job simulation
8. Tests for success/failure/timeout

Consider:
- Memory limits for Edge Functions
- Timeout constraints
- Graceful cancellation
- Result caching
```

### github-syncer Prompt Template
```
Acting as github-syncer specialized agent:

Integration Type: [Webhook/Polling/Hybrid]
Resources: [Teams/Repos/Issues/PRs]
Sync Direction: [GitHub→App/App→GitHub/Bidirectional]
Rate Limits: [Expected API call volume]
Caching Strategy: [What to cache and for how long]

Generate:
1. Octokit client configuration
2. Webhook handlers with signature validation
3. GraphQL queries for efficient data fetching
4. Rate limit handling with backoff
5. Caching layer implementation
6. Conflict resolution logic
7. MSW handlers for GitHub API
8. Tests for sync scenarios

Consider:
- GitHub API v4 GraphQL vs REST
- App installation vs OAuth
- Webhook security
- Rate limit optimization
```

### test-architect Prompt Template
```
Acting as test-architect specialized agent:

Feature: [Feature to test]
Test Strategy: [Unit/Integration/E2E balance]
Coverage Target: [Percentage]
Critical Paths: [Must-test scenarios]
Performance Requirements: [Speed constraints]

Generate:
1. Test plan with phase distribution
2. Test file structure and naming
3. MSW handler setup
4. Contract validation tests
5. Component unit tests
6. Service integration tests
7. E2E critical path tests
8. Performance benchmarks
9. Test data factories
10. Environment switching setup

Follow 5-phase testing strategy:
- Phase 2: @unit with mocks
- Phase 3: @integration with MSW
- Phase 4: @e2e with real services
- Phase 5: @smoke production tests
```

### perf-optimizer Prompt Template
```
Acting as perf-optimizer specialized agent:

Performance Issue: [Slow rendering/API/Loading]
Current Metrics: [Load time/FPS/Memory]
Target Metrics: [Goals]
Data Volume: [Expected scale]
User Experience: [Acceptable delays]

Analyze and optimize:
1. React component memoization
2. Query optimization with indexes
3. Bundle splitting strategy
4. Virtual scrolling implementation
5. Caching layers (React Query/CDN)
6. Lazy loading boundaries
7. Service worker caching
8. Database query optimization
9. API response pagination
10. Image optimization

Generate:
- Performance audit report
- Optimization implementation
- Before/after metrics
- Load testing scenarios
```

## 📚 Documentation Strategy for Subagents

### CRITICAL: Always Check Current Docs

Each subagent MUST consult current documentation before generating code:

```typescript
// Example: crud-builder checking Refine.dev docs
async function beforeGeneratingCRUD() {
  // 1. Check official Refine.dev docs
  const refineDocs = await webfetch({
    url: "https://refine.dev/docs/ui-integrations/ant-design/components/crud/list/",
    format: "markdown"
  });
  
  // 2. Check Context7 for latest patterns
  const patterns = await task({
    subagent_type: "general",
    description: "Get Refine patterns",
    prompt: "Check Context7 for /refinedev/refine useTable hook with Ant Design integration"
  });
  
  // 3. Generate code based on CURRENT documentation
  return generateFromCurrentDocs(refineDocs, patterns);
}
```

### Library Version Awareness

Subagents must be aware of current versions:
- React 19 (concurrent features, suspense)
- Next.js 15 (App Router patterns)
- Ant Design 5.x (theming API changes)
- Refine.dev v4 (hook patterns)
- Supabase v2 (client initialization)

## 🚀 Implementation Workflow

### Step 1: Identify Feature Type
Determine which subagent(s) are needed based on the feature requirements.

### Step 2: Prepare Subagent Prompts
Use the templates above, filling in specific requirements.

### Step 3: Check Documentation
Have subagents consult current docs via webfetch and Context7.

### Step 4: Invoke Subagents
Use task tool with appropriate prompts, either in parallel or sequence.

### Step 5: Integrate Results
Combine outputs from multiple subagents into cohesive implementation.

### Step 6: Apply TDD Workflow
Follow AUTOMATED_TDD_WORKFLOW.md with RED-GREEN-REFACTOR cycle.

## 🎭 Subagent Personalities & Decision Making

### crud-builder Decisions
```typescript
// The agent makes these decisions autonomously
decisions: {
  whenToUseInferencer: (fields) => fields.length < 20 && !hasComplexValidation,
  whenToCustomize: (requirements) => hasCustomWorkflow || complexValidation,
  whenToUseVirtualization: (rows) => rows > 1000,
  formLibrary: (complexity) => complexity > 7 ? 'react-hook-form' : 'antd-form',
  tableFeatures: (dataSize) => dataSize > 5000 ? ['virtual', 'lazy'] : ['pagination']
}
```

### job-orchestrator Decisions
```typescript
decisions: {
  processingStrategy: (size) => size > 10000 ? 'chunked' : 'batch',
  chunkSize: (memory, itemSize) => Math.floor(memory * 0.8 / itemSize),
  retryStrategy: (priority) => priority === 'critical' ? 'exponential' : 'linear',
  progressGranularity: (items) => items > 1000 ? 'percentage' : 'per-item',
  timeoutStrategy: (duration) => duration > 300 ? 'checkpoint' : 'restart'
}
```

### github-syncer Decisions
```typescript
decisions: {
  apiVersion: (complexity) => complexity > 3 ? 'graphql' : 'rest',
  syncStrategy: (frequency) => frequency < 60 ? 'webhook' : 'polling',
  cacheStrategy: (volatility) => volatility === 'low' ? 'aggressive' : 'conservative',
  rateLimitBuffer: (remaining) => remaining < 100 ? 'pause' : 'continue',
  conflictResolution: (type) => type === 'metadata' ? 'latest-wins' : 'manual'
}
```

## 💡 Best Practices

1. **Always invoke subagents for their specialty** - Don't use general agent for CRUD when crud-builder exists
2. **Combine agents for complex features** - Use multiple specialists in parallel
3. **Check documentation first** - Subagents must consult current docs, not training data
4. **Follow TDD workflow** - All subagents follow RED-GREEN-REFACTOR
5. **Use environment switching** - All code supports mock/real toggling
6. **Tag tests appropriately** - Follow 5-phase testing strategy

## 📊 Subagent Selection Matrix

| Feature Type | Primary Agent | Supporting Agents | 
|-------------|---------------|-------------------|
| Simple CRUD | crud-builder | test-architect |
| CRUD + Import | crud-builder | job-orchestrator, test-architect |
| GitHub Integration | github-syncer | test-architect |
| Performance Fix | perf-optimizer | test-architect |
| Complex Feature | crud-builder | job-orchestrator, github-syncer, perf-optimizer, test-architect |

## 🔄 Feedback Loop

After invoking subagents, always:
1. Review generated code against requirements
2. Verify TDD cycle was followed
3. Check test coverage meets targets
4. Ensure environment switching works
5. Validate against current documentation

## Related Documents

- `SPECIALIZED_SUBAGENTS_DESIGN.md` - Detailed agent specifications
- `SUBAGENT_SPECIFICATIONS.md` - Documentation requirements
- `AUTOMATED_TDD_WORKFLOW.md` - TDD methodology all agents follow
- `AGENTS.md` - Main guidance document with subagent references