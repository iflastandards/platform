'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Alert,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
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
} from '@mui/icons-material';
import { AppUser } from '@/lib/clerk-github-auth';
import Link from 'next/link';
import SkipLinks from '@/components/accessibility/SkipLinks';
import LiveRegion from '@/components/accessibility/LiveRegion';

interface PersonalDashboardProps {
  user: AppUser;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div 
      role="tabpanel" 
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
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
  const [tabValue, setTabValue] = useState(0);
  const [liveMessage, setLiveMessage] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const tabNames = ['Review Groups', 'Projects', 'Namespaces'];
    setLiveMessage(`Switched to ${tabNames[newValue]} tab`);
    // Clear message after announcement
    setTimeout(() => setLiveMessage(''), 1000);
  };

  const projectCount = Object.keys(user.projects).length;
  const isDemo = process.env.NEXT_PUBLIC_IFLA_DEMO === 'true';

  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#dashboard-tabs', label: 'Skip to dashboard tabs' },
    { href: '#stats-overview', label: 'Skip to statistics overview' },
  ];

  return (
    <>
      <SkipLinks links={skipLinks} />
      <LiveRegion message={liveMessage} />
      <Container 
        maxWidth="xl" 
        sx={{ py: 4 }}
        component="main"
        id="main-content"
        role="main"
        aria-labelledby="dashboard-title"
      >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom
          component="h1"
          id="dashboard-title"
        >
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
      <Box 
        component="section" 
        id="stats-overview"
        aria-labelledby="stats-title"
        sx={{ mb: 4 }}
      >
        <Typography 
          id="stats-title" 
          variant="h5" 
          component="h2" 
          sx={{ mb: 2, sr: 'only' }}
        >
          Dashboard Statistics Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              role="region"
              aria-labelledby="review-groups-title"
              aria-describedby="review-groups-desc"
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Group color="primary" aria-hidden="true" />
                  <Box>
                    <Typography 
                      id="review-groups-title"
                      color="text.secondary" 
                      variant="body2"
                    >
                      Review Groups
                    </Typography>
                    <Typography 
                      variant="h5"
                      aria-label={`You are a member of ${user.reviewGroups.length} review groups`}
                    >
                      {user.reviewGroups.length}
                    </Typography>
                    <Box 
                      id="review-groups-desc" 
                      sx={{ sr: 'only' }}
                    >
                      Number of review groups you belong to
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountTree color="secondary" />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Projects
                  </Typography>
                  <Typography variant="h5">{projectCount}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Folder color="success" />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Accessible Namespaces
                  </Typography>
                  <Typography variant="h5">{user.accessibleNamespaces.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DashboardIcon color="info" />
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Your Role
                  </Typography>
                  <Typography variant="h6">
                    {user.systemRole === 'admin' ? 'System Admin' :
                     user.isReviewGroupAdmin ? 'RG Admin' : 'Member'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          aria-label="Dashboard sections"
          id="dashboard-tabs"
        >
          <Tab 
            label="Review Groups" 
            icon={<Group aria-hidden="true" />} 
            iconPosition="start"
            id="dashboard-tab-0"
            aria-controls="dashboard-tabpanel-0"
          />
          <Tab 
            label="Projects" 
            icon={<AccountTree aria-hidden="true" />} 
            iconPosition="start"
            id="dashboard-tab-1"
            aria-controls="dashboard-tabpanel-1"
          />
          <Tab 
            label="Namespaces" 
            icon={<Folder aria-hidden="true" />} 
            iconPosition="start"
            id="dashboard-tab-2"
            aria-controls="dashboard-tabpanel-2"
          />
        </Tabs>

        {/* Review Groups Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Review Group Memberships
            </Typography>
            {user.reviewGroups.length > 0 ? (
              <List>
                {user.reviewGroups.map((rg) => (
                  <React.Fragment key={rg.slug}>
                    <ListItem>
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
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                You are not a member of any review groups. Contact an administrator to be added to a team.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Projects Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Project Assignments
            </Typography>
            {projectCount > 0 ? (
              <List>
                {Object.entries(user.projects).map(([projectId, project]) => (
                  <React.Fragment key={projectId}>
                    <ListItem>
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
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                You are not assigned to any projects yet. Review Group administrators can assign you to projects.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Namespaces Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Accessible Namespaces
            </Typography>
            {user.accessibleNamespaces.length > 0 ? (
              <Grid container spacing={2}>
                {user.accessibleNamespaces.map((namespace) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={namespace}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
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
        </TabPanel>
      </Paper>
    </Container>
    </>
  );
}