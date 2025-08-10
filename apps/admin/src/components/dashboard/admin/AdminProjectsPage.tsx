'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import {
  AddTask as AddTaskIcon,
} from '@mui/icons-material';

export function AdminProjectsPage() {
  const projects = [
    { id: 1, name: 'MulDiCat French Translation', status: 'active', team: 'ISBD RG', progress: 75 },
    { id: 2, name: 'LRM 2.0 Development', status: 'active', team: 'LRM RG', progress: 45 },
    { id: 3, name: 'ISBD Maintenance WG 2024-2026', status: 'planning', team: 'ISBD RG', progress: 10 },
    { id: 4, name: 'UNIMARC Update 2024', status: 'active', team: 'UNIMARC RG', progress: 60 },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Project Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddTaskIcon />}
          component={Link}
          href="/dashboard/admin/projects/new"
        >
          Charter New Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>
                <Stack direction="row" spacing={1} mb={2}>
                  <Chip 
                    label={project.status} 
                    size="small" 
                    color={project.status === 'active' ? 'success' : 'warning'}
                  />
                  <Chip label={project.team} size="small" variant="outlined" />
                </Stack>
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
                <Button 
                  variant="outlined" 
                  size="small" 
                  fullWidth
                  component={Link}
                  href={`/dashboard/admin/projects/${project.id}`}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}