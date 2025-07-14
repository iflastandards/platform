import { MockUser } from './mock-data/auth';

export interface User {
  publicMetadata: {
    iflaRole?: 'member' | 'staff' | 'admin';
    reviewGroupAdmin?: string[];
    externalContributor?: boolean;
  };
}

export function getDefaultDashboardRoute(user: User | MockUser, isDemo: boolean = false): string {
  const demoParam = isDemo ? '?demo=true' : '';
  
  // Super Admin - goes to super admin dashboard
  if (user.publicMetadata.iflaRole === 'admin') {
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
  route: string
): { hasAccess: boolean; redirectTo?: string } {
  const userRole = user.publicMetadata.iflaRole;
  const isReviewGroupAdmin = user.publicMetadata.reviewGroupAdmin?.length;
  
  // Super admin routes
  if (route.startsWith('/dashboard/admin')) {
    if (userRole === 'admin') {
      return { hasAccess: true };
    }
    return { 
      hasAccess: false, 
      redirectTo: getDefaultDashboardRoute(user) 
    };
  }
  
  // Review group admin routes
  if (route.startsWith('/dashboard/rg')) {
    if (userRole === 'admin' || isReviewGroupAdmin) {
      return { hasAccess: true };
    }
    return { 
      hasAccess: false, 
      redirectTo: getDefaultDashboardRoute(user) 
    };
  }
  
  // Regular dashboard routes - accessible to all authenticated users
  if (route.startsWith('/dashboard')) {
    return { hasAccess: true };
  }
  
  // Default - allow access
  return { hasAccess: true };
}