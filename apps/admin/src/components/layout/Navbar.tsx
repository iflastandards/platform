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
import { getMockGitHubData } from '@/lib/github-mock-service';

export default function Navbar() {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [namespacesOpen, setNamespacesOpen] = useState(true);

  // Get current user from Clerk
  const { user: clerkUser, isLoaded } = useUser();
  const isDemo = process.env.NEXT_PUBLIC_IFLA_DEMO === 'true';
  
  // Determine user role based on demo mode
  let userRole = 'member';
  let isAdmin = false;
  let isStaff = false;
  
  if (isLoaded && clerkUser) {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
    
    if (isDemo) {
      // In demo mode, get role from mock GitHub data
      const mockData = getMockGitHubData(email);
      isAdmin = mockData.systemRole === 'admin';
      isStaff = isAdmin || mockData.reviewGroups.some(rg => rg.role === 'maintainer');
      
      if (isAdmin) {
        userRole = 'admin';
      } else if (isStaff) {
        userRole = 'maintainer';
      } else if (mockData.reviewGroups.length > 0 || Object.keys(mockData.projects).length > 0) {
        userRole = 'member';
      } else {
        userRole = 'guest';
      }
    } else {
      // In production mode, use Clerk metadata
      userRole = clerkUser.publicMetadata?.iflaRole as string || 'member';
      isAdmin = userRole === 'admin';
      isStaff = userRole === 'staff' || isAdmin;
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      href: '/dashboard',
      show: true,
    },
    {
      label: 'Namespaces',
      icon: <FolderIcon />,
      expandable: true,
      show: true,
      children: [
        { label: 'ISBD', href: '/namespaces/isbd' },
        { label: 'ISBD-M', href: '/namespaces/isbdm' },
        { label: 'MulDiCat', href: '/namespaces/muldicat' },
        { label: 'All Namespaces', href: '/namespaces' },
      ],
    },
    {
      label: 'Import Workflow',
      icon: <CodeIcon />,
      href: '/import',
      show: true,
    },
    {
      label: 'Translation',
      icon: <TranslateIcon />,
      href: '/translation',
      show: true,
    },
    {
      label: 'Review Queue',
      icon: <ReviewIcon />,
      href: '/review',
      show: true,
      badge: '3',
    },
    {
      label: 'GitHub Integration',
      icon: <GitHubIcon />,
      href: '/github',
      show: isStaff,
    },
    {
      label: 'Build Pipeline',
      icon: <BuildIcon />,
      href: '/builds',
      show: isStaff,
    },
    {
      label: 'Editorial Cycles',
      icon: <TimelineIcon />,
      href: '/cycles',
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
