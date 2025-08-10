'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

interface SiteVocabularyEditPageProps {
  siteKey: string;
  vocabularyId: string;
}

interface Vocabulary {
  id: string;
  name: string;
  description: string;
  namespaceUri: string;
  prefix: string;
}

export function SiteVocabularyEditPage({ siteKey, vocabularyId }: SiteVocabularyEditPageProps) {
  const router = useRouter();

  // Mock data fetching - replace with actual API call
  const { data: vocabulary, isLoading, error } = useQuery({
    queryKey: ['vocabulary', siteKey, vocabularyId],
    queryFn: async (): Promise<Vocabulary> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock vocabulary data
      return {
        id: vocabularyId,
        name: 'Content Types',
        description: 'Controlled vocabulary for content type classifications',
        namespaceUri: `http://iflastandards.info/ns/${siteKey}/content-types/`,
        prefix: `${siteKey}-ct`,
      };
    },
  });

  const handleCancel = () => {
    router.push(`/dashboard/${siteKey}/content/vocabularies`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement vocabulary update logic
    console.log('Updating vocabulary:', vocabularyId, 'for site:', siteKey);
    // After successful update, redirect back to vocabularies list
    router.push(`/dashboard/${siteKey}/content/vocabularies`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vocabulary) {
    return (
      <Alert severity="error">
        <Typography variant="h6">Error Loading Vocabulary</Typography>
        <Typography variant="body2">
          Unable to load vocabulary {vocabularyId} for site {siteKey}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Edit Vocabulary: {vocabulary.name}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Modify vocabulary settings for {siteKey.toUpperCase()}
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This is a placeholder form. In the full implementation, this would connect to the vocabulary management system.
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Vocabulary Name"
                required
                fullWidth
                defaultValue={vocabulary.name}
              />
              
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                defaultValue={vocabulary.description}
              />
              
              <TextField
                label="Namespace URI"
                fullWidth
                defaultValue={vocabulary.namespaceUri}
              />
              
              <TextField
                label="Prefix"
                fullWidth
                defaultValue={vocabulary.prefix}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}