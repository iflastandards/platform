// apps/admin-portal/src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import cerbos from '@/lib/cerbos';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const principal = {
    id: session.user.id,
    roles: session.user.roles,
    attributes: {
      // Add any other attributes needed for policy evaluation
    },
  };

  const resource = {
    kind: 'user_admin',
    id: 'user_listing',
    attributes: {
      scope: 'system', // This could be more granular
    },
  };

  const isAllowed = await cerbos.isAllowed({
    principal,
    resource,
    action: 'view_users',
  });

  if (!isAllowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // In a real application, you would fetch users from a database.
  // For now, we'll return a mock list.
  const users = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
  ];

  return NextResponse.json({ users });
}
