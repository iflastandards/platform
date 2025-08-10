'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { AppUser } from '@/lib/clerk-github-auth';

interface AuthorNamespacesPageProps {
  user: AppUser;
}

export function AuthorNamespacesPage({ user }: AuthorNamespacesPageProps) {
  const accessibleNamespaces = user.accessibleNamespaces;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Accessible Namespaces
      </Typography>
      <Grid container spacing={2}>
        {accessibleNamespaces.map((namespace) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={namespace}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {namespace.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Content to review/translate
                </Typography>
                <Button
                  component={Link}
                  href={`/namespaces/${namespace}`}
                  variant="contained"
                  fullWidth
                  aria-label={`View ${namespace.toUpperCase()} namespace`}
                >
                  View Namespace
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {accessibleNamespaces.length === 0 && (
          <Grid size={12}>
            <Typography color="text.secondary">
              No namespaces currently accessible
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}