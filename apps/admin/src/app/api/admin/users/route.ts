// apps/admin/src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Implement proper role checking without Cerbos
  // For now, check if user has admin role in their metadata
  const userRoles = (user.publicMetadata?.roles as string[]) || [];
  const hasAccess = userRoles.includes('admin') || 
                   userRoles.includes('super-admin') || 
                   userRoles.includes('user-admin');

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  // In a real application, you would fetch users from a database.
  // For now, we'll return a mock list.
  const users = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
  ];

  return NextResponse.json({ users });
}