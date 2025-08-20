'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  AdminPanelSettings,
  Edit,
  RateReview,
  Translate,
  SupervisedUserCircle,
  Person,
  Group,
  Shield,
} from '@mui/icons-material';

export type RoleType = 
  | 'admin'
  | 'namespace-admin'
  | 'editor'
  | 'reviewer'
  | 'translator'
  | 'member'
  | 'staff'
  | 'external'
  | 'viewer';

interface RoleChipProps extends Omit<ChipProps, 'color' | 'icon'> {
  role: RoleType | string;
  showIcon?: boolean;
  namespace?: string;
}

const roleConfig: Record<string, { color: ChipProps['color']; icon: React.ReactElement; label: string }> = {
  admin: {
    color: 'error',
    icon: <AdminPanelSettings fontSize="small" />,
    label: 'Admin',
  },
  'namespace-admin': {
    color: 'error',
    icon: <Shield fontSize="small" />,
    label: 'Namespace Admin',
  },
  editor: {
    color: 'primary',
    icon: <Edit fontSize="small" />,
    label: 'Editor',
  },
  reviewer: {
    color: 'secondary',
    icon: <RateReview fontSize="small" />,
    label: 'Reviewer',
  },
  translator: {
    color: 'info',
    icon: <Translate fontSize="small" />,
    label: 'Translator',
  },
  member: {
    color: 'success',
    icon: <Person fontSize="small" />,
    label: 'Member',
  },
  staff: {
    color: 'warning',
    icon: <SupervisedUserCircle fontSize="small" />,
    label: 'Staff',
  },
  external: {
    color: 'default',
    icon: <Person fontSize="small" />,
    label: 'External',
  },
  viewer: {
    color: 'default',
    icon: <Person fontSize="small" />,
    label: 'Viewer',
  },
};

export function RoleChip({
  role,
  showIcon = true,
  namespace,
  ...chipProps
}: RoleChipProps) {
  const config = roleConfig[role] || {
    color: 'default' as ChipProps['color'],
    icon: <Group fontSize="small" />,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  };
  
  let label = chipProps.label || config.label;
  
  // Add namespace prefix if provided
  if (namespace && role !== 'admin') {
    label = `${namespace.toUpperCase()} ${label}`;
  }
  
  return (
    <Chip
      {...chipProps}
      label={label}
      color={config.color}
      icon={showIcon ? config.icon : undefined}
      size={chipProps.size || 'small'}
    />
  );
}