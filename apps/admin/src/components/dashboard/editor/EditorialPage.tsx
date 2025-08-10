'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  RateReview as ReviewIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export function EditorialPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Editorial Tools
      </Typography>
      <List>
        <ListItem
          component={Link}
          href="/cycles"
          sx={{ 
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          <ListItemIcon>
            <TimelineIcon />
          </ListItemIcon>
          <ListItemText
            primary="Editorial Cycles"
            secondary="Manage vocabulary publication cycles"
          />
        </ListItem>
        <Divider />
        <ListItem
          component={Link}
          href="/review"
          sx={{ 
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          <ListItemIcon>
            <ReviewIcon />
          </ListItemIcon>
          <ListItemText
            primary="Review Queue"
            secondary="Pending reviews and approvals"
          />
        </ListItem>
        <Divider />
        <ListItem
          component={Link}
          href="/translation"
          sx={{ 
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          <ListItemIcon>
            <TranslateIcon />
          </ListItemIcon>
          <ListItemText
            primary="Translation Management"
            secondary="Coordinate multilingual content"
          />
        </ListItem>
      </List>
    </Box>
  );
}