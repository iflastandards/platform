'use client';

import React, { useState } from 'react';
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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Toolbar,
  AppBar,
  Link,
} from '@mui/material';
import {
  Dashboard as LayoutDashboard,
  Description as FileText,
  Storage as Database,
  AccountTree as GitBranch,
  People as Users,
  Inventory as Package,
  Security as Shield,
  GitHub,
  Settings,
  Build as Wrench,
  Menu,
  ElectricBolt,
  Computer,
  Link as LinkIcon,
  Build,
} from '@mui/icons-material';

// Skip Links Component
const SkipLinks = () => (
  <Box
    sx={{
      position: 'absolute',
      left: '-9999px',
      top: 0,
      '&:focus-within': {
        position: 'static',
        left: 'auto',
        top: 'auto',
        zIndex: 9999,
        p: 2,
        bgcolor: 'primary.main',
      },
    }}
  >
    <Link href="#main-content" sx={{ color: 'white', mr: 2 }}>
      Skip to main content
    </Link>
    <Link href="#navigation" sx={{ color: 'white', mr: 2 }}>
      Skip to navigation
    </Link>
    <Link href="#external-resources" sx={{ color: 'white' }}>
      Skip to external resources
    </Link>
  </Box>
);

// Live Region for announcements
const LiveRegion = ({ message }: { message: string }) => (
  <Box
    role="status"
    aria-live="polite"
    aria-atomic="true"
    sx={{ 
      position: 'absolute',
      left: '-9999px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    }}
  >
    {message}
  </Box>
);

interface ManagementAction {
  id: string;
  title: string;
  description: string;
  type: 'github-cli' | 'codespaces' | 'internal' | 'external';
  disabled?: boolean;
  requiredRole?: 'superadmin' | 'namespace-admin' | 'namespace-editor';
}

interface TabData {
  id: string;
  label: string;
  actions: ManagementAction[];
  specialCaseOnly?: boolean;
}

export interface NamespaceManagementClientProps {
  namespaceTitle: string;
  namespaceCode: string;
  namespaceKey: string;
  githubRepo?: string;
  isSpecialCase?: boolean;
  isSuperAdmin?: boolean;
  namespaceDescription?: string;
}

// Tab configurations remain the same
const standardNamespaceTabs: TabData[] = [
  {
    id: 'overview',
    label: 'Overview',
    actions: [],
  },
  {
    id: 'content',
    label: 'Content Management',
    actions: [
      {
        id: 'create-page',
        title: 'Create New Page',
        description: 'Add new documentation pages for elements, terms, or concepts',
        type: 'github-cli',
      },
      {
        id: 'scaffold-elements',
        title: 'Scaffold Element Pages',
        description: 'Generate element documentation from CSV data',
        type: 'github-cli',
      },
      {
        id: 'scaffold-vocabularies',
        title: 'Scaffold Vocabulary Pages',
        description: 'Generate value vocabulary pages from CSV data',
        type: 'github-cli',
      },
      {
        id: 'update-examples',
        title: 'Manage Examples',
        description: 'Add, edit, or organize usage examples',
        type: 'codespaces',
      },
      {
        id: 'organize-sidebar',
        title: 'Organize Navigation',
        description: 'Reorder sidebar structure and categorization',
        type: 'codespaces',
      },
    ],
  },
  {
    id: 'rdf',
    label: 'RDF & Vocabularies',
    actions: [
      {
        id: 'csv-to-rdf',
        title: 'CSV → RDF',
        description: 'Convert CSV vocabulary data to RDF format',
        type: 'github-cli',
      },
      {
        id: 'rdf-to-csv',
        title: 'RDF → CSV',
        description: 'Extract CSV data from RDF fragments',
        type: 'github-cli',
      },
      {
        id: 'sync-sheets',
        title: 'Sync Google Sheets',
        description: 'Pull/push data between CSV files and Google Sheets',
        type: 'github-cli',
      },
      {
        id: 'validate-rdf',
        title: 'Validate RDF',
        description: 'Check RDF fragments against DCTAP profile',
        type: 'github-cli',
      },
      {
        id: 'update-dctap',
        title: 'Manage DC-TAP',
        description: 'Maintain DC-TAP and JSON-LD context files for this namespace',
        type: 'codespaces',
      },
      {
        id: 'generate-release',
        title: 'Generate RDF Release',
        description: 'Compile fragments into master RDF files',
        type: 'github-cli',
      },
    ],
  },
  {
    id: 'workflow',
    label: 'Review & Workflow',
    actions: [
      {
        id: 'review-queue',
        title: 'Review Queue',
        description: 'View and manage pending content reviews',
        type: 'internal',
      },
      {
        id: 'assign-reviewers',
        title: 'Assign Reviewers',
        description: 'Assign team members to review specific content',
        type: 'internal',
      },
      {
        id: 'track-deadlines',
        title: 'Track Deadlines',
        description: 'Monitor review timelines and upcoming deadlines',
        type: 'internal',
      },
      {
        id: 'workflow-status',
        title: 'Content Status',
        description: 'View what content is in each workflow stage',
        type: 'internal',
      },
      {
        id: 'merge-approved',
        title: 'Merge Approved Changes',
        description: 'Integrate reviewed and approved content',
        type: 'github-cli',
      },
    ],
  },
  {
    id: 'team',
    label: 'Team Management',
    actions: [
      {
        id: 'manage-members',
        title: 'Manage Team Members',
        description: 'Add or remove contributors to this namespace',
        type: 'external',
      },
      {
        id: 'assign-roles',
        title: 'Assign Roles',
        description: 'Set reviewer and editor permissions for this namespace',
        type: 'external',
      },
      {
        id: 'view-activity',
        title: 'View Team Activity',
        description: 'Monitor contributions and recent changes',
        type: 'internal',
      },
      {
        id: 'team-settings',
        title: 'Team Settings',
        description: 'Configure team preferences and notifications',
        type: 'internal',
      },
    ],
  },
  {
    id: 'releases',
    label: 'Releases & Publishing',
    actions: [
      {
        id: 'create-release',
        title: 'Create Release Candidate',
        description: 'Package content for testing and review',
        type: 'github-cli',
      },
      {
        id: 'release-notes',
        title: 'Generate Release Notes',
        description: 'Document changes and updates for this release',
        type: 'codespaces',
      },
      {
        id: 'export-pdf',
        title: 'Export PDF',
        description: 'Generate downloadable PDF documentation',
        type: 'github-cli',
      },
      {
        id: 'tag-release',
        title: 'Tag Stable Release',
        description: 'Mark and publish a stable version',
        type: 'github-cli',
      },
      {
        id: 'deploy-production',
        title: 'Deploy to Production',
        description: 'Publish approved release to live site',
        type: 'github-cli',
      },
    ],
  },
  {
    id: 'quality',
    label: 'Quality Assurance',
    actions: [
      {
        id: 'validate-links',
        title: 'Validate Links',
        description: 'Check all internal and external references',
        type: 'github-cli',
      },
      {
        id: 'check-consistency',
        title: 'Check Consistency',
        description: 'Validate terminology and cross-references',
        type: 'github-cli',
      },
      {
        id: 'accessibility-audit',
        title: 'Accessibility Audit',
        description: 'Verify WCAG compliance across all pages',
        type: 'github-cli',
      },
      {
        id: 'translation-check',
        title: 'Translation Status',
        description: 'Review multilingual content consistency',
        type: 'internal',
      },
      {
        id: 'performance-test',
        title: 'Performance Test',
        description: 'Check site speed and build performance',
        type: 'github-cli',
      },
    ],
  },
  {
    id: 'github',
    label: 'GitHub',
    actions: [
      {
        id: 'browse-repository',
        title: 'Browse Code',
        description: 'Explore repository files and history',
        type: 'external',
      },
      {
        id: 'view-issues',
        title: 'Open Issues',
        description: 'View and manage GitHub issues',
        type: 'external',
      },
      {
        id: 'manage-prs',
        title: 'Manage PRs',
        description: 'Review and manage pull requests',
        type: 'external',
      },
      {
        id: 'create-issue',
        title: 'Create Issue',
        description: 'Report bugs or request features',
        type: 'external',
      },
      {
        id: 'repository-stats',
        title: 'Repository Stats',
        description: 'View detailed repository analytics and metrics',
        type: 'internal',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    actions: [
      {
        id: 'namespace-config',
        title: 'Namespace Configuration',
        description: 'Modify namespace settings and metadata',
        type: 'codespaces',
      },
      {
        id: 'navigation-config',
        title: 'Navigation Settings',
        description: 'Configure namespace navigation and menus',
        type: 'codespaces',
      },
      {
        id: 'theme-settings',
        title: 'Theme Configuration',
        description: 'Customize namespace appearance and branding',
        type: 'codespaces',
      },
      {
        id: 'deployment-config',
        title: 'Deployment Settings',
        description: 'Configure deployment and hosting options',
        type: 'internal',
      },
      {
        id: 'backup-restore',
        title: 'Backup & Restore',
        description: 'Manage namespace backups and restoration',
        type: 'github-cli',
      },
    ],
  },
];

const specialCaseTabs: TabData[] = [
  {
    id: 'system',
    label: 'System Management',
    specialCaseOnly: true,
    actions: [
      {
        id: 'manage-namespaces',
        title: 'Manage All Namespaces',
        description: 'Create, configure, and manage all platform namespaces',
        type: 'internal',
        requiredRole: 'superadmin',
      },
      {
        id: 'system-settings',
        title: 'Platform Settings',
        description: 'Configure platform-wide settings and features',
        type: 'internal',
        requiredRole: 'superadmin',
      },
      {
        id: 'user-management',
        title: 'Global User Management',
        description: 'Manage users across all namespaces',
        type: 'internal',
        requiredRole: 'superadmin',
      },
      {
        id: 'deployment-control',
        title: 'Deployment Control',
        description: 'Manage platform deployments and infrastructure',
        type: 'internal',
        requiredRole: 'superadmin',
      },
    ],
  },
];

const drawerWidth = 240;

function NamespaceDashboard({
  namespaceTitle,
  namespaceCode,
  namespaceKey,
  isSpecialCase,
}: {
  namespaceTitle: string;
  namespaceCode: string;
  namespaceKey: string;
  isSpecialCase?: boolean;
}) {
  return (
    <Box>
      {isSpecialCase && (
        <Alert severity="warning" sx={{ mb: 3 }} role="alert">
          <AlertTitle>Special Management Area</AlertTitle>
          <Typography variant="body2">
            {namespaceKey === 'portal' ? (
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
            aria-labelledby={`${namespaceKey}-status-title`}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                id={`${namespaceKey}-status-title`}
                component="h2"
              >
                {isSpecialCase ? 'System' : 'Namespace'} Status
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Type"
                    secondary={isSpecialCase ? 'Special System Area' : 'Standard Namespace'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Last Updated"
                    secondary="2 hours ago"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Build Status"
                    secondary={
                      <Chip 
                        label="Passing" 
                        color="success" 
                        size="small"
                        aria-label="Build status: Passing"
                      />
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary={isSpecialCase ? 'System Issues' : 'Open PRs'}
                    secondary={<span aria-label={`${isSpecialCase ? 'System Issues' : 'Open PRs'}: 3`}>3</span>}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary={isSpecialCase ? 'Active Tasks' : 'Pending Reviews'}
                    secondary={<span aria-label={`${isSpecialCase ? 'Active Tasks' : 'Pending Reviews'}: 5`}>5</span>}
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
            aria-labelledby={`${namespaceKey}-activity-title`}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                id={`${namespaceKey}-activity-title`}
                component="h2"
              >
                Recent Activity - {namespaceCode}
              </Typography>
              <List dense>
                {isSpecialCase ? (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary="System configuration updated"
                        secondary="1h ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="New namespace created: test-ns"
                        secondary="3h ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Platform deployment completed"
                        secondary="1d ago"
                      />
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem>
                      <ListItemText 
                        primary="Updated element C2001"
                        secondary="2h ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Merged PR #45"
                        secondary="1d ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Added new vocabulary terms"
                        secondary="2d ago"
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            role="region"
            aria-labelledby={`${namespaceKey}-actions-title`}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                id={`${namespaceKey}-actions-title`}
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
            aria-labelledby={`${namespaceKey}-overview-title`}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                id={`${namespaceKey}-overview-title`}
                component="h2"
              >
                {isSpecialCase ? 'System Overview' : 'Team Overview'}
              </Typography>
              <Grid container spacing={3}>
                {isSpecialCase ? (
                  <>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Typography 
                          variant="h3" 
                          color="primary"
                          aria-label="12 namespaces"
                        >
                          12
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
                          aria-label="156 total users"
                        >
                          156
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          TOTAL USERS
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Typography 
                          variant="h3" 
                          color="primary"
                          aria-label="8 team members"
                        >
                          8
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
                          aria-label="3 active reviewers"
                        >
                          3
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ACTIVE REVIEWERS
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!isSpecialCase && (
        <Alert severity="info" sx={{ mt: 3 }} role="status">
          <AlertTitle>Namespace Management</AlertTitle>
          <Typography variant="body2">
            This dashboard manages the <strong>{namespaceTitle}</strong> namespace. 
            Each namespace represents a distinct IFLA standard with its own content, team, and workflow.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

function ActionGrid({ 
  actions, 
  isSuperAdmin 
}: { 
  actions: ManagementAction[];
  isSuperAdmin?: boolean;
}) {
  const getActionTypeIcon = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli':
        return <ElectricBolt />;
      case 'codespaces':
        return <Computer />;
      case 'internal':
        return <Build />;
      case 'external':
        return <LinkIcon />;
      default:
        return <FileText />;
    }
  };

  const getActionTypeLabel = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli':
        return 'GitHub CLI';
      case 'codespaces':
        return 'Codespaces';
      case 'internal':
        return 'Internal Tool';
      case 'external':
        return 'External Link';
      default:
        return 'Action';
    }
  };

  const canAccessAction = (action: ManagementAction) => {
    if (!action.requiredRole) return true;
    return action.requiredRole === 'superadmin' ? isSuperAdmin : true;
  };

  return (
    <Grid container spacing={3}>
      {actions.map((action) => {
        const hasAccess = canAccessAction(action);
        return (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={action.id}>
            <Card 
              sx={{ height: '100%', opacity: hasAccess ? 1 : 0.6 }}
              role="article"
              aria-labelledby={`action-${action.id}-title`}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box aria-hidden="true">
                    {getActionTypeIcon(action.type)}
                  </Box>
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      id={`action-${action.id}-title`}
                      component="h3"
                    >
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {action.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!hasAccess || action.disabled !== false}
                        aria-label={`${action.title}: ${!hasAccess ? 'Superadmin Only' : action.disabled !== false ? 'Coming Soon' : 'Run Action'}`}
                        sx={{ minHeight: 36 }}
                      >
                        {!hasAccess ? 'Superadmin Only' : action.disabled !== false ? 'Coming Soon' : 'Run Action'}
                      </Button>
                      <Chip 
                        label={getActionTypeLabel(action.type)} 
                        size="small" 
                        variant="outlined"
                        aria-label={`Action type: ${getActionTypeLabel(action.type)}`}
                      />
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

function getTabIcon(tabId: string) {
  switch(tabId) {
    case 'overview': return <LayoutDashboard />;
    case 'content': return <FileText />;
    case 'rdf': return <Database />;
    case 'workflow': return <GitBranch />;
    case 'team': return <Users />;
    case 'releases': return <Package />;
    case 'quality': return <Shield />;
    case 'github': return <GitHub />;
    case 'settings': return <Settings />;
    case 'system': return <Wrench />;
    default: return null;
  }
}

export default function NamespaceManagementClient({
  namespaceTitle,
  namespaceCode,
  namespaceKey,
  githubRepo = 'iflastandards/standards-dev',
  isSpecialCase = false,
  isSuperAdmin = false,
  namespaceDescription,
}: NamespaceManagementClientProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const availableTabs = isSpecialCase && isSuperAdmin 
    ? [...standardNamespaceTabs, ...specialCaseTabs]
    : standardNamespaceTabs;

  const currentTab = availableTabs.find(tab => tab.id === selectedTab);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setLiveMessage(mobileOpen ? 'Navigation closed' : 'Navigation opened');
  };

  const handleTabSelect = (tabId: string, tabLabel: string) => {
    setSelectedTab(tabId);
    setLiveMessage(`Switched to ${tabLabel} section`);
    if (isMobile) {
      setMobileOpen(false);
    }
    // Clear message after announcement
    setTimeout(() => setLiveMessage(''), 1000);
  };

  const drawer = (
    <Box role="navigation" aria-label="Dashboard navigation">
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" noWrap component="h2">
          {namespaceCode}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {isSpecialCase ? 'System Management' : 'Namespace Management'}
        </Typography>
      </Box>
      <List id="navigation">
        {availableTabs.map((tab) => (
          <ListItem key={tab.id} disablePadding>
            <ListItemButton
              selected={selectedTab === tab.id}
              onClick={() => handleTabSelect(tab.id, tab.label)}
              aria-current={selectedTab === tab.id ? 'page' : undefined}
              aria-label={`${tab.label}${tab.specialCaseOnly ? ' (System only)' : ''}`}
            >
              <ListItemIcon aria-hidden="true">
                {getTabIcon(tab.id)}
              </ListItemIcon>
              <ListItemText 
                primary={tab.label}
                secondary={tab.specialCaseOnly && (
                  <Chip 
                    label="System" 
                    size="small" 
                    color="warning"
                    aria-label="System administrator only"
                  />
                )}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="textSecondary">
          {namespaceTitle}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box 
            sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%', mr: 1 }}
            role="img"
            aria-label="Status: Connected"
          />
          <Typography variant="caption">Connected</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <SkipLinks />
      <LiveRegion message={liveMessage} />
      
      <Box sx={{ display: 'flex' }}>
        {/* Mobile App Bar */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              width: '100%',
              ml: 0,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open navigation menu"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <Menu />
              </IconButton>
              <Typography variant="h6" noWrap component="h1">
                {namespaceTitle}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Sidebar Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>

          {/* Desktop Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                position: 'relative',
                height: '100%',
                borderRight: 1,
                borderColor: 'divider',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          id="main-content"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: { xs: 8, md: 0 },
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom component="h1">
              {currentTab?.label}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {namespaceTitle} - Dashboard and status overview
            </Typography>
          </Box>

          {selectedTab === 'overview' ? (
            <NamespaceDashboard 
              namespaceTitle={namespaceTitle} 
              namespaceCode={namespaceCode}
              namespaceKey={namespaceKey}
              isSpecialCase={isSpecialCase}
            />
          ) : (
            <ActionGrid 
              actions={currentTab?.actions || []} 
              isSuperAdmin={isSuperAdmin}
            />
          )}

          <Box 
            sx={{ mt: 4 }}
            id="external-resources"
            role="region"
            aria-labelledby="external-resources-title"
          >
            <Typography 
              variant="h6" 
              gutterBottom
              id="external-resources-title"
              component="h2"
            >
              External Resources
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<GitHub aria-hidden="true" />}
                href={`https://github.com/${githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository (opens in new tab)"
                sx={{ minHeight: 44 }}
              >
                GitHub Repository
              </Button>
              <Button
                variant="outlined"
                href={`https://github.com/${githubRepo}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Issues (opens in new tab)"
                sx={{ minHeight: 44 }}
              >
                Issues
              </Button>
              <Button
                variant="outlined"
                href={`https://github.com/${githubRepo}/pulls`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Pull Requests (opens in new tab)"
                sx={{ minHeight: 44 }}
              >
                Pull Requests
              </Button>
              <Button
                variant="outlined"
                href="https://github.com/orgs/iflastandards/teams"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Team Management (opens in new tab)"
                sx={{ minHeight: 44 }}
              >
                Team Management
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}
