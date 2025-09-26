# Nx Distributed Execution Rollout Plan

**Status**: Phase 2 Testing in Progress
**Date**: 2025-09-26
**Requirement**: Minimum 3 agents for all distributed execution

---

## Current State Analysis

### Workflows Using Nx Commands

| Workflow | Status | Distributed Execution | Agent Count | Priority |
|----------|--------|----------------------|-------------|----------|
| `pr-validation.yml` | 🧪 Testing | Phase 2 test (lint only) | 3 agents | **CRITICAL** |
| `nx-optimized-docs-deploy.yml` | ❌ Disabled | Comment: "stability issues" | N/A | **HIGH** |
| `simple-deploy.yml` | ❓ Unknown | Not checked yet | N/A | **MEDIUM** |
| `ci-health-check.yml` | ❓ Unknown | Not checked yet | N/A | **LOW** |
| `check-warnings.yml` | ❓ Unknown | Not checked yet | N/A | **LOW** |
| `backup-*/nx-optimized-*.yml` | 📦 Archived | Had `true` with 6-8 agents | N/A | **REFERENCE** |

---

## Phase 2 Current Implementation

### PR Validation (Testing)
**File**: `.github/workflows/pr-validation.yml`

**Current State**:
- Format check: `NX_CLOUD_DISTRIBUTED_EXECUTION=false`
- Lint: **Testing with 3 agents** (Phase 2)
- Typecheck: `NX_CLOUD_DISTRIBUTED_EXECUTION=false`
- Test: `NX_CLOUD_DISTRIBUTED_EXECUTION=false`
- Build: `NX_CLOUD_DISTRIBUTED_EXECUTION=false`

**Phase 2 Test Configuration**:
```yaml
- name: Test Distributed Execution (Phase 2 - Lint Only)
  run: |
    npx nx-cloud start-ci-run \
      --distribute-on="3 linux-medium-js" \
      --stop-agents-after="lint" \
      --with-env-vars="NODE_OPTIONS,NODE_PATH,NX_WORKSPACE_ROOT,CI,DOCS_ENV,HUSKY"

    npx nx affected --target=lint \
      --base=${{ steps.nx-set-shas.outputs.base }} \
      --exclude=admin \
      --parallel=3 \
      --ci
```

---

## Rollout Phases

### ✅ Phase 1: Quick Wins (Completed)
- Added flaky task management
- Fixed AI error explanation
- Updated from 2.5/9 to 4.5/9 feature usage

### 🧪 Phase 2: Distributed Execution Test (In Progress)
**Goal**: Validate module resolution fix with minimal scope

**Configuration**:
- **Agents**: 3 (Nx Cloud minimum)
- **Target**: lint only (fastest, safest)
- **Environment variables**: NODE_PATH, NX_WORKSPACE_ROOT, DOCS_ENV
- **Success Criteria**: Lint completes without module resolution errors

**If Successful → Proceed to Phase 3**
**If Failed → Adjust environment variables and retry**

### 📋 Phase 3: Full PR Validation Rollout
**Prerequisites**: Phase 2 lint test passes

**Targets to Enable** (in order):
1. **Lint** - Already tested in Phase 2
2. **Typecheck** - Similar to lint, should be safe
3. **Test** - More complex, higher risk
4. **Build** - Most complex, highest risk

**Recommended Agent Counts**:
- Small PRs (1-5 affected projects): 3 agents
- Medium PRs (6-15 affected): 4 agents
- Large PRs (16+ affected): 6 agents

**Implementation Strategy**:
```yaml
# Calculate affected project count
AFFECTED_COUNT=$(npx nx show projects --affected | wc -l)

# Dynamic agent selection
if [ $AFFECTED_COUNT -lt 6 ]; then
  AGENTS=3
elif [ $AFFECTED_COUNT -lt 16 ]; then
  AGENTS=4
else
  AGENTS=6
fi

# Start distributed execution
npx nx-cloud start-ci-run \
  --distribute-on="$AGENTS linux-medium-js" \
  --stop-agents-after="build" \
  --with-env-vars="NODE_OPTIONS,NODE_PATH,NX_WORKSPACE_ROOT,CI,DOCS_ENV,HUSKY"

# Run all targets with distributed execution
npx nx affected --targets=lint,typecheck,test,build \
  --base=${{ steps.nx-set-shas.outputs.base }} \
  --exclude=admin \
  --parallel=$AGENTS \
  --ci
```

### 📋 Phase 4: Deployment Workflows
**Prerequisites**: Phase 3 complete and stable for 1 week

**Workflows to Update**:

#### 4A: `nx-optimized-docs-deploy.yml`
**Current**: Explicitly disabled with comment "distributed disabled for stability"

**Recommended Configuration**:
- **Agents**: 4-6 (documentation builds are CPU-intensive)
- **Targets**: build only (no tests in deployment)
- **Environment**: production/preview aware

**Implementation**:
```yaml
env:
  NODE_PATH: ${{ github.workspace }}/node_modules
  NX_WORKSPACE_ROOT: ${{ github.workspace }}
  DOCS_ENV: ${{ github.ref_name == 'main' && 'production' || 'preview' }}

jobs:
  build-and-deploy:
    steps:
      - name: Build with Distributed Execution
        run: |
          # Preview branch: 4 agents, Production: 6 agents
          AGENTS=${{ github.ref_name == 'main' && '6' || '4' }}

          npx nx-cloud start-ci-run \
            --distribute-on="$AGENTS linux-medium-js" \
            --stop-agents-after="build" \
            --with-env-vars="NODE_OPTIONS,NODE_PATH,NX_WORKSPACE_ROOT,DOCS_ENV,CI,HUSKY"

          npx nx run-many \
            --target=build \
            --projects="$PROJECTS_TO_BUILD" \
            --parallel=$AGENTS \
            --ci
```

#### 4B: Other Workflows
- `simple-deploy.yml` - Check if uses Nx, enable if needed
- `ci-health-check.yml` - Likely doesn't need distributed execution
- `check-warnings.yml` - Likely doesn't need distributed execution

---

## Agent Count Guidelines

### Minimum Requirements (Nx Cloud Platform)
- **Absolute minimum**: 3 agents (enforced by Nx Cloud)
- **Recommended minimum**: 4 agents (better task distribution)
- **Optimal for docs**: 4-6 agents (CPU-intensive Docusaurus builds)
- **Maximum practical**: 8 agents (diminishing returns beyond this)

### Cost-Benefit Analysis

| Agent Count | Use Case | Expected Speedup | Cost Impact |
|-------------|----------|------------------|-------------|
| 1-2 | ❌ Not allowed | N/A | N/A |
| 3 | Small PRs, testing | 40-50% | Baseline |
| 4 | Medium PRs, preview deploys | 60-70% | +33% |
| 6 | Large PRs, production deploys | 75-80% | +100% |
| 8+ | ⚠️ Rarely beneficial | <85% | +167%+ |

### Task Distribution Reality
- **3 agents**: Can handle 3-9 parallel tasks efficiently
- **4 agents**: Can handle 4-12 parallel tasks efficiently
- **6 agents**: Can handle 6-18 parallel tasks efficiently

### Our Project Scale
- Typical PR affects: 3-8 projects
- Full rebuild: 21 projects + 5 dependencies
- **Recommendation**: 3-4 agents for PRs, 4-6 for deploys

---

## Environment Variables Required

### Critical for Module Resolution
```yaml
env:
  NODE_PATH: ${{ github.workspace }}/node_modules
  NX_WORKSPACE_ROOT: ${{ github.workspace }}
  DOCS_ENV: preview  # or production
```

### Must be Passed to Agents
```yaml
--with-env-vars="NODE_OPTIONS,NODE_PATH,NX_WORKSPACE_ROOT,CI,DOCS_ENV,HUSKY"
```

### Why These Are Critical
- **NODE_PATH**: Agents need to resolve node_modules correctly
- **NX_WORKSPACE_ROOT**: Agents need workspace context for path resolution
- **DOCS_ENV**: Docusaurus sites use this for environment-specific builds
- **NODE_OPTIONS**: Memory limits prevent OOM errors
- **CI/HUSKY**: Prevent hooks and interactive prompts

---

## Risk Assessment

### Phase 2 (Current) - **LOW RISK**
- Only affects lint step
- Easy rollback (single line change)
- PR-only, not production
- Minimal scope for testing

### Phase 3 (PR Validation) - **MEDIUM RISK**
- Affects all PR validation steps
- Could block PRs if misconfigured
- Mitigation: Gradual rollout (lint → typecheck → test → build)
- Rollback: Re-add `NX_CLOUD_DISTRIBUTED_EXECUTION=false`

### Phase 4 (Deployment) - **HIGH RISK**
- Affects production deployments
- Could block releases if misconfigured
- Mitigation: Test thoroughly in preview first
- Rollback plan: Keep old workflow as backup

---

## Monitoring Strategy

### Phase 2 Metrics (Lint Test)
- ✅ No module resolution errors
- ✅ Agent startup success
- ✅ Environment variables passed correctly
- ⏱️ Execution time vs local parallel
- 📊 Task distribution across agents

### Phase 3 Metrics (Full PR)
- 📈 PR validation time reduction
- 💰 Cost increase vs speedup benefit
- 🔄 Cache hit rate improvement
- ⚠️ Failure rate vs baseline

### Phase 4 Metrics (Deployment)
- 🚀 Deployment time reduction
- 💸 Cost per deployment
- 🎯 Success rate consistency
- 📊 Agent utilization percentage

---

## Rollback Procedures

### Immediate Rollback (Phase 2/3)
```yaml
# In pr-validation.yml, change:
npx nx-cloud start-ci-run --distribute-on="3 linux-medium-js" ...
npx nx affected --target=lint --parallel=3 --ci

# Back to:
NX_CLOUD_DISTRIBUTED_EXECUTION=false npx nx affected --target=lint --parallel=6
```

### Full Rollback (Phase 4)
```yaml
# In nx-optimized-docs-deploy.yml, ensure:
npx nx run-many --target=build --projects="$PROJECTS" --parallel=4
# (No start-ci-run command)
```

### Validation After Rollback
1. Verify CI passes without distributed execution
2. Check Nx Cloud dashboard for confirmation
3. Document what failed for investigation

---

## Success Criteria

### Phase 2 Success = Proceed to Phase 3
- ✅ Lint completes without errors
- ✅ No module resolution failures
- ✅ Agent logs show proper environment
- ✅ Execution time ≤ local parallel

### Phase 3 Success = Proceed to Phase 4
- ✅ All targets (lint/typecheck/test/build) pass
- ✅ PR validation time reduced by ≥60%
- ✅ No increase in failure rate
- ✅ Stable for 1 week (≥20 PRs)

### Phase 4 Success = Full Rollout Complete
- ✅ Deployment time reduced by ≥60%
- ✅ Cost increase ≤50% vs time savings
- ✅ No deployment failures due to distributed execution
- ✅ Stable for 2 weeks (≥10 deployments)

---

## Next Actions

### Immediate (Phase 2)
- [x] Update agent count to 3 minimum
- [x] Push to PR #186
- [ ] Monitor CI run for module resolution
- [ ] Check Nx Cloud dashboard for agent behavior

### If Phase 2 Succeeds
- [ ] Update `nx-features-analysis.md` (6/9 features)
- [ ] Plan Phase 3 gradual rollout
- [ ] Create Phase 3 implementation branch

### If Phase 2 Fails
- [ ] Capture error logs from Nx Cloud
- [ ] Identify missing environment variables
- [ ] Adjust `--with-env-vars` configuration
- [ ] Retry with updated config

---

## References

- Phase 2 Implementation: `nx-phase2-implementation.md`
- Feature Analysis: `nx-features-analysis.md`
- Original Plan: `nx-cloud-optimization-plan.md`
- PR: #186 (`feat/nx-distributed-execution-phase2`)
- Nx Cloud Docs: https://nx.dev/ci/features/distribute-task-execution