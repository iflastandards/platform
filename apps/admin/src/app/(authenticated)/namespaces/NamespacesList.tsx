'use client';

import React, { useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Input,
  Tag,
  Avatar,
  Row,
  Col,
  Space,
  Dropdown,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  GithubOutlined,
  ExportOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  LineChartOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  IssuesCloseOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  mockNamespaces,
  mockUsers,
  getProjectsByNamespace,
  getIssuesByProject,
} from '@/lib/mock-data';
import { mockEditorialCycles } from '@/lib/mock-data/supabase/editorial-cycles';
import { mockNightlyBuilds } from '@/lib/mock-data/supabase/nightly-builds';
import type { MenuProps } from 'antd';

const { Title, Text, Link } = Typography;

interface NamespacesListProps {
  userId?: string;
  isDemo?: boolean;
}

export default function NamespacesList({
  userId = 'user-admin-1',
  isDemo: _isDemo = false,
}: NamespacesListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Get current user
  const currentUser = mockUsers.find((u) => u.id === userId) || mockUsers[0];
  const userNamespaces = currentUser.privateMetadata.projectMemberships
    .flatMap((pm) => pm.namespaces)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Filter namespaces based on user access
  const accessibleNamespaces = Object.values(mockNamespaces).filter(
    (ns) =>
      currentUser.publicMetadata.iflaRole === 'admin' ||
      userNamespaces.includes(ns.slug),
  );

  // Filter by search
  const filteredNamespaces = accessibleNamespaces.filter(
    (ns) =>
      ns.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ns.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ns.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const navigateToNamespace = (namespaceId: string) => {
    router.push(`/namespaces/${namespaceId}?demo=true`);
  };

  const getMenuItems = (namespaceId: string): MenuProps['items'] => [
    {
      key: 'import',
      icon: <CloudUploadOutlined />,
      label: 'New Import',
      onClick: () => {
        router.push(`/import?namespace=${namespaceId}&demo=true`);
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        // Navigate to settings
      },
    },
  ];

  const renderNamespaceCard = (namespace: (typeof mockNamespaces)[0]) => {
    // Get related data
    const projects = getProjectsByNamespace(namespace.slug);
    const openIssues = projects.flatMap((p) =>
      getIssuesByProject(p.id).filter((i) => i.state === 'open'),
    );

    const latestCycle = mockEditorialCycles
      .filter((cycle) => cycle.namespace_id === `ns-${namespace.slug}`)
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
      )[0];

    const latestBuild = mockNightlyBuilds
      .filter((build) => build.namespace_id === `ns-${namespace.slug}`)
      .sort(
        (a, b) =>
          new Date(b.run_date).getTime() - new Date(a.run_date).getTime(),
      )[0];

    // Get team members
    const teamMembers = mockUsers.filter((user) =>
      user.privateMetadata.projectMemberships.some((pm) =>
        pm.namespaces.includes(namespace.slug),
      ),
    );

    return (
      <Col key={namespace.slug} xs={24} md={12} lg={8}>
        <Card
          hoverable
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          extra={
            <Dropdown
              menu={{ items: getMenuItems(namespace.slug) }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          }
        >
          <div style={{ flexGrow: 1 }}>
            <div style={{ marginBottom: '16px' }}>
              <Link
                href={`/namespaces/${namespace.slug}?demo=true`}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  navigateToNamespace(namespace.slug);
                }}
                style={{ fontSize: '16px', fontWeight: 500 }}
              >
                {namespace.name}
              </Link>
              <Text
                type="secondary"
                style={{ display: 'block', fontSize: '12px' }}
              >
                {namespace.slug}
              </Text>
            </div>

            <Text
              type="secondary"
              style={{ display: 'block', marginBottom: '16px' }}
            >
              {namespace.description}
            </Text>

            {/* Stats */}
            <Space size="middle" style={{ marginBottom: '16px' }}>
              <Space size={4}>
                <IssuesCloseOutlined
                  style={{ fontSize: '14px', color: '#8c8c8c' }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {openIssues.length} open issues
                </Text>
              </Space>
              <Space size={4}>
                <GithubOutlined
                  style={{ fontSize: '14px', color: '#8c8c8c' }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {projects.length} projects
                </Text>
              </Space>
            </Space>

            {/* Status Tags */}
            <Space size={8} style={{ marginBottom: '16px' }}>
              {latestCycle && (
                <Tag icon={<LineChartOutlined />} color="blue">
                  Cycle: {latestCycle.phase}
                </Tag>
              )}
              {latestBuild && (
                <Tag
                  icon={
                    latestBuild.status === 'success' ? (
                      <CheckCircleOutlined />
                    ) : (
                      <WarningOutlined />
                    )
                  }
                  color={
                    latestBuild.status === 'success' ? 'success' : 'warning'
                  }
                >
                  Build: {latestBuild.status}
                </Tag>
              )}
            </Space>

            {/* Team Members */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar.Group
                maxCount={4}
                maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
              >
                {teamMembers.map((member) => (
                  <Avatar key={member.id} src={member.imageUrl} size="small">
                    {member.name.charAt(0)}
                  </Avatar>
                ))}
              </Avatar.Group>
              {teamMembers.length > 4 && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  +{teamMembers.length - 4} more
                </Text>
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Space>
              <Button
                size="small"
                onClick={() => navigateToNamespace(namespace.slug)}
              >
                View Dashboard
              </Button>
              <Button
                size="small"
                icon={<ExportOutlined />}
                href={`https://github.com/iflastandards/${namespace.slug}`}
                target="_blank"
              >
                GitHub
              </Button>
            </Space>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Namespaces</Title>
        <Text type="secondary">
          Manage vocabulary namespaces and their GitHub projects
        </Text>
      </div>

      {/* Search and Actions */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <Input
          placeholder="Search namespaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ flex: 1 }}
        />
        {currentUser.publicMetadata.iflaRole === 'admin' && (
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            style={{ whiteSpace: 'nowrap' }}
          >
            New Namespace
          </Button>
        )}
      </div>

      {/* Namespace Grid */}
      {filteredNamespaces.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredNamespaces.map((namespace) =>
            renderNamespaceCard(namespace),
          )}
        </Row>
      ) : (
        <Empty
          description={
            searchQuery
              ? 'Try adjusting your search terms'
              : "You don't have access to any namespaces"
          }
        />
      )}
    </div>
  );
}
