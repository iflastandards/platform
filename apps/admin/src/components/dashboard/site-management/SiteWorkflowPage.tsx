'use client';

import React from 'react';
import { Typography } from 'antd';
import { ActionGrid, type ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

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
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Review & Workflow</Title>
        <Text type="secondary">
          Manage content review processes and workflow for {siteKey.toUpperCase()}
        </Text>
      </div>

      <ActionGrid actions={workflowActions} />
    </div>
  );
}