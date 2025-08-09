'use client';

import React, { useState } from 'react';
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
  Home,
} from '@mui/icons-material';
import { AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';
import { StandardDashboardLayout, NavigationItem } from '@/components/layout/StandardDashboardLayout';

interface EditorDashboardProps {
  user: AppUser;
}

export default function EditorDashboard({ user }: EditorDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
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

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home /> },
    { id: 'projects', label: 'My Projects', icon: <ProjectIcon />, badge: editorProjects.length },
    { id: 'namespaces', label: 'Namespaces', icon: <FolderIcon />, badge: accessibleNamespaces.length },
    { id: 'editorial', label: 'Editorial Tools', icon: <EditIcon /> },
    { id: 'import-export', label: 'Import/Export', icon: <ImportIcon /> },
    { id: 'review', label: 'Review Queue', icon: <ReviewIcon /> },
    { id: 'translation', label: 'Translations', icon: <TranslateIcon /> },
    { id: 'system', label: 'System Status', icon: <BuildIcon /> },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
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
                      href="/import"
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
                      href="/export"
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
                      href="/namespaces"
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

      case 'projects':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              My Projects
            </Typography>
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
                    aria-label={`Edit ${project.title}`}
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
          </Box>
        );

      case 'namespaces':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Accessible Namespaces
            </Typography>
            <List>
              {accessibleNamespaces.map((namespace) => (
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
                    aria-label={`Edit ${namespace.toUpperCase()} namespace`}
                  >
                    <EditIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 'editorial':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Editorial Tools
            </Typography>
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
          </Box>
        );

      case 'system':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              System Status
            </Typography>
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
          </Box>
        );

      default:
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {navigationItems.find(item => item.id === selectedTab)?.label}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This section is under development.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <StandardDashboardLayout
      title="Editor Dashboard"
      subtitle="Editorial Control Center"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </StandardDashboardLayout>
  );
}