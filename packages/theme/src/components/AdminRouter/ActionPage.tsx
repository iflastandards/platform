import React from 'react';
import { ScaffoldFromSpreadsheet } from './actions/ScaffoldFromSpreadsheet';

interface ActionPageProps {
  action: string;
  namespace: string;
  navigate: (path: string) => void;
}

export function ActionPage({ action, namespace, navigate }: ActionPageProps) {
  // Route to specific action components based on action
  switch (action) {
    case 'scaffold-from-spreadsheet':
      return <ScaffoldFromSpreadsheet namespace={namespace} navigate={navigate} />;
    
    case 'manage-team':
      return (
        <div className="container margin-vert--lg">
          <h1>Manage Team for {namespace.toUpperCase()}</h1>
          <p>Team management functionality coming soon...</p>
          <button 
            className="button button--secondary"
            onClick={() => navigate(`admin/${namespace}`)}
          >
            Back to Dashboard
          </button>
        </div>
      );
    
    case 'import-data':
      return (
        <div className="container margin-vert--lg">
          <h1>Import Data for {namespace.toUpperCase()}</h1>
          <p>Data import functionality coming soon...</p>
          <button 
            className="button button--secondary"
            onClick={() => navigate(`editor/${namespace}`)}
          >
            Back to Dashboard
          </button>
        </div>
      );
    
    case 'export-rdf':
      return (
        <div className="container margin-vert--lg">
          <h1>Export RDF for {namespace.toUpperCase()}</h1>
          <p>RDF export functionality coming soon...</p>
          <button 
            className="button button--secondary"
            onClick={() => navigate(`editor/${namespace}`)}
          >
            Back to Dashboard
          </button>
        </div>
      );
    
    default:
      return (
        <div className="container margin-vert--lg">
          <h1>Unknown Action: {action}</h1>
          <p>The requested action "{action}" is not recognized.</p>
          <button 
            className="button button--secondary"
            onClick={() => navigate('dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      );
  }
}

export default ActionPage;