'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Link,
  Skeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Edit,
  CheckCircle,
  Translate,
  Build,
  Login,
  Group,
  Timeline as TimelineIcon,
  Info,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityItem {
  id: string;
  type: 'import' | 'edit' | 'validation' | 'translation' | 'build' | 'auth' | 'project' | 'cycle' | 'generic';
  title: string;
  description?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
  link?: {
    href: string;
    label: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  showTimestamps?: boolean;
  compact?: boolean;
}

const iconMap = {
  import: CloudUpload,
  edit: Edit,
  validation: CheckCircle,
  translation: Translate,
  build: Build,
  auth: Login,
  project: Group,
  cycle: TimelineIcon,
  generic: Info,
};

const colorMap = {
  import: 'primary',
  edit: 'secondary',
  validation: 'success',
  translation: 'info',
  build: 'warning',
  auth: 'inherit',
  project: 'primary',
  cycle: 'secondary',
  generic: 'inherit',
} as const;

export function ActivityFeed({
  activities,
  loading = false,
  maxItems = 10,
  showTimestamps = true,
  compact = false,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((n) => (
          <Box key={n} sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={60} />
          </Box>
        ))}
      </Box>
    );
  }

  const displayActivities = activities.slice(0, maxItems);

  if (compact) {
    return (
      <Box>
        {displayActivities.map((activity) => (
          <Paper
            key={activity.id}
            sx={{
              p: 2,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
            variant="outlined"
          >
            <Avatar
              sx={{
                bgcolor: `${colorMap[activity.type]}.light`,
                width: 32,
                height: 32,
              }}
            >
              {React.createElement(iconMap[activity.type] || Info, { 
                fontSize: 'small',
                color: colorMap[activity.type] as 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'inherit',
              })}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {activity.title}
              </Typography>
              {activity.description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activity.description}
                </Typography>
              )}
            </Box>

            {showTimestamps && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    );
  }

  // Full timeline view using List component
  return (
    <List sx={{ width: '100%' }}>
      {displayActivities.map((activity, index) => {
        const Icon = iconMap[activity.type] || Info;
        const isLast = index === displayActivities.length - 1;

        return (
          <React.Fragment key={activity.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: `${colorMap[activity.type]}.main`,
                    width: 40,
                    height: 40,
                  }}
                >
                  <Icon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {activity.title}
                    </Typography>
                    {activity.user && (
                      <Chip
                        avatar={
                          <Avatar 
                            src={activity.user.avatar} 
                            sx={{ width: 20, height: 20 }}
                          >
                            {activity.user.name[0]}
                          </Avatar>
                        }
                        label={activity.user.name}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {showTimestamps && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <>
                    {activity.description && (
                      <span style={{ display: 'block', marginTop: '4px' }}>
                        {activity.description}
                      </span>
                    )}
                  </>
                }
                secondaryTypographyProps={{ component: 'div' }}
              />
              {(activity.metadata || activity.link) && (
                <Box sx={{ mt: 1, pl: 7 }}>
                  {activity.metadata && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <Chip
                          key={key}
                          label={`${key}: ${value}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                  {activity.link && (
                    <Link
                      href={activity.link.href}
                      variant="body2"
                      sx={{ display: 'inline-block' }}
                    >
                      {activity.link.label} →
                    </Link>
                  )}
                </Box>
              )}
            </ListItem>
            {!isLast && <Divider variant="inset" component="li" />}
          </React.Fragment>
        );
      })}
    </List>
  );
}