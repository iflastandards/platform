// apps/admin-portal/src/app/api/admin/roles/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import cerbos from '@/lib/cerbos';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In a real application, you would fetch user roles from a database.
  // For now, we'll return the roles from the session.
  return NextResponse.json({ roles: session.user.roles });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, role, namespace, site } = await request.json();

  const principal = {
    id: session.user.id,
    roles: session.user.roles || [],
    attributes: {
      // Add any other attributes needed for policy evaluation
    },
  };

  const resource = {
    kind: 'user_admin',
    id: 'role_assignment',
    attributes: {
      scope: namespace ? 'namespace' : site ? 'site' : 'system',
      namespace,
      site,
    },
  };

  const isAllowed = await cerbos.isAllowed({
    principal,
    resource,
    action: 'assign_roles',
  });

  if (!isAllowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // In a real application, you would save the role assignment to a database.
  console.log(`Assigning role "${role}" to user "${userId}" for ${namespace || site || 'system'}`);

  return NextResponse.json({ success: true });
}
