'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import {
  AddTask as AddTaskIcon,
} from '@mui/icons-material';

export function RGProjectsPage() {
  const projects = [
    { 
      id: 1, 
      name: 'ISBD Translation - French', 
      status: 'active', 
      deadline: '2024-06-30',
      progress: 75,
      team: ['Maria Editor', 'Jean Translator', 'Pierre Reviewer']
    },
    { 
      id: 2, 
      name: 'ISBD/M Vocabulary Update', 
      status: 'active', 
      deadline: '2024-05-15',
      progress: 45,
      team: ['Sarah Wilson', 'John Smith']
    },
    { 
      id: 3, 
      name: 'ISBD Review Cycle 2024', 
      status: 'planning', 
      deadline: '2024-12-31',
      progress: 10,
      team: ['Full ISBD Team']
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddTaskIcon />}
          component={Link}
          href="/dashboard/rg/projects/new"
        >
          Start New Project
        </Button>
      </Box>

      <Stack spacing={3}>
        {projects.map((project) => (
          <Card key={project.id} elevation={0}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={project.status} 
                      size="small" 
                      color={project.status === 'active' ? 'success' : 'warning'}
                    />
                    <Chip 
                      label={`Deadline: ${project.deadline}`} 
                      size="small" 
                      variant="outlined"
                    />
                  </Stack>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  component={Link}
                  href={`/dashboard/rg/projects/${project.id}`}
                >
                  View Details
                </Button>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress: {project.progress}%
                </Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 8, 
                    bgcolor: 'grey.200', 
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: `${project.progress}%`, 
                      height: '100%', 
                      bgcolor: 'primary.main',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Team: {project.team.join(', ')}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}