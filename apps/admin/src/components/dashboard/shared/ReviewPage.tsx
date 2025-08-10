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

interface SharedReviewPageProps {
  role: 'author' | 'editor';
}

export function SharedReviewPage({ role }: SharedReviewPageProps) {
  const getContent = () => {
    if (role === 'author') {
      return {
        title: 'Review Queue',
        alertTitle: 'Review Queue',
        alertMessage: 'You have 3 items waiting for your review. Please review and provide feedback.',
      };
    } else {
      return {
        title: 'Review Queue',
        alertTitle: 'Editorial Review',
        alertMessage: 'As an editor, you can approve, reject, or request changes to vocabulary submissions.',
      };
    }
  };

  const content = getContent();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {content.title}
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>{content.alertTitle}</AlertTitle>
        {content.alertMessage}
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