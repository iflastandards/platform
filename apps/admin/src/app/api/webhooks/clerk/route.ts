import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { checkIflaOrganizationOwnership } from '@/lib/github-integration';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return new Response('Server configuration error', { status: 500 });
  }

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook events
  const eventType = evt.type;
  console.log(`Webhook received: ${eventType}`);

  // Handle user sign-in and creation events
  if (eventType === 'user.created' || eventType === 'session.created') {
    const { id: userId } = evt.data;
    
    try {
      // Get the full user object
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      // Check for superadmin email
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (email === 'superadmin+clerk_test@example.com') {
        console.log('Superadmin email detected, granting superadmin status');
        await client.users.updateUser(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            systemRole: 'superadmin',
            iflaRole: 'admin',
            roles: ['superadmin'],
            reviewGroups: [],
            isReviewGroupAdmin: true,
          },
        });
        return NextResponse.json({ message: 'Superadmin status granted' });
      }
      
      // Check for GitHub account
      const githubAccount = user.externalAccounts?.find(
        (account: any) => account.provider === 'oauth_github'
      );
      
      if (githubAccount) {
        console.log(`GitHub account found for user ${userId}: ${githubAccount.username}`);
        
        // Check if we have an access token (only available during initial OAuth)
        const accessToken = (githubAccount as any).accessToken;
        
        let isOrgOwner = false;
        
        if (accessToken) {
          // We have a token, check GitHub API directly with user's token
          isOrgOwner = await checkIflaOrganizationOwnership(accessToken);
          console.log(`GitHub API check with user token - is org owner: ${isOrgOwner}`);
        } else {
          // No user token available, use the better org check with app token
          const { isOrganizationOwner } = await import('@/lib/github-org-check');
          isOrgOwner = await isOrganizationOwner(githubAccount.username || '');
          console.log(`GitHub org check with app token - is org owner: ${isOrgOwner}`);
        }
        
        // Update user metadata
        const currentMetadata = (user.publicMetadata as Record<string, unknown>) || {};
        const updateData: any = {
          publicMetadata: {
            ...currentMetadata,
            githubUsername: githubAccount.username,
            githubId: githubAccount.id,
          },
        };
        
        // If user is an org owner, grant superadmin
        if (isOrgOwner) {
          console.log(`Granting superadmin status to GitHub org owner: ${githubAccount.username}`);
          updateData.publicMetadata.systemRole = 'superadmin';
          updateData.publicMetadata.iflaRole = 'admin';
          updateData.publicMetadata.roles = ['superadmin'];
          updateData.publicMetadata.isIflaOrgOwner = true;
        }
        
        // Update profile image from GitHub if not already set
        if (githubAccount.imageUrl && !user.imageUrl) {
          updateData.profileImageUrl = githubAccount.imageUrl;
        }
        
        // Update the user
        await client.users.updateUser(userId, updateData);
        
        console.log('User metadata updated successfully');
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Don't fail the webhook, just log the error
    }
  }

  return NextResponse.json({ message: 'Webhook processed' });
}