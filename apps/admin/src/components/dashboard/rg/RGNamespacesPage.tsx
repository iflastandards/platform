'use client';


import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import Link from 'next/link';
import { getNamespacesByReviewGroup } from '@/lib/mock-data/namespaces-extended';

interface NamespaceCardProps {
  slug: string;
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'archived';
  currentVersion: string;
  color: string;
  statistics: {
    elements: number;
    concepts: number;
    translations: number;
    contributors: number;
  };
}

function NamespaceCard({ slug, name, description, status, currentVersion, color, statistics }: NamespaceCardProps) {
  const statusConfig = {
    active: { color: 'success', label: 'Active' },
    maintenance: { color: 'warning', label: 'Maintenance' },
    archived: { color: 'error', label: 'Archived' },
  } as const;
  
  const config = statusConfig[status];
  
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" fontWeight="bold" sx={{ color }}>
            {name}
          </Typography>
          <Chip 
            label={config.label} 
            color={config.color} 
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Version {currentVersion}
        </Typography>
        
        <Stack direction="row" spacing={2} mb={2}>
          <Box textAlign="center">
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {statistics.elements + statistics.concepts}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Items
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {statistics.translations}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Languages
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {statistics.contributors}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Contributors
            </Typography>
          </Box>
        </Stack>
        
        <Button 
          variant="outlined" 
          size="small" 
          fullWidth
          component={Link}
          href={`/dashboard/${slug}`}
        >
          Manage Namespace
        </Button>
      </CardContent>
    </Card>
  );
}

export function RGNamespacesPage() {
  // In production, this would get the actual review groups from context
  const userNamespaces = getNamespacesByReviewGroup('isbd');

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Namespaces
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage vocabularies and namespaces under your review group
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {userNamespaces.map((namespace) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={namespace.id}>
            <NamespaceCard {...namespace} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}