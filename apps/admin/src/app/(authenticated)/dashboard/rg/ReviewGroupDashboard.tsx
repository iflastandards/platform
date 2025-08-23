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
  DashboardOutlined,
  TeamOutlined,
  FolderOutlined,
  ProjectOutlined,
  HistoryOutlined,
  UserAddOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { mockReviewGroups, getNamespacesByReviewGroup } from '@/lib/mock-data/namespaces-extended';
import { TabBasedDashboardLayout, type NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

const { Text, Title } = Typography;

interface ReviewGroupDashboardProps {
  userRoles: string[];
  userName?: string;
  userEmail?: string;
  reviewGroups: string[];
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
  
  return (
    <Card>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        {title}
      </Text>
      <Statistic
        value={value}
        valueStyle={{ 
          fontSize: 32,
          fontWeight: 'bold',
          color: '#1890ff'
        }}
      />
      <Text style={{ color: changeColor, marginTop: 8, display: 'block' }}>
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
      <Space align="start" size="middle">
        <Text style={{ fontSize: 24 }}>{typeIcons[type]}</Text>
        <div style={{ flex: 1 }}>
          <Text strong>
            {action}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              By {author} • {time}
            </Text>
          </div>
        </div>
      </Space>
    </div>
  );
}

interface NamespaceCardProps {
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'archived';
  currentVersion: string;
  color: string;
  statistics: {
    elements: number;
    concepts: number;
    translations: number;
    contributors: number;
  };
}

function NamespaceCard({ name, description, status, currentVersion, color, statistics }: NamespaceCardProps) {
  const statusConfig = {
    active: { color: 'success', label: 'Active' },
    maintenance: { color: 'warning', label: 'Maintenance' },
    archived: { color: 'error', label: 'Archived' },
  } as const;
  
  const config = statusConfig[status];
  
  return (
    <Card bordered style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <Title level={5} style={{ color, margin: 0 }}>
          {name}
        </Title>
        <Tag color={config.color}>
          {config.label}
        </Tag>
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        {description}
      </Text>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        Version {currentVersion}
      </Text>
      
      <Row gutter={16}>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic
            value={statistics.elements + statistics.concepts}
            valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}
            suffix={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Items
              </Text>
            }
          />
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic
            value={statistics.translations}
            valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}
            suffix={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Languages
              </Text>
            }
          />
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Statistic
            value={statistics.contributors}
            valueStyle={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}
            suffix={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Contributors
              </Text>
            }
          />
        </Col>
      </Row>
    </Card>
  );
}

export default function ReviewGroupDashboard({ 
  userRoles: _userRoles, 
  userName: _userName, 
  userEmail: _userEmail,
  reviewGroups 
}: ReviewGroupDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Get user's review group info
  const userReviewGroups = reviewGroups.map(rgId => mockReviewGroups[rgId]).filter(Boolean);
  const userNamespaces = reviewGroups.flatMap(rgId => getNamespacesByReviewGroup(rgId));
  
  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'RG Dashboard', icon: DashboardOutlined },
    { id: 'projects', label: 'My Projects', icon: ProjectOutlined },
    { id: 'namespaces', label: 'My Namespaces', icon: FolderOutlined, badge: userNamespaces.length },
    { id: 'team', label: 'Team Members', icon: TeamOutlined },
    { id: 'activity', label: 'Activity Log', icon: HistoryOutlined },
  ];

  const stats = [
    { title: 'My Namespaces', value: userNamespaces.length, change: 'Under your management', changeType: 'neutral' as const },
    { title: 'Active Projects', value: 4, change: '+1 this month', changeType: 'increase' as const },
    { title: 'Team Members', value: 12, change: '+2 this quarter', changeType: 'increase' as const },
  ];

  const recentActivity = [
    { action: 'ISBD translation milestone completed by your team', author: 'Maria Editor', time: '2 hours ago', type: 'project' as const },
    { action: 'New team member joined ISBD Review Group', author: 'John Smith', time: '1 day ago', type: 'user' as const },
    { action: 'ISBD/M vocabulary updated', author: 'Sarah Wilson', time: '2 days ago', type: 'vocabulary' as const },
    { action: 'Review group meeting notes published', author: 'You', time: '3 days ago', type: 'project' as const },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {/* Stats Grid */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
              {stats.map((stat) => (
                <Col xs={24} sm={12} md={8} key={stat.title}>
                  <StatsCard {...stat} />
                </Col>
              ))}
            </Row>

            <Row gutter={[24, 24]}>
              {/* My Namespaces */}
              <Col xs={24} lg={16}>
                <Card>
                  <Title level={4} style={{ marginBottom: 16 }}>
                    My Namespaces
                  </Title>
                  <Row gutter={[16, 16]}>
                    {userNamespaces.map((namespace) => (
                      <Col xs={24} md={12} key={namespace.id}>
                        <NamespaceCard {...namespace} />
                      </Col>
                    ))}
                  </Row>
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <Link href="/dashboard/rg/namespaces?demo=true">
                      <Button type="link" style={{ padding: 0 }}>
                        Manage all namespaces →
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Col>

              {/* Recent Activity & Quick Actions */}
              <Col xs={24} lg={8}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* Recent Activity */}
                  <Card>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      Recent Activity
                    </Title>
                    <div role="feed" aria-label="Recent review group activity">
                      {recentActivity.map((activity, index) => (
                        <ActivityItem key={index} {...activity} />
                      ))}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      Quick Actions
                    </Title>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Link href="/dashboard/rg/projects/new?demo=true" style={{ width: '100%' }}>
                        <Button
                          type="primary"
                          block
                          icon={<PlusCircleOutlined />}
                          aria-label="Start a new project"
                        >
                          Start New Project
                        </Button>
                      </Link>
                      <Link href="/dashboard/rg/team/invite?demo=true" style={{ width: '100%' }}>
                        <Button
                          block
                          icon={<UserAddOutlined />}
                          aria-label="Invite a team member"
                        >
                          Invite Team Member
                        </Button>
                      </Link>
                    </Space>
                  </Card>
                </Space>
              </Col>
            </Row>
          </>
        );

      case 'projects':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              My Projects
            </Title>
            <Link href="/dashboard/rg/projects">
              <Button type="primary">
                View All Projects
              </Button>
            </Link>
          </div>
        );

      case 'namespaces':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              My Namespaces
            </Title>
            <Row gutter={[16, 16]}>
              {userNamespaces.map((namespace) => (
                <Col xs={24} sm={12} md={8} key={namespace.id}>
                  <NamespaceCard {...namespace} />
                </Col>
              ))}
            </Row>
          </div>
        );

      case 'team':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Team Members
            </Title>
            <Link href="/dashboard/rg/team">
              <Button type="primary">
                View All Team Members
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
            <div role="feed" aria-label="Review group activity log">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
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
      title="Review Group Admin"
      subtitle={userReviewGroups.map(rg => rg.name).join(', ')}
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
