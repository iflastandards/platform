import React from 'react';
import { useAdminSession } from '../../hooks/useAdminSession';
import { LoginPrompt } from './LoginPrompt';
import { NamespaceSelection } from './NamespaceSelection';
import { RoleDashboard } from './RoleDashboard';
import { ActionPage } from './ActionPage';
import './AdminRouter.css';

interface AdminRouterProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export function AdminRouter({ currentPath, navigate }: AdminRouterProps) {
  const { isAuthenticated, loading, username = '', teams = [] } = useAdminSession();
  
  // Parse the current path
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  // Handle loading state
  if (loading) {
    return (
      <div className="container margin-vert--lg">
        <div className="text--center">
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }
  
  // Route patterns:
  // /admin/login - Show login page
  // /admin/dashboard - Show namespace selection  
  // /admin/[role]/[namespace] - Show role-based dashboard
  // /admin/[action]/[namespace] - Show action page
  
  // Handle login route explicitly
  if (pathSegments[0] === 'login' || !isAuthenticated) {
    return <LoginPrompt currentPath={currentPath.replace(/^login\/?/, '')} />;
  }
  
  // At this point, user is authenticated
  
  // Handle dashboard/namespace selection
  if (!pathSegments.length || pathSegments[0] === 'dashboard') {
    return (
      <NamespaceSelection
        username={username}
        teams={teams}
        navigate={navigate}
      />
    );
  }
  
  // Check if first segment is a role
  const roles = ['admin', 'editor', 'reviewer', 'translator'];
  if (roles.includes(pathSegments[0])) {
    const role = pathSegments[0];
    const namespace = pathSegments[1] || '';
    
    if (!namespace) {
      // If no namespace specified, go back to dashboard
      return (
        <NamespaceSelection
          username={username}
          teams={teams}
          navigate={navigate}
        />
      );
    }
    
    return (
      <RoleDashboard
        role={role}
        namespace={namespace}
        navigate={navigate}
      />
    );
  }
  
  // Otherwise it's an action
  const action = pathSegments[0];
  const namespace = pathSegments[1] || '';
  
  return (
    <ActionPage
      action={action}
      namespace={namespace}
      navigate={navigate}
    />
  );
}

export default AdminRouter;