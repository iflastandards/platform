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
  Translate as TranslateIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export function AuthorTranslationPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Translation Tasks
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Translation Tasks</AlertTitle>
        You have 2 items that need translation. Your language expertise is valuable to the community.
      </Alert>
      <Button
        component={Link}
        href="/translation"
        variant="contained"
        startIcon={<TranslateIcon />}
      >
        Go to Translation Interface
      </Button>
    </Box>
  );
}