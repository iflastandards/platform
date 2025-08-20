'use client';


import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Link as MuiLink,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  PersonAdd as PersonAddIcon,
  AddTask as AddTaskIcon,
} from '@mui/icons-material';
import { mockReviewGroups, getNamespacesByReviewGroup, mockNamespaces } from '@/lib/mock-data/namespaces-extended';
import { reviewGroups as allReviewGroups } from '@/lib/mock-data/review-groups';

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

function StatsCard({ title, value, change, changeType }: StatsCardProps) {
  const theme = useTheme();
  const changeColor = 
    changeType === 'increase' ? theme.palette.success.main : 
    changeType === 'decrease' ? theme.palette.error.main : 
    theme.palette.text.secondary;
  
  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold" color="primary.main">
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ color: changeColor, mt: 1 }}>
          {change}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  action: string;
  author: string;
  time: string;
  type: 'project' | 'user' | 'namespace' | 'vocabulary' | 'profile';
}

function ActivityItem({ action, author, time, type }: ActivityItemProps) {
  const typeIcons = {
    project: '📁',
    user: '👤',
    namespace: '📦',
    vocabulary: '📚',
    profile: '📋',
  };
  
  return (
    <Box py={2} borderBottom={1} borderColor="divider">
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography fontSize={24}>{typeIcons[type]}</Typography>
        <Box flex={1}>
          <Typography variant="body1" fontWeight="medium">
            {action}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            By {author} • {time}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

interface NamespaceCardProps {
  slug: string;
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'archived';
  currentVersion: string;
  color: string;
  statistics: {
    elements: number;
    concepts: number;
    translations: number;
    contributors: number;
  };
}

function NamespaceCard({ slug, name, description, status, currentVersion, color, statistics }: NamespaceCardProps) {
  const statusConfig = {
    active: { color: 'success', label: 'Active' },
    maintenance: { color: 'warning', label: 'Maintenance' },
    archived: { color: 'error', label: 'Archived' },
  } as const;
  
  const config = statusConfig[status];
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        border: 1, 
        borderColor: 'divider', 
        height: '100%',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1,
        }
      }}
      component={Link}
      href={`/dashboard/${slug}`}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" fontWeight="bold" sx={{ color }}>
            {name}
          </Typography>
          <Chip 
            label={config.label} 
            color={config.color} 
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Version {currentVersion}
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Box textAlign="center">
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {statistics.elements + statistics.concepts}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Items
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {statistics.translations}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Languages
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {statistics.contributors}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Contributors
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface RGOverviewPageProps {
  reviewGroups?: string[];
}

export function RGOverviewPage({ reviewGroups = ['isbd'] }: RGOverviewPageProps) {
  // Get user's review group info from both sources
  const userReviewGroups = reviewGroups.map(rgId => {
    // Try to find in new review groups data first
    const newRG = allReviewGroups.find(rg => rg.id === rgId || rg.acronym === rgId.toUpperCase());
    if (newRG) {
      return {
        id: newRG.id,
        name: newRG.fullName,
        description: newRG.description,
        namespaces: newRG.namespaces,
        chair: newRG.chair,
        secretary: newRG.secretary,
        meetingSchedule: newRG.meetingSchedule,
        color: newRG.color,
        memberCount: newRG.memberCount,
      };
    }
    // Fallback to old mock data
    return mockReviewGroups[rgId];
  }).filter(Boolean);
  
  const userNamespaceIds = userReviewGroups.flatMap(rg => rg.namespaces || getNamespacesByReviewGroup(rg.id));
  const userNamespaces = userNamespaceIds.map(nsId => mockNamespaces[nsId]).filter(Boolean);
  
  const stats = [
    { title: 'My Namespaces', value: userNamespaces.length, change: 'Under your management', changeType: 'neutral' as const },
    { title: 'Active Projects', value: 4, change: '+1 this month', changeType: 'increase' as const },
    { title: 'Team Members', value: 12, change: '+2 this quarter', changeType: 'increase' as const },
  ];

  const recentActivity = [
    { action: 'ISBD translation milestone completed by your team', author: 'Maria Editor', time: '2 hours ago', type: 'project' as const },
    { action: 'New team member joined ISBD Review Group', author: 'John Smith', time: '1 day ago', type: 'user' as const },
    { action: 'ISBD/M vocabulary updated', author: 'Sarah Wilson', time: '2 days ago', type: 'vocabulary' as const },
    { action: 'Review group meeting notes published', author: 'You', time: '3 days ago', type: 'project' as const },
  ];

  const currentRG = userReviewGroups[0]; // Get the first (and usually only) review group

  return (
    <>
      {/* Review Group Header */}
      {currentRG && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 8,
                height: 40,
                backgroundColor: currentRG.color,
                borderRadius: 1,
                mr: 2,
              }}
            />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {currentRG.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {currentRG.description}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
            {currentRG.chair && (
              <Typography variant="body2" color="text.secondary">
                <strong>Chair:</strong> {currentRG.chair}
              </Typography>
            )}
            {currentRG.secretary && (
              <Typography variant="body2" color="text.secondary">
                <strong>Secretary:</strong> {currentRG.secretary}
              </Typography>
            )}
            {'memberCount' in currentRG && currentRG.memberCount && (
              <Typography variant="body2" color="text.secondary">
                <strong>Members:</strong> {currentRG.memberCount}
              </Typography>
            )}
            {currentRG.meetingSchedule && (
              <Typography variant="body2" color="text.secondary">
                <strong>Meetings:</strong> {currentRG.meetingSchedule}
              </Typography>
            )}
          </Stack>
        </Box>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.title}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }} key="namespaces-section">
          <Card elevation={0}>
            {/* My Namespaces */}
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom component="h2">
                My Namespaces
              </Typography>
              <Grid container spacing={2}>
                {userNamespaces.map((namespace) => (
                  <Grid size={{ xs: 12, md: 6 }} key={namespace.id}>
                    <NamespaceCard {...namespace} />
                  </Grid>
                ))}
              </Grid>
              <Box mt={3} pt={2} borderTop={1} borderColor="divider">
                <MuiLink
                  component={Link}
                  href="/dashboard/rg/namespaces"
                  color="primary"
                  underline="hover"
                  fontSize="small"
                >
                  Manage all namespaces →
                </MuiLink>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} key="activity-section">
          <Stack spacing={3}>
            {/* Recent Activity & Quick Actions */}
            {/* Recent Activity */}
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom component="h2">
                  Recent Activity
                </Typography>
                <Box role="feed" aria-label="Recent review group activity">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem key={`activity-${index}-${activity.author}-${activity.time}`} {...activity} />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom component="h2">
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddTaskIcon />}
                    component={Link}
                    href="/dashboard/rg/projects/new"
                    aria-label="Start a new project"
                  >
                    Start New Project
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PersonAddIcon />}
                    component={Link}
                    href="/dashboard/rg/team/invite"
                    aria-label="Invite a team member"
                  >
                    Invite Team Member
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}