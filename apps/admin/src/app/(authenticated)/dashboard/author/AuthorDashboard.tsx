'use client';

import React, { useState } from 'react';
import {
  Typography,
  Card,
  List,
  Tag,
  Button,
  Alert,
  Row,
  Col,
  Space,
} from 'antd';
import {
  EditOutlined,
  FileSearchOutlined,
  TranslationOutlined,
  ProjectOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  GlobalOutlined,
  LineChartOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { type AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';
import { TabBasedDashboardLayout, type NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

const { Text, Title } = Typography;
const { Item: ListItem } = List;

interface AuthorDashboardProps {
  user: AppUser;
}

export default function AuthorDashboard({ user }: AuthorDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const userProjects = Object.values(user.projects);
  const authorProjects = userProjects.filter(p => p.role === 'reviewer' || p.role === 'translator');
  const {accessibleNamespaces} = user;

  // Get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'reviewer': return 'Reviewer';
      case 'translator': return 'Translator';
      default: return role;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'reviewer': return 'purple';
      case 'translator': return 'blue';
      default: return 'default';
    }
  };

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: HomeOutlined },
    { id: 'projects', label: 'My Projects', icon: ProjectOutlined, badge: authorProjects.length },
    { id: 'namespaces', label: 'Namespaces', icon: FolderOutlined, badge: accessibleNamespaces.length },
    { id: 'tasks', label: 'Active Tasks', icon: UnorderedListOutlined, badge: 6 },
    { id: 'review', label: 'Review Queue', icon: FileSearchOutlined, badge: 3 },
    { id: 'translation', label: 'Translation Tasks', icon: TranslationOutlined, badge: 2 },
    { id: 'tools', label: 'Tools & Resources', icon: ToolOutlined },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                Author Dashboard
              </Title>
              <Text type="secondary">
                Welcome, {user.name}. You have authoring responsibilities for content review and translation.
              </Text>
            </div>

            {/* Alert for Author Responsibilities */}
            <Alert 
              message="Author Responsibilities"
              description="As an author, you contribute to content quality through reviews and translations. Your expertise helps maintain the accuracy and accessibility of IFLA standards."
              type="info" 
              showIcon 
              style={{ marginBottom: 24 }}
            />

            {/* Quick Actions */}
            <Card title="Quick Actions" style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Link href="/review" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      icon={<FileSearchOutlined />}
                      block
                      size="large"
                      aria-label="Go to review queue"
                    >
                      Review Queue
                    </Button>
                  </Link>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Link href="/translation" style={{ width: '100%' }}>
                    <Button
                      icon={<TranslationOutlined />}
                      block
                      size="large"
                      aria-label="Go to translation tasks"
                    >
                      Translation Tasks
                    </Button>
                  </Link>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Link href="/namespaces" style={{ width: '100%' }}>
                    <Button
                      icon={<FolderOutlined />}
                      block
                      size="large"
                      aria-label="Browse namespaces"
                    >
                      Browse Namespaces
                    </Button>
                  </Link>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Link href="/cycles" style={{ width: '100%' }}>
                    <Button
                      icon={<LineChartOutlined />}
                      block
                      size="large"
                      aria-label="View editorial cycles"
                    >
                      Editorial Cycles
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card>
          </>
        );

      case 'projects':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              My Projects
            </Title>
            <List
              dataSource={authorProjects}
              renderItem={(project) => (
                <ListItem
                  key={project.number}
                  actions={[
                    <Link href={`/projects/${project.number}`} key="view">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        aria-label={`View ${project.title} project`}
                      />
                    </Link>
                  ]}
                >
                  <ListItem.Meta
                    avatar={<ProjectOutlined style={{ fontSize: 24 }} />}
                    title={project.title}
                    description={
                      <Space size="small">
                        <Tag color={getRoleColor(project.role)}>
                          {getRoleDisplay(project.role)}
                        </Tag>
                        <Text type="secondary">
                          {project.namespaces.length} namespaces
                        </Text>
                      </Space>
                    }
                  />
                </ListItem>
              )}
              locale={{
                emptyText: "You don't have any projects with reviewer or translator roles"
              }}
            />
          </div>
        );

      case 'namespaces':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Accessible Namespaces
            </Title>
            <Row gutter={[16, 16]}>
              {accessibleNamespaces.map((namespace) => (
                <Col xs={24} sm={12} md={8} key={namespace}>
                  <Card>
                    <Title level={4} style={{ marginBottom: 8 }}>
                      {namespace.toUpperCase()}
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                      Content to review/translate
                    </Text>
                    <Link href={`/namespaces/${namespace}`}>
                      <Button
                        type="primary"
                        block
                        aria-label={`View ${namespace.toUpperCase()} namespace`}
                      >
                        View Namespace
                      </Button>
                    </Link>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );

      case 'tasks':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Active Tasks
            </Title>
            <List
              dataSource={[
                {
                  icon: <FileSearchOutlined style={{ fontSize: 24 }} />,
                  title: 'Pending Reviews',
                  description: '3 items waiting for review',
                  count: 3,
                  color: 'warning'
                },
                {
                  icon: <TranslationOutlined style={{ fontSize: 24 }} />,
                  title: 'Translation Tasks',
                  description: '2 items need translation',
                  count: 2,
                  color: 'blue'
                },
                {
                  icon: <CommentOutlined style={{ fontSize: 24 }} />,
                  title: 'Comments to Address',
                  description: '1 comment needs response',
                  count: 1,
                  color: 'error'
                }
              ]}
              renderItem={(item) => (
                <ListItem
                  extra={<Tag color={item.color}>{item.count}</Tag>}
                >
                  <ListItem.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                </ListItem>
              )}
            />
          </div>
        );

      case 'review':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Review Queue
            </Title>
            <Alert
              message="Review Queue"
              description="You have 3 items waiting for your review. Please review and provide feedback."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Link href="/review">
              <Button
                type="primary"
                icon={<FileSearchOutlined />}
              >
                Go to Review Interface
              </Button>
            </Link>
          </div>
        );

      case 'translation':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Translation Tasks
            </Title>
            <Alert
              message="Translation Tasks"
              description="You have 2 items that need translation. Your language expertise is valuable to the community."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Link href="/translation">
              <Button
                type="primary"
                icon={<TranslationOutlined />}
              >
                Go to Translation Interface
              </Button>
            </Link>
          </div>
        );

      case 'tools':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Tools & Resources
            </Title>
            <List
              dataSource={[
                {
                  href: '/review',
                  icon: <CheckCircleOutlined style={{ fontSize: 24 }} />,
                  title: 'Review Interface',
                  description: 'Approve, reject, and comment on content'
                },
                {
                  href: '/translation',
                  icon: <GlobalOutlined style={{ fontSize: 24 }} />,
                  title: 'Translation Tools',
                  description: 'Manage multilingual content'
                },
                {
                  href: '/cycles',
                  icon: <LineChartOutlined style={{ fontSize: 24 }} />,
                  title: 'Editorial Timeline',
                  description: 'Track progress and deadlines'
                }
              ]}
              renderItem={(item) => (
                <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card
                    hoverable
                    style={{ marginBottom: 8 }}
                  >
                    <ListItem>
                      <ListItem.Meta
                        avatar={item.icon}
                        title={item.title}
                        description={item.description}
                      />
                    </ListItem>
                  </Card>
                </Link>
              )}
            />
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
      title="Author Dashboard"
      subtitle="Content Review & Translation"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
