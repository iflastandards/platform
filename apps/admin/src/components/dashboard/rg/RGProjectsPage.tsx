'use client';

import React from 'react';
import Link from 'next/link';
import {
  Typography,
  Button,
  Card,
  Tag,
  Space,
  Progress,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export function RGProjectsPage() {
  const projects = [
    { 
      id: 1, 
      name: 'ISBD Translation - French', 
      status: 'active', 
      deadline: '2024-06-30',
      progress: 75,
      team: ['Maria Editor', 'Jean Translator', 'Pierre Reviewer']
    },
    { 
      id: 2, 
      name: 'ISBD/M Vocabulary Update', 
      status: 'active', 
      deadline: '2024-05-15',
      progress: 45,
      team: ['Sarah Wilson', 'John Smith']
    },
    { 
      id: 3, 
      name: 'ISBD Review Cycle 2024', 
      status: 'planning', 
      deadline: '2024-12-31',
      progress: 10,
      team: ['Full ISBD Team']
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <Title level={2}>My Projects</Title>
        <Link href="/dashboard/rg/projects/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Start New Project
          </Button>
        </Link>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {projects.map((project) => (
          <Card key={project.id}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: 16 
            }}>
              <div>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {project.name}
                </Title>
                <Space>
                  <Tag color={project.status === 'active' ? 'success' : 'warning'}>
                    {project.status}
                  </Tag>
                  <Tag>
                    Deadline: {project.deadline}
                  </Tag>
                </Space>
              </div>
              <Link href={`/dashboard/rg/projects/${project.id}`}>
                <Button type="default">
                  View Details
                </Button>
              </Link>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                Progress: {project.progress}%
              </Text>
              <Progress 
                percent={project.progress} 
                showInfo={false}
                strokeColor="#1890ff"
              />
            </div>
            
            <Text type="secondary">
              Team: {project.team.join(', ')}
            </Text>
          </Card>
        ))}
      </Space>
    </div>
  );
}