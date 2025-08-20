'use client';

import React from 'react';
import { Typography } from 'antd';
import { ActionGrid, ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

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
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Elements</Title>
        <Text type="secondary">
          Manage element sets and definitions for {siteKey.toUpperCase()}
        </Text>
      </div>

      <ActionGrid actions={elementActions} />
    </div>
  );
}