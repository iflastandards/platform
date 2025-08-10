'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  GitHub,
  Group,
  Folder,
  AccountTree,
  AdminPanelSettings,
  Edit,
  RateReview,
  Translate,
  Person,
  Home,
} from '@mui/icons-material';
import { AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';
import { TabBasedDashboardLayout, NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

interface PersonalDashboardProps {
  user: AppUser;
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'maintainer':
      return <AdminPanelSettings color="primary" />;
    case 'lead':
      return <AccountTree color="primary" />;
    case 'editor':
      return <Edit color="secondary" />;
    case 'reviewer':
      return <RateReview color="info" />;
    case 'translator':
      return <Translate color="success" />;
    default:
      return <Person />;
  }
}

export default function PersonalDashboard({ user }: PersonalDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const projectCount = Object.keys(user.projects).length;
  const isDemo = process.env.NEXT_PUBLIC_IFLA_DEMO === 'true';

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
    },
    {
      id: 'review-groups',
      label: 'Review Groups',
      icon: Group,
      badge: user.reviewGroups.length,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: AccountTree,
      badge: projectCount,
    },
    {
      id: 'namespaces',
      label: 'Namespaces',
      icon: Folder,
      badge: user.accessibleNamespaces.length,
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom component="h1">
                Welcome back, {user.name}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                {user.githubUsername && (
                  <Chip
                    icon={<GitHub />}
                    label={`@${user.githubUsername}`}
                    variant="outlined"
                    size="small"
                  />
                )}
                {user.systemRole === 'admin' && (
                  <Chip
                    icon={<AdminPanelSettings />}
                    label="System Admin"
                    color="primary"
                    size="small"
                  />
                )}
                {user.isReviewGroupAdmin && (
                  <Chip
                    icon={<Group />}
                    label="Review Group Admin"
                    color="secondary"
                    size="small"
                  />
                )}
                {isDemo && (
                  <Chip
                    label="DEMO MODE"
                    color="warning"
                    size="small"
                    variant="filled"
                  />
                )}
              </Stack>
            </Box>

            {/* Quick Stats */}
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Dashboard Overview
            </Typography>
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
                  aria-labelledby="review-groups-card"
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Group sx={{ mr: 1, color: 'primary.main' }} aria-hidden="true" />
                      <Typography id="review-groups-card" variant="h6" component="h3">
                        Review Groups
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h4"
                      sx={{ fontWeight: 'bold', color: 'text.primary' }}
                      aria-label={`You are a member of ${user.reviewGroups.length} review groups`}
                    >
                      {user.reviewGroups.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Groups you belong to
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
                  aria-labelledby="projects-card"
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountTree sx={{ mr: 1, color: 'secondary.main' }} aria-hidden="true" />
                      <Typography id="projects-card" variant="h6" component="h3">
                        Active Projects
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h4"
                      sx={{ fontWeight: 'bold', color: 'text.primary' }}
                      aria-label={`You have ${projectCount} active projects`}
                    >
                      {projectCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Projects assigned to you
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
                  aria-labelledby="namespaces-card"
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Folder sx={{ mr: 1, color: 'success.main' }} aria-hidden="true" />
                      <Typography id="namespaces-card" variant="h6" component="h3">
                        Namespaces
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h4"
                      sx={{ fontWeight: 'bold', color: 'text.primary' }}
                      aria-label={`You have access to ${user.accessibleNamespaces.length} namespaces`}
                    >
                      {user.accessibleNamespaces.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Accessible namespaces
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
                  aria-labelledby="role-card"
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DashboardIcon sx={{ mr: 1, color: 'info.main' }} aria-hidden="true" />
                      <Typography id="role-card" variant="h6" component="h3">
                        Your Role
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h4"
                      sx={{ fontWeight: 'bold', color: 'text.primary' }}
                    >
                      {user.systemRole === 'admin' ? 'System Admin' :
                       user.isReviewGroupAdmin ? 'RG Admin' : 'Member'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      System access level
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );

      case 'review-groups':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Your Review Group Memberships
            </Typography>
            {user.reviewGroups.length > 0 ? (
              <List>
                {user.reviewGroups.map((rg, index) => (
                  <React.Fragment key={rg.slug}>
                    <ListItem sx={{ borderBottom: index < user.reviewGroups.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                      <ListItemIcon>
                        {getRoleIcon(rg.role)}
                      </ListItemIcon>
                      <ListItemText
                        primary={rg.name}
                        secondary={
                          <React.Fragment>
                            <Chip label={rg.role} size="small" sx={{ mr: 1 }} />
                            {rg.namespaces.map(ns => (
                              <Chip key={ns} label={ns} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                            ))}
                          </React.Fragment>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      {rg.role === 'maintainer' && (
                        <Button
                          component={Link}
                          href={`/dashboard/rg/${rg.slug}`}
                          variant="outlined"
                          size="small"
                          aria-label={`Manage ${rg.name} review group`}
                        >
                          Manage
                        </Button>
                      )}
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                You are not a member of any review groups. Contact an administrator to be added to a team.
              </Alert>
            )}
          </Box>
        );

      case 'projects':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Your Project Assignments
            </Typography>
            {projectCount > 0 ? (
              <List>
                {Object.entries(user.projects).map(([projectId, project], index) => (
                  <React.Fragment key={projectId}>
                    <ListItem sx={{ borderBottom: index < Object.entries(user.projects).length - 1 ? 1 : 0, borderColor: 'divider' }}>
                      <ListItemIcon>
                        {getRoleIcon(project.role)}
                      </ListItemIcon>
                      <ListItemText
                        primary={project.title}
                        secondary={
                          <React.Fragment>
                            <Chip label={project.role} size="small" color="primary" sx={{ mr: 1 }} />
                            <Chip label={`Team: ${project.sourceTeam}`} size="small" sx={{ mr: 1 }} />
                            {project.namespaces.map(ns => (
                              <Chip key={ns} label={ns} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                            ))}
                          </React.Fragment>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      <Button
                        component={Link}
                        href={`/dashboard/project/${projectId}`}
                        variant="contained"
                        size="small"
                        aria-label={`Open ${project.title} project`}
                      >
                        Open
                      </Button>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                You are not assigned to any projects yet. Review Group administrators can assign you to projects.
              </Alert>
            )}
          </Box>
        );

      case 'namespaces':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Accessible Namespaces
            </Typography>
            {user.accessibleNamespaces.length > 0 ? (
              <Grid container spacing={2}>
                {user.accessibleNamespaces.map((namespace) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={namespace}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {namespace.toUpperCase()}
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
            ) : (
              <Alert severity="warning">
                You don&apos;t have access to any namespaces. You need to be assigned to a review group or project to gain namespace access.
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <TabBasedDashboardLayout
      title="Personal Dashboard"
      subtitle="Manage your IFLA Standards work"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
