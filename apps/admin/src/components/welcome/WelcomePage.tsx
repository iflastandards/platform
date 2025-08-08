'use client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Container,
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
import SafeSignInButton from '@/components/auth/SafeSignInButton';

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
              variant="h4"
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
    <Box component="main" sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        component="header"
        sx={{
          position: 'relative',
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 6, md: 10 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center">
            <Typography 
              variant="h1" 
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                lineHeight: 1.1,
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, rgba(255,255,255,0.8) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              IFLA Standards Management Toolkit
            </Typography>
            
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 5, 
                opacity: 0.95,
                fontWeight: 400,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                lineHeight: 1.4,
                maxWidth: 800,
                mx: 'auto',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Collaborative platform for developing, maintaining, and publishing
              international library standards
            </Typography>

            <Alert
              severity="info"
              sx={{
                mb: 5,
                bgcolor: 'rgba(255, 255, 255, 0.98)',
                color: 'grey.800',
                border: 2,
                borderColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
                '& .MuiAlert-icon': {
                  color: 'info.main',
                  fontSize: '1.5rem',
                },
                maxWidth: 650,
                mx: 'auto',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)',
                p: 3,
              }}
            >
              <Typography 
                fontWeight="bold" 
                sx={{ 
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                🔒 Access by invitation only
                <RequestInviteButton />
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 1.5,
                  fontSize: '1rem',
                  lineHeight: 1.5,
                }}
              >
                This platform is exclusively for IFLA review group members,
                editors, translators, and authorized contributors.
              </Typography>
            </Alert>

            {/* Enhanced CTA Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <SafeSignInButton>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    px: 5,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    border: 2,
                    borderColor: 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.95)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </SafeSignInButton>
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                mt: 6,
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
                opacity: 0.7,
              }}
            >
              {[
                { Icon: SecurityIcon, label: 'Security' },
                { Icon: PeopleIcon, label: 'Collaboration' },
                { Icon: LanguageIcon, label: 'Multilingual' }
              ].map(({ Icon, label }, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Icon 
                    sx={{ fontSize: '2rem', color: 'white' }} 
                    aria-label={label}
                    role="img"
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container component="section" maxWidth="lg" sx={{ py: 6 }}>
        <Box component="header" textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
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
        <Box component="header" textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
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
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
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
          <Typography variant="h3" fontWeight="bold" gutterBottom>
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
        component="footer"
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
