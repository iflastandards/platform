'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Alert,
  Skeleton,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  List,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  CloudUploadOutlined,
  BarChartOutlined,
  TeamOutlined,
  LineChartOutlined,
  HomeOutlined,
  SettingOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { 
  ActivityFeed,
  type ActivityItem,
} from '@/components/common';
import { 
  getMockSession, 
  getUserNamespaces,
  mockNamespaces,
  getActiveEditorialCycles,
  getRecentActivity,
  getNamespaceStats,
  getTranslationStats,
  type MockUser,
} from '@/lib/mock-data';
import { type AppUser } from '@/lib/clerk-github-auth';

const { Title, Text } = Typography;

interface RoleBasedDashboardProps {
  userId?: string;
  isDemo?: boolean;
  appUser?: AppUser;
}

export default function RoleBasedDashboard({ userId }: RoleBasedDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MockUser | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      const session = getMockSession(userId);
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    }, 500);
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {[1, 2, 3].map((n) => (
            <Col xs={24} md={8} key={n}>
              <Skeleton.Button active block style={{ height: 150 }} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 32 }}>
        <Alert message="User not found. Please log in." type="error" />
      </div>
    );
  }

  const userNamespaces = getUserNamespaces(user);
  const accessibleNamespaces = userNamespaces.map(ns => mockNamespaces[ns]).filter(Boolean);
  const isAdmin = user.publicMetadata.iflaRole === 'admin';
  const activeCycles = getActiveEditorialCycles();
  const stats = getNamespaceStats();
  const translationStats = getTranslationStats();

  // Convert mock activity logs to ActivityItem format
  const recentActivities: ActivityItem[] = getRecentActivity(10).map(log => ({
    id: log.id,
    type: log.log_name as ActivityItem['type'],
    title: log.description,
    timestamp: log.created_at,
    user: log.causer_id !== 'system' ? {
      id: log.causer_id,
      name: log.causer_id === 'user-admin-1' ? 'Sarah Administrator' :
            log.causer_id === 'user-editor-1' ? 'Maria Editor' :
            log.causer_id === 'user-translator-1' ? 'Pierre Translator' :
            'Unknown User',
    } : undefined,
    metadata: log.properties.attributes,
  }));

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <HomeOutlined />
          Overview
        </span>
      ),
      children: (
        <>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <Title level={2}>Welcome back, {user.name}</Title>
            <Space wrap>
              <Tag color={user.publicMetadata.iflaRole === 'admin' ? 'red' : 'blue'}>
                {user.publicMetadata.iflaRole || 'member'}
              </Tag>
              {user.publicMetadata.reviewGroupAdmin?.map(group => (
                <Tag key={group} color="green">
                  {group} Admin
                </Tag>
              ))}
              {user.publicMetadata.externalContributor && (
                <Tag color="orange">External Contributor</Tag>
              )}
            </Space>
          </div>

          {/* Quick Stats for Admins */}
          {isAdmin && (
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Active Namespaces"
                    value={stats.active}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Editorial Cycles"
                    value={activeCycles.length}
                    prefix={<LineChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Elements"
                    value={stats.totalElements}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Languages"
                    value={translationStats.totalLanguages}
                    suffix="languages"
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Your Namespaces */}
          <Card
            title="Your Namespaces"
            extra={<Button type="link">View All</Button>}
            style={{ marginBottom: 32 }}
          >
            <List
              dataSource={accessibleNamespaces}
              renderItem={(namespace) => (
                <List.Item
                  actions={[
                    <Button key="view" type="link">View</Button>,
                    <Button key="edit" type="link">Edit</Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={namespace.name}
                    description={`${namespace.statistics.elements} elements • ${namespace.statistics.translations} translations`}
                  />
                  <Tag color={namespace.status === 'active' ? 'green' : namespace.status === 'maintenance' ? 'orange' : 'default'}>
                    {namespace.status}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            <ActivityFeed activities={recentActivities} />
          </Card>
        </>
      ),
    },
    {
      key: 'namespaces',
      label: (
        <span>
          <FolderOutlined />
          Your Namespaces ({accessibleNamespaces.length})
        </span>
      ),
      children: (
        <div>
          <Title level={3}>Your Namespaces</Title>
          <Row gutter={[16, 16]}>
            {accessibleNamespaces.map(namespace => (
              <Col xs={24} md={12} lg={8} key={namespace.id}>
                <Card
                  title={namespace.name}
                  extra={<Button type="link">Manage</Button>}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text type="secondary">{namespace.description}</Text>
                    <div>
                      <Tag>{namespace.statistics.elements} elements</Tag>
                      <Tag>{namespace.statistics.translations} translations</Tag>
                    </div>
                    <Tag color={namespace.status === 'active' ? 'green' : namespace.status === 'maintenance' ? 'orange' : 'default'}>
                      {namespace.status}
                    </Tag>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
  ];

  if (isAdmin) {
    tabItems.push(
      {
        key: 'activity',
        label: (
          <span>
            <LineChartOutlined />
            All Activity
          </span>
        ),
        children: (
          <div>
            <Title level={3}>System Activity</Title>
            <ActivityFeed activities={recentActivities} showUser />
          </div>
        ),
      },
      {
        key: 'actions',
        label: (
          <span>
            <SettingOutlined />
            Quick Actions
          </span>
        ),
        children: (
          <div>
            <Title level={3}>Quick Actions</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={6}>
                <Card hoverable>
                  <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    <PlusOutlined style={{ fontSize: 32 }} />
                    <Text>Create Namespace</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Card hoverable>
                  <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    <CloudUploadOutlined style={{ fontSize: 32 }} />
                    <Text>Import Data</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Card hoverable>
                  <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    <TeamOutlined style={{ fontSize: 32 }} />
                    <Text>Manage Users</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12} lg={6}>
                <Card hoverable>
                  <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    <SettingOutlined style={{ fontSize: 32 }} />
                    <Text>System Settings</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        ),
      }
    );
  }

  return (
    <div>
      <Tabs
        activeKey={selectedTab}
        onChange={setSelectedTab}
        items={tabItems}
      />
    </div>
  );
}