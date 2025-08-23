'use client';

import React from 'react';
import { Typography } from 'antd';
import { ActionGrid, type ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

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
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quality Assurance</Title>
        <Text type="secondary">
          Ensure quality, consistency, and accessibility for {siteKey.toUpperCase()}
        </Text>
      </div>

      <ActionGrid actions={qualityActions} />
    </div>
  );
}