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

interface SharedTranslationPageProps {
  role: 'author' | 'editor';
}

export function SharedTranslationPage({ role }: SharedTranslationPageProps) {
  const getContent = () => {
    if (role === 'author') {
      return {
        title: 'Translation Tasks',
        alertTitle: 'Translation Tasks',
        alertMessage: 'You have 2 items that need translation. Your language expertise is valuable to the community.',
      };
    } else {
      return {
        title: 'Translation Management',
        alertTitle: 'Multilingual Content',
        alertMessage: 'Coordinate translation efforts across multiple languages and manage translation workflows.',
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
        href="/translation"
        variant="contained"
        startIcon={<TranslateIcon />}
      >
        Go to Translation Interface
      </Button>
    </Box>
  );
}