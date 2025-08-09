'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Link as MuiLink,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  People as PeopleIcon,
  Language as LanguageIcon,
  Folder as FolderIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  PersonAdd as PersonAddIcon,
  AddTask as AddTaskIcon,
  CloudUpload as CloudUploadIcon,
  Home,
} from '@mui/icons-material';
import { StandardDashboardLayout, NavigationItem } from '@/components/layout/StandardDashboardLayout';

interface AdminDashboardProps {
  userRoles: string[];
  userName?: string;
  userEmail?: string;
}

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

function StatsCard({ title, value, change, changeType }: StatsCardProps) {
  const theme = useTheme();
  const changeColor = 
    changeType === 'increase' ? theme.palette.success.main : 
    changeType === 'decrease' ? theme.palette.error.main : 
    theme.palette.text.secondary;
  
  const cardId = `stats-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      role="region"
      aria-labelledby={cardId}
    >
      <CardContent>
        <Typography 
          id={cardId}
          variant="body2" 
          color="text.secondary" 
          gutterBottom
        >
          {title}
        </Typography>
        <Typography 
          variant="h4" 
          component="div" 
          fontWeight="bold" 
          color="primary.main"
          aria-label={`${title}: ${value.toLocaleString()}`}
        >
          {value.toLocaleString()}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ color: changeColor, mt: 1 }}
          aria-label={`Change: ${change}`}
        >
          {change}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  action: string;
  author: string;
  time: string;
  type: 'project' | 'user' | 'namespace' | 'vocabulary' | 'profile';
}

function ActivityItem({ action, author, time, type }: ActivityItemProps) {
  const typeIcons = {
    project: '📁',
    user: '👤',
    namespace: '📦',
    vocabulary: '📚',
    profile: '📋',
  };
  
  return (
    <Box py={2} borderBottom={1} borderColor="divider">
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography fontSize={24} aria-hidden="true">{typeIcons[type]}</Typography>
        <Box flex={1}>
          <Typography variant="body1" fontWeight="medium">
            {action}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            By {author} • {time}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

interface SystemStatusItemProps {
  service: string;
  status: 'online' | 'offline' | 'maintenance';
}

function SystemStatusItem({ service, status }: SystemStatusItemProps) {
  const statusConfig = {
    online: { color: 'success', label: 'Online' },
    offline: { color: 'error', label: 'Offline' },
    maintenance: { color: 'warning', label: 'Maintenance' },
  } as const;
  
  const config = statusConfig[status];
  
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
      <Typography variant="body2" color="text.secondary">
        {service}:
      </Typography>
      <Chip 
        label={config.label} 
        color={config.color} 
        size="small"
        sx={{ fontWeight: 600 }}
        aria-label={`${service} status: ${config.label}`}
      />
    </Box>
  );
}

export default function AdminDashboard({ userRoles: _userRoles, userName: _userName, userEmail: _userEmail }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: <Home /> },
    { id: 'users', label: 'Users', icon: <PeopleIcon />, badge: 352 },
    { id: 'review-groups', label: 'Review Groups', icon: <LanguageIcon /> },
    { id: 'projects', label: 'Projects', icon: <AssignmentIcon />, badge: 12 },
    { id: 'namespaces', label: 'Namespaces', icon: <FolderIcon /> },
    { id: 'vocabularies', label: 'Vocabularies', icon: <BookIcon />, badge: 824 },
    { id: 'profiles', label: 'DCTAP Profiles', icon: <BookIcon /> },
    { id: 'adopt', label: 'Adopt Spreadsheet', icon: <CloudUploadIcon />, specialAccess: true },
    { id: 'activity', label: 'Activity Log', icon: <HistoryIcon /> },
  ];

  const stats = [
    { title: 'Total Users', value: 352, change: '+14 this month', changeType: 'increase' as const },
    { title: 'Active Projects', value: 12, change: '+2 this month', changeType: 'increase' as const },
    { title: 'Total Vocabularies', value: 824, change: '+38 this month', changeType: 'increase' as const },
  ];

  const recentActivity = [
    { action: 'Project "MulDiCat French Translation" milestone completed', author: 'John Smith', time: '2 hours ago', type: 'project' as const },
    { action: 'User "alice@example.com" joined "LRM 2.0 Development" project', author: 'James Wilson', time: '3 hours ago', type: 'user' as const },
    { action: 'ISBD Review Group chartered "ISBD Maintenance WG 2024-2026"', author: 'Sarah Johnson', time: '5 hours ago', type: 'project' as const },
    { action: 'DCTAP Profile "Standard" created', author: 'Mike Davis', time: '1 day ago', type: 'profile' as const },
    { action: 'Vocabulary "Elements" RDF generated', author: 'Jennifer Lee', time: '1 day ago', type: 'vocabulary' as const },
  ];

  const systemStatus = [
    { service: 'GitHub API', status: 'online' as const },
    { service: 'Clerk Auth', status: 'online' as const },
    { service: 'Vocabulary Server', status: 'online' as const },
    { service: 'Build System', status: 'online' as const },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            <Box mb={4}>
              <Typography variant="h4" fontWeight="bold" gutterBottom component="h1">
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                System overview and key metrics
              </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.title}>
                  <StatsCard {...stat} />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              {/* Recent Activity */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Card elevation={0}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom component="h2">
                      Recent System Activity
                    </Typography>
                    <Box role="feed" aria-label="Recent activity feed">
                      {recentActivity.map((activity, index) => (
                        <ActivityItem key={index} {...activity} />
                      ))}
                    </Box>
                    <Box mt={3} pt={2} borderTop={1} borderColor="divider">
                      <MuiLink
                        component={Link}
                        href="/dashboard/activity?demo=true"
                        color="primary"
                        underline="hover"
                        fontSize="small"
                      >
                        View all activity →
                      </MuiLink>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* System Status & Quick Actions */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={3}>
                  {/* System Status */}
                  <Card elevation={0}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom component="h2">
                        System Status
                      </Typography>
                      <Box role="list" aria-label="System service status">
                        {systemStatus.map((status) => (
                          <SystemStatusItem key={status.service} {...status} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card elevation={0}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom component="h2">
                        Quick Actions
                      </Typography>
                      <Stack spacing={2}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<AddTaskIcon />}
                          component={Link}
                          href="/dashboard/projects/new?demo=true"
                          aria-label="Charter a new project"
                        >
                          Charter New Project
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<CloudUploadIcon />}
                          component={Link}
                          href="/dashboard/admin/adopt-spreadsheet"
                          aria-label="Adopt a spreadsheet"
                        >
                          Adopt Spreadsheet
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<PersonAddIcon />}
                          component={Link}
                          href="/dashboard/users/invite?demo=true"
                          aria-label="Invite a new user"
                        >
                          Invite User
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </>
        );

      case 'users':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              User Management
            </Typography>
            <Button component={Link} href="/dashboard/users" variant="contained">
              View All Users
            </Button>
          </Box>
        );

      case 'projects':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Project Management
            </Typography>
            <Button component={Link} href="/dashboard/projects" variant="contained">
              View All Projects
            </Button>
          </Box>
        );

      case 'adopt':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Adopt Spreadsheet
            </Typography>
            <Button component={Link} href="/dashboard/admin/adopt-spreadsheet" variant="contained">
              Go to Spreadsheet Adoption
            </Button>
          </Box>
        );

      case 'activity':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Activity Log
            </Typography>
            <Button component={Link} href="/dashboard/activity" variant="contained">
              View Full Activity Log
            </Button>
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
      title="IFLA Admin"
      subtitle="System Administration"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </StandardDashboardLayout>
  );
}