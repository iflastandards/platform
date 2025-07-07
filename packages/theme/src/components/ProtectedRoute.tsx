import React from 'react';
import { useAdminSession } from '../hooks/useAdminSession';
import { getAdminPortalConfigAuto } from '../config/siteConfig';
import BrowserOnly from '@docusaurus/BrowserOnly';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredTeams?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredTeams = [],
}) => {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => <ProtectedRouteClient {...{ children, requiredRoles, requiredTeams }} />}
    </BrowserOnly>
  );
};

const ProtectedRouteClient: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredTeams = [],
}) => {
  const { isAuthenticated, teams, loading } = useAdminSession();

  if (loading) {
    return (
      <div className="container margin-vert--lg">
        <div className="text--center">
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      const adminConfig = getAdminPortalConfigAuto();
      window.location.href = `${adminConfig.signinUrl}?returnUrl=${encodeURIComponent(window.location.pathname)}`;
    }
    return null;
  }

  // Check role/team access
  const hasRequiredAccess = 
    (requiredRoles.length === 0 && requiredTeams.length === 0) ||
    requiredRoles.some(role => teams?.includes(role)) ||
    requiredTeams.some(team => teams?.includes(team));

  if (!hasRequiredAccess) {
    return (
      <div className="container margin-vert--lg">
        <div className="alert alert--danger" role="alert">
          You don't have permission to access this page.
        </div>
      </div>
    );
  }

  return <>{children}</>;
};