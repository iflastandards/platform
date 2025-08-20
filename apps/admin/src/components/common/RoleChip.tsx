'use client';

import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
  CrownOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  TranslationOutlined,
  EyeOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

export type RoleType = 
  | 'admin' 
  | 'staff' 
  | 'member' 
  | 'editor'
  | 'translator'
  | 'reviewer'
  | 'external'
  | 'namespace-admin'
  | 'review-group-admin';

interface RoleChipProps {
  role: RoleType | string;
  namespace?: string;
  size?: 'small' | 'default';
}

const roleConfigs = {
  admin: {
    color: 'red',
    icon: <CrownOutlined />,
    label: 'Admin',
    tooltip: 'System Administrator',
  },
  staff: {
    color: 'orange',
    icon: <TeamOutlined />,
    label: 'Staff',
    tooltip: 'IFLA Staff Member',
  },
  member: {
    color: 'blue',
    icon: <UserOutlined />,
    label: 'Member',
    tooltip: 'Working Group Member',
  },
  editor: {
    color: 'green',
    icon: <EditOutlined />,
    label: 'Editor',
    tooltip: 'Content Editor',
  },
  translator: {
    color: 'purple',
    icon: <TranslationOutlined />,
    label: 'Translator',
    tooltip: 'Language Translator',
  },
  reviewer: {
    color: 'cyan',
    icon: <EyeOutlined />,
    label: 'Reviewer',
    tooltip: 'Content Reviewer',
  },
  external: {
    color: 'default',
    icon: <GlobalOutlined />,
    label: 'External',
    tooltip: 'External Contributor',
  },
  'namespace-admin': {
    color: 'geekblue',
    icon: <CrownOutlined />,
    label: 'Namespace Admin',
    tooltip: 'Namespace Administrator',
  },
  'review-group-admin': {
    color: 'volcano',
    icon: <TeamOutlined />,
    label: 'RG Admin',
    tooltip: 'Review Group Administrator',
  },
};

export function RoleChip({ role, namespace, size = 'default' }: RoleChipProps) {
  const config = roleConfigs[role as RoleType] || {
    color: 'default',
    icon: <UserOutlined />,
    label: role,
    tooltip: role,
  };
  
  const label = namespace 
    ? `${config.label} (${namespace})`
    : config.label;
  
  const tooltip = namespace 
    ? `${config.tooltip} for ${namespace}`
    : config.tooltip;
  
  return (
    <Tooltip title={tooltip}>
      <Tag
        color={config.color}
        icon={config.icon}
        style={{ 
          fontSize: size === 'small' ? 11 : 12,
          padding: size === 'small' ? '0 4px' : undefined,
        }}
      >
        {label}
      </Tag>
    </Tooltip>
  );
}

export default RoleChip;