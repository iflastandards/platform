# Admin Feature Factory Workflow

## 🚀 Quick Start

Start developing a new admin feature with our refine.dev-first workflow:

```bash
# Start new feature (interactive)
pnpm admin:feature "user imports"

# Or resume existing feature
pnpm admin:resume
```

## 📋 Workflow Overview

### Phase 1: Discovery (15-30 min)
```bash
pnpm admin:feature "feature-name"
```
- Define user stories
- Create RBAC matrix  
- Draft initial Zod schemas
- Choose resource name

### Phase 2: Instant Scaffolding (5 min)
```bash
pnpm admin:scaffold
```
- Generates refine.dev CRUD pages
- Creates Ant Design UI
- Sets up TypeScript interfaces
- Connects MSW handlers

**Result**: Working UI at `http://localhost:3007/[resource-name]`

### Phase 3: Iterative Refinement (2-3 hours)
```bash
pnpm admin:refine
```
- Polish UI components
- Evolve Zod contracts
- Perfect MSW mocks
- **NO BACKEND YET!**

Iterate 3-5 times until UI is perfect with mock data.

### Phase 4: Backend Implementation (2 hours)
```bash
pnpm admin:backend
```
**Only after UI/contracts are stable:**
- Create Supabase schema
- Build service adapters
- Implement Edge Functions
- Connect live endpoints

### Phase 5: Testing (1 hour)
```bash
pnpm admin:test
```
- Run integration tests
- Execute E2E tests
- Validate accessibility
- Verify RBAC

### Phase 6: Documentation (1 hour) - NEW!
```bash
pnpm admin:docs
```
- Generate API docs from Zod schemas
- Create user guide with screenshots
- Write developer README
- Build in-app help components
- Add guided tours

**Result**: Complete documentation at `apps/admin/docs/features/[resource-name]/`

## 🔧 Utility Commands

```bash
# Check current status
pnpm admin:status

# Save stable checkpoint
pnpm admin:checkpoint

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

### Day 1: UI Development
```bash
# Morning
pnpm admin:feature "csv import"      # 30 min discovery
pnpm admin:scaffold                  # 5 min scaffolding

# Afternoon  
pnpm admin:refine                    # Iteration 1: Add upload
pnpm admin:refine                    # Iteration 2: Add validation
pnpm admin:refine                    # Iteration 3: Polish UX
pnpm admin:checkpoint                # Save stable state
```

### Day 2: Backend & Testing
```bash
# Morning
pnpm admin:backend                   # Implement services

# Afternoon
pnpm admin:test                      # Run all tests
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