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
  Statistic,
} from 'antd';
import {
  EditOutlined,
  UploadOutlined,
  DownloadOutlined,
  FolderOutlined,
  ProjectOutlined,
  LineChartOutlined,
  GithubOutlined,
  BuildOutlined,
  TranslationOutlined,
  FileSearchOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';
import { TabBasedDashboardLayout, NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

const { Text, Title } = Typography;
const { Item: ListItem } = List;

interface EditorDashboardProps {
  user: AppUser;
}

export default function EditorDashboard({ user }: EditorDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const userProjects = Object.values(user.projects);
  const editorProjects = userProjects.filter(p => p.role === 'lead' || p.role === 'editor');
  const accessibleNamespaces = user.accessibleNamespaces;

  // Get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'lead': return 'Project Lead';
      case 'editor': return 'Editor';
      default: return role;
    }
  };

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: HomeOutlined },
    { id: 'projects', label: 'My Projects', icon: ProjectOutlined, badge: editorProjects.length },
    { id: 'namespaces', label: 'Namespaces', icon: FolderOutlined, badge: accessibleNamespaces.length },
    { id: 'editorial', label: 'Editorial Tools', icon: EditOutlined },
    { id: 'import-export', label: 'Import/Export', icon: UploadOutlined },
    { id: 'review', label: 'Review Queue', icon: FileSearchOutlined },
    { id: 'translation', label: 'Translations', icon: TranslationOutlined },
    { id: 'system', label: 'System Status', icon: BuildOutlined },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                Editor Dashboard
              </Title>
              <Text type="secondary">
                Welcome, {user.name}. You have editorial control over projects, namespaces, and export/import workflows.
              </Text>
            </div>

            {/* Alert for Editor Responsibilities */}
            <Alert 
              message="Editor Responsibilities"
              description="As an editor, you have extensive control over project management, namespace configuration, and vocabulary export/import workflows. Use these tools to maintain quality and consistency across IFLA standards."
              type="info" 
              showIcon 
              style={{ marginBottom: 24 }}
            />

            {/* Quick Actions */}
            <Card title="Quick Actions" style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Link href="/import" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      block
                      size="large"
                      aria-label="Import vocabulary from external source"
                    >
                      Import Vocabulary
                    </Button>
                  </Link>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Link href="/export" style={{ width: '100%' }}>
                    <Button
                      icon={<DownloadOutlined />}
                      block
                      size="large"
                      aria-label="Export vocabulary to Google Sheets"
                    >
                      Export to Sheets
                    </Button>
                  </Link>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Link href="/namespaces" style={{ width: '100%' }}>
                    <Button
                      icon={<SettingOutlined />}
                      block
                      size="large"
                      aria-label="Manage namespace configurations"
                    >
                      Manage Namespaces
                    </Button>
                  </Link>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Link href="/github" style={{ width: '100%' }}>
                    <Button
                      icon={<GithubOutlined />}
                      block
                      size="large"
                      aria-label="Configure GitHub integration"
                    >
                      GitHub Integration
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card>

            {/* Overview Stats */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{ 
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  role="region"
                  aria-labelledby="projects-stat"
                >
                  <Space align="start" style={{ marginBottom: 16 }}>
                    <ProjectOutlined style={{ fontSize: 24, color: '#1890ff' }} aria-hidden="true" />
                    <Title id="projects-stat" level={5} style={{ margin: 0 }}>
                      Projects
                    </Title>
                  </Space>
                  <Statistic
                    value={editorProjects.length}
                    valueStyle={{ fontWeight: 'bold' }}
                  />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    As lead or editor
                  </Text>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{ 
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  role="region"
                  aria-labelledby="namespaces-stat"
                >
                  <Space align="start" style={{ marginBottom: 16 }}>
                    <FolderOutlined style={{ fontSize: 24, color: '#722ed1' }} aria-hidden="true" />
                    <Title id="namespaces-stat" level={5} style={{ margin: 0 }}>
                      Namespaces
                    </Title>
                  </Space>
                  <Statistic
                    value={accessibleNamespaces.length}
                    valueStyle={{ fontWeight: 'bold' }}
                  />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    Accessible to you
                  </Text>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{ 
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  role="region"
                  aria-labelledby="reviews-stat"
                >
                  <Space align="start" style={{ marginBottom: 16 }}>
                    <FileSearchOutlined style={{ fontSize: 24, color: '#13c2c2' }} aria-hidden="true" />
                    <Title id="reviews-stat" level={5} style={{ margin: 0 }}>
                      Pending Reviews
                    </Title>
                  </Space>
                  <Statistic
                    value={0}
                    valueStyle={{ fontWeight: 'bold' }}
                  />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    Awaiting your review
                  </Text>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{ 
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  role="region"
                  aria-labelledby="translations-stat"
                >
                  <Space align="start" style={{ marginBottom: 16 }}>
                    <TranslationOutlined style={{ fontSize: 24, color: '#52c41a' }} aria-hidden="true" />
                    <Title id="translations-stat" level={5} style={{ margin: 0 }}>
                      Translations
                    </Title>
                  </Space>
                  <Statistic
                    value={0}
                    valueStyle={{ fontWeight: 'bold' }}
                  />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    In progress
                  </Text>
                </Card>
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
            <List
              dataSource={editorProjects}
              renderItem={(project) => (
                <ListItem
                  key={project.number}
                  actions={[
                    <Link href={`/projects/${project.number}`} key="edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        aria-label={`Edit ${project.title}`}
                      />
                    </Link>
                  ]}
                >
                  <ListItem.Meta
                    avatar={<ProjectOutlined style={{ fontSize: 24 }} />}
                    title={project.title}
                    description={
                      <Space size="small">
                        <Tag color="blue">
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
                emptyText: "You don't have any projects with editor or lead roles"
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
            <List
              dataSource={accessibleNamespaces}
              renderItem={(namespace) => (
                <ListItem
                  key={namespace}
                  actions={[
                    <Link href={`/namespaces/${namespace}`} key="edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        aria-label={`Edit ${namespace.toUpperCase()} namespace`}
                      />
                    </Link>
                  ]}
                >
                  <ListItem.Meta
                    avatar={<FolderOutlined style={{ fontSize: 24 }} />}
                    title={namespace.toUpperCase()}
                    description="Vocabulary management"
                  />
                </ListItem>
              )}
            />
          </div>
        );

      case 'editorial':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Editorial Tools
            </Title>
            <List
              dataSource={[
                {
                  href: '/cycles',
                  icon: <LineChartOutlined style={{ fontSize: 24 }} />,
                  title: 'Editorial Cycles',
                  description: 'Manage vocabulary publication cycles'
                },
                {
                  href: '/review',
                  icon: <FileSearchOutlined style={{ fontSize: 24 }} />,
                  title: 'Review Queue',
                  description: 'Pending reviews and approvals'
                },
                {
                  href: '/translation',
                  icon: <TranslationOutlined style={{ fontSize: 24 }} />,
                  title: 'Translation Management',
                  description: 'Coordinate multilingual content'
                }
              ]}
              renderItem={(item) => (
                <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItem
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ListItem.Meta
                      avatar={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                  </ListItem>
                </Link>
              )}
            />
          </div>
        );

      case 'system':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              System Status
            </Title>
            <List
              dataSource={[
                {
                  icon: <BuildOutlined style={{ fontSize: 24 }} />,
                  title: 'Build Pipeline',
                  description: 'Last build: 2 hours ago',
                  status: 'Healthy',
                  statusColor: 'success'
                },
                {
                  icon: <GithubOutlined style={{ fontSize: 24 }} />,
                  title: 'GitHub Integration',
                  description: 'API status and sync',
                  status: 'Connected',
                  statusColor: 'success'
                },
                {
                  icon: <UploadOutlined style={{ fontSize: 24 }} />,
                  title: 'Import Status',
                  description: 'Active imports: 0',
                  status: 'Idle',
                  statusColor: 'default'
                }
              ]}
              renderItem={(item) => (
                <ListItem
                  extra={<Tag color={item.statusColor}>{item.status}</Tag>}
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
      title="Editor Dashboard"
      subtitle="Editorial Control Center"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
