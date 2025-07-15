'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { getAdminPortalConfigAuto } from '@ifla/theme/config/siteConfig';
import { useTheme as useAppTheme } from '@/contexts/theme-context';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationsIcon,
  Code as CodeIcon,
  Translate as TranslateIcon,
  RateReview as ReviewIcon,
  GitHub as GitHubIcon,
  Build as BuildIcon,
  Timeline as TimelineIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { mockUsers } from '@/lib/mock-data/auth';

interface NavbarProps {
  userId?: string;
}

export default function Navbar({ userId = 'user-admin-1' }: NavbarProps) {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [namespacesOpen, setNamespacesOpen] = useState(true);

  // Get current user from Clerk or mock data
  const { user: clerkUser, isLoaded: _isLoaded } = useUser();
  
  // For demo mode, use mock data
  const currentUser = mockUsers.find((u) => u.id === userId) || mockUsers[0];
  const userRole = clerkUser?.publicMetadata?.iflaRole as string || currentUser.publicMetadata.iflaRole || 'member';
  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff' || isAdmin;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
          .filter((item) => item.show)
          .map((item) => (
            <React.Fragment key={item.label}>
              {item.expandable ? (
                <>
                  <ListItemButton
                    onClick={() => setNamespacesOpen(!namespacesOpen)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                    {namespacesOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={namespacesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children?.map((child) => (
                        <ListItemButton
                          key={child.label}
                          component={Link}
                          href={child.href}
                          sx={{
                            pl: 4,
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                          onClick={() => setMobileOpen(false)}
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
                    component={Link}
                    href={item.href || '#'}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                    onClick={() => setMobileOpen(false)}
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
          backgroundColor:
            theme.palette.mode === 'dark' ? 'background.paper' : 'primary.main',
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

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 0, mr: 4 }}
          >
            IFLA Admin
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
              {navigationItems
                .filter((item) => item.show && !item.expandable)
                .slice(0, 5)
                .map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.href || '#'}
                    color="inherit"
                    startIcon={
                      item.badge ? (
                        <Badge badgeContent={item.badge} color="error">
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )
                    }
                    sx={{ textDecoration: 'none' }}
                  >
                    {item.label}
                  </Button>
                ))}
            </Box>
          )}

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}
          >
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

            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <UserButton 
              afterSignOutUrl={getAdminPortalConfigAuto().url}
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                }
              }}
            />
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
    </>
  );
}
