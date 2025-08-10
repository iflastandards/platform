'use client';

import React from 'react';
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
  PersonAdd as PersonAddIcon,
  AddTask as AddTaskIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

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

export function AdminOverviewPage() {
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
                  href="/dashboard/admin/activity"
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
                  href="/dashboard/admin/projects/new"
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
                  href="/dashboard/admin/users/invite"
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
}