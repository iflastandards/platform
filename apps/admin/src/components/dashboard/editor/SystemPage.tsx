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
  Divider,
} from '@mui/material';
import {
  Build as BuildIcon,
  GitHub as GitHubIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';

export function SystemPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        System Status
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText
            primary="Build Pipeline"
            secondary="Last build: 2 hours ago"
          />
          <Chip label="Healthy" color="success" size="small" />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <GitHubIcon />
          </ListItemIcon>
          <ListItemText
            primary="GitHub Integration"
            secondary="API status and sync"
          />
          <Chip label="Connected" color="success" size="small" />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <ImportIcon />
          </ListItemIcon>
          <ListItemText
            primary="Import Status"
            secondary="Active imports: 0"
          />
          <Chip label="Idle" color="default" size="small" />
        </ListItem>
      </List>
    </Box>
  );
}