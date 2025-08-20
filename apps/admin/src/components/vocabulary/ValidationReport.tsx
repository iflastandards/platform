'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  List,
  Tag,
  Collapse,
  Button,
  Alert,
  Tabs,
  Progress,
  Space,
  Row,
  Col,
  Badge,
  Statistic,
} from 'antd';
import {
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  DownOutlined,
  UpOutlined,
  DownloadOutlined,
  ReloadOutlined,
  BugOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  CodeOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

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

export default function ValidationReport({
  issues,
  summary,
  loading = false,
  onRefresh,
  onFixIssue,
  onDownloadReport,
  title = 'Validation Report',
}: ValidationReportProps) {
  const [activeTab, setActiveTab] = useState('1');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'syntax':
        return <CodeOutlined />;
      case 'security':
        return <SafetyCertificateOutlined />;
      case 'performance':
        return <DashboardOutlined />;
      default:
        return <BugOutlined />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'orange';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, ValidationIssue[]>);

  const filterIssues = (type?: string) => {
    if (!type) return issues;
    return issues.filter((issue) => issue.type === type);
  };

  const renderIssuItem = (issue: ValidationIssue) => (
    <List.Item
      key={issue.id}
      actions={[
        issue.fixAction && (
          <Button
            size="small"
            type={issue.fixAction.automated ? 'primary' : 'default'}
            onClick={() => onFixIssue?.(issue)}
          >
            {issue.fixAction.label}
          </Button>
        ),
      ].filter(Boolean)}
    >
      <List.Item.Meta
        avatar={getIssueIcon(issue.type)}
        title={
          <Space>
            <Text strong>{issue.message}</Text>
            <Tag color={getSeverityColor(issue.severity)}>
              {issue.severity.toUpperCase()}
            </Tag>
            {issue.ruleCode && <Text type="secondary">({issue.ruleCode})</Text>}
          </Space>
        }
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            {issue.description && <Paragraph>{issue.description}</Paragraph>}
            {issue.location && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Location: {issue.location.sheet && `Sheet: ${issue.location.sheet}, `}
                {issue.location.row && `Row: ${issue.location.row}, `}
                {issue.location.column && `Column: ${issue.location.column}`}
                {issue.location.range && ` (Range: ${issue.location.range})`}
              </Text>
            )}
            {issue.suggestion && (
              <Alert
                message="Suggestion"
                description={issue.suggestion}
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
            {issue.documentation && (
              <a href={issue.documentation} target="_blank" rel="noopener noreferrer">
                View documentation →
              </a>
            )}
          </Space>
        }
      />
    </List.Item>
  );

  const tabItems = [
    {
      key: '1',
      label: (
        <Badge count={issues.length} offset={[10, 0]}>
          All Issues
        </Badge>
      ),
      children: (
        <Collapse
          expandIcon={({ isActive }) => isActive ? <UpOutlined /> : <DownOutlined />}
          activeKey={expandedCategories}
          onChange={setExpandedCategories}
        >
          {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
            <Panel
              key={category}
              header={
                <Space>
                  {getCategoryIcon(category)}
                  <Text strong>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  <Badge count={categoryIssues.length} />
                </Space>
              }
            >
              <List
                dataSource={categoryIssues}
                renderItem={renderIssuItem}
              />
            </Panel>
          ))}
        </Collapse>
      ),
    },
    {
      key: '2',
      label: (
        <Badge count={summary.errors} offset={[10, 0]} color="red">
          Errors
        </Badge>
      ),
      children: (
        <List
          dataSource={filterIssues('error')}
          renderItem={renderIssuItem}
          locale={{ emptyText: 'No errors found' }}
        />
      ),
    },
    {
      key: '3',
      label: (
        <Badge count={summary.warnings} offset={[10, 0]} color="orange">
          Warnings
        </Badge>
      ),
      children: (
        <List
          dataSource={filterIssues('warning')}
          renderItem={renderIssuItem}
          locale={{ emptyText: 'No warnings found' }}
        />
      ),
    },
    {
      key: '4',
      label: (
        <Badge count={summary.info} offset={[10, 0]} color="blue">
          Info
        </Badge>
      ),
      children: (
        <List
          dataSource={filterIssues('info')}
          renderItem={renderIssuItem}
          locale={{ emptyText: 'No information messages' }}
        />
      ),
    },
  ];

  return (
    <Card>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>{title}</Title>
            <Text type="secondary">
              Last run: {new Date(summary.lastRun).toLocaleString()} ({summary.duration}ms)
            </Text>
          </Col>
          <Col>
            <Space>
              {onRefresh && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  loading={loading}
                >
                  Refresh
                </Button>
              )}
              {onDownloadReport && (
                <Button
                  icon={<DownloadOutlined />}
                  onClick={onDownloadReport}
                >
                  Download Report
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Validation Score"
              value={summary.score}
              suffix="/100"
              valueStyle={{ color: getScoreColor(summary.score) }}
            />
            <Progress
              percent={summary.score}
              strokeColor={getScoreColor(summary.score)}
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Total Issues"
              value={summary.total}
              valueStyle={{ color: summary.total > 0 ? '#8c8c8c' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Errors"
              value={summary.errors}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Warnings"
              value={summary.warnings}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Info"
              value={summary.info}
              valueStyle={{ color: '#1890ff' }}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Passed"
              value={summary.success}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Overall Status Alert */}
      {summary.total === 0 ? (
        <Alert
          message="Validation Passed"
          description="No issues found. Your vocabulary data meets all validation requirements."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : summary.errors > 0 ? (
        <Alert
          message="Validation Failed"
          description={`Found ${summary.errors} error(s) that must be fixed before proceeding.`}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : summary.warnings > 0 ? (
        <Alert
          message="Validation Passed with Warnings"
          description={`Found ${summary.warnings} warning(s) that should be reviewed.`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : (
        <Alert
          message="Validation Complete"
          description={`Found ${summary.info} informational message(s).`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Issues Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* Category Breakdown */}
      <Card title="Issue Categories" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
            <Col span={8} key={category}>
              <Card size="small">
                <Space align="center">
                  {getCategoryIcon(category)}
                  <div>
                    <Text strong>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <br />
                    <Text type="secondary">{categoryIssues.length} issues</Text>
                  </div>
                </Space>
                <Progress
                  percent={Math.round((categoryIssues.length / summary.total) * 100)}
                  size="small"
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </Card>
  );
}