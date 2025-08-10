'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';
import { ActionGrid, ManagementAction } from './ActionGrid';

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
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Site Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configure settings, appearance, and deployment for {siteKey.toUpperCase()}
        </Typography>
      </Box>

      <ActionGrid actions={settingsActions} />
    </Box>
  );
}