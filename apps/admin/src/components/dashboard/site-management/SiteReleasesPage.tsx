'use client';

import React from 'react';
import { Typography } from 'antd';
import { ActionGrid, type ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

interface SiteReleasesPageProps {
  siteKey: string;
}

const releaseActions: ManagementAction[] = [
  {
    id: 'create-release',
    title: 'Create Release Candidate',
    description: 'Package content for testing and review',
    type: 'github-cli',
  },
  {
    id: 'release-notes',
    title: 'Generate Release Notes',
    description: 'Document changes and updates for this release',
    type: 'codespaces',
  },
  {
    id: 'export-pdf',
    title: 'Export PDF',
    description: 'Generate downloadable PDF documentation',
    type: 'github-cli',
  },
  {
    id: 'tag-release',
    title: 'Tag Stable Release',
    description: 'Mark and publish a stable version',
    type: 'github-cli',
  },
  {
    id: 'deploy-production',
    title: 'Deploy to Production',
    description: 'Publish approved release to live site',
    type: 'github-cli',
  },
];

export function SiteReleasesPage({ siteKey }: SiteReleasesPageProps) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Releases & Publishing</Title>
        <Text type="secondary">
          Manage releases, publishing, and deployment for {siteKey.toUpperCase()}
        </Text>
      </div>

      <ActionGrid actions={releaseActions} />
    </div>
  );
}