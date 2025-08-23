'use client';

import React from 'react';
import { Typography } from 'antd';
import { ActionGrid, type ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

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
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>GitHub Integration</Title>
        <Text type="secondary">
          Manage GitHub repository and development workflow for {siteKey.toUpperCase()}
        </Text>
      </div>

      <ActionGrid actions={githubActions} />
    </div>
  );
}