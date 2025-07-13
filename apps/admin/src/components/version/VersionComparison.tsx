'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  ArrowForward as ArrowIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface Version {
  id: string;
  version: string;
  status: string;
  createdDate: string;
  author: string;
  description: string;
  changelog: ChangelogEntry[];
  fileCount: number;
  conceptCount: number;
  propertyCount: number;
}

interface ChangelogEntry {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  impact?: 'breaking' | 'minor' | 'patch';
}

interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'removed';
  linesAdded: number;
  linesRemoved: number;
  preview?: string;
}

interface ConceptDiff {
  conceptId: string;
  label: string;
  status: 'added' | 'modified' | 'removed';
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

interface VersionComparisonProps {
  version1: Version;
  version2: Version;
  onClose?: () => void;
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function VersionComparison({
  version1,
  version2,
  onClose,
}: VersionComparisonProps) {
  const [tabValue, setTabValue] = useState(0);

  // Mock data for demonstration
  const fileDiffs: FileDiff[] = [
    {
      path: 'vocabulary/elements.ttl',
      status: 'modified',
      linesAdded: 23,
      linesRemoved: 8,
      preview: 'Added new elements for digital resources...'
    },
    {
      path: 'vocabulary/areas.ttl',
      status: 'modified',
      linesAdded: 5,
      linesRemoved: 2,
      preview: 'Updated area 7 definitions...'
    },
    {
      path: 'vocabulary/deprecated.ttl',
      status: 'added',
      linesAdded: 15,
      linesRemoved: 0,
      preview: 'Added deprecated concepts list...'
    }
  ];

  const conceptDiffs: ConceptDiff[] = [
    {
      conceptId: 'isbd:P1001',
      label: 'Title proper',
      status: 'modified',
      changes: [
        {
          field: 'definition',
          oldValue: 'The chief name of a resource...',
          newValue: 'The main title of a resource, including any alternative title...'
        }
      ]
    },
    {
      conceptId: 'isbd:P1025',
      label: 'Digital representation',
      status: 'added',
      changes: []
    },
    {
      conceptId: 'isbd:P1010_old',
      label: 'Obsolete element',
      status: 'removed',
      changes: []
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <AddIcon color="success" />;
      case 'removed':
        return <RemoveIcon color="error" />;
      case 'modified':
        return <EditIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'info' | 'warning' => {
    switch (status) {
      case 'added':
        return 'success';
      case 'removed':
        return 'error';
      case 'modified':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getChangeTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (type) {
      case 'added':
        return 'success';
      case 'changed':
        return 'info';
      case 'deprecated':
        return 'warning';
      case 'removed':
        return 'error';
      case 'fixed':
        return 'primary';
      case 'security':
        return 'error';
      default:
        return 'default';
    }
  };

  const getImpactColor = (impact?: string): 'error' | 'warning' | 'info' => {
    switch (impact) {
      case 'breaking':
        return 'error';
      case 'minor':
        return 'warning';
      case 'patch':
        return 'info';
      default:
        return 'info';
    }
  };

  const totalChanges = fileDiffs.length + conceptDiffs.length;
  const additionsCount = [...fileDiffs, ...conceptDiffs].filter(item => item.status === 'added').length;
  const modificationsCount = [...fileDiffs, ...conceptDiffs].filter(item => item.status === 'modified').length;
  const removalsCount = [...fileDiffs, ...conceptDiffs].filter(item => item.status === 'removed').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Version Comparison
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={`v${version1.version}`} 
              color="primary" 
              variant="outlined"
            />
            <ArrowIcon color="action" />
            <Chip 
              label={`v${version2.version}`} 
              color="secondary" 
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button startIcon={<DownloadIcon />} variant="outlined" size="small">
            Export Diff
          </Button>
          <Button startIcon={<ShareIcon />} variant="outlined" size="small">
            Share
          </Button>
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="text.primary">
                {totalChanges}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Changes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                +{additionsCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Additions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">
                ~{modificationsCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Modifications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="error.main">
                -{removalsCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Removals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Version Details */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Version {version1.version}
              </Typography>
              <Box component="dl" sx={{ '& dt': { fontWeight: 'medium' }, '& dd': { ml: 0, mb: 1 } }}>
                <Box component="dt">Status:</Box>
                <Box component="dd">
                  <Chip label={version1.status} size="small" />
                </Box>
                
                <Box component="dt">Author:</Box>
                <Box component="dd">{version1.author}</Box>
                
                <Box component="dt">Date:</Box>
                <Box component="dd">{new Date(version1.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Box>
                
                <Box component="dt">Files:</Box>
                <Box component="dd">{version1.fileCount}</Box>
                
                <Box component="dt">Concepts:</Box>
                <Box component="dd">{version1.conceptCount}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="secondary">
                Version {version2.version}
              </Typography>
              <Box component="dl" sx={{ '& dt': { fontWeight: 'medium' }, '& dd': { ml: 0, mb: 1 } }}>
                <Box component="dt">Status:</Box>
                <Box component="dd">
                  <Chip label={version2.status} size="small" />
                </Box>
                
                <Box component="dt">Author:</Box>
                <Box component="dd">{version2.author}</Box>
                
                <Box component="dt">Date:</Box>
                <Box component="dd">{new Date(version2.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Box>
                
                <Box component="dt">Files:</Box>
                <Box component="dd">{version2.fileCount}</Box>
                
                <Box component="dt">Concepts:</Box>
                <Box component="dd">{version2.conceptCount}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label={`Changelog (${version2.changelog.length})`} />
            <Tab label={`Files (${fileDiffs.length})`} />
            <Tab label={`Concepts (${conceptDiffs.length})`} />
            <Tab label="Summary" />
          </Tabs>
        </Box>

        {/* Changelog Tab */}
        <TabPanel value={tabValue} index={0}>
          <List>
            {version2.changelog.map((entry, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Chip
                    label={entry.type}
                    size="small"
                    color={getChangeTypeColor(entry.type)}
                    variant="outlined"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={entry.description}
                  secondary={entry.impact && (
                    <Chip 
                      label={`${entry.impact} change`}
                      size="small"
                      color={getImpactColor(entry.impact)}
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Files Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Changes</TableCell>
                  <TableCell>Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fileDiffs.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {file.path}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(file.status)}
                        <Chip
                          label={file.status}
                          size="small"
                          color={getStatusColor(file.status)}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {file.linesAdded > 0 && (
                          <Typography variant="caption" color="success.main">
                            +{file.linesAdded}
                          </Typography>
                        )}
                        {file.linesAdded > 0 && file.linesRemoved > 0 && ' / '}
                        {file.linesRemoved > 0 && (
                          <Typography variant="caption" color="error.main">
                            -{file.linesRemoved}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {file.preview}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Concepts Tab */}
        <TabPanel value={tabValue} index={2}>
          <List>
            {conceptDiffs.map((concept, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getStatusIcon(concept.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {concept.conceptId}
                      </Typography>
                      <Typography variant="body2">
                        {concept.label}
                      </Typography>
                      <Chip
                        label={concept.status}
                        size="small"
                        color={getStatusColor(concept.status)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    concept.changes && concept.changes.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {concept.changes.map((change, changeIndex) => (
                          <Box key={changeIndex} sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              <strong>{change.field}:</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Paper variant="outlined" sx={{ p: 1, bgcolor: 'error.50', maxWidth: 200 }}>
                                <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                                  {change.oldValue}
                                </Typography>
                              </Paper>
                              <ArrowIcon fontSize="small" />
                              <Paper variant="outlined" sx={{ p: 1, bgcolor: 'success.50', maxWidth: 200 }}>
                                <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                                  {change.newValue}
                                </Typography>
                              </Paper>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Summary Tab */}
        <TabPanel value={tabValue} index={3}>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Compatibility:</strong> This version contains {modificationsCount} modifications and {removalsCount} removals. 
                Review breaking changes before upgrading.
              </Typography>
            </Alert>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Key Changes
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Enhanced digital resource support" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Improved area 7 definitions" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Deprecated legacy elements (migration guide available)" />
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Migration Notes
              </Typography>
              <Typography variant="body2" paragraph>
                • Update references to deprecated elements
              </Typography>
              <Typography variant="body2" paragraph>
                • Review digital resource mappings
              </Typography>
              <Typography variant="body2" paragraph>
                • Test validation rules with new constraints
              </Typography>
            </Box>
          </Stack>
        </TabPanel>
      </Card>
    </Box>
  );
}