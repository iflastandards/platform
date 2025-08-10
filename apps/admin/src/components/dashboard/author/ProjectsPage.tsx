'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Assignment as ProjectIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { AppUser } from '@/lib/clerk-github-auth';

interface AuthorProjectsPageProps {
  user: AppUser;
}

export function AuthorProjectsPage({ user }: AuthorProjectsPageProps) {
  const userProjects = Object.values(user.projects);
  const authorProjects = userProjects.filter(p => p.role === 'reviewer' || p.role === 'translator');

  // Get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'reviewer': return 'Reviewer';
      case 'translator': return 'Translator';
      default: return role;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'reviewer': return 'secondary';
      case 'translator': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Projects
      </Typography>
      <List>
        {authorProjects.map((project) => (
          <ListItem key={project.number} divider>
            <ListItemIcon>
              <ProjectIcon />
            </ListItemIcon>
            <ListItemText
              primary={project.title}
              secondary={
                <span style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <Chip
                    label={getRoleDisplay(project.role)}
                    size="small"
                    color={getRoleColor(project.role) as 'secondary' | 'info' | 'default'}
                  />
                  <Typography variant="caption" color="text.secondary" component="span">
                    {project.namespaces.length} namespaces
                  </Typography>
                </span>
              }
            />
            <IconButton
              component={Link}
              href={`/projects/${project.number}`}
              size="small"
              aria-label={`View ${project.title} project`}
            >
              <EditIcon />
            </IconButton>
          </ListItem>
        ))}
        {authorProjects.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No projects assigned"
              secondary="You don't have any projects with reviewer or translator roles"
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
}