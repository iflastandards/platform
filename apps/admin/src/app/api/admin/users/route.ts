// apps/admin/src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { canPerformAction, getAuthContext } from '@/lib/authorization';

export async function GET(request: Request) {
  // Get query parameters for filtering
  const { searchParams } = new URL(request.url);
  const reviewGroupId = searchParams.get('reviewGroupId');
  
  // Check authorization
  const authContext = await getAuthContext();
  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user can list users (with optional review group context)
  const canList = await canPerformAction('user', 'read', reviewGroupId ? { reviewGroupId } : undefined);
  
  if (!canList) {
    return NextResponse.json({ 
      error: 'Forbidden - You do not have permission to view users' 
    }, { status: 403 });
  }

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
  if (authContext.roles.system !== 'superadmin') {
    const accessibleRGs = authContext.roles.reviewGroups.map(rg => rg.reviewGroupId);
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
}