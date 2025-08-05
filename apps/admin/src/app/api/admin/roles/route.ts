// apps/admin/src/app/api/admin/roles/route.ts
import { NextResponse } from 'next/server';
import { getAuthContext, canPerformAction } from '@/lib/authorization';
import { clerkClient } from '@clerk/nextjs/server';

// Type for user metadata updates
interface UpdatedMetadata {
  systemRole?: string;
  reviewGroups?: Array<{ reviewGroupId: string; role: string }>;
  teams?: Array<{
    teamId: string;
    role: string;
    reviewGroup: string;
    namespaces: string[];
  }>;
  translations?: Array<{
    language: string;
    namespaces: string[];
  }>;
  [key: string]: unknown;
}

export async function GET() {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return the user's structured roles
  return NextResponse.json({ 
    roles: authContext.roles,
    userId: authContext.userId,
    email: authContext.email
  });
}

export async function POST(request: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, role, reviewGroupId, namespaceId, teamId } = await request.json();

  // Validate required fields
  if (!userId || !role) {
    return NextResponse.json({ 
      error: 'Missing required fields: userId and role' 
    }, { status: 400 });
  }

  // Check if user can manage roles in the specified context
  let canAssignRole = false;
  
  if (reviewGroupId) {
    // Check if user can manage users in this review group
    canAssignRole = await canPerformAction('user', 'update', { reviewGroupId });
  } else if (authContext.roles.system === 'superadmin') {
    // Only superadmins can assign system-level roles
    canAssignRole = true;
  }

  if (!canAssignRole) {
    return NextResponse.json({ 
      error: 'Forbidden - You do not have permission to assign roles' 
    }, { status: 403 });
  }

  try {
    // Update user metadata in Clerk
    const clerk = await clerkClient();
    const targetUser = await clerk.users.getUser(userId);
    const currentMetadata = (targetUser.publicMetadata || {}) as Record<string, unknown>;
    
    // Build updated metadata based on role assignment
    let updatedMetadata: UpdatedMetadata = { ...currentMetadata };
    
    switch (role) {
      case 'rg_admin':
        if (!reviewGroupId) {
          return NextResponse.json({ 
            error: 'reviewGroupId required for Review Group Admin role' 
          }, { status: 400 });
        }
        
        // Add to review groups array
        if (!updatedMetadata.reviewGroups) {
          updatedMetadata.reviewGroups = [];
        }
        
        // Check if already assigned
        const existingRG = updatedMetadata.reviewGroups.find(
          (rg: { reviewGroupId: string; role: string }) => rg.reviewGroupId === reviewGroupId
        );
        
        if (!existingRG) {
          updatedMetadata.reviewGroups.push({
            reviewGroupId,
            role: 'admin'
          });
        }
        break;
        
      case 'ns_editor':
      case 'ns_author':
        if (!teamId || !reviewGroupId || !namespaceId) {
          return NextResponse.json({ 
            error: 'teamId, reviewGroupId, and namespaceId required for namespace roles' 
          }, { status: 400 });
        }
        
        // Add to teams array
        if (!updatedMetadata.teams) {
          updatedMetadata.teams = [];
        }
        
        // Update or add team membership
        const teamIndex = updatedMetadata.teams.findIndex(
          (t: { teamId: string }) => t.teamId === teamId
        );
        
        if (teamIndex >= 0) {
          // Update existing team membership
          updatedMetadata.teams[teamIndex].role = role === 'ns_editor' ? 'editor' : 'author';
          if (!updatedMetadata.teams[teamIndex].namespaces.includes(namespaceId)) {
            updatedMetadata.teams[teamIndex].namespaces.push(namespaceId);
          }
        } else {
          // Add new team membership
          updatedMetadata.teams.push({
            teamId,
            role: role === 'ns_editor' ? 'editor' : 'author',
            reviewGroup: reviewGroupId,
            namespaces: [namespaceId]
          });
        }
        break;
        
      case 'superadmin':
        if (authContext.roles.system !== 'superadmin') {
          return NextResponse.json({ 
            error: 'Only superadmins can assign superadmin role' 
          }, { status: 403 });
        }
        updatedMetadata.systemRole = 'superadmin';
        break;
        
      default:
        return NextResponse.json({ 
          error: `Unknown role: ${role}` 
        }, { status: 400 });
    }
    
    // Update user in Clerk
    await clerk.users.updateUser(userId, {
      publicMetadata: updatedMetadata
    });
    
    // Log the role assignment
    console.log(
      `User ${authContext.email} assigned role "${role}" to user "${userId}" ` +
      `in context: RG=${reviewGroupId}, NS=${namespaceId}, Team=${teamId}`
    );

    return NextResponse.json({ 
      success: true,
      message: `Role ${role} assigned successfully`,
      updatedMetadata
    });
    
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json({ 
      error: 'Failed to assign role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}