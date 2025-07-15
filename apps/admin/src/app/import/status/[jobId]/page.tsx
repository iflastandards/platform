'use client';

import { useParams, useRouter } from 'next/navigation';
import { Container, Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import ImportJobStatus from '@/components/import/ImportJobStatus';

export default function ImportStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const handleComplete = () => {
    // Redirect to dashboard or namespace page after completion
    router.push('/dashboard');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Link href="/import" color="inherit">
            Import
          </Link>
          <Typography color="text.primary">Status</Typography>
        </Breadcrumbs>
      </Box>

      <Box mb={4}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Import Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor the progress of your vocabulary import
        </Typography>
      </Box>

      <ImportJobStatus jobId={jobId} onComplete={handleComplete} />
    </Container>
  );
}