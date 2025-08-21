'use client';

import React, { useState } from 'react';
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
  TeamOutlined,
  GlobalOutlined,
  FolderOutlined,
  BookOutlined,
  ProjectOutlined,
  HistoryOutlined,
  UserAddOutlined,
  PlusCircleOutlined,
  CloudUploadOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { TabBasedDashboardLayout, NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

const { Text, Title } = Typography;

interface AdminDashboardProps {
  userRoles: string[];
  userName?: string;
  userEmail?: string;
}

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

function StatsCard({ title, value, change, changeType }: StatsCardProps) {
  const changeColor = 
    changeType === 'increase' ? '#52c41a' : 
    changeType === 'decrease' ? '#ff4d4f' : 
    '#8c8c8c';
  
  const cardId = `stats-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <Card 
      style={{ 
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      role="region"
      aria-labelledby={cardId}
    >
      <div style={{ padding: '24px' }}>
        <Typography.Text 
          id={cardId}
          type="secondary" 
          style={{ display: 'block', marginBottom: 8 }}
        >
          {title}
        </Typography.Text>
        <Statistic
          value={value}
          valueStyle={{ 
            fontSize: 32,
            fontWeight: 'bold',
            color: '#1890ff'
          }}
          aria-label={`${title}: ${value.toLocaleString()}`}
        />
        <Typography.Text 
          style={{ color: changeColor, marginTop: 8, display: 'block' }}
          aria-label={`Change: ${change}`}
        >
          {change}
        </Typography.Text>
      </div>
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
    <article style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
      <Space align="start" size="middle">
        <Typography.Text style={{ fontSize: 24 }} aria-hidden="true">
          {typeIcons[type]}
        </Typography.Text>
        <div style={{ flex: 1 }}>
          <Typography.Text strong>
            {action}
          </Typography.Text>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              By {author} • {time}
            </Typography.Text>
          </div>
        </div>
      </Space>
    </article>
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
    <div role="listitem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12 }}>
      <Typography.Text type="secondary">
        {service}:
      </Typography.Text>
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

export default function AdminDashboard({ userRoles: _userRoles, userName: _userName, userEmail: _userEmail }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: HomeOutlined },
    { id: 'users', label: 'Users', icon: TeamOutlined, badge: 352 },
    { id: 'review-groups', label: 'Review Groups', icon: GlobalOutlined },
    { id: 'projects', label: 'Projects', icon: ProjectOutlined, badge: 12 },
    { id: 'namespaces', label: 'Namespaces', icon: FolderOutlined },
    { id: 'vocabularies', label: 'Vocabularies', icon: BookOutlined, badge: 824 },
    { id: 'profiles', label: 'DCTAP Profiles', icon: BookOutlined },
    { id: 'adopt', label: 'Adopt Spreadsheet', icon: CloudUploadOutlined, specialAccess: true },
    { id: 'activity', label: 'Activity Log', icon: HistoryOutlined },
  ];

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

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            <div style={{ marginBottom: 32 }}>
              <Title level={1} style={{ marginBottom: 8 }}>
                Admin Dashboard
              </Title>
              <Text type="secondary">
                System overview and key metrics
              </Text>
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
                <Card>
                  <Title level={2} style={{ marginBottom: 16 }}>
                    Recent System Activity
                  </Title>
                  <div role="feed" aria-label="Recent activity feed">
                    {recentActivity.map((activity, index) => (
                      <ActivityItem key={index} {...activity} />
                    ))}
                  </div>
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <Link href="/dashboard/activity?demo=true">
                      <Button type="link" style={{ padding: 0 }}>
                        View all activity →
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Col>

              {/* System Status & Quick Actions */}
              <Col xs={24} lg={8}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* System Status */}
                  <Card>
                    <Title level={2} style={{ marginBottom: 16 }}>
                      System Status
                    </Title>
                    <div role="list" aria-label="System service status">
                      {systemStatus.map((status) => (
                        <SystemStatusItem key={status.service} {...status} />
                      ))}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <Title level={2} style={{ marginBottom: 16 }}>
                      Quick Actions
                    </Title>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Link href="/dashboard/projects/new?demo=true" style={{ width: '100%' }}>
                        <Button
                          type="primary"
                          block
                          icon={<PlusCircleOutlined />}
                          aria-label="Charter a new project"
                        >
                          Charter New Project
                        </Button>
                      </Link>
                      <Link href="/dashboard/admin/adopt-spreadsheet" style={{ width: '100%' }}>
                        <Button
                          block
                          icon={<CloudUploadOutlined />}
                          aria-label="Adopt a spreadsheet"
                        >
                          Adopt Spreadsheet
                        </Button>
                      </Link>
                      <Link href="/dashboard/users/invite?demo=true" style={{ width: '100%' }}>
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

      case 'users':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              User Management
            </Title>
            <Link href="/dashboard/users">
              <Button type="primary">
                View All Users
              </Button>
            </Link>
          </div>
        );

      case 'projects':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Project Management
            </Title>
            <Link href="/dashboard/projects">
              <Button type="primary">
                View All Projects
              </Button>
            </Link>
          </div>
        );

      case 'adopt':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Adopt Spreadsheet
            </Title>
            <Link href="/dashboard/admin/adopt-spreadsheet">
              <Button type="primary">
                Go to Spreadsheet Adoption
              </Button>
            </Link>
          </div>
        );

      case 'activity':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Activity Log
            </Title>
            <Link href="/dashboard/activity">
              <Button type="primary">
                View Full Activity Log
              </Button>
            </Link>
          </div>
        );

      default:
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              {navigationItems.find(item => item.id === selectedTab)?.label}
            </Title>
            <Text type="secondary">
              This section is under development.
            </Text>
          </div>
        );
    }
  };

  return (
    <TabBasedDashboardLayout
      title="IFLA Admin"
      subtitle="System Administration"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
