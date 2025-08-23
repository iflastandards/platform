# Admin Feature Factory - Refine.dev First Workflow

## 🎯 Core Philosophy

**Build UI First, Perfect with Mocks, Implement Backend Last**

This workflow leverages refine.dev's powerful scaffolding to create working CRUD interfaces in minutes, then iteratively refines them with MSW mocks before any backend implementation.

## 📐 5-Phase Workflow

### Phase 1: Lightweight Discovery (15-30 min)
**Agent**: `requirements-analyst`
**Focus**: What, not How

**Outputs**:
- User stories (As a... I want... So that...)
- Initial Zod schemas (basic structure)
- RBAC matrix (who can do what)
- Resource naming for refine.dev

**Key Questions**:
1. What is the resource name? (plural, kebab-case)
2. What fields does it have?
3. What actions are needed? (list, create, edit, show, delete)
4. Who can perform each action?
5. Any special validations or business rules?

### Phase 2: Instant Scaffolding (5 min)
**Agent**: `refine-generator`
**MCP**: `context7` (for refine.dev patterns)

**Actions**:
```bash
# Generate the exact command
npm run refine create-resource [resource-name] \
  --actions list,create,show,edit \
  --provider data-provider \
  --ui antd
```

**Outputs**:
- Working CRUD pages with Ant Design
- TypeScript interfaces
- Basic dataProvider integration
- List with pagination/filtering
- Create/Edit forms
- Show page

### Phase 3: Iterative Refinement (2-3 hours)
**Agents**: `ui-refiner`, `contract-refiner`, `mock-engineer`
**Mode**: Sequential iterations, not parallel

**Iteration Loop** (3-5 cycles):
1. Review current UI with MSW data
2. Gather feedback
3. Refine UI components (preserve refine structure)
4. Update Zod contracts if needed
5. Enhance MSW handlers
6. Test edge cases
7. Get approval or iterate

**No Backend Yet!** Everything runs on mocks.

### Phase 4: Backend Implementation (2 hours)
**Agent**: `backend-engineer`
**When**: After UI/contracts are stable

**Actions**:
1. Create Supabase schema
2. Implement service adapters
3. Build Edge Functions
4. Connect live endpoints
5. Migrate from MSW to live data

### Phase 5: Testing & QA (1 hour)
**Agents**: `test-engineer`, `qa-auditor`
**Focus**: Test against stable contracts

**Coverage**:
- Integration tests (Vitest + RTL)
- E2E tests (Playwright)
- Accessibility audit
- RBAC verification
- Performance checks

### Phase 6: Documentation & Knowledge Transfer (1 hour)
**Agent**: `docs-generator`
**MCP**: `context7`, `morphllm`
**Focus**: Complete documentation before shipping

**Deliverables**:
- API documentation (auto-generated from Zod schemas)
- User guides with screenshots
- Developer README files
- In-app help content (tooltips, tours)
- Video tutorials (optional)

**Integration Points**:
- Help buttons in UI components
- Contextual help panels
- Command palette search
- Docusaurus integration

## 🤖 Agent Configurations

### Requirements Analyst
```yaml
role: "Product Discovery"
flags: ["--brainstorm", "--think"]
mcp: ["sequential"]
tasks:
  - Gather requirements
  - Define initial schemas
  - Create RBAC matrix
```

### Refine Generator
```yaml
role: "Scaffolding Expert"
mcp: ["context7"]
tasks:
  - Generate refine CLI commands
  - Execute scaffolding
  - Verify generated structure
```

### UI Refiner
```yaml
role: "Interface Polish"
mcp: ["magic", "context7"]
flags: ["--iterate"]
tasks:
  - Customize Ant Design components
  - Enhance forms and tables
  - Improve UX flows
constraints:
  - Preserve refine.dev structure
  - Keep MSW as data source
```

### Contract Refiner
```yaml
role: "Schema Evolution"
mcp: ["serena"]
tasks:
  - Evolve Zod schemas
  - Maintain type safety
  - Update fixtures
memory: "contract_versions"
```

### Mock Engineer
```yaml
role: "MSW Specialist"
mcp: ["morphllm"]
tasks:
  - Create realistic scenarios
  - Simulate all states
  - Add edge cases
  - Mock async operations
```

## 💾 Memory Schema

```typescript
interface FeatureFactoryMemory {
  // Current feature state
  admin_feature_current: {
    id: string;
    name: string;
    resource: string;
    phase: 1 | 2 | 3 | 4 | 5;
    iteration?: number;
    status: 'discovery' | 'scaffolded' | 'refining' | 'backend' | 'testing' | 'complete';
  };

  // Requirements from Phase 1
  admin_feature_requirements: {
    userStories: string[];
    rbacMatrix: Record<string, string[]>;
    initialSchema: object;
    resourceConfig: {
      name: string;
      actions: string[];
    };
  };

  // Iteration history from Phase 3
  admin_feature_iterations: {
    current: number;
    iterations: Array<{
      number: number;
      changes: {
        ui: string[];
        contracts: string[];
        mocks: string[];
      };
      timestamp: string;
      approved: boolean;
    }>;
  };

  // Stable checkpoints
  admin_feature_checkpoints: {
    ui_stable: boolean;
    contracts_stable: boolean;
    mocks_complete: boolean;
    backend_ready: boolean;
  };
}
```

## 🚀 Commands

### Primary Workflow
```bash
# Start new feature
/sc:admin feature "user-imports"

# Generate scaffolding
/sc:admin scaffold

# Start refinement iterations
/sc:admin refine --iterate

# Implement backend (when ready)
/sc:admin backend

# Run tests
/sc:admin test
```

### Iteration Management
```bash
# Review current state
/sc:admin status

# Save checkpoint
/sc:admin checkpoint

# Rollback iteration
/sc:admin rollback --iteration 2

# Compare iterations
/sc:admin diff --iterations 2:3

# Approve and lock
/sc:admin approve ui
/sc:admin approve contracts
```

### Utilities
```bash
# Preview with MSW
/sc:admin preview

# Resume workflow
/sc:admin resume

# Generate test plan
/sc:admin test-plan

# Export feature spec
/sc:admin export-spec
```

## 📋 Checklist Template

### Phase 1: Discovery ✓
- [ ] User stories defined
- [ ] RBAC matrix created
- [ ] Initial Zod schema drafted
- [ ] Resource name confirmed

### Phase 2: Scaffolding ✓
- [ ] Refine CLI command generated
- [ ] CRUD pages created
- [ ] TypeScript interfaces generated
- [ ] MSW handlers connected

### Phase 3: Refinement (Iterations)
#### Iteration 1
- [ ] UI adjustments
- [ ] Contract updates
- [ ] Mock enhancements
- [ ] User feedback

#### Iteration 2+
- [ ] Further refinements
- [ ] Edge case handling
- [ ] Performance optimizations
- [ ] Final approval

### Phase 4: Backend ✓
- [ ] Supabase schema created
- [ ] Service adapters implemented
- [ ] Edge Functions deployed
- [ ] Live data connected

### Phase 5: Testing ✓
- [ ] Integration tests written
- [ ] E2E tests created
- [ ] Accessibility verified
- [ ] RBAC tested
- [ ] Performance validated

### Phase 6: Documentation ✓
- [ ] API docs generated from schemas
- [ ] User guide written with screenshots
- [ ] Developer README created
- [ ] In-app help tooltips added
- [ ] Contextual help panels configured
- [ ] Guided tour implemented
- [ ] Search-indexed help content
- [ ] Accessibility documentation

## 🎨 Example: CSV Import Feature

### Day 1 Timeline
```
09:00 - Discovery session
        Output: UserImportSchema, RBAC (admin: all, editor: read/create)

09:30 - Scaffolding
        Command: npm run refine create-resource user-imports --actions list,create,show --provider data-provider --ui antd
        Output: Full CRUD at localhost:3007/user-imports

10:00 - Iteration 1
        - Add file upload to create form
        - Update schema with file fields
        - Mock upload progress

11:00 - Iteration 2
        - Add validation display
        - Enhance error messages
        - Mock validation scenarios

14:00 - Iteration 3
        - Add bulk operations
        - Improve table filters
        - Mock complex states

16:00 - Checkpoint
        - UI approved ✓
        - Contracts stable ✓
        - Mocks complete ✓
```

### Day 2 Timeline
```
09:00 - Backend implementation
        - Supabase tables
        - Upload handling
        - Job processing

11:00 - Testing
        - Integration tests
        - E2E workflows
        - Accessibility

14:00 - Ship to staging
```

## 🔑 Success Criteria

1. **Speed**: Working UI within 30 minutes
2. **Quality**: Polished interface before backend
3. **Stability**: Contracts locked before implementation
4. **Coverage**: Comprehensive mocks drive requirements
5. **Confidence**: Backend built against proven patterns

## 🚨 Important Notes

- **Never skip to backend** - UI and mocks must be stable first
- **Preserve refine structure** - Don't break the scaffolding
- **MSW is the spec** - Mocks define the contract
- **Iterate freely** - Changes are cheap before backend
- **User feedback early** - Show working UI immediately

This workflow ensures rapid development with minimal rework, leveraging refine.dev's power while maintaining quality and type safety throughout.