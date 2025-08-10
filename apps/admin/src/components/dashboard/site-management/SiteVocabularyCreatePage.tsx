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
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface SiteVocabularyCreatePageProps {
  siteKey: string;
}

export function SiteVocabularyCreatePage({ siteKey }: SiteVocabularyCreatePageProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.push(`/dashboard/${siteKey}/content/vocabularies`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement vocabulary creation logic
    console.log('Creating vocabulary for site:', siteKey);
    // After successful creation, redirect back to vocabularies list
    router.push(`/dashboard/${siteKey}/content/vocabularies`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Create New Vocabulary
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Add a new controlled vocabulary for {siteKey.toUpperCase()}
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
                placeholder="e.g., Content Types"
              />
              
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                placeholder="Describe the purpose and scope of this vocabulary"
              />
              
              <TextField
                label="Namespace URI"
                fullWidth
                placeholder="e.g., http://iflastandards.info/ns/isbd/content-types/"
              />
              
              <TextField
                label="Prefix"
                fullWidth
                placeholder="e.g., isbd-ct"
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Create Vocabulary
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}