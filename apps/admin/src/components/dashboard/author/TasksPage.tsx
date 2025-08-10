'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  RateReview as ReviewIcon,
  Translate as TranslateIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

export function AuthorTasksPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Active Tasks
      </Typography>
      <List>
        <ListItem divider>
          <ListItemIcon>
            <ReviewIcon />
          </ListItemIcon>
          <ListItemText
            primary="Pending Reviews"
            secondary="3 items waiting for review"
          />
          <Chip label="3" color="warning" size="small" />
        </ListItem>
        <ListItem divider>
          <ListItemIcon>
            <TranslateIcon />
          </ListItemIcon>
          <ListItemText
            primary="Translation Tasks"
            secondary="2 items need translation"
          />
          <Chip label="2" color="info" size="small" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CommentIcon />
          </ListItemIcon>
          <ListItemText
            primary="Comments to Address"
            secondary="1 comment needs response"
          />
          <Chip label="1" color="error" size="small" />
        </ListItem>
      </List>
    </Box>
  );
}