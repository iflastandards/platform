'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';

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
    let intervalId: NodeJS.Timeout;

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
          if (intervalId) {
            clearInterval(intervalId);
          }
          if (data.status === 'completed' && onComplete) {
            onComplete();
          }
        }
      } catch (err) {
        console.error('Error fetching job status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch job status');
        setLoading(false);
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };

    // Initial check
    checkJobStatus();

    // Poll every 2 seconds
    intervalId = setInterval(checkJobStatus, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, onComplete]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Loading import job status...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography>Error: {error}</Typography>
      </Alert>
    );
  }

  if (!jobStatus) {
    return (
      <Alert severity="warning">
        <Typography>No job status available</Typography>
      </Alert>
    );
  }

  const getStatusIcon = () => {
    switch (jobStatus.status) {
      case 'completed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusColor = () => {
    switch (jobStatus.status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'primary';
      case 'validating':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Import Job Status</Typography>
          <Chip
            icon={getStatusIcon()}
            label={jobStatus.status.toUpperCase()}
            color={getStatusColor()}
            size="small"
          />
        </Box>

        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {jobStatus.message}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={jobStatus.progress}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {jobStatus.progress}% complete
          </Typography>
        </Box>

        <Box sx={{ '& > *': { mb: 1 } }}>
          <Typography variant="body2">
            <strong>Namespace:</strong> {jobStatus.namespace}
          </Typography>
          {jobStatus.spreadsheetUrl && (
            <Typography variant="body2">
              <strong>Source:</strong>{' '}
              <a href={jobStatus.spreadsheetUrl} target="_blank" rel="noopener noreferrer">
                Google Sheets
              </a>
            </Typography>
          )}
          {jobStatus.completedAt && (
            <Typography variant="body2">
              <strong>Completed:</strong> {new Date(jobStatus.completedAt).toLocaleString()}
            </Typography>
          )}
        </Box>

        {jobStatus.status === 'completed' && jobStatus.branchName && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Import completed successfully!
            </Typography>
            <Typography variant="body2">
              Branch created: <code>{jobStatus.branchName}</code>
            </Typography>
            <Button
              size="small"
              startIcon={<GitHubIcon />}
              href={`https://github.com/iflastandards/platform/tree/${jobStatus.branchName}`}
              target="_blank"
              sx={{ mt: 1 }}
            >
              View on GitHub
            </Button>
          </Alert>
        )}

        {jobStatus.status === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Import failed: {jobStatus.errorMessage || 'Unknown error'}
            </Typography>
          </Alert>
        )}

        {jobStatus.validationResults && jobStatus.validationResults.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Validation Results:
            </Typography>
            {/* TODO: Display validation results */}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}