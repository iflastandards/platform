// apps/admin/src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/withAuth';

export const GET = withAuth(
  async (req: AuthenticatedRequest) => {
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const reviewGroupId = searchParams.get('reviewGroupId');

    // In a real application, you would fetch users from a database
    // filtered by the user's accessible review groups/namespaces
    const users = [
      { 
        id: '1', 
        name: 'Alice Johnson', 
        email: 'alice@example.com',
        reviewGroups: ['icp'],
        roles: ['ns_editor']
      },
      { 
        id: '2', 
        name: 'Bob Smith', 
        email: 'bob@example.com',
        reviewGroups: ['bcm'],
        roles: ['ns_translator']
      },
    ];

    // Filter users based on user's access
    let filteredUsers = users;
    
    // If not superadmin, filter to accessible review groups
    if (req.auth.roles.system !== 'superadmin') {
      const accessibleRGs = req.auth.roles.reviewGroups.map((rg: { reviewGroupId: string }) => rg.reviewGroupId);
      filteredUsers = users.filter(user => 
        user.reviewGroups.some(rg => accessibleRGs.includes(rg))
      );
    }

    // Apply review group filter if specified
    if (reviewGroupId) {
      filteredUsers = filteredUsers.filter(user => 
        user.reviewGroups.includes(reviewGroupId)
      );
    }

    return NextResponse.json({ 
      users: filteredUsers,
      totalCount: filteredUsers.length 
    });
  },
  {
    resourceType: 'user',
    action: 'read',
    getResourceAttributes: (req) => {
      const { searchParams } = new URL(req.url);
      const reviewGroupId = searchParams.get('reviewGroupId');
      return reviewGroupId ? { reviewGroupId } : {};
    }
  }
);