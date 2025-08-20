'use client';

import React from 'react';
import Link from 'next/link';
import {
  Typography,
  Button,
  Card,
  Tag,
  Space,
  Avatar,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  TeamOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { reviewGroups } from '@/lib/mock-data/review-groups';

const { Title, Text } = Typography;

export function AdminReviewGroupsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Review Groups Management</Title>
        <Link href="/dashboard/admin/review-groups/new">
          <Button type="primary" icon={<TeamOutlined />}>
            Create Review Group
          </Button>
        </Link>
      </div>

      <Row gutter={[24, 24]}>
        {reviewGroups.map((group) => (
          <Col xs={24} md={12} lg={8} key={group.id}>
            <Card
              hoverable
              style={{
                height: '100%',
                position: 'relative',
                overflow: 'visible',
              }}
              styles={{
                body: { padding: '20px 24px' },
              }}
            >
              {/* Color accent bar at top */}
              <div
                style={{
                  height: 4,
                  backgroundColor: group.color,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />
              
              {/* Header with acronym badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16, marginTop: 8 }}>
                <Avatar
                  size={48}
                  style={{
                    backgroundColor: group.color,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {group.acronym}
                </Avatar>
                <div style={{ marginLeft: 16, flex: 1 }}>
                  <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                    {group.fullName}
                  </Title>
                  <Text type="secondary">{group.description}</Text>
                </div>
              </div>

              {/* Status and member count */}
              <Space style={{ marginBottom: 16 }}>
                <Tag color={group.status === 'active' ? 'success' : 'warning'}>
                  {group.status}
                </Tag>
                <Tag icon={<UserOutlined />}>
                  {group.memberCount} members
                </Tag>
              </Space>

              {/* Managed namespaces */}
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                  MANAGED NAMESPACES
                </Text>
                <Space size={[4, 8]} wrap>
                  {group.namespaces.map((namespace) => (
                    <Link key={namespace} href={`/dashboard/${namespace}`}>
                      <Tag
                        style={{
                          backgroundColor: `${group.color}15`,
                          color: group.color,
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {namespace.toUpperCase()}
                      </Tag>
                    </Link>
                  ))}
                </Space>
              </div>

              {/* Leadership info */}
              <div style={{ marginBottom: 16, flexGrow: 1 }}>
                {group.chair && (
                  <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                    <strong>Chair:</strong> {group.chair}
                  </Text>
                )}
                {group.secretary && (
                  <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                    <strong>Secretary:</strong> {group.secretary}
                  </Text>
                )}
                {group.meetingSchedule && (
                  <Space align="center" style={{ marginTop: 8 }}>
                    <ClockCircleOutlined style={{ fontSize: 14, color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {group.meetingSchedule}
                    </Text>
                  </Space>
                )}
              </div>

              {/* Action buttons */}
              <Link href={`/dashboard/rg/${group.acronym}`}>
                <Button
                  block
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                >
                  Manage Group
                </Button>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Summary statistics */}
      <Card style={{ marginTop: 32, backgroundColor: '#fafafa' }}>
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total Groups"
              value={reviewGroups.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Active Groups"
              value={reviewGroups.filter(g => g.status === 'active').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total Members"
              value={reviewGroups.reduce((sum, g) => sum + g.memberCount, 0)}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Managed Namespaces"
              value={new Set(reviewGroups.flatMap(g => g.namespaces)).size}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}