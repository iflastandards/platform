'use client';

import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  Translate as TranslateIcon,
  RateReview as ReviewIcon,
  GitHub as GitHubIcon,
  Build as BuildIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { mockUsers } from '@/lib/mock-data/auth';

interface NavbarProps {
  userId?: string;
}

export default function Navbar({ userId = 'user-admin-1' }: NavbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [namespacesOpen, setNamespacesOpen] = useState(true);

  // Get current user from mock data
  const currentUser = mockUsers.find(u => u.id === userId) || mockUsers[0];
  const userRole = currentUser.publicMetadata.iflaRole || 'member';
  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff' || isAdmin;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // In demo mode, redirect to admin welcome page
    router.push('/');
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      href: '/dashboard?demo=true',
      show: true,
    },
    {
      label: 'Namespaces',
      icon: <FolderIcon />,
      expandable: true,
      show: true,
      children: [
        { label: 'ISBD', href: '/namespaces/isbd?demo=true' },
        { label: 'ISBD-M', href: '/namespaces/isbdm?demo=true' },
        { label: 'MulDiCat', href: '/namespaces/muldicat?demo=true' },
        { label: 'All Namespaces', href: '/namespaces?demo=true' },
      ],
    },
    {
      label: 'Import Workflow',
      icon: <CodeIcon />,
      href: '/import?demo=true',
      show: true,
    },
    {
      label: 'Translation',
      icon: <TranslateIcon />,
      href: '/translation?demo=true',
      show: true,
    },
    {
      label: 'Review Queue',
      icon: <ReviewIcon />,
      href: '/review?demo=true',
      show: true,
      badge: '3',
    },
    {
      label: 'GitHub Integration',
      icon: <GitHubIcon />,
      href: '/github?demo=true',
      show: isStaff,
    },
    {
      label: 'Build Pipeline',
      icon: <BuildIcon />,
      href: '/builds?demo=true',
      show: isStaff,
    },
    {
      label: 'Editorial Cycles',
      icon: <TimelineIcon />,
      href: '/cycles?demo=true',
      show: isStaff,
    },
  ];

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {navigationItems
          .filter(item => item.show)
          .map((item) => (
            <React.Fragment key={item.label}>
              {item.expandable ? (
                <>
                  <ListItemButton onClick={() => setNamespacesOpen(!namespacesOpen)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                    {namespacesOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={namespacesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children?.map((child) => (
                        <ListItemButton 
                          key={child.label}
                          sx={{ pl: 4 }}
                          onClick={() => {
                            router.push(child.href);
                            setMobileOpen(false);
                          }}
                        >
                          <ListItemText primary={child.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                        setMobileOpen(false);
                      }
                    }}
                  >
                    <ListItemIcon>
                      {item.badge ? (
                        <Badge badgeContent={item.badge} color="primary">
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              )}
            </React.Fragment>
          ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 0, mr: 4 }}>
            IFLA Admin
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
              {navigationItems
                .filter(item => item.show && !item.expandable)
                .slice(0, 5)
                .map((item) => (
                  <Button
                    key={item.label}
                    color="inherit"
                    startIcon={item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : item.icon}
                    onClick={() => item.href && router.push(item.href)}
                  >
                    {item.label}
                  </Button>
                ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Chip
              label={userRole}
              size="small"
              color={isAdmin ? 'error' : isStaff ? 'primary' : 'default'}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            />
            
            <IconButton color="inherit">
              <Badge badgeContent={5} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {currentUser.name.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Avatar>{currentUser.name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2">{currentUser.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {currentUser.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => router.push('/profile?demo=true')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => router.push('/settings?demo=true')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}