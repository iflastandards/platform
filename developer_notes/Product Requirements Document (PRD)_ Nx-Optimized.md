<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

## Product Requirements Document (PRD): Nx-Optimized E2E Test Strategy Implementation

### Overview

The goal is to redefine our E2E strategy for a monorepo containing Docusaurus v3.8 documentation sites, a Next.js admin with Clerk authentication, GitHub API integration, Vercel edge API servers, and Supabase database—deploying to GitHub Pages and Vercel. Tests are orchestrated by Nx using Playwright and Vitest, with CI/CD on GitHub Actions. The new strategy must reduce fragility, accelerate feedback loops, and leverage Nx capabilities for atomic, environment-specific, and parallelized testing.

### 1. Objectives

- **Reduce E2E fragility and maintenance overhead**
- **Accelerate CI/CD feedback and reduce test execution times**
- **Categorize and optimize tests for local, preview, and production environments**
- **Integrate reliable, maintainable RBAC and Clerk workflows**
- **Shift from monolithic comprehensive runs to atomic testing (`Nx Project Crystal` approach)**
- **Better use of Nx agent parallelization and affected-logic**
- **Robust smoke and integration testing in preview/prod; full E2E only pre-push**
- **Enhance selector and test design resilience to UI changes**


### 2. Scope

#### 2.1. In-Scope

- Nx project configuration for atomic, parallel test runs using Playwright and Vitest
- Docusaurus site navigation and end-to-end user journey coverage
- Next.js admin flows with Clerk-based RBAC scenarios
- Integration checks (GitHub API, Supabase, Vercel Edge endpoints)
- Clerk test user management and per-test isolation best practices
- Environment-specific test pipelines for local, preview (Vercel), and production (GitHub Pages)
- Optimized selector strategies, auto-waiting, and retry logic in Playwright
- Test data fixtures, database seeding, and clean-up patterns


#### 2.2 Out-of-Scope

- UI/UX design changes
- Underlying API architecture changes
- Third-party infra outside tested integrations


### 3. Requirements

#### 3.1 Functional Requirements

- [ ] Implement Nx plugins for Playwright and Vitest orchestration
- [ ] Refactor E2E tests using test IDs, `getByRole`, and robust selectors
- [ ] Use Nx's dependency graph and `affected` logic to minimize unnecessary test runs
- [ ] Integrate Playwright global setup for Clerk authentication and test user session/state
- [ ] Tag tests as `@smoke`, `@integration`, `@e2e` for selective concurrency and environment gating
- [ ] Add Nx Cloud or GitHub Actions reporting for flaky test detection
- [ ] Introduce CI workflows for preview environments, running all smoke/integration tests on Vercel URLs before merge
- [ ] Enforce production deploys requiring passing smoke tests only
- [ ] Optimize local and CI test startup to run only necessary servers/services


#### 3.2 Non-Functional

- [ ] Pre-push validation must finish in <5min for affected projects
- [ ] All E2E and integration tests must be atomic and maintain full isolation
- [ ] Comprehensive E2E must be reserved for dedicated, high-confidence branches
- [ ] Documentation in `/docs/testing/strategy.md` maintained
- [ ] Coverage tracked and actionable on each PR


### 4. Acceptance Criteria

| Test Type | Environment | Coverage | Time limit | Must Pass Rate |
| :-- | :-- | :-- | :-- | :-- |
| Smoke | Local/CI/Prod | Auth, dashboard, API | <5min | 100% |
| Integration | Vercel Preview | RBAC, cross-service, admin | <15min | 95% |
| Full E2E | pre-push/dev | All user journeys/docs | <20min | 90% |

### 5. Deliverables

- Nx configuration (`nx.json`, `playwright.config.ts`)
- All E2E Playwright suites refactored as described
- Example workflow YAML for GitHub Actions preview/prod
- Documentation update describing test conventions, tags, and strategies
- Clerk test user fixture and reset automation


