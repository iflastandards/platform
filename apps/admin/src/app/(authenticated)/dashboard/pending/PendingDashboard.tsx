'use client';

import { useState } from 'react';
import { Typography, Alert, Button, Card, Space, Tag } from 'antd';
import {
  MailOutlined,
  GithubOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { AppUser } from '@/lib/clerk-github-auth';
import {
  TabBasedDashboardLayout,
  NavigationItem,
} from '@/components/layout/TabBasedDashboardLayout';

const { Title, Text, Paragraph } = Typography;

interface PendingDashboardProps {
  user: AppUser;
}

export default function PendingDashboard({ user }: PendingDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('status');
  const isDemo = process.env.NEXT_PUBLIC_IFLA_DEMO === 'true';

  const navigationItems: NavigationItem[] = [
    { id: 'status', label: 'Account Status', icon: ClockCircleOutlined },
    { id: 'profile', label: 'My Profile', icon: UserOutlined },
    { id: 'help', label: 'Getting Started', icon: QuestionCircleOutlined },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'status':
        return (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <ClockCircleOutlined
                style={{
                  fontSize: '64px',
                  color: '#faad14',
                  marginBottom: '16px',
                }}
                aria-hidden="true"
              />
              <Title level={2}>Welcome to IFLA Standards Admin Portal</Title>
              <Title level={4} type="secondary">
                Your account is pending assignment
              </Title>
            </div>

            <Alert
              type="info"
              message={
                <Text>
                  Hello <strong>{user.name}</strong>, your account has been
                  created successfully, but you haven&apos;t been assigned to
                  any Review Groups or Projects yet.
                </Text>
              }
              style={{ marginBottom: '32px' }}
            />

            <Card style={{ backgroundColor: '#fafafa' }}>
              <Space align="start" style={{ marginBottom: '16px' }}>
                <QuestionCircleOutlined aria-hidden="true" />
                <Title level={5} style={{ margin: 0 }}>
                  What happens next?
                </Title>
              </Space>
              <Paragraph>A Review Group administrator needs to:</Paragraph>
              <ol>
                <li>
                  <Text>
                    Add you to one or more Review Groups (GitHub Teams)
                  </Text>
                </li>
                <li>
                  <Text>
                    Assign you to specific Projects within those groups
                  </Text>
                </li>
                <li>
                  <Text>Grant you access to the relevant namespaces</Text>
                </li>
              </ol>
              <Text
                type="secondary"
                style={{ display: 'block', marginTop: '16px' }}
              >
                Once you&apos;ve been assigned, you&apos;ll automatically gain
                access to the appropriate dashboards and tools based on your
                role.
              </Text>
            </Card>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <Space size="middle">
                <Button
                  icon={<MailOutlined />}
                  href="mailto:ifla-standards-admin@ifla.org"
                  aria-label="Send email to administrator"
                >
                  Contact Administrator
                </Button>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                  aria-label="Refresh page to check for updates"
                >
                  Check Again
                </Button>
              </Space>
            </div>
          </>
        );

      case 'profile':
        return (
          <div>
            <Title level={2}>My Profile</Title>
            <Card>
              <Title level={4}>Account Information</Title>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Space>
                  <MailOutlined
                    style={{ color: 'rgba(0, 0, 0, 0.45)' }}
                    aria-hidden="true"
                  />
                  <Text>{user.email}</Text>
                </Space>
                {user.githubUsername && (
                  <Space>
                    <GithubOutlined aria-hidden="true" />
                    <Text>@{user.githubUsername}</Text>
                    {isDemo && <Tag color="warning">Demo Mode</Tag>}
                  </Space>
                )}
                <div style={{ marginTop: '16px' }}>
                  <Tag color="warning">Pending Assignment</Tag>
                </div>
              </Space>
            </Card>
          </div>
        );

      case 'help':
        return (
          <div>
            <Title level={2}>Getting Started</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card>
                <Title level={4}>About IFLA Standards Platform</Title>
                <Paragraph>
                  The IFLA Standards Platform is a collaborative environment for
                  managing and developing international library standards. Once
                  you&apos;re assigned to a Review Group, you&apos;ll be able
                  to:
                </Paragraph>
                <ul>
                  <li>
                    <Text>Access and edit vocabulary namespaces</Text>
                  </li>
                  <li>
                    <Text>Participate in review cycles</Text>
                  </li>
                  <li>
                    <Text>Contribute translations</Text>
                  </li>
                  <li>
                    <Text>Export and import vocabulary data</Text>
                  </li>
                </ul>
              </Card>

              <Card>
                <Title level={4}>Roles and Permissions</Title>
                <Paragraph>
                  The platform uses role-based access control. Common roles
                  include:
                </Paragraph>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: '100%' }}
                >
                  <Space>
                    <Tag>Maintainer</Tag>
                    <Text type="secondary">
                      - Full control over Review Group
                    </Text>
                  </Space>
                  <Space>
                    <Tag>Lead</Tag>
                    <Text type="secondary">
                      - Project management capabilities
                    </Text>
                  </Space>
                  <Space>
                    <Tag>Editor</Tag>
                    <Text type="secondary">- Content editing permissions</Text>
                  </Space>
                  <Space>
                    <Tag>Reviewer</Tag>
                    <Text type="secondary">- Review and approve changes</Text>
                  </Space>
                  <Space>
                    <Tag>Translator</Tag>
                    <Text type="secondary">
                      - Multilingual content contribution
                    </Text>
                  </Space>
                </Space>
              </Card>
            </Space>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TabBasedDashboardLayout
      title="Pending Assignment"
      subtitle="Waiting for Review Group assignment"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
