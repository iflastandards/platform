# MVP Dashboard Test

## Setup Complete

1. **NewTest Dashboard Page**: Created at `/standards/newtest/src/pages/dashboard.tsx`
2. **Admin Server**: Running on port 3007 (needs proper env vars)
3. **NewTest Site**: Running on port 3008

## Test Steps

1. Navigate to: http://localhost:3008/newtest/dashboard
2. You should see:
   - "Welcome to NewTest Dashboard"
   - "Please log in to access the dashboard"
   - "Login with GitHub" button

3. Click "Login with GitHub" button
   - This will redirect to: http://localhost:3007/auth/signin?callbackUrl=http://localhost:3008/newtest/dashboard
   - You'll see the admin sign-in page

4. After authentication:
   - You'll be redirected back to the dashboard
   - You'll see: "Hello [username] from Vercel" (if you have vercel in your teams)
   - Or: "Hello [username]" (if not)
   - "Welcome to the newtest namespace!"
   - List of your teams

## Current Status

The MVP is ready but requires:
1. Valid GitHub OAuth credentials in `/apps/admin/.env`:
   - `GITHUB_ID` - Your GitHub OAuth App ID
   - `GITHUB_SECRET` - Your GitHub OAuth App Secret

2. GitHub OAuth App Configuration:
   - Authorization callback URL: `http://localhost:3007/api/auth/callback/github`

## Authentication Flow

1. User clicks "Login with GitHub" on dashboard
2. Redirects to admin sign-in page with callback URL
3. User signs in with GitHub
4. Admin app validates and creates session
5. Redirects back to newtest dashboard
6. Dashboard uses `useAdminSession` hook to fetch session from admin API
7. Shows personalized greeting based on session data