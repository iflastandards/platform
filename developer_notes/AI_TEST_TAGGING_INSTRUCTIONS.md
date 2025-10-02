# AI Test Tagging Instructions

## Overview

You are analyzing test files to determine appropriate tags based on our testing strategy. Your goal is to ensure tests are properly categorized for efficient execution in different environments.

## Tag Categories

### Primary Test Type (Choose ONE)

#### @unit
- Pure unit tests with all dependencies mocked
- No external services, databases, or APIs
- Fast execution (<100ms per test)
- Examples: Component renders, pure function tests, isolated logic

#### @integration  
- Tests with service integration (may use MSW for mocking)
- May test multiple components working together
- Can include mocked API calls
- Examples: API contract tests, service layer tests, data flow tests

#### @e2e
- End-to-end browser automation tests
- Uses Playwright, Puppeteer, or similar
- Tests complete user journeys
- Examples: Login flow, checkout process, form submission

#### @smoke
- Critical path validation tests
- Minimal tests to verify deployment
- Health checks and availability tests
- Run ONLY after production deployment

## Environment Modifiers

### @server-dependent
- Requires local servers running (admin on :3007, portal on :3000, etc.)
- Makes real HTTP calls to localhost
- Cannot run in CI without server setup
- MUST be paired with @local-only

### @local-only
- Can only run on local development machines
- Not suitable for CI/CD pipelines
- Usually paired with @server-dependent

### @post-deploy
- Runs after successful deployment
- Tests against deployed URLs
- Used for smoke tests and health checks
- NEVER modifies production data

### @preview-safe
- Safe to run against preview deployments
- Uses demo/test data only
- Can run in CI preview environments

## Functional Area Tags (Add ALL that apply)

- **@auth**: Authentication, authorization, login, sessions
- **@api**: API endpoints, REST, GraphQL, data fetching
- **@ui**: UI components, rendering, user interactions
- **@validation**: Data validation, form validation, schemas
- **@security**: Security features, CSRF, XSS prevention
- **@cache**: Caching logic, Redis, storage
- **@rbac**: Role-based access control, permissions
- **@critical**: Mission-critical functionality
- **@happy-path**: Standard successful user flow
- **@error-handling**: Error cases and recovery
- **@edge-case**: Boundary conditions, unusual scenarios

## Validation Rules (MUST ENFORCE)

### Rule 1: Unit tests CANNOT be server-dependent
```
❌ INVALID: @unit @server-dependent
✅ VALID: @unit @ui @validation
```

### Rule 2: Smoke tests MUST be post-deploy
```
❌ INVALID: @smoke @local-only
✅ VALID: @smoke @post-deploy @critical
```

### Rule 3: Server-dependent tests MUST be local-only
```
❌ INVALID: @integration @server-dependent (missing @local-only)
✅ VALID: @integration @server-dependent @local-only
```

### Rule 4: E2E tests MUST specify environment
```
❌ INVALID: @e2e (no environment specified)
✅ VALID: @e2e @server-dependent @local-only
✅ VALID: @e2e @post-deploy
```

### Rule 5: Live API tests need environment
```
❌ INVALID: @api @live-api (no environment)
✅ VALID: @api @live-api @server-dependent @local-only
✅ VALID: @api @live-api @post-deploy
```

## Analysis Process

### Step 1: Identify Test Type
Look for:
- Mock usage → likely @unit
- MSW setup → likely @integration
- Browser/page objects → definitely @e2e
- "smoke" in filename/description → @smoke

### Step 2: Check Dependencies
Look for:
- `localhost:` URLs → @server-dependent @local-only
- `process.env.API_URL` → may be @server-dependent
- `waitForServer` → @server-dependent @local-only
- No external calls → can run anywhere

### Step 3: Identify Functional Areas
Scan for keywords:
- auth, login, user, role → @auth
- fetch, axios, api, endpoint → @api
- render, component, click → @ui
- validate, schema, rules → @validation

### Step 4: Apply Validation Rules
Ensure tag combinations are valid according to rules above.

## Decision Examples

### Example 1: Component Test
```typescript
describe('UserList component', () => {
  it('renders users', () => {
    render(<UserList users={mockUsers} />);
```
**Tags**: `@unit @ui @component`

### Example 2: API Integration Test with MSW
```typescript
describe('UserService', () => {
  beforeAll(() => server.listen()); // MSW server
  it('fetches users', async () => {
```
**Tags**: `@integration @api @user`

### Example 3: E2E Test Requiring Server
```typescript
test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3007/login');
```
**Tags**: `@e2e @auth @server-dependent @local-only`

### Example 4: Smoke Test
```typescript
describe('Production Health Check @smoke', () => {
  it('API responds', async () => {
```
**Tags**: `@smoke @post-deploy @critical @api @health`

## Output Format

When suggesting tags, provide:
1. **Primary tags**: The main categorization
2. **Confidence**: 0-1 score (be conservative, <0.8 triggers fallback)
3. **Reasoning**: Brief explanation of tag choices

Example response:
```json
{
  "tags": ["@integration", "@api", "@auth", "@validation"],
  "confidence": 0.92,
  "reasoning": "MSW setup indicates integration test, auth endpoints tested with validation"
}
```

## Important Notes

- If uncertain about server dependencies, be conservative and add @server-dependent @local-only
- When in doubt between @unit and @integration, choose @integration
- Always add functional area tags for better filtering
- Consider the file path: `e2e/` folder → @e2e, `unit/` → @unit
- Check imports: `@testing-library/react` → likely @unit @ui