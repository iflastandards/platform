'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';
import { ActionGrid, ManagementAction } from './ActionGrid';

interface SiteElementsPageProps {
  siteKey: string;
}

const elementActions: ManagementAction[] = [
  {
    id: 'manage-elements',
    title: 'Manage Elements',
    description: 'Create, edit, and organize element definitions',
    type: 'internal',
  },
  {
    id: 'import-elements',
    title: 'Import Elements',
    description: 'Import element data from CSV or spreadsheet files',
    type: 'github-cli',
  },
  {
    id: 'export-elements',
    title: 'Export Elements',
    description: 'Export element data to various formats',
    type: 'github-cli',
  },
  {
    id: 'validate-elements',
    title: 'Validate Elements',
    description: 'Check element definitions for consistency and completeness',
    type: 'github-cli',
  },
];

export function SiteElementsPage({ siteKey }: SiteElementsPageProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Elements
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage element sets and definitions for {siteKey.toUpperCase()}
        </Typography>
      </Box>

      <ActionGrid actions={elementActions} />
    </Box>
  );
}