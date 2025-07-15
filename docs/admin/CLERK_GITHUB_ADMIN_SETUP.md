# Minimal Clerk Setup - GitHub Org Admins Only

This guide sets up Clerk to authenticate GitHub users and grant superadmin access to GitHub organization admins.

## Step 1: GitHub OAuth Scopes

In Clerk Dashboard:
1. Go to **Configure** → **SSO Connections** → **GitHub**
2. Ensure these scopes are enabled:
   - `read:user` - Basic user info
   - `read:org` - **CRITICAL**: Read organization membership

## Step 2: Simple Webhook for Admin Detection

### 2.1 Create Webhook Endpoint

1. Go to **Configure** → **Webhooks**
2. Click **Add Endpoint**
3. URL: `https://your-domain.com/api/webhooks/clerk`
4. Select events: `user.created`, `session.created`

### 2.2 Add Webhook Secret

Copy the signing secret and add to `.env.local`:
```bash
CLERK_WEBHOOK_SECRET=whsec_...
```

## Step 3: Create Simple Webhook Handler

Create `apps/admin/src/app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

const GITHUB_ORG = 'iflastandards'; // Your GitHub organization

export async function POST(req: Request) {
  // Verify webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id!,
      "svix-timestamp": svix_timestamp!,
      "svix-signature": svix_signature!,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Error verifying webhook', { status: 400 });
  }

  const { type, data } = evt;

  if (type === 'user.created' || type === 'session.created') {
    // Get GitHub username from OAuth account
    const githubAccount = data.external_accounts?.find(
      account => account.provider === 'oauth_github'
    );
    
    if (githubAccount?.username) {
      // Check if user is org admin using GitHub API
      const isOrgAdmin = await checkGitHubOrgAdmin(
        githubAccount.username,
        githubAccount.access_token
      );
      
      // Update user metadata
      await clerkClient.users.updateUserMetadata(data.id, {
        publicMetadata: {
          roles: isOrgAdmin ? ['superadmin'] : [],
          githubUsername: githubAccount.username
        }
      });
    }
  }

  return new Response('', { status: 200 });
}

async function checkGitHubOrgAdmin(
  username: string, 
  accessToken: string
): Promise<boolean> {
  try {
    // Check organization membership
    const response = await fetch(
      `https://api.github.com/orgs/${GITHUB_ORG}/memberships/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) return false;

    const membership = await response.json();
    // Check if user is an admin or owner
    return membership.role === 'admin' || membership.role === 'owner';
  } catch (error) {
    console.error('Error checking GitHub org admin status:', error);
    return false;
  }
}
```

## Step 4: Update the Clerk-Cerbos Bridge

The existing `clerk-cerbos.ts` already handles the role mapping correctly:

```typescript
export async function getCerbosUser(): Promise<CerbosUser | null> {
  const user = await currentUser();
  
  if (!user) return null;
  
  const metadata = user.publicMetadata as {
    roles?: string[];
    githubUsername?: string;
  };
  
  return {
    id: user.id,
    roles: metadata.roles || [],
    name: user.fullName,
    email: user.emailAddresses[0]?.emailAddress,
    attributes: {
      githubUsername: metadata.githubUsername
    }
  };
}
```

## Step 5: Manual Testing (Development)

For development/testing without webhooks:

1. Go to Clerk Dashboard → **Users**
2. Find your test user
3. Edit **Public metadata**:
```json
{
  "roles": ["superadmin"],
  "githubUsername": "your-github-username"
}
```

## That's It!

Now:
- Users sign in with GitHub
- Webhook checks if they're an org admin
- If yes, they get `superadmin` role
- Cerbos sees the role and grants full access

## Environment Variables

Make sure you have:
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_... # After creating webhook

# GitHub (for API calls)
GITHUB_TOKEN=ghp_... # Personal access token with org:read scope
```

## Testing

1. Sign in with a GitHub account that's an admin of `iflastandards` org
2. Check Clerk Dashboard - user should have `roles: ["superadmin"]` in metadata
3. Access admin portal - should have full superadmin access

That's all you need - no complex role mappings, just GitHub org admin = superadmin!