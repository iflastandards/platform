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
  Chip,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { addBasePath } from '@/lib/utils/addBasePath';
import type { SpreadsheetAnalysis } from '@/lib/services/adoption-service';

interface AdoptSpreadsheetFormProps {
  userId: string;
  userName?: string;
  userEmail?: string;
}

interface Project {
  id: string;
  name: string;
  reviewGroup: string;
  namespaces: string[];
}

interface DCTAPProfile {
  id: string;
  name: string;
  namespace: string;
  description: string;
}

// Simplified analysis - just basic sheet info
interface _BasicSheetInfo {
  sheetId: string;
  sheetName: string;
  worksheets: {
    name: string;
    headers?: string[]; // First row if available
  }[];
}

// Comprehensive metadata for the "birth certificate"
interface _SpreadsheetMetadata {
  // Basic info
  spreadsheetUrl: string;
  spreadsheetName: string;
  namespace: string;
  
  // Export info (who created this spreadsheet)
  exportedBy: string;
  exportedAt: string;
  exportReason?: string;
  
  // Content type
  contentType: 'element-sets' | 'concept-schemes' | 'mixed';
  
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

const steps = ['Basic Info', 'Content Details', 'Languages & DCTAP', 'Project & Submit'];

// Mock data - replace with actual API calls
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
  {
    id: 'project-3',
    name: 'MulDiCat French Translation',
    reviewGroup: 'cat-review-group',
    namespaces: ['muldicat'],
  },
];

const mockDCTAPProfiles: DCTAPProfile[] = [
  {
    id: 'dctap-isbd',
    name: 'ISBD Standard Profile',
    namespace: 'isbd',
    description: 'Standard DCTAP profile for ISBD vocabularies',
  },
  {
    id: 'dctap-lrm',
    name: 'LRM Standard Profile',
    namespace: 'lrm',
    description: 'Standard DCTAP profile for LRM vocabularies',
  },
  {
    id: 'dctap-generic',
    name: 'Generic Vocabulary Profile',
    namespace: '*',
    description: 'Generic profile for any vocabulary',
  },
];

export default function AdoptSpreadsheetForm({ userId: _userId, userName }: AdoptSpreadsheetFormProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [projectMode, setProjectMode] = useState<'existing' | 'create'>('existing');
  const [selectedProject, setSelectedProject] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectReviewGroup, setNewProjectReviewGroup] = useState('');
  const [selectedDCTAP, setSelectedDCTAP] = useState('');
  const [analysis, setAnalysis] = useState<SpreadsheetAnalysis | null>(null);
  
  // Validate Google Sheets URL
  const isValidGoogleSheetsUrl = (url: string): boolean => {
    const pattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+/;
    return pattern.test(url);
  };
  
  // Extract sheet ID from URL
  const extractSheetId = (url: string): string | null => {
    const match = url.match(/\/d\/([\w-]+)/);
    return match ? match[1] : null;
  };
  
  // Handle URL submission
  const handleUrlSubmit = async () => {
    setError(null);
    
    if (!isValidGoogleSheetsUrl(spreadsheetUrl)) {
      setError('Please enter a valid Google Sheets URL');
      return;
    }
    
    const sheetId = extractSheetId(spreadsheetUrl);
    if (!sheetId) {
      setError('Could not extract sheet ID from URL');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if already adopted
      const checkResponse = await fetch(
        addBasePath(`/api/admin/adopt-spreadsheet?action=check&url=${encodeURIComponent(spreadsheetUrl)}`),
        { method: 'GET' }
      );
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.data.isAdopted) {
          setError('This spreadsheet has already been adopted');
          setLoading(false);
          return;
        }
      }
      
      // Analyze spreadsheet
      const response = await fetch(
        addBasePath(`/api/admin/adopt-spreadsheet?action=analyze&url=${encodeURIComponent(spreadsheetUrl)}`),
        { method: 'GET' }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze spreadsheet');
      }
      
      const data = await response.json();
      setAnalysis(data.data);
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze spreadsheet');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle project assignment
  const handleProjectAssignment = () => {
    if (projectMode === 'existing' && !selectedProject) {
      setError('Please select a project');
      return;
    }
    
    if (projectMode === 'create' && (!newProjectName || !newProjectReviewGroup)) {
      setError('Please fill in all project details');
      return;
    }
    
    setError(null);
    setActiveStep(2);
  };
  
  // Handle final adoption
  const handleAdopt = async () => {
    if (!selectedDCTAP) {
      setError('Please select a DCTAP profile');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const adoptData = {
        spreadsheetUrl,
        dctapProfileId: selectedDCTAP,
        userName,
        projectId: '', // Will be set below
        projectName: undefined as string | undefined,
        reviewGroup: undefined as string | undefined,
      };
      
      if (projectMode === 'existing') {
        adoptData.projectId = selectedProject;
      } else {
        adoptData.projectName = newProjectName;
        adoptData.reviewGroup = newProjectReviewGroup;
      }
      
      const response = await fetch(addBasePath('/api/admin/adopt-spreadsheet'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adoptData),
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
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Enter the URL of an existing Google Sheets document to adopt it into the system.
              This is useful for importing legacy spreadsheets or volunteer contributions.
            </Typography>
            <TextField
              fullWidth
              label="Google Sheets URL"
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              margin="normal"
              helperText="Must be a valid Google Sheets URL that you have access to"
            />
            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUrlSubmit}
                disabled={!spreadsheetUrl || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {loading ? 'Analyzing...' : 'Analyze Spreadsheet'}
              </Button>
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Spreadsheet analyzed successfully! Found {analysis?.worksheets.length} worksheets
              with {analysis?.totalRows} total rows.
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              Spreadsheet Structure
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Worksheet</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Rows</TableCell>
                    <TableCell>Languages</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analysis?.worksheets.map((worksheet: any) => (
                    <TableRow key={worksheet.name}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DescriptionIcon fontSize="small" color="action" />
                          <Typography variant="body2">{worksheet.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={worksheet.type.replace('-', ' ')}
                          size="small"
                          color={worksheet.type === 'element-set' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{worksheet.rows}</TableCell>
                      <TableCell>
                        {worksheet.languages.length > 0 
                          ? worksheet.languages.join(', ')
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Alert severity="info" icon={<InfoIcon />}>
              Detected content type: <strong>{analysis?.inferredType}</strong>
              {analysis?.inferredType === 'mixed' && 
                ' (contains both element sets and concept schemes)'
              }
            </Alert>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Assign to Project
            </Typography>
            
            <RadioGroup
              value={projectMode}
              onChange={(e) => setProjectMode(e.target.value as 'existing' | 'create')}
            >
              <FormControlLabel 
                value="existing" 
                control={<Radio />} 
                label="Use existing project" 
              />
              <FormControlLabel 
                value="create" 
                control={<Radio />} 
                label="Create new project" 
              />
            </RadioGroup>
            
            {projectMode === 'existing' ? (
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Project</InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  label="Select Project"
                >
                  {mockProjects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name} ({project.reviewGroup})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Review Group</InputLabel>
                  <Select
                    value={newProjectReviewGroup}
                    onChange={(e) => setNewProjectReviewGroup(e.target.value)}
                    label="Review Group"
                  >
                    <MenuItem value="isbd-review-group">ISBD Review Group</MenuItem>
                    <MenuItem value="bcm-review-group">BCM Review Group</MenuItem>
                    <MenuItem value="cat-review-group">CAT Review Group</MenuItem>
                    <MenuItem value="unimarc-review-group">UNIMARC Review Group</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
            
            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleProjectAssignment}
              >
                Continue
              </Button>
            </Box>
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Import Settings
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>DCTAP Profile</InputLabel>
              <Select
                value={selectedDCTAP}
                onChange={(e) => setSelectedDCTAP(e.target.value)}
                label="DCTAP Profile"
              >
                {mockDCTAPProfiles.map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>
                    <Box>
                      <Typography variant="body2">{profile.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {profile.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              The spreadsheet will be registered as an active project spreadsheet and will be
              immediately available for import through the standard import workflow.
            </Alert>
            
            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdopt}
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
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Tooltip title="Back to Admin Dashboard">
            <IconButton
              component={Link}
              href="/dashboard/admin"
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight="bold">
            Adopt Existing Spreadsheet
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Import an existing Google Sheets document into the vocabulary management system
        </Typography>
      </Box>
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Main Content */}
      <Card elevation={0}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          {renderStepContent()}
          
          {/* Navigation */}
          {activeStep > 0 && activeStep < 3 && (
            <Box mt={3}>
              <Button
                onClick={() => setActiveStep(activeStep - 1)}
                disabled={loading}
              >
                Back
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Info Box */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="subtitle2" gutterBottom color="primary">
          About Spreadsheet Adoption
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This tool allows superadmins to register existing Google Sheets documents in the system.
          Once adopted, the spreadsheet will appear in the project&apos;s active spreadsheets list and
          can be imported through the standard import workflow. This is particularly useful for:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            Legacy spreadsheets created before the export/import system
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Volunteer contributions submitted via email
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Emergency imports when the normal workflow is unavailable
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Testing and development with existing data
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}