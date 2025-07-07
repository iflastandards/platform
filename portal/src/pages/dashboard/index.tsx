import React from 'react';
import Layout from '@theme/Layout';
import { ProtectedRoute } from '@ifla/theme';
import { useAdminSession } from '@ifla/theme';
import Link from '@docusaurus/Link';
import styles from '../manage/styles.module.css';

const SITES = [
  {
    key: 'portal',
    title: 'IFLA Portal',
    description: 'Main portal site with management interface',
  },
  {
    key: 'ISBDM',
    title: 'ISBD Manifestation',
    description: 'ISBD Manifestation standard documentation',
  },
  {
    key: 'LRM',
    title: 'Library Reference Model',
    description: 'IFLA Library Reference Model',
  },
  {
    key: 'FRBR',
    title: 'FRBR',
    description: 'Functional Requirements for Bibliographic Records',
  },
  {
    key: 'isbd',
    title: 'ISBD',
    description: 'International Standard Bibliographic Description',
  },
  {
    key: 'muldicat',
    title: 'MulDiCat',
    description: 'Multilingual Dictionary of Cataloguing Terms',
  },
  {
    key: 'unimarc',
    title: 'UNIMARC',
    description: 'UNIMARC Format documentation',
  },
  {
    key: 'newtest',
    title: 'NewTest',
    description: 'Test site for development',
  },
];

function SuperAdminDashboard() {
  const { username, teams } = useAdminSession();
  
  // Check if user has superadmin access
  const isSuperAdmin = teams?.includes('system-admin') || teams?.includes('ifla-admin');

  return (
    <div className={styles.managementContainer}>
      <div className="container">
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <p className={styles.headerDescription}>
            Welcome, {username}! Manage all IFLA Standards sites from here.
          </p>
        </div>

        {isSuperAdmin && (
          <div className="row margin-bottom--lg">
            <div className="col">
              <div className={styles.managementCard}>
                <h2>System Administration</h2>
                <div className={styles.actionGroup}>
                  <Link className="button button--primary" to="/scaffold">
                    Create New Site
                  </Link>
                  <Link className="button button--secondary" to="/manage/users">
                    Manage Users
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col">
            <h2>Sites</h2>
          </div>
        </div>

        <div className="row">
          {SITES.map((site) => (
            <div key={site.key} className="col col--4 margin-bottom--lg">
              <div className={styles.managementCard}>
                <h3>{site.title}</h3>
                <p>{site.description}</p>
                <div className={styles.actionGroup}>
                  <Link
                    className="button button--primary button--sm"
                    to={`/admin-dashboard/${site.key.toLowerCase()}`}>
                    Manage
                  </Link>
                  <Link
                    className="button button--secondary button--sm"
                    to={`/${site.key}/`}>
                    View Site
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Layout title="Admin Dashboard" description="IFLA Standards Admin Dashboard">
      <ProtectedRoute requiredTeams={['system-admin', 'ifla-admin']}>
        <SuperAdminDashboard />
      </ProtectedRoute>
    </Layout>
  );
}