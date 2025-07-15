'use client';

import React, { useState, useEffect } from 'react';
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
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Dashboard as DashboardIcon,
  Add,
  CloudUpload,
  Assessment,
  People,
  Timeline,
} from '@mui/icons-material';
import { 
  NamespaceSelector, 
  StatusChip, 
  RoleChip, 
  ActivityFeed,
  ActivityItem,
} from '@/components/common';
import { 
  getMockSession, 
  getUserNamespaces,
  mockNamespaces,
  getActiveEditorialCycles,
  getRecentActivity,
  getNamespaceStats,
  getTranslationStats,
  MockUser,
} from '@/lib/mock-data';
import { AppUser } from '@/lib/clerk-github-auth';

interface RoleBasedDashboardProps {
  userId?: string;
  isDemo?: boolean;
  appUser?: AppUser;
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
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RoleBasedDashboard({ userId }: RoleBasedDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MockUser | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      const session = getMockSession(userId);
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    }, 500);
  }, [userId]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid size={{ xs: 12, md: 4 }} key={n}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">User not found. Please log in.</Alert>
      </Container>
    );
  }

  const userNamespaces = getUserNamespaces(user);
  const accessibleNamespaces = userNamespaces.map(ns => mockNamespaces[ns]).filter(Boolean);
  const isAdmin = user.publicMetadata.iflaRole === 'admin';
  const activeCycles = getActiveEditorialCycles();
  const stats = getNamespaceStats();
  const translationStats = getTranslationStats();

  // Convert mock activity logs to ActivityItem format
  const recentActivities: ActivityItem[] = getRecentActivity(10).map(log => ({
    id: log.id,
    type: log.log_name as ActivityItem['type'],
    title: log.description,
    timestamp: log.created_at,
    user: log.causer_id !== 'system' ? {
      id: log.causer_id,
      name: log.causer_id === 'user-admin-1' ? 'Sarah Administrator' :
            log.causer_id === 'user-editor-1' ? 'Maria Editor' :
            log.causer_id === 'user-translator-1' ? 'Pierre Translator' :
            'Unknown User',
    } : undefined,
    metadata: log.properties.attributes,
  }));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <RoleChip role={user.publicMetadata.iflaRole || 'member'} />
          {user.publicMetadata.reviewGroupAdmin?.map(group => (
            <RoleChip key={group} role="namespace-admin" namespace={group} />
          ))}
          {user.publicMetadata.externalContributor && (
            <StatusChip status="external" label="External Contributor" />
          )}
        </Box>
      </Box>

      {/* Quick Stats for Admins */}
      {isAdmin && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Assessment color="primary" />
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Active Namespaces
                    </Typography>
                    <Typography variant="h5">{stats.active}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Timeline color="secondary" />
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Editorial Cycles
                    </Typography>
                    <Typography variant="h5">{activeCycles.length}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <People color="success" />
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Elements
                    </Typography>
                    <Typography variant="h5">{stats.totalElements.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CloudUpload color="info" />
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Active Translations
                    </Typography>
                    <Typography variant="h5">{translationStats.activeTranslations}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="My Namespaces" icon={<DashboardIcon />} iconPosition="start" />
          {isAdmin && <Tab label="All Activity" icon={<Timeline />} iconPosition="start" />}
          {isAdmin && <Tab label="Quick Actions" icon={<Add />} iconPosition="start" />}
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Accessible Namespaces
            </Typography>
            {accessibleNamespaces.length > 0 ? (
              <NamespaceSelector 
                namespaces={accessibleNamespaces} 
                userRole={user.privateMetadata.projectMemberships[0]?.role}
              />
            ) : (
              <Alert severity="info">
                You don't have access to any namespaces yet. Contact an administrator to be added to a project.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {isAdmin && (
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent System Activity
              </Typography>
              <ActivityFeed activities={recentActivities} />
            </Box>
          </TabPanel>
        )}

        {isAdmin && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Administrative Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CloudUpload />}
                    sx={{ py: 2 }}
                  >
                    Start New Import
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Add />}
                    sx={{ py: 2 }}
                    color="secondary"
                  >
                    Create Editorial Cycle
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<People />}
                    sx={{ py: 2 }}
                    color="success"
                  >
                    Manage Users
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        )}
      </Paper>
    </Container>
  );
}