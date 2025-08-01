'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
  Button,
  Stack,
  useTheme,
  Container,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Language as LanguageIcon,
  Folder as FolderIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  PersonAdd as PersonAddIcon,
  AddTask as AddTaskIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

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
  
  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold" color="primary.main">
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ color: changeColor, mt: 1 }}>
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
        <Typography fontSize={24}>{typeIcons[type]}</Typography>
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
      />
    </Box>
  );
}

export default function AdminDashboard({ userRoles: _userRoles, userName: _userName, userEmail: _userEmail }: AdminDashboardProps) {
  
  const drawerWidth = 240;
  
  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard/admin', active: true },
    { key: 'users', label: 'Users', icon: <PeopleIcon />, href: '/dashboard/users' },
    { key: 'review-groups', label: 'Review Groups', icon: <LanguageIcon />, href: '/dashboard/review-groups' },
    { key: 'projects', label: 'Projects', icon: <AssignmentIcon />, href: '/dashboard/projects' },
    { key: 'namespaces', label: 'Namespaces', icon: <FolderIcon />, href: '/dashboard/namespaces' },
    { key: 'vocabularies', label: 'Vocabularies', icon: <BookIcon />, href: '/dashboard/vocabularies' },
    { key: 'profiles', label: 'DCTAP Profiles', icon: <BookIcon />, href: '/dashboard/profiles' },
    { key: 'adopt', label: 'Adopt Spreadsheet', icon: <CloudUploadIcon />, href: '/dashboard/admin/adopt-spreadsheet' },
    { key: 'activity', label: 'Activity Log', icon: <HistoryIcon />, href: '/dashboard/activity' },
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

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight="bold">
            IFLA Admin
          </Typography>
        </Box>
        <List sx={{ px: 2 }}>
          {sidebarItems.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={`${item.href}?demo=true`}
                selected={item.active}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', overflow: 'auto' }}>
        {/* Page Content */}
        <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
          <Box mb={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
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
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recent System Activity
                  </Typography>
                  <Box>
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
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      System Status
                    </Typography>
                    <Box>
                      {systemStatus.map((status) => (
                        <SystemStatusItem key={status.service} {...status} />
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card elevation={0}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddTaskIcon />}
                        component={Link}
                        href="/dashboard/projects/new?demo=true"
                      >
                        Charter New Project
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        component={Link}
                        href="/dashboard/admin/adopt-spreadsheet"
                      >
                        Adopt Spreadsheet
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PersonAddIcon />}
                        component={Link}
                        href="/dashboard/users/invite?demo=true"
                      >
                        Invite User
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}