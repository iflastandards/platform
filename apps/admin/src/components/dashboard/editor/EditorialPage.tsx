'use client';

import React from 'react';
import {
  Typography,
  List,
} from 'antd';
import {
  ClockCircleOutlined,
  FileSearchOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export function EditorialPage() {
  const editorialTools = [
    {
      icon: <ClockCircleOutlined style={{ fontSize: 20 }} />,
      title: 'Editorial Cycles',
      description: 'Manage vocabulary publication cycles',
      href: '/cycles',
    },
    {
      icon: <FileSearchOutlined style={{ fontSize: 20 }} />,
      title: 'Review Queue',
      description: 'Pending reviews and approvals',
      href: '/review',
    },
    {
      icon: <TranslationOutlined style={{ fontSize: 20 }} />,
      title: 'Translation Management',
      description: 'Coordinate multilingual content',
      href: '/translation',
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Editorial Tools</Title>
      <List
        itemLayout="horizontal"
        dataSource={editorialTools}
        renderItem={(item) => (
          <Link
            href={item.href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <List.Item
              style={{
                padding: '16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          </Link>
        )}
      />
    </div>
  );
}