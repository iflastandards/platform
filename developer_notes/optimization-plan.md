# IFLA Standards Platform - Nx & pnpm Optimization Plan

**Created:** 2025-08-27  
**Status:** In Progress  
**Target:** ≥40% improvement in build/test performance

## Baseline Metrics

### Performance Baselines (Pre-Optimization)
- [ ] Record `time pnpm test` (affected):
- [ ] Record `time pnpm test:all`:  
- [ ] Record `time pnpm build:all`:
- [ ] Record `time pnpm typecheck`:
- [ ] Record `time pnpm lint`:
- [ ] Record cache hit rate: `pnpm nx:cache:stats`
- [ ] Record dependency graph complexity: `pnpm nx graph --file=baseline-graph.json`

### Configuration Audit Results
- [ ] Total project.json files found:
- [ ] Scripts in package.json before cleanup:
- [ ] Current Nx version:
- [ ] Current pnpm version:
- [ ] Nx Cloud status:

---

## Phase 1: Preparation & Audit

### 1.1 Environment Setup
- [x] Create optimization plan document
- [ ] Backup current configurations to `tmp/optimization-backup/`
- [ ] Ensure clean git working directory
- [ ] Start Nx daemon: `pnpm nx:daemon:start`

### 1.2 Baseline Performance Measurement
- [ ] Run full baseline test suite
- [ ] Capture Nx cache statistics
- [ ] Document current parallel execution settings
- [ ] Record current script count and organization

### 1.3 Configuration Audit
- [ ] Analyze all project.json files for inconsistencies
- [ ] Identify duplicate/redundant package.json scripts
- [ ] Check for missing implicitDependencies
- [ ] Document current dependency graph complexity

---

## Phase 2: Core Configuration Optimization

### 2.1 Nx Configuration Consolidation
- [ ] Fix duplicate task runner configurations in `nx.json`
- [ ] Standardize parallel execution to 8-12 across all scripts
- [ ] Consolidate runtime cache inputs
- [ ] Remove redundant configuration sections

### 2.2 Project Configuration Standardization
- [ ] Add missing `implicitDependencies` on portal project
- [ ] Standardize target definitions across all project.json files
- [ ] Ensure consistent input/output patterns
- [ ] Add missing cache configurations

### 2.3 pnpm Performance Settings
- [ ] Increase network concurrency to 32
- [ ] Add missing hoist patterns for common packages
- [ ] Optimize store and virtual-store settings
- [ ] Enable store server if stable

---

## Phase 3: Script Optimization & Cleanup

### 3.1 Package.json Script Refactoring
- [ ] Group scripts by category (build, test, lint, etc.)
- [ ] Remove legacy/duplicate scripts
- [ ] Standardize naming conventions
- [ ] Use consistent parallelism settings

### 3.2 Nx Command Standardization
- [ ] Replace direct nx calls with pnpm nx for consistency
- [ ] Use affected commands where appropriate
- [ ] Optimize parallel execution parameters
- [ ] Remove workspace-specific overrides

### 3.3 Development Workflow Scripts
- [ ] Optimize dev server startup scripts
- [ ] Streamline testing workflows
- [ ] Improve build orchestration
- [ ] Add performance monitoring scripts

---

## Phase 4: Advanced Features

### 4.1 Nx Cloud Integration
- [ ] Connect to Nx Cloud for distributed caching
- [ ] Configure remote cache settings
- [ ] Add NX_CLOUD_ACCESS_TOKEN to CI
- [ ] Enable distributed execution for CI

### 4.2 Generator & Preset Configuration
- [ ] Add generator defaults for consistent project setup
- [ ] Create workspace presets for common patterns
- [ ] Configure default target templates
- [ ] Add scaffolding automation

### 4.3 CI/CD Pipeline Optimization
- [ ] Update GitHub Actions for pnpm caching
- [ ] Implement Nx affected in CI workflows
- [ ] Optimize dependency installation
- [ ] Add cache restore/save steps

---

## Phase 5: Validation & Documentation

### 5.1 Performance Validation
- [ ] Run optimized test suite and measure improvements
- [ ] Validate all pre-commit/pre-push hooks
- [ ] Test E2E workflows end-to-end
- [ ] Verify cache hit rates improved

### 5.2 Regression Testing
- [ ] Build all sites successfully
- [ ] Run comprehensive test suite
- [ ] Validate development server startup
- [ ] Test CI/CD pipeline

### 5.3 Documentation Updates
- [ ] Update WARP.md with new commands
- [ ] Create migration guide for removed scripts
- [ ] Update developer documentation
- [ ] Add performance guidelines

---

## Post-Optimization Metrics

### Performance Results (Post-Optimization)
- [x] Record `time pnpm typecheck`: **21.3s** (85.40s user, 439% CPU) - 21 projects + 5 deps
- [x] Record `time pnpm lint:affected`: **9.2s** (36.83s user, 524% CPU) - 23 projects
- [x] Record `time pnpm build:affected`: **72s** (157s user, 423% CPU) - 19/20 succeeded, 5 cached
- [ ] Record `time pnpm test` (affected):
- [ ] Record `time pnpm test:all`:  
- [ ] Record `time pnpm build:all`:
- [x] Record cache hit rate: **25% cache hits** (5/20 builds from cache)
- [ ] Calculate percentage improvements:

### Success Criteria
- [ ] ≥40% improvement in affected test execution
- [ ] ≥30% improvement in full build time  
- [ ] ≥50% improvement in cache hit rates
- [ ] No regression in functionality
- [ ] All quality gates still pass

---

## Rollback Plan

### Emergency Revert Steps
- [ ] Restore configurations from `tmp/optimization-backup/`
- [ ] Run `pnpm install` to reset workspace
- [ ] Clear all caches: `pnpm nx:cache:clear`
- [ ] Validate all tests pass with original configuration

### Rollback Files
```bash
cp tmp/optimization-backup/nx.json ./
cp tmp/optimization-backup/package.json ./
cp tmp/optimization-backup/.pnpmrc ./
cp tmp/optimization-backup/pnpm-workspace.yaml ./
# Restore any project.json files that were modified
```

---

## Notes & Observations

### What Worked Well
- [ ] Configuration changes that provided significant improvements
- [ ] Scripts that were successfully consolidated
- [ ] pnpm settings that improved performance

### What Didn't Work
- [ ] Settings that caused issues or regressions
- [ ] Scripts that couldn't be safely removed
- [ ] Configuration conflicts discovered

### Future Optimization Opportunities
- [ ] Additional improvements identified during implementation
- [ ] Features to explore in next optimization cycle
- [ ] Community best practices to consider

---

## Implementation Log

### Completed Tasks
- [x] **Phase 2.1**: Consolidated Nx task runner configuration in `nx.json`
- [x] **Phase 2.1**: Standardized parallel execution to 12 across scripts
- [x] **Phase 2.1**: Consolidated runtime cache inputs
- [x] **Phase 2.2**: Added missing `implicitDependencies` for portal project  
- [x] **Phase 2.3**: Optimized `.pnpmrc` with network concurrency 32
- [x] **Phase 2.3**: Added comprehensive public hoist patterns
- [x] **Phase 2.3**: Enabled additional pnpm performance optimizations
- [x] **Phase 4.1**: Updated Nx to latest version (21.4.1)
- [x] **Phase 4.1**: Enhanced Nx Cloud configuration
- [x] **Phase 4.2**: Added comprehensive generator defaults for new projects
- [x] **Phase 4.2**: Created custom workspace preset for project scaffolding
- [x] **Phase 4.3**: Optimized GitHub Actions parallel execution settings
- [x] **Phase 4.3**: Adjusted CI parallelism to 4 (GitHub Actions runner limitations)

### Issues Encountered
*Document any problems and solutions*

### Performance Gains Achieved
*Record actual improvements vs targets*

---

**Next Steps:** Begin with Phase 1 baseline measurements and proceed systematically through each phase.
