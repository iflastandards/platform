import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useAdminSession } from '@ifla/theme';

function DashboardContent() {
  const { isAuthenticated, username, loading, teams } = useAdminSession();

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
    return (
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <div className="card">
              <div className="card__body text--center">
                <h2>Welcome to NewTest Dashboard</h2>
                <p>Please log in to access the dashboard.</p>
                <a
                  href="http://localhost:3007/admin/auth/signin?callbackUrl=http://localhost:3008/newtest/dashboard"
                  className="button button--primary button--lg"
                >
                  Login with GitHub
                </a>
                {process.env.NODE_ENV === 'development' && (
                  <div className="margin-top--md">
                    <p className="text--center">
                      <small>Development mode:</small>
                    </p>
                    <a
                      href={`http://localhost:3007/admin/auth/signin?mockUser=${encodeURIComponent(JSON.stringify({
                        attributes: { name: 'jonphipps' },
                        roles: ['vercel-developer', 'newtest-admin']
                      }))}&callbackUrl=http://localhost:3008/newtest/dashboard`}
                      className="button button--secondary"
                    >
                      Mock Login (jonphipps from Vercel)
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated
  const isFromVercel = teams?.some(team => team.includes('vercel')) || false;
  const greeting = isFromVercel ? `Hello ${username} from Vercel` : `Hello ${username}`;

  return (
    <div className="container margin-vert--lg">
      <div className="row">
        <div className="col col--8 col--offset-2">
          <div className="card">
            <div className="card__body">
              <h2>{greeting}</h2>
              <p className="hero__subtitle">Welcome to the newtest namespace!</p>
              
              <div className="margin-top--lg">
                <h3>Your Teams:</h3>
                <ul>
                  {teams && teams.length > 0 ? (
                    teams.map((team, index) => (
                      <li key={index}>{team}</li>
                    ))
                  ) : (
                    <li>No teams assigned</li>
                  )}
                </ul>
              </div>

              <div className="margin-top--lg">
                <a
                  href="http://localhost:3007/admin/api/auth/signout?callbackUrl=http://localhost:3008/newtest/dashboard"
                  className="button button--secondary"
                >
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Layout
      title="Dashboard"
      description="NewTest Dashboard">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => <DashboardContent />}
      </BrowserOnly>
    </Layout>
  );
}
