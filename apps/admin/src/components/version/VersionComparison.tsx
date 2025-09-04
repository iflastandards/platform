'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Tabs,
  Alert,
  Space,
  List,
  Row,
  Col,
  Badge,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Link } = Typography;
const { TabPane } = Tabs;

interface Version {
  id: string;
  version: string;
  status: string;
  createdDate: string;
  author: string;
  description: string;
  changelog: ChangelogEntry[];
  fileCount: number;
  conceptCount: number;
  propertyCount: number;
}

interface ChangelogEntry {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  impact?: 'breaking' | 'minor' | 'patch';
}

interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'removed';
  linesAdded: number;
  linesRemoved: number;
  preview?: string;
}

interface ConceptDiff {
  conceptId: string;
  label: string;
  status: 'added' | 'modified' | 'removed';
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

interface VersionComparisonProps {
  version1: Version;
  version2: Version;
  onClose?: () => void;
}

export default function VersionComparison({
  version1,
  version2,
  onClose,
}: VersionComparisonProps) {
  const [activeTab, setActiveTab] = useState('changelog');

  // Mock data for demonstration
  const fileDiffs: FileDiff[] = [
    {
      path: 'vocabulary/elements.ttl',
      status: 'modified',
      linesAdded: 23,
      linesRemoved: 8,
      preview: 'Added new elements for digital resources...',
    },
    {
      path: 'vocabulary/areas.ttl',
      status: 'modified',
      linesAdded: 5,
      linesRemoved: 2,
      preview: 'Updated area 7 definitions...',
    },
    {
      path: 'vocabulary/deprecated.ttl',
      status: 'added',
      linesAdded: 15,
      linesRemoved: 0,
      preview: 'Added deprecated concepts list...',
    },
  ];

  const conceptDiffs: ConceptDiff[] = [
    {
      conceptId: 'isbd:P1001',
      label: 'Title proper',
      status: 'modified',
      changes: [
        {
          field: 'definition',
          oldValue: 'The chief name of a resource...',
          newValue:
            'The main title of a resource, including any alternative title...',
        },
      ],
    },
    {
      conceptId: 'isbd:P1025',
      label: 'Digital representation',
      status: 'added',
      changes: [],
    },
    {
      conceptId: 'isbd:P1010_old',
      label: 'Obsolete element',
      status: 'removed',
      changes: [],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <PlusOutlined style={{ color: '#52c41a' }} />;
      case 'removed':
        return <MinusOutlined style={{ color: '#ff4d4f' }} />;
      case 'modified':
        return <EditOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'success';
      case 'removed':
        return 'error';
      case 'modified':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'success';
      case 'changed':
        return 'processing';
      case 'deprecated':
        return 'warning';
      case 'removed':
        return 'error';
      case 'fixed':
        return 'blue';
      case 'security':
        return 'red';
      default:
        return 'default';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'breaking':
        return 'error';
      case 'minor':
        return 'warning';
      case 'patch':
        return 'processing';
      default:
        return 'default';
    }
  };

  const totalChanges = fileDiffs.length + conceptDiffs.length;
  const additionsCount = [...fileDiffs, ...conceptDiffs].filter(
    (item) => item.status === 'added',
  ).length;
  const modificationsCount = [...fileDiffs, ...conceptDiffs].filter(
    (item) => item.status === 'modified',
  ).length;
  const removalsCount = [...fileDiffs, ...conceptDiffs].filter(
    (item) => item.status === 'removed',
  ).length;

  const fileColumns = [
    {
      title: 'File',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => (
        <Text code style={{ fontSize: 12 }}>
          {path}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
        </Space>
      ),
    },
    {
      title: 'Changes',
      key: 'changes',
      render: (_: any, record: FileDiff) => (
        <Space>
          {record.linesAdded > 0 && (
            <Text type="success">+{record.linesAdded}</Text>
          )}
          {record.linesAdded > 0 && record.linesRemoved > 0 && '/'}
          {record.linesRemoved > 0 && (
            <Text type="danger">-{record.linesRemoved}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Preview',
      dataIndex: 'preview',
      key: 'preview',
      render: (preview: string) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
          {preview}
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 8 }}>
            Version Comparison
          </Title>
          <Space>
            <Tag color="blue">v{version1.version}</Tag>
            <ArrowRightOutlined />
            <Tag color="green">v{version2.version}</Tag>
          </Space>
        </div>

        <Space>
          <Button icon={<DownloadOutlined />} size="small">
            Export Diff
          </Button>
          <Button icon={<ShareAltOutlined />} size="small">
            Share
          </Button>
          {onClose && (
            <Button
              icon={<CloseOutlined />}
              onClick={onClose}
              type="text"
              size="small"
              aria-label="Close comparison"
            />
          )}
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Changes" value={totalChanges} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Additions"
              value={additionsCount}
              prefix="+"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Modifications"
              value={modificationsCount}
              prefix="~"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Removals"
              value={removalsCount}
              prefix="-"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Version Details */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title={<Text strong>Version {version1.version}</Text>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Status:</Text>{' '}
                <Tag>{version1.status}</Tag>
              </div>
              <div>
                <Text type="secondary">Author:</Text>{' '}
                <Text>{version1.author}</Text>
              </div>
              <div>
                <Text type="secondary">Date:</Text>{' '}
                <Text>
                  {new Date(version1.createdDate).toLocaleDateString()}
                </Text>
              </div>
              <div>
                <Text type="secondary">Files:</Text>{' '}
                <Text>{version1.fileCount}</Text>
              </div>
              <div>
                <Text type="secondary">Concepts:</Text>{' '}
                <Text>{version1.conceptCount}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title={<Text strong>Version {version2.version}</Text>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Status:</Text>{' '}
                <Tag>{version2.status}</Tag>
              </div>
              <div>
                <Text type="secondary">Author:</Text>{' '}
                <Text>{version2.author}</Text>
              </div>
              <div>
                <Text type="secondary">Date:</Text>{' '}
                <Text>
                  {new Date(version2.createdDate).toLocaleDateString()}
                </Text>
              </div>
              <div>
                <Text type="secondary">Files:</Text>{' '}
                <Text>{version2.fileCount}</Text>
              </div>
              <div>
                <Text type="secondary">Concepts:</Text>{' '}
                <Text>{version2.conceptCount}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <Badge count={version2.changelog.length} offset={[10, 0]}>
                Changelog
              </Badge>
            }
            key="changelog"
          >
            <List
              dataSource={version2.changelog}
              renderItem={(entry) => (
                <List.Item>
                  <Space align="start" style={{ width: '100%' }}>
                    <Tag color={getChangeTypeColor(entry.type)}>
                      {entry.type.toUpperCase()}
                    </Tag>
                    <div style={{ flex: 1 }}>
                      <Text>{entry.description}</Text>
                      {entry.impact && (
                        <div style={{ marginTop: 4 }}>
                          <Tag
                            color={getImpactColor(entry.impact)}
                            style={{ fontSize: 11 }}
                          >
                            {entry.impact} change
                          </Tag>
                        </div>
                      )}
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane
            tab={
              <Badge count={fileDiffs.length} offset={[10, 0]}>
                Files
              </Badge>
            }
            key="files"
          >
            <Table
              columns={fileColumns}
              dataSource={fileDiffs}
              rowKey="path"
              pagination={false}
            />
          </TabPane>

          <TabPane
            tab={
              <Badge count={conceptDiffs.length} offset={[10, 0]}>
                Concepts
              </Badge>
            }
            key="concepts"
          >
            <List
              dataSource={conceptDiffs}
              renderItem={(concept) => (
                <List.Item>
                  <Space align="start" style={{ width: '100%' }}>
                    {getStatusIcon(concept.status)}
                    <div style={{ flex: 1 }}>
                      <Space>
                        <Text code style={{ fontSize: 12 }}>
                          {concept.conceptId}
                        </Text>
                        <Text>{concept.label}</Text>
                        <Tag color={getStatusColor(concept.status)}>
                          {concept.status.toUpperCase()}
                        </Tag>
                      </Space>
                      {concept.changes && concept.changes.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {concept.changes.map((change, index) => (
                            <div key={index} style={{ marginBottom: 8 }}>
                              <Text type="secondary" strong>
                                {change.field}:
                              </Text>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  marginTop: 4,
                                }}
                              >
                                <Card
                                  size="small"
                                  style={{
                                    backgroundColor: '#fff1f0',
                                    flex: 1,
                                  }}
                                >
                                  <Text style={{ fontSize: 12 }}>
                                    {change.oldValue}
                                  </Text>
                                </Card>
                                <ArrowRightOutlined style={{ fontSize: 12 }} />
                                <Card
                                  size="small"
                                  style={{
                                    backgroundColor: '#f6ffed',
                                    flex: 1,
                                  }}
                                >
                                  <Text style={{ fontSize: 12 }}>
                                    {change.newValue}
                                  </Text>
                                </Card>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Summary" key="summary">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message="Compatibility"
                description={`This version contains ${modificationsCount} modifications and ${removalsCount} removals. Review breaking changes before upgrading.`}
                type="info"
                showIcon
              />

              <div>
                <Title level={5}>Key Changes</Title>
                <List
                  size="small"
                  dataSource={[
                    {
                      icon: (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ),
                      text: 'Enhanced digital resource support',
                    },
                    {
                      icon: (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ),
                      text: 'Improved area 7 definitions',
                    },
                    {
                      icon: <WarningOutlined style={{ color: '#faad14' }} />,
                      text: 'Deprecated legacy elements (migration guide available)',
                    },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        {item.icon}
                        <Text>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <div>
                <Title level={5}>Migration Notes</Title>
                <List
                  size="small"
                  dataSource={[
                    '• Update references to deprecated elements',
                    '• Review digital resource mappings',
                    '• Test validation rules with new constraints',
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </div>
            </Space>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
