'use client';

import React from 'react';
import {
  List,
  Avatar,
  Typography,
  Tag,
  Space,
  Skeleton,
} from 'antd';
import {
  CloudUploadOutlined,
  EditOutlined,
  CheckCircleOutlined,
  TranslationOutlined,
  BuildOutlined,
  LoginOutlined,
  TeamOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';

const { Text, Link } = Typography;

export interface ActivityItem {
  id: string;
  type: 'import' | 'edit' | 'validation' | 'translation' | 'build' | 'auth' | 'project' | 'cycle' | 'generic';
  title: string;
  description?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
  link?: {
    href: string;
    label: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  showUser?: boolean;
  compact?: boolean;
}

const activityIcons = {
  import: <CloudUploadOutlined />,
  edit: <EditOutlined />,
  validation: <CheckCircleOutlined />,
  translation: <TranslationOutlined />,
  build: <BuildOutlined />,
  auth: <LoginOutlined />,
  project: <TeamOutlined />,
  cycle: <LineChartOutlined />,
  generic: <InfoCircleOutlined />,
};

const activityColors = {
  import: 'blue',
  edit: 'orange',
  validation: 'green',
  translation: 'purple',
  build: 'cyan',
  auth: 'magenta',
  project: 'geekblue',
  cycle: 'volcano',
  generic: 'default',
};

export function ActivityFeed({ 
  activities, 
  loading = false, 
  showUser = true,
  compact = false 
}: ActivityFeedProps) {
  if (loading) {
    return (
      <List
        itemLayout="horizontal"
        dataSource={[1, 2, 3]}
        renderItem={() => (
          <List.Item>
            <Skeleton avatar active paragraph={{ rows: 1 }} />
          </List.Item>
        )}
      />
    );
  }

  if (!activities.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <InfoCircleOutlined style={{ fontSize: 48, color: '#999' }} />
        <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
          No recent activity
        </Text>
      </div>
    );
  }

  return (
    <List
      itemLayout={compact ? 'horizontal' : 'vertical'}
      dataSource={activities}
      renderItem={(activity) => (
        <List.Item
          key={activity.id}
          actions={
            activity.link
              ? [
                  <Link key="action" href={activity.link.href}>
                    {activity.link.label}
                  </Link>,
                ]
              : undefined
          }
        >
          <List.Item.Meta
            avatar={
              showUser && activity.user ? (
                <Avatar src={activity.user.avatar}>
                  {!activity.user.avatar && activity.user.name[0]}
                </Avatar>
              ) : (
                <Avatar
                  icon={activityIcons[activity.type]}
                  style={{
                    backgroundColor: `var(--ant-color-${activityColors[activity.type]})`,
                  }}
                />
              )
            }
            title={
              <Space>
                {activity.title}
                <Tag color={activityColors[activity.type]} style={{ fontSize: 11 }}>
                  {activity.type}
                </Tag>
              </Space>
            }
            description={
              <Space direction="vertical" size="small">
                {activity.description && (
                  <Text type="secondary">{activity.description}</Text>
                )}
                <Space size="small">
                  {showUser && activity.user && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      by {activity.user.name}
                    </Text>
                  )}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </Text>
                </Space>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <Space wrap size="small">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <Tag key={key} style={{ fontSize: 11 }}>
                        {key}: {String(value)}
                      </Tag>
                    ))}
                  </Space>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
}

export default ActivityFeed;