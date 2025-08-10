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
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  Settings as SettingsIcon,
  GitHub as GitHubIcon,
  Assignment as ProjectIcon,
  Folder as FolderIcon,
  RateReview as ReviewIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { AppUser } from '@/lib/clerk-github-auth';

interface EditorOverviewPageProps {
  user: AppUser;
}

export function EditorOverviewPage({ user }: EditorOverviewPageProps) {
  const userProjects = Object.values(user.projects);
  const editorProjects = userProjects.filter(p => p.role === 'lead' || p.role === 'editor');
  const accessibleNamespaces = user.accessibleNamespaces;

  return (
    <>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Editor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user.name}. You have editorial control over projects, namespaces, and export/import workflows.
        </Typography>
      </Box>

      {/* Alert for Editor Responsibilities */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Editor Responsibilities</AlertTitle>
        As an editor, you have extensive control over project management, namespace configuration, 
        and vocabulary export/import workflows. Use these tools to maintain quality and consistency 
        across IFLA standards.
      </Alert>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/dashboard/editor/import-export"
                variant="contained"
                startIcon={<ImportIcon />}
                fullWidth
                sx={{ height: 56 }}
                aria-label="Import vocabulary from external source"
              >
                Import Vocabulary
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/dashboard/editor/import-export"
                variant="outlined"
                startIcon={<ExportIcon />}
                fullWidth
                sx={{ height: 56 }}
                aria-label="Export vocabulary to Google Sheets"
              >
                Export to Sheets
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/dashboard/editor/namespaces"
                variant="outlined"
                startIcon={<SettingsIcon />}
                fullWidth
                sx={{ height: 56 }}
                aria-label="Manage namespace configurations"
              >
                Manage Namespaces
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/github"
                variant="outlined"
                startIcon={<GitHubIcon />}
                fullWidth
                sx={{ height: 56 }}
                aria-label="Configure GitHub integration"
              >
                GitHub Integration
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{ 
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            role="region"
            aria-labelledby="projects-stat"
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ProjectIcon sx={{ mr: 1, color: 'primary.main' }} aria-hidden="true" />
                <Typography id="projects-stat" variant="h6" component="h2">
                  Projects
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {editorProjects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                As lead or editor
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{ 
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            role="region"
            aria-labelledby="namespaces-stat"
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FolderIcon sx={{ mr: 1, color: 'secondary.main' }} aria-hidden="true" />
                <Typography id="namespaces-stat" variant="h6" component="h2">
                  Namespaces
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {accessibleNamespaces.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Accessible to you
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{ 
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            role="region"
            aria-labelledby="reviews-stat"
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReviewIcon sx={{ mr: 1, color: 'info.main' }} aria-hidden="true" />
                <Typography id="reviews-stat" variant="h6" component="h2">
                  Pending Reviews
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                0
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Awaiting your review
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{ 
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            role="region"
            aria-labelledby="translations-stat"
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TranslateIcon sx={{ mr: 1, color: 'success.main' }} aria-hidden="true" />
                <Typography id="translations-stat" variant="h6" component="h2">
                  Translations
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                0
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                In progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}