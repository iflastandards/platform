'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UserAddOutlined,
  PlusCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

const { Title, Text } = Typography;

function StatsCard({ title, value, change, changeType }: StatsCardProps) {
  const changeColor = 
    changeType === 'increase' ? '#52c41a' : 
    changeType === 'decrease' ? '#ff4d4f' : 
    '#8c8c8c';
  
  const cardId = `stats-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <Card 
      style={{ minHeight: 140 }}
      role="region"
      aria-labelledby={cardId}
    >
      <Text 
        id={cardId}
        type="secondary" 
        style={{ display: 'block', marginBottom: 8 }}
      >
        {title}
      </Text>
      <Statistic
        value={value}
        valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
        aria-label={`${title}: ${value.toLocaleString()}`}
      />
      <Text 
        style={{ color: changeColor, marginTop: 8, display: 'block' }}
        aria-label={`Change: ${change}`}
      >
        {change}
      </Text>
    </Card>
  );
}

interface ActivityItemProps {
  action: string;
  author: string;
  time: string;
  type: 'project' | 'user' | 'namespace' | 'vocabulary' | 'profile';
}

function ActivityItem({ action, author, time, type }: ActivityItemProps) {
  const typeIcons = {
    project: '📁',
    user: '👤',
    namespace: '📦',
    vocabulary: '📚',
    profile: '📋',
  };
  
  return (
    <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
      <Space align="start" size={16}>
        <Text style={{ fontSize: 24 }} aria-hidden="true">{typeIcons[type]}</Text>
        <div style={{ flex: 1 }}>
          <Text strong>{action}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            By {author} • {time}
          </Text>
        </div>
      </Space>
    </div>
  );
}

interface SystemStatusItemProps {
  service: string;
  status: 'online' | 'offline' | 'maintenance';
}

function SystemStatusItem({ service, status }: SystemStatusItemProps) {
  const statusConfig = {
    online: { color: 'success', label: 'Online' },
    offline: { color: 'error', label: 'Offline' },
    maintenance: { color: 'warning', label: 'Maintenance' },
  } as const;
  
  const config = statusConfig[status];
  
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12 }}>
      <Text type="secondary">{service}:</Text>
      <Tag 
        color={config.color}
        style={{ fontWeight: 600 }}
        aria-label={`${service} status: ${config.label}`}
      >
        {config.label}
      </Tag>
    </div>
  );
}

export function AdminOverviewPage() {
  const stats = [
    { title: 'Total Users', value: 352, change: '+14 this month', changeType: 'increase' as const },
    { title: 'Active Projects', value: 12, change: '+2 this month', changeType: 'increase' as const },
    { title: 'Total Vocabularies', value: 824, change: '+38 this month', changeType: 'increase' as const },
  ];

  const recentActivity = [
    { action: 'Project "MulDiCat French Translation" milestone completed', author: 'John Smith', time: '2 hours ago', type: 'project' as const },
    { action: 'User "alice@example.com" joined "LRM 2.0 Development" project', author: 'James Wilson', time: '3 hours ago', type: 'user' as const },
    { action: 'ISBD Review Group chartered "ISBD Maintenance WG 2024-2026"', author: 'Sarah Johnson', time: '5 hours ago', type: 'project' as const },
    { action: 'DCTAP Profile "Standard" created', author: 'Mike Davis', time: '1 day ago', type: 'profile' as const },
    { action: 'Vocabulary "Elements" RDF generated', author: 'Jennifer Lee', time: '1 day ago', type: 'vocabulary' as const },
  ];

  const systemStatus = [
    { service: 'GitHub API', status: 'online' as const },
    { service: 'Clerk Auth', status: 'online' as const },
    { service: 'Vocabulary Server', status: 'online' as const },
    { service: 'Build System', status: 'online' as const },
  ];

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Admin Dashboard</Title>
        <Text type="secondary">System overview and key metrics</Text>
      </div>

      {/* Stats Grid */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} md={8} key={stat.title}>
            <StatsCard {...stat} />
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Activity */}
        <Col xs={24} lg={16}>
          <Card title={<Title level={4} style={{ margin: 0 }}>Recent System Activity</Title>}>
            <div role="feed" aria-label="Recent activity feed">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Link
                href="/dashboard/admin/activity"
                style={{ color: '#1890ff', fontSize: 14 }}
              >
                View all activity →
              </Link>
            </div>
          </Card>
        </Col>

        {/* System Status & Quick Actions */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* System Status */}
            <Card title={<Title level={4} style={{ margin: 0 }}>System Status</Title>}>
              <div role="list" aria-label="System service status">
                {systemStatus.map((status) => (
                  <SystemStatusItem key={status.service} {...status} />
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title={<Title level={4} style={{ margin: 0 }}>Quick Actions</Title>}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Link href="/dashboard/admin/projects/new">
                  <Button
                    type="primary"
                    block
                    icon={<PlusCircleOutlined />}
                    aria-label="Charter a new project"
                  >
                    Charter New Project
                  </Button>
                </Link>
                <Link href="/dashboard/admin/adopt-spreadsheet">
                  <Button
                    block
                    icon={<CloudUploadOutlined />}
                    aria-label="Adopt a spreadsheet"
                  >
                    Adopt Spreadsheet
                  </Button>
                </Link>
                <Link href="/dashboard/admin/users/invite">
                  <Button
                    block
                    icon={<UserAddOutlined />}
                    aria-label="Invite a new user"
                  >
                    Invite User
                  </Button>
                </Link>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
  </>
);
}