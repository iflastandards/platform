'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export function ImportExportPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Import/Export Tools
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Vocabulary Management</AlertTitle>
        Import vocabularies from spreadsheets or export them for external editing and review.
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Vocabulary
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Import vocabulary from CSV, Excel, or Google Sheets
              </Typography>
              <Button
                component={Link}
                href="/import"
                variant="contained"
                startIcon={<ImportIcon />}
                fullWidth
              >
                Start Import
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export to Sheets
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export vocabulary to Google Sheets for collaborative editing
              </Typography>
              <Button
                component={Link}
                href="/export"
                variant="contained"
                startIcon={<ExportIcon />}
                fullWidth
              >
                Start Export
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Import/Export Activities
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent activities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}