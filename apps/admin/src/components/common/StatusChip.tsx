'use client';

import React from 'react';
import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  StopOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

export type StatusType = 
  | 'published' 
  | 'draft' 
  | 'review' 
  | 'archived' 
  | 'pending'
  | 'error'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'imported'
  | 'external'
  | 'active'
  | 'completed';

interface StatusChipProps {
  status: StatusType;
  label?: string;
  size?: 'small' | 'default';
}

const statusConfigs = {
  published: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    label: 'Published',
  },
  draft: {
    color: 'default',
    icon: <EditOutlined />,
    label: 'Draft',
  },
  review: {
    color: 'warning',
    icon: <EyeOutlined />,
    label: 'In Review',
  },
  archived: {
    color: 'default',
    icon: <StopOutlined />,
    label: 'Archived',
  },
  pending: {
    color: 'processing',
    icon: <ClockCircleOutlined />,
    label: 'Pending',
  },
  error: {
    color: 'error',
    icon: <CloseCircleOutlined />,
    label: 'Error',
  },
  in_progress: {
    color: 'processing',
    icon: <SyncOutlined spin />,
    label: 'In Progress',
  },
  approved: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    label: 'Approved',
  },
  rejected: {
    color: 'error',
    icon: <CloseCircleOutlined />,
    label: 'Rejected',
  },
  imported: {
    color: 'blue',
    icon: <CloudUploadOutlined />,
    label: 'Imported',
  },
  external: {
    color: 'orange',
    icon: <GlobalOutlined />,
    label: 'External',
  },
  active: {
    color: 'processing',
    icon: <SyncOutlined />,
    label: 'Active',
  },
  completed: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    label: 'Completed',
  },
};

export function StatusChip({ status, label, size = 'default' }: StatusChipProps) {
  const config = statusConfigs[status] || statusConfigs.pending;
  
  return (
    <Tag
      color={config.color}
      icon={config.icon}
      style={{ 
        fontSize: size === 'small' ? 11 : 12,
        padding: size === 'small' ? '0 4px' : undefined,
      }}
    >
      {label || config.label}
    </Tag>
  );
}

export default StatusChip;