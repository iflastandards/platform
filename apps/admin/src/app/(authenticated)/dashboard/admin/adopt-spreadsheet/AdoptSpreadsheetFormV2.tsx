'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  IconButton,
  Checkbox,
  FormGroup,
  Divider,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { addBasePath } from '@ifla/theme/utils';

interface AdoptSpreadsheetFormProps {
  userId: string;
  userName?: string;
  userEmail?: string;
}

// Simplified analysis - just basic sheet info
interface BasicSheetInfo {
  sheetId: string;
  sheetName: string;
  worksheets: {
    name: string;
    headers?: string[]; // First row if available
  }[];
}

// Comprehensive metadata for the "birth certificate"
interface SpreadsheetMetadata {
  // Basic info
  spreadsheetUrl: string;
  spreadsheetName: string;
  namespace: string;
  
  // Export info (who created this spreadsheet)
  exportedBy: string;
  exportedAt: string;
  exportReason?: string;
  
  // Content type
  contentType: 'element-sets' | 'concept-schemes';
  
  // Worksheets to import
  worksheets: {
    name: string;
    type: 'element-set' | 'concept-scheme' | 'index' | 'dctap' | 'skip';
    elementSetName?: string; // For element-set worksheets
    conceptSchemeName?: string; // For concept-scheme worksheets
  }[];
  
  // Languages
  languages: string[];
  primaryLanguage: string;
  
  // DCTAP info
  dctapUsed?: string; // Reference to DCTAP if known
  dctapEmbedded: boolean; // Is DCTAP in the spreadsheet?
  
  // Project assignment
  projectId?: string;
  projectName?: string;
  reviewGroup?: string;
  
  // Additional notes
  notes?: string;
}

interface Project {
  id: string;
  name: string;
  reviewGroup: string;
  namespaces: string[];
}

const steps = ['Connect Spreadsheet', 'Basic Info', 'Content Details', 'Languages & DCTAP', 'Project & Submit'];

// Mock data
const mockNamespaces = [
  { id: 'isbd', name: 'ISBD' },
  { id: 'isbdm', name: 'ISBD Manifestation' },
  { id: 'lrm', name: 'LRM' },
  { id: 'frbr', name: 'FRBR' },
  { id: 'unimarc', name: 'UNIMARC' },
  { id: 'muldicat', name: 'MulDiCat' },
];

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'ISBD Consolidation 2025',
    reviewGroup: 'isbd-review-group',
    namespaces: ['isbd', 'isbdm'],
  },
  {
    id: 'project-2',
    name: 'LRM Update 2024',
    reviewGroup: 'bcm-review-group',
    namespaces: ['lrm', 'frbr'],
  },
];

const mockReviewGroups = [
  { value: 'isbd-review-group', label: 'ISBD Review Group' },
  { value: 'bcm-review-group', label: 'BCM Review Group' },
  { value: 'cat-review-group', label: 'CAT Review Group' },
  { value: 'unimarc-review-group', label: 'UNIMARC Review Group' },
];

const commonLanguages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
];

export default function AdoptSpreadsheetFormV2({ 
  userId: _userId, 
  userName,
}: AdoptSpreadsheetFormProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Basic sheet info from initial fetch
  const [basicInfo, setBasicInfo] = useState<BasicSheetInfo | null>(null);
  
  // Form state - the "birth certificate"
  const [metadata, setMetadata] = useState<SpreadsheetMetadata>({
    spreadsheetUrl: '',
    spreadsheetName: '',
    namespace: '',
    exportedBy: userName || '',
    exportedAt: new Date().toISOString().split('T')[0],
    exportReason: '',
    contentType: 'element-sets',
    worksheets: [],
    languages: ['en'],
    primaryLanguage: 'en',
    dctapEmbedded: false,
    notes: '',
  });

  // Project assignment
  const [projectMode, setProjectMode] = useState<'existing' | 'create'>('existing');

  // Basic spreadsheet fetch - just to get sheet names
  const fetchBasicInfo = async () => {
    if (!metadata.spreadsheetUrl) {
      setError('Please enter a spreadsheet URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Extract sheet ID from URL
      const match = metadata.spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error('Invalid Google Sheets URL format');
      }
      
      // Try to get basic info from API
      const response = await fetch(
        addBasePath(`/api/admin/adopt-spreadsheet?action=basic-info&url=${encodeURIComponent(metadata.spreadsheetUrl)}`),
        { method: 'GET' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBasicInfo(data.data);
        
        // Pre-populate metadata with what we found
        setMetadata(prev => {
          // Try to detect worksheet types based on name
          const worksheets = data.data.worksheets.map((ws: { name: string; headers?: string[] }) => {
            const lowerName = ws.name.toLowerCase();
            let type: 'element-set' | 'concept-scheme' | 'index' | 'dctap' | 'skip' = 'skip';
            let elementSetName = '';
            let conceptSchemeName = '';
            
            if (lowerName === 'index') {
              type = 'index';
            } else if (lowerName.includes('element') || lowerName.includes('properties')) {
              type = 'element-set';
              // Extract element set name from sheet name
              elementSetName = ws.name;
            } else if (lowerName.includes('concept') || lowerName.includes('scheme') || lowerName.includes('vocabulary')) {
              type = 'concept-scheme';
              conceptSchemeName = ws.name;
            } else if (lowerName.includes('dctap') || lowerName.includes('profile')) {
              type = 'dctap';
            }
            
            return {
              name: ws.name,
              type,
              elementSetName,
              conceptSchemeName,
            };
          });
          
          // Auto-detect content type based on worksheets
          const hasElementSets = worksheets.some((ws: any) => ws.type === 'element-set');
          const hasConceptSchemes = worksheets.some((ws: any) => ws.type === 'concept-scheme');
          let contentType = prev.contentType;
          
          if (hasElementSets && !hasConceptSchemes) {
            contentType = 'element-sets';
          } else if (!hasElementSets && hasConceptSchemes) {
            contentType = 'concept-schemes';
          }
          
          return {
            ...prev,
            spreadsheetName: data.data.sheetName || prev.spreadsheetName,
            worksheets,
            contentType,
            // Set export date to today if not already set
            exportedAt: prev.exportedAt || new Date().toISOString().split('T')[0],
          };
        });
      } else {
        // If API fails, just use minimal info
        setBasicInfo({
          sheetId: match[1],
          sheetName: 'Unknown Spreadsheet',
          worksheets: [],
        });
      }
      
      // Move to next step after successful fetch
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spreadsheet info');
    } finally {
      setLoading(false);
    }
  };

  // Handle worksheet type change
  const updateWorksheetType = (index: number, type: string) => {
    setMetadata(prev => {
      const newWorksheets = [...prev.worksheets];
      newWorksheets[index] = {
        ...newWorksheets[index],
        type: type as 'element-set' | 'concept-scheme' | 'index' | 'dctap' | 'skip',
      };
      return { ...prev, worksheets: newWorksheets };
    });
  };

  // Handle worksheet name change
  const updateWorksheetName = (index: number, field: 'elementSetName' | 'conceptSchemeName', value: string) => {
    setMetadata(prev => {
      const newWorksheets = [...prev.worksheets];
      newWorksheets[index] = {
        ...newWorksheets[index],
        [field]: value,
      };
      return { ...prev, worksheets: newWorksheets };
    });
  };

  // Add/remove languages
  const toggleLanguage = (langCode: string) => {
    setMetadata(prev => {
      const langs = prev.languages.includes(langCode)
        ? prev.languages.filter(l => l !== langCode)
        : [...prev.languages, langCode];
      return { 
        ...prev, 
        languages: langs,
        // Update primary language if it was removed
        primaryLanguage: langs.includes(prev.primaryLanguage) ? prev.primaryLanguage : langs[0] || 'en'
      };
    });
  };

  // Handle final submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the adoption data
      const adoptionData = {
        ...metadata,
        projectId: projectMode === 'existing' ? metadata.projectId : undefined,
        projectName: projectMode === 'create' ? metadata.projectName : undefined,
        reviewGroup: projectMode === 'create' ? metadata.reviewGroup : undefined,
        userId: _userId,
        userName,
      };
      
      const response = await fetch(addBasePath('/api/admin/adopt-spreadsheet'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adoptionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adopt spreadsheet');
      }
      
      await response.json();
      setSuccess('Spreadsheet successfully adopted! Redirecting to import workflow...');
      
      // Redirect to import workflow after 2 seconds
      setTimeout(() => {
        router.push(addBasePath('/import'));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adopt spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Connect Spreadsheet
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Connect to Google Sheets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the Google Sheets URL to fetch spreadsheet information automatically.
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Google Sheets URL"
                value={metadata.spreadsheetUrl}
                onChange={(e) => setMetadata(prev => ({ ...prev, spreadsheetUrl: e.target.value }))}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                required
                helperText="Paste the full URL of your Google Sheets spreadsheet"
              />
              
              {basicInfo && (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  <Typography variant="subtitle2">Connected to: {basicInfo.sheetName}</Typography>
                  <Typography variant="body2">Found {basicInfo.worksheets.length} worksheets</Typography>
                </Alert>
              )}
            </Stack>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={fetchBasicInfo}
                disabled={!metadata.spreadsheetUrl || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {loading ? 'Connecting...' : 'Connect & Fetch Info'}
              </Button>
            </Box>
          </Box>
        );

      case 1: // Basic Info
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Provide basic information about when and why this spreadsheet was created.
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Spreadsheet Name"
                value={metadata.spreadsheetName}
                onChange={(e) => setMetadata(prev => ({ ...prev, spreadsheetName: e.target.value }))}
                helperText="A descriptive name for this spreadsheet"
                required
              />
              
              <FormControl fullWidth required>
                <InputLabel>Namespace</InputLabel>
                <Select
                  value={metadata.namespace}
                  onChange={(e) => setMetadata(prev => ({ ...prev, namespace: e.target.value }))}
                  label="Namespace"
                >
                  {mockNamespaces.map(ns => (
                    <MenuItem key={ns.id} value={ns.id}>
                      {ns.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Exported By"
                value={metadata.exportedBy}
                onChange={(e) => setMetadata(prev => ({ ...prev, exportedBy: e.target.value }))}
                helperText="Who created/exported this spreadsheet"
                required
              />
              
              <TextField
                fullWidth
                label="Export Date"
                type="date"
                value={metadata.exportedAt}
                onChange={(e) => setMetadata(prev => ({ ...prev, exportedAt: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
              
              <TextField
                fullWidth
                label="Export Reason"
                value={metadata.exportReason}
                onChange={(e) => setMetadata(prev => ({ ...prev, exportReason: e.target.value }))}
                multiline
                rows={2}
                helperText="Why was this spreadsheet created? (e.g., 'Initial vocabulary development', 'Translation work')"
              />
            </Stack>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(0)} startIcon={<ArrowBackIcon />}>
                Back
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setActiveStep(2)}
                disabled={!metadata.spreadsheetName || !metadata.namespace || !metadata.exportedBy}
              >
                Next: Content Details
              </Button>
            </Box>
          </Box>
        );

      case 2: // Content Details
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Content Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Specify what type of content is in this spreadsheet and configure each worksheet.
            </Typography>
            
            <Stack spacing={3}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Content Type
                </Typography>
                <RadioGroup
                  value={metadata.contentType}
                  onChange={(e) => setMetadata(prev => ({ ...prev, contentType: e.target.value as 'element-sets' | 'concept-schemes' }))}
                >
                  <FormControlLabel value="element-sets" control={<Radio />} label="Element Sets (Properties/Elements)" />
                  <FormControlLabel value="concept-schemes" control={<Radio />} label="Concept Schemes (Vocabularies/Terms)" />
                </RadioGroup>
              </FormControl>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Worksheets Configuration
                </Typography>
                {metadata.worksheets.length === 0 && basicInfo && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No worksheets detected. You can manually add them if needed.
                  </Alert>
                )}
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sheet Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Set/Scheme Name</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metadata.worksheets.map((ws, index) => (
                        <TableRow key={index}>
                          <TableCell>{ws.name}</TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={ws.type}
                              onChange={(e) => updateWorksheetType(index, e.target.value)}
                              fullWidth
                            >
                              <MenuItem value="skip">Skip</MenuItem>
                              <MenuItem value="element-set">Element Set</MenuItem>
                              <MenuItem value="concept-scheme">Concept Scheme</MenuItem>
                              <MenuItem value="index">Index</MenuItem>
                              <MenuItem value="dctap">DCTAP</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {ws.type === 'element-set' && (
                              <TextField
                                size="small"
                                placeholder="e.g., ISBD Elements"
                                value={ws.elementSetName || ''}
                                onChange={(e) => updateWorksheetName(index, 'elementSetName', e.target.value)}
                              />
                            )}
                            {ws.type === 'concept-scheme' && (
                              <TextField
                                size="small"
                                placeholder="e.g., ISBD Areas"
                                value={ws.conceptSchemeName || ''}
                                onChange={(e) => updateWorksheetName(index, 'conceptSchemeName', e.target.value)}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(1)} startIcon={<ArrowBackIcon />}>
                Back
              </Button>
              <Button variant="contained" onClick={() => setActiveStep(3)}>
                Next: Languages & DCTAP
              </Button>
            </Box>
          </Box>
        );

      case 3: // Languages & DCTAP
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Languages & DCTAP Information
            </Typography>
            
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Languages in this spreadsheet
                </Typography>
                <FormGroup row>
                  {commonLanguages.map(lang => (
                    <FormControlLabel
                      key={lang.code}
                      control={
                        <Checkbox
                          checked={metadata.languages.includes(lang.code)}
                          onChange={() => toggleLanguage(lang.code)}
                        />
                      }
                      label={`${lang.name} (${lang.code})`}
                    />
                  ))}
                </FormGroup>
                
                <FormControl sx={{ mt: 2, minWidth: 200 }}>
                  <InputLabel>Primary Language</InputLabel>
                  <Select
                    value={metadata.primaryLanguage}
                    onChange={(e) => setMetadata(prev => ({ ...prev, primaryLanguage: e.target.value }))}
                    label="Primary Language"
                  >
                    {metadata.languages.map(langCode => {
                      const lang = commonLanguages.find(l => l.code === langCode);
                      return (
                        <MenuItem key={langCode} value={langCode}>
                          {lang?.name || langCode}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  DCTAP (Data Constraint/Tabular Application Profile)
                </Typography>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={metadata.dctapEmbedded}
                      onChange={(e) => setMetadata(prev => ({ ...prev, dctapEmbedded: e.target.checked }))}
                    />
                  }
                  label="DCTAP is embedded in the spreadsheet"
                />
                
                <TextField
                  fullWidth
                  label="DCTAP Reference (if known)"
                  value={metadata.dctapUsed || ''}
                  onChange={(e) => setMetadata(prev => ({ ...prev, dctapUsed: e.target.value }))}
                  placeholder="e.g., ISBD DCTAP v1.0"
                  helperText="Leave blank if unknown. The import process will attempt to validate against the namespace's current DCTAP."
                  sx={{ mt: 2 }}
                />
              </Box>
              
              <Divider />
              
              <TextField
                fullWidth
                label="Additional Notes"
                value={metadata.notes}
                onChange={(e) => setMetadata(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
                helperText="Any additional information about this spreadsheet that might be helpful during import"
              />
            </Stack>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(2)} startIcon={<ArrowBackIcon />}>
                Back
              </Button>
              <Button variant="contained" onClick={() => setActiveStep(4)}>
                Next: Project Assignment
              </Button>
            </Box>
          </Box>
        );

      case 4: // Project & Submit
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Project Assignment & Review
            </Typography>
            
            <Stack spacing={3}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Project Assignment
                </Typography>
                <RadioGroup
                  value={projectMode}
                  onChange={(e) => setProjectMode(e.target.value as 'existing' | 'create')}
                >
                  <FormControlLabel value="existing" control={<Radio />} label="Assign to existing project" />
                  <FormControlLabel value="create" control={<Radio />} label="Create new project" />
                </RadioGroup>
              </FormControl>
              
              {projectMode === 'existing' ? (
                <FormControl fullWidth>
                  <InputLabel>Select Project</InputLabel>
                  <Select
                    value={metadata.projectId || ''}
                    onChange={(e) => setMetadata(prev => ({ ...prev, projectId: e.target.value }))}
                    label="Select Project"
                  >
                    {mockProjects
                      .filter(p => p.namespaces.includes(metadata.namespace))
                      .map(project => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="New Project Name"
                    value={metadata.projectName || ''}
                    onChange={(e) => setMetadata(prev => ({ ...prev, projectName: e.target.value }))}
                    required
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Review Group</InputLabel>
                    <Select
                      value={metadata.reviewGroup || ''}
                      onChange={(e) => setMetadata(prev => ({ ...prev, reviewGroup: e.target.value }))}
                      label="Review Group"
                    >
                      {mockReviewGroups.map(rg => (
                        <MenuItem key={rg.value} value={rg.value}>
                          {rg.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Summary
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Spreadsheet:</strong> {metadata.spreadsheetName || 'Unnamed'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Namespace:</strong> {metadata.namespace}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Content Type:</strong> {metadata.contentType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Languages:</strong> {metadata.languages.join(', ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Worksheets to Import:</strong> {
                        metadata.worksheets.filter(ws => ws.type !== 'skip').length
                      } of {metadata.worksheets.length}
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            </Stack>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(3)} startIcon={<ArrowBackIcon />}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              >
                {loading ? 'Adopting...' : 'Adopt Spreadsheet'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton component={Link} href={addBasePath('/dashboard/admin')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Adopt Existing Spreadsheet</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}
        </CardContent>
      </Card>

      <Paper sx={{ mt: 3, p: 2 }} variant="outlined">
        <Stack direction="row" spacing={1} alignItems="center">
          <InfoIcon color="info" />
          <Typography variant="body2" color="text.secondary">
            This tool creates a "birth certificate" for spreadsheets that were created outside the normal export process.
            Fill in as much information as you know about the spreadsheet's origin and content.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}