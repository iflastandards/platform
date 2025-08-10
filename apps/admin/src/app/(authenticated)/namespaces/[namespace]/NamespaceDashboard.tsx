'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Link,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  useTheme,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  GitHub as GitHubIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Translate as TranslateIcon,
  Timeline as TimelineIcon,
  Build as BuildIcon,
  OpenInNew as OpenInNewIcon,
  Label as LabelIcon,
  Comment as CommentIcon,
  Dashboard as DashboardIcon,
  BarChart as MetricsIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  mockNamespaces,
  getProjectsByNamespace,
  getIssuesByProject,
} from '@/lib/mock-data';
import { mockEditorialCycles } from '@/lib/mock-data/supabase/editorial-cycles';
import { mockNightlyBuilds } from '@/lib/mock-data/supabase/nightly-builds';
import { mockImportJobs } from '@/lib/mock-data/supabase/import-jobs';
import { ActivityFeed, StatusChip } from '@/components/common';
import { TabBasedDashboardLayout, NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

interface NamespaceDashboardProps {
  namespace: string;
  userId?: string;
  isDemo?: boolean;
}


export default function NamespaceDashboard({
  namespace,
  userId: _userId = 'user-admin-1',
  isDemo: _isDemo = false,
}: NamespaceDashboardProps) {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [issueMenuAnchor, setIssueMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [_selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get namespace data
  const namespaceData = Object.values(mockNamespaces).find(
    (ns) => ns.slug === namespace,
  );
  if (!namespaceData) {
    return <Typography>Namespace not found</Typography>;
  }

  // Get related data
  const projects = getProjectsByNamespace(namespace);
  const allIssues = projects.flatMap((project) =>
    getIssuesByProject(project.id).map((issue) => ({
      ...issue,
      projectName: project.name,
      projectId: project.id,
    })),
  );

  // Get latest cycle and build
  const latestCycle = mockEditorialCycles
    .filter((cycle) => cycle.namespace_id === `ns-${namespace}`)
    .sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    )[0];

  const latestBuild = mockNightlyBuilds
    .filter((build) => build.namespace_id === `ns-${namespace}`)
    .sort(
      (a, b) => new Date(b.run_date).getTime() - new Date(a.run_date).getTime(),
    )[0];

  // Get active imports
  const activeImports = mockImportJobs.filter(
    (job) =>
      job.namespace_id === namespace &&
      (job.status === 'pending' || job.status === 'processing'),
  );

  // Convert data for ActivityFeed
  const recentActivity = allIssues
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 10)
    .map((issue) => ({
      id: `issue-${issue.number}`,
      type: issue.labels.includes('import-request')
        ? ('import' as const)
        : issue.labels.includes('validation')
          ? ('validation' as const)
          : issue.labels.includes('translation')
            ? ('translation' as const)
            : ('edit' as const),
      title: issue.title,
      description: `${issue.projectName} • ${issue.state}`,
      user: issue.assignee
        ? {
            id: issue.assignee,
            name: issue.assignee,
            avatar: `https://i.pravatar.cc/150?u=${issue.assignee}`,
          }
        : undefined,
      timestamp: issue.updated_at,
      metadata: {
        issue: `#${issue.number}`,
        repository: issue.repository_url.split('/').pop() || 'unknown',
      },
      link: {
        href: issue.html_url,
        label: 'View on GitHub',
      },
    }));

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleIssueMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    issueId: string,
  ) => {
    setIssueMenuAnchor(event.currentTarget);
    setSelectedIssue(issueId);
  };

  const handleIssueMenuClose = () => {
    setIssueMenuAnchor(null);
    setSelectedIssue(null);
  };

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: DashboardIcon },
    { id: 'issues', label: 'GitHub Issues', icon: GitHubIcon, badge: allIssues.filter(i => i.state === 'open').length },
    { id: 'activity', label: 'Recent Activity', icon: TimelineIcon },
    { id: 'projects', label: 'Projects', icon: AssignmentIcon, badge: projects.length },
    { id: 'metrics', label: 'Metrics', icon: MetricsIcon },
  ];

  const renderIssueCard = (issue: any) => {
    // TODO: Define proper issue type
    const labelColors: Record<string, string> = {
      'import-request': theme.palette.primary.main,
      validation: theme.palette.success.main,
      translation: theme.palette.info.main,
      bug: theme.palette.error.main,
      enhancement: theme.palette.secondary.main,
    };

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                <Link
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener"
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {issue.title}
                </Link>
              </Typography>
              <Box
                sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}
              >
                <Chip
                  label={`#${issue.number}`}
                  size="small"
                  variant="outlined"
                />
                <StatusChip
                  status={issue.state === 'open' ? 'active' : 'completed'}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  in {issue.projectName}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => handleIssueMenuOpen(e, issue.id)}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {issue.labels.map((label: string) => (
              <Chip
                key={label}
                label={label}
                size="small"
                icon={<LabelIcon />}
                sx={{
                  bgcolor: labelColors[label]
                    ? `${labelColors[label]}20`
                    : undefined,
                  color: labelColors[label] || undefined,
                  borderColor: labelColors[label] || undefined,
                }}
                variant="outlined"
              />
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {issue.author && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={`https://i.pravatar.cc/150?u=${issue.author}`}
                    sx={{ width: 24, height: 24 }}
                  >
                    {typeof issue.author === 'string' ? issue.author.charAt(0) : 'U'}
                  </Avatar>
                  <Typography variant="caption">{issue.author}</Typography>
                </Box>
              )}
              {issue.assignee && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    →
                  </Typography>
                  <Avatar
                    src={`https://i.pravatar.cc/150?u=${issue.assignee}`}
                    sx={{ width: 24, height: 24 }}
                  >
                    {typeof issue.assignee === 'string' ? issue.assignee.charAt(0) : 'U'}
                  </Avatar>
                  <Typography variant="caption">{issue.assignee}</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {issue.comments}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(issue.updated_at), 'MMM d, yyyy')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    {namespaceData.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {namespaceData.description}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton onClick={handleRefresh} disabled={refreshing} aria-label="Refresh data">
                    <RefreshIcon />
                  </IconButton>
                  <Button
                    variant="outlined"
                    startIcon={<GitHubIcon />}
                    href={`https://github.com/iflastandards/${namespace}`}
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                    aria-label={`View ${namespace} on GitHub`}
                  >
                    View on GitHub
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => {
                      /* Navigate to import */
                    }}
                    aria-label="Start new import process"
                  >
                    New Import
                  </Button>
                </Box>
              </Box>

              {refreshing && <LinearProgress sx={{ mb: 2 }} />}

              {/* Status Bar */}
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box role="region" aria-labelledby="editorial-cycle-label">
                      <Typography id="editorial-cycle-label" variant="body2" color="text.secondary" gutterBottom>
                        Editorial Cycle
                      </Typography>
                      {latestCycle ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimelineIcon color="primary" aria-hidden="true" />
                          <Box>
                            <Typography variant="h6">
                              {latestCycle.phase.charAt(0).toUpperCase() +
                                latestCycle.phase.slice(1)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Started{' '}
                              {format(
                                new Date(latestCycle.started_at),
                                'MMM d, yyyy',
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Skeleton variant="text" width={150} height={40} />
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box role="region" aria-labelledby="latest-build-label">
                      <Typography id="latest-build-label" variant="body2" color="text.secondary" gutterBottom>
                        Latest Build
                      </Typography>
                      {latestBuild ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {latestBuild.status === 'success' ? (
                            <CheckCircleIcon color="success" aria-label="Build successful" />
                          ) : latestBuild.status === 'failure' ? (
                            <ErrorIcon color="error" aria-label="Build failed" />
                          ) : (
                            <ScheduleIcon color="warning" aria-label="Build pending" />
                          )}
                          <Box>
                            <Typography variant="h6">
                              v{latestBuild.suggested_version}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(
                                new Date(latestBuild.run_date),
                                'MMM d, h:mm a',
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Skeleton variant="text" width={150} height={40} />
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box role="region" aria-labelledby="open-issues-label">
                      <Typography id="open-issues-label" variant="body2" color="text.secondary" gutterBottom>
                        Open Issues
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon color="primary" aria-hidden="true" />
                        <Box>
                          <Typography variant="h6" aria-label={`${allIssues.filter((i) => i.state === 'open').length} open issues`}>
                            {allIssues.filter((i) => i.state === 'open').length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {
                              allIssues.filter((i) =>
                                i.labels.includes('import-request'),
                              ).length
                            }{' '}
                            imports pending
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box role="region" aria-labelledby="active-imports-label">
                      <Typography id="active-imports-label" variant="body2" color="text.secondary" gutterBottom>
                        Active Imports
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge badgeContent={activeImports.length} color="primary">
                          <CloudUploadIcon color="primary" aria-hidden="true" />
                        </Badge>
                        <Box>
                          <Typography variant="h6" aria-label={`${activeImports.length} imports running`}>
                            {activeImports.length} running
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {
                              activeImports.filter((i) => i.status === 'processing')
                                .length
                            }{' '}
                            processing
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </>
        );

      case 'issues':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              GitHub Issues
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6">
                All Issues ({allIssues.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="Open"
                  size="small"
                  color="primary"
                  onClick={() => {}}
                />
                <Chip
                  label="Import Requests"
                  size="small"
                  variant="outlined"
                  onClick={() => {}}
                />
                <Chip
                  label="Validation"
                  size="small"
                  variant="outlined"
                  onClick={() => {}}
                />
              </Box>
            </Box>
            {allIssues.map((issue) => (
              <React.Fragment key={`issue-${issue.number}`}>
                {renderIssueCard(issue)}
              </React.Fragment>
            ))}
          </Box>
        );

      case 'activity':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Recent Activity
            </Typography>
            <ActivityFeed activities={recentActivity} maxItems={20} />
          </Box>
        );

      case 'projects':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Projects
            </Typography>
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid key={project.id} size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {project.body}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <StatusChip status={project.state} />
                        <Button
                          size="small"
                          href={`https://github.com/iflastandards/${namespace}/projects/${project.number}`}
                          target="_blank"
                          endIcon={<OpenInNewIcon />}
                          aria-label={`View ${project.name} project on GitHub`}
                        >
                          View Project
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'metrics':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Metrics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Metrics dashboard coming soon...
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <TabBasedDashboardLayout
        title={namespaceData.name}
        subtitle={namespaceData.description}
        navigationItems={navigationItems}
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
      >
        {renderContent()}
      </TabBasedDashboardLayout>

      {/* Issue Action Menu */}
      <Menu
        anchorEl={issueMenuAnchor}
        open={Boolean(issueMenuAnchor)}
        onClose={handleIssueMenuClose}
      >
        <MenuItem onClick={handleIssueMenuClose}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Issue
        </MenuItem>
        <MenuItem onClick={handleIssueMenuClose}>
          <TranslateIcon sx={{ mr: 1 }} fontSize="small" />
          Request Translation
        </MenuItem>
        <MenuItem onClick={handleIssueMenuClose}>
          <BuildIcon sx={{ mr: 1 }} fontSize="small" />
          Trigger Build
        </MenuItem>
      </Menu>
    </>
  );
}
