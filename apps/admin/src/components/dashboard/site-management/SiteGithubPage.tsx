'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';
import { ActionGrid, ManagementAction } from './ActionGrid';

interface SiteGithubPageProps {
  siteKey: string;
}

const githubActions: ManagementAction[] = [
  {
    id: 'browse-repository',
    title: 'Browse Code',
    description: 'Explore repository files and history',
    type: 'external',
  },
  {
    id: 'view-issues',
    title: 'Open Issues',
    description: 'View and manage GitHub issues',
    type: 'external',
  },
  {
    id: 'manage-prs',
    title: 'Manage PRs',
    description: 'Review and manage pull requests',
    type: 'external',
  },
  {
    id: 'create-issue',
    title: 'Create Issue',
    description: 'Report bugs or request features',
    type: 'external',
  },
  {
    id: 'repository-stats',
    title: 'Repository Stats',
    description: 'View detailed repository analytics and metrics',
    type: 'internal',
  },
];

export function SiteGithubPage({ siteKey }: SiteGithubPageProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          GitHub Integration
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage GitHub repository and development workflow for {siteKey.toUpperCase()}
        </Typography>
      </Box>

      <ActionGrid actions={githubActions} />
    </Box>
  );
}