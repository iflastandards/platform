'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';
import { ActionGrid, ManagementAction } from './ActionGrid';

interface SiteWorkflowPageProps {
  siteKey: string;
}

const workflowActions: ManagementAction[] = [
  {
    id: 'review-queue',
    title: 'Review Queue',
    description: 'View and manage pending content reviews',
    type: 'internal',
  },
  {
    id: 'assign-reviewers',
    title: 'Assign Reviewers',
    description: 'Assign team members to review specific content',
    type: 'internal',
  },
  {
    id: 'track-deadlines',
    title: 'Track Deadlines',
    description: 'Monitor review timelines and upcoming deadlines',
    type: 'internal',
  },
  {
    id: 'workflow-status',
    title: 'Content Status',
    description: 'View what content is in each workflow stage',
    type: 'internal',
  },
  {
    id: 'merge-approved',
    title: 'Merge Approved Changes',
    description: 'Integrate reviewed and approved content',
    type: 'github-cli',
  },
];

export function SiteWorkflowPage({ siteKey }: SiteWorkflowPageProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Review & Workflow
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage content review processes and workflow for {siteKey.toUpperCase()}
        </Typography>
      </Box>

      <ActionGrid actions={workflowActions} />
    </Box>
  );
}