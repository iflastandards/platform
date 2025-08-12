import { MockUser } from './mock-data/auth';

export interface User {
  publicMetadata: {
    iflaRole?: 'member' | 'staff' | 'admin';
    reviewGroupAdmin?: string[];
    externalContributor?: boolean;
  };
}

export function getDefaultDashboardRoute(
  user: User | MockUser,
  isDemo: boolean = false,
): string {
  const demoParam = isDemo ? '?demo=true' : '';

  // Super Admin - goes to super admin dashboard
  // Check both iflaRole and systemRole for compatibility
  if (user.publicMetadata.iflaRole === 'admin' || 
      (user.publicMetadata as any).systemRole === 'superadmin') {
    return `/dashboard/admin${demoParam}`;
  }

  // Review Group Admin - goes to RG dashboard
  if (user.publicMetadata.reviewGroupAdmin?.length) {
    return `/dashboard/rg${demoParam}`;
  }

  // Regular users - goes to regular dashboard
  return `/dashboard${demoParam}`;
}

export function validateRouteAccess(
  user: User | MockUser,
  route: string,
): { hasAccess: boolean; redirectTo?: string } {
  const userRole = user.publicMetadata.iflaRole;
  const systemRole = (user.publicMetadata as any).systemRole;
  const isReviewGroupAdmin = user.publicMetadata.reviewGroupAdmin?.length;

  // Route is already normalized since we run at root
  const normalizedRoute = route;

  // Super admin routes - check both iflaRole and systemRole
  if (normalizedRoute.startsWith('/dashboard/admin')) {
    if (userRole === 'admin' || systemRole === 'superadmin') {
      return { hasAccess: true };
    }
    return {
      hasAccess: false,
      redirectTo: getDefaultDashboardRoute(user),
    };
  }

  // Review group admin routes
  if (normalizedRoute.startsWith('/dashboard/rg')) {
    if (userRole === 'admin' || isReviewGroupAdmin) {
      return { hasAccess: true };
    }
    return {
      hasAccess: false,
      redirectTo: getDefaultDashboardRoute(user),
    };
  }

  // Regular dashboard routes - accessible to all authenticated users
  if (normalizedRoute.startsWith('/dashboard')) {
    return { hasAccess: true };
  }

  // Default - allow access
  return { hasAccess: true };
}
