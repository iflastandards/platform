'use client';

import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Statistic,
} from 'antd';
import Link from 'next/link';
import { getNamespacesByReviewGroup } from '@/lib/mock-data/namespaces-extended';

const { Title, Text } = Typography;

interface NamespaceCardProps {
  slug: string;
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'archived';
  currentVersion: string;
  color: string;
  statistics: {
    elements: number;
    concepts: number;
    translations: number;
    contributors: number;
  };
}

function NamespaceCard({ slug, name, description, status, currentVersion, color, statistics }: NamespaceCardProps) {
  const statusConfig = {
    active: { color: 'success', label: 'Active' },
    maintenance: { color: 'warning', label: 'Maintenance' },
    archived: { color: 'error', label: 'Archived' },
  } as const;
  
  const config = statusConfig[status];
  
  return (
    <Card style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <Title level={5} style={{ color, margin: 0 }}>
          {name}
        </Title>
        <Tag color={config.color}>
          {config.label}
        </Tag>
      </div>
      
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        {description}
      </Text>
      
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        Version {currentVersion}
      </Text>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic
            title="Items"
            value={statistics.elements + statistics.concepts}
            valueStyle={{ fontSize: 16, color: '#1890ff' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Languages"
            value={statistics.translations}
            valueStyle={{ fontSize: 16, color: '#1890ff' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Contributors"
            value={statistics.contributors}
            valueStyle={{ fontSize: 16, color: '#1890ff' }}
          />
        </Col>
      </Row>
      
      <Link href={`/dashboard/${slug}`}>
        <Button type="default" block>
          Manage Namespace
        </Button>
      </Link>
    </Card>
  );
}

export function RGNamespacesPage() {
  // In production, this would get the actual review groups from context
  const userNamespaces = getNamespacesByReviewGroup('isbd');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>My Namespaces</Title>
        <Text type="secondary">
          Manage vocabularies and namespaces under your review group
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {userNamespaces.map((namespace) => (
          <Col xs={24} sm={12} lg={8} key={namespace.id}>
            <NamespaceCard {...namespace} />
          </Col>
        ))}
      </Row>
    </div>
  );
}