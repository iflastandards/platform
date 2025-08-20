'use client';

import { Show } from '@refinedev/antd';
import { useShow, useNavigation } from '@refinedev/core';
import { Typography, Tag, Card, Descriptions, Button, Skeleton, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { RdfBuild } from '@/../../packages/contracts/schemas/RdfBuild.zod';

const { Title, Text } = Typography;

/**
 * RDF Build Detail Page
 */
export default function RdfBuildDetailPage({ params }: { params: { id: string } }) {
  const { list } = useNavigation();
  const { queryResult } = useShow<RdfBuild>({
    resource: 'rdf-builds',
    id: params.id,
  });

  const { data, isLoading, isError, error } = queryResult;
  const record = data?.data;

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
          message="Error loading RDF build"
          description={error?.message || 'An error occurred while loading the data'}
          type="error"
        />
      </div>
    );
  }

  if (!record) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="RDF Build not found"
          description="The requested RDF build could not be found"
          type="warning"
        />
      </div>
    );
  }

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

  const config = statusConfig[record.status] || statusConfig.pending;

  return (
    <Show
      title={`RDF Build #${record.id}`}
      breadcrumb={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => list('rdf-builds')}
        >
          Back to List
        </Button>
      }
    >
      <Card>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="ID">
            {record.id}
          </Descriptions.Item>
          <Descriptions.Item label="Namespace">
            <Tag color="blue">{record.namespace}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={config.color}>{config.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Format">
            {record.format || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(record.createdAt).toLocaleString()}
          </Descriptions.Item>
          {(record as any).completedAt && (
            <Descriptions.Item label="Completed At">
              {new Date((record as any).completedAt).toLocaleString()}
            </Descriptions.Item>
          )}
          {(record as any).downloadUrl && (
            <Descriptions.Item label="Download">
              <Button type="link" href={(record as any).downloadUrl} target="_blank">
                Download RDF File
              </Button>
            </Descriptions.Item>
          )}
          {record.error && (
            <Descriptions.Item label="Error">
              <Text type="danger">{record.error}</Text>
            </Descriptions.Item>
          )}
          {(record as any).logs && (record as any).logs.length > 0 && (
            <Descriptions.Item label="Build Logs">
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4,
                maxHeight: 300,
                overflow: 'auto'
              }}>
                {(record as any).logs.join('\n')}
              </pre>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </Show>
  );
}