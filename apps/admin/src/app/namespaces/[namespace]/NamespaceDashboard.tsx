'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
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
  Warning as WarningIcon,
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
} from '@mui/icons-material';
import { format } from 'date-fns';
import { 
  mockNamespaces, 
  mockGitHubProjects, 
  mockIssues,
  getProjectsByNamespace,
  getIssuesByProject,
} from '@/lib/mock-data';
import { mockEditorialCycles } from '@/lib/mock-data/supabase/editorial-cycles';
import { mockNightlyBuilds } from '@/lib/mock-data/supabase/nightly-builds';
import { mockImportJobs } from '@/lib/mock-data/supabase/import-jobs';
import { ActivityFeed, StatusChip } from '@/components/common';

interface NamespaceDashboardProps {
  namespace: string;
  userId?: string;
  isDemo?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`namespace-tabpanel-${index}`}
      aria-labelledby={`namespace-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NamespaceDashboard({ 
  namespace, 
  userId = 'user-admin-1',
  isDemo = false 
}: NamespaceDashboardProps) {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [issueMenuAnchor, setIssueMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get namespace data
  const namespaceData = Object.values(mockNamespaces).find(ns => ns.slug === namespace);
  if (!namespaceData) {
    return <Typography>Namespace not found</Typography>;
  }

  // Get related data
  const projects = getProjectsByNamespace(namespace);
  const allIssues = projects.flatMap(project => 
    getIssuesByProject(project.id).map(issue => ({
      ...issue,
      projectName: project.name,
      projectId: project.id,
    }))
  );

  // Get latest cycle and build
  const latestCycle = mockEditorialCycles
    .filter(cycle => cycle.namespace_id === `ns-${namespace}`)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
  
  const latestBuild = mockNightlyBuilds
    .filter(build => build.namespace_id === `ns-${namespace}`)
    .sort((a, b) => new Date(b.run_date).getTime() - new Date(a.run_date).getTime())[0];

  // Get active imports
  const activeImports = mockImportJobs.filter(
    job => job.namespace_id === namespace && 
    (job.status === 'pending' || job.status === 'processing')
  );

  // Convert data for ActivityFeed
  const recentActivity = allIssues
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)
    .map(issue => ({
      id: `issue-${issue.number}`,
      type: issue.labels.includes('import-request') ? 'import' as const : 
            issue.labels.includes('validation') ? 'validation' as const : 
            issue.labels.includes('translation') ? 'translation' as const : 
            'edit' as const,
      title: issue.title,
      description: `${issue.projectName} • ${issue.state}`,
      user: issue.assignee ? {
        id: issue.assignee,
        name: issue.assignee,
        avatar: `https://i.pravatar.cc/150?u=${issue.assignee}`,
      } : undefined,
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleIssueMenuOpen = (event: React.MouseEvent<HTMLElement>, issueId: string) => {
    setIssueMenuAnchor(event.currentTarget);
    setSelectedIssue(issueId);
  };

  const handleIssueMenuClose = () => {
    setIssueMenuAnchor(null);
    setSelectedIssue(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const renderIssueCard = (issue: any) => {
    const labelColors: Record<string, string> = {
      'import-request': theme.palette.primary.main,
      'validation': theme.palette.success.main,
      'translation': theme.palette.info.main,
      'bug': theme.palette.error.main,
      'enhancement': theme.palette.secondary.main,
    };

    return (
      <Card key={issue.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
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
                  bgcolor: labelColors[label] ? `${labelColors[label]}20` : undefined,
                  color: labelColors[label] || undefined,
                  borderColor: labelColors[label] || undefined,
                }}
                variant="outlined"
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {issue.author && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    src={issue.author.avatar} 
                    sx={{ width: 24, height: 24 }}
                  >
                    {issue.author.name.charAt(0)}
                  </Avatar>
                  <Typography variant="caption">
                    {issue.author.name}
                  </Typography>
                </Box>
              )}
              {issue.assignee && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    →
                  </Typography>
                  <Avatar 
                    src={issue.assignee.avatar} 
                    sx={{ width: 24, height: 24 }}
                  >
                    {issue.assignee.name.charAt(0)}
                  </Avatar>
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {namespaceData.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {namespaceData.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<GitHubIcon />}
              href={`https://github.com/iflastandards/${namespace}`}
              target="_blank"
              endIcon={<OpenInNewIcon />}
            >
              View on GitHub
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => {/* Navigate to import */}}
            >
              New Import
            </Button>
          </Box>
        </Box>

        {/* Status Bar */}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Editorial Cycle
                </Typography>
                {latestCycle ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon color="primary" />
                    <Box>
                      <Typography variant="h6">
                        {latestCycle.phase.charAt(0).toUpperCase() + latestCycle.phase.slice(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Started {format(new Date(latestCycle.started_at), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Skeleton variant="text" width={150} height={40} />
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Latest Build
                </Typography>
                {latestBuild ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {latestBuild.status === 'success' ? (
                      <CheckCircleIcon color="success" />
                    ) : latestBuild.status === 'failure' ? (
                      <ErrorIcon color="error" />
                    ) : (
                      <ScheduleIcon color="warning" />
                    )}
                    <Box>
                      <Typography variant="h6">
                        v{latestBuild.suggested_version}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(latestBuild.run_date), 'MMM d, h:mm a')}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Skeleton variant="text" width={150} height={40} />
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Open Issues
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon color="primary" />
                  <Box>
                    <Typography variant="h6">
                      {allIssues.filter(i => i.state === 'open').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {allIssues.filter(i => i.labels.includes('import-request')).length} imports pending
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Imports
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge badgeContent={activeImports.length} color="primary">
                    <CloudUploadIcon color="primary" />
                  </Badge>
                  <Box>
                    <Typography variant="h6">
                      {activeImports.length} running
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activeImports.filter(i => i.status === 'processing').length} processing
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="GitHub Issues" />
          <Tab label="Recent Activity" />
          <Tab label="Projects" />
          <Tab label="Metrics" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
          
          {allIssues.map(issue => renderIssueCard(issue))}
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <ActivityFeed 
          activities={recentActivity}
          maxItems={20}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          {projects.map(project => (
            <Grid key={project.id} size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.body}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusChip status={project.state} />
                    <Button 
                      size="small" 
                      href={`https://github.com/iflastandards/${namespace}/projects/${project.number}`}
                      target="_blank"
                      endIcon={<OpenInNewIcon />}
                    >
                      View Project
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <Typography variant="body1" color="text.secondary">
          Metrics dashboard coming soon...
        </Typography>
      </TabPanel>

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
    </Box>
  );
}