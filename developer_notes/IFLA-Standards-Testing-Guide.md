# IFLA Standards Platform - Comprehensive Testing Guide

## 📋 Overview

This document serves as the authoritative guide for testing practices within the IFLA Standards Platform. It establishes mandatory requirements, best practices, and enforcement mechanisms for maintaining high-quality, reliable tests across the entire codebase.

**📌 IMPORTANT** - This guide is designed for **solo development** with no team coordination or peer review processes. All validation is automated through pre-commit hooks and self-review practices.

### Solo Development Context
- **No peer review required** - All quality assurance is handled through automated validation
- **No team coordination** - Individual accountability for test quality and maintenance  
- **Streamlined workflow** - Focus on personal productivity and automated feedback
- **Self-documentation** - Clear patterns for future reference and AI assistant guidance

## 🏷️ Mandatory Test Tagging System

### Required Tags for All Tests

Every test file **MUST** include appropriate tags. The pre-commit hook will warn about missing or unknown tags.

#### Primary Test Type Tags (REQUIRED - Choose One)
- `@unit` - Pure unit tests with no external dependencies
- `@integration` - Tests that verify interactions between components
- `@e2e` - End-to-end tests using browsers or full system
- `@smoke` - Quick validation tests for critical functionality
- `@env` - Environment-specific configuration tests

#### Priority Tags (REQUIRED - Choose One)
- `@critical` - Must pass for deployment (3+ retries, extended timeout)
- `@high-priority` - Important functionality tests (2 retries)
- `@low-priority` - Nice-to-have tests (standard retry)

#### Feature Area Tags (REQUIRED - Choose At Least One)
- `@auth` - Authentication and user management
- `@rbac` - Role-based access control
- `@api` - API endpoint testing
- `@ui` - User interface components
- `@dashboard` - Admin dashboard functionality
- `@admin` - Administrative features
- `@docs` - Documentation sites (portal, standards)
- `@navigation` - Site navigation and linking
- `@search` - Search functionality
- `@vocabulary` - RDF vocabulary management
- `@sites` - Multi-site validation
- `@validation` - Data validation logic
- `@accessibility` - WCAG compliance tests

#### Optional Environment Tags
- `@local-only` - Only runs in local development
- `@ci-only` - Only runs in CI/CD pipeline
- `@preview-only` - Only runs in preview environment
- `@production-only` - Only runs in production environment

#### Optional Performance Tags  
- `@slow` - Extended timeout (3x default)
- `@fast` - Reduced timeout (0.5x default)
- `@flaky` - Known flaky tests (3+ retries)
- `@performance` - Performance benchmarking tests
- `@visual` - Visual regression tests

#### Optional Browser Tags
- `@chromium-only` - Chrome/Chromium only
- `@firefox-only` - Firefox only
- `@webkit-only` - Safari/WebKit only
- `@mobile-only` - Mobile device testing

### Tag Usage Examples

```typescript
// ✅ CORRECT - Well-tagged unit test
describe('IFLAElementValidator @unit @critical @validation', () => {
  it('should validate required fields @auth', async () => {
    // Test implementation
  });
});

// ✅ CORRECT - Tagged E2E test
e2eTest('should navigate between standards sites @critical @navigation @docs', 
  async ({ page }) => {
    // Test implementation
  });

// ✅ CORRECT - Integration test with multiple tags
integrationTest('should authenticate with GitHub OAuth @auth @api @integration @high-priority', 
  async ({ page }) => {
    // Test implementation  
  });

// ❌ INCORRECT - Missing required tags
describe('Some functionality', () => {
  it('should work', () => {
    // Missing @unit/@integration/@e2e tag
    // Missing @critical/@high-priority/@low-priority tag
    // Missing feature area tag
  });
});
```

## 📁 File Organization and Naming Conventions

### Directory Structure
```
project-root/
├── apps/admin/src/test/
│   ├── unit/                    # Pure unit tests
│   ├── integration/             # Integration tests  
│   └── e2e/                     # End-to-end tests
├── e2e/
│   ├── smoke/                   # Critical smoke tests
│   ├── integration/             # Cross-service integration
│   ├── e2e/                     # Full end-to-end flows
│   └── visual/                  # Visual regression tests
├── packages/theme/src/tests/
│   ├── unit/                    # Theme unit tests
│   ├── integration/             # Theme integration tests
│   └── scripts/                 # Script testing
└── examples/tests/              # Template examples
```

### Naming Patterns (ENFORCED)

The pre-commit hook validates these patterns:

#### Unit Tests
- `*.test.ts` - General unit tests
- `*.unit.test.ts` - Explicitly marked unit tests  
- `__tests__/*.test.ts` - Jest-style test directories

#### Integration Tests  
- `*.integration.test.ts` - Integration tests
- `*.integration.spec.ts` - Integration specs

#### E2E Tests
- `*.e2e.spec.ts` - End-to-end tests
- `*.spec.ts` (in e2e/ directories) - Playwright specs

#### Special Categories
- `*.smoke.spec.ts` - Smoke tests
- `*.env.spec.ts` - Environment tests
- `*.visual.spec.ts` - Visual regression tests
- `*.performance.spec.ts` - Performance tests

## 🚀 Test Execution Strategy

### 5-Level Testing Strategy

#### Level 1: Selective Tests (Development)
```bash
pnpm test                    # Fast feedback during development
nx affected --target=test    # Test only changed projects
```
**Target**: <30 seconds, pre-commit validation

#### Level 2: Comprehensive Tests (Release)  
```bash
pnpm test:comprehensive      # Full validation before releases
```
**Target**: <5 minutes, covers all functionality

#### Level 3: Pre-Commit Tests (Git Hooks)
```bash
pnpm test:pre-commit        # Automated before each commit
```
**Target**: <60 seconds, prevents broken commits

#### Level 4: Pre-Push Tests (Git Hooks)
```bash  
pnpm test:pre-push:flexible # Before pushing to remote
```
**Target**: <180 seconds, production readiness

#### Level 5: CI Tests (Pipeline)
```bash
pnpm test:ci:full           # Complete validation in CI/CD
```
**Target**: <15 minutes, deployment readiness

### Environment-Specific Testing

#### Local Development
```bash
DOCS_ENV=local pnpm test:e2e        # Test with localhost URLs
pnpm test:admin                      # Admin portal tests  
pnpm test:scripts                    # Script validation
```

#### Preview Environment  
```bash
DOCS_ENV=preview pnpm test:e2e       # Test GitHub Pages URLs
pnpm test:post-build:preview         # Post-deployment validation
```

#### Production Environment
```bash  
DOCS_ENV=production pnpm test:e2e    # Test production URLs
pnpm test:post-build:production      # Live site validation
```

## 📊 Coverage Requirements

### Minimum Coverage Targets
- **UI Components**: 80% line coverage
- **Utilities/Services**: 90% line coverage  
- **API Endpoints**: 85% line coverage
- **Configuration**: 70% line coverage

### Coverage Commands
```bash
pnpm test:coverage              # Generate coverage reports
pnpm test:admin:coverage        # Admin-specific coverage
pnpm test:scripts:coverage      # Script coverage
```

## 🔧 Development Workflow

### Git and Testing Commands
- **Always ensure git and testing commands exit without waiting for user input**
- Use `--no-pager` or equivalent options to disable pagination and interactive prompts
- Avoid using commands that may pause or prompt for confirmation

### Adding New Features
1. **Write Tests First** (TDD approach)
2. **Tag Appropriately** (use required tags)
3. **Run Affected Tests** (`nx affected --target=test`)
4. **Validate Builds** (`pnpm test:builds:affected`)
5. **Check Coverage** (maintain minimum thresholds)

### Modifying Existing Code
1. **Run Existing Tests** (understand current behavior)
2. **Update Tests** (keep in sync with changes)
3. **Check Cross-Site Impact** (if URLs/navigation change)
4. **Verify Multiple Browsers** (Chrome, Firefox, mobile)

### AI Assistant Guidelines
- **Always check MUI MCP and Context7 MCP** for examples before writing code
- **Always run typecheck and ESLint** after writing code
- **Use `nx affected`** instead of running all tests
- **Verify basePath compliance** for all admin portal code
- **Follow established patterns** from examples/ directory

### Planning and Execution Rules
- **All plans must be written to planning documents** with checkmarks for task/phase completion
- **Follow the planning document throughout execution** - update checkmarks as tasks complete
- **State the current phase/task** being started at the beginning of work
- **State when each phase/task is complete** before moving to the next
- **Pause between plan phases** and ask for permission to continue to the next phase
- **Maintain clear progress tracking** for accountability and resumption

## 🛡️ Quality Gates

### Pre-Commit Requirements
- ✅ All affected tests pass
- ✅ TypeScript compilation succeeds  
- ✅ ESLint validation passes
- ✅ Test files have required tags
- ✅ File naming patterns followed

### Pre-Push Requirements  
- ✅ Integration tests pass
- ✅ Critical smoke tests pass
- ✅ Build validation succeeds
- ✅ No accessibility regressions

### Deployment Requirements
- ✅ Full test suite passes
- ✅ Visual regression tests pass  
- ✅ Performance benchmarks met
- ✅ Cross-browser compatibility verified

## 🎯 Best Practices

### Test Design
- **Fast and Isolated**: Unit tests should run in <1 second
- **Predictable**: Same input produces same output
- **Clear Names**: Describe what is being tested
- **Single Responsibility**: One concept per test
- **Comprehensive**: Cover happy path, edge cases, errors

### Mock Usage
- **Global Mocks**: Use centralized mocks in `packages/theme/src/tests/__mocks__/`
- **Component Mocks**: Mock external dependencies, not internal logic
- **Data Mocks**: Use realistic but anonymized test data
- **API Mocks**: Mock external APIs to prevent flaky tests

### Authentication Testing
- **Use Real Test Users**: Avoid deprecated auth mocks
- **Standard Auth Code**: `424242` for all test users in dev environment
- **Permission Testing**: Test both allowed and denied scenarios
- **Role Isolation**: Separate tests for different user roles

## 🚨 Common Antipatterns

### ❌ Avoid These Mistakes
- Hardcoding basePath in tests (use dynamic paths)
- Hardcoding environment URLs (use siteConfig utilities)  
- Skipping tags on test files (pre-commit hook will catch)
- Writing slow unit tests (>1 second indicates integration test)
- Testing implementation details (test behavior, not internals)
- Ignoring accessibility requirements (all UI tests need @accessibility)

### ❌ Bad Examples
```typescript
// DON'T: Missing tags
describe('User validation', () => {});

// DON'T: Hardcoded URLs
await page.goto('http://localhost:3000/admin/dashboard');

// DON'T: Slow unit test  
it('should process large dataset', async () => {
  // 10 second operation - this is integration test
});

// DON'T: Testing internals
expect(component.privateMethod).toHaveBeenCalled();
```

### ✅ Good Examples  
```typescript
// DO: Proper tagging
describe('User validation @unit @critical @auth', () => {});

// DO: Dynamic URLs
await page.goto(addBasePath('/dashboard'));

// DO: Fast unit test
it('should validate user input @unit @fast @validation', () => {
  // <100ms operation
});

// DO: Testing behavior
expect(result.isValid).toBe(true);
```

## 📅 Maintenance and Updates

### Quarterly Review Process
This guide will be reviewed and updated quarterly to:
- ✅ Sync with evolving test infrastructure
- ✅ Add new tag categories as needed
- ✅ Update coverage requirements
- ✅ Incorporate lessons learned
- ✅ Review enforcement effectiveness

### Upcoming Improvements
- Enhanced test categorization system
- Automated test quality metrics
- Performance regression detection
- Advanced accessibility testing
- Cross-browser test automation

## 🔗 Related Documentation

- [Testing Strategy Overview](./Testiing%20strategy.md)
- [Development Workflow](./development-workflow.md) 
- [Next.js Admin Coding Standards](./next-js-admin-coding-standards.md)
- [Site Configuration Management](./site-configuration.md)

## 📞 Support and Self-Review

For questions about this testing guide (solo development approach):
1. Check existing patterns in `examples/tests/` directory
2. Review similar tests in your feature area
3. Consult the project's testing documentation
4. Use automated validation tools: `pnpm test:validate-tagging`
5. Run quarterly audit for insights: `pnpm audit:testing`

---

**Remember**: This guide is enforced by automated tooling designed for solo development. Following these patterns ensures your tests integrate seamlessly with the existing infrastructure and provide reliable feedback without requiring peer review or team coordination.

**Last Updated**: Created as part of comprehensive testing guide rollout
**Next Review**: Quarterly (schedule automated reminder)
