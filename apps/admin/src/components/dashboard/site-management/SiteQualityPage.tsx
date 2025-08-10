'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';
import { ActionGrid, ManagementAction } from './ActionGrid';

interface SiteQualityPageProps {
  siteKey: string;
}

const qualityActions: ManagementAction[] = [
  {
    id: 'validate-links',
    title: 'Validate Links',
    description: 'Check all internal and external references',
    type: 'github-cli',
  },
  {
    id: 'check-consistency',
    title: 'Check Consistency',
    description: 'Validate terminology and cross-references',
    type: 'github-cli',
  },
  {
    id: 'accessibility-audit',
    title: 'Accessibility Audit',
    description: 'Verify WCAG compliance across all pages',
    type: 'github-cli',
  },
  {
    id: 'translation-check',
    title: 'Translation Status',
    description: 'Review multilingual content consistency',
    type: 'internal',
  },
  {
    id: 'performance-test',
    title: 'Performance Test',
    description: 'Check site speed and build performance',
    type: 'github-cli',
  },
];

export function SiteQualityPage({ siteKey }: SiteQualityPageProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Quality Assurance
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Ensure quality, consistency, and accessibility for {siteKey.toUpperCase()}
        </Typography>
      </Box>

      <ActionGrid actions={qualityActions} />
    </Box>
  );
}