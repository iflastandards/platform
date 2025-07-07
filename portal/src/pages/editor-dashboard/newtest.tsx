import React from 'react';
import Layout from '@theme/Layout';
import { ProtectedRoute } from '@ifla/theme';
import { useAdminSession } from '@ifla/theme';
import Link from '@docusaurus/Link';
import styles from '../manage/styles.module.css';

const namespace = 'newtest';

function NewtestEditorDashboard() {
  const { username, teams } = useAdminSession();
  
  // Check if user has editor access to this namespace
  const hasEditorAccess = teams?.includes(`${namespace}-editor`) ||
                         teams?.includes(`${namespace}-admin`) || 
                         teams?.includes('system-admin') || 
                         teams?.includes('ifla-admin');

  if (!hasEditorAccess) {
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
          <h1>{namespace.toUpperCase()} Editor Dashboard</h1>
          <p className={styles.headerDescription}>
            Editing {namespace} content as {username}
          </p>
        </div>

        <div className="row">
          <div className="col col--6 margin-bottom--lg">
            <div className={styles.managementCard}>
              <h2>Content Editing</h2>
              <p>Edit documentation and vocabulary content</p>
              <div className={styles.actionGroup}>
                <button className="button button--primary">
                  Edit Content
                </button>
                <Link 
                  className="button button--secondary"
                  to={`/${namespace}/docs/intro`}>
                  View Docs
                </Link>
              </div>
            </div>
          </div>

          <div className="col col--6 margin-bottom--lg">
            <div className={styles.managementCard}>
              <h2>Data Conversion</h2>
              <p>Convert between Google Sheets, CSV, and RDF</p>
              <div className={styles.actionGroup}>
                <button className="button button--primary">
                  Sheets → RDF
                </button>
                <button className="button button--secondary">
                  RDF → CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Note about admin controls */}
        {teams?.includes(`${namespace}-admin`) && (
          <div className="row">
            <div className="col">
              <div className="alert alert--info" role="alert">
                You also have admin access. Visit the{' '}
                <Link to={`/admin-dashboard/${namespace}`}>Admin Dashboard</Link>{' '}
                for publishing and team management.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditorDashboardPage() {
  return (
    <Layout 
      title={`${namespace.toUpperCase()} Editor Dashboard`} 
      description={`Editor dashboard for ${namespace}`}>
      <ProtectedRoute>
        <NewtestEditorDashboard />
      </ProtectedRoute>
    </Layout>
  );
}