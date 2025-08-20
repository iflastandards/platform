'use client';

import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Tag,
  Row,
  Col,
  List,
  Space,
  Typography,
  Statistic,
} from 'antd';
import {
  DashboardOutlined,
  GithubOutlined,
  TeamOutlined,
  FolderOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  FileSearchOutlined,
  TranslationOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';
import { TabBasedDashboardLayout, NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

const { Text, Title } = Typography;
const { Item: ListItem } = List;

interface PersonalDashboardProps {
  user: AppUser;
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'maintainer':
      return <SafetyCertificateOutlined style={{ color: '#1890ff' }} />;
    case 'lead':
      return <ApartmentOutlined style={{ color: '#1890ff' }} />;
    case 'editor':
      return <EditOutlined style={{ color: '#722ed1' }} />;
    case 'reviewer':
      return <FileSearchOutlined style={{ color: '#13c2c2' }} />;
    case 'translator':
      return <TranslationOutlined style={{ color: '#52c41a' }} />;
    default:
      return <UserOutlined />;
  }
}

export default function PersonalDashboard({ user }: PersonalDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const projectCount = Object.keys(user.projects).length;
  const isDemo = process.env.NEXT_PUBLIC_IFLA_DEMO === 'true';

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: HomeOutlined,
    },
    {
      id: 'review-groups',
      label: 'Review Groups',
      icon: TeamOutlined,
      badge: user.reviewGroups.length,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: ApartmentOutlined,
      badge: projectCount,
    },
    {
      id: 'namespaces',
      label: 'Namespaces',
      icon: FolderOutlined,
      badge: user.accessibleNamespaces.length,
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                Welcome back, {user.name}
              </Title>
              <Space wrap>
                {user.githubUsername && (
                  <Tag
                    icon={<GithubOutlined />}
                    color="default"
                  >
                    @{user.githubUsername}
                  </Tag>
                )}
                {user.systemRole === 'admin' && (
                  <Tag
                    icon={<SafetyCertificateOutlined />}
                    color="blue"
                  >
                    System Admin
                  </Tag>
                )}
                {user.isReviewGroupAdmin && (
                  <Tag
                    icon={<TeamOutlined />}
                    color="purple"
                  >
                    Review Group Admin
                  </Tag>
                )}
                {isDemo && (
                  <Tag
                    color="warning"
                  >
                    DEMO MODE
                  </Tag>
                )}
              </Space>
            </div>

            {/* Quick Stats */}
            <Title level={3} style={{ marginBottom: 16 }}>
              Dashboard Overview
            </Title>
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
                  aria-labelledby="review-groups-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <TeamOutlined style={{ marginRight: 8, color: '#1890ff', fontSize: 20 }} aria-hidden="true" />
                    <Title id="review-groups-card" level={5} style={{ margin: 0 }}>
                      Review Groups
                    </Title>
                  </div>
                  <Statistic
                    value={user.reviewGroups.length}
                    valueStyle={{ fontWeight: 'bold' }}
                    aria-label={`You are a member of ${user.reviewGroups.length} review groups`}
                  />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    Groups you belong to
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
                  aria-labelledby="projects-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <ApartmentOutlined style={{ marginRight: 8, color: '#722ed1', fontSize: 20 }} aria-hidden="true" />
                    <Title id="projects-card" level={5} style={{ margin: 0 }}>
                      Active Projects
                    </Title>
                  </div>
                  <Statistic
                    value={projectCount}
                    valueStyle={{ fontWeight: 'bold' }}
                    aria-label={`You have ${projectCount} active projects`}
                  />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    Projects assigned to you
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
                  aria-labelledby="namespaces-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <FolderOutlined style={{ marginRight: 8, color: '#52c41a', fontSize: 20 }} aria-hidden="true" />
                    <Title id="namespaces-card" level={5} style={{ margin: 0 }}>
                      Namespaces
                    </Title>
                  </div>
                  <Statistic
                    value={user.accessibleNamespaces.length}
                    valueStyle={{ fontWeight: 'bold' }}
                    aria-label={`You have access to ${user.accessibleNamespaces.length} namespaces`}
                  />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    Accessible namespaces
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
                  aria-labelledby="role-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <DashboardOutlined style={{ marginRight: 8, color: '#13c2c2', fontSize: 20 }} aria-hidden="true" />
                    <Title id="role-card" level={5} style={{ margin: 0 }}>
                      Your Role
                    </Title>
                  </div>
                  <Statistic
                    value={user.systemRole === 'admin' ? 'System Admin' :
                           user.isReviewGroupAdmin ? 'RG Admin' : 'Member'}
                    valueStyle={{ fontWeight: 'bold', fontSize: 24 }}
                  />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    System access level
                  </Text>
                </Card>
              </Col>
            </Row>
          </>
        );

      case 'review-groups':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Your Review Group Memberships
            </Title>
            {user.reviewGroups.length > 0 ? (
              <List
                dataSource={user.reviewGroups}
                renderItem={(rg, index) => (
                  <ListItem
                    key={rg.slug}
                    style={{ borderBottom: index < user.reviewGroups.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                    actions={[
                      rg.role === 'maintainer' && (
                        <Link href={`/dashboard/rg/${rg.slug}`} key="manage">
                          <Button
                            type="default"
                            size="small"
                            aria-label={`Manage ${rg.name} review group`}
                          >
                            Manage
                          </Button>
                        </Link>
                      )
                    ].filter(Boolean)}
                  >
                    <ListItem.Meta
                      avatar={getRoleIcon(rg.role)}
                      title={rg.name}
                      description={
                        <Space wrap>
                          <Tag>{rg.role}</Tag>
                          {rg.namespaces.map(ns => (
                            <Tag key={ns} bordered={false}>{ns}</Tag>
                          ))}
                        </Space>
                      }
                    />
                  </ListItem>
                )}
              />
            ) : (
              <Alert
                message="You are not a member of any review groups. Contact an administrator to be added to a team."
                type="info"
                showIcon
              />
            )}
          </div>
        );

      case 'projects':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Your Project Assignments
            </Title>
            {projectCount > 0 ? (
              <List
                dataSource={Object.entries(user.projects)}
                renderItem={([projectId, project], index) => (
                  <ListItem
                    key={projectId}
                    style={{ borderBottom: index < Object.entries(user.projects).length - 1 ? '1px solid #f0f0f0' : 'none' }}
                    actions={[
                      <Link href={`/dashboard/project/${projectId}`} key="open">
                        <Button
                          type="primary"
                          size="small"
                          aria-label={`Open ${project.title} project`}
                        >
                          Open
                        </Button>
                      </Link>
                    ]}
                  >
                    <ListItem.Meta
                      avatar={getRoleIcon(project.role)}
                      title={project.title}
                      description={
                        <Space wrap>
                          <Tag color="blue">{project.role}</Tag>
                          <Tag>Team: {project.sourceTeam}</Tag>
                          {project.namespaces.map(ns => (
                            <Tag key={ns} bordered={false}>{ns}</Tag>
                          ))}
                        </Space>
                      }
                    />
                  </ListItem>
                )}
              />
            ) : (
              <Alert
                message="You are not assigned to any projects yet. Review Group administrators can assign you to projects."
                type="info"
                showIcon
              />
            )}
          </div>
        );

      case 'namespaces':
        return (
          <div>
            <Title level={2} style={{ marginBottom: 16 }}>
              Accessible Namespaces
            </Title>
            {user.accessibleNamespaces.length > 0 ? (
              <Row gutter={[16, 16]}>
                {user.accessibleNamespaces.map((namespace) => (
                  <Col xs={24} sm={12} md={8} key={namespace}>
                    <Card>
                      <Title level={4} style={{ marginBottom: 16 }}>
                        {namespace.toUpperCase()}
                      </Title>
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
            ) : (
              <Alert
                message="You don't have access to any namespaces. You need to be assigned to a review group or project to gain namespace access."
                type="warning"
                showIcon
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TabBasedDashboardLayout
      title="Personal Dashboard"
      subtitle="Manage your IFLA Standards work"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
