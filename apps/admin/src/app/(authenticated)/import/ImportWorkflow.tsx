'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addBasePath } from '@ifla/theme/utils';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CloudUpload as UploadIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as PreviewIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { mockNamespaces } from '@/lib/mock-data/namespaces-extended';

interface ImportWorkflowProps {
  userRoles: string[];
  userName?: string;
  userEmail?: string;
  accessibleNamespaces: string[];
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  row?: number;
  column?: string;
  suggestion?: string;
}

interface ImportStep {
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export default function ImportWorkflow({ 
  userRoles: _userRoles,
  userName: _userName,
  userEmail: _userEmail,
  accessibleNamespaces: _accessibleNamespaces 
}: ImportWorkflowProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [dctapProfile, setDctapProfile] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: ImportStep[] = [
    {
      label: 'Select Namespace',
      description: 'Choose the target namespace for your vocabulary import',
      completed: selectedNamespace !== '',
      active: activeStep === 0,
    },
    {
      label: 'Provide Source Data',
      description: 'Upload or link to your vocabulary spreadsheet',
      completed: spreadsheetUrl !== '',
      active: activeStep === 1,
    },
    {
      label: 'Configure Profile',
      description: 'Select or configure DCTAP profile for validation',
      completed: dctapProfile !== '',
      active: activeStep === 2,
    },
    {
      label: 'Validate & Preview',
      description: 'Review validation results and preview import',
      completed: validationComplete && validationResults.filter(r => r.type === 'error').length === 0,
      active: activeStep === 3,
    },
    {
      label: 'Execute Import',
      description: 'Submit vocabulary for processing and GitHub integration',
      completed: false,
      active: activeStep === 4,
    },
  ];

  // Mock CSV data for testing validation service
  const generateMockCsvData = (profile: string): string => {
    if (profile.includes('elements')) {
      return `identifier,label@en,definition@en,status\n` +
             `isbd:P1001,"Title proper","The main title of a resource","published"\n` +
             `isbd:P1002,"Statement of responsibility","Names of persons or corporate bodies responsible","published"\n` +
             `,"Missing identifier","This should cause an error","published"`;
    } else if (profile.includes('concepts')) {
      return `identifier,prefLabel@en,definition@en,broader\n` +
             `isbd:C1001,"Monograph","A bibliographic resource that is complete",""\n` +
             `isbd:C1002,"Serial","A continuing resource","isbd:C1000"\n` +
             `,"Missing identifier","This should cause an error",""`;
    }
    return `identifier,label\n,"Missing identifier"`;
  };

  const handleNext = () => {
    if (activeStep === 3 && !validationComplete) {
      handleValidation();
      return;
    }
    
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleValidation = async () => {
    setIsValidating(true);
    
    try {
      // Generate mock CSV data based on selected profile for testing
      const csvData = generateMockCsvData(dctapProfile);
      
      // Map profile selection to actual profile IDs
      const profileMapping: Record<string, string> = {
        'standard': 'isbd-elements',
        'isbd': 'isbd-elements', 
        'lrm': 'isbd-concepts',
        'custom': 'isbd-elements'
      };
      
      const profileId = profileMapping[dctapProfile] || 'isbd-elements';
      
      // Call the validation service
      const response = await fetch('/api/validate-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData,
          profileId,
          worksheetName: 'Main'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Validation service error');
      }
      
      const { issues } = await response.json();
      setValidationResults(issues);
      setValidationComplete(true);
      
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResults([{
        type: 'error',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Please check your data and try again'
      }]);
      setValidationComplete(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmitImport = async () => {
    setIsSubmitting(true);
    
    try {
      // Call the API to create import job
      const response = await fetch(addBasePath('/api/actions/scaffold-from-spreadsheet'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace: selectedNamespace,
          spreadsheetUrl,
          githubIssueNumber: null, // Can be added later if needed
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start import');
      }

      // Store job ID for tracking
      const jobId = data.jobId;
      
      // Redirect to status page to monitor progress
      router.push(`/import/status/${jobId}`);
      
    } catch (error) {
      console.error('Import error:', error);
      setIsSubmitting(false);
      // TODO: Show error notification
      alert(error instanceof Error ? error.message : 'Failed to start import');
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedNamespace !== '';
      case 1:
        return spreadsheetUrl !== '';
      case 2:
        return dctapProfile !== '';
      case 3:
        return validationComplete && validationResults.filter(r => r.type === 'error').length === 0;
      default:
        return true;
    }
  };

  const getValidationSummary = () => {
    const errors = validationResults.filter(r => r.type === 'error').length;
    const warnings = validationResults.filter(r => r.type === 'warning').length;
    const info = validationResults.filter(r => r.type === 'info').length;
    
    return { errors, warnings, info };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Import Vocabulary
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Import vocabulary data from spreadsheets with validation and GitHub integration
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Progress Stepper */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Progress
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, _index) => (
                  <Step key={step.label} completed={step.completed}>
                    <StepLabel
                      optional={
                        <Typography variant="caption">
                          {step.description}
                        </Typography>
                      }
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              {/* Step 0: Select Namespace */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Select Target Namespace
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Choose the namespace where your vocabulary will be imported.
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Namespace</InputLabel>
                    <Select
                      value={selectedNamespace}
                      label="Namespace"
                      onChange={(e) => setSelectedNamespace(e.target.value)}
                    >
                      {Object.values(mockNamespaces).map((namespace) => (
                        <MenuItem key={namespace.slug} value={namespace.slug}>
                          <Box>
                            <Typography variant="body1">{namespace.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {namespace.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedNamespace && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Selected: {mockNamespaces[selectedNamespace]?.name} - {mockNamespaces[selectedNamespace]?.description}
                    </Alert>
                  )}
                </Box>
              )}

              {/* Step 1: Provide Source Data */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Provide Source Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Provide a link to your Google Sheets or upload a CSV file containing vocabulary data.
                  </Typography>

                  <TextField
                    fullWidth
                    label="Google Sheets URL"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    sx={{ mt: 2 }}
                    helperText="The spreadsheet must be publicly accessible or shared with the system"
                  />

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" color="text.secondary">OR</Typography>
                  </Divider>

                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" gutterBottom>
                      Upload CSV File
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Maximum file size: 10MB
                    </Typography>
                    <Button variant="outlined" component="label">
                      Choose File
                      <input type="file" hidden accept=".csv,.xlsx" />
                    </Button>
                  </Paper>

                  {spreadsheetUrl && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Spreadsheet URL provided. Click "Next" to continue.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}

              {/* Step 2: Configure Profile */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Configure DCTAP Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Select a DCTAP (Dublin Core Tabular Application Profile) to validate your vocabulary structure.
                  </Typography>

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>DCTAP Profile</InputLabel>
                    <Select
                      value={dctapProfile}
                      label="DCTAP Profile"
                      onChange={(e) => setDctapProfile(e.target.value)}
                    >
                      <MenuItem value="standard">Standard Vocabulary Profile</MenuItem>
                      <MenuItem value="isbd">ISBD Specific Profile</MenuItem>
                      <MenuItem value="lrm">LRM Conceptual Model Profile</MenuItem>
                      <MenuItem value="custom">Custom Profile</MenuItem>
                    </Select>
                  </FormControl>

                  {dctapProfile && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="info">
                        <Typography variant="body2" gutterBottom>
                          <strong>Selected Profile: {dctapProfile === 'standard' ? 'Standard Vocabulary Profile' : 
                                                   dctapProfile === 'isbd' ? 'ISBD Specific Profile' :
                                                   dctapProfile === 'lrm' ? 'LRM Conceptual Model Profile' :
                                                   'Custom Profile'}</strong>
                        </Typography>
                        <Typography variant="caption">
                          This profile will validate required fields, data types, and vocabulary structure.
                        </Typography>
                      </Alert>
                      
                      <Button 
                        size="small" 
                        startIcon={<PreviewIcon />}
                        sx={{ mt: 1 }}
                      >
                        Preview Profile Requirements
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 3: Validate & Preview */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Validate & Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Review validation results and preview the import before execution.
                  </Typography>

                  {!validationComplete && !isValidating && (
                    <Button
                      variant="contained"
                      onClick={handleValidation}
                      startIcon={<CheckIcon />}
                      size="large"
                    >
                      Start Validation
                    </Button>
                  )}

                  {isValidating && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Validating vocabulary data...
                      </Typography>
                      <LinearProgress />
                    </Box>
                  )}

                  {validationComplete && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Validation Results
                      </Typography>
                      
                      {(() => {
                        const { errors, warnings, info } = getValidationSummary();
                        return (
                          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            {errors > 0 && (
                              <Chip
                                icon={<ErrorIcon />}
                                label={`${errors} Error${errors > 1 ? 's' : ''}`}
                                color="error"
                                variant="outlined"
                              />
                            )}
                            {warnings > 0 && (
                              <Chip
                                icon={<WarningIcon />}
                                label={`${warnings} Warning${warnings > 1 ? 's' : ''}`}
                                color="warning"
                                variant="outlined"
                              />
                            )}
                            {info > 0 && (
                              <Chip
                                icon={<CheckIcon />}
                                label={`${info} Info`}
                                color="info"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        );
                      })()}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2">
                          {validationResults.length} total issues found
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => setShowValidationDetails(!showValidationDetails)}
                          endIcon={showValidationDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        >
                          {showValidationDetails ? 'Hide' : 'Show'} Details
                        </Button>
                      </Box>

                      <Collapse in={showValidationDetails}>
                        <List>
                          {validationResults.map((issue, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {issue.type === 'error' && <ErrorIcon color="error" />}
                                {issue.type === 'warning' && <WarningIcon color="warning" />}
                                {issue.type === 'info' && <CheckIcon color="info" />}
                              </ListItemIcon>
                              <ListItemText
                                primary={issue.message}
                                secondary={
                                  <Box>
                                    {issue.row && issue.column && (
                                      <Typography variant="caption" display="block">
                                        Row {issue.row}, Column: {issue.column}
                                      </Typography>
                                    )}
                                    {issue.suggestion && (
                                      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                        Suggestion: {issue.suggestion}
                                      </Typography>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>

                      {validationResults.filter(r => r.type === 'error').length === 0 && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ✓ Validation passed! No errors found. Ready to proceed with import.
                          </Typography>
                        </Alert>
                      )}

                      {validationResults.filter(r => r.type === 'error').length > 0 && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ❌ Validation failed. Please fix the errors before proceeding.
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 4: Execute Import */}
              {activeStep === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Execute Import
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Ready to import your vocabulary. This will create a GitHub issue and begin the import process.
                  </Typography>

                  <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Import Summary
                    </Typography>
                    <Box component="dl" sx={{ '& dt': { fontWeight: 'medium' }, '& dd': { ml: 0, mb: 1 } }}>
                      <Box component="dt">Namespace:</Box>
                      <Box component="dd">{mockNamespaces[selectedNamespace]?.name}</Box>
                      
                      <Box component="dt">Source:</Box>
                      <Box component="dd">{spreadsheetUrl || 'Uploaded file'}</Box>
                      
                      <Box component="dt">Profile:</Box>
                      <Box component="dd">{dctapProfile}</Box>
                      
                      <Box component="dt">Validation Status:</Box>
                      <Box component="dd">
                        <Chip 
                          size="small" 
                          color="success" 
                          icon={<CheckIcon />} 
                          label="Passed" 
                        />
                      </Box>
                    </Box>
                  </Paper>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>What happens next:</strong>
                    </Typography>
                    <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                      <li>A GitHub issue will be created for tracking</li>
                      <li>Vocabulary data will be processed and validated</li>
                      <li>RDF files will be generated</li>
                      <li>You'll receive notifications about the progress</li>
                    </Box>
                  </Alert>

                  {!isSubmitting ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSubmitImport}
                      startIcon={<GitHubIcon />}
                    >
                      Submit Import Request
                    </Button>
                  ) : (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Submitting import request...
                      </Typography>
                      <LinearProgress />
                    </Box>
                  )}
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
                
                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!canProceed() || isValidating}
                  >
                    {activeStep === 3 && !validationComplete ? 'Validate' : 'Next'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}