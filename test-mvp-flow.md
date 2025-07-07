# MVP Dashboard Test Flow

## Current Setup

1. **NewTest Site**: Running on http://localhost:3008/newtest/
2. **Admin App**: Running on http://localhost:3007/admin/
3. **Dashboard Page**: http://localhost:3008/newtest/dashboard

## Test Flow

1. Navigate to: http://localhost:3008/newtest/dashboard
   - You should see the login page with "Login with GitHub" button

2. Click "Login with GitHub"
   - Redirects to: http://localhost:3007/admin/auth/signin?callbackUrl=http://localhost:3008/newtest/dashboard
   - Shows GitHub login button

3. Click "Sign in with GitHub" on admin page
   - Will redirect to GitHub OAuth (needs valid credentials in .env)
   - OAuth callback: http://localhost:3007/admin/api/auth/callback/github

4. After successful auth:
   - Redirects back to: http://localhost:3008/newtest/dashboard
   - Shows personalized greeting

## Current Issues to Fix

1. **GitHub OAuth Credentials**: Need valid GitHub OAuth app credentials in `/apps/admin/.env`:
   ```
   GITHUB_ID=your_actual_github_oauth_app_id
   GITHUB_SECRET=your_actual_github_oauth_app_secret
   ```

2. **GitHub OAuth App Settings**:
   - Authorization callback URL: `http://localhost:3007/admin/api/auth/callback/github`
   - Homepage URL: `http://localhost:3007`

## Testing Without Real GitHub OAuth

For testing without real GitHub credentials, you can use the mock authentication in development mode by adding these query parameters:

```
http://localhost:3007/admin/auth/signin?mockUser=%7B%22attributes%22%3A%7B%22name%22%3A%22jonphipps%22%7D%2C%22roles%22%3A%5B%22vercel-developer%22%2C%22newtest-admin%22%5D%7D&callbackUrl=http://localhost:3008/newtest/dashboard
```

This will mock a user with:
- Name: jonphipps
- Roles: vercel-developer, newtest-admin