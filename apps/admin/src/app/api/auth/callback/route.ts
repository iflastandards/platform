import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDefaultDashboardRoute } from '@/lib/auth-routing';

export async function GET(request: NextRequest) {
  // Get the authenticated user
  const user = await currentUser();
  
  if (!user) {
    // If no user, redirect to sign-in
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  const publicMetadata = user.publicMetadata as { 
    iflaRole?: 'member' | 'staff' | 'admin'; 
    reviewGroupAdmin?: string[];
    externalContributor?: boolean;
  };
  
  // Route user to appropriate dashboard based on their role
  const dashboardRoute = getDefaultDashboardRoute({ publicMetadata });
  return NextResponse.redirect(new URL(dashboardRoute, request.url));
}