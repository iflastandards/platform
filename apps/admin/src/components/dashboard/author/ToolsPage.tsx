'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Language as LanguageIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export function AuthorToolsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Tools & Resources
      </Typography>
      <List>
        <ListItem
          component={Link}
          href="/review"
          sx={{ 
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { backgroundColor: 'action.hover' },
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            mb: 1
          }}
        >
          <ListItemIcon>
            <ApproveIcon />
          </ListItemIcon>
          <ListItemText
            primary="Review Interface"
            secondary="Approve, reject, and comment on content"
          />
        </ListItem>
        <ListItem
          component={Link}
          href="/translation"
          sx={{ 
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { backgroundColor: 'action.hover' },
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            mb: 1
          }}
        >
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          <ListItemText
            primary="Translation Tools"
            secondary="Manage multilingual content"
          />
        </ListItem>
        <ListItem
          component={Link}
          href="/cycles"
          sx={{ 
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { backgroundColor: 'action.hover' },
            border: 1,
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <ListItemIcon>
            <TimelineIcon />
          </ListItemIcon>
          <ListItemText
            primary="Editorial Timeline"
            secondary="Track progress and deadlines"
          />
        </ListItem>
      </List>
    </Box>
  );
}