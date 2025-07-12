// apps/admin/src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getCerbosUser } from '@/lib/clerk-cerbos';
import cerbos from '@/lib/cerbos';

export async function GET() {
  const user = await getCerbosUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const principal = {
    id: user.id,
    roles: user.roles || [],
    attributes: user.attributes || {},
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