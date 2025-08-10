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
  severity: 'info' | 'warning' | 'error' | 'success';
}

function ActivityItem({ action, author, time, type, severity }: ActivityItemProps) {
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
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <Chip 
              label={severity} 
              size="small" 
              color={severityColors[severity]}
            />
            <Chip label={type} size="small" variant="outlined" />
          </Stack>
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

export function AdminActivityPage() {
  const [filter, setFilter] = React.useState('all');

  const activities: ActivityItemProps[] = [
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
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.severity === filter);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Activity Log
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor all system activities and events
        </Typography>
      </Box>

      <Card elevation={0}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Recent Activities
            </Typography>
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
          </Box>
          
          <Box role="feed" aria-label="System activity feed">
            {filteredActivities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
