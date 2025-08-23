'use client';

import React from 'react';
import {
  Typography,
  Card,
  Button,
  List,
  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { type AppUser } from '@/lib/clerk-github-auth';

interface SharedNamespacesPageProps {
  user: AppUser;
  role: 'author' | 'editor';
}

const { Title, Text } = Typography;

export function SharedNamespacesPage({ user, role }: SharedNamespacesPageProps) {
  const {accessibleNamespaces} = user;

  // Author view: Card layout
  if (role === 'author') {
    return (
      <div>
        <Title level={2} style={{ marginBottom: 24 }}>Accessible Namespaces</Title>
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
          {accessibleNamespaces.length === 0 && (
            <Col span={24}>
              <Text type="secondary">No namespaces currently accessible</Text>
            </Col>
          )}
        </Row>
      </div>
    );
  }

  // Editor view: List layout
  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Accessible Namespaces</Title>
      <List
        dataSource={accessibleNamespaces}
        renderItem={(namespace) => (
          <List.Item
            actions={[
              <Link key="edit" href={`/namespaces/${namespace}`}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  aria-label={`Edit ${namespace.toUpperCase()} namespace`}
                />
              </Link>,
            ]}
          >
            <List.Item.Meta
              avatar={<FolderOutlined style={{ fontSize: 20 }} />}
              title={namespace.toUpperCase()}
              description="Vocabulary management"
            />
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div>
              <Text strong>No namespaces accessible</Text>
              <br />
              <Text type="secondary">You don't have access to any namespaces</Text>
            </div>
          ),
        }}
      />
    </div>
  );
}