'use client';

import React from 'react';
import { Typography, Card, Space, Tag, Select } from 'antd';

interface ActivityItemProps {
  action: string;
  author: string;
  time: string;
  type: 'project' | 'user' | 'namespace' | 'vocabulary' | 'profile';
  severity?: 'info' | 'warning' | 'error' | 'success';
}

interface ActivityItem {
  action: string;
  author: string;
  time: string;
  type: 'project' | 'user' | 'namespace' | 'vocabulary' | 'profile';
  severity?: 'info' | 'warning' | 'error' | 'success';
}

const { Title, Text } = Typography;

function ActivityItemComponent({
  action,
  author,
  time,
  type,
  severity,
}: ActivityItemProps) {
  const typeIcons = {
    project: '📁',
    user: '👤',
    namespace: '📦',
    vocabulary: '📚',
    profile: '📋',
  };

  const severityColors = {
    info: 'processing',
    warning: 'warning',
    error: 'error',
    success: 'success',
  } as const;

  return (
    <div
      style={{
        paddingTop: 8,
        paddingBottom: 8,
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Space align="start" size={12}>
        <Text style={{ fontSize: 18 }} aria-hidden="true">
          {typeIcons[type]}
        </Text>
        <div style={{ flex: 1 }}>
          <Space size={4} style={{ marginBottom: 4 }}>
            {severity && (
              <Tag
                color={severityColors[severity]}
                style={{
                  margin: 0,
                  padding: '0 4px',
                  height: 20,
                  lineHeight: '18px',
                }}
              >
                {severity}
              </Tag>
            )}
            <Tag
              style={{
                margin: 0,
                padding: '0 4px',
                height: 20,
                lineHeight: '18px',
              }}
            >
              {type}
            </Tag>
          </Space>
          <div style={{ lineHeight: '1.2' }}>
            <Text strong style={{ fontSize: 13 }}>
              {action}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11, lineHeight: '1.2' }}>
            By {author} • {time}
          </Text>
        </div>
      </Space>
    </div>
  );
}

interface SharedActivityPageProps {
  userRole: 'admin' | 'rg-admin';
  reviewGroupName?: string;
  activities?: ActivityItem[];
}

export function SharedActivityPage({
  userRole,
  reviewGroupName = 'ISBD',
  activities: providedActivities,
}: SharedActivityPageProps) {
  const [filter, setFilter] = React.useState('all');

  // Default activities based on role
  const defaultActivities: ActivityItem[] =
    userRole === 'admin'
      ? [
          {
            action: 'Project "MulDiCat French Translation" milestone completed',
            author: 'John Smith',
            time: '2 hours ago',
            type: 'project',
            severity: 'success',
          },
          {
            action:
              'User "alice@example.com" joined "LRM 2.0 Development" project',
            author: 'James Wilson',
            time: '3 hours ago',
            type: 'user',
            severity: 'info',
          },
          {
            action: 'Failed to generate RDF for vocabulary "test-vocab"',
            author: 'System',
            time: '4 hours ago',
            type: 'vocabulary',
            severity: 'error',
          },
          {
            action:
              'ISBD Review Group chartered "ISBD Maintenance WG 2024-2026"',
            author: 'Sarah Johnson',
            time: '5 hours ago',
            type: 'project',
            severity: 'info',
          },
          {
            action: 'Vocabulary "Elements" approaching review deadline',
            author: 'System',
            time: '6 hours ago',
            type: 'vocabulary',
            severity: 'warning',
          },
          {
            action: 'DCTAP Profile "Standard" created',
            author: 'Mike Davis',
            time: '1 day ago',
            type: 'profile',
            severity: 'success',
          },
          {
            action: 'Vocabulary "Elements" RDF generated',
            author: 'Jennifer Lee',
            time: '1 day ago',
            type: 'vocabulary',
            severity: 'success',
          },
        ]
      : [
          {
            action: `${reviewGroupName} translation milestone completed by your team`,
            author: 'Maria Editor',
            time: '2 hours ago',
            type: 'project',
          },
          {
            action: `New team member joined ${reviewGroupName} Review Group`,
            author: 'John Smith',
            time: '1 day ago',
            type: 'user',
          },
          {
            action: `${reviewGroupName}/M vocabulary updated`,
            author: 'Sarah Wilson',
            time: '2 days ago',
            type: 'vocabulary',
          },
          {
            action: 'Review group meeting notes published',
            author: 'You',
            time: '3 days ago',
            type: 'project',
          },
          {
            action: `${reviewGroupName} namespace export completed`,
            author: 'System',
            time: '4 days ago',
            type: 'namespace',
          },
          {
            action: 'New translation task assigned',
            author: 'Maria Editor',
            time: '5 days ago',
            type: 'project',
          },
          {
            action: 'Vocabulary review cycle started',
            author: 'Sarah Wilson',
            time: '1 week ago',
            type: 'vocabulary',
          },
        ];

  const activities = providedActivities || defaultActivities;

  // Filtering is only available for admin role
  const filteredActivities =
    userRole === 'admin' && filter !== 'all'
      ? activities.filter((a) => a.severity === filter)
      : activities;

  const title = userRole === 'admin' ? 'System Activity Log' : 'Activity Log';
  const subtitle =
    userRole === 'admin'
      ? 'Monitor all system activities and events'
      : 'Recent activities in your review group';
  const cardTitle =
    userRole === 'admin'
      ? 'Recent Activities'
      : `${reviewGroupName} Review Group Activity`;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>{title}</Title>
        <Text type="secondary">{subtitle}</Text>
      </div>

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {cardTitle}
          </Title>
          {userRole === 'admin' && (
            <Select
              value={filter}
              style={{ width: 120 }}
              onChange={(value) => setFilter(value)}
              aria-label="Filter activity by type"
              options={[
                { value: 'all', label: 'All' },
                { value: 'info', label: 'Info' },
                { value: 'success', label: 'Success' },
                { value: 'warning', label: 'Warning' },
                { value: 'error', label: 'Error' },
              ]}
            />
          )}
        </div>

        <div
          role="feed"
          aria-label={`${userRole === 'admin' ? 'System' : 'Review group'} activity feed`}
        >
          {filteredActivities.map((activity, index) => (
            <ActivityItemComponent key={index} {...activity} />
          ))}
        </div>
      </Card>
    </div>
  );
}
