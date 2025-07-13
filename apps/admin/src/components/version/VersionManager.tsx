'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Tag as TagIcon,
  Publish as PublishIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Version {
  id: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'deprecated';
  createdDate: string;
  publishedDate?: string;
  author: string;
  description: string;
  changelog: ChangelogEntry[];
  downloadCount: number;
  filesCount: number;
  branch?: string;
  commitSha?: string;
  preRelease: boolean;
}

interface ChangelogEntry {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  issues?: string[];
}

interface VersionManagerProps {
  namespace: string;
  versions: Version[];
  currentVersion?: string;
  onCreateVersion?: (version: Partial<Version>) => void;
  onPublishVersion?: (version: Version) => void;
  onDeprecateVersion?: (version: Version) => void;
  onCompareVersions?: (v1: Version, v2: Version) => void;
}

export default function VersionManager({
  namespace,
  versions,
  currentVersion,
  onCreateVersion,
  onPublishVersion,
  onCompareVersions,
}: VersionManagerProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [activeStep] = useState(0);

  const [newVersion, setNewVersion] = useState({
    version: '',
    description: '',
    preRelease: false,
    changelog: [] as ChangelogEntry[],
  });

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'published':
        return 'success';
      case 'approved':
        return 'info';
      case 'review':
        return 'warning';
      case 'deprecated':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
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

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <AddIcon fontSize="small" />;
      case 'changed':
        return <EditIcon fontSize="small" />;
      case 'deprecated':
        return <WarningIcon fontSize="small" />;
      case 'removed':
        return <DeleteIcon fontSize="small" />;
      case 'fixed':
        return <CheckIcon fontSize="small" />;
      case 'security':
        return <ErrorIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const handleVersionSelection = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handleCompareSelected = () => {
    if (selectedVersions.length === 2) {
      const v1 = versions.find(v => v.id === selectedVersions[0]);
      const v2 = versions.find(v => v.id === selectedVersions[1]);
      if (v1 && v2) {
        onCompareVersions?.(v1, v2);
      }
    }
  };

  const handleCreateVersion = () => {
    onCreateVersion?.(newVersion);
    setCreateDialogOpen(false);
    setNewVersion({
      version: '',
      description: '',
      preRelease: false,
      changelog: [],
    });
  };

  const handlePublishVersion = () => {
    if (selectedVersion) {
      onPublishVersion?.(selectedVersion);
      setPublishDialogOpen(false);
      setSelectedVersion(null);
    }
  };

  const publishSteps = [
    'Pre-publish Validation',
    'Generate Release Notes',
    'Create GitHub Release',
    'Update Documentation',
    'Notify Stakeholders',
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Version Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {namespace} • {versions.length} versions
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          {selectedVersions.length === 2 && (
            <Button
              startIcon={<CompareIcon />}
              variant="outlined"
              onClick={handleCompareSelected}
            >
              Compare Selected
            </Button>
          )}
          <Button
            startIcon={<TagIcon />}
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Version
          </Button>
        </Stack>
      </Box>

      {/* Current Version Alert */}
      {currentVersion && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Current Published Version:</strong> {currentVersion}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Versions Table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Versions
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox"></TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Downloads</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versions.map((version) => (
                      <TableRow 
                        key={version.id}
                        selected={selectedVersions.includes(version.id)}
                        hover
                      >
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={selectedVersions.includes(version.id)}
                            onChange={() => handleVersionSelection(version.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {version.version}
                            </Typography>
                            {version.preRelease && (
                              <Chip label="Pre-release" size="small" variant="outlined" />
                            )}
                            {version.version === currentVersion && (
                              <Chip label="Current" size="small" color="success" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={version.status}
                            size="small"
                            color={getStatusColor(version.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {version.author}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(version.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {version.downloadCount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {version.status === 'approved' && (
                              <Tooltip title="Publish Version">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedVersion(version);
                                    setPublishDialogOpen(true);
                                  }}
                                >
                                  <PublishIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Download">
                              <IconButton size="small">
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Releases */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Releases
              </Typography>
              
              <List>
                {versions
                  .filter(v => v.status === 'published')
                  .sort((a, b) => new Date(b.publishedDate || b.createdDate).getTime() - new Date(a.publishedDate || a.createdDate).getTime())
                  .slice(0, 5)
                  .map((version) => (
                    <ListItem key={version.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Chip
                          icon={<TagIcon />}
                          label={version.version}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={version.description}
                        secondary={new Date(version.publishedDate || version.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Version Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Version</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Version Number"
              placeholder="e.g., 1.2.0"
              value={newVersion.version}
              onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
              fullWidth
              helperText="Follow semantic versioning (MAJOR.MINOR.PATCH)"
            />
            
            <TextField
              label="Description"
              multiline
              rows={3}
              value={newVersion.description}
              onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
              fullWidth
              placeholder="Brief description of changes in this version"
            />
            
            <FormControl>
              <label>
                <input
                  type="checkbox"
                  checked={newVersion.preRelease}
                  onChange={(e) => setNewVersion({ ...newVersion, preRelease: e.target.checked })}
                />
                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                  Mark as pre-release
                </Typography>
              </label>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Changelog (Optional)
              </Typography>
              <Alert severity="info">
                Changelog will be automatically generated from recent commits and issues.
              </Alert>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateVersion}>
            Create Version
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish Version Dialog */}
      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Publish Version {selectedVersion?.version}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Publishing will make this version available to the public and update all documentation.
            </Typography>

            <Stepper activeStep={activeStep} orientation="vertical">
              {publishSteps.map((step, index) => (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {index === 0 && (
                        <Typography variant="body2">
                          Validating vocabulary files and ensuring all requirements are met...
                        </Typography>
                      )}
                      {index === 1 && (
                        <Typography variant="body2">
                          Generating release notes from changelog and recent commits...
                        </Typography>
                      )}
                      {index === 2 && (
                        <Typography variant="body2">
                          Creating GitHub release with downloadable assets...
                        </Typography>
                      )}
                      {index === 3 && (
                        <Typography variant="body2">
                          Updating documentation and API references...
                        </Typography>
                      )}
                      {index === 4 && (
                        <Typography variant="body2">
                          Sending notifications to subscribers and stakeholders...
                        </Typography>
                      )}
                      <LinearProgress sx={{ mt: 1 }} />
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {selectedVersion && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Changelog
                </Typography>
                <List dense>
                  {selectedVersion.changelog.map((entry, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Chip
                          icon={getChangeTypeIcon(entry.type)}
                          label={entry.type}
                          size="small"
                          color={getChangeTypeColor(entry.type)}
                          variant="outlined"
                        />
                      </ListItemIcon>
                      <ListItemText primary={entry.description} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handlePublishVersion}>
            Publish Version
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}