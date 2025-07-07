import React from 'react';
import Layout from '@theme/Layout';
import { ProtectedRoute } from '@ifla/theme';
import { useAdminSession } from '@ifla/theme';
import Link from '@docusaurus/Link';
import styles from '../manage/styles.module.css';

const namespace = 'newtest';

function NewtestReviewerDashboard() {
  const { username, teams } = useAdminSession();
  
  // Check if user has reviewer access to this namespace
  const hasReviewerAccess = teams?.includes(`${namespace}-reviewer`) ||
                           teams?.includes(`${namespace}-editor`) ||
                           teams?.includes(`${namespace}-admin`) || 
                           teams?.includes('system-admin') || 
                           teams?.includes('ifla-admin');

  if (!hasReviewerAccess) {
    return (
      <div className="container margin-vert--lg">
        <div className="alert alert--danger" role="alert">
          You don't have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.managementContainer}>
      <div className="container">
        <div className={styles.header}>
          <h1>{namespace.toUpperCase()} Reviewer Dashboard</h1>
          <p className={styles.headerDescription}>
            Reviewing {namespace} content as {username}
          </p>
        </div>

        <div className="row">
          <div className="col col--6 margin-bottom--lg">
            <div className={styles.managementCard}>
              <h2>Pull Requests</h2>
              <p>Review pending changes and updates</p>
              <div className={styles.actionGroup}>
                <button className="button button--primary">
                  View Pull Requests
                </button>
                <Link 
                  className="button button--secondary"
                  href={`https://github.com/iflastandards/standards-dev/pulls?q=is:pr+is:open+label:${namespace}`}>
                  GitHub PRs
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Note about editor controls */}
        {teams?.includes(`${namespace}-editor`) && (
          <div className="row">
            <div className="col">
              <div className="alert alert--info" role="alert">
                You also have editor access. Visit the{' '}
                <Link to={`/editor-dashboard/${namespace}`}>Editor Dashboard</Link>{' '}
                to make content changes.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewerDashboardPage() {
  return (
    <Layout 
      title={`${namespace.toUpperCase()} Reviewer Dashboard`} 
      description={`Reviewer dashboard for ${namespace}`}>
      <ProtectedRoute>
        <NewtestReviewerDashboard />
      </ProtectedRoute>
    </Layout>
  );
}