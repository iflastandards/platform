- - ### **Guiding Principles Addendum: Test Development Specification**

    

    You are an expert full-stack engineer who writes robust, maintainable tests as an integral part of the development process. This specification is your permanent guide to testing within our ecosystem. All feature development must be accompanied by tests that adhere to these principles.

    

    #### **1. Overarching Philosophy**

    

    - **Test Alongside Code:** Tests are not an afterthought. They are written during **Phase 4 (Implementation)** of the "Feature Factory" workflow, concurrently with the feature code itself. Every pull request for a new feature must include its corresponding tests.
    - **Follow the Testing Trophy:** We favor integration tests. While unit tests are useful for isolated business logic and E2E tests are vital for user flows, the majority of our testing effort should focus on integration tests. They provide the best balance of confidence, speed, and maintainability.
    - **Test User Behavior, Not Implementation Details:** Tests should be resilient to refactoring. Focus on what the user sees and does. A test should not fail because you renamed a variable or changed a CSS class name; it should fail because a user can no longer accomplish their goal.

    

    #### **2. The Testing Spectrum**

    This defines the types of tests you will write, what they cover, and how to implement them.

    **A. Unit Tests**

    - **What they are:** Tests for a single, isolated function or module.
    - **What they test:** Pure business logic, complex algorithms, utility functions, and Zod schema validations. They should have no UI rendering and no external dependencies (databases, APIs, etc.).
    - **When to create:** When developing a specific, isolated piece of logic.
    - **Implementation (`vitest`):**
      - Create a `[module-name].test.ts` file alongside the module.
      - Use `describe`, `it`, and `expect` to define test cases.
      - If the module has dependencies, they must be mocked using `vi.mock()`.

    **B. Integration Tests (Primary Focus)**

    - **What they are:** Tests for one or more components working together as a single unit of UI, interacting with a mocked data layer.
    - **What they test:** The complete functionality of a React component. This includes:
      - Rendering correctly based on props.
      - Responding to user interactions (clicks, typing) via `userEvent`.
      - Calling the `dataProvider` with the correct parameters.
      - Correctly handling all states: loading, success, error, and empty.
    - **When to create:** For every new component or page that contains business logic or data fetching.
    - **Implementation (`vitest` + `React Testing Library` + `MSW`):**
      - Create a `[ComponentName].test.tsx` file alongside the component.
      - Use `render` from RTL to render the component.
      - Use `screen` queries to find elements as a user would (e.g., `screen.getByRole('button', { name: /Submit/i })`).
      - Use `userEvent` to simulate user actions.
      - **Crucially:** Use **MSW** to intercept API calls made by the `dataProvider` and provide consistent mock responses. The component should not know it's being tested.

    **C. End-to-End (E2E) Tests**

    - **What they are:** Automated tests that simulate a complete user journey through the live application.
    - **What they test:** Critical user flows across multiple pages. For example: "A user logs in, navigates to the 'Create Job' page, fills out the form, submits it, is redirected, and sees the new job in the jobs list."
    - **When to create:** For each primary user story or "golden path" of a new feature.
    - **Implementation (`Playwright`):**
      - Tests are located in the `apps/admin/e2e` directory.
      - Tests are written from the user's perspective, using locators to find elements and perform actions.
      - For CI/CD, these tests will run against the application with `NEXT_PUBLIC_USE_MOCK=true` to ensure deterministic behavior and speed.

    **D. Accessibility (A11y) Tests**

    - **What they are:** Automated checks for violations of WCAG standards.

    - **What they test:** Compliance with accessibility rules (color contrast, ARIA attributes, etc.).

    - **When to create:** This is not a separate test suite but an integral part of other tests.

    - **Implementation (`axe-core`):**
      - Integrate `axe-core/react` into critical integration tests to check for violations upon render.
      - Integrate `@axe-core/playwright` into all E2E tests to automatically scan each page in the user flow.
      
      


    #### **3. Test Tagging Specification**

    All tests must be tagged to enable effective filtering, prioritization, and execution by our CI/CD pipeline and test runner. Tags are added directly to the test title string. The `validate-test-tagging.js` script enforces these rules during pre-commit hooks, and the AI-powered `auto-tag-tests.ts` tool can automatically analyze and apply appropriate tags.

    **AI-Powered Tagging Tool:**
    
    We provide an intelligent test tagging tool that uses AI to ensure consistent categorization:
    
    ```bash
    # Analyze and tag test files automatically
    pnpm test:tag                    # Preview changes (dry run)
    pnpm test:tag --no-dry-run      # Apply tags
    pnpm test:tag --staged          # Tag only staged files
    pnpm test:tag --affected        # Tag Nx affected files
    ```

    To ensure consistency and type-safety, you should use the helpers provided in `test-tags.ts` when constructing your test titles.

    **Example:**

    TypeScript

    ```
    import { test } from '@playwright/test';
    import { testWithTags, TestTags } from './test-tags';
    
    test(testWithTags('should allow admin to create a new user', TestTags.E2E, TestTags.CRITICAL, TestTags.ADMIN, TestTags.RBAC), async ({ page }) => {
      // ... test logic
    });
    ```

    **Tagging Requirements:**

    - **Category Tags (1 Required):** Describes the test's scope and is mandatory for every test. Choose exactly one:
      - `@unit`: For isolated logic tests with no external dependencies.
      - `@integration`: For component-level tests with mocked data or multiple components working together.
      - `@e2e`: For multi-page user journey tests using browser automation.
      - `@smoke`: For a small subset of critical, high-level health checks that run in CI.
      - `@env`: For environment-dependent tests that verify configuration and external services.
      
    - **Priority Tags (Recommended):** Indicates the test's importance and impact.
      - `@critical`: Tests covering core functionality that would block a release if failing.
      - `@happy-path`: Primary user flows that represent expected usage.
      - `@error-handling`: Tests that verify error states and recovery.
      - `@edge-case`: Tests for boundary conditions and unusual scenarios.
      
    - **Functional Area Tags (Recommended):** Describes the product feature being tested to allow for targeted runs.
      - Core features: `@auth`, `@rbac`, `@api`, `@ui`, `@validation`
      - Application areas: `@dashboard`, `@admin`, `@navigation`, `@search`
      - Technical aspects: `@security`, `@performance`, `@accessibility`, `@cache`
      - Domain-specific: `@vocabulary`, `@sites`, `@docs`
      - Tests should be tagged with one or more relevant functional areas.
      
    - **Special & Environment Tags (As Needed):** Used to modify or control test runner behavior.
      - Performance indicators: `@slow`, `@fast`, `@flaky`
      - Environment control: `@local-only`, `@ci-only`, `@preview-only`, `@production-only`
      - Browser-specific: `@chromium-only`, `@firefox-only`, `@webkit-only`, `@mobile-only`
      - Dependencies: `@server-dependent`, `@clerk` (for Clerk auth tests)
      - Control tags: `@skip` (temporarily disable), `@visual` (visual regression), `@performance` (perf tests)

    **Automated Validation:**
    
    - Pre-commit hooks run `validate-test-tagging.js` to ensure all test files have proper tags
    - The AI tagging tool can suggest missing tags and validate naming conventions
    - File placement is validated based on test category (unit tests near source, integration in `/tests/integration/`, etc.)
      
      


    #### **3. Structure & CI/CD Integration (`nx`)**

    - **Colocation:** All tests (except E2E) should live directly alongside the code they are testing. This improves discoverability and makes it easier to keep tests up-to-date.
    - **NX Test Tagging:** Our CI/CD pipeline uses `nx affected` to run tests intelligently. `nx` projects are configured to distinguish between test types.
      - **Unit & Integration tests** are run together via the default `test` target. The pre-push git hook will run: `nx affected --target=test`.
      - **E2E tests** have their own `e2e` target. They are run on a schedule and against preview deployments: `nx e2e admin`.
    - You are expected to ensure your new tests are correctly configured within the `project.json` of the relevant `nx` project so they are picked up by the CI pipeline.