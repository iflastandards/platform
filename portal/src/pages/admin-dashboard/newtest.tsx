import React from 'react';
import Layout from '@theme/Layout';
import { ProtectedRoute } from '@ifla/theme';
import { useAdminSession } from '@ifla/theme';
import Link from '@docusaurus/Link';
import styles from '../manage/styles.module.css';

const namespace = 'newtest';

function NewtestAdminDashboard() {
  const { username, teams } = useAdminSession();
  
  // Check if user has admin access to this namespace
  const hasAdminAccess = teams?.includes(`${namespace}-admin`) || 
                        teams?.includes('system-admin') || 
                        teams?.includes('ifla-admin');

  if (!hasAdminAccess) {
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
          <h1>{namespace.toUpperCase()} Admin Dashboard</h1>
          <p className={styles.headerDescription}>
            Managing {namespace} as {username}
          </p>
        </div>

        <div className="row">
          <div className="col col--6 margin-bottom--lg">
            <div className={styles.managementCard}>
              <h2>Content Management</h2>
              <p>Manage documentation and vocabulary content</p>
              <div className={styles.actionGroup}>
                <button className="button button--primary">
                  Edit Content
                </button>
                <button className="button button--secondary">
                  Sheets → RDF
                </button>
              </div>
            </div>
          </div>

          <div className="col col--6 margin-bottom--lg">
            <div className={styles.managementCard}>
              <h2>Publishing</h2>
              <p>Review and publish vocabulary versions</p>
              <div className={styles.actionGroup}>
                <button className="button button--primary">
                  Publish Version
                </button>
                <Link 
                  className="button button--secondary"
                  to={`/reviewer-dashboard/${namespace}`}>
                  Review Changes
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col col--6 margin-bottom--lg">
            <div className={styles.managementCard}>
              <h2>Team Management</h2>
              <p>Manage editors, reviewers, and translators</p>
              <div className={styles.actionGroup}>
                <button className="button button--primary">
                  Manage Users
                </button>
                <button className="button button--secondary">
                  View Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Layout 
      title={`${namespace.toUpperCase()} Admin Dashboard`} 
      description={`Admin dashboard for ${namespace}`}>
      <ProtectedRoute>
        <NewtestAdminDashboard />
      </ProtectedRoute>
    </Layout>
  );
}