'use client';

import React from 'react';
import { Typography } from 'antd';
import { ActionGrid, type ManagementAction } from './ActionGrid';

const { Title, Text } = Typography;

interface SiteTeamManagementPageProps {
  siteKey: string;
}

const teamActions: ManagementAction[] = [
  {
    id: 'manage-members',
    title: 'Manage Team Members',
    description: 'Add or remove contributors to this site',
    type: 'external',
  },
  {
    id: 'assign-roles',
    title: 'Assign Roles',
    description: 'Set reviewer and editor permissions for this site',
    type: 'external',
  },
  {
    id: 'view-activity',
    title: 'View Team Activity',
    description: 'Monitor contributions and recent changes',
    type: 'internal',
  },
  {
    id: 'team-settings',
    title: 'Team Settings',
    description: 'Configure team preferences and notifications',
    type: 'internal',
  },
];

export function SiteTeamManagementPage({ siteKey }: SiteTeamManagementPageProps) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Team Management</Title>
        <Text type="secondary">
          Manage team members, roles, and permissions for {siteKey.toUpperCase()}
        </Text>
      </div>

      <ActionGrid actions={teamActions} />
    </div>
  );
}