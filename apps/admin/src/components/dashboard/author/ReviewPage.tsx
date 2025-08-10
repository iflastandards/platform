'use client';

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Button,
} from '@mui/material';
import {
  RateReview as ReviewIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export function AuthorReviewPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Review Queue
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Review Queue</AlertTitle>
        You have 3 items waiting for your review. Please review and provide feedback.
      </Alert>
      <Button
        component={Link}
        href="/review"
        variant="contained"
        startIcon={<ReviewIcon />}
      >
        Go to Review Interface
      </Button>
    </Box>
  );
}