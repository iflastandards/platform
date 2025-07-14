'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Container,
  Stack,
  Alert,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  mockNamespaces,
  getNamespaceStats,
} from '@/lib/mock-data/namespaces-extended';
import RequestInviteButton from '@/components/welcome/RequestInviteButton';
import { SignInButton } from '@clerk/nextjs';

interface NamespaceStatusCardProps {
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'archived';
  currentVersion: string;
  lastPublished: string;
  color: string;
  icon: string;
  statistics: {
    elements: number;
    concepts: number;
    translations: number;
    contributors: number;
  };
}

function NamespaceStatusCard({
  name,
  description,
  status,
  currentVersion,
  lastPublished,
  color,
}: NamespaceStatusCardProps) {
  const statusConfig = {
    active: {
      color: 'success' as const,
      label: 'Active',
      icon: <CheckCircleIcon fontSize="small" />,
    },
    maintenance: {
      color: 'warning' as const,
      label: 'Maintenance',
      icon: <WarningIcon fontSize="small" />,
    },
    archived: {
      color: 'error' as const,
      label: 'Archived',
      icon: <ErrorIcon fontSize="small" />,
    },
  };

  const config = statusConfig[status];
  const publishedDate = new Date(lastPublished).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: 1,
        borderColor: 'divider',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 4px 12px ${color}20`,
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardContent
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color }}
            >
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {description}
            </Typography>
          </Box>
          <Chip
            label={config.label}
            color={config.color}
            size="small"
            icon={config.icon}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Version {currentVersion} • Published {publishedDate}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            mb={3}
          >
            <Link
              href="/api/auth/signin?demo=true&userId=user-admin-1"
              passHref
            >
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                Admin Demo
              </Button>
            </Link>
            <Link
              href="/api/auth/signin?demo=true&userId=user-isbd-rg-admin"
              passHref
            >
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                RG Admin Demo
              </Button>
            </Link>
            <Link
              href="/api/auth/signin?demo=true&userId=user-isbd-editor"
              passHref
            >
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                Member Demo
              </Button>
            </Link>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function WelcomePage() {
  const theme = useTheme();
  const stats = getNamespaceStats();

  const features = [
    {
      icon: <LanguageIcon />,
      title: 'Multilingual Standards',
      description:
        'Manage and maintain IFLA standards across multiple languages with collaborative translation workflows.',
    },
    {
      icon: <GitHubIcon />,
      title: 'GitHub Integration',
      description:
        'Seamless integration with GitHub for version control, issue tracking, and collaborative development.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Role-Based Access',
      description:
        'Secure, invitation-only access with granular permissions based on your role and project assignments.',
    },
    {
      icon: <PeopleIcon />,
      title: 'Team Collaboration',
      description:
        'Work together with review groups, editors, translators, and contributors in structured workflows.',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              IFLA Standards Management Toolkit
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Collaborative platform for developing, maintaining, and publishing
              international library standards
            </Typography>

            <Alert
              severity="info"
              sx={{
                mb: 4,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                color: 'grey.800',
                border: 1,
                borderColor: 'rgba(255, 255, 255, 0.8)',
                '& .MuiAlert-icon': {
                  color: 'info.main',
                },
                maxWidth: 600,
                mx: 'auto',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography fontWeight="medium">
                🔒 Access by invitation only
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                This platform is exclusively for IFLA review group members,
                editors, translators, and authorized contributors.
              </Typography>
            </Alert>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              flexWrap="wrap"
            >
              <Link
                href="/api/auth/signin?demo=true&userId=user-admin-1"
                passHref
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GitHubIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Super Admin Demo
                </Button>
              </Link>
              <Link
                href="/api/auth/signin?demo=true&userId=user-isbd-rg-admin"
                passHref
              >
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'white',
                    },
                  }}
                >
                  RG Admin Demo
                </Button>
              </Link>
              <Link
                href="/api/auth/signin?demo=true&userId=user-isbd-editor"
                passHref
              >
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'white',
                    },
                  }}
                >
                  Member Demo
                </Button>
              </Link>
            </Stack>

            {/* Clerk Sign-In and Invitation CTA */}
            <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
              <SignInButton mode="modal">
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<GitHubIcon />}
                  sx={{
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                >
                  Sign In with GitHub
                </Button>
              </SignInButton>
              <RequestInviteButton />
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Live Platform Statistics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time overview of our collaborative standards development
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', py: 3 }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Standards
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', py: 3 }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {(stats.totalElements + stats.totalConcepts).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Elements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', py: 3 }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {stats.totalTranslations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Languages
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', py: 3 }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Platform Features
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Everything you need for collaborative standards development
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card
                elevation={0}
                sx={{ height: '100%', border: 1, borderColor: 'divider' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        minWidth: 48,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Namespace Status */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Standards Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Current status of all IFLA standards and their development
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {Object.values(mockNamespaces).map((namespace) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={namespace.id}>
              <NamespaceStatusCard {...namespace} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          borderTop: 1,
          borderColor: 'divider',
          py: 4,
          mt: 6,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              © 2024 International Federation of Library Associations and
              Institutions (IFLA)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Standards Management Toolkit • Powered by modern web technologies
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
