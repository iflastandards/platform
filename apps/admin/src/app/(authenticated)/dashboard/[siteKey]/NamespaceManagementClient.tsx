'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Alert,
  Tag,
  List,
  Divider,
  Space,
  Drawer,
  Row,
  Col,
  Menu,
  Badge,
  type MenuProps,
} from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  TeamOutlined,
  DeploymentUnitOutlined,
  SafetyCertificateOutlined,
  GithubOutlined,
  SettingOutlined,
  ToolOutlined,
  MenuOutlined,
  ThunderboltOutlined,
  DesktopOutlined,
  BuildOutlined,
  LinkOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Skip Links Component
const SkipLinks = () => (
  <div
    style={{
      position: 'absolute',
      left: '-9999px',
      top: 0,
    }}
    className="skip-links"
  >
    <a href="#main-content" style={{ color: 'white', marginRight: 16 }}>
      Skip to main content
    </a>
    <a href="#navigation" style={{ color: 'white', marginRight: 16 }}>
      Skip to navigation
    </a>
    <a href="#external-resources" style={{ color: 'white' }}>
      Skip to external resources
    </a>
  </div>
);

// Live Region for announcements
const LiveRegion = ({ message }: { message: string }) => (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    style={{ 
      position: 'absolute',
      left: '-9999px',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    }}
  >
    {message}
  </div>
);

interface ManagementAction {
  id: string;
  title: string;
  description: string;
  type: 'github-cli' | 'codespaces' | 'internal' | 'external';
  disabled?: boolean;
  requiredRole?: 'superadmin' | 'namespace-admin' | 'namespace-editor';
}

interface TabData {
  id: string;
  label: string;
  actions: ManagementAction[];
  specialCaseOnly?: boolean;
}

export interface NamespaceManagementClientProps {
  namespaceTitle: string;
  namespaceCode: string;
  namespaceKey: string;
  githubRepo?: string;
  isSpecialCase?: boolean;
  isSuperAdmin?: boolean;
}

// Tab configurations remain the same
const standardNamespaceTabs: TabData[] = [
  {
    id: 'overview',
    label: 'Overview',
    actions: [],
  },
  {
    id: 'content',
    label: 'Content Management',
    actions: [
      {
        id: 'create-page',
        title: 'Create New Page',
        description: 'Add new documentation pages for elements, terms, or concepts',
        type: 'github-cli',
      },
      {
        id: 'scaffold-elements',
        title: 'Scaffold Element Pages',
        description: 'Generate element documentation from CSV data',
        type: 'github-cli',
      },
      {
        id: 'scaffold-vocabularies',
        title: 'Scaffold Vocabulary Pages',
        description: 'Generate value vocabulary pages from CSV data',
        type: 'github-cli',
      },
      {
        id: 'update-examples',
        title: 'Manage Examples',
        description: 'Add, edit, or organize usage examples',
        type: 'codespaces',
      },
      {
        id: 'organize-sidebar',
        title: 'Organize Navigation',
        description: 'Reorder sidebar structure and categorization',
        type: 'codespaces',
      },
    ],
  },
  {
    id: 'rdf',
    label: 'RDF & Vocabularies',
    actions: [
      {
        id: 'csv-to-rdf',
        title: 'CSV → RDF',
        description: 'Convert CSV vocabulary data to RDF format',
        type: 'github-cli',
      },
      {
        id: 'rdf-to-csv',
        title: 'RDF → CSV',
        description: 'Extract CSV data from RDF fragments',
        type: 'github-cli',
      },
      {
        id: 'sync-sheets',
        title: 'Sync Google Sheets',
        description: 'Pull/push data between CSV files and Google Sheets',
        type: 'github-cli',
      },
      {
        id: 'validate-rdf',
        title: 'Validate RDF',
        description: 'Check RDF fragments against DCTAP profile',
        type: 'github-cli',
      },
      {
        id: 'update-dctap',
        title: 'Manage DC-TAP',
        description: 'Maintain DC-TAP and JSON-LD context files for this namespace',
        type: 'codespaces',
      },
      {
        id: 'generate-release',
        title: 'Generate RDF Release',
        description: 'Compile fragments into master RDF files',
        type: 'github-cli',
      },
    ],
  },
  {
    id: 'workflow',
    label: 'Review & Workflow',
    actions: [
      {
        id: 'review-queue',
        title: 'Review Queue',
        description: 'View and manage pending content reviews',
        type: 'internal',
      },
      {
        id: 'assign-reviewers',
        title: 'Assign Reviewers',
        description: 'Assign team members to review specific content',
        type: 'internal',
      },
      {
        id: 'track-deadlines',
        title: 'Track Deadlines',
        description: 'Monitor review timelines and upcoming deadlines',
        type: 'internal',
      },
      {
        id: 'workflow-status',
        title: 'Content Status',
        description: 'View what content is in each workflow stage',
        type: 'internal',
      },
      {
        id: 'merge-approved',
        title: 'Merge Approved Changes',
        description: 'Integrate reviewed and approved content',
        type: 'github-cli',
      },
    ],
  },
  {
    id: 'team',
    label: 'Team Management',
    actions: [
      {
        id: 'manage-members',
        title: 'Manage Team Members',
        description: 'Add or remove contributors to this namespace',
        type: 'external',
      },
      {
        id: 'assign-roles',
        title: 'Assign Roles',
        description: 'Set reviewer and editor permissions for this namespace',
        type: 'external',
      },
      {
        id: 'view-activity',
        title: 'View Team Activity',
        description: 'Monitor contributions and recent changes',
        type: 'internal',
      },
      {
        id: 'team-settings',
        title: 'Team Settings',
        description: 'Configure team preferences and notifications',
        type: 'internal',
      },
    ],
  },
  {
    id: 'releases',
    label: 'Releases & Publishing',
    actions: [
      {
        id: 'create-release',
        title: 'Create Release Candidate',
        description: 'Package content for testing and review',
        type: 'github-cli',
      },
      {
        id: 'release-notes',
        title: 'Generate Release Notes',
        description: 'Document changes and updates for this release',
        type: 'codespaces',
      },
      {
        id: 'export-pdf',
        title: 'Export PDF',
        description: 'Generate downloadable PDF documentation',
        type: 'github-cli',
      },
      {
        id: 'tag-release',
        title: 'Tag Stable Release',
        description: 'Mark and publish a stable version',
        type: 'github-cli',
      },
      {
        id: 'deploy-production',
        title: 'Deploy to Production',
        description: 'Publish approved release to live site',
        type: 'github-cli',
      },
    ],
  },
  {
    id: 'quality',
    label: 'Quality Assurance',
    actions: [
      {
        id: 'validate-links',
        title: 'Validate Links',
        description: 'Check all internal and external references',
        type: 'github-cli',
      },
      {
        id: 'check-consistency',
        title: 'Check Consistency',
        description: 'Validate terminology and cross-references',
        type: 'github-cli',
      },
      {
        id: 'accessibility-audit',
        title: 'Accessibility Audit',
        description: 'Verify WCAG compliance across all pages',
        type: 'github-cli',
      },
      {
        id: 'translation-check',
        title: 'Translation Status',
        description: 'Review multilingual content consistency',
        type: 'internal',
      },
      {
        id: 'performance-test',
        title: 'Performance Test',
        description: 'Check site speed and build performance',
        type: 'github-cli',
      },
    ],
  },
  {
    id: 'github',
    label: 'GitHub',
    actions: [
      {
        id: 'browse-repository',
        title: 'Browse Code',
        description: 'Explore repository files and history',
        type: 'external',
      },
      {
        id: 'view-issues',
        title: 'Open Issues',
        description: 'View and manage GitHub issues',
        type: 'external',
      },
      {
        id: 'manage-prs',
        title: 'Manage PRs',
        description: 'Review and manage pull requests',
        type: 'external',
      },
      {
        id: 'create-issue',
        title: 'Create Issue',
        description: 'Report bugs or request features',
        type: 'external',
      },
      {
        id: 'repository-stats',
        title: 'Repository Stats',
        description: 'View detailed repository analytics and metrics',
        type: 'internal',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    actions: [
      {
        id: 'namespace-config',
        title: 'Namespace Configuration',
        description: 'Modify namespace settings and metadata',
        type: 'codespaces',
      },
      {
        id: 'navigation-config',
        title: 'Navigation Settings',
        description: 'Configure namespace navigation and menus',
        type: 'codespaces',
      },
      {
        id: 'theme-settings',
        title: 'Theme Configuration',
        description: 'Customize namespace appearance and branding',
        type: 'codespaces',
      },
      {
        id: 'deployment-config',
        title: 'Deployment Settings',
        description: 'Configure deployment and hosting options',
        type: 'internal',
      },
      {
        id: 'backup-restore',
        title: 'Backup & Restore',
        description: 'Manage namespace backups and restoration',
        type: 'github-cli',
      },
    ],
  },
];

const specialCaseTabs: TabData[] = [
  {
    id: 'system',
    label: 'System Management',
    specialCaseOnly: true,
    actions: [
      {
        id: 'manage-namespaces',
        title: 'Manage All Namespaces',
        description: 'Create, configure, and manage all platform namespaces',
        type: 'internal',
        requiredRole: 'superadmin',
      },
      {
        id: 'system-settings',
        title: 'Platform Settings',
        description: 'Configure platform-wide settings and features',
        type: 'internal',
        requiredRole: 'superadmin',
      },
      {
        id: 'user-management',
        title: 'Global User Management',
        description: 'Manage users across all namespaces',
        type: 'internal',
        requiredRole: 'superadmin',
      },
      {
        id: 'deployment-control',
        title: 'Deployment Control',
        description: 'Manage platform deployments and infrastructure',
        type: 'internal',
        requiredRole: 'superadmin',
      },
    ],
  },
];

function NamespaceDashboard({
  namespaceTitle,
  namespaceCode,
  namespaceKey,
  isSpecialCase,
}: {
  namespaceTitle: string;
  namespaceCode: string;
  namespaceKey: string;
  isSpecialCase?: boolean;
}) {
  return (
    <div>
      {isSpecialCase && (
        <Alert
          message="Special Management Area"
          description={
            namespaceKey === 'portal' ? (
              <>
                The Portal is not a standard namespace. It serves as the main IFLA standards platform 
                and requires superadmin permissions for all management operations.
              </>
            ) : (
              <>
                This is a development/testing environment, not a standard namespace. 
                It requires superadmin permissions and should be used with caution.
              </>
            )
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card 
            title={isSpecialCase ? 'System Status' : 'Namespace Status'}
          >
            <List
              size="small"
              split
              dataSource={[
                { label: 'Type', value: isSpecialCase ? 'Special System Area' : 'Standard Namespace' },
                { label: 'Last Updated', value: '2 hours ago' },
                { label: 'Build Status', value: <Tag color="success">Passing</Tag> },
                { label: isSpecialCase ? 'System Issues' : 'Open PRs', value: '3' },
                { label: isSpecialCase ? 'Active Tasks' : 'Pending Reviews', value: '5' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text strong>{item.label}:</Text> {item.value}
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card 
            title={`Recent Activity - ${namespaceCode}`}
          >
            <List
              size="small"
              dataSource={
                isSpecialCase ? [
                  { text: 'System configuration updated', time: '1h ago' },
                  { text: 'New namespace created: test-ns', time: '3h ago' },
                  { text: 'Platform deployment completed', time: '1d ago' },
                ] : [
                  { text: 'Updated element C2001', time: '2h ago' },
                  { text: 'Merged PR #45', time: '1d ago' },
                  { text: 'Added new vocabulary terms', time: '2d ago' },
                ]
              }
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={0}>
                    <Text>{item.text}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                disabled
                block
                style={{ minHeight: 44 }}
              >
                {isSpecialCase ? 'System Config' : 'New Content'}
              </Button>
              <Button
                disabled
                block
                style={{ minHeight: 44 }}
              >
                {isSpecialCase ? 'User Management' : 'Sync Sheets'}
              </Button>
              <Button
                disabled
                block
                style={{ minHeight: 44 }}
              >
                {isSpecialCase ? 'Deploy' : 'View PRs'}
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={isSpecialCase ? 'System Overview' : 'Team Overview'}>
            <Row gutter={24}>
              {isSpecialCase ? (
                <>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>12</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>NAMESPACES</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>156</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>TOTAL USERS</Text>
                  </Col>
                </>
              ) : (
                <>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>8</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>TEAM MEMBERS</Text>
                  </Col>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>3</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>ACTIVE REVIEWERS</Text>
                  </Col>
                </>
              )}
            </Row>
          </Card>
        </Col>
      </Row>

      {!isSpecialCase && (
        <Alert
          message="Namespace Management"
          description={
            <>
              This dashboard manages the <strong>{namespaceTitle}</strong> namespace. 
              Each namespace represents a distinct IFLA standard with its own content, team, and workflow.
            </>
          }
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      )}
    </div>
  );
}

function ActionGrid({ 
  actions, 
  isSuperAdmin 
}: { 
  actions: ManagementAction[];
  isSuperAdmin?: boolean;
}) {
  const getActionTypeIcon = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli':
        return <ThunderboltOutlined />;
      case 'codespaces':
        return <DesktopOutlined />;
      case 'internal':
        return <BuildOutlined />;
      case 'external':
        return <LinkOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getActionTypeLabel = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli':
        return 'GitHub CLI';
      case 'codespaces':
        return 'Codespaces';
      case 'internal':
        return 'Internal Tool';
      case 'external':
        return 'External Link';
      default:
        return 'Action';
    }
  };

  const canAccessAction = (action: ManagementAction) => {
    if (!action.requiredRole) {return true;}
    return action.requiredRole === 'superadmin' ? isSuperAdmin : true;
  };

  return (
    <Row gutter={[24, 24]}>
      {actions.map((action) => {
        const hasAccess = canAccessAction(action);
        return (
          <Col xs={24} md={12} lg={8} key={action.id}>
            <Card 
              style={{ height: '100%', opacity: hasAccess ? 1 : 0.6 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {getActionTypeIcon(action.type)}
                  <Title level={5} style={{ margin: 0 }}>{action.title}</Title>
                </Space>
                <Paragraph type="secondary">
                  {action.description}
                </Paragraph>
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    disabled={!hasAccess || action.disabled === true}
                    style={{ minHeight: 36 }}
                  >
                    {!hasAccess ? 'Superadmin Only' : action.disabled === true ? 'Coming Soon' : 'Run Action'}
                  </Button>
                  <Tag>{getActionTypeLabel(action.type)}</Tag>
                </Space>
              </Space>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

function getTabIcon(tabId: string) {
  switch(tabId) {
    case 'overview': return <DashboardOutlined />;
    case 'content': return <FileTextOutlined />;
    case 'rdf': return <DatabaseOutlined />;
    case 'workflow': return <BranchesOutlined />;
    case 'team': return <TeamOutlined />;
    case 'releases': return <DeploymentUnitOutlined />;
    case 'quality': return <SafetyCertificateOutlined />;
    case 'github': return <GithubOutlined />;
    case 'settings': return <SettingOutlined />;
    case 'system': return <ToolOutlined />;
    default: return null;
  }
}

export default function NamespaceManagementClient({
  namespaceTitle,
  namespaceCode,
  namespaceKey,
  githubRepo = 'iflastandards/standards-dev',
  isSpecialCase = false,
  isSuperAdmin = false,
}: NamespaceManagementClientProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  const availableTabs = isSpecialCase && isSuperAdmin 
    ? [...standardNamespaceTabs, ...specialCaseTabs]
    : standardNamespaceTabs;

  const currentTab = availableTabs.find(tab => tab.id === selectedTab);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    setLiveMessage(mobileOpen ? 'Navigation closed' : 'Navigation opened');
  };

  const handleTabSelect = (tabId: string, tabLabel: string) => {
    setSelectedTab(tabId);
    setLiveMessage(`Switched to ${tabLabel} section`);
    setMobileOpen(false);
    // Clear message after announcement
    setTimeout(() => setLiveMessage(''), 1000);
  };

  const menuItems: MenuProps['items'] = availableTabs.map((tab) => ({
    key: tab.id,
    icon: getTabIcon(tab.id),
    label: (
      <Space>
        {tab.label}
        {tab.specialCaseOnly && <Tag color="warning">System</Tag>}
      </Space>
    ),
    onClick: () => handleTabSelect(tab.id, tab.label),
  }));

  const drawerContent = (
    <div role="navigation" aria-label="Dashboard navigation">
      <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>{namespaceCode}</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {isSpecialCase ? 'System Management' : 'Namespace Management'}
        </Text>
      </div>
      <Menu
        id="navigation"
        mode="inline"
        selectedKeys={[selectedTab]}
        items={menuItems}
        style={{ border: 'none' }}
      />
      <Divider />
      <div style={{ padding: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {namespaceTitle}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
          <Badge status="success" />
          <Text style={{ fontSize: 12, marginLeft: 8 }}>Connected</Text>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SkipLinks />
      <LiveRegion message={liveMessage} />
      
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile Header */}
        <div style={{ 
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
          alignItems: 'center',
          zIndex: 100,
        }}
        className="mobile-header"
        >
          <Button
            icon={<MenuOutlined />}
            onClick={handleDrawerToggle}
            style={{ marginRight: 16 }}
          />
          <Title level={4} style={{ margin: 0 }}>{namespaceTitle}</Title>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title={null}
          placement="left"
          onClose={handleDrawerToggle}
          open={mobileOpen}
          width={240}
          closable={false}
          className="mobile-drawer"
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Sidebar */}
        <div 
          style={{ 
            width: 240,
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            height: '100vh',
            position: 'sticky',
            top: 0,
          }}
          className="desktop-sidebar"
        >
          {drawerContent}
        </div>

        {/* Main Content */}
        <div
          id="main-content"
          style={{
            flex: 1,
            padding: 24,
            background: '#f5f5f5',
            minHeight: '100vh',
          }}
          className="main-content"
        >
          <div style={{ marginBottom: 24 }}>
            <Title level={2}>{currentTab?.label}</Title>
            <Text type="secondary">
              {namespaceTitle} - Dashboard and status overview
            </Text>
          </div>

          {selectedTab === 'overview' ? (
            <NamespaceDashboard 
              namespaceTitle={namespaceTitle} 
              namespaceCode={namespaceCode}
              namespaceKey={namespaceKey}
              isSpecialCase={isSpecialCase}
            />
          ) : (
            <ActionGrid 
              actions={currentTab?.actions || []} 
              isSuperAdmin={isSuperAdmin}
            />
          )}

          <div 
            style={{ marginTop: 32 }}
            id="external-resources"
            role="region"
            aria-labelledby="external-resources-title"
          >
            <Title 
              level={4}
              id="external-resources-title"
            >
              External Resources
            </Title>
            <Space wrap>
              <Button
                icon={<GithubOutlined />}
                href={`https://github.com/${githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: 44 }}
              >
                GitHub Repository
              </Button>
              <Button
                href={`https://github.com/${githubRepo}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: 44 }}
              >
                Issues
              </Button>
              <Button
                href={`https://github.com/${githubRepo}/pulls`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: 44 }}
              >
                Pull Requests
              </Button>
              <Button
                href="https://github.com/orgs/iflastandards/teams"
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: 44 }}
              >
                Team Management
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
          .main-content {
            padding-top: 88px !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-drawer {
            display: none !important;
          }
        }
        .skip-links:focus-within {
          position: static !important;
          left: auto !important;
          top: auto !important;
          z-index: 9999;
          padding: 16px;
          background: #1890ff;
        }
      `}</style>
    </>
  );
}