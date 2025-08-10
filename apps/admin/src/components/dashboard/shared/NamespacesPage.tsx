'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Edit as EditIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { AppUser } from '@/lib/clerk-github-auth';

interface SharedNamespacesPageProps {
  user: AppUser;
  role: 'author' | 'editor';
}

export function SharedNamespacesPage({ user, role }: SharedNamespacesPageProps) {
  const accessibleNamespaces = user.accessibleNamespaces;

  // Author view: Card layout
  if (role === 'author') {
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

  // Editor view: List layout
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Accessible Namespaces
      </Typography>
      <List>
        {accessibleNamespaces.map((namespace) => (
          <ListItem key={namespace} divider>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText
              primary={namespace.toUpperCase()}
              secondary="Vocabulary management"
            />
            <IconButton
              component={Link}
              href={`/namespaces/${namespace}`}
              size="small"
              aria-label={`Edit ${namespace.toUpperCase()} namespace`}
            >
              <EditIcon />
            </IconButton>
          </ListItem>
        ))}
        {accessibleNamespaces.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No namespaces accessible"
              secondary="You don't have access to any namespaces"
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
}