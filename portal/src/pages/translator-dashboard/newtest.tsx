import React from 'react';
import Layout from '@theme/Layout';
import { ProtectedRoute } from '@ifla/theme';
import { useAdminSession } from '@ifla/theme';
import styles from '../manage/styles.module.css';

const namespace = 'newtest';

function NewtestTranslatorDashboard() {
  const { username, teams } = useAdminSession();
  
  // Check if user has translator access to this namespace
  const hasTranslatorAccess = teams?.includes(`${namespace}-translator`) ||
                             teams?.includes(`${namespace}-admin`) || 
                             teams?.includes('system-admin') || 
                             teams?.includes('ifla-admin');

  if (!hasTranslatorAccess) {
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
          <h1>{namespace.toUpperCase()} Translator Dashboard</h1>
          <p className={styles.headerDescription}>
            Translating {namespace} content as {username}
          </p>
        </div>

        <div className="row">
          <div className="col col--6 margin-bottom--lg">
            <div className={styles.managementCard}>
              <h2>Translation Tasks</h2>
              <p>Manage translation assignments</p>
              <div className={styles.actionGroup}>
                <button className="button button--primary">
                  Translate Content
                </button>
                <button className="button button--secondary">
                  View Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TranslatorDashboardPage() {
  return (
    <Layout 
      title={`${namespace.toUpperCase()} Translator Dashboard`} 
      description={`Translator dashboard for ${namespace}`}>
      <ProtectedRoute>
        <NewtestTranslatorDashboard />
      </ProtectedRoute>
    </Layout>
  );
}