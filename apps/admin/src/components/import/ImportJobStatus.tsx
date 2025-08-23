'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Progress,
  Tag,
  Button,
  Alert,
  Space,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HourglassOutlined,
  GithubOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ImportJobStatusProps {
  jobId: string;
  onComplete?: () => void;
}

interface JobStatus {
  jobId: string;
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  namespace: string;
  spreadsheetUrl?: string;
  branchName?: string;
  validationResults?: any;
  completedAt?: string;
  errorMessage?: string;
}

export default function ImportJobStatus({ jobId, onComplete }: ImportJobStatusProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkJobStatus = async () => {
      try {
        const response = await fetch(`/api/actions/scaffold-from-spreadsheet?jobId=${jobId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch job status');
        }

        setJobStatus(data);
        setLoading(false);

        // Stop polling if job is complete or failed
        if (data.status === 'completed' || data.status === 'failed') {
          if (onComplete && data.status === 'completed') {
            onComplete();
          }
        }
      } catch (err) {
        console.error('Error fetching job status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch job status');
        setLoading(false);
      }
    };

    // Initial check
    checkJobStatus();

    // Poll every 2 seconds
    const intervalId = setInterval(checkJobStatus, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobId, onComplete]);

  if (loading) {
    return (
      <Card>
        <Space align="center">
          <Spin size="small" />
          <Text>Loading import job status...</Text>
        </Space>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!jobStatus) {
    return (
      <Alert
        message="No job status available"
        type="warning"
        showIcon
      />
    );
  }

  const getStatusIcon = () => {
    switch (jobStatus.status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <HourglassOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getStatusColor = () => {
    switch (jobStatus.status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'processing';
      case 'validating':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Import Job Status</Title>
        <Tag
          icon={getStatusIcon()}
          color={getStatusColor()}
        >
          {jobStatus.status.toUpperCase()}
        </Tag>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          {jobStatus.message}
        </Text>
        <Progress
          percent={jobStatus.progress}
          status={jobStatus.status === 'failed' ? 'exception' : 
                 jobStatus.status === 'completed' ? 'success' : 'active'}
        />
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          {jobStatus.progress}% complete
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Namespace:</Text> <Text>{jobStatus.namespace}</Text>
        </div>
        {jobStatus.spreadsheetUrl && (
          <div>
            <Text strong>Source:</Text>{' '}
            <a href={jobStatus.spreadsheetUrl} target="_blank" rel="noopener noreferrer">
              Google Sheets
            </a>
          </div>
        )}
        {jobStatus.completedAt && (
          <div>
            <Text strong>Completed:</Text> <Text>{new Date(jobStatus.completedAt).toLocaleString()}</Text>
          </div>
        )}
      </Space>

      {jobStatus.status === 'completed' && jobStatus.branchName && (
        <Alert
          message="Import completed successfully!"
          description={
            <Space direction="vertical">
              <Text>
                Branch created: <code>{jobStatus.branchName}</code>
              </Text>
              <Button
                size="small"
                icon={<GithubOutlined />}
                href={`https://github.com/iflastandards/platform/tree/${jobStatus.branchName}`}
                target="_blank"
              >
                View on GitHub
              </Button>
            </Space>
          }
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {jobStatus.status === 'failed' && (
        <Alert
          message="Import failed"
          description={jobStatus.errorMessage || 'Unknown error'}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
}