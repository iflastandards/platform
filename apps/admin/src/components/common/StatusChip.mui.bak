'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Info,
  Schedule,
  PlayArrow,
  Pause,
  Cancel,
  Archive,
} from '@mui/icons-material';

export type StatusType = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'pending' 
  | 'processing' 
  | 'paused' 
  | 'cancelled'
  | 'archived'
  | 'active'
  | 'completed'
  | 'failed'
  | 'draft'
  | 'published'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'rejected';

interface StatusChipProps extends Omit<ChipProps, 'color' | 'icon'> {
  status: StatusType | string;
  showIcon?: boolean;
  customColors?: Record<string, ChipProps['color']>;
  customIcons?: Record<string, React.ReactElement>;
}

const defaultColorMap: Record<string, ChipProps['color']> = {
  // Generic statuses
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  pending: 'default',
  processing: 'primary',
  paused: 'warning',
  cancelled: 'default',
  archived: 'default',
  
  // Workflow statuses
  active: 'success',
  completed: 'success',
  failed: 'error',
  draft: 'default',
  published: 'success',
  in_progress: 'primary',
  review: 'secondary',
  approved: 'success',
  rejected: 'error',
  
  // Import statuses
  'import-request': 'info',
  'validated': 'success',
  'has-errors': 'error',
  'ready': 'success',
  
  // Build statuses
  running: 'info',
  
  // Translation statuses
  not_started: 'default',
  in_editorial_cycle: 'primary',
  
  // Namespace statuses
  maintenance: 'warning',
};

const defaultIconMap: Record<string, React.ReactElement> = {
  success: <CheckCircle fontSize="small" />,
  warning: <Warning fontSize="small" />,
  error: <Error fontSize="small" />,
  info: <Info fontSize="small" />,
  pending: <Schedule fontSize="small" />,
  processing: <PlayArrow fontSize="small" />,
  paused: <Pause fontSize="small" />,
  cancelled: <Cancel fontSize="small" />,
  archived: <Archive fontSize="small" />,
  active: <CheckCircle fontSize="small" />,
  completed: <CheckCircle fontSize="small" />,
  failed: <Error fontSize="small" />,
  in_progress: <PlayArrow fontSize="small" />,
  running: <PlayArrow fontSize="small" />,
};

export function StatusChip({
  status,
  showIcon = true,
  customColors = {},
  customIcons = {},
  ...chipProps
}: StatusChipProps) {
  const colorMap = { ...defaultColorMap, ...customColors };
  const iconMap = { ...defaultIconMap, ...customIcons };
  
  const color = colorMap[status] || 'default';
  const icon = showIcon ? (iconMap[status] || null) : undefined;
  
  // Format label - replace underscores with spaces and capitalize
  const label = chipProps.label || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <Chip
      {...chipProps}
      label={label}
      color={color}
      icon={icon}
      size={chipProps.size || 'small'}
    />
  );
}