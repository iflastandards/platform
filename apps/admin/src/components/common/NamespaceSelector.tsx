'use client';

import React from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Skeleton,
  Avatar,
  Row,
  Col,
  Space,
  Statistic,
} from 'antd';
import {
  BookOutlined,
  ReadOutlined,
  ApartmentOutlined,
  InboxOutlined,
  TranslationOutlined,
  CodeOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { type MockNamespace } from '@/lib/mock-data';

const { Text, Title, Paragraph } = Typography;

interface NamespaceSelectorProps {
  namespaces: MockNamespace[];
  userRole?: string;
  onSelect?: (namespace: MockNamespace) => void;
  loading?: boolean;
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  MenuBook: <BookOutlined />,
  AutoStories: <ReadOutlined />,
  AccountTree: <ApartmentOutlined />,
  Archive: <InboxOutlined />,
  Translate: <TranslationOutlined />,
  DataObject: <CodeOutlined />,
};

export function NamespaceSelector({ 
  namespaces, 
  userRole, 
  onSelect,
  loading = false 
}: NamespaceSelectorProps) {
  const router = useRouter();

  const handleNamespaceClick = (namespace: MockNamespace) => {
    if (onSelect) {
      onSelect(namespace);
    } else {
      // Default navigation
      router.push(`/dashboard/${userRole || 'viewer'}/${namespace.slug}`);
    }
  };

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((n) => (
          <Col xs={24} sm={12} md={8} key={n}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {namespaces.map((namespace) => {
        const icon = iconMap[namespace.icon] || <BookOutlined />;
        
        return (
          <Col xs={24} sm={12} md={8} key={namespace.id}>
            <Card 
              hoverable
              style={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={() => handleNamespaceClick(namespace)}
            >
              <Space align="start" style={{ marginBottom: 16, width: '100%' }}>
                <Avatar
                  size={56}
                  icon={icon}
                  style={{
                    backgroundColor: namespace.color,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Title level={4} style={{ marginBottom: 4 }}>
                    {namespace.name}
                  </Title>
                  <Text type="secondary">
                    {namespace.reviewGroupName}
                  </Text>
                </div>
              </Space>

              <Paragraph 
                type="secondary" 
                style={{ marginBottom: 16 }}
                ellipsis={{ rows: 2 }}
              >
                {namespace.description}
              </Paragraph>

              <Space wrap style={{ marginBottom: 16 }}>
                <Tag 
                  color={
                    namespace.status === 'active' ? 'success' :
                    namespace.status === 'maintenance' ? 'warning' : 'default'
                  }
                >
                  {namespace.status}
                </Tag>
                <Tag>v{namespace.currentVersion}</Tag>
                {userRole && (
                  <Tag color="blue">
                    {userRole}
                  </Tag>
                )}
              </Space>

              <Row gutter={8} style={{ marginTop: 'auto' }}>
                <Col span={8}>
                  <Statistic 
                    value={namespace.statistics.elements} 
                    suffix="elements"
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    value={namespace.statistics.concepts} 
                    suffix="concepts"
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    value={namespace.statistics.contributors} 
                    suffix="users"
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
              </Row>

              <Button 
                type="link" 
                style={{ 
                  marginTop: 16,
                  padding: 0,
                  marginLeft: 'auto',
                  display: 'block',
                  textAlign: 'right'
                }}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                View Dashboard
              </Button>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}