# Specialized Subagents for Feature Development

## Overview

Instead of one generalist agent handling all feature types, we create specialized subagents that deeply understand their domain and can be invoked through the Task tool.

## Proposed Subagent Architecture

### 1. CRUD Feature Agent (`crud-builder`)

**Expertise:**
- Refine.dev Inferencer optimization
- Ant Design form patterns
- Supabase RLS policies
- Contract-to-UI generation
- RBAC implementation patterns

**Specialized Knowledge:**
```typescript
const CrudBuilderAgent = {
  expertise: [
    'Refine.dev resource configuration',
    'Inferencer field mapping',
    'Ant Design form validation',
    'Supabase CRUD operations',
    'Optimistic updates',
    'Pagination strategies',
    'Filter/sort implementation'
  ],
  
  templates: {
    resource: 'refine-resource-template.ts',
    contract: 'crud-contract-template.ts',
    tests: 'crud-test-template.ts'
  },
  
  decisions: {
    whenToUseInferencer: (fields) => fields.length < 20,
    whenToCustomize: (requirements) => requirements.includes('complex-validation'),
    whenToUseVirtualization: (expectedRows) => expectedRows > 1000
  }
};
```

**Invocation:**
```typescript
await task({
  description: "Create vocabulary CRUD",
  subagent_type: "crud-builder",
  prompt: `
    Entity: Vocabulary
    Fields: name, uri, prefix, status
    Special: URI validation, prefix uniqueness
    Permissions: Editors can create, Admins can approve
  `
});
```

### 2. Job Queue Agent (`job-orchestrator`)

**Expertise:**
- Supabase Edge Functions
- Job queue patterns
- Progress monitoring
- SSE/WebSocket implementation
- Retry strategies
- Timeout handling

**Specialized Knowledge:**
```typescript
const JobOrchestratorAgent = {
  expertise: [
    'Supabase job queue setup',
    'Edge Function optimization',
    'Progress calculation strategies',
    'Chunked processing',
    'Graceful cancellation',
    'Error recovery patterns',
    'Result caching'
  ],
  
  patterns: {
    simpleJob: 'single-step-job-pattern.ts',
    multiStepJob: 'pipeline-job-pattern.ts',
    parallelJob: 'parallel-processing-pattern.ts',
    recurringJob: 'cron-job-pattern.ts'
  },
  
  decisions: {
    whenToChunk: (dataSize) => dataSize > 1000,
    batchSize: (memoryLimit, itemSize) => Math.floor(memoryLimit / itemSize),
    retryStrategy: (jobType) => jobType === 'critical' ? 'exponential' : 'linear'
  }
};
```

**Invocation:**
```typescript
await task({
  description: "Import namespaces from CSV",
  subagent_type: "job-orchestrator",
  prompt: `
    Job Type: CSV import
    Data Size: Up to 10,000 rows
    Processing: Validate each row, check duplicates
    Progress: Show per-row progress
    Error Handling: Collect all errors, allow partial success
  `
});
```

### 3. GitHub Integration Agent (`github-syncer`)

**Expertise:**
- Octokit optimization
- Webhook security
- Rate limit strategies
- GraphQL vs REST decisions
- Caching strategies
- Conflict resolution

**Specialized Knowledge:**
```typescript
const GitHubSyncerAgent = {
  expertise: [
    'GitHub API v4 GraphQL',
    'Webhook signature validation',
    'Rate limit handling',
    'Pagination strategies',
    'Bulk operations',
    'Team/repo permission models',
    'GitHub Apps vs OAuth'
  ],
  
  strategies: {
    polling: 'polling-sync-strategy.ts',
    webhook: 'webhook-sync-strategy.ts',
    hybrid: 'hybrid-sync-strategy.ts'
  },
  
  decisions: {
    whenToUseGraphQL: (fields) => fields.length > 3 || fields.includes('nested'),
    cacheStrategy: (endpoint) => endpoint.includes('teams') ? 'aggressive' : 'moderate',
    rateLimitBuffer: (remaining) => remaining < 100 ? 'pause' : 'continue'
  }
};
```

**Invocation:**
```typescript
await task({
  description: "Sync GitHub teams",
  subagent_type: "github-syncer",
  prompt: `
    Sync Type: Teams and members
    Direction: GitHub → Database
    Frequency: Webhook + daily reconciliation
    Conflicts: GitHub wins
    Special: Map GitHub teams to RBAC roles
  `
});
```

### 4. Test Strategy Agent (`test-architect`)

**Expertise:**
- MSW handler generation
- Contract test generation
- E2E test patterns
- Performance test design
- Accessibility testing

**Specialized Knowledge:**
```typescript
const TestArchitectAgent = {
  expertise: [
    'MSW handler patterns',
    'Contract testing with Zod',
    'Playwright best practices',
    'Jest/Vitest optimization',
    'Test data generation',
    'Accessibility testing',
    'Performance benchmarks'
  ],
  
  generateStrategy: (featureType) => {
    switch(featureType) {
      case 'crud': return 'crud-test-strategy.ts';
      case 'job': return 'job-test-strategy.ts';
      case 'github': return 'external-api-test-strategy.ts';
    }
  },
  
  decisions: {
    mockStrategy: (dependencies) => dependencies.includes('external') ? 'full' : 'partial',
    testDataVolume: (feature) => feature.includes('list') ? 100 : 10,
    parallelization: (testCount) => testCount > 50
  }
};
```

### 5. Performance Optimizer Agent (`perf-optimizer`)

**Expertise:**
- React performance patterns
- Database query optimization
- Caching strategies
- Bundle optimization
- Virtual scrolling

**Specialized Knowledge:**
```typescript
const PerfOptimizerAgent = {
  expertise: [
    'React.memo optimization',
    'useMemo/useCallback patterns',
    'Supabase query optimization',
    'Index strategies',
    'CDN configuration',
    'Code splitting',
    'Lazy loading'
  ],
  
  analyze: (component) => ({
    renderCount: measureRenders(component),
    bundleImpact: analyzeBundleSize(component),
    queryComplexity: analyzeQueries(component)
  }),
  
  optimize: {
    whenToVirtualize: (rows) => rows > 100,
    whenToMemoize: (computationCost) => computationCost > 10ms,
    whenToIndexDB: (queryFrequency) => queryFrequency > 100/min
  }
};
```

## Implementation in AGENTS.md

```markdown
## Specialized Subagents Available

When I detect specific feature types, I can invoke specialized subagents:

### CRUD Features → `crud-builder`
- Automatically invoked for "management" features
- Handles Refine.dev generation and customization
- Optimizes for data tables and forms

### Long-Running → `job-orchestrator`
- Automatically invoked for import/export/processing
- Designs job architecture
- Implements progress monitoring

### GitHub → `github-syncer`
- Automatically invoked for GitHub integration
- Handles API optimization
- Implements sync strategies

### Testing → `test-architect`
- Can be explicitly invoked: "Design tests for [feature]"
- Generates comprehensive test strategies
- Creates MSW handlers

### Performance → `perf-optimizer`
- Invoked when performance issues detected
- Or explicitly: "Optimize [feature] performance"
- Provides specific recommendations
```

## How Subagents Would Work

### 1. Automatic Invocation
```typescript
// Main agent detects feature type
if (prompt.includes('management') || prompt.includes('CRUD')) {
  const result = await task({
    subagent_type: 'crud-builder',
    description: 'Build CRUD feature',
    prompt: requirements
  });
}
```

### 2. Explicit Invocation
```
You: "Use the job-orchestrator to design the import system"
Me: *Invokes job-orchestrator subagent*
```

### 3. Collaborative Invocation
```typescript
// Main agent coordinates multiple subagents
const crudDesign = await task({ subagent_type: 'crud-builder', ... });
const testStrategy = await task({ subagent_type: 'test-architect', ... });
const performance = await task({ subagent_type: 'perf-optimizer', ... });
```

## Benefits of Specialization

### 1. **Deeper Expertise**
Each subagent maintains deep, specific knowledge:
- CRUD agent knows every Refine.dev hook
- Job agent knows Edge Function limits
- GitHub agent knows API rate limits

### 2. **Better Decision Making**
Specialized heuristics for each domain:
- When to use virtualization
- Optimal batch sizes
- Cache invalidation strategies

### 3. **Faster Development**
- Less context switching
- Pre-made templates and patterns
- Domain-specific optimizations

### 4. **Consistent Patterns**
Each subagent enforces best practices:
- CRUD always uses contracts
- Jobs always have progress
- GitHub always handles rate limits

### 5. **Parallel Processing**
Multiple subagents can work simultaneously:
- CRUD agent designs UI
- Test agent writes tests
- Performance agent optimizes

## Subagent Communication Protocol

```typescript
interface SubagentRequest {
  type: 'crud-builder' | 'job-orchestrator' | 'github-syncer' | 'test-architect' | 'perf-optimizer';
  context: {
    feature: string;
    requirements: string[];
    constraints: string[];
    existingCode: string[];
  };
  deliverables: string[];
}

interface SubagentResponse {
  code: {
    contracts: string[];
    components: string[];
    services: string[];
    tests: string[];
  };
  decisions: {
    reasoning: string;
    alternatives: string[];
    tradeoffs: string[];
  };
  nextSteps: string[];
}
```

## Example Multi-Agent Workflow

```
You: "I need a vocabulary import feature with progress tracking"

Main Agent:
1. Identifies: Long-running + CRUD combination
2. Invokes job-orchestrator for import design
3. Invokes crud-builder for vocabulary UI
4. Invokes test-architect for test strategy
5. Coordinates and presents unified solution

Result: Complete feature with:
- Job queue for import
- Progress monitoring UI
- CRUD for managing imports
- Comprehensive test suite
```

## Implementation Priority

1. **Phase 1**: Create specialized prompts for existing Task tool
2. **Phase 2**: Build knowledge bases for each domain
3. **Phase 3**: Implement actual subagents with Task tool
4. **Phase 4**: Add coordination layer

This architecture would significantly improve:
- Speed of development
- Quality of generated code
- Consistency across features
- Testing coverage
- Performance optimization