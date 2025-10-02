# Nx Cloud & Agents Optimization Plan

## Current Issues

1. **Module Resolution Problems**: Tests fail on distributed agents
2. **Distributed Execution Disabled**: All CI runs use `NX_CLOUD_DISTRIBUTED_EXECUTION=false`
3. **No Agent Configuration**: Active workflows don't configure Nx agents

## Root Cause Analysis

The module resolution issues likely stem from:
- Monorepo structure with complex dependencies
- Missing environment variables on agents
- Incorrect working directory setup on agents

## Implementation Plan

### Phase 1: Fix Module Resolution (Immediate)

```yaml
# Fix in .github/workflows/pr-validation.yml
env:
  # Add these to ensure proper module resolution
  NODE_PATH: ${{ github.workspace }}/node_modules
  NX_WORKSPACE_ROOT: ${{ github.workspace }}

# Update the start-ci-run command:
- name: Start Nx Cloud Agents
  run: |
    npx nx-cloud start-ci-run \
      --distribute-on="4 linux-medium-js" \
      --stop-agents-after="build" \
      --with-env-vars="NODE_OPTIONS,NODE_PATH,NX_WORKSPACE_ROOT,CI"
```

### Phase 2: Enable Distributed Execution (Next PR)

```yaml
# Remove all NX_CLOUD_DISTRIBUTED_EXECUTION=false prefixes
# Replace with:
- name: Run affected tests
  run: |
    npx nx affected --target=test \
      --base=${{ steps.nx-set-shas.outputs.base }} \
      --parallel=4 \
      --ci
```

### Phase 3: Optimize Agent Configuration

```yaml
# Implement assignment rules for different task types
- name: Configure Nx Cloud Agents
  run: |
    cat > .nx-cloud-agents.yml <<EOF
    agents:
      - name: small
        count: 2
        type: linux-small-js
        tasks: [lint, typecheck, format]
      - name: medium
        count: 3
        type: linux-medium-js
        tasks: [test, build]
      - name: large
        count: 1
        type: linux-large-js
        tasks: [e2e]
    EOF
```

### Phase 4: Enable Advanced Features

1. **Flaky Test Retries**:
```yaml
env:
  NX_CLOUD_FLAKY_TASKS_ENABLED: true
  NX_CLOUD_FLAKY_TASKS_MAX_RETRIES: 2
```

2. **Dynamic Agent Allocation**:
```yaml
- name: Start dynamic agents
  run: |
    npx nx-cloud start-ci-run \
      --distribute-on="auto" \
      --stop-agents-after="e2e"
```

## Expected Improvements

| Metric | Current | With Agents | Improvement |
|--------|---------|-------------|-------------|
| CI Time | 10-15 min | 3-5 min | 70% faster |
| Resource Usage | 1 large runner | 6 small agents | Better utilization |
| Cost | ~$0.064/min | ~$0.048/min | 25% cheaper |
| Flaky Test Impact | Full re-runs | Auto-retry | 90% less disruption |

## Testing Strategy

1. Enable on single workflow first (pr-validation.yml)
2. Monitor for 1 week
3. Gradually roll out to other workflows
4. Enable full features after stability confirmed

## Monitoring

Track these metrics in Nx Cloud dashboard:
- Average CI time
- Agent utilization rate
- Cache hit rate
- Flaky test frequency
- Cost per CI run

## Rollback Plan

If issues occur:
1. Set `NX_CLOUD_DISTRIBUTED_EXECUTION=false` temporarily
2. Investigate logs in Nx Cloud dashboard
3. Fix root cause
4. Re-enable gradually

## References

- [Nx Agents Setup](https://nx.dev/ci/features/distribute-task-execution)
- [Assignment Rules](https://nx.dev/ci/features/distribute-task-execution#assignment-rules)
- [Self-Healing CI](https://nx.dev/ci/features/self-healing-ci)