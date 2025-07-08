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
          <div className="card">
            <div className="card__body text--center">
              <h2>Admin Dashboard Login</h2>
              <p>Please log in to access the admin dashboard.</p>
              <a
                href={`${adminConfig.signinUrl}?callbackUrl=${encodeURIComponent(fullReturnUrl)}`}
                className="button button--primary button--lg"
              >
                Login with GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}