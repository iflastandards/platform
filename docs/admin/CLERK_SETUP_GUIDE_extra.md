# Clerk Setup Guide for IFLA Admin Portal

This guide walks you through configuring Clerk to work with your existing Cerbos authorization system.

## Prerequisites

- Access to your Clerk Dashboard (https://dashboard.clerk.com)
- Your GitHub OAuth app credentials
- Understanding of your IFLA role structure

## Step 1: Configure User Metadata Schema

### 1.1 Navigate to User Metadata Settings

1. Log into your Clerk Dashboard
2. Select your application
3. Go to **Configure** → **User & Authentication** → **User metadata**

### 1.2 Set Up Public Metadata Schema

Add the following schema for **Public metadata** (accessible client-side):

```json
{
  "roles": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "User's RBAC roles"
  },
  "attributes": {
    "type": "object",
    "properties": {
      "rgs": {
        "type": "object",
        "description": "Review group roles",
        "additionalProperties": {
          "type": "string"
        }
      },
      "sites": {
        "type": "object",
        "description": "Site-specific roles",
        "additionalProperties": {
          "type": "string"
        }
      }
    }
  }
}
```

### 1.3 Set Up Private Metadata Schema

Add the following schema for **Private metadata** (server-side only):

```json
{
  "githubTeams": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "GitHub team memberships"
  },
  "lastRoleSync": {
    "type": "string",
    "format": "date-time",
    "description": "Last time roles were synced from GitHub"
  }
}
```

## Step 2: Configure Session Settings

### 2.1 Navigate to Session Settings

1. In Clerk Dashboard, go to **Configure** → **Sessions**
2. Set the following options:

### 2.2 Configure Session Durations

- **Inactivity timeout**: 2 hours (7200 seconds)
- **Maximum session lifetime**: 30 days (for "stay logged in" feature)
- **Multi-session handling**: Single session mode

### 2.3 Session Token Settings

Under **Customize session token**:

1. Click **Edit**
2. Add these claims to the session token:

```json
{
  "metadata": "{{user.public_metadata}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}"
}
```

## Step 3: Configure GitHub OAuth

### 3.1 Verify GitHub OAuth Settings

1. Go to **Configure** → **SSO Connections** → **GitHub**
2. Ensure these settings are configured:

- **Client ID**: Your GitHub OAuth App ID
- **Client Secret**: Your GitHub OAuth App Secret
- **Callback URL**: Should be automatically set by Clerk

### 3.2 Add Required Scopes

Click **Edit** and ensure these scopes are selected:

- `user:email` - Read user email addresses
- `read:user` - Read user profile data
- `read:org` - Read organization membership (CRITICAL for team roles)

### 3.3 Save and Apply

Click **Update** to save your changes.

## Step 4: Set Up Webhooks for Role Sync

### 4.1 Create Webhook Endpoint

1. Go to **Configure** → **Webhooks**
2. Click **Add Endpoint**
3. Set the endpoint URL: `https://your-domain.com/api/webhooks/clerk`
4. Select these events:
   - `user.created`
   - `user.updated`
   - `session.created`

### 4.2 Get Webhook Secret

1. After creating the webhook, click on it
2. Copy the **Signing Secret**
3. Add to your `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_...
```

## Step 5: Manual Role Assignment (Development)

For testing and development, you can manually assign roles:

### 5.1 Find a User

1. Go to **Users** in Clerk Dashboard
2. Click on a specific user

### 5.2 Edit User Metadata

1. Click **Edit** next to **Public metadata**
2. Add role data:

```json
{
  "roles": ["superadmin"],
  "attributes": {
    "rgs": {
      "ISBD": "namespace_admin",
      "LRM": "namespace_editor"
    },
    "sites": {
      "isbdm": "site_admin",
      "lrm": "site_editor"
    }
  }
}
```

### 5.3 Test the Roles

The user should now have these permissions in your app.

## Step 6: Testing Your Setup

### 6.1 Test Basic Authentication

1. Visit `http://localhost:3007/admin/sign-in`
2. Click "Continue with GitHub"
3. Authorize the app
4. Verify redirect to `/admin/dashboard`

### 6.2 Test Role Assignment

1. Check the browser console for role data:
   ```javascript
   // In your app, add this temporarily to dashboard:
   console.log('User roles:', user);
   ```

2. Verify Cerbos receives the roles:
   - Check your Cerbos PDP logs
   - Look for the transformed user object

### 6.3 Test Session Duration

1. Sign in without "Stay logged in"
2. Wait 2 hours (or set a shorter timeout for testing)
3. Verify automatic sign-out

## Step 7: Production Webhook Handler

Create `/api/webhooks/clerk/route.ts` to sync GitHub teams to roles:

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

// GitHub team to role mapping
const TEAM_ROLE_MAP: Record<string, string[]> = {
  'iflastandards/platform-superadmin': ['superadmin'],
  'iflastandards/platform-admin': ['ifla-admin'],
  'iflastandards/lrm-admin': ['lrm_namespace_admin'],
  'iflastandards/isbd-admin': ['isbd_namespace_admin'],
  // Add more mappings as needed
};

export async function POST(req: Request) {
  // Verify webhook signature
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

  // Handle the webhook
  const { type, data } = evt;

  if (type === 'user.created' || type === 'session.created') {
    // Get GitHub teams from the user's GitHub account
    const githubTeams = await fetchUserGitHubTeams(data);
    
    // Map teams to roles
    const roles = mapTeamsToRoles(githubTeams);
    
    // Update user metadata
    await clerkClient.users.updateUserMetadata(data.id, {
      publicMetadata: {
        roles: roles.flat,
        attributes: {
          rgs: roles.namespaces,
          sites: roles.sites
        }
      },
      privateMetadata: {
        githubTeams,
        lastRoleSync: new Date().toISOString()
      }
    });
  }

  return new Response('', { status: 200 });
}

function mapTeamsToRoles(teams: string[]) {
  const flat: string[] = [];
  const namespaces: Record<string, string> = {};
  const sites: Record<string, string> = {};

  teams.forEach(team => {
    const roles = TEAM_ROLE_MAP[team];
    if (roles) {
      flat.push(...roles);
      // Parse namespace and site roles
      roles.forEach(role => {
        if (role.includes('_namespace_')) {
          const [ns, _, type] = role.split('_');
          namespaces[ns.toUpperCase()] = `namespace_${type}`;
        } else if (role.includes('_site_')) {
          const [site, _, type] = role.split('_');
          sites[site] = `site_${type}`;
        }
      });
    }
  });

  return { flat, namespaces, sites };
}

async function fetchUserGitHubTeams(user: any): Promise<string[]> {
  // Implementation depends on your GitHub API setup
  // This is a placeholder
  return [];
}
```

## Step 8: Environment Variables Checklist

Ensure all these are set in `apps/admin/.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard

# Webhook Secret (after setting up webhook)
CLERK_WEBHOOK_SECRET=whsec_...

# Keep existing
NEXT_PUBLIC_CERBOS_PDP_URL=http://localhost:3593
```

## Troubleshooting

### SignIn Component Not Showing
- Check browser console for errors
- Verify Clerk keys are valid
- Ensure at least one authentication method is enabled

### Redirect Issues
- The `forceRedirectUrl` in SignIn component should handle basePath
- Check middleware.ts is in `src/middleware.ts`

### Roles Not Appearing
- Check user's public metadata in Clerk Dashboard
- Verify webhook is receiving events
- Check webhook handler logs

### Session Timeout Not Working
- Verify session settings in Clerk Dashboard
- Check if "Stay logged in" is overriding timeout

## Next Steps

1. Test with a real GitHub account that belongs to IFLA teams
2. Monitor webhook logs to ensure role sync works
3. Set up production environment variables
4. Configure Clerk production instance with production URLs

---

For additional help, consult:
- [Clerk Documentation](https://clerk.com/docs)
- [Cerbos Documentation](https://docs.cerbos.dev)
- Your `apps/admin/src/lib/clerk-cerbos.ts` bridge implementation