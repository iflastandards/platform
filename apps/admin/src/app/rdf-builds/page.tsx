'use client';

import { useTable, List } from '@refinedev/antd';
import { Table, Tag, Space, Button, Skeleton, Alert } from 'antd';
import { useNavigation } from '@refinedev/core';
import { PlusOutlined } from '@ant-design/icons';
import type { RdfBuild } from '@ifla/contracts';

/**
 * RDF Builds List Page
 * Displays all RDF builds with status, namespace, and creation date
 */
export default function RdfBuildsListPage() {
  const { show, create } = useNavigation();
  const { tableProps, tableQuery } = useTable<RdfBuild>({
    resource: 'rdf-builds',
    pagination: {
      pageSize: 10,
    },
    sorters: {
      initial: [
        {
          field: 'createdAt',
          order: 'desc',
        },
      ],
    },
  });

  const { isLoading, isError, error } = tableQuery;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Namespace',
      dataIndex: 'namespace',
      key: 'namespace',
      render: (namespace: string) => (
        <Tag color="blue">{namespace}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: RdfBuild['status']) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          pending: { color: 'default', text: 'Pending' },
          queued: { color: 'default', text: 'Queued' },
          in_progress: { color: 'processing', text: 'In Progress' },
          running: { color: 'processing', text: 'Running' },
          completed: { color: 'success', text: 'Completed' },
          success: { color: 'success', text: 'Success' },
          failed: { color: 'error', text: 'Failed' },
          cancelled: { color: 'warning', text: 'Cancelled' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RdfBuild) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => show('rdf-builds', record.id)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error loading RDF builds"
          description={error?.message || 'An error occurred while loading the data'}
          type="error"
        />
      </div>
    );
  }

  return (
    <List
      title="RDF Builds"
      headerButtons={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => create('rdf-builds')}
        >
          Create Build
        </Button>
      }
    >
      <Table {...tableProps} columns={columns} rowKey="id" />
    </List>
  );
}