'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Steps,
  Button,
  Input,
  Select,
  Alert,
  Tag,
  Progress,
  Divider,
  Space,
  Card,
  List,
  Collapse,
  Row,
  Col,
  Form,
} from 'antd';
import {
  CloudUploadOutlined,
  CheckOutlined,
  CloseOutlined,
  WarningOutlined,
  EyeOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import { mockNamespaces } from '@/lib/mock-data/namespaces-extended';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

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
  title: string;
  description: string;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

export default function ImportWorkflow({
  userRoles: _userRoles,
  userName: _userName,
  userEmail: _userEmail,
  accessibleNamespaces: _accessibleNamespaces,
}: ImportWorkflowProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [dctapProfile, setDctapProfile] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationIssue[]>(
    [],
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: ImportStep[] = [
    {
      title: 'Select Namespace',
      description: 'Choose the target namespace for your vocabulary import',
    },
    {
      title: 'Provide Source Data',
      description: 'Upload or link to your vocabulary spreadsheet',
    },
    {
      title: 'Configure Profile',
      description: 'Select or configure DCTAP profile for validation',
    },
    {
      title: 'Validate & Preview',
      description: 'Review validation results and preview import',
    },
    {
      title: 'Execute Import',
      description: 'Submit vocabulary for processing and GitHub integration',
    },
  ];

  // Mock CSV data for testing validation service
  const generateMockCsvData = (profile: string): string => {
    if (profile.includes('elements')) {
      return (
        `identifier,label@en,definition@en,status\n` +
        `isbd:P1001,"Title proper","The main title of a resource","published"\n` +
        `isbd:P1002,"Statement of responsibility","Names of persons or corporate bodies responsible","published"\n` +
        `,"Missing identifier","This should cause an error","published"`
      );
    }
    if (profile.includes('concepts')) {
      return (
        `identifier,prefLabel@en,definition@en,broader\n` +
        `isbd:C1001,"Monograph","A bibliographic resource that is complete",""\n` +
        `isbd:C1002,"Serial","A continuing resource","isbd:C1000"\n` +
        `,"Missing identifier","This should cause an error",""`
      );
    }
    return `identifier,label\n,"Missing identifier"`;
  };

  const handleNext = () => {
    if (current === 3 && !validationComplete) {
      handleValidation();
      return;
    }

    if (current < steps.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handleBack = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const handleValidation = async () => {
    setIsValidating(true);

    try {
      // Generate mock CSV data based on selected profile for testing
      const csvData = generateMockCsvData(dctapProfile);

      // Map profile selection to actual profile IDs
      const profileMapping: Record<string, string> = {
        standard: 'isbd-elements',
        isbd: 'isbd-elements',
        lrm: 'isbd-concepts',
        custom: 'isbd-elements',
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
          worksheetName: 'Main',
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
      setValidationResults([
        {
          type: 'error',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestion: 'Please check your data and try again',
        },
      ]);
      setValidationComplete(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmitImport = async () => {
    setIsSubmitting(true);

    try {
      // Call the API to create import job
      const response = await fetch('/api/actions/scaffold-from-spreadsheet', {
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
      const { jobId } = data;

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
    switch (current) {
      case 0:
        return selectedNamespace !== '';
      case 1:
        return spreadsheetUrl !== '';
      case 2:
        return dctapProfile !== '';
      case 3:
        return (
          validationComplete &&
          validationResults.filter((r) => r.type === 'error').length === 0
        );
      default:
        return true;
    }
  };

  const getValidationSummary = () => {
    const errors = validationResults.filter((r) => r.type === 'error').length;
    const warnings = validationResults.filter(
      (r) => r.type === 'warning',
    ).length;
    const info = validationResults.filter((r) => r.type === 'info').length;

    return { errors, warnings, info };
  };

  const getStepStatus = (
    index: number,
  ): 'wait' | 'process' | 'finish' | 'error' => {
    if (index < current) {
      return 'finish';
    }
    if (index === current) {
      return 'process';
    }
    return 'wait';
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <div>
            <Title level={4}>Select Target Namespace</Title>
            <Paragraph type="secondary">
              Choose the namespace where your vocabulary will be imported.
            </Paragraph>

            <Form.Item label="Namespace" required style={{ marginTop: 16 }}>
              <Select
                value={selectedNamespace}
                onChange={setSelectedNamespace}
                placeholder="Select a namespace"
                size="large"
              >
                {Object.values(mockNamespaces).map((namespace) => (
                  <Option key={namespace.slug} value={namespace.slug}>
                    <div>
                      <Text strong>{namespace.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {namespace.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedNamespace && (
              <Alert
                type="info"
                message={`Selected: ${mockNamespaces[selectedNamespace]?.name}`}
                description={mockNamespaces[selectedNamespace]?.description}
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        );

      case 1:
        return (
          <div>
            <Title level={4}>Provide Source Data</Title>
            <Paragraph type="secondary">
              Provide a link to your Google Sheets or upload a CSV file
              containing vocabulary data.
            </Paragraph>

            <Form.Item
              label="Spreadsheet URL"
              required
              style={{ marginTop: 16 }}
            >
              <Input
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                size="large"
                prefix={<CloudUploadOutlined />}
              />
            </Form.Item>

            <Divider>OR</Divider>

            <Button
              type="dashed"
              icon={<CloudUploadOutlined />}
              size="large"
              block
              disabled
            >
              Upload CSV File (Coming Soon)
            </Button>

            {spreadsheetUrl && (
              <Alert
                type="info"
                message="Google Sheets Integration"
                description="The system will fetch and validate data from your Google Sheets. Ensure the sheet is publicly accessible or shared with the service account."
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <Title level={4}>Configure DCTAP Profile</Title>
            <Paragraph type="secondary">
              Select a validation profile to ensure your data meets the required
              standards.
            </Paragraph>

            <Form.Item label="DCTAP Profile" required style={{ marginTop: 16 }}>
              <Select
                value={dctapProfile}
                onChange={setDctapProfile}
                placeholder="Select a validation profile"
                size="large"
              >
                <Option value="standard">
                  <div>
                    <Text strong>Standard ISBD Elements</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Default profile for ISBD element vocabularies
                    </Text>
                  </div>
                </Option>
                <Option value="isbd">
                  <div>
                    <Text strong>ISBD-specific Profile</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Customized for ISBD namespace requirements
                    </Text>
                  </div>
                </Option>
                <Option value="lrm">
                  <div>
                    <Text strong>LRM Concepts Profile</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      For LRM conceptual model vocabularies
                    </Text>
                  </div>
                </Option>
                <Option value="custom">
                  <div>
                    <Text strong>Custom Profile</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Upload your own DCTAP profile
                    </Text>
                  </div>
                </Option>
              </Select>
            </Form.Item>

            {dctapProfile === 'custom' && (
              <Form.Item label="Custom Profile Definition">
                <TextArea
                  rows={6}
                  placeholder="Paste your DCTAP profile JSON or CSV here..."
                />
              </Form.Item>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <Title level={4}>Validate & Preview</Title>
            <Paragraph type="secondary">
              Review validation results before importing your vocabulary.
            </Paragraph>

            {isValidating && (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <Progress type="circle" percent={75} status="active" />
                <Title level={5} style={{ marginTop: 16 }}>
                  Validating your data...
                </Title>
              </div>
            )}

            {validationComplete && !isValidating && (
              <>
                {(() => {
                  const summary = getValidationSummary();
                  return (
                    <Alert
                      type={
                        summary.errors > 0
                          ? 'error'
                          : summary.warnings > 0
                            ? 'warning'
                            : 'success'
                      }
                      message={
                        summary.errors > 0
                          ? 'Validation Failed'
                          : summary.warnings > 0
                            ? 'Validation Passed with Warnings'
                            : 'Validation Successful'
                      }
                      description={
                        <Space>
                          {summary.errors > 0 && (
                            <Tag color="error">{summary.errors} Errors</Tag>
                          )}
                          {summary.warnings > 0 && (
                            <Tag color="warning">
                              {summary.warnings} Warnings
                            </Tag>
                          )}
                          {summary.info > 0 && (
                            <Tag color="blue">{summary.info} Info</Tag>
                          )}
                        </Space>
                      }
                      style={{ marginBottom: 16 }}
                    />
                  );
                })()}

                <Collapse
                  defaultActiveKey={
                    validationResults.some((r) => r.type === 'error')
                      ? ['1']
                      : []
                  }
                  style={{ marginTop: 16 }}
                >
                  <Panel header="Validation Details" key="1">
                    <List
                      dataSource={validationResults}
                      renderItem={(issue) => (
                        <List.Item>
                          <Space align="start" style={{ width: '100%' }}>
                            {issue.type === 'error' && (
                              <CloseOutlined style={{ color: '#ff4d4f' }} />
                            )}
                            {issue.type === 'warning' && (
                              <WarningOutlined style={{ color: '#faad14' }} />
                            )}
                            {issue.type === 'info' && (
                              <CheckOutlined style={{ color: '#1890ff' }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <Text strong>{issue.message}</Text>
                              {issue.row && (
                                <Text
                                  type="secondary"
                                  style={{ display: 'block', fontSize: 12 }}
                                >
                                  Row {issue.row}
                                  {issue.column && `, Column: ${issue.column}`}
                                </Text>
                              )}
                              {issue.suggestion && (
                                <Text
                                  type="secondary"
                                  style={{ display: 'block', fontSize: 12 }}
                                >
                                  Suggestion: {issue.suggestion}
                                </Text>
                              )}
                            </div>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Panel>
                </Collapse>

                <div style={{ marginTop: 24 }}>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() =>
                      setShowValidationDetails(!showValidationDetails)
                    }
                  >
                    Preview Import Data
                  </Button>
                </div>
              </>
            )}

            {!validationComplete && !isValidating && (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <Text type="secondary">
                  Click &quot;Validate&quot; to check your data for errors and
                  warnings.
                </Text>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <Title level={4}>Execute Import</Title>
            <Paragraph type="secondary">
              Ready to import your vocabulary into the selected namespace.
            </Paragraph>

            <Card style={{ marginTop: 24, marginBottom: 24 }}>
              <Title level={5}>Import Summary</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Namespace: </Text>
                  <Text strong>{mockNamespaces[selectedNamespace]?.name}</Text>
                </div>
                <div>
                  <Text type="secondary">Data Source: </Text>
                  <Text strong>{spreadsheetUrl || 'Uploaded file'}</Text>
                </div>
                <div>
                  <Text type="secondary">Profile: </Text>
                  <Text strong>{dctapProfile}</Text>
                </div>
                <div>
                  <Text type="secondary">Validation: </Text>
                  <Tag color="success">Passed</Tag>
                </div>
              </Space>
            </Card>

            <Alert
              type="info"
              message="GitHub Integration"
              description="The import will create a pull request in the repository for review and approval by maintainers."
              icon={<GithubOutlined />}
              style={{ marginBottom: 24 }}
              showIcon
            />

            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<CloudUploadOutlined />}
                loading={isSubmitting}
                onClick={handleSubmitImport}
              >
                Start Import
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Import Vocabulary</Title>
        <Text type="secondary">
          Import vocabulary data from spreadsheets with validation and GitHub
          integration
        </Text>
      </div>

      <Row gutter={24}>
        {/* Progress Stepper */}
        <Col xs={24} md={8}>
          <Card>
            <Title level={5} style={{ marginBottom: 16 }}>
              Import Progress
            </Title>
            <Steps
              current={current}
              direction="vertical"
              items={steps.map((step, index) => ({
                title: step.title,
                description: step.description,
                status: getStepStatus(index),
              }))}
            />
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} md={16}>
          <Card>
            {renderStepContent()}

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack} disabled={current === 0}>
                Previous
              </Button>

              {current < steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  loading={isValidating}
                >
                  {current === 3 && !validationComplete ? 'Validate' : 'Next'}
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
