# GitHub Organization Ownership Setup

This document explains how to properly configure automatic superadmin status for GitHub organization owners.

## Overview

The system automatically grants superadmin status to users who are owners/admins of the `iflastandards` GitHub organization. This is done through a proper API-based check rather than a hardcoded list.

## Configuration Steps

### 1. Create a GitHub App or Personal Access Token

#### Option A: GitHub App (Recommended)
1. Go to GitHub Organization Settings → Developer settings → GitHub Apps
2. Create a new GitHub App with these permissions:
   - **Organization permissions**: 
     - Members: Read
     - Administration: Read
3. Install the app on the `iflastandards` organization
4. Generate a private key
5. Note the App ID and Installation ID

#### Option B: Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a token with these scopes:
   - `read:org` - Read organization membership
   - `admin:org` - Read organization admin status (optional, for full role checking)

### 2. Set Environment Variables

Add these to your Render environment:

```bash
# For GitHub App (recommended)
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key_base64_encoded
GITHUB_APP_INSTALLATION_ID=your_installation_id

# OR for Personal Access Token
GITHUB_PAT=ghp_your_personal_access_token

# Emergency access (optional, comma-separated GitHub usernames)
# Only use for absolute emergencies when API is down
GITHUB_EMERGENCY_ADMINS=username1,username2

# Clerk Webhook Secret (required)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Configure Clerk Webhook

1. In Clerk Dashboard, go to **Webhooks**
2. Add a new endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events to listen for:
     - `user.created`
     - `session.created`
3. Copy the signing secret and add it as `CLERK_WEBHOOK_SECRET`

## How It Works

### Authentication Flow

1. **User signs in with GitHub OAuth**
2. **Clerk webhook is triggered** (`user.created` or `session.created`)
3. **System checks organization ownership**:
   - First tries with user's OAuth token (if available)
   - Falls back to GitHub App/PAT for verification
   - Checks cached results for performance
4. **If user is org owner**: Updates Clerk metadata with superadmin status
5. **User is redirected** to admin dashboard with full access

### Special Cases

#### Test Email
The email `superadmin+clerk_test@example.com` always gets superadmin status for testing purposes.

#### Emergency Access
If GitHub API is unavailable, users listed in `GITHUB_EMERGENCY_ADMINS` environment variable will get superadmin access.

## API Methods

### Primary Check (Recommended)
```typescript
import { isOrganizationOwner } from '@/lib/github-org-check';

const isOwner = await isOrganizationOwner('githubUsername');
```

### Direct API Check
```typescript
import { checkOrgOwnershipWithAppToken } from '@/lib/github-org-check';

const isOwner = await checkOrgOwnershipWithAppToken('githubUsername');
```

### Get All Owners
```typescript
import { getAllOrgOwners } from '@/lib/github-org-check';

const owners = await getAllOrgOwners();
// Returns: ['username1', 'username2', ...]
```

## Caching

The system caches organization ownership data for 5 minutes to reduce API calls. The cache is automatically refreshed when:
- TTL expires (5 minutes)
- A new owner is detected
- Manual invalidation is triggered

## Troubleshooting

### User not getting superadmin status

1. **Check GitHub organization membership**:
   ```bash
   curl -H "Authorization: token YOUR_PAT" \
     https://api.github.com/orgs/iflastandards/memberships/USERNAME
   ```
   Should return `"role": "admin"` for owners.

2. **Check environment variables**:
   - Ensure `GITHUB_APP_TOKEN` or `GITHUB_PAT` is set
   - Verify `CLERK_WEBHOOK_SECRET` is correct

3. **Check webhook delivery**:
   - In Clerk Dashboard → Webhooks → View endpoint
   - Check recent deliveries for errors

4. **Check logs**:
   - Look for console logs starting with "GitHub org check"
   - Check for API errors or rate limiting

### Rate Limiting

GitHub API has rate limits:
- Authenticated requests: 5,000/hour
- Unauthenticated: 60/hour

The caching system helps minimize API calls.

## Security Considerations

1. **Never commit tokens** to the repository
2. **Use GitHub App** instead of PAT when possible (better security, higher rate limits)
3. **Minimize emergency access list** - should be empty in production
4. **Rotate tokens regularly**
5. **Monitor webhook logs** for suspicious activity

## Migration from Hardcoded List

If migrating from the old hardcoded list approach:

1. Set up GitHub App or PAT as described above
2. Add environment variables
3. Deploy the updated code
4. Test with a known org owner
5. Remove any hardcoded usernames from the code
6. Use `GITHUB_EMERGENCY_ADMINS` only for true emergencies

## Testing

To test without being an actual org owner:

1. Add your GitHub username to `GITHUB_EMERGENCY_ADMINS` temporarily
2. Sign in with GitHub
3. Verify you get admin dashboard access
4. Remove your username from emergency list when done

Or use the test email `superadmin+clerk_test@example.com` which always works.