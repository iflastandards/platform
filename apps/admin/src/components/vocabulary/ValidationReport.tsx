'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Collapse,
  IconButton,
  Button,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Paper,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  BugReport as BugIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Code as SyntaxIcon,
} from '@mui/icons-material';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'syntax' | 'semantics' | 'structure' | 'performance' | 'security' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  description?: string;
  location?: {
    row?: number;
    column?: string;
    sheet?: string;
    range?: string;
  };
  suggestion?: string;
  fixAction?: {
    label: string;
    description: string;
    automated?: boolean;
  };
  ruleCode?: string;
  documentation?: string;
}

interface ValidationSummary {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  success: number;
  score: number; // 0-100
  lastRun: string;
  duration: number; // in ms
}

interface ValidationReportProps {
  issues: ValidationIssue[];
  summary: ValidationSummary;
  loading?: boolean;
  onRefresh?: () => void;
  onFixIssue?: (issue: ValidationIssue) => void;
  onDownloadReport?: () => void;
  title?: string;
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

export default function ValidationReport({
  issues,
  summary,
  loading = false,
  onRefresh,
  onFixIssue,
  onDownloadReport,
  title = 'Validation Report',
}: ValidationReportProps) {
  const [tabValue, setTabValue] = useState(0);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const toggleIssueExpansion = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <SuccessIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'syntax':
        return <SyntaxIcon />;
      case 'security':
        return <SecurityIcon />;
      case 'performance':
        return <PerformanceIcon />;
      default:
        return <BugIcon />;
    }
  };

  const getSeverityColor = (severity: string): 'error' | 'warning' | 'info' | 'success' => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const filteredIssues = (type?: string) => {
    if (!type) return issues;
    return issues.filter(issue => issue.type === type);
  };

  const groupedIssues = issues.reduce((groups, issue) => {
    const key = issue.category;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(issue);
    return groups;
  }, {} as Record<string, ValidationIssue[]>);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Running validation...
            </Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last run: {new Date(summary.lastRun).toLocaleString()} 
              • Duration: {summary.duration}ms
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            {onRefresh && (
              <Button
                startIcon={<RefreshIcon />}
                size="small"
                variant="outlined"
                onClick={onRefresh}
              >
                Revalidate
              </Button>
            )}
            {onDownloadReport && (
              <Button
                startIcon={<DownloadIcon />}
                size="small"
                variant="outlined"
                onClick={onDownloadReport}
              >
                Export
              </Button>
            )}
          </Stack>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color={getScoreColor(summary.score)} gutterBottom>
              {summary.score}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Score
            </Typography>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main" gutterBottom>
              {summary.errors}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Errors
            </Typography>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" gutterBottom>
              {summary.warnings}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Warnings
            </Typography>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" gutterBottom>
              {summary.info}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Info
            </Typography>
          </Paper>
        </Box>

        {/* Quick Status Alert */}
        {summary.errors > 0 ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Validation Failed:</strong> {summary.errors} error{summary.errors > 1 ? 's' : ''} must be fixed before proceeding.
            </Typography>
          </Alert>
        ) : summary.warnings > 0 ? (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Validation Passed with Warnings:</strong> {summary.warnings} warning{summary.warnings > 1 ? 's' : ''} should be reviewed.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Validation Passed:</strong> No issues found. Ready to proceed.
            </Typography>
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label={`All Issues (${issues.length})`} 
              icon={issues.length > 0 ? <Chip size="small" label={issues.length} /> : undefined}
            />
            <Tab 
              label={`Errors (${summary.errors})`}
              icon={summary.errors > 0 ? <Chip size="small" label={summary.errors} color="error" /> : undefined}
            />
            <Tab 
              label={`Warnings (${summary.warnings})`}
              icon={summary.warnings > 0 ? <Chip size="small" label={summary.warnings} color="warning" /> : undefined}
            />
            <Tab label="By Category" />
          </Tabs>
        </Box>

        {/* All Issues Tab */}
        <TabPanel value={tabValue} index={0}>
          {issues.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No validation issues found.
            </Typography>
          ) : (
            <List>
              {issues.map((issue) => (
                <Box key={issue.id}>
                  <ListItem
                    onClick={() => toggleIssueExpansion(issue.id)}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      {getIssueIcon(issue.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{issue.message}</Typography>
                          <Chip 
                            label={issue.severity} 
                            size="small" 
                            color={getSeverityColor(issue.severity)}
                            variant="outlined"
                          />
                          {issue.ruleCode && (
                            <Chip 
                              label={issue.ruleCode} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontFamily: 'monospace' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        issue.location && (
                          <Typography variant="caption">
                            {issue.location.sheet && `Sheet: ${issue.location.sheet} • `}
                            {issue.location.row && `Row: ${issue.location.row} • `}
                            {issue.location.column && `Column: ${issue.location.column}`}
                          </Typography>
                        )
                      }
                    />
                    <IconButton size="small">
                      {expandedIssues.has(issue.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </ListItem>
                  
                  <Collapse in={expandedIssues.has(issue.id)}>
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                      {issue.description && (
                        <Typography variant="body2" paragraph>
                          {issue.description}
                        </Typography>
                      )}
                      
                      {issue.suggestion && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Suggestion:</strong> {issue.suggestion}
                          </Typography>
                        </Alert>
                      )}
                      
                      {issue.fixAction && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onFixIssue?.(issue)}
                            disabled={!issue.fixAction.automated}
                          >
                            {issue.fixAction.automated ? 'Auto-Fix' : 'Manual Fix Required'}
                          </Button>
                          
                          {issue.documentation && (
                            <Button
                              size="small"
                              variant="text"
                              href={issue.documentation}
                              target="_blank"
                            >
                              Learn More
                            </Button>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Errors Tab */}
        <TabPanel value={tabValue} index={1}>
          <List>
            {filteredIssues('error').map((issue) => (
              <ListItem key={issue.id}>
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={issue.message}
                  secondary={issue.suggestion}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Warnings Tab */}
        <TabPanel value={tabValue} index={2}>
          <List>
            {filteredIssues('warning').map((issue) => (
              <ListItem key={issue.id}>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary={issue.message}
                  secondary={issue.suggestion}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* By Category Tab */}
        <TabPanel value={tabValue} index={3}>
          {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
            <Accordion key={category}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getCategoryIcon(category)}
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {category}
                  </Typography>
                  <Chip label={categoryIssues.length} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {categoryIssues.map((issue) => (
                    <ListItem key={issue.id}>
                      <ListItemIcon>
                        {getIssueIcon(issue.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={issue.message}
                        secondary={issue.location && `Row ${issue.location.row}, Column ${issue.location.column}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>
      </CardContent>
    </Card>
  );
}