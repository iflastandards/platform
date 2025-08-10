'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  RateReview as ReviewIcon,
  Translate as TranslateIcon,
  Folder as FolderIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { AppUser } from '@/lib/clerk-github-auth';

interface AuthorOverviewPageProps {
  user: AppUser;
}

export function AuthorOverviewPage({ user }: AuthorOverviewPageProps) {
  return (
    <>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Author Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user.name}. You have authoring responsibilities for content review and translation.
        </Typography>
      </Box>

      {/* Alert for Author Responsibilities */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Author Responsibilities</AlertTitle>
        As an author, you contribute to content quality through reviews and translations. 
        Your expertise helps maintain the accuracy and accessibility of IFLA standards.
      </Alert>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/dashboard/author/review"
                variant="contained"
                startIcon={<ReviewIcon />}
                fullWidth
                sx={{ height: 56 }}
                aria-label="Go to review queue"
              >
                Review Queue
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/dashboard/author/translation"
                variant="outlined"
                startIcon={<TranslateIcon />}
                fullWidth
                sx={{ height: 56 }}
                aria-label="Go to translation tasks"
              >
                Translation Tasks
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/dashboard/author/namespaces"
                variant="outlined"
                startIcon={<FolderIcon />}
                fullWidth
                sx={{ height: 56 }}
                aria-label="Browse namespaces"
              >
                Browse Namespaces
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/cycles"
                variant="outlined"
                startIcon={<TimelineIcon />}
                fullWidth
                sx={{ height: 56 }}
                aria-label="View editorial cycles"
              >
                Editorial Cycles
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}