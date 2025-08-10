'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  Email,
  GitHub,
  AccessTime,
  HelpOutline,
  Person,
} from '@mui/icons-material';
import { AppUser } from '@/lib/clerk-github-auth';
import { TabBasedDashboardLayout, NavigationItem } from '@/components/layout/TabBasedDashboardLayout';

interface PendingDashboardProps {
  user: AppUser;
}

export default function PendingDashboard({ user }: PendingDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('status');
  const isDemo = process.env.NEXT_PUBLIC_IFLA_DEMO === 'true';
  
  const navigationItems: NavigationItem[] = [
    { id: 'status', label: 'Account Status', icon: AccessTime },
    { id: 'profile', label: 'My Profile', icon: Person },
    { id: 'help', label: 'Getting Started', icon: HelpOutline },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'status':
        return (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <AccessTime sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} aria-hidden="true" />
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome to IFLA Standards Admin Portal
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your account is pending assignment
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="body1">
                Hello <strong>{user.name}</strong>, your account has been created successfully, 
                but you haven&apos;t been assigned to any Review Groups or Projects yet.
              </Typography>
            </Alert>

            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpOutline aria-hidden="true" /> What happens next?
              </Typography>
              <Typography variant="body1" paragraph>
                A Review Group administrator needs to:
              </Typography>
              <ol>
                <li>
                  <Typography variant="body1">
                    Add you to one or more Review Groups (GitHub Teams)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Assign you to specific Projects within those groups
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Grant you access to the relevant namespaces
                  </Typography>
                </li>
              </ol>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Once you&apos;ve been assigned, you&apos;ll automatically gain access to the appropriate 
                dashboards and tools based on your role.
              </Typography>
            </Paper>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Stack spacing={2} direction="row" justifyContent="center">
                <Button
                  variant="outlined"
                  href="mailto:ifla-standards-admin@ifla.org"
                  startIcon={<Email />}
                  aria-label="Send email to administrator"
                >
                  Contact Administrator
                </Button>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  startIcon={<AccessTime />}
                  aria-label="Refresh page to check for updates"
                >
                  Check Again
                </Button>
              </Stack>
            </Box>
          </>
        );

      case 'profile':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              My Profile
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email color="action" aria-hidden="true" />
                    <Typography>{user.email}</Typography>
                  </Box>
                  {user.githubUsername && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GitHub aria-hidden="true" />
                      <Typography>@{user.githubUsername}</Typography>
                      {isDemo && <Chip label="Demo Mode" size="small" color="warning" />}
                    </Box>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Chip label="Pending Assignment" color="warning" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        );

      case 'help':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Getting Started
            </Typography>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    About IFLA Standards Platform
                  </Typography>
                  <Typography variant="body1" paragraph>
                    The IFLA Standards Platform is a collaborative environment for managing 
                    and developing international library standards. Once you&apos;re assigned to 
                    a Review Group, you&apos;ll be able to:
                  </Typography>
                  <ul>
                    <li>
                      <Typography variant="body2">
                        Access and edit vocabulary namespaces
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Participate in review cycles
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Contribute translations
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Export and import vocabulary data
                      </Typography>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Roles and Permissions
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The platform uses role-based access control. Common roles include:
                  </Typography>
                  <Stack spacing={1}>
                    <Chip label="Maintainer" size="small" /> - Full control over Review Group
                  </Stack>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Chip label="Lead" size="small" /> - Project management capabilities
                  </Stack>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Chip label="Editor" size="small" /> - Content editing permissions
                  </Stack>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Chip label="Reviewer" size="small" /> - Review and approve changes
                  </Stack>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Chip label="Translator" size="small" /> - Multilingual content contribution
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <TabBasedDashboardLayout
      title="Pending Assignment"
      subtitle="Waiting for Review Group assignment"
      navigationItems={navigationItems}
      selectedTab={selectedTab}
      onTabSelect={setSelectedTab}
    >
      {renderContent()}
    </TabBasedDashboardLayout>
  );
}
