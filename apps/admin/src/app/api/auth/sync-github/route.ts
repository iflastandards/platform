import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * Manual GitHub sync endpoint for updating user roles based on organization membership
 * This can be called when we need to update user permissions
 */
export async function POST(_request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find GitHub account
    const githubAccount = user.externalAccounts?.find(
      (account) => account.provider === 'github',
    );

    if (!githubAccount) {
      return NextResponse.json({ error: 'No GitHub account linked' }, { status: 400 });
    }

    // Known organization owners (manual list for now)
    const organizationOwners = [
      'jonphipps',
      'jphipps',
      // Add other known organization owners here
    ];

    const isOrgOwner = organizationOwners.includes(githubAccount.username || '');
    
    // Update user metadata
    const currentMetadata = (user.publicMetadata as Record<string, unknown>) || {};
    const updates: {
      publicMetadata: Record<string, unknown>;
      profileImageUrl?: string;
    } = {
      publicMetadata: {
        ...currentMetadata,
        githubUsername: githubAccount.username,
        githubId: githubAccount.id,
      }
    };

    // If user is an org owner, grant superadmin
    if (isOrgOwner) {
      updates.publicMetadata.systemRole = 'superadmin';
      updates.publicMetadata.iflaRole = 'admin';
    }

    // Update profile image from GitHub if not already set
    if (githubAccount.imageUrl && !user.imageUrl) {
      updates.profileImageUrl = githubAccount.imageUrl;
    }

    // Update the user
    const client = await clerkClient();
    await client.users.updateUser(user.id, updates);

    return NextResponse.json({
      success: true,
      data: {
        githubUsername: githubAccount.username,
        isOrgOwner,
        systemRole: isOrgOwner ? 'superadmin' : currentMetadata.systemRole,
      }
    });
  } catch (error) {
    console.error('Error syncing GitHub data:', error);
    return NextResponse.json(
      { error: 'Failed to sync GitHub data' },
      { status: 500 }
    );
  }
}