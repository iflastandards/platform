'use client';

import React from 'react';
import {
  Typography,
  Card,
  Button,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  FileSearchOutlined,
  TranslationOutlined,
  FolderOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { AppUser } from '@/lib/clerk-github-auth';

interface AuthorOverviewPageProps {
  user: AppUser;
}

const { Title, Text } = Typography;

export function AuthorOverviewPage({ user }: AuthorOverviewPageProps) {
  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Author Dashboard</Title>
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
            <Link href="/dashboard/author/review">
              <Button
                type="primary"
                icon={<FileSearchOutlined />}
                block
                size="large"
                style={{ height: 56 }}
                aria-label="Go to review queue"
              >
                Review Queue
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/dashboard/author/translation">
              <Button
                icon={<TranslationOutlined />}
                block
                size="large"
                style={{ height: 56 }}
                aria-label="Go to translation tasks"
              >
                Translation Tasks
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/dashboard/author/namespaces">
              <Button
                icon={<FolderOutlined />}
                block
                size="large"
                style={{ height: 56 }}
                aria-label="Browse namespaces"
              >
                Browse Namespaces
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Link href="/cycles">
              <Button
                icon={<ClockCircleOutlined />}
                block
                size="large"
                style={{ height: 56 }}
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
}