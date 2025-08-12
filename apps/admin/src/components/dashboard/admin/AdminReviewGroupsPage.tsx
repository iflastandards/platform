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
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { reviewGroups } from '@/lib/mock-data/review-groups';

export function AdminReviewGroupsPage() {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Review Groups Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<GroupIcon />}
          component={Link}
          href="/dashboard/admin/review-groups/new"
        >
          Create Review Group
        </Button>
      </Box>

      <Grid container spacing={3}>
        {reviewGroups.map((group) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={group.id}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              {/* Color accent bar at top */}
              <Box
                sx={{
                  height: 4,
                  backgroundColor: group.color,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />
              
              <CardContent sx={{ pt: 3, pb: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header with acronym badge */}
                <Box display="flex" alignItems="flex-start" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: group.color,
                      width: 48,
                      height: 48,
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {group.acronym}
                  </Avatar>
                  <Box ml={2} flex={1}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {group.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {group.description}
                    </Typography>
                  </Box>
                </Box>

                {/* Status and member count */}
                <Stack direction="row" spacing={1} mb={2} alignItems="center">
                  <Chip 
                    label={group.status} 
                    size="small" 
                    color={group.status === 'active' ? 'success' : 'warning'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Chip 
                    icon={<PersonIcon sx={{ fontSize: 16 }} />}
                    label={`${group.memberCount} members`}
                    size="small" 
                    variant="outlined"
                  />
                </Stack>

                {/* Managed namespaces */}
                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    MANAGED NAMESPACES
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {group.namespaces.map((namespace) => (
                      <Chip
                        key={namespace}
                        label={namespace.toUpperCase()}
                        size="small"
                        component={Link}
                        href={`/dashboard/${namespace}`}
                        clickable
                        sx={{
                          backgroundColor: `${group.color}15`,
                          color: group.color,
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          '&:hover': {
                            backgroundColor: `${group.color}25`,
                            textDecoration: 'none',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Leadership info */}
                <Box mb={2} sx={{ flexGrow: 1 }}>
                  {group.chair && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Chair:</strong> {group.chair}
                    </Typography>
                  )}
                  {group.secretary && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Secretary:</strong> {group.secretary}
                    </Typography>
                  )}
                  {group.meetingSchedule && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {group.meetingSchedule}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Action buttons */}
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                    component={Link}
                    href={`/dashboard/rg/${group.acronym}`}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Manage Group
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Summary statistics */}
      <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }} key="total-groups">
            <Typography variant="h6" color="primary">
              {reviewGroups.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Groups
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }} key="active-groups">
            <Typography variant="h6" color="success.main">
              {reviewGroups.filter(g => g.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Groups
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }} key="total-members">
            <Typography variant="h6" color="info.main">
              {reviewGroups.reduce((sum, g) => sum + g.memberCount, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Members
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }} key="managed-namespaces">
            <Typography variant="h6" color="secondary.main">
              {new Set(reviewGroups.flatMap(g => g.namespaces)).size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Managed Namespaces
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}