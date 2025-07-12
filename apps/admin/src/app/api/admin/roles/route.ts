// apps/admin/src/app/api/admin/roles/route.ts
import { NextResponse } from 'next/server';
import { getCerbosUser } from '@/lib/clerk-cerbos';
import cerbos from '@/lib/cerbos';

export async function GET() {
  const user = await getCerbosUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In a real application, you would fetch user roles from a database.
  // For now, we'll return the roles from the user object.
  return NextResponse.json({ roles: user.roles });
}

export async function POST(request: Request) {
  const user = await getCerbosUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, role, rg, site } = await request.json();

  const principal = {
    id: user.id,
    roles: user.roles || [],
    attributes: user.attributes || {},
  };

  const resource = {
    kind: 'user_admin',
    id: 'role_assignment',
    attributes: {
      scope: rg ? 'rg' : site ? 'site' : 'system',
      rg,
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
  console.log(
    `Assigning role "${role}" to user "${userId}" for ${rg || site || 'system'}`,
  );

  return NextResponse.json({ success: true });
}