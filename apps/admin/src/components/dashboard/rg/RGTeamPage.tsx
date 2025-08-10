'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

export function RGTeamPage() {
  const teamMembers = [
    { 
      id: 1, 
      name: 'Maria Editor', 
      email: 'maria@example.com', 
      role: 'lead', 
      projects: ['ISBD Translation', 'ISBD/M Update'],
      avatar: 'ME'
    },
    { 
      id: 2, 
      name: 'John Smith', 
      email: 'john@example.com', 
      role: 'editor', 
      projects: ['ISBD/M Update'],
      avatar: 'JS'
    },
    { 
      id: 3, 
      name: 'Sarah Wilson', 
      email: 'sarah@example.com', 
      role: 'reviewer', 
      projects: ['ISBD Translation', 'ISBD Review Cycle'],
      avatar: 'SW'
    },
    { 
      id: 4, 
      name: 'Jean Translator', 
      email: 'jean@example.com', 
      role: 'translator', 
      projects: ['ISBD Translation'],
      avatar: 'JT'
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead': return 'primary';
      case 'editor': return 'secondary';
      case 'reviewer': return 'info';
      case 'translator': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Team Members
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          component={Link}
          href="/dashboard/rg/team/invite"
        >
          Invite Team Member
        </Button>
      </Box>

      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ISBD Review Group Team
          </Typography>
          <List>
            {teamMembers.map((member, index) => (
              <React.Fragment key={member.id}>
                <ListItem 
                  sx={{ 
                    borderBottom: index < teamMembers.length - 1 ? 1 : 0, 
                    borderColor: 'divider',
                    py: 2
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {member.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1" fontWeight="medium">
                          {member.name}
                        </Typography>
                        <Chip 
                          label={member.role} 
                          size="small" 
                          color={getRoleColor(member.role) as any}
                        />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Projects: {member.projects.join(', ')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}