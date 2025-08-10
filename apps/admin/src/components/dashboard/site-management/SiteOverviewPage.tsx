'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  AlertTitle,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useSiteInfo, useSiteActivity, useSiteStats } from '@/lib/hooks/useSiteManagement';

interface SiteOverviewPageProps {
  siteKey: string;
}

export function SiteOverviewPage({ siteKey }: SiteOverviewPageProps) {
  const { data: siteInfo, isLoading: siteInfoLoading } = useSiteInfo(siteKey);
  const { data: siteActivity, isLoading: activityLoading } = useSiteActivity(siteKey);
  const { data: siteStats, isLoading: statsLoading } = useSiteStats(siteKey);

  if (siteInfoLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!siteInfo) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Unable to load site information for {siteKey}
      </Alert>
    );
  }

  const { title: siteTitle, code: siteCode, isSpecialCase } = siteInfo;

  return (
    <Box>
      {isSpecialCase && (
        <Alert severity="warning" sx={{ mb: 3 }} role="alert">
          <AlertTitle>Special Management Area</AlertTitle>
          <Typography variant="body2">
            {siteKey === 'portal' ? (
              <>
                The Portal is not a standard namespace. It serves as the main IFLA standards platform 
                and requires superadmin permissions for all management operations.
              </>
            ) : (
              <>
                This is a development/testing environment, not a standard namespace. 
                It requires superadmin permissions and should be used with caution.
              </>
            )}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            role="region"
            aria-labelledby={`${siteKey}-status-title`}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                id={`${siteKey}-status-title`}
                component="h2"
              >
                {isSpecialCase ? 'System' : 'Site'} Status
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Type"
                    secondary={isSpecialCase ? 'Special System Area' : 'Standard Site'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Last Updated"
                    secondary={siteInfo.lastUpdated}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Build Status"
                    secondary={
                      <Chip 
                        label={siteInfo.buildStatus === 'passing' ? 'Passing' : siteInfo.buildStatus === 'failing' ? 'Failing' : 'Pending'} 
                        color={siteInfo.buildStatus === 'passing' ? 'success' : siteInfo.buildStatus === 'failing' ? 'error' : 'warning'} 
                        size="small"
                        aria-label={`Build status: ${siteInfo.buildStatus}`}
                      />
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary={isSpecialCase ? 'System Issues' : 'Open PRs'}
                    secondary={<span aria-label={`${isSpecialCase ? 'System Issues' : 'Open PRs'}: ${siteInfo.openPRs}`}>{siteInfo.openPRs}</span>}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary={isSpecialCase ? 'Active Tasks' : 'Pending Reviews'}
                    secondary={<span aria-label={`${isSpecialCase ? 'Active Tasks' : 'Pending Reviews'}: ${siteInfo.pendingReviews}`}>{siteInfo.pendingReviews}</span>}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            role="region"
            aria-labelledby={`${siteKey}-activity-title`}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                id={`${siteKey}-activity-title`}
                component="h2"
              >
                Recent Activity - {siteCode}
              </Typography>
              <List dense>
                {activityLoading ? (
                  <ListItem>
                    <CircularProgress size={20} />
                  </ListItem>
                ) : siteActivity ? (
                  siteActivity.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemText 
                        primary={activity.title}
                        secondary={activity.timestamp}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="No recent activity"
                      secondary="Check back later"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            role="region"
            aria-labelledby={`${siteKey}-actions-title`}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                id={`${siteKey}-actions-title`}
                component="h2"
              >
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  disabled
                  fullWidth
                  aria-label={`${isSpecialCase ? 'System Config' : 'New Content'} (Coming Soon)`}
                  sx={{ minHeight: 44 }}
                >
                  {isSpecialCase ? 'System Config' : 'New Content'}
                </Button>
                <Button
                  variant="outlined"
                  disabled
                  fullWidth
                  aria-label={`${isSpecialCase ? 'User Management' : 'Sync Sheets'} (Coming Soon)`}
                  sx={{ minHeight: 44 }}
                >
                  {isSpecialCase ? 'User Management' : 'Sync Sheets'}
                </Button>
                <Button
                  variant="outlined"
                  disabled
                  fullWidth
                  aria-label={`${isSpecialCase ? 'Deploy' : 'View PRs'} (Coming Soon)`}
                  sx={{ minHeight: 44 }}
                >
                  {isSpecialCase ? 'Deploy' : 'View PRs'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            role="region"
            aria-labelledby={`${siteKey}-overview-title`}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                id={`${siteKey}-overview-title`}
                component="h2"
              >
                {isSpecialCase ? 'System Overview' : 'Team Overview'}
              </Typography>
              <Grid container spacing={3}>
                {statsLoading ? (
                  <Grid size={{ xs: 12 }}>
                    <Box textAlign="center">
                      <CircularProgress size={20} />
                    </Box>
                  </Grid>
                ) : siteStats && isSpecialCase && 'namespaces' in siteStats ? (
                  <>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Typography 
                          variant="h3" 
                          color="primary"
                          aria-label={`${siteStats.namespaces} namespaces`}
                        >
                          {siteStats.namespaces}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          NAMESPACES
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Typography 
                          variant="h3" 
                          color="primary"
                          aria-label={`${siteStats.totalUsers} total users`}
                        >
                          {siteStats.totalUsers}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          TOTAL USERS
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                ) : siteStats && 'teamMembers' in siteStats ? (
                  <>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Typography 
                          variant="h3" 
                          color="primary"
                          aria-label={`${siteStats.teamMembers} team members`}
                        >
                          {siteStats.teamMembers}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          TEAM MEMBERS
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Typography 
                          variant="h3" 
                          color="primary"
                          aria-label={`${siteStats.activeReviewers} active reviewers`}
                        >
                          {siteStats.activeReviewers}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ACTIVE REVIEWERS
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                ) : null}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!isSpecialCase && (
        <Alert severity="info" sx={{ mt: 3 }} role="status">
          <AlertTitle>Site Management</AlertTitle>
          <Typography variant="body2">
            This dashboard manages the <strong>{siteTitle}</strong> site. 
            Each site represents a distinct IFLA standard with its own content, team, and workflow.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
