'use client';

import React from 'react';
import Link from 'next/link';
import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Progress,
} from 'antd';
import {
  PlusSquareOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export function AdminProjectsPage() {
  const projects = [
    { id: 1, name: 'MulDiCat French Translation', status: 'active', team: 'ISBD RG', progress: 75 },
    { id: 2, name: 'LRM 2.0 Development', status: 'active', team: 'LRM RG', progress: 45 },
    { id: 3, name: 'ISBD Maintenance WG 2024-2026', status: 'planning', team: 'ISBD RG', progress: 10 },
    { id: 4, name: 'UNIMARC Update 2024', status: 'active', team: 'UNIMARC RG', progress: 60 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4}>Project Management</Title>
        <Link href="/dashboard/admin/projects/new">
          <Button
            type="primary"
            icon={<PlusSquareOutlined />}
          >
            Charter New Project
          </Button>
        </Link>
      </div>

      <Row gutter={[16, 16]}>
        {projects.map((project) => (
          <Col xs={24} md={12} lg={8} key={project.id}>
            <Card>
              <Title level={5} style={{ marginBottom: 16 }}>
                {project.name}
              </Title>
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color={project.status === 'active' ? 'success' : 'warning'}>
                  {project.status}
                </Tag>
                <Tag>{project.team}</Tag>
              </Space>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Progress: {project.progress}%</Text>
                <Progress 
                  percent={project.progress} 
                  showInfo={false}
                  strokeColor="#1890ff"
                  style={{ marginTop: 8 }}
                />
              </div>
              <Link href={`/dashboard/admin/projects/${project.id}`}>
                <Button block>
                  View Details
                </Button>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}