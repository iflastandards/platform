# Test-First Implementation Guide for Admin Architecture

## Getting Unstuck: A Step-by-Step Approach

### 1. Start with the Test Infrastructure

Before writing any implementation code, ensure your test environment is properly configured:

```bash
# 1. Install testing dependencies
cd packages/theme
pnpm add -D @testing-library/react @testing-library/user-event

# 2. Update vitest config to include setup file
# In packages/theme/vitest.config.ts:
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup/mui-setup.ts'],
  },
});
```

### 2. Run Tests to See Failures

Start by running the tests we've created:

```bash
# Run component tests
pnpm nx test theme

# Run API tests
pnpm nx test admin

# Run E2E tests
pnpm nx e2e standards-dev --spec="admin-architecture/**"
```

All tests will fail initially - this is expected and guides your implementation.

### 3. Implement Components Test-First

#### Step 1: ProtectedRoute Component

The tests tell us exactly what the component needs:

```tsx
// packages/theme/src/components/ProtectedRoute.tsx
import React from 'react';
import { CircularProgress, Alert, Box } from '@mui/material';
import { useAdminSession } from '../hooks/useAdminSession';
import { getAdminPortalConfigAuto } from '../config/siteConfig';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredTeams?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredTeams = [],
}) => {
  const { isAuthenticated, teams, loading } = useAdminSession();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    const adminConfig = getAdminPortalConfigAuto();
    window.location.href = `${adminConfig.signinUrl}?returnUrl=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }

  // Check role/team access
  const hasAccess = requiredRoles.length === 0 || 
    requiredRoles.some(role => teams?.includes(role)) ||
    requiredTeams.some(team => teams?.includes(team));

  if (!hasAccess) {
    return (
      <Alert severity="error">
        You don't have permission to access this page.
      </Alert>
    );
  }

  return <>{children}</>;
};
```

Run the test again - it should pass!

#### Step 2: Fix One Test at a Time

Focus on making one test pass before moving to the next:

1. Run specific test: `pnpm vitest ProtectedRoute.test.tsx -t "shows loading spinner"`
2. Implement just enough code to make it pass
3. Run all ProtectedRoute tests to ensure nothing broke
4. Move to the next failing test

### 4. Implement API Routes Test-First

#### Step 1: Create Basic Route Structure

```typescript
// apps/admin/src/app/api/scaffold/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  // Start with auth check - test expects 401 for unauthenticated
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Add more implementation as tests guide you...
}
```

#### Step 2: Add Features Incrementally

Each failing test tells you what to implement next:

1. Authentication check ✓
2. Role validation
3. Input validation
4. Command execution
5. Error handling

### 5. Debug Test Failures

When tests fail unexpectedly:

#### Check Mock Setup
```typescript
// Is the mock returning the right shape?
console.log('Mock called with:', mockUseAdminSession.mock.calls);
console.log('Mock returns:', mockUseAdminSession.mock.results);
```

#### Verify Component Rendering
```typescript
// Add debug output
const { debug } = render(<YourComponent />);
debug(); // Prints component tree
```

#### Check Async Behavior
```typescript
// Wait for async updates
await waitFor(() => {
  expect(something).toBeVisible();
});
```

### 6. Common Pitfalls and Solutions

#### Problem: "Cannot find module '@ifla/theme/components'"
**Solution**: Ensure TypeScript paths are configured:
```json
// packages/theme/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@ifla/theme/*": ["./src/*"]
    }
  }
}
```

#### Problem: MUI Theme Not Working in Tests
**Solution**: Wrap components with theme provider in tests:
```typescript
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={createTheme()}>
      {ui}
    </ThemeProvider>
  );
};
```

#### Problem: Docusaurus Hooks Throwing Errors
**Solution**: Mock them in setup file (already done in mui-setup.ts)

### 7. Test-First Workflow

1. **Write Test First**
   - Define expected behavior
   - Run test (it fails)
   - See exact error message

2. **Implement Minimum Code**
   - Write just enough to pass
   - Don't over-engineer
   - Follow test requirements

3. **Refactor**
   - Clean up implementation
   - Ensure tests still pass
   - Add edge cases

4. **Repeat**
   - Move to next test
   - Build incrementally

### 8. Integration Testing Strategy

For complex workflows, test the integration:

```typescript
// Test multiple components together
describe('Dashboard Integration', () => {
  it('complete site creation flow', async () => {
    // Setup mocks for all dependencies
    mockAuth();
    mockGitHubAPI();
    mockFileSystem();
    
    // Render dashboard
    const { user } = renderDashboard();
    
    // Perform user actions
    await user.click(screen.getByText('Create Site'));
    await user.type(screen.getByLabelText('Site Key'), 'newsite');
    
    // Verify outcomes
    expect(mockScaffoldScript).toHaveBeenCalled();
    expect(screen.getByText('Success')).toBeVisible();
  });
});
```

### 9. E2E Testing Tips

#### Use Page Objects Pattern
```typescript
class DashboardPage {
  constructor(private page: Page) {}
  
  async createSite(siteKey: string, title: string) {
    await this.page.click('text=Create New Site');
    await this.page.fill('input[name="siteKey"]', siteKey);
    await this.page.fill('input[name="title"]', title);
    await this.page.click('button[type="submit"]');
  }
}
```

#### Mock External Services
```typescript
// Mock at network level
await page.route('**/api/**', route => {
  route.fulfill({ json: mockData });
});
```

### 10. Continuous Testing

Set up watch mode for rapid feedback:

```bash
# Component tests in watch mode
pnpm nx test theme --watch

# Run affected tests on file change
pnpm nx affected --target=test --watch
```

## Next Steps After Tests Pass

1. **Add Error Boundary Tests**: Test error states and recovery
2. **Performance Tests**: Ensure components render efficiently
3. **Accessibility Tests**: Verify ARIA labels and keyboard navigation
4. **Visual Regression Tests**: Capture screenshots for UI consistency

## Remember

- Tests are your specification
- Red → Green → Refactor
- Each test failure points to missing implementation
- Small, incremental steps
- Commit after each passing test

The test-first approach ensures you build exactly what's needed, with confidence that it works correctly.