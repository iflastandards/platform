# Admin Feature Factory Workflow

## 🚀 Quick Start

Start developing a new admin feature with our refine.dev-first workflow:

```bash
# Start new feature (interactive)
pnpm admin:feature "user imports"

# Or resume existing feature
pnpm admin:resume
```

## 📋 7-Phase Workflow Overview

### Phase 1: Feature Identification & Requirements (15-30 min)
```bash
pnpm admin:feature "feature-name"
```
- Define user stories and use cases
- Create RBAC matrix and permissions
- Draft initial Zod schemas
- Choose resource name (plural, kebab-case)
- Define keywords for code discovery

### Phase 2: Code Discovery & Analysis (10-15 min)
```bash
pnpm admin:discover
```
- Search codebase for existing scripts to refactor
- Analyze refactoring potential (high/medium/low)
- Identify dependencies and integration opportunities
- Plan code reuse vs new implementation

**Result**: Discovered scripts ready for integration into UI

### Phase 3: Instant Scaffolding (5 min)
```bash
pnpm admin:scaffold
```
- Generates refine.dev CRUD pages
- Creates Ant Design UI components
- Sets up TypeScript interfaces
- Connects MSW handlers
- Plans integration of discovered scripts

**Result**: Working UI at `http://localhost:3007/[resource-name]`

### Phase 4: Iterative Refinement (2-3 hours)
```bash
pnpm admin:refine
```
- Polish UI components and interactions
- Evolve Zod contracts and validation
- Perfect MSW mocks with realistic data
- Integrate existing script functionality
- **NO BACKEND YET!**

Iterate 3-5 times until UI is perfect with mock data.

### Phase 5: Backend Implementation (2 hours)
```bash
pnpm admin:backend
```
**Only after UI/contracts are stable:**
- Refactor existing scripts into service modules
- Create API adapters wrapping script functionality
- Create/update Supabase schema
- Implement Edge Functions calling refactored code
- Connect live endpoints to refactored services

### Phase 6: Testing (1 hour)
```bash
pnpm admin:test
```
- Run integration tests with real refactored code
- Execute E2E tests with full workflows
- Validate accessibility compliance
- Verify RBAC with real permissions

### Phase 7: Documentation (1 hour)
```bash
pnpm admin:docs
```
- Generate API docs from Zod schemas
- Create user guide with screenshots
- Write developer README including refactored code
- Build in-app help components
- Add guided tours for new workflows

**Result**: Complete feature with documentation at `apps/admin/docs/features/[resource-name]/`

## 🔧 Utility Commands

```bash
# Check current status
pnpm admin:status

# Save stable checkpoint
pnpm admin:checkpoint

# Skip to next phase or specific phase (1-7)
pnpm admin:skip [phase]

# Resume from last state
pnpm admin:resume
```

## 💡 Key Principles

1. **UI First**: Build and perfect the interface before any backend
2. **Mock-Driven**: MSW mocks become the contract specification
3. **Iterate Freely**: Changes are cheap before backend implementation
4. **Type-Safe**: Zod schemas ensure end-to-end type safety
5. **RBAC Built-in**: Role-based access from the start

## 📁 File Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   └── (authenticated)/
│   │       └── [resource-name]/     # Generated pages
│   ├── providers/
│   │   └── adapters/
│   │       └── [resource].adapter.ts # Service adapter
│   └── mocks/
│       └── handlers/
│           └── [resource].handlers.ts # MSW mocks
└── packages/contracts/
    └── schemas/
        └── [Resource].zod.ts         # Zod schemas
```

## 🎯 Example: CSV Import Feature

### Day 1: Discovery & UI Development
```bash
# Morning
pnpm admin:feature "csv import"      # Phase 1: Requirements (30 min)
pnpm admin:discover                  # Phase 2: Find existing CSV scripts (15 min)
pnpm admin:scaffold                  # Phase 3: Generate UI (5 min)

# Afternoon  
pnpm admin:refine                    # Phase 4 Iteration 1: Add upload widget
pnpm admin:refine                    # Phase 4 Iteration 2: Add validation UI
pnpm admin:refine                    # Phase 4 Iteration 3: Integrate existing scripts
pnpm admin:checkpoint                # Save stable state
```

### Day 2: Backend, Testing & Documentation
```bash
# Morning
pnpm admin:backend                   # Phase 5: Refactor scripts into services

# Afternoon
pnpm admin:test                      # Phase 6: Run all tests
pnpm admin:docs                      # Phase 7: Generate documentation
```

## 🤝 Integration with SuperClaude

The workflow integrates with SuperClaude's agent orchestration:

- **Discovery**: `requirements-analyst` agent with brainstorming
- **Scaffolding**: `refine-generator` agent with Context7 MCP
- **Refinement**: `ui-refiner`, `contract-refiner`, `mock-engineer` agents
- **Backend**: `backend-engineer` agent with parallel execution
- **Testing**: `test-engineer` and `qa-auditor` agents

Use `/sc:admin feature` in Claude Code to trigger the full orchestrated workflow.

## 📚 Related Documentation

- [System Architecture Prime Directive](./prompts/system-architecture-prime-directive.md)
- [Feature Factory Prompt](./prompts/admin-feature-factory-refine.md)
- [Backend Integration Guide](./prompts/backend-integration-plan-generation.md)
- [Test Development Spec](./prompts/test-development-specification.md)
- [QA Verification Plan](./prompts/qa-release-verification-plan.md)