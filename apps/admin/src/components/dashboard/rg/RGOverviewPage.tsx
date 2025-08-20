'use client';

import Link from 'next/link';
import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UserAddOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { getNamespacesByReviewGroup } from '@/lib/mock-data/namespaces-extended';
import { reviewGroups as allReviewGroups } from '@/lib/mock-data/review-groups';

const { Title, Text } = Typography;

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

function StatsCard({ title, value, change, changeType }: StatsCardProps) {
  const changeColor = 
    changeType === 'increase' ? '#52c41a' : 
    changeType === 'decrease' ? '#ff4d4f' : 
    '#8c8c8c';
  
  return (
    <Card>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        {title}
      </Text>
      <Statistic
        value={value}
        valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
      />
      <Text style={{ color: changeColor, marginTop: 8, display: 'block' }}>
        {change}
      </Text>
    </Card>
  );
}

interface ActivityItemProps {
  action: string;
  author: string;
  time: string;
  type: 'project' | 'user' | 'namespace' | 'vocabulary' | 'profile';
}

function ActivityItem({ action, author, time, type }: ActivityItemProps) {
  const typeIcons = {
    project: '📁',
    user: '👤',
    namespace: '📦',
    vocabulary: '📚',
    profile: '📋',
  };
  
  return (
    <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
      <Space align="start" size={16}>
        <Text style={{ fontSize: 24 }}>{typeIcons[type]}</Text>
        <div style={{ flex: 1 }}>
          <Text strong>{action}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            By {author} • {time}
          </Text>
        </div>
      </Space>
    </div>
  );
}

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
    <Link href={`/dashboard/${slug}`}>
      <Card 
        hoverable
        style={{ height: '100%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Title level={5} style={{ color, margin: 0 }}>{name}</Title>
          <Tag color={config.color} style={{ fontWeight: 600 }}>
            {config.label}
          </Tag>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          {description}
        </Text>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
          Version {currentVersion}
        </Text>
        
        <Row gutter={16}>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic
              value={statistics.elements + statistics.concepts}
              valueStyle={{ fontSize: 14, color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: 10 }}>Items</Text>
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic
              value={statistics.translations}
              valueStyle={{ fontSize: 14, color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: 10 }}>Languages</Text>
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic
              value={statistics.contributors}
              valueStyle={{ fontSize: 14, color: '#722ed1' }}
            />
            <Text type="secondary" style={{ fontSize: 10 }}>Contributors</Text>
          </Col>
        </Row>
      </Card>
    </Link>
  );
}

interface RGOverviewPageProps {
  reviewGroupName: string;
}

export function RGOverviewPage({ reviewGroupName = 'ISBD' }: RGOverviewPageProps) {
  const reviewGroup = allReviewGroups.find(rg => rg.acronym === reviewGroupName) || allReviewGroups[0];
  const namespaces = getNamespacesByReviewGroup(reviewGroupName);
  
  const stats = [
    { title: 'Active Projects', value: 4, change: '+1 this month', changeType: 'increase' as const },
    { title: 'Team Members', value: reviewGroup.memberCount, change: 'No change', changeType: 'neutral' as const },
    { title: 'Namespaces', value: namespaces.length, change: '+2 this quarter', changeType: 'increase' as const },
  ];

  const recentActivity = [
    { action: `${reviewGroupName} translation milestone completed`, author: 'Maria Editor', time: '2 hours ago', type: 'project' as const },
    { action: `New team member joined ${reviewGroupName} Review Group`, author: 'John Smith', time: '1 day ago', type: 'user' as const },
    { action: `${reviewGroupName}/M vocabulary updated`, author: 'Sarah Wilson', time: '2 days ago', type: 'vocabulary' as const },
    { action: 'Review group meeting notes published', author: 'You', time: '3 days ago', type: 'project' as const },
    { action: `${reviewGroupName} namespace export completed`, author: 'System', time: '4 days ago', type: 'namespace' as const },
  ];

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>{reviewGroup.fullName} Dashboard</Title>
        <Text type="secondary">Manage review group activities and namespaces</Text>
      </div>

      {/* Stats Grid */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((stat) => (
          <Col xs={24} sm={8} key={stat.title}>
            <StatsCard {...stat} />
          </Col>
        ))}
      </Row>

      {/* Managed Namespaces */}
      <Card title="Managed Namespaces" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {namespaces.map((ns) => (
            <Col xs={24} sm={12} lg={8} key={ns.slug}>
              <NamespaceCard {...ns} />
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Recent Activity */}
        <Col xs={24} lg={16}>
          <Card title="Recent Activity">
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Link href="/dashboard/rg/activity" style={{ color: '#1890ff', fontSize: 14 }}>
                View all activity →
              </Link>
            </div>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card title="Quick Actions">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Link href="/dashboard/rg/projects/new">
                <Button
                  type="primary"
                  block
                  icon={<PlusCircleOutlined />}
                >
                  Create Project
                </Button>
              </Link>
              <Link href="/dashboard/rg/members/invite">
                <Button
                  block
                  icon={<UserAddOutlined />}
                >
                  Invite Member
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
}