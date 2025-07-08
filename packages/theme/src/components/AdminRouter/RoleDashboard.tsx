import React from 'react';

interface RoleDashboardProps {
  role: string;
  namespace: string;
  navigate: (path: string) => void;
}

// Define actions based on role
const ROLE_ACTIONS: Record<string, Array<{ id: string; label: string; icon: string; description: string }>> = {
  admin: [
    { 
      id: 'scaffold-from-spreadsheet', 
      label: 'Import from Spreadsheet', 
      icon: '📊',
      description: 'Import vocabulary data from Google Sheets' 
    },
    { 
      id: 'manage-team', 
      label: 'Manage Team', 
      icon: '👥',
      description: 'Add or remove team members' 
    },
    { 
      id: 'configure-site', 
      label: 'Site Configuration', 
      icon: '⚙️',
      description: 'Configure site settings and metadata' 
    },
    {
      id: 'publish-release',
      label: 'Publish Release',
      icon: '🚀',
      description: 'Publish a new version of the standard'
    },
  ],
  editor: [
    { 
      id: 'edit-content', 
      label: 'Edit Content', 
      icon: '✏️',
      description: 'Edit documentation and vocabulary' 
    },
    { 
      id: 'import-data', 
      label: 'Import Data', 
      icon: '📥',
      description: 'Import vocabulary from various formats' 
    },
    { 
      id: 'export-rdf', 
      label: 'Export RDF', 
      icon: '📤',
      description: 'Export vocabulary as RDF/Turtle' 
    },
    { 
      id: 'manage-translations', 
      label: 'Translations', 
      icon: '🌍',
      description: 'Manage multilingual content' 
    },
  ],
  reviewer: [
    { 
      id: 'review-changes', 
      label: 'Review Changes', 
      icon: '👁️',
      description: 'Review pending changes and PRs' 
    },
    { 
      id: 'manage-issues', 
      label: 'Manage Issues', 
      icon: '📝',
      description: 'Track and respond to GitHub issues' 
    },
    {
      id: 'approve-release',
      label: 'Approve Release',
      icon: '✅',
      description: 'Review and approve releases'
    },
  ],
  translator: [
    { 
      id: 'translate-content', 
      label: 'Translate Content', 
      icon: '🌐',
      description: 'Translate documentation and terms' 
    },
    { 
      id: 'review-translations', 
      label: 'Review Translations', 
      icon: '✅',
      description: 'Review and approve translations' 
    },
    {
      id: 'glossary-management',
      label: 'Manage Glossary',
      icon: '📖',
      description: 'Maintain translation glossary'
    },
  ],
};

const NAMESPACE_INFO: Record<string, { name: string }> = {
  isbd: { name: 'ISBD' },
  lrm: { name: 'LRM' },
  fr: { name: 'FR' },
  muldicat: { name: 'MulDiCat' },
  unimarc: { name: 'UNIMARC' },
};

export function RoleDashboard({ role, namespace, navigate }: RoleDashboardProps) {
  const actions = ROLE_ACTIONS[role] || [];
  const namespaceInfo = NAMESPACE_INFO[namespace] || { name: namespace.toUpperCase() };
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  
  return (
    <div className="container margin-vert--lg">
      <div className="margin-bottom--lg">
        <button 
          className="button button--secondary"
          onClick={() => navigate('dashboard')}
        >
          ← Back to Namespaces
        </button>
      </div>
      
      <div className="margin-bottom--xl">
        <h1>{namespaceInfo.name} - {roleLabel} Dashboard</h1>
        <p className="text--lg">Manage {namespaceInfo.name} as {roleLabel}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="row margin-bottom--xl">
        <div className="col col--4">
          <div className="card shadow--lw">
            <div className="card__body text--center">
              <h3>📊 Progress</h3>
              <div className="margin-vert--md">
                <div className="text--bold text--primary" style={{ fontSize: '2rem' }}>
                  75%
                </div>
                <p className="margin-top--sm">Complete</p>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'var(--ifm-color-emphasis-200)', 
                borderRadius: '4px',
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  width: '75%', 
                  height: '100%', 
                  backgroundColor: 'var(--ifm-color-primary)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col col--4">
          <div className="card shadow--lw">
            <div className="card__body text--center">
              <h3>🔔 New Issues</h3>
              <div className="margin-vert--md">
                <div className="text--bold text--warning" style={{ fontSize: '2rem' }}>
                  3
                </div>
                <p className="margin-top--sm">Pending Review</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col col--4">
          <div className="card shadow--lw">
            <div className="card__body text--center">
              <h3>👥 Team Members</h3>
              <div className="margin-vert--md">
                <div className="text--bold text--success" style={{ fontSize: '2rem' }}>
                  12
                </div>
                <p className="margin-top--sm">Active Contributors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Cards */}
      <h2 className="margin-bottom--lg">Quick Actions</h2>
      <div className="row">
        {actions.map(action => (
          <div key={action.id} className="col col--4 margin-bottom--lg">
            <div 
              className="card shadow--lw clickable-card h-100"
              onClick={() => navigate(`../${action.id}/${namespace}`)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="card__header">
                <h3 className="margin-bottom--none">
                  <span className="margin-right--sm" style={{ fontSize: '1.5rem' }}>
                    {action.icon}
                  </span>
                  {action.label}
                </h3>
              </div>
              <div className="card__body">
                <p>{action.description}</p>
              </div>
              <div className="card__footer">
                <span className="text--primary">Click to proceed →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="margin-top--xl">
        <h2>Recent Activity</h2>
        <div className="card shadow--lw">
          <div className="card__body">
            <ul className="clean-list">
              <li className="padding-vert--sm">
                <strong>2 hours ago:</strong> New vocabulary terms added by @editor1
              </li>
              <li className="padding-vert--sm">
                <strong>5 hours ago:</strong> Translation review completed for French
              </li>
              <li className="padding-vert--sm">
                <strong>1 day ago:</strong> Issue #45 resolved and closed
              </li>
              <li className="padding-vert--sm">
                <strong>2 days ago:</strong> New team member @translator2 joined
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleDashboard;