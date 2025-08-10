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
  Alert,
  AlertTitle,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Edit as EditIcon,
  RateReview as ReviewIcon,
  Translate as TranslateIcon,
  Assignment as ProjectIcon,
  Folder as FolderIcon,
  CheckCircle as ApproveIcon,
  Comment as CommentIcon,
  Language as LanguageIcon,
  Timeline as TimelineIcon,
  Home,
  Task as TaskIcon,
  Build as ToolsIcon,
} from '@mui/icons-material';
import { AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';
import { TabBasedDashboardLayout, NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

interface AuthorDashboardProps {
  user: AppUser;
}

export default function AuthorDashboard({ user }: AuthorDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const userProjects = Object.values(user.projects);
  const authorProjects = userProjects.filter(p => p.role === 'reviewer' || p.role === 'translator');
  const accessibleNamespaces = user.accessibleNamespaces;

  // Get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'reviewer': return 'Reviewer';
      case 'translator': return 'Translator';
      default: return role;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'reviewer': return 'secondary';
      case 'translator': return 'info';
      default: return 'default';
    }
  };

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'projects', label: 'My Projects', icon: ProjectIcon, badge: authorProjects.length },
    { id: 'namespaces', label: 'Namespaces', icon: FolderIcon, badge: accessibleNamespaces.length },
    { id: 'tasks', label: 'Active Tasks', icon: TaskIcon, badge: 6 },
    { id: 'review', label: 'Review Queue', icon: ReviewIcon, badge: 3 },
    { id: 'translation', label: 'Translation Tasks', icon: TranslateIcon, badge: 2 },
    { id: 'tools', label: 'Tools & Resources', icon: ToolsIcon },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
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
                      href="/review"
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
                      href="/translation"
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
                      href="/namespaces"
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

      case 'projects':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              My Projects
            </Typography>
            <List>
              {authorProjects.map((project) => (
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
                          color={getRoleColor(project.role) as 'secondary' | 'info' | 'default'}
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
                    aria-label={`View ${project.title} project`}
                  >
                    <EditIcon />
                  </IconButton>
                </ListItem>
              ))}
              {authorProjects.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No projects assigned"
                    secondary="You don't have any projects with reviewer or translator roles"
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
            <Grid container spacing={2}>
              {accessibleNamespaces.map((namespace) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={namespace}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {namespace.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Content to review/translate
                      </Typography>
                      <Button
                        component={Link}
                        href={`/namespaces/${namespace}`}
                        variant="contained"
                        fullWidth
                        aria-label={`View ${namespace.toUpperCase()} namespace`}
                      >
                        View Namespace
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'tasks':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Active Tasks
            </Typography>
            <List>
              <ListItem divider>
                <ListItemIcon>
                  <ReviewIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Pending Reviews"
                  secondary="3 items waiting for review"
                />
                <Chip label="3" color="warning" size="small" />
              </ListItem>
              <ListItem divider>
                <ListItemIcon>
                  <TranslateIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Translation Tasks"
                  secondary="2 items need translation"
                />
                <Chip label="2" color="info" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CommentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Comments to Address"
                  secondary="1 comment needs response"
                />
                <Chip label="1" color="error" size="small" />
              </ListItem>
            </List>
          </Box>
        );

      case 'review':
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

      case 'translation':
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

      case 'tools':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Tools & Resources
            </Typography>
            <List>
              <ListItem
                component={Link}
                href="/review"
                sx={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { backgroundColor: 'action.hover' },
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemIcon>
                  <ApproveIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Review Interface"
                  secondary="Approve, reject, and comment on content"
                />
              </ListItem>
              <ListItem
                component={Link}
                href="/translation"
                sx={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { backgroundColor: 'action.hover' },
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Translation Tools"
                  secondary="Manage multilingual content"
                />
              </ListItem>
              <ListItem
                component={Link}
                href="/cycles"
                sx={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': { backgroundColor: 'action.hover' },
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Editorial Timeline"
                  secondary="Track progress and deadlines"
                />
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
    <TabBasedDashboardLayout
      title="Author Dashboard"
      subtitle="Content Review & Translation"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
