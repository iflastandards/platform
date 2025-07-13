'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Skeleton,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  MenuBook,
  AutoStories,
  AccountTree,
  Archive,
  Translate,
  DataObject,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { MockNamespace } from '@/lib/mock-data';

interface NamespaceSelectorProps {
  namespaces: MockNamespace[];
  userRole?: string;
  onSelect?: (namespace: MockNamespace) => void;
  loading?: boolean;
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  MenuBook,
  AutoStories,
  AccountTree,
  Archive,
  Translate,
  DataObject,
};

export function NamespaceSelector({ 
  namespaces, 
  userRole, 
  onSelect,
  loading = false 
}: NamespaceSelectorProps) {
  const router = useRouter();

  const handleNamespaceClick = (namespace: MockNamespace) => {
    if (onSelect) {
      onSelect(namespace);
    } else {
      // Default navigation
      router.push(`/dashboard/${userRole || 'viewer'}/${namespace.slug}`);
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((n) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={n}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={60} />
                <Skeleton sx={{ mt: 2 }} />
                <Skeleton />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {namespaces.map((namespace) => {
        const IconComponent = iconMap[namespace.icon] || MenuBook;
        
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={namespace.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => handleNamespaceClick(namespace)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: namespace.color,
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    <IconComponent sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="h2">
                      {namespace.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {namespace.reviewGroupName}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {namespace.description}
                </Typography>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip 
                    label={namespace.status} 
                    size="small"
                    color={
                      namespace.status === 'active' ? 'success' :
                      namespace.status === 'maintenance' ? 'warning' : 'default'
                    }
                  />
                  <Chip 
                    label={`v${namespace.currentVersion}`} 
                    size="small" 
                    variant="outlined"
                  />
                  {userRole && (
                    <Chip 
                      label={userRole} 
                      size="small" 
                      color="primary"
                    />
                  )}
                </Box>

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    {namespace.statistics.elements} elements
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {namespace.statistics.concepts} concepts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {namespace.statistics.contributors} contributors
                  </Typography>
                </Box>
              </CardContent>

              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  sx={{ ml: 'auto' }}
                >
                  View Dashboard →
                </Button>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}