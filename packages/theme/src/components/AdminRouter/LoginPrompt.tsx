import React from 'react';
import { getAdminPortalConfigAuto } from '../../config/siteConfig';

interface LoginPromptProps {
  currentPath: string;
}

export function LoginPrompt({ currentPath }: LoginPromptProps) {
  const adminConfig = getAdminPortalConfigAuto();
  const returnUrl = `/admin/${currentPath}`.replace(/\/+/g, '/');
  const fullReturnUrl = `${window.location.origin}${returnUrl}`;
  
  return (
    <div className="container margin-vert--lg">
      <div className="row">
        <div className="col col--8 col--offset-2">
          <div className="card shadow--md">
            <div className="card__header text--center">
              <h1>IFLA Standards Administration</h1>
            </div>
            <div className="card__body text--center padding--lg">
              <p className="text--lg margin-bottom--md">
                Access to the administrative interface is restricted to authorized IFLA team members.
              </p>
              <p className="margin-bottom--lg">
                Please sign in with your GitHub account to continue. You must be a member of the 
                IFLA Standards GitHub organization to access this area.
              </p>
              <div className="margin-vert--lg">
                <a
                  href={`${adminConfig.signinUrl}?callbackUrl=${encodeURIComponent(fullReturnUrl)}`}
                  className="button button--primary button--lg button--block"
                  style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg
                    className="margin-right--sm"
                    style={{ width: '20px', height: '20px' }}
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  Login with GitHub
                </a>
              </div>
            </div>
            <div className="card__footer text--center">
              <p className="text--sm text--secondary margin-bottom--none">
                Having trouble? Contact the IFLA Standards team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}