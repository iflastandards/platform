import React from 'react';

interface NamespaceSelectionProps {
  username: string;
  teams: string[];
  navigate: (path: string) => void;
}

// Map of namespace keys to full names and descriptions
const NAMESPACE_INFO: Record<string, { name: string; description: string }> = {
  isbd: { 
    name: 'ISBD', 
    description: 'International Standard Bibliographic Description' 
  },
  lrm: { 
    name: 'LRM', 
    description: 'Library Reference Model' 
  },
  fr: { 
    name: 'FR', 
    description: 'Functional Requirements (FRBR)' 
  },
  muldicat: { 
    name: 'MulDiCat', 
    description: 'Multilingual Dictionary of Cataloguing' 
  },
  unimarc: { 
    name: 'UNIMARC', 
    description: 'Universal MARC Format' 
  },
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  editor: 'Editor',
  reviewer: 'Reviewer',
  translator: 'Translator',
};

export function NamespaceSelection({ username, teams, navigate }: NamespaceSelectionProps) {
  // Parse teams to extract namespaces and roles
  const namespaceRoles = teams.reduce((acc, team) => {
    // Teams are formatted as "namespace-role" (e.g., "isbd-admin", "lrm-reviewer")
    const match = team.match(/^(\w+)-(admin|editor|reviewer|translator)$/);
    if (match) {
      const [, namespace, role] = match;
      if (!acc[namespace]) acc[namespace] = [];
      acc[namespace].push(role);
    }
    return acc;
  }, {} as Record<string, string[]>);
  
  const isSuperAdmin = teams.includes('system-admin') || teams.includes('ifla-admin');
  
  return (
    <div className="container margin-vert--lg">
      <div className="text--center margin-bottom--xl">
        <h1>Welcome to IFLA Standards Administration</h1>
        <p className="text--lg">Hello, {username}!</p>
      </div>
      
      {isSuperAdmin && (
        <div className="card margin-bottom--xl shadow--md">
          <div className="card__header">
            <h2>System Administration</h2>
          </div>
          <div className="card__body">
            <p>You have system administrator access to manage all namespaces and settings.</p>
            <button 
              className="button button--primary button--lg margin-top--md"
              onClick={() => navigate('admin/system')}
            >
              Open System Admin Dashboard
            </button>
          </div>
        </div>
      )}
      
      {Object.keys(namespaceRoles).length > 0 && (
        <>
          <h2 className="margin-bottom--lg">Your Namespace Access</h2>
          <div className="row">
            {Object.entries(namespaceRoles).map(([namespace, roles]) => {
              const info = NAMESPACE_INFO[namespace] || { 
                name: namespace.toUpperCase(), 
                description: `${namespace} namespace` 
              };
              
              return (
                <div key={namespace} className="col col--4 margin-bottom--lg">
                  <div className="card shadow--lw h-100">
                    <div className="card__header">
                      <h3>{info.name}</h3>
                    </div>
                    <div className="card__body">
                      <p className="margin-bottom--md">{info.description}</p>
                      <p className="text--bold margin-bottom--md">Your roles:</p>
                      <div className="button-group button-group--block">
                        {roles.map(role => (
                          <button
                            key={role}
                            className="button button--secondary button--block margin-bottom--sm"
                            onClick={() => navigate(`${role}/${namespace}`)}
                          >
                            <span className="text--truncate">
                              Open as {ROLE_LABELS[role] || role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {!isSuperAdmin && Object.keys(namespaceRoles).length === 0 && (
        <div className="alert alert--warning margin-vert--lg">
          <p>
            You don't have access to any namespaces yet. Please contact an administrator 
            to request access.
          </p>
        </div>
      )}
    </div>
  );
}

export default NamespaceSelection;