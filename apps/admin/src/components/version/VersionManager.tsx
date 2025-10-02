'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Checkbox,
  Space,
  Alert,
  Steps,
  List,
  Tooltip,
  Progress,
  Row,
  Col,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  TagOutlined,
  CloudUploadOutlined,
  DiffOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface Version {
  id: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'deprecated';
  createdDate: string;
  publishedDate?: string;
  author: string;
  description: string;
  changelog: ChangelogEntry[];
  downloadCount: number;
  filesCount: number;
  branch?: string;
  commitSha?: string;
  preRelease: boolean;
}

interface ChangelogEntry {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  issues?: string[];
}

interface VersionManagerProps {
  namespace: string;
  versions: Version[];
  currentVersion?: string;
  onCreateVersion?: (version: Partial<Version>) => void;
  onPublishVersion?: (version: Version) => void;
  onDeprecateVersion?: (version: Version) => void;
  onCompareVersions?: (v1: Version, v2: Version) => void;
}

export default function VersionManager({
  namespace,
  versions,
  currentVersion,
  onCreateVersion,
  onPublishVersion,
  onCompareVersions,
}: VersionManagerProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'approved':
        return 'processing';
      case 'review':
        return 'warning';
      case 'deprecated':
        return 'error';
      case 'draft':
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

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <PlusOutlined />;
      case 'changed':
        return <EditOutlined />;
      case 'deprecated':
        return <WarningOutlined />;
      case 'removed':
        return <DeleteOutlined />;
      case 'fixed':
        return <CheckCircleOutlined />;
      case 'security':
        return <ExclamationCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const handleVersionSelection = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter((id) => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handleCompareSelected = () => {
    if (selectedVersions.length === 2) {
      const v1 = versions.find((v) => v.id === selectedVersions[0]);
      const v2 = versions.find((v) => v.id === selectedVersions[1]);
      if (v1 && v2) {
        onCompareVersions?.(v1, v2);
      }
    }
  };

  const handleCreateVersion = (values: any) => {
    onCreateVersion?.({
      version: values.version,
      description: values.description,
      preRelease: values.preRelease || false,
      changelog: [],
    });
    setCreateModalVisible(false);
    form.resetFields();
  };

  const handlePublishVersion = () => {
    if (selectedVersion) {
      onPublishVersion?.(selectedVersion);
      setPublishModalVisible(false);
      setSelectedVersion(null);
    }
  };

  const publishSteps = [
    {
      title: 'Pre-publish Validation',
      description:
        'Validating vocabulary files and ensuring all requirements are met...',
    },
    {
      title: 'Generate Release Notes',
      description:
        'Generating release notes from changelog and recent commits...',
    },
    {
      title: 'Create GitHub Release',
      description: 'Creating GitHub release with downloadable assets...',
    },
    {
      title: 'Update Documentation',
      description: 'Updating documentation and API references...',
    },
    {
      title: 'Notify Stakeholders',
      description: 'Sending notifications to subscribers and stakeholders...',
    },
  ];

  const columns = [
    {
      title: '',
      key: 'select',
      width: 50,
      render: (_: any, record: Version) => (
        <Checkbox
          checked={selectedVersions.includes(record.id)}
          onChange={() => handleVersionSelection(record.id)}
        />
      ),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: string, record: Version) => (
        <Space>
          <Text strong>{version}</Text>
          {record.preRelease && <Tag>Pre-release</Tag>}
          {version === currentVersion && <Tag color="success">Current</Tag>}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Created',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Downloads',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Version) => (
        <Space>
          {record.status === 'approved' && (
            <Tooltip title="Publish Version">
              <Button
                type="text"
                icon={<CloudUploadOutlined />}
                onClick={() => {
                  setSelectedVersion(record);
                  setPublishModalVisible(true);
                }}
                aria-label="Publish version"
              />
            </Tooltip>
          )}
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              aria-label="Download version"
            />
          </Tooltip>
        </Space>
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
          <Title level={4} style={{ marginBottom: 4 }}>
            Version Management
          </Title>
          <Text type="secondary">
            {namespace} • {versions.length} versions
          </Text>
        </div>

        <Space>
          {selectedVersions.length === 2 && (
            <Button icon={<DiffOutlined />} onClick={handleCompareSelected}>
              Compare Selected
            </Button>
          )}
          <Button
            type="primary"
            icon={<TagOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Version
          </Button>
        </Space>
      </div>

      {/* Current Version Alert */}
      {currentVersion && (
        <Alert
          message={
            <Text>
              <strong>Current Published Version:</strong> {currentVersion}
            </Text>
          }
          type="info"
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={24}>
        {/* Versions Table */}
        <Col xs={24} lg={18}>
          <Card>
            <Title level={5} style={{ marginBottom: 16 }}>
              All Versions
            </Title>

            <Table
              columns={columns}
              dataSource={versions}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} versions`,
              }}
            />
          </Card>
        </Col>

        {/* Recent Releases */}
        <Col xs={24} lg={6}>
          <Card>
            <Title level={5} style={{ marginBottom: 16 }}>
              Recent Releases
            </Title>

            <List
              dataSource={versions
                .filter((v) => v.status === 'published')
                .sort(
                  (a, b) =>
                    new Date(b.publishedDate || b.createdDate).getTime() -
                    new Date(a.publishedDate || a.createdDate).getTime(),
                )
                .slice(0, 5)}
              renderItem={(version) => (
                <List.Item>
                  <Space
                    direction="vertical"
                    size={0}
                    style={{ width: '100%' }}
                  >
                    <Badge status="processing" text={version.version} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(
                        version.publishedDate || version.createdDate,
                      ).toLocaleDateString()}
                    </Text>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ fontSize: 12, marginBottom: 0 }}
                    >
                      {version.description}
                    </Paragraph>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Create Version Modal */}
      <Modal
        title="Create New Version"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateVersion}>
          <Form.Item
            name="version"
            label="Version Number"
            rules={[{ required: true, message: 'Please enter version number' }]}
            help="Follow semantic versioning (MAJOR.MINOR.PATCH)"
          >
            <Input placeholder="e.g., 1.2.0" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Brief description of changes in this version"
            />
          </Form.Item>

          <Form.Item name="preRelease" valuePropName="checked">
            <Checkbox>Mark as pre-release</Checkbox>
          </Form.Item>

          <Alert
            message="Changelog will be automatically generated from recent commits and issues."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                onClick={() => {
                  setCreateModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Version
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Publish Version Modal */}
      <Modal
        title={`Publish Version ${selectedVersion?.version}`}
        open={publishModalVisible}
        onCancel={() => {
          setPublishModalVisible(false);
          setSelectedVersion(null);
          setCurrentStep(0);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setPublishModalVisible(false);
              setSelectedVersion(null);
              setCurrentStep(0);
            }}
          >
            Cancel
          </Button>,
          <Button key="publish" type="primary" onClick={handlePublishVersion}>
            Publish Version
          </Button>,
        ]}
        width={700}
      >
        <Paragraph type="secondary">
          Publishing will make this version available to the public and update
          all documentation.
        </Paragraph>

        <Steps
          current={currentStep}
          direction="vertical"
          style={{ marginTop: 24 }}
        >
          {publishSteps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={
                index === currentStep ? (
                  <div>
                    <Text type="secondary">{step.description}</Text>
                    <Progress
                      percent={30}
                      size="small"
                      status="active"
                      style={{ marginTop: 8 }}
                    />
                  </div>
                ) : (
                  <Text type="secondary">{step.description}</Text>
                )
              }
              icon={index < currentStep ? <CheckCircleOutlined /> : undefined}
            />
          ))}
        </Steps>

        {selectedVersion && (
          <div style={{ marginTop: 24 }}>
            <Title level={5}>Changelog</Title>
            <List
              size="small"
              dataSource={selectedVersion.changelog}
              renderItem={(entry) => (
                <List.Item>
                  <Space>
                    {getChangeTypeIcon(entry.type)}
                    <Tag color={getChangeTypeColor(entry.type)}>
                      {entry.type.toUpperCase()}
                    </Tag>
                    <Text>{entry.description}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
