'use client';

import React from 'react';
import {
  Typography,
  Card,
  Button,
  Alert,
  Row,
  Col,
  Space,
  Statistic,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  SettingOutlined,
  GithubOutlined,
  ProjectOutlined,
  FolderOutlined,
  FileSearchOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { type AppUser } from '@/lib/clerk-github-auth';

interface EditorOverviewPageProps {
  user: AppUser;
}

const { Title, Text } = Typography;

export function EditorOverviewPage({ user }: EditorOverviewPageProps) {
  const userProjects = Object.values(user.projects);
  const editorProjects = userProjects.filter(p => p.role === 'lead' || p.role === 'editor');
  const {accessibleNamespaces} = user;

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Editor Dashboard</Title>
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
            <Link href="/dashboard/editor/import-export">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                block
                size="large"
                style={{ height: 56 }}
                aria-label="Import vocabulary from external source"
              >
                Import Vocabulary
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/dashboard/editor/import-export">
              <Button
                icon={<DownloadOutlined />}
                block
                size="large"
                style={{ height: 56 }}
                aria-label="Export vocabulary to Google Sheets"
              >
                Export to Sheets
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/dashboard/editor/namespaces">
              <Button
                icon={<SettingOutlined />}
                block
                size="large"
                style={{ height: 56 }}
                aria-label="Manage namespace configurations"
              >
                Manage Namespaces
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/github">
              <Button
                icon={<GithubOutlined />}
                block
                size="large"
                style={{ height: 56 }}
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
            style={{ minHeight: 140 }}
            role="region"
            aria-labelledby="projects-stat"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <ProjectOutlined style={{ fontSize: 24, color: '#1890ff' }} aria-hidden="true" />
                <Title id="projects-stat" level={5} style={{ margin: 0 }}>
                  Projects
                </Title>
              </Space>
              <Statistic
                value={editorProjects.length}
                suffix={<Text type="secondary" style={{ fontSize: 14 }}>As lead or editor</Text>}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{ minHeight: 140 }}
            role="region"
            aria-labelledby="namespaces-stat"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <FolderOutlined style={{ fontSize: 24, color: '#52c41a' }} aria-hidden="true" />
                <Title id="namespaces-stat" level={5} style={{ margin: 0 }}>
                  Namespaces
                </Title>
              </Space>
              <Statistic
                value={accessibleNamespaces.length}
                suffix={<Text type="secondary" style={{ fontSize: 14 }}>Accessible to you</Text>}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{ minHeight: 140 }}
            role="region"
            aria-labelledby="reviews-stat"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <FileSearchOutlined style={{ fontSize: 24, color: '#722ed1' }} aria-hidden="true" />
                <Title id="reviews-stat" level={5} style={{ margin: 0 }}>
                  Pending Reviews
                </Title>
              </Space>
              <Statistic
                value={0}
                suffix={<Text type="secondary" style={{ fontSize: 14 }}>Awaiting your review</Text>}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{ minHeight: 140 }}
            role="region"
            aria-labelledby="translations-stat"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <TranslationOutlined style={{ fontSize: 24, color: '#fa8c16' }} aria-hidden="true" />
                <Title id="translations-stat" level={5} style={{ margin: 0 }}>
                  Translations
                </Title>
              </Space>
              <Statistic
                value={0}
                suffix={<Text type="secondary" style={{ fontSize: 14 }}>In progress</Text>}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
}