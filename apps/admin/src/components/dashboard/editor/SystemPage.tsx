'use client';

import React from 'react';
import {
  Typography,
  List,
  Tag,
} from 'antd';
import {
  BuildOutlined,
  GithubOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export function SystemPage() {
  const systemStatus = [
    {
      icon: <BuildOutlined style={{ fontSize: 20 }} />,
      title: 'Build Pipeline',
      description: 'Last build: 2 hours ago',
      status: 'Healthy',
      color: 'success',
    },
    {
      icon: <GithubOutlined style={{ fontSize: 20 }} />,
      title: 'GitHub Integration',
      description: 'API status and sync',
      status: 'Connected',
      color: 'success',
    },
    {
      icon: <UploadOutlined style={{ fontSize: 20 }} />,
      title: 'Import Status',
      description: 'Active imports: 0',
      status: 'Idle',
      color: 'default',
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>System Status</Title>
      <List
        itemLayout="horizontal"
        dataSource={systemStatus}
        renderItem={(item) => (
          <List.Item
            extra={<Tag color={item.color}>{item.status}</Tag>}
            style={{
              padding: '16px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <List.Item.Meta
              avatar={item.icon}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </div>
  );
}