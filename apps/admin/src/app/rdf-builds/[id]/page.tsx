'use client';

import { useState, useEffect } from 'react';
import { Show } from '@refinedev/mui';
import { useShow, useCustomMutation } from '@refinedev/core';
import {
  Box,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Paper,
  Link,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import type { RdfBuild } from '@/../../packages/contracts/schemas/RdfBuild.zod';

/**
 * RDF Build Show Page
 * Displays details of a specific RDF build with polling for status updates
 */
export default function RdfBuildShowPage({
  params,
}: {
  params: { id: string };
}) {
  const [pollingEnabled, setPollingEnabled] = useState(true);

  const { query } = useShow<RdfBuild>({
    resource: 'rdf-builds',
    id: params.id,
  });

  const { data, isLoading, isError, error, refetch } = query;
  const record = data?.data;

  // Custom hook for retry action
  const { mutate: retryBuild } = useCustomMutation();

  // Disable polling when job is complete
  useEffect(() => {
    if (
      record?.status === 'success' ||
      record?.status === 'failed' ||
      record?.status === 'cancelled'
    ) {
      setPollingEnabled(false);
    }
  }, [record?.status]);

  const handleRetry = () => {
    retryBuild(
      {
        url: `/api/jobs/${params.id}/retry`,
        method: 'put',
        values: {},
      },
      {
        onSuccess: () => {
          setPollingEnabled(true);
          refetch();
        },
      },
    );
  };

  const handleDownload = () => {
    if (record?.outputUrl) {
      window.open(record.outputUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Show>
        <Box sx={{ p: 2 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading RDF build details...</Typography>
        </Box>
      </Show>
    );
  }

  if (isError) {
    return (
      <Show>
        <Alert severity="error">
          Failed to load RDF build: {error?.message || 'Unknown error'}
        </Alert>
      </Show>
    );
  }

  if (!record) {
    return (
      <Show>
        <Alert severity="warning">RDF build not found</Alert>
      </Show>
    );
  }

  const statusColor = {
    queued: 'default',
    running: 'info',
    success: 'success',
    failed: 'error',
    cancelled: 'warning',
  }[record.status] as 'default' | 'info' | 'success' | 'error' | 'warning';

  return (
    <Show
      title={`RDF Build: ${record.id}`}
      headerButtons={
        <>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          {record.status === 'failed' && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleRetry}
              disabled={false}
            >
              Retry
            </Button>
          )}
          {record.status === 'success' && record.outputUrl && (
            <Button
              variant="contained"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          )}
        </>
      }
    >
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Status Section */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip label={record.status} color={statusColor} />
              {record.status === 'running' && (
                <Typography variant="body2" color="text.secondary">
                  (Auto-refreshing every 1.5s)
                </Typography>
              )}
            </Box>
          </Box>

          {/* Progress Section */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <LinearProgress
                  variant="determinate"
                  value={record.progress || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2">{record.progress || 0}%</Typography>
            </Box>
          </Box>

          {/* Details Section */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Namespace ID
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {record.namespaceId || 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Format
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {record.format || 'turtle'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {new Date(record.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Finished At
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {record.finishedAt
                  ? new Date(record.finishedAt).toLocaleString()
                  : 'In Progress'}
              </Typography>
            </Box>
          </Box>

          {/* Output URL */}
          {record.status === 'success' && record.outputUrl && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Output URL
              </Typography>
              <Link
                href={record.outputUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1, display: 'inline-block' }}
              >
                {record.outputUrl}
              </Link>
            </Box>
          )}

          {/* Error Message */}
          {record.status === 'failed' && record.error && (
            <Alert severity="error">
              <Typography variant="subtitle2" gutterBottom>
                Error Message:
              </Typography>
              <Typography variant="body2">{record.error}</Typography>
            </Alert>
          )}

          {/* Build Configuration */}
          {record.buildConfig && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Build Configuration
              </Typography>
              <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  Include Deprecated:{' '}
                  {record.buildConfig.includeDeprecated ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  Include History:{' '}
                  {record.buildConfig.includeHistory ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                  Compression: {record.buildConfig.compression ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Show>
  );
}
