'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add,
  CloudUpload,
  Assessment,
  People,
  Timeline,
  Home,
  Settings,
  Folder,
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
import { StandardDashboardLayout, NavigationItem } from '@/components/layout/StandardDashboardLayout';

interface RoleBasedDashboardProps {
  userId?: string;
  isDemo?: boolean;
  appUser?: AppUser;
}


export default function RoleBasedDashboard({ userId }: RoleBasedDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MockUser | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

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
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid size={{ xs: 12, md: 4 }} key={n}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">User not found. Please log in.</Alert>
      </Box>
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

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home /> },
    { id: 'namespaces', label: 'Your Namespaces', icon: <Folder />, badge: accessibleNamespaces.length },
    ...(isAdmin ? [
      { id: 'activity', label: 'All Activity', icon: <Timeline /> },
      { id: 'actions', label: 'Quick Actions', icon: <Settings /> },
    ] : []),
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
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
                    aria-labelledby="active-namespaces-stat"
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Assessment color="primary" aria-hidden="true" />
                        <Box>
                          <Typography id="active-namespaces-stat" color="text.secondary" variant="body2">
                            Active Namespaces
                          </Typography>
                          <Typography variant="h5" aria-label={`${stats.active} active namespaces`}>
                            {stats.active}
                          </Typography>
                        </Box>
                      </Box>
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
                    aria-labelledby="editorial-cycles-stat"
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Timeline color="secondary" aria-hidden="true" />
                        <Box>
                          <Typography id="editorial-cycles-stat" color="text.secondary" variant="body2">
                            Editorial Cycles
                          </Typography>
                          <Typography variant="h5" aria-label={`${activeCycles.length} editorial cycles`}>
                            {activeCycles.length}
                          </Typography>
                        </Box>
                      </Box>
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
                    aria-labelledby="total-elements-stat"
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <People color="success" aria-hidden="true" />
                        <Box>
                          <Typography id="total-elements-stat" color="text.secondary" variant="body2">
                            Total Elements
                          </Typography>
                          <Typography variant="h5" aria-label={`${stats.totalElements.toLocaleString()} total elements`}>
                            {stats.totalElements.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
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
                    aria-labelledby="active-translations-stat"
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CloudUpload color="info" aria-hidden="true" />
                        <Box>
                          <Typography id="active-translations-stat" color="text.secondary" variant="body2">
                            Active Translations
                          </Typography>
                          <Typography variant="h5" aria-label={`${translationStats.activeTranslations} active translations`}>
                            {translationStats.activeTranslations}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        );

      case 'namespaces':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Your Accessible Namespaces
            </Typography>
            {accessibleNamespaces.length > 0 ? (
              <NamespaceSelector 
                namespaces={accessibleNamespaces} 
                userRole={user.privateMetadata.projectMemberships[0]?.role}
              />
            ) : (
              <Alert severity="info">
                You don&apos;t have access to any namespaces yet. Contact an administrator to be added to a project.
              </Alert>
            )}
          </Box>
        );

      case 'activity':
        return isAdmin ? (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Recent System Activity
            </Typography>
            <ActivityFeed activities={recentActivities} />
          </Box>
        ) : null;

      case 'actions':
        return isAdmin ? (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Administrative Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CloudUpload />}
                  sx={{ py: 2 }}
                  aria-label="Start a new import process"
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
                  aria-label="Create a new editorial cycle"
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
                  aria-label="Manage system users"
                >
                  Manage Users
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <StandardDashboardLayout
      title="Role-Based Dashboard"
      subtitle={isAdmin ? 'System Administration' : 'Member Dashboard'}
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </StandardDashboardLayout>
  );
}