'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Dropdown,
  Modal,
  Input,
  Select,
  Space,
  Alert,
  Tabs,
  Divider,
  List,
  Row,
  Col,
  Form,
  type MenuProps,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface DCTAPProfile {
  id: string;
  name: string;
  description: string;
  namespace: string;
  version: string;
  status: 'draft' | 'active' | 'deprecated';
  author: string;
  lastModified: string;
  properties: DCTAPProperty[];
  usageCount: number;
}

interface DCTAPProperty {
  id: string;
  propertyLabel: string;
  propertyID?: string;
  mandatory?: 'true' | 'false';
  repeatable?: 'true' | 'false';
  valueNodeType?: 'IRI' | 'Literal' | 'BlankNode';
  valueDataType?: string;
  valueConstraint?: string;
  valueShape?: string;
  note?: string;
}

interface ProfilesManagerProps {
  userRoles: string[];
  userName?: string;
  userEmail?: string;
}

export default function ProfilesManager({
  userRoles: _userRoles,
  userName: _userName,
  userEmail: _userEmail,
}: ProfilesManagerProps) {
  const _router = useRouter();
  const [activeTab, setActiveTab] = useState('1');
  const [profiles, setProfiles] = useState<DCTAPProfile[]>([
    {
      id: 'profile-1',
      name: 'Standard Vocabulary Profile',
      description: 'Default DCTAP profile for general vocabulary validation',
      namespace: 'https://iflastandards.info/ns/dctap/standard',
      version: '1.0.0',
      status: 'active',
      author: 'IFLA Standards',
      lastModified: '2024-01-15T10:30:00Z',
      usageCount: 45,
      properties: [
        {
          id: 'prop-1',
          propertyLabel: 'Identifier',
          propertyID: 'dcterms:identifier',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'Literal',
          valueDataType: 'xsd:string',
          note: 'Unique identifier for the concept',
        },
        {
          id: 'prop-2',
          propertyLabel: 'Preferred Label',
          propertyID: 'skos:prefLabel',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'Literal',
          valueDataType: 'rdf:langString',
          note: 'Primary label for the concept',
        },
        {
          id: 'prop-3',
          propertyLabel: 'Definition',
          propertyID: 'skos:definition',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'Literal',
          valueDataType: 'rdf:langString',
          note: 'Precise definition of the concept',
        },
      ],
    },
    {
      id: 'profile-2',
      name: 'ISBD Elements Profile',
      description: 'DCTAP profile specifically for ISBD element validation',
      namespace: 'https://iflastandards.info/ns/isbd',
      version: '2.1.0',
      status: 'active',
      author: 'ISBD Review Group',
      lastModified: '2024-02-01T14:20:00Z',
      usageCount: 23,
      properties: [
        {
          id: 'prop-4',
          propertyLabel: 'ISBD Element',
          propertyID: 'isbd:element',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'IRI',
          note: 'ISBD element reference',
        },
        {
          id: 'prop-5',
          propertyLabel: 'Area',
          propertyID: 'isbd:area',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'Literal',
          valueConstraint: '[0-8]',
          note: 'ISBD area number (0-8)',
        },
      ],
    },
    {
      id: 'profile-3',
      name: 'LRM Entities Profile',
      description: 'Profile for Library Reference Model entity definitions',
      namespace: 'https://iflastandards.info/ns/lrm',
      version: '1.0.2',
      status: 'draft',
      author: 'BCM Working Group',
      lastModified: '2024-01-28T09:15:00Z',
      usageCount: 8,
      properties: [],
    },
  ]);

  const [selectedProfile, setSelectedProfile] = useState<DCTAPProfile | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>(
    'create',
  );
  const [form] = Form.useForm();

  const handleCreateProfile = () => {
    setModalMode('create');
    setSelectedProfile(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEditProfile = (profile: DCTAPProfile) => {
    setModalMode('edit');
    setSelectedProfile(profile);
    form.setFieldsValue(profile);
    setModalOpen(true);
  };

  const handleViewProfile = (profile: DCTAPProfile) => {
    setModalMode('view');
    setSelectedProfile(profile);
    setModalOpen(true);
  };

  const handleDeleteProfile = (profile: DCTAPProfile) => {
    Modal.confirm({
      title: 'Delete Profile',
      content: `Are you sure you want to delete "${profile.name}"?`,
      onOk: () => {
        setProfiles(profiles.filter((p) => p.id !== profile.id));
      },
    });
  };

  const handleCopyProfile = (profile: DCTAPProfile) => {
    const newProfile = {
      ...profile,
      id: `profile-${Date.now()}`,
      name: `${profile.name} (Copy)`,
      status: 'draft' as const,
      lastModified: new Date().toISOString(),
      usageCount: 0,
    };
    setProfiles([...profiles, newProfile]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'deprecated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionMenu = (profile: DCTAPProfile): MenuProps => ({
    items: [
      {
        key: 'view',
        label: 'View',
        icon: <EyeOutlined />,
        onClick: () => handleViewProfile(profile),
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
        onClick: () => handleEditProfile(profile),
      },
      {
        key: 'copy',
        label: 'Duplicate',
        icon: <CopyOutlined />,
        onClick: () => handleCopyProfile(profile),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteProfile(profile),
      },
    ],
  });

  const profileColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DCTAPProfile) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Namespace',
      dataIndex: 'namespace',
      key: 'namespace',
      render: (text: string) => (
        <Text copyable style={{ fontSize: 12 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
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
      title: 'Usage',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => `${count} times`,
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DCTAPProfile) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const renderProfileModal = () => {
    const isViewMode = modalMode === 'view';
    const modalTitle = 
      modalMode === 'create' ? 'Create New Profile' :
      modalMode === 'edit' ? 'Edit Profile' :
      'View Profile';

    return (
      <Modal
        title={modalTitle}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={800}
        footer={
          isViewMode ? [
            <Button key="close" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          ] : [
            <Button key="cancel" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={() => form.submit()}>
              {modalMode === 'create' ? 'Create' : 'Save'}
            </Button>
          ]
        }
      >
        {isViewMode && selectedProfile ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>{selectedProfile.name}</Title>
              <Paragraph>{selectedProfile.description}</Paragraph>
            </div>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">Namespace:</Text>
                <br />
                <Text copyable>{selectedProfile.namespace}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Version:</Text>
                <br />
                <Text>{selectedProfile.version}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Status:</Text>
                <br />
                <Tag color={getStatusColor(selectedProfile.status)}>
                  {selectedProfile.status.toUpperCase()}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">Author:</Text>
                <br />
                <Text>{selectedProfile.author}</Text>
              </Col>
            </Row>
            {selectedProfile.properties.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Properties</Title>
                <Table
                  dataSource={selectedProfile.properties}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Label',
                      dataIndex: 'propertyLabel',
                      key: 'propertyLabel',
                    },
                    {
                      title: 'Property ID',
                      dataIndex: 'propertyID',
                      key: 'propertyID',
                    },
                    {
                      title: 'Mandatory',
                      dataIndex: 'mandatory',
                      key: 'mandatory',
                      render: (value: string) => value === 'true' ? 'Yes' : 'No',
                    },
                    {
                      title: 'Type',
                      dataIndex: 'valueNodeType',
                      key: 'valueNodeType',
                    },
                  ]}
                />
              </>
            )}
          </Space>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={selectedProfile || {}}
            onFinish={(values) => {
              if (modalMode === 'create') {
                const newProfile = {
                  ...values,
                  id: `profile-${Date.now()}`,
                  lastModified: new Date().toISOString(),
                  usageCount: 0,
                  properties: [],
                };
                setProfiles([...profiles, newProfile]);
              } else {
                setProfiles(profiles.map((p) => 
                  p.id === selectedProfile?.id ? { ...p, ...values } : p
                ));
              }
              setModalOpen(false);
            }}
          >
            <Form.Item
              name="name"
              label="Profile Name"
              rules={[{ required: true, message: 'Please enter a profile name' }]}
            >
              <Input placeholder="Enter profile name" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <TextArea rows={3} placeholder="Enter profile description" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="namespace"
                  label="Namespace"
                  rules={[{ required: true, message: 'Please enter a namespace' }]}
                >
                  <Input placeholder="https://example.org/ns/profile" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="version"
                  label="Version"
                  rules={[{ required: true, message: 'Please enter a version' }]}
                >
                  <Input placeholder="1.0.0" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select a status' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="draft">Draft</Option>
                    <Option value="active">Active</Option>
                    <Option value="deprecated">Deprecated</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="author"
                  label="Author"
                  rules={[{ required: true, message: 'Please enter author' }]}
                >
                  <Input placeholder="Enter author name" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  };

  const tabItems = [
    {
      key: '1',
      label: 'All Profiles',
      children: (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Input.Search
                placeholder="Search profiles..."
                style={{ width: 300 }}
                onSearch={(value) => console.log('Search:', value)}
              />
              <Select defaultValue="all" style={{ width: 120 }}>
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="draft">Draft</Option>
                <Option value="deprecated">Deprecated</Option>
              </Select>
            </Space>
            <Space>
              <Button icon={<UploadOutlined />}>Import</Button>
              <Button icon={<DownloadOutlined />}>Export</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateProfile}
              >
                Create Profile
              </Button>
            </Space>
          </div>
          <Table
            dataSource={profiles}
            columns={profileColumns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} profiles`,
            }}
          />
        </>
      ),
    },
    {
      key: '2',
      label: 'Property Library',
      children: (
        <Card>
          <Title level={4}>Property Library</Title>
          <Paragraph>
            Manage reusable property definitions that can be used across multiple profiles.
          </Paragraph>
          <Alert
            message="Coming Soon"
            description="The property library feature is under development and will be available in the next release."
            type="info"
            showIcon
          />
        </Card>
      ),
    },
    {
      key: '3',
      label: 'Validation History',
      children: (
        <Card>
          <Title level={4}>Validation History</Title>
          <Paragraph>
            View the history of validations performed using these profiles.
          </Paragraph>
          <List
            dataSource={[
              {
                id: '1',
                profile: 'Standard Vocabulary Profile',
                namespace: 'isbd',
                timestamp: '2024-01-15 10:30:00',
                status: 'success',
                records: 234,
              },
              {
                id: '2',
                profile: 'ISBD Elements Profile',
                namespace: 'isbd',
                timestamp: '2024-01-14 15:45:00',
                status: 'warning',
                records: 189,
              },
              {
                id: '3',
                profile: 'Standard Vocabulary Profile',
                namespace: 'lrm',
                timestamp: '2024-01-13 09:20:00',
                status: 'error',
                records: 156,
              },
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="view" type="link" size="small">View Details</Button>
                ]}
              >
                <List.Item.Meta
                  title={item.profile}
                  description={
                    <Space>
                      <Text type="secondary">{item.namespace}</Text>
                      <Text type="secondary">{item.timestamp}</Text>
                      <Tag color={
                        item.status === 'success' ? 'success' :
                        item.status === 'warning' ? 'warning' : 'error'
                      }>
                        {item.status.toUpperCase()}
                      </Tag>
                      <Text type="secondary">{item.records} records</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: '4',
      label: 'Settings',
      children: (
        <Card>
          <Title level={4}>Profile Settings</Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={5}>Default Profiles</Title>
              <Paragraph type="secondary">
                Configure default profiles for different namespaces.
              </Paragraph>
              <Form layout="vertical">
                <Form.Item label="Default ISBD Profile">
                  <Select defaultValue="profile-2">
                    {profiles.map((profile) => (
                      <Option key={profile.id} value={profile.id}>
                        {profile.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Default LRM Profile">
                  <Select defaultValue="profile-3">
                    {profiles.map((profile) => (
                      <Option key={profile.id} value={profile.id}>
                        {profile.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </div>
            <Divider />
            <div>
              <Title level={5}>Validation Options</Title>
              <Form layout="vertical">
                <Form.Item label="Strict Mode">
                  <Select defaultValue="true">
                    <Option value="true">Enabled</Option>
                    <Option value="false">Disabled</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Auto-save Validation Results">
                  <Select defaultValue="true">
                    <Option value="true">Enabled</Option>
                    <Option value="false">Disabled</Option>
                  </Select>
                </Form.Item>
              </Form>
            </div>
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>DCTAP Profiles Manager</Title>
        <Paragraph type="secondary">
          Manage Dublin Core Tabular Application Profiles for vocabulary validation
        </Paragraph>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {renderProfileModal()}
    </div>
  );
}