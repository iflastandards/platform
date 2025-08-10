'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface ActivityItemProps {
  action: string;
  author: string;
  time: string;
  type: 'project' | 'user' | 'namespace' | 'vocabulary' | 'profile';
  severity?: 'info' | 'warning' | 'error' | 'success';
}

interface ActivityItem {
  action: string;
  author: string;
  time: string;
  type: 'project' | 'user' | 'namespace' | 'vocabulary' | 'profile';
  severity?: 'info' | 'warning' | 'error' | 'success';
}

function ActivityItemComponent({ action, author, time, type, severity }: ActivityItemProps) {
  const typeIcons = {
    project: '📁',
    user: '👤',
    namespace: '📦',
    vocabulary: '📚',
    profile: '📋',
  };

  const severityColors = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'success',
  } as const;
  
  return (
    <Box py={2} borderBottom={1} borderColor="divider">
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography fontSize={24} aria-hidden="true">{typeIcons[type]}</Typography>
        <Box flex={1}>
          {severity && (
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip 
                label={severity} 
                size="small" 
                color={severityColors[severity]}
              />
              <Chip label={type} size="small" variant="outlined" />
            </Stack>
          )}
          {!severity && (
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip label={type} size="small" variant="outlined" />
            </Stack>
          )}
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

interface SharedActivityPageProps {
  role: 'admin' | 'rg-admin';
  reviewGroupName?: string;
  activities?: ActivityItem[];
}

export function SharedActivityPage({ 
  role, 
  reviewGroupName = 'ISBD',
  activities: providedActivities 
}: SharedActivityPageProps) {
  const [filter, setFilter] = React.useState('all');

  // Default activities based on role
  const defaultActivities: ActivityItem[] = role === 'admin' ? [
    { 
      action: 'Project "MulDiCat French Translation" milestone completed', 
      author: 'John Smith', 
      time: '2 hours ago', 
      type: 'project',
      severity: 'success'
    },
    { 
      action: 'User "alice@example.com" joined "LRM 2.0 Development" project', 
      author: 'James Wilson', 
      time: '3 hours ago', 
      type: 'user',
      severity: 'info'
    },
    { 
      action: 'Failed to generate RDF for vocabulary "test-vocab"', 
      author: 'System', 
      time: '4 hours ago', 
      type: 'vocabulary',
      severity: 'error'
    },
    { 
      action: 'ISBD Review Group chartered "ISBD Maintenance WG 2024-2026"', 
      author: 'Sarah Johnson', 
      time: '5 hours ago', 
      type: 'project',
      severity: 'info'
    },
    { 
      action: 'Vocabulary "Elements" approaching review deadline', 
      author: 'System', 
      time: '6 hours ago', 
      type: 'vocabulary',
      severity: 'warning'
    },
    { 
      action: 'DCTAP Profile "Standard" created', 
      author: 'Mike Davis', 
      time: '1 day ago', 
      type: 'profile',
      severity: 'success'
    },
    { 
      action: 'Vocabulary "Elements" RDF generated', 
      author: 'Jennifer Lee', 
      time: '1 day ago', 
      type: 'vocabulary',
      severity: 'success'
    },
  ] : [
    { 
      action: `${reviewGroupName} translation milestone completed by your team`, 
      author: 'Maria Editor', 
      time: '2 hours ago', 
      type: 'project'
    },
    { 
      action: `New team member joined ${reviewGroupName} Review Group`, 
      author: 'John Smith', 
      time: '1 day ago', 
      type: 'user'
    },
    { 
      action: `${reviewGroupName}/M vocabulary updated`, 
      author: 'Sarah Wilson', 
      time: '2 days ago', 
      type: 'vocabulary'
    },
    { 
      action: 'Review group meeting notes published', 
      author: 'You', 
      time: '3 days ago', 
      type: 'project'
    },
    { 
      action: `${reviewGroupName} namespace export completed`, 
      author: 'System', 
      time: '4 days ago', 
      type: 'namespace'
    },
    { 
      action: 'New translation task assigned', 
      author: 'Maria Editor', 
      time: '5 days ago', 
      type: 'project'
    },
    { 
      action: 'Vocabulary review cycle started', 
      author: 'Sarah Wilson', 
      time: '1 week ago', 
      type: 'vocabulary'
    },
  ];

  const activities = providedActivities || defaultActivities;

  // Filtering is only available for admin role
  const filteredActivities = role === 'admin' && filter !== 'all'
    ? activities.filter(a => a.severity === filter)
    : activities;

  const title = role === 'admin' ? 'System Activity Log' : 'Activity Log';
  const subtitle = role === 'admin' 
    ? 'Monitor all system activities and events'
    : 'Recent activities in your review group';
  const cardTitle = role === 'admin' 
    ? 'Recent Activities' 
    : `${reviewGroupName} Review Group Activity`;

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      <Card elevation={0}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              {cardTitle}
            </Typography>
            {role === 'admin' && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="filter-label">Filter</InputLabel>
                <Select
                  labelId="filter-label"
                  value={filter}
                  label="Filter"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
          
          <Box role="feed" aria-label={`${role === 'admin' ? 'System' : 'Review group'} activity feed`}>
            {filteredActivities.map((activity, index) => (
              <ActivityItemComponent key={index} {...activity} />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}