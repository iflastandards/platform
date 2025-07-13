'use client';

import React from 'react';
import { 
  Box, 
  LinearProgress, 
  LinearProgressProps, 
  Typography,
  Tooltip,
} from '@mui/material';

interface ProgressBarProps extends LinearProgressProps {
  value: number;
  showLabel?: boolean;
  labelFormat?: 'percentage' | 'fraction' | 'custom';
  customLabel?: string;
  total?: number;
  current?: number;
  height?: number;
  animated?: boolean;
  showTooltip?: boolean;
  tooltipContent?: string;
}

export function ProgressBar({
  value,
  showLabel = true,
  labelFormat = 'percentage',
  customLabel,
  total,
  current,
  height = 8,
  animated = true,
  showTooltip = false,
  tooltipContent,
  ...progressProps
}: ProgressBarProps) {
  // Calculate label based on format
  const getLabel = () => {
    if (customLabel) return customLabel;
    
    switch (labelFormat) {
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'fraction':
        if (current !== undefined && total !== undefined) {
          return `${current} / ${total}`;
        }
        return `${Math.round(value)}%`;
      default:
        return '';
    }
  };

  const label = getLabel();
  const defaultTooltip = tooltipContent || `Progress: ${label}`;

  const progressBar = (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress
            {...progressProps}
            variant={animated ? 'determinate' : 'determinate'}
            value={value}
            sx={{
              height,
              borderRadius: height / 2,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: height / 2,
                transition: animated ? 'transform 0.4s ease' : 'none',
              },
              ...progressProps.sx,
            }}
          />
        </Box>
        {showLabel && (
          <Box sx={{ minWidth: 60 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontWeight: 'medium' }}
            >
              {label}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  if (showTooltip) {
    return (
      <Tooltip title={defaultTooltip} placement="top">
        {progressBar}
      </Tooltip>
    );
  }

  return progressBar;
}

// Compound component for multi-segment progress
interface SegmentedProgressBarProps {
  segments: {
    value: number;
    color?: LinearProgressProps['color'];
    label?: string;
  }[];
  height?: number;
  showLabels?: boolean;
}

export function SegmentedProgressBar({
  segments,
  height = 8,
  showLabels = true,
}: SegmentedProgressBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          height,
          borderRadius: height / 2,
          overflow: 'hidden',
          backgroundColor: 'grey.200',
        }}
      >
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          return (
            <Box
              key={index}
              sx={{
                width: `${percentage}%`,
                backgroundColor: 
                  segment.color === 'primary' ? 'primary.main' :
                  segment.color === 'secondary' ? 'secondary.main' :
                  segment.color === 'error' ? 'error.main' :
                  segment.color === 'warning' ? 'warning.main' :
                  segment.color === 'info' ? 'info.main' :
                  segment.color === 'success' ? 'success.main' :
                  'grey.500',
                transition: 'width 0.4s ease',
              }}
            />
          );
        })}
      </Box>
      {showLabels && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          {segments.map((segment, index) => (
            <Typography 
              key={index} 
              variant="caption" 
              color="text.secondary"
            >
              {segment.label || `${segment.value}`}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}