'use client';

import React from 'react';
import { Typography } from 'antd';
import { ActionGrid, ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

interface SiteSettingsPageProps {
  siteKey: string;
}

const settingsActions: ManagementAction[] = [
  {
    id: 'site-config',
    title: 'Site Configuration',
    description: 'Modify site settings and metadata',
    type: 'codespaces',
  },
  {
    id: 'navigation-config',
    title: 'Navigation Settings',
    description: 'Configure site navigation and menus',
    type: 'codespaces',
  },
  {
    id: 'theme-settings',
    title: 'Theme Configuration',
    description: 'Customize site appearance and branding',
    type: 'codespaces',
  },
  {
    id: 'deployment-config',
    title: 'Deployment Settings',
    description: 'Configure deployment and hosting options',
    type: 'internal',
  },
  {
    id: 'backup-restore',
    title: 'Backup & Restore',
    description: 'Manage site backups and restoration',
    type: 'github-cli',
  },
];

export function SiteSettingsPage({ siteKey }: SiteSettingsPageProps) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Site Settings</Title>
        <Text type="secondary">
          Configure settings, appearance, and deployment for {siteKey.toUpperCase()}
        </Text>
      </div>

      <ActionGrid actions={settingsActions} />
    </div>
  );
}