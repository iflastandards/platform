'use client';

import React from 'react';
import { 
  Progress, 
  Tooltip, 
  Typography,
  Space,
} from 'antd';
import type { ProgressProps } from 'antd';

const { Text } = Typography;

interface ProgressBarProps extends Omit<ProgressProps, 'percent'> {
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

  // Map height to Ant Design size
  const getSize = () => {
    if (height && height <= 5) return 'small';
    if (height && height >= 20) return undefined; // Use default for large
    return 'default';
  };

  const progressBar = (
    <div style={{ width: '100%' }}>
      <Space style={{ width: '100%' }}>
        <Progress
          {...progressProps}
          percent={value}
          size={getSize()}
          showInfo={showLabel}
          format={() => label}
          strokeLinecap="round"
          style={{ 
            flex: 1,
            margin: 0,
            ...(height && height !== 8 ? { lineHeight: `${height}px` } : {})
          }}
        />
      </Space>
    </div>
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
    color?: string;
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

  // Map color names to Ant Design colors
  const getColor = (color?: string) => {
    const colorMap: Record<string, string> = {
      primary: '#1890ff',
      secondary: '#722ed1',
      error: '#ff4d4f',
      warning: '#faad14',
      info: '#13c2c2',
      success: '#52c41a',
    };
    return color ? (colorMap[color] || color) : '#1890ff';
  };

  return (
    <div>
      <div 
        style={{ 
          display: 'flex', 
          height: height,
          borderRadius: height / 2,
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
        }}
      >
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          return (
            <div
              key={index}
              style={{
                width: `${percentage}%`,
                backgroundColor: getColor(segment.color),
                transition: 'width 0.4s ease',
              }}
            />
          );
        })}
      </div>
      {showLabels && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: 8 
        }}>
          {segments.map((segment, index) => (
            <Text 
              key={index} 
              type="secondary"
              style={{ fontSize: 12 }}
            >
              {segment.label || `${segment.value}`}
            </Text>
          ))}
        </div>
      )}
    </div>
  );
}