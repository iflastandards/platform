'use client';

import React from 'react';
import Link from 'next/link';
import {
  Typography,
  Button,
  Card,
  Table,
  Tag,
  Space,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export function AdminUsersPage() {
  // Mock data - in production this would come from API
  const users = [
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'editor', status: 'active' },
    { id: 3, name: 'Mike Davis', email: 'mike@example.com', role: 'reviewer', status: 'pending' },
    { id: 4, name: 'Jennifer Lee', email: 'jennifer@example.com', role: 'translator', status: 'active' },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color="blue">{role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'warning'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            aria-label={`Edit ${record.name}`}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            aria-label={`Delete ${record.name}`}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4}>User Management</Title>
        <Link href="/dashboard/admin/users/invite">
          <Button
            type="primary"
            icon={<UserAddOutlined />}
          >
            Invite User
          </Button>
        </Link>
      </div>

      <Card>
        <Title level={5} style={{ marginBottom: 16 }}>All Users</Title>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
}