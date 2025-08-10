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

interface SharedProjectsPageProps {
  user: AppUser;
  role: 'author' | 'editor';
}

export function SharedProjectsPage({ user, role }: SharedProjectsPageProps) {
  const userProjects = Object.values(user.projects);
  
  // Filter projects based on role
  const filteredProjects = role === 'author' 
    ? userProjects.filter(p => p.role === 'reviewer' || p.role === 'translator')
    : userProjects.filter(p => p.role === 'lead' || p.role === 'editor');

  // Get role display
  const getRoleDisplay = (projectRole: string) => {
    const roleMap: Record<string, string> = {
      'reviewer': 'Reviewer',
      'translator': 'Translator',
      'lead': 'Project Lead',
      'editor': 'Editor',
    };
    return roleMap[projectRole] || projectRole;
  };

  // Get role color for authors only (editors use primary)
  const getRoleColor = (projectRole: string) => {
    if (role === 'editor') return 'primary';
    
    switch (projectRole) {
      case 'reviewer': return 'secondary';
      case 'translator': return 'info';
      default: return 'default';
    }
  };

  const getEmptyMessage = () => {
    if (role === 'author') {
      return {
        primary: 'No projects assigned',
        secondary: "You don't have any projects with reviewer or translator roles"
      };
    } else {
      return {
        primary: 'No projects assigned',
        secondary: "You don't have any projects with editor or lead roles"
      };
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Projects
      </Typography>
      <List>
        {filteredProjects.map((project) => (
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
                    color={getRoleColor(project.role) as any}
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
              aria-label={role === 'author' ? `View ${project.title} project` : `Edit ${project.title}`}
            >
              <EditIcon />
            </IconButton>
          </ListItem>
        ))}
        {filteredProjects.length === 0 && (
          <ListItem>
            <ListItemText
              primary={getEmptyMessage().primary}
              secondary={getEmptyMessage().secondary}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
}