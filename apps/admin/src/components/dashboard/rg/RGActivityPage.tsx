'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
} from '@mui/material';

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

export function RGActivityPage() {
  const activities: ActivityItemProps[] = [
    { 
      action: 'ISBD translation milestone completed by your team', 
      author: 'Maria Editor', 
      time: '2 hours ago', 
      type: 'project'
    },
    { 
      action: 'New team member joined ISBD Review Group', 
      author: 'John Smith', 
      time: '1 day ago', 
      type: 'user'
    },
    { 
      action: 'ISBD/M vocabulary updated', 
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
      action: 'ISBD namespace export completed', 
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

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Activity Log
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Recent activities in your review group
        </Typography>
      </Box>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ISBD Review Group Activity
          </Typography>
          
          <Box role="feed" aria-label="Review group activity feed">
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}