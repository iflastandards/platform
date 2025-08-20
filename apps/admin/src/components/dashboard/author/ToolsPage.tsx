'use client';

import React from 'react';
import {
  Typography,
  List,
  Card,
} from 'antd';
import {
  CheckCircleOutlined,
  GlobalOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

export function AuthorToolsPage() {
  const tools = [
    {
      icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />,
      title: 'Review Interface',
      description: 'Approve, reject, and comment on content',
      href: '/review',
    },
    {
      icon: <GlobalOutlined style={{ fontSize: 20, color: '#1890ff' }} />,
      title: 'Translation Tools',
      description: 'Manage multilingual content',
      href: '/translation',
    },
    {
      icon: <FieldTimeOutlined style={{ fontSize: 20, color: '#722ed1' }} />,
      title: 'Editorial Timeline',
      description: 'Track progress and deadlines',
      href: '/cycles',
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Tools & Resources</Title>
      <List
        itemLayout="horizontal"
        dataSource={tools}
        renderItem={(item) => (
          <Link 
            href={item.href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card 
              hoverable
              style={{ marginBottom: 8 }}
              bodyStyle={{ padding: 16 }}
            >
              <List.Item style={{ padding: 0, border: 'none' }}>
                <List.Item.Meta
                  avatar={item.icon}
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            </Card>
          </Link>
        )}
      />
    </div>
  );
}