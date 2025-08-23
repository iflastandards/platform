'use client';

import { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Tag,
  Avatar,
  Badge,
  Dropdown,
  Progress,
  Row,
  Col,
  Space,
  Statistic,
  Empty,
  type MenuProps,
} from 'antd';
import {
  GithubOutlined,
  ProjectOutlined,
  ReloadOutlined,
  MoreOutlined,
  CloudUploadOutlined,
  EditOutlined,
  TranslationOutlined,
  LineChartOutlined,
  BuildOutlined,
  ExportOutlined,
  CommentOutlined,
  DashboardOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import {
  mockNamespaces,
  getProjectsByNamespace,
  getIssuesByProject,
} from '@/lib/mock-data';
import { mockEditorialCycles } from '@/lib/mock-data/supabase/editorial-cycles';
import { mockNightlyBuilds } from '@/lib/mock-data/supabase/nightly-builds';
import { mockImportJobs } from '@/lib/mock-data/supabase/import-jobs';
import { ActivityFeed, StatusChip } from '@/components/common';
import {
  TabBasedDashboardLayout,
  type NavigationItem,
} from '@/components/layout/TabBasedDashboardLayout';

const { Title, Text, Link, Paragraph } = Typography;

interface NamespaceDashboardProps {
  namespace: string;
  userId?: string;
  isDemo?: boolean;
}

export default function NamespaceDashboard({
  namespace,
  userId: _userId = 'user-admin-1',
  isDemo: _isDemo = false,
}: NamespaceDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [_selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get namespace data
  const namespaceData = Object.values(mockNamespaces).find(
    (ns) => ns.slug === namespace,
  );
  if (!namespaceData) {
    return <Text>Namespace not found</Text>;
  }

  // Get related data
  const projects = getProjectsByNamespace(namespace);
  const allIssues = projects.flatMap((project) =>
    getIssuesByProject(project.id).map((issue) => ({
      ...issue,
      projectName: project.name,
      projectId: project.id,
    })),
  );

  // Get latest cycle and build
  const latestCycle = mockEditorialCycles
    .filter((cycle) => cycle.namespace_id === `ns-${namespace}`)
    .sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    )[0];

  const latestBuild = mockNightlyBuilds
    .filter((build) => build.namespace_id === `ns-${namespace}`)
    .sort(
      (a, b) => new Date(b.run_date).getTime() - new Date(a.run_date).getTime(),
    )[0];

  // Get active imports
  const activeImports = mockImportJobs.filter(
    (job) =>
      job.namespace_id === namespace &&
      (job.status === 'pending' || job.status === 'processing'),
  );

  // Convert data for ActivityFeed
  const recentActivity = allIssues
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 10)
    .map((issue) => ({
      id: `issue-${issue.number}`,
      type: issue.labels.includes('import-request')
        ? ('import' as const)
        : issue.labels.includes('validation')
          ? ('validation' as const)
          : issue.labels.includes('translation')
            ? ('translation' as const)
            : ('edit' as const),
      title: issue.title,
      description: `${issue.projectName} • ${issue.state}`,
      user: issue.assignee
        ? {
            id: issue.assignee,
            name: issue.assignee,
            avatar: `https://i.pravatar.cc/150?u=${issue.assignee}`,
          }
        : undefined,
      timestamp: issue.updated_at,
      metadata: {
        issue: `#${issue.number}`,
        repository: issue.repository_url.split('/').pop() || 'unknown',
      },
      link: {
        href: issue.html_url,
        label: 'View on GitHub',
      },
    }));

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const issueMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Issue',
    },
    {
      key: 'translate',
      icon: <TranslationOutlined />,
      label: 'Request Translation',
    },
    {
      key: 'build',
      icon: <BuildOutlined />,
      label: 'Trigger Build',
    },
  ];

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: DashboardOutlined },
    {
      id: 'issues',
      label: 'GitHub Issues',
      icon: GithubOutlined,
      badge: allIssues.filter((i) => i.state === 'open').length,
    },
    { id: 'activity', label: 'Recent Activity', icon: LineChartOutlined },
    {
      id: 'projects',
      label: 'Projects',
      icon: ProjectOutlined,
      badge: projects.length,
    },
    { id: 'metrics', label: 'Metrics', icon: BarChartOutlined },
  ];

  const renderIssueCard = (issue: any) => {
    const labelColorMap: Record<string, string> = {
      'import-request': 'blue',
      validation: 'success',
      translation: 'cyan',
      bug: 'error',
      enhancement: 'purple',
    };

    return (
      <Card key={`issue-${issue.number}`} style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: 1 }}>
            <Title level={4}>
              <Link
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {issue.title}
              </Link>
            </Title>
            <Space size="small">
              <Text type="secondary">#{issue.number}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{issue.projectName}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">
                opened {format(new Date(issue.created_at), 'MMM d, yyyy')}
              </Text>
            </Space>
          </div>
          <Dropdown
            menu={{
              items: issueMenuItems,
              onClick: () => setSelectedIssue(`issue-${issue.number}`),
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </div>

        <Paragraph ellipsis={{ rows: 2 }}>
          {issue.body || 'No description provided'}
        </Paragraph>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
          }}
        >
          <Space size="small">
            {issue.labels.map((label: string) => (
              <Tag
                key={label}
                color={labelColorMap[label] || 'default'}
                icon={
                  label === 'import-request' ? (
                    <CloudUploadOutlined />
                  ) : undefined
                }
              >
                {label}
              </Tag>
            ))}
          </Space>
          <Space size="small">
            {issue.assignee && (
              <Avatar
                size="small"
                src={`https://i.pravatar.cc/150?u=${issue.assignee}`}
              >
                {issue.assignee.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Space size={4}>
              <CommentOutlined />
              <Text type="secondary">{issue.comments}</Text>
            </Space>
          </Space>
        </div>
      </Card>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div>
                <Title level={2}>{namespaceData.name}</Title>
                <Text type="secondary">{namespaceData.description}</Text>
              </div>
              <Space>
                <Button
                  icon={<ReloadOutlined spin={refreshing} />}
                  onClick={handleRefresh}
                  loading={refreshing}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  href={`/import?namespace=${namespace}&demo=true`}
                >
                  New Import
                </Button>
              </Space>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Open Issues"
                    value={allIssues.filter((i) => i.state === 'open').length}
                    prefix={<ProjectOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Active Projects"
                    value={projects.filter((p) => p.state === 'open').length}
                    prefix={<GithubOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Editorial Phase"
                    value={latestCycle?.phase || 'None'}
                    valueStyle={{ fontSize: '24px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Build Status"
                    value={latestBuild?.status || 'Unknown'}
                    valueStyle={{
                      fontSize: '24px',
                      color:
                        latestBuild?.status === 'success'
                          ? '#52c41a'
                          : '#faad14',
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Active Imports */}
            {activeImports.length > 0 && (
              <Card
                title="Active Imports"
                extra={<Tag color="processing">In Progress</Tag>}
                style={{ marginBottom: '24px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {activeImports.map((job) => (
                    <div key={job.id}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <div>
                          <Text strong>
                            {job.google_sheet_url.split('/').pop()}
                          </Text>
                          <Text type="secondary" style={{ marginLeft: '8px' }}>
                            {job.status === 'processing'
                              ? 'Processing...'
                              : 'Queued'}
                          </Text>
                        </div>
                        <Text type="secondary">
                          {format(new Date(job.started_at), 'MMM d, h:mm a')}
                        </Text>
                      </div>
                      {job.status === 'processing' && (
                        <Progress percent={75} status="active" />
                      )}
                    </div>
                  ))}
                </Space>
              </Card>
            )}

            {/* Recent Activity and Build Status */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card
                  title="Recent Activity"
                  extra={
                    <Button
                      type="link"
                      href="#"
                      onClick={() => setSelectedTab('activity')}
                    >
                      View All
                    </Button>
                  }
                >
                  <ActivityFeed activities={recentActivity.slice(0, 5)} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Latest Build Details">
                  {latestBuild ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text>Status</Text>
                        <StatusChip
                          status={
                            latestBuild.status === 'success'
                              ? 'active'
                              : 'error'
                          }
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text>Date</Text>
                        <Text>
                          {format(
                            new Date(latestBuild.run_date),
                            'MMM d, yyyy h:mm a',
                          )}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text>Changes</Text>
                        <Text>{latestBuild.changes.total}</Text>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text>Errors</Text>
                        <Text>{latestBuild.validation_summary.errors}</Text>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text>Warnings</Text>
                        <Text>{latestBuild.validation_summary.warnings}</Text>
                      </div>
                      <Button
                        type="link"
                        icon={<ExportOutlined />}
                        href={latestBuild.artifact_path || '#'}
                        target="_blank"
                        style={{ padding: 0, marginTop: '8px' }}
                      >
                        View Build Artifacts
                      </Button>
                    </Space>
                  ) : (
                    <Empty description="No build data available" />
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 'issues':
        return (
          <div>
            <Title level={2}>GitHub Issues</Title>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <Space>
                <Badge
                  count={allIssues.filter((i) => i.state === 'open').length}
                  showZero
                >
                  <Tag>Open</Tag>
                </Badge>
                <Badge
                  count={allIssues.filter((i) => i.state === 'closed').length}
                  showZero
                >
                  <Tag>Closed</Tag>
                </Badge>
              </Space>
              <Space>
                <Tag style={{ cursor: 'pointer' }} onClick={() => {}}>
                  Import Requests
                </Tag>
                <Tag style={{ cursor: 'pointer' }} onClick={() => {}}>
                  Validation
                </Tag>
              </Space>
            </div>
            {allIssues.map((issue) => renderIssueCard(issue))}
          </div>
        );

      case 'activity':
        return (
          <div>
            <Title level={2}>Recent Activity</Title>
            <ActivityFeed activities={recentActivity.slice(0, 20)} />
          </div>
        );

      case 'projects':
        return (
          <div>
            <Title level={2}>Projects</Title>
            <Row gutter={[16, 16]}>
              {projects.map((project) => (
                <Col key={project.id} xs={24} md={12}>
                  <Card>
                    <Title level={4}>{project.name}</Title>
                    <Paragraph type="secondary">{project.body}</Paragraph>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <StatusChip
                        status={
                          project.state === 'open' ? 'active' : 'completed'
                        }
                      />
                      <Button
                        size="small"
                        icon={<ExportOutlined />}
                        href={`https://github.com/iflastandards/${namespace}/projects/${project.number}`}
                        target="_blank"
                      >
                        View Project
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );

      case 'metrics':
        return (
          <div>
            <Title level={2}>Metrics</Title>
            <Text type="secondary">Metrics dashboard coming soon...</Text>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TabBasedDashboardLayout
      title={namespaceData.name}
      subtitle={namespaceData.description}
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
