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
  RateReview as ReviewIcon,
  Translate as TranslateIcon,
  Assignment as ProjectIcon,
  Folder as FolderIcon,
  CheckCircle as ApproveIcon,
  Comment as CommentIcon,
  Language as LanguageIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';

interface AuthorDashboardProps {
  user: AppUser;
}

export default function AuthorDashboard({ user }: AuthorDashboardProps) {
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
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
              >
                Editorial Cycles
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
                  label={`${authorProjects.length} projects`}
                  color="primary"
                  size="small"
                />
              }
            />
            <CardContent>
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
                      secondary="Content to review/translate"
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

        {/* Active Tasks */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Active Tasks" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ReviewIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Pending Reviews"
                    secondary="3 items waiting for review"
                  />
                  <Chip label="3" color="warning" size="small" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <TranslateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Translation Tasks"
                    secondary="2 items need translation"
                  />
                  <Chip label="2" color="info" size="small" />
                </ListItem>
                <Divider />
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
            </CardContent>
          </Card>
        </Grid>

        {/* Tools & Resources */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Tools & Resources" />
            <CardContent>
              <List>
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
                    <ApproveIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Review Interface"
                    secondary="Approve, reject, and comment on content"
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
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Translation Tools"
                    secondary="Manage multilingual content"
                  />
                </ListItem>
                <Divider />
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
                    primary="Editorial Timeline"
                    secondary="Track progress and deadlines"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}