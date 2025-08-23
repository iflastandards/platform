'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Typography,
  Input,
  Button,
  Alert,
  Select,
  Radio,
  Steps,
  Table,
  Tag,
  Spin,
  Space,
  Form,
} from 'antd';
import {
  CloudUploadOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { SpreadsheetAnalysis } from '@/lib/services/adoption-service';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

const steps = [
  { title: 'Basic Info' },
  { title: 'Content Details' },
  { title: 'Languages & DCTAP' },
  { title: 'Project & Submit' },
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
      // Simulate API call to analyze spreadsheet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      const mockAnalysis: SpreadsheetAnalysis = {
        sheetId: sheetId,
        sheetName: 'ISBD Vocabulary Export - March 2024',
        worksheets: [
          { name: 'Elements', type: 'element-set' as const, rows: 245, columns: 8, headers: ['ID', 'Label', 'Definition', 'Type', 'Status', 'Created', 'Modified', 'Notes'], languages: ['en', 'fr', 'es'] },
          { name: 'Content Types', type: 'concept-scheme' as const, rows: 15, columns: 6, headers: ['ID', 'Label', 'Definition', 'Parent', 'Status', 'Notes'], languages: ['en', 'fr'] },
          { name: 'Media Types', type: 'concept-scheme' as const, rows: 23, columns: 6, headers: ['ID', 'Label', 'Definition', 'Parent', 'Status', 'Notes'], languages: ['en'] },
        ],
        inferredType: 'mixed',
        languages: ['en', 'fr', 'es'],
        totalRows: 283,
        totalColumns: 20,
      };
      
      setAnalysis(mockAnalysis);
      setActiveStep(1);
      setSuccess('Spreadsheet analyzed successfully!');
    } catch (err) {
      setError('Failed to analyze spreadsheet. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Spreadsheet successfully submitted for adoption!');
      
      // Redirect to status page after a short delay
      setTimeout(() => {
        router.push('/dashboard/admin/adopt-spreadsheet/status');
      }, 2000);
    } catch (err) {
      setError('Failed to submit spreadsheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Google Sheets URL Required"
              description="Enter the URL of a Google Sheets document that contains vocabulary data to import."
              type="info"
              showIcon
            />
            
            <Form.Item
              label="Google Sheets URL"
              rules={[{ required: true, message: 'Please enter a Google Sheets URL' }]}
            >
              <Input
                size="large"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={spreadsheetUrl}
                onChange={(e) => setSpreadsheetUrl(e.target.value)}
                prefix={<FileTextOutlined />}
              />
            </Form.Item>
            
            <Button
              type="primary"
              size="large"
              onClick={handleUrlSubmit}
              loading={loading}
              disabled={!spreadsheetUrl}
              icon={<CloudUploadOutlined />}
            >
              Analyze Spreadsheet
            </Button>
          </Space>
        );
        
      case 1:
        if (!analysis) {return null;}
        
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Title level={4}>Spreadsheet Analysis</Title>
              <Paragraph>
                <Text strong>Sheet Name:</Text> {analysis.sheetName}
              </Paragraph>
              <Paragraph>
                <Text strong>Type:</Text>{' '}
                <Tag color="blue">{analysis.inferredType}</Tag>
              </Paragraph>
            </Card>
            
            <Card>
              <Title level={4}>Worksheets Found</Title>
              <Table
                dataSource={analysis.worksheets}
                columns={[
                  { title: 'Sheet Name', dataIndex: 'name', key: 'name' },
                  { title: 'Rows', dataIndex: 'rows', key: 'rows' },
                  { title: 'Columns', dataIndex: 'columns', key: 'columns' },
                  {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type',
                    render: (_: unknown, record: { headers?: string[] }) => (
                      <Tag color="blue">
                        {record.headers?.length || 0} fields
                      </Tag>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
            
            <Space>
              <Button onClick={handleBack}>Back</Button>
              <Button type="primary" onClick={handleNext}>
                Continue
              </Button>
            </Space>
          </Space>
        );
        
      case 2:
        if (!analysis) {return null;}
        
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Title level={4}>Languages</Title>
              <Paragraph>
                <Text strong>Detected Languages:</Text>{' '}
                {analysis.languages.map((lang: string) => (
                  <Tag key={lang} color="blue">{lang.toUpperCase()}</Tag>
                ))}
              </Paragraph>
            </Card>
            
            <Card>
              <Title level={4}>DCTAP Profile</Title>
              {false ? (
                <Alert
                  message="DCTAP Detected"
                  description="A DCTAP profile was found embedded in the spreadsheet."
                  type="success"
                  showIcon
                />
              ) : (
                <>
                  <Alert
                    message="No DCTAP Found"
                    description="No DCTAP profile was detected. Please select one below."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Form.Item label="Select DCTAP Profile">
                    <Select
                      value={selectedDCTAP}
                      onChange={setSelectedDCTAP}
                      placeholder="Choose a DCTAP profile"
                      style={{ width: '100%' }}
                    >
                      {mockDCTAPProfiles.map(profile => (
                        <Option key={profile.id} value={profile.id}>
                          <Space>
                            <Text strong>{profile.name}</Text>
                            <Text type="secondary">({profile.namespace})</Text>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </>
              )}
            </Card>
            
            <Space>
              <Button onClick={handleBack}>Back</Button>
              <Button type="primary" onClick={handleNext}>
                Continue
              </Button>
            </Space>
          </Space>
        );
        
      case 3:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Title level={4}>Project Assignment</Title>
              
              <Radio.Group
                value={projectMode}
                onChange={(e) => setProjectMode(e.target.value)}
                style={{ marginBottom: 16 }}
              >
                <Space direction="vertical">
                  <Radio value="existing">Use Existing Project</Radio>
                  <Radio value="create">Create New Project</Radio>
                </Space>
              </Radio.Group>
              
              {projectMode === 'existing' ? (
                <Form.Item label="Select Project">
                  <Select
                    value={selectedProject}
                    onChange={setSelectedProject}
                    placeholder="Choose a project"
                    style={{ width: '100%' }}
                  >
                    {mockProjects.map(project => (
                      <Option key={project.id} value={project.id}>
                        <Space direction="vertical" size={0}>
                          <Text strong>{project.name}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Review Group: {project.reviewGroup}
                          </Text>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <>
                  <Form.Item label="Project Name">
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </Form.Item>
                  <Form.Item label="Review Group">
                    <Input
                      value={newProjectReviewGroup}
                      onChange={(e) => setNewProjectReviewGroup(e.target.value)}
                      placeholder="Enter review group"
                    />
                  </Form.Item>
                </>
              )}
            </Card>
            
            <Card>
              <Title level={4}>Additional Notes</Title>
              <TextArea
                rows={4}
                placeholder="Any additional information about this spreadsheet adoption..."
              />
            </Card>
            
            <Space>
              <Button onClick={handleBack}>Back</Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                Submit for Adoption
              </Button>
            </Space>
          </Space>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Link href="/dashboard/admin">
            <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
              Back to Dashboard
            </Button>
          </Link>
          
          <Title level={2}>Adopt Spreadsheet</Title>
          <Paragraph type="secondary">
            Import vocabulary data from Google Sheets into the IFLA Standards system.
            {userName && (
              <Text> Submitted by: <strong>{userName}</strong></Text>
            )}
          </Paragraph>
        </div>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}
        
        {success && (
          <Alert
            message="Success"
            description={success}
            type="success"
            showIcon
            closable
            onClose={() => setSuccess(null)}
          />
        )}
        
        <Card>
          <Steps current={activeStep} items={steps} style={{ marginBottom: 32 }} />
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Spin size="large" />
              <Paragraph style={{ marginTop: 16 }}>Processing...</Paragraph>
            </div>
          ) : (
            renderStepContent(activeStep)
          )}
        </Card>
      </Space>
    </div>
  );
}