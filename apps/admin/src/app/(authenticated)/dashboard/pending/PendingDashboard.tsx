'use client';

import React from 'react';
import {
  Container,
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
} from '@mui/icons-material';
import { AppUser } from '@/lib/clerk-github-auth';

interface PendingDashboardProps {
  user: AppUser;
}

export default function PendingDashboard({ user }: PendingDashboardProps) {
  const isDemo = process.env.NEXT_PUBLIC_IFLA_DEMO === 'true';
  
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccessTime sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
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

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Account Information
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="action" />
                <Typography>{user.email}</Typography>
              </Box>
              {user.githubUsername && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GitHub />
                  <Typography>@{user.githubUsername}</Typography>
                  {isDemo && <Chip label="Demo Mode" size="small" color="warning" />}
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpOutline /> What happens next?
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
            >
              Contact Administrator
            </Button>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              startIcon={<AccessTime />}
            >
              Check Again
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}