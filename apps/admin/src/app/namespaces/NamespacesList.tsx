'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  AvatarGroup,
  Link,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search as SearchIcon,
  GitHub as GitHubIcon,
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { mockNamespaces, mockUsers, getProjectsByNamespace, getIssuesByProject } from '@/lib/mock-data';
import { mockEditorialCycles } from '@/lib/mock-data/supabase/editorial-cycles';
import { mockNightlyBuilds } from '@/lib/mock-data/supabase/nightly-builds';

interface NamespacesListProps {
  userId?: string;
  isDemo?: boolean;
}

export default function NamespacesList({ 
  userId = 'user-admin-1',
  isDemo: _isDemo = false 
}: NamespacesListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);

  // Get current user
  const currentUser = mockUsers.find(u => u.id === userId) || mockUsers[0];
  const userNamespaces = currentUser.privateMetadata.projectMemberships
    .flatMap(pm => pm.namespaces)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Filter namespaces based on user access
  const accessibleNamespaces = Object.values(mockNamespaces).filter(ns => 
    currentUser.publicMetadata.iflaRole === 'admin' || 
    userNamespaces.includes(ns.slug)
  );

  // Filter by search
  const filteredNamespaces = accessibleNamespaces.filter(ns =>
    ns.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ns.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ns.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, namespaceId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedNamespace(namespaceId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedNamespace(null);
  };

  const navigateToNamespace = (namespaceId: string) => {
    router.push(`/namespaces/${namespaceId}?demo=true`);
  };

  const renderNamespaceCard = (namespace: typeof mockNamespaces[0]) => {
    // Get related data
    const projects = getProjectsByNamespace(namespace.slug);
    const openIssues = projects.flatMap(p => 
      getIssuesByProject(p.id).filter(i => i.state === 'open')
    );
    
    const latestCycle = mockEditorialCycles
      .filter(cycle => cycle.namespace_id === `ns-${namespace.slug}`)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
    
    const latestBuild = mockNightlyBuilds
      .filter(build => build.namespace_id === `ns-${namespace.slug}`)
      .sort((a, b) => new Date(b.run_date).getTime() - new Date(a.run_date).getTime())[0];

    // Get team members
    const teamMembers = mockUsers.filter(user => 
      user.privateMetadata.projectMemberships.some(pm => 
        pm.namespaces.includes(namespace.slug)
      )
    );

    return (
      <Grid key={namespace.slug} size={{ xs: 12, md: 6, lg: 4 }}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography 
                  variant="h6" 
                  component={Link}
                  href={`/namespaces/${namespace.slug}?demo=true`}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    navigateToNamespace(namespace.slug);
                  }}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {namespace.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {namespace.slug}
                </Typography>
              </Box>
              <IconButton 
                size="small"
                onClick={(e) => handleMenuOpen(e, namespace.slug)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              {namespace.description}
            </Typography>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AssignmentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption">
                  {openIssues.length} open issues
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GitHubIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption">
                  {projects.length} projects
                </Typography>
              </Box>
            </Box>

            {/* Status Chips */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {latestCycle && (
                <Chip
                  icon={<TimelineIcon />}
                  label={`Cycle: ${latestCycle.phase}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {latestBuild && (
                <Chip
                  icon={latestBuild.status === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
                  label={`Build: ${latestBuild.status}`}
                  size="small"
                  color={latestBuild.status === 'success' ? 'success' : 'warning'}
                  variant="outlined"
                />
              )}
            </Box>

            {/* Team Members */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
                {teamMembers.map(member => (
                  <Avatar 
                    key={member.id}
                    alt={member.name}
                    src={member.imageUrl}
                  >
                    {member.name.charAt(0)}
                  </Avatar>
                ))}
              </AvatarGroup>
              {teamMembers.length > 4 && (
                <Typography variant="caption" color="text.secondary">
                  +{teamMembers.length - 4} more
                </Typography>
              )}
            </Box>
          </CardContent>

          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button 
              size="small" 
              onClick={() => navigateToNamespace(namespace.slug)}
            >
              View Dashboard
            </Button>
            <Button 
              size="small" 
              href={`https://github.com/iflastandards/${namespace.slug}`}
              target="_blank"
              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            >
              GitHub
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Namespaces
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage vocabulary namespaces and their GitHub projects
        </Typography>
      </Box>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search namespaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {currentUser.publicMetadata.iflaRole === 'admin' && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            New Namespace
          </Button>
        )}
      </Box>

      {/* Namespace Grid */}
      <Grid container spacing={3}>
        {filteredNamespaces.map(namespace => renderNamespaceCard(namespace))}
      </Grid>

      {/* Empty State */}
      {filteredNamespaces.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No namespaces found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Try adjusting your search terms' : 'You don\'t have access to any namespaces'}
          </Typography>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          if (selectedNamespace) {
            router.push(`/import?namespace=${selectedNamespace}&demo=true`);
          }
        }}>
          <CloudUploadIcon sx={{ mr: 1 }} fontSize="small" />
          New Import
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          // Navigate to settings
        }}>
          Settings
        </MenuItem>
      </Menu>
    </Box>
  );
}