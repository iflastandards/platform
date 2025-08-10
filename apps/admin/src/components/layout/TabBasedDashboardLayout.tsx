'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{}>;
  badge?: number | string;
  specialAccess?: boolean;
}

interface TabBasedDashboardLayoutProps {
  title: string;
  subtitle?: string;
  navigationItems: NavigationItem[];
  selectedTab: string;
  onTabSelect: (tabId: string) => void;
  children: React.ReactNode;
}

export function TabBasedDashboardLayout({
  title,
  subtitle,
  navigationItems,
  selectedTab,
  onTabSelect,
  children,
}: TabBasedDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box role="navigation" aria-label="Dashboard navigation">
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" noWrap component="h2">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <List>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = selectedTab === item.id;
          
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  onTabSelect(item.id);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label}${item.specialAccess ? ' (Restricted)' : ''}`}
              >
                <ListItemIcon aria-hidden="true">
                  <IconComponent />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  secondary={item.specialAccess && (
                    <Chip 
                      label="Restricted" 
                      size="small" 
                      color="warning"
                      aria-label="Restricted access"
                    />
                  )}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    color="primary"
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            ml: 0,
            zIndex: theme.zIndex.drawer + 1,
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
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="h1">
              {title}
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
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              pt: { xs: '64px', md: 0 },
            },
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
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, md: 0 },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}