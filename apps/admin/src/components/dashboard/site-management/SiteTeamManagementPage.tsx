'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';
import { ActionGrid, ManagementAction } from './ActionGrid';

interface SiteTeamManagementPageProps {
  siteKey: string;
}

const teamActions: ManagementAction[] = [
  {
    id: 'manage-members',
    title: 'Manage Team Members',
    description: 'Add or remove contributors to this site',
    type: 'external',
  },
  {
    id: 'assign-roles',
    title: 'Assign Roles',
    description: 'Set reviewer and editor permissions for this site',
    type: 'external',
  },
  {
    id: 'view-activity',
    title: 'View Team Activity',
    description: 'Monitor contributions and recent changes',
    type: 'internal',
  },
  {
    id: 'team-settings',
    title: 'Team Settings',
    description: 'Configure team preferences and notifications',
    type: 'internal',
  },
];

export function SiteTeamManagementPage({ siteKey }: SiteTeamManagementPageProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Team Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage team members, roles, and permissions for {siteKey.toUpperCase()}
        </Typography>
      </Box>

      <ActionGrid actions={teamActions} />
    </Box>
  );
}