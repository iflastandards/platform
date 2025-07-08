import React from 'react';
import { useAdminSession } from '../../hooks/useAdminSession';
import { AdminDashboard } from './AdminDashboard';
import { LoginPrompt } from './LoginPrompt';

interface AdminRouterProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export function AdminRouter({ currentPath, navigate }: AdminRouterProps) {
  const { isAuthenticated, loading, username, teams } = useAdminSession();
  
  // Parse the current path
  const pathSegments = currentPath.split('/').filter(Boolean);
  const role = pathSegments[0] || 'dashboard';
  const namespace = pathSegments[1] || '';
  
  if (loading) {
    return (
      <div className="container margin-vert--lg">
        <div className="text--center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <LoginPrompt currentPath={currentPath} />;
  }
  
  // Route to appropriate component based on role and namespace
  return (
    <AdminDashboard 
      role={role}
      namespace={namespace}
      username={username}
      teams={teams}
      navigate={navigate}
    />
  );
}

export default AdminRouter;