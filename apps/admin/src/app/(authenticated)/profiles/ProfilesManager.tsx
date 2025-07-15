'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  Tabs,
  Tab,
  Divider,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface DCTAPProfile {
  id: string;
  name: string;
  description: string;
  namespace: string;
  version: string;
  status: 'draft' | 'active' | 'deprecated';
  author: string;
  lastModified: string;
  properties: DCTAPProperty[];
  usageCount: number;
}

interface DCTAPProperty {
  id: string;
  propertyLabel: string;
  propertyID?: string;
  mandatory?: 'true' | 'false';
  repeatable?: 'true' | 'false';
  valueNodeType?: 'IRI' | 'Literal' | 'BlankNode';
  valueDataType?: string;
  valueConstraint?: string;
  valueShape?: string;
  note?: string;
}

interface ProfilesManagerProps {
  userRoles: string[];
  userName?: string;
  userEmail?: string;
}

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilesManager({
  userRoles: _userRoles,
  userName: _userName,
  userEmail: _userEmail,
}: ProfilesManagerProps) {
  const _router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [profiles, setProfiles] = useState<DCTAPProfile[]>([
    {
      id: 'profile-1',
      name: 'Standard Vocabulary Profile',
      description: 'Default DCTAP profile for general vocabulary validation',
      namespace: 'https://iflastandards.info/ns/dctap/standard',
      version: '1.0.0',
      status: 'active',
      author: 'IFLA Standards',
      lastModified: '2024-01-15T10:30:00Z',
      usageCount: 45,
      properties: [
        {
          id: 'prop-1',
          propertyLabel: 'Identifier',
          propertyID: 'dcterms:identifier',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'Literal',
          valueDataType: 'xsd:string',
          note: 'Unique identifier for the concept',
        },
        {
          id: 'prop-2',
          propertyLabel: 'Preferred Label',
          propertyID: 'skos:prefLabel',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'Literal',
          valueDataType: 'rdf:langString',
          note: 'Primary label for the concept',
        },
        {
          id: 'prop-3',
          propertyLabel: 'Definition',
          propertyID: 'skos:definition',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'Literal',
          valueDataType: 'rdf:langString',
          note: 'Precise definition of the concept',
        },
      ],
    },
    {
      id: 'profile-2',
      name: 'ISBD Elements Profile',
      description: 'DCTAP profile specifically for ISBD element validation',
      namespace: 'https://iflastandards.info/ns/isbd',
      version: '2.1.0',
      status: 'active',
      author: 'ISBD Review Group',
      lastModified: '2024-02-01T14:20:00Z',
      usageCount: 23,
      properties: [
        {
          id: 'prop-4',
          propertyLabel: 'ISBD Element',
          propertyID: 'isbd:element',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'IRI',
          note: 'ISBD element reference',
        },
        {
          id: 'prop-5',
          propertyLabel: 'Area',
          propertyID: 'isbd:area',
          mandatory: 'true',
          repeatable: 'false',
          valueNodeType: 'Literal',
          valueConstraint: '[0-8]',
          note: 'ISBD area number (0-8)',
        },
      ],
    },
    {
      id: 'profile-3',
      name: 'LRM Entities Profile',
      description: 'Profile for Library Reference Model entity definitions',
      namespace: 'https://iflastandards.info/ns/lrm',
      version: '1.0.2',
      status: 'draft',
      author: 'BCM Working Group',
      lastModified: '2024-01-28T09:15:00Z',
      usageCount: 8,
      properties: [],
    },
  ]);

  const [selectedProfile, setSelectedProfile] = useState<DCTAPProfile | null>(
    null,
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>(
    'create',
  );

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    profile: DCTAPProfile,
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProfile(profile);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProfile(null);
  };

  const handleCreateProfile = () => {
    setDialogMode('create');
    setSelectedProfile(null);
    setDialogOpen(true);
  };

  const handleEditProfile = (profile: DCTAPProfile) => {
    setDialogMode('edit');
    setSelectedProfile(profile);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleViewProfile = (profile: DCTAPProfile) => {
    setDialogMode('view');
    setSelectedProfile(profile);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteProfile = (profile: DCTAPProfile) => {
    setProfiles(profiles.filter((p) => p.id !== profile.id));
    handleMenuClose();
  };

  const getStatusColor = (
    status: string,
  ): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'deprecated':
        return 'error';
      default:
        return 'default';
    }
  };

  const activeProfiles = profiles.filter((p) => p.status === 'active');
  const draftProfiles = profiles.filter((p) => p.status === 'draft');
  const _deprecatedProfiles = profiles.filter((p) => p.status === 'deprecated');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              DCTAP Profiles
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage Dublin Core Tabular Application Profiles for vocabulary
              validation
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button startIcon={<UploadIcon />} variant="outlined" size="small">
              Import
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={handleCreateProfile}
            >
              Create Profile
            </Button>
          </Stack>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          DCTAP profiles define the structure and validation rules for
          vocabulary data import and validation.
        </Alert>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {profiles.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Profiles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {activeProfiles.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {draftProfiles.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drafts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {profiles.reduce((sum, p) => sum + p.usageCount, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Usage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
          >
            <Tab label={`All Profiles (${profiles.length})`} />
            <Tab label={`Active (${activeProfiles.length})`} />
            <Tab label={`Drafts (${draftProfiles.length})`} />
          </Tabs>
        </Box>

        {/* All Profiles Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Namespace</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Last Modified</TableCell>
                  <TableCell width={60}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {profile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {profile.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {profile.namespace}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={profile.version}
                        size="small"
                        variant="outlined"
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={profile.status}
                        size="small"
                        color={getStatusColor(profile.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {profile.usageCount} imports
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(profile.lastModified).toLocaleDateString(
                          'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' },
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, profile)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Active Profiles Tab */}
        <TabPanel value={tabValue} index={1}>
          <List>
            {activeProfiles.map((profile) => (
              <ListItem key={profile.id}>
                <ListItemText
                  primary={profile.name}
                  secondary={`${profile.description} • ${profile.properties.length} properties`}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={(e) => handleMenuClick(e, profile)}>
                    <MoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Draft Profiles Tab */}
        <TabPanel value={tabValue} index={2}>
          <List>
            {draftProfiles.map((profile) => (
              <ListItem key={profile.id}>
                <ListItemText
                  primary={profile.name}
                  secondary={`${profile.description} • ${profile.properties.length} properties`}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={(e) => handleMenuClick(e, profile)}>
                    <MoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => selectedProfile && handleViewProfile(selectedProfile)}
        >
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => selectedProfile && handleEditProfile(selectedProfile)}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem>
          <CopyIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() =>
            selectedProfile && handleDeleteProfile(selectedProfile)
          }
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Profile Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' && 'Create New DCTAP Profile'}
          {dialogMode === 'edit' && 'Edit DCTAP Profile'}
          {dialogMode === 'view' && 'Profile Details'}
        </DialogTitle>
        <DialogContent>
          {(dialogMode === 'create' || dialogMode === 'edit') && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Profile Name"
                fullWidth
                defaultValue={selectedProfile?.name || ''}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                defaultValue={selectedProfile?.description || ''}
              />
              <TextField
                label="Namespace"
                fullWidth
                defaultValue={
                  selectedProfile?.namespace || 'https://iflastandards.info/ns/'
                }
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Version"
                    fullWidth
                    defaultValue={selectedProfile?.version || '1.0.0'}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      defaultValue={selectedProfile?.status || 'draft'}
                      label="Status"
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="deprecated">Deprecated</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Stack>
          )}

          {dialogMode === 'view' && selectedProfile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedProfile.name}
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedProfile.description}
              </Typography>

              <Box
                component="dl"
                sx={{
                  '& dt': { fontWeight: 'medium' },
                  '& dd': { ml: 0, mb: 1 },
                }}
              >
                <Box component="dt">Namespace:</Box>
                <Box component="dd" sx={{ fontFamily: 'monospace' }}>
                  {selectedProfile.namespace}
                </Box>

                <Box component="dt">Version:</Box>
                <Box component="dd">{selectedProfile.version}</Box>

                <Box component="dt">Status:</Box>
                <Box component="dd">
                  <Chip
                    label={selectedProfile.status}
                    size="small"
                    color={getStatusColor(selectedProfile.status)}
                  />
                </Box>

                <Box component="dt">Properties:</Box>
                <Box component="dd">
                  {selectedProfile.properties.length} defined
                </Box>

                <Box component="dt">Usage:</Box>
                <Box component="dd">{selectedProfile.usageCount} imports</Box>
              </Box>

              {selectedProfile.properties.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Properties
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Property Label</TableCell>
                          <TableCell>Property ID</TableCell>
                          <TableCell>Mandatory</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedProfile.properties.map((prop) => (
                          <TableRow key={prop.id}>
                            <TableCell>{prop.propertyLabel}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {prop.propertyID}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  prop.mandatory === 'true'
                                    ? 'Required'
                                    : 'Optional'
                                }
                                size="small"
                                color={
                                  prop.mandatory === 'true'
                                    ? 'error'
                                    : 'default'
                                }
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{prop.valueNodeType}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {(dialogMode === 'create' || dialogMode === 'edit') && (
            <Button variant="contained">
              {dialogMode === 'create' ? 'Create' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
