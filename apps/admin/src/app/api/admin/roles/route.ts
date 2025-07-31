// apps/admin/src/app/api/admin/roles/route.ts
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In a real application, you would fetch user roles from a database.
  // For now, we'll return the roles from the user's metadata if available.
  const roles = user.publicMetadata?.roles || [];
  return NextResponse.json({ roles });
}

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, role, rg, site } = await request.json();

  // TODO: Implement proper role checking without Cerbos
  // For now, check if user has admin role in their metadata
  const userRoles = (user.publicMetadata?.roles as string[]) || [];
  const isAdmin = userRoles.includes('admin') || userRoles.includes('super-admin');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  // In a real application, you would save the role assignment to a database.
  console.log(
    `Assigning role "${role}" to user "${userId}" for ${rg || site || 'system'}`,
  );

  return NextResponse.json({ success: true });
}