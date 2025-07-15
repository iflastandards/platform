'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Edit as EditIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  Folder as FolderIcon,
  Assignment as ProjectIcon,
  Timeline as TimelineIcon,
  GitHub as GitHubIcon,
  Build as BuildIcon,
  Translate as TranslateIcon,
  RateReview as ReviewIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';

interface EditorDashboardProps {
  user: AppUser;
}

export default function EditorDashboard({ user }: EditorDashboardProps) {
  const userProjects = Object.values(user.projects);
  const editorProjects = userProjects.filter(p => p.role === 'lead' || p.role === 'editor');
  const accessibleNamespaces = user.accessibleNamespaces;

  // Get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'lead': return 'Project Lead';
      case 'editor': return 'Editor';
      default: return role;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
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
                href="/import"
                variant="contained"
                startIcon={<ImportIcon />}
                fullWidth
                sx={{ height: 56 }}
              >
                Import Vocabulary
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/export"
                variant="outlined"
                startIcon={<ExportIcon />}
                fullWidth
                sx={{ height: 56 }}
              >
                Export to Sheets
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                component={Link}
                href="/namespaces"
                variant="outlined"
                startIcon={<SettingsIcon />}
                fullWidth
                sx={{ height: 56 }}
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
              >
                GitHub Integration
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Projects */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader 
              title="My Projects"
              action={
                <Chip 
                  label={`${editorProjects.length} projects`}
                  color="primary"
                  size="small"
                />
              }
            />
            <CardContent>
              <List>
                {editorProjects.map((project) => (
                  <ListItem key={project.number} divider>
                    <ListItemIcon>
                      <ProjectIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={project.title}
                      secondary={
                        <span style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                          <Chip
                            label={getRoleDisplay(project.role)}
                            size="small"
                            color="primary"
                          />
                          <Typography variant="caption" color="text.secondary" component="span">
                            {project.namespaces.length} namespaces
                          </Typography>
                        </span>
                      }
                    />
                    <IconButton
                      component={Link}
                      href={`/projects/${project.number}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                ))}
                {editorProjects.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No projects assigned"
                      secondary="You don't have any projects with editor or lead roles"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Namespaces */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader 
              title="Accessible Namespaces"
              action={
                <Chip 
                  label={`${accessibleNamespaces.length} namespaces`}
                  color="secondary"
                  size="small"
                />
              }
            />
            <CardContent>
              <List>
                {accessibleNamespaces.slice(0, 8).map((namespace) => (
                  <ListItem key={namespace} divider>
                    <ListItemIcon>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={namespace.toUpperCase()}
                      secondary="Vocabulary management"
                    />
                    <IconButton
                      component={Link}
                      href={`/namespaces/${namespace}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                ))}
                {accessibleNamespaces.length > 8 && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Button
                          component={Link}
                          href="/namespaces"
                          variant="text"
                          size="small"
                        >
                          View all {accessibleNamespaces.length} namespaces
                        </Button>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Editorial Tools */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Editorial Tools" />
            <CardContent>
              <List>
                <ListItem
                  component={Link}
                  href="/cycles"
                  sx={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <TimelineIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Editorial Cycles"
                    secondary="Manage vocabulary publication cycles"
                  />
                </ListItem>
                <Divider />
                <ListItem
                  component={Link}
                  href="/review"
                  sx={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <ReviewIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Review Queue"
                    secondary="Pending reviews and approvals"
                  />
                </ListItem>
                <Divider />
                <ListItem
                  component={Link}
                  href="/translation"
                  sx={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <TranslateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Translation Management"
                    secondary="Coordinate multilingual content"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="System Status" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <BuildIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Build Pipeline"
                    secondary="Last build: 2 hours ago"
                  />
                  <Chip label="Healthy" color="success" size="small" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <GitHubIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="GitHub Integration"
                    secondary="API status and sync"
                  />
                  <Chip label="Connected" color="success" size="small" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <ImportIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Import Status"
                    secondary="Active imports: 0"
                  />
                  <Chip label="Idle" color="default" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}