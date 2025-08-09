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
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Link,
  Chip,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

// Skip Links Component (Required for Accessibility)
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

// Live Region for Screen Reader Announcements
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

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  specialAccess?: boolean;
}

interface StandardDashboardLayoutProps {
  title: string;
  subtitle?: string;
  navigationItems: NavigationItem[];
  selectedTab: string;
  onTabSelect: (tabId: string) => void;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export function StandardDashboardLayout({
  title,
  subtitle,
  navigationItems,
  selectedTab,
  onTabSelect,
  children,
  footerContent,
}: StandardDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setLiveMessage(mobileOpen ? 'Navigation closed' : 'Navigation opened');
  };

  const handleTabSelect = (itemId: string, itemLabel: string) => {
    onTabSelect(itemId);
    setLiveMessage(`Switched to ${itemLabel} section`);
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
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <List id="navigation">
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedTab === item.id}
              onClick={() => handleTabSelect(item.id, item.label)}
              aria-current={selectedTab === item.id ? 'page' : undefined}
              aria-label={`${item.label}${item.specialAccess ? ' (Restricted)' : ''}`}
            >
              <ListItemIcon aria-hidden="true">
                {item.icon}
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
        ))}
      </List>
      {footerContent && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            {footerContent}
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <SkipLinks />
      <LiveRegion message={liveMessage} />
      
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
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                pt: { xs: '64px', md: 0 }, // Account for app bar on mobile
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
          id="main-content"
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
    </>
  );
}