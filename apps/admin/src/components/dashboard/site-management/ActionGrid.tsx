'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  ElectricBolt,
  Computer,
  Build,
  Link as LinkIcon,
  Description as FileText,
} from '@mui/icons-material';

export interface ManagementAction {
  id: string;
  title: string;
  description: string;
  type: 'github-cli' | 'codespaces' | 'internal' | 'external';
  disabled?: boolean;
  requiredRole?: 'superadmin' | 'namespace-admin' | 'namespace-editor';
}

interface ActionGridProps {
  actions: ManagementAction[];
  isSuperAdmin?: boolean;
}

export function ActionGrid({ actions, isSuperAdmin }: ActionGridProps) {
  const getActionTypeIcon = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli':
        return <ElectricBolt />;
      case 'codespaces':
        return <Computer />;
      case 'internal':
        return <Build />;
      case 'external':
        return <LinkIcon />;
      default:
        return <FileText />;
    }
  };

  const getActionTypeLabel = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli':
        return 'GitHub CLI';
      case 'codespaces':
        return 'Codespaces';
      case 'internal':
        return 'Internal Tool';
      case 'external':
        return 'External Link';
      default:
        return 'Action';
    }
  };

  const canAccessAction = (action: ManagementAction) => {
    if (!action.requiredRole) return true;
    return action.requiredRole === 'superadmin' ? isSuperAdmin : true;
  };

  return (
    <Grid container spacing={3}>
      {actions.map((action) => {
        const hasAccess = canAccessAction(action);
        return (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={action.id}>
            <Card 
              sx={{ height: '100%', opacity: hasAccess ? 1 : 0.6 }}
              role="article"
              aria-labelledby={`action-${action.id}-title`}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box aria-hidden="true">
                    {getActionTypeIcon(action.type)}
                  </Box>
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      id={`action-${action.id}-title`}
                      component="h3"
                    >
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {action.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!hasAccess || action.disabled !== false}
                        aria-label={`${action.title}: ${!hasAccess ? 'Superadmin Only' : action.disabled !== false ? 'Coming Soon' : 'Run Action'}`}
                        sx={{ minHeight: 36 }}
                      >
                        {!hasAccess ? 'Superadmin Only' : action.disabled !== false ? 'Coming Soon' : 'Run Action'}
                      </Button>
                      <Chip 
                        label={getActionTypeLabel(action.type)} 
                        size="small" 
                        variant="outlined"
                        aria-label={`Action type: ${getActionTypeLabel(action.type)}`}
                      />
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}