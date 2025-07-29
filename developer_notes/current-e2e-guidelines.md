# E2E Guidelines

## Clerk Authentication

The E2E tests now utilize Clerk for authentication instead of NextAuth. This includes changes in API routes and middleware usage.

### Test Users
- **System Admin**: `superadmin+clerk_test@example.com`
- **Review Group Admin**: `rg_admin+clerk_test@example.com`
- **Editor**: `editor+clerk_test@example.com`
- **Author/Reviewer**: `author+clerk_test@example.com`
- **Translator**: `translator+clerk_test@example.com`

All test users use the email verification code: `424242`.

### Authentication Flow
1. User begins sign-in via Clerk modal.
2. Enters email and uses verification code `424242`.
3. User lands on a dashboard based on their role: 
   - **Admin**: `/dashboard/admin`
   - **Others**: `/dashboard`

## Middleware
- Use `clerkMiddleware` in `apps/admin/src/middleware.ts` to manage route protection and public routes.

## New Helper Usage

### Mock Authentication
Helpers to mock Clerk authentication are available for test setup:

- `setupMockAuth(context, email)`: Prepares a mock session for a specified user email.
- `clearAuth(context)`: Clears the current Clerk authentication state.

### Testing Workflow
1. Use `setupMockAuth` to authenticate users as needed.
2. Utilize `clearAuth` to reset between tests.
3. E2E test examples are found in `e2e/utils/clerk-auth.ts`.

### Example Usage
```typescript
import { test } from '@playwright/test';
import { setupMockAuth, clearAuth } from './utils/clerk-auth';

test('Admin workflow', async ({ context }) => {
    await setupMockAuth(context, 'admin@example.com');
    // Test logic here
    await clearAuth(context);
});
```

## Modifying Tests
When updating tests related to authentication:
- Replace NextAuth mocks with Clerk mocks.
- Ensure routes reflect the new auth flow (e.g., `/sign-in` → Clerk modal).

Stay updated with the latest migration steps and guidelines.

