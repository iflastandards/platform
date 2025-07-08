import React, { useState, useEffect } from 'react';
import { getAdminPortalConfigAuto } from '../../../config/siteConfig';

interface ScaffoldFromSpreadsheetProps {
  namespace: string;
  navigate: (path: string) => void;
}

const NAMESPACE_INFO: Record<string, { name: string }> = {
  isbd: { name: 'ISBD' },
  lrm: { name: 'LRM' },
  fr: { name: 'FR' },
  muldicat: { name: 'MulDiCat' },
  unimarc: { name: 'UNIMARC' },
};

export function ScaffoldFromSpreadsheet({ namespace, navigate }: ScaffoldFromSpreadsheetProps) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'validating' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const adminConfig = getAdminPortalConfigAuto();
  const namespaceInfo = NAMESPACE_INFO[namespace] || { name: namespace.toUpperCase() };
  
  // Check for pending spreadsheet from GitHub issue
  useEffect(() => {
    // In a real implementation, this would fetch from the admin API
    // to check for any pending spreadsheet submissions via GitHub issues
    const checkPendingSpreadsheet = async () => {
      try {
        const response = await fetch(
          `${adminConfig.url}/api/admin/namespace/${namespace}/pending-spreadsheets`,
          { credentials: 'include' }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.spreadsheetUrl) {
            setSpreadsheetUrl(data.spreadsheetUrl);
          }
        }
      } catch (error) {
        console.error('Failed to check pending spreadsheets:', error);
      }
    };
    
    checkPendingSpreadsheet();
  }, [namespace, adminConfig.url]);
  
  const handleValidate = async () => {
    setStatus('validating');
    setErrorMessage('');
    
    // Simulate validation
    setTimeout(() => {
      setStatus('idle');
    }, 2000);
  };
  
  const handleScaffold = async () => {
    setLoading(true);
    setStatus('processing');
    setErrorMessage('');
    
    try {
      const response = await fetch(`${adminConfig.url}/api/actions/scaffold-from-spreadsheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          namespace,
          spreadsheetUrl,
        }),
      });
      
      if (response.ok) {
        setStatus('success');
        // Redirect after success
        setTimeout(() => navigate(`admin/${namespace}`), 3000);
      } else {
        const error = await response.json();
        setStatus('error');
        setErrorMessage(error.message || 'Scaffolding failed');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error: Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container margin-vert--lg">
      <div className="margin-bottom--lg">
        <button 
          className="button button--secondary"
          onClick={() => navigate(`admin/${namespace}`)}
        >
          ← Back to {namespaceInfo.name} Admin Dashboard
        </button>
      </div>
      
      <h1>Scaffold {namespaceInfo.name} from Spreadsheet</h1>
      <p className="text--lg margin-bottom--xl">
        Import vocabulary data from a Google Sheets spreadsheet to scaffold the {namespaceInfo.name} site.
      </p>
      
      <div className="row">
        <div className="col col--8 col--offset-2">
          <div className="card shadow--md">
            <div className="card__header">
              <h2>Import Configuration</h2>
            </div>
            <div className="card__body">
              <div className="margin-bottom--lg">
                <label htmlFor="spreadsheet-url" className="text--bold">
                  Google Sheets URL:
                </label>
                <input
                  id="spreadsheet-url"
                  type="url"
                  className="navbar__search-input margin-top--sm"
                  style={{ width: '100%' }}
                  value={spreadsheetUrl}
                  onChange={(e) => setSpreadsheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  disabled={loading}
                />
                <p className="text--sm text--secondary margin-top--sm">
                  Enter the URL of the Google Sheets document containing the vocabulary data.
                </p>
              </div>
              
              {status === 'validating' && (
                <div className="alert alert--info margin-bottom--md">
                  <div className="text--center">
                    <div className="loader margin-bottom--sm">Validating...</div>
                    <p>Checking spreadsheet format and data...</p>
                  </div>
                </div>
              )}
              
              {status === 'processing' && (
                <div className="alert alert--info margin-bottom--md">
                  <div className="text--center">
                    <div className="loader margin-bottom--sm">Processing...</div>
                    <p>Importing spreadsheet data... This may take a few minutes.</p>
                    <p className="text--sm">You'll be notified when the process completes.</p>
                  </div>
                </div>
              )}
              
              {status === 'success' && (
                <div className="alert alert--success margin-bottom--md">
                  <h3>✅ Scaffolding Complete!</h3>
                  <p>The vocabulary has been successfully imported and the site structure has been created.</p>
                  <p>Redirecting to dashboard...</p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="alert alert--danger margin-bottom--md">
                  <h3>❌ Scaffolding Failed</h3>
                  <p>{errorMessage}</p>
                  <p>Please check the spreadsheet format and try again.</p>
                </div>
              )}
              
              <div className="card margin-bottom--lg" style={{ backgroundColor: 'var(--ifm-color-emphasis-100)' }}>
                <div className="card__body">
                  <h4>Process Overview:</h4>
                  <ol>
                    <li>Spreadsheet is validated against DCTAP profile</li>
                    <li>Data is converted to CSV format</li>
                    <li>Element sets and pages are generated</li>
                    <li>Site structure is created in the repository</li>
                    <li>You'll be notified when complete</li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="card__footer">
              <div className="button-group button-group--block">
                <button
                  className="button button--secondary"
                  onClick={handleValidate}
                  disabled={!spreadsheetUrl || loading || status === 'processing'}
                >
                  Validate Spreadsheet
                </button>
                <button
                  className="button button--primary"
                  onClick={handleScaffold}
                  disabled={!spreadsheetUrl || loading}
                >
                  {loading ? 'Processing...' : 'Start Import'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="margin-top--lg text--center">
            <p className="text--sm text--secondary">
              Need help? Check the <a href="/docs/admin/importing-data">import documentation</a> or 
              contact the IFLA Standards team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScaffoldFromSpreadsheet;