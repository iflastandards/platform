'use client';

import React from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Stack, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import Link from 'next/link';
import { ActionGrid, ManagementAction } from './ActionGrid';

interface SiteVocabulariesPageProps {
  siteKey: string;
}

const vocabularyActions: ManagementAction[] = [
  {
    id: 'import-vocabulary',
    title: 'Import Vocabulary',
    description: 'Import vocabulary data from CSV or RDF files',
    type: 'github-cli',
  },
  {
    id: 'export-vocabulary',
    title: 'Export Vocabulary',
    description: 'Export vocabulary data to various formats',
    type: 'github-cli',
  },
  {
    id: 'validate-vocabulary',
    title: 'Validate Vocabulary',
    description: 'Check vocabulary consistency and completeness',
    type: 'github-cli',
  },
];

// Mock vocabulary data - replace with actual API call
const mockVocabularies = [
  {
    id: 'content-types',
    name: 'Content Types',
    description: 'Controlled vocabulary for content type classifications',
    termCount: 15,
    status: 'active' as const,
  },
  {
    id: 'media-types',
    name: 'Media Types',
    description: 'Classification of media and carrier types',
    termCount: 23,
    status: 'draft' as const,
  },
  {
    id: 'audience-levels',
    name: 'Audience Levels',
    description: 'Target audience classification terms',
    termCount: 8,
    status: 'active' as const,
  },
];

export function SiteVocabulariesPage({ siteKey }: SiteVocabulariesPageProps) {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom component="h1">
            Vocabularies
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage controlled vocabularies and terminology for {siteKey.toUpperCase()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          href={`/dashboard/${siteKey}/content/vocabularies/new`}
        >
          Create Vocabulary
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Existing Vocabularies
          </Typography>
          <List>
            {mockVocabularies.map((vocab, index) => (
              <React.Fragment key={vocab.id}>
                <ListItem>
                  <ListItemText
                    primary={vocab.name}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          {vocab.description}
                        </Typography>
                        <Chip 
                          label={`${vocab.termCount} terms`} 
                          size="small" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={vocab.status} 
                          size="small" 
                          color={vocab.status === 'active' ? 'success' : 'warning'}
                        />
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        edge="end"
                        aria-label={`Edit ${vocab.name}`}
                        component={Link}
                        href={`/dashboard/${siteKey}/content/vocabularies/${vocab.id}/edit`}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label={`Delete ${vocab.name}`}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < mockVocabularies.length - 1 && <Box component="hr" sx={{ border: 'none', borderTop: 1, borderColor: 'divider', my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Vocabulary Management Tools
      </Typography>
      <ActionGrid actions={vocabularyActions} />
    </Box>
  );
}
