'use client';

import React from 'react';
import {
  Typography,
  List,
  Badge,
  Tag,
} from 'antd';
import {
  FileSearchOutlined,
  TranslationOutlined,
  CommentOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export function AuthorTasksPage() {
  const tasks = [
    {
      icon: <FileSearchOutlined style={{ fontSize: 20 }} />,
      title: 'Pending Reviews',
      description: '3 items waiting for review',
      count: 3,
      color: 'warning',
    },
    {
      icon: <TranslationOutlined style={{ fontSize: 20 }} />,
      title: 'Translation Tasks',
      description: '2 items need translation',
      count: 2,
      color: 'processing',
    },
    {
      icon: <CommentOutlined style={{ fontSize: 20 }} />,
      title: 'Comments to Address',
      description: '1 comment needs response',
      count: 1,
      color: 'error',
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Active Tasks</Title>
      <List
        itemLayout="horizontal"
        dataSource={tasks}
        renderItem={(item) => (
          <List.Item
            extra={
              <Badge count={item.count}>
                <Tag color={item.color}>{item.count}</Tag>
              </Badge>
            }
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