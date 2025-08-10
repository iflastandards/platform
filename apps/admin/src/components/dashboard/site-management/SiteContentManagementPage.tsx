'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';
import { ActionGrid, ManagementAction } from './ActionGrid';

interface SiteContentManagementPageProps {
  siteKey: string;
}

const contentActions: ManagementAction[] = [
  {
    id: 'create-page',
    title: 'Create New Page',
    description: 'Add new documentation pages for elements, terms, or concepts',
    type: 'github-cli',
  },
  {
    id: 'scaffold-elements',
    title: 'Scaffold Element Pages',
    description: 'Generate element documentation from CSV data',
    type: 'github-cli',
  },
  {
    id: 'scaffold-vocabularies',
    title: 'Scaffold Vocabulary Pages',
    description: 'Generate value vocabulary pages from CSV data',
    type: 'github-cli',
  },
  {
    id: 'update-examples',
    title: 'Manage Examples',
    description: 'Add, edit, or organize usage examples',
    type: 'codespaces',
  },
  {
    id: 'organize-sidebar',
    title: 'Organize Navigation',
    description: 'Reorder sidebar structure and categorization',
    type: 'codespaces',
  },
];

export function SiteContentManagementPage({ siteKey }: SiteContentManagementPageProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Content Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage documentation content, pages, and site structure for {siteKey.toUpperCase()}
        </Typography>
      </Box>

      <ActionGrid actions={contentActions} />
    </Box>
  );
}