import React from 'react';
import { getAdminPortalConfigAuto } from '../../config/siteConfig';

interface AdminDashboardProps {
  role: string;
  namespace: string;
  username?: string;
  teams?: string[];
  navigate: (path: string) => void;
}

export function AdminDashboard({ role, namespace, username, teams, navigate }: AdminDashboardProps) {
  const adminConfig = getAdminPortalConfigAuto();
  
  // Determine greeting based on namespace
  const getGreeting = () => {
    if (namespace) {
      return `Hello from ${namespace} dashboard!`;
    }
    return 'Welcome to the Admin Dashboard';
  };
  
  // Determine which dashboard to show based on role
  const getDashboardTitle = () => {
    if (role === 'dashboard' && namespace) {
      return `${namespace.toUpperCase()} Admin Dashboard`;
    }
    switch (role) {
      case 'editor':
        return `${namespace.toUpperCase()} Editor Dashboard`;
      case 'reviewer':
        return `${namespace.toUpperCase()} Reviewer Dashboard`;
      case 'translator':
        return `${namespace.toUpperCase()} Translator Dashboard`;
      default:
        return 'Admin Dashboard';
    }
  };
  
  return (
    <div className="container margin-vert--lg">
      <div className="row">
        <div className="col col--10 col--offset-1">
          {/* Greeting for namespace */}
          {namespace && (
            <div className="alert alert--success margin-bottom--lg" role="alert">
              <strong>{getGreeting()}</strong>
            </div>
          )}
          
          <div className="card">
            <div className="card__header">
              <h2>{getDashboardTitle()}</h2>
            </div>
            <div className="card__body">
              <p className="margin-bottom--md">
                Welcome, <strong>{username || 'User'}</strong>!
              </p>
              
              {teams && teams.length > 0 && (
                <div className="margin-bottom--lg">
                  <h4>Your Teams:</h4>
                  <ul>
                    {teams.map((team, index) => (
                      <li key={index}>{team}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Navigation Examples */}
              <div className="margin-top--lg">
                <h3>Quick Navigation</h3>
                <div className="button-group button-group--block margin-bottom--md">
                  <button 
                    className="button button--secondary"
                    onClick={() => navigate('dashboard/newtest')}
                  >
                    NewTest Dashboard
                  </button>
                  <button 
                    className="button button--secondary"
                    onClick={() => navigate('dashboard/isbd')}
                  >
                    ISBD Dashboard
                  </button>
                  <button 
                    className="button button--secondary"
                    onClick={() => navigate('editor/newtest')}
                  >
                    NewTest Editor
                  </button>
                  <button 
                    className="button button--secondary"
                    onClick={() => navigate('reviewer/isbd')}
                  >
                    ISBD Reviewer
                  </button>
                </div>
              </div>
              
              {/* Sign out */}
              <div className="margin-top--lg">
                <a
                  href={`${adminConfig.signoutUrl}?callbackUrl=${window.location.origin}/admin`}
                  className="button button--secondary"
                >
                  Sign Out
                </a>
              </div>
            </div>
          </div>
          
          {/* Role-specific content */}
          {role === 'editor' && (
            <div className="card margin-top--lg">
              <div className="card__header">
                <h3>Editor Tools</h3>
              </div>
              <div className="card__body">
                <p>Content editing tools for {namespace} would appear here.</p>
              </div>
            </div>
          )}
          
          {role === 'reviewer' && (
            <div className="card margin-top--lg">
              <div className="card__header">
                <h3>Review Tools</h3>
              </div>
              <div className="card__body">
                <p>Review and approval tools for {namespace} would appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}