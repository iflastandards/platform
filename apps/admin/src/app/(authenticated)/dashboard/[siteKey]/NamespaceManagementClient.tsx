'use client';

import React, { useState } from 'react';
import { DocusaurusNavbar } from '@/app/components/docusaurus-navbar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, ShieldAlertIcon } from 'lucide-react';

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
  specialCaseOnly?: boolean; // For tabs only available to portal/newtest
}

export interface NamespaceManagementClientProps {
  namespaceTitle: string;
  namespaceCode: string;
  namespaceKey: string;
  githubRepo?: string;
  isSpecialCase?: boolean;
  isSuperAdmin?: boolean;
  namespaceDescription?: string;
}

// Different tab configurations for standard namespaces vs special cases
const standardNamespaceTabs: TabData[] = [
  {
    id: 'overview',
    label: 'Overview',
    actions: [], // Special case - will show dashboard
  },
  {
    id: 'content',
    label: 'Content Management',
    actions: [
      {
        id: 'create-page',
        title: 'Create New Page',
        description:
          'Add new documentation pages for elements, terms, or concepts',
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
        description:
          'Maintain DC-TAP and JSON-LD context files for this namespace',
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

// Additional tabs for portal/newtest special cases
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
    <div className="space-y-6">
      {/* Special case alert for portal/newtest */}
      {isSpecialCase && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
          <ShieldAlertIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle>Special Management Area</AlertTitle>
          <AlertDescription>
            {namespaceKey === 'portal' ? (
              <span>
                The Portal is not a standard namespace. It serves as the main IFLA standards platform 
                and requires superadmin permissions for all management operations.
              </span>
            ) : (
              <span>
                This is a development/testing environment, not a standard namespace. 
                It requires superadmin permissions and should be used with caution.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
            {isSpecialCase ? 'System' : 'Namespace'} Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Type:
              </span>
              <span className={`font-semibold ${isSpecialCase ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {isSpecialCase ? 'Special System Area' : 'Standard Namespace'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Last Updated:
              </span>
              <span className="text-gray-600 dark:text-gray-400 font-semibold">
                2 hours ago
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Build Status:
              </span>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                Passing
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {isSpecialCase ? 'System Issues' : 'Open PRs'}:
              </span>
              <span className="text-gray-600 dark:text-gray-400 font-semibold">
                3
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {isSpecialCase ? 'Active Tasks' : 'Pending Reviews'}:
              </span>
              <span className="text-gray-600 dark:text-gray-400 font-semibold">
                5
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
            Recent Activity - {namespaceCode}
          </h3>
          <div className="space-y-3">
            {isSpecialCase ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">
                    1h ago
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    System configuration updated
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">
                    3h ago
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    New namespace created: test-ns
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">
                    1d ago
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Platform deployment completed
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">
                    2h ago
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Updated element C2001
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">
                    1d ago
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Merged PR #45
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">
                    2d ago
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Added new vocabulary terms
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
              disabled
            >
              {isSpecialCase ? 'System Config' : 'New Content'}
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
              disabled
            >
              {isSpecialCase ? 'User Management' : 'Sync Sheets'}
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
              disabled
            >
              {isSpecialCase ? 'Deploy' : 'View PRs'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
            {isSpecialCase ? 'System Overview' : 'Team Overview'}
          </h3>
          <div className="flex justify-around gap-4">
            {isSpecialCase ? (
              <>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">
                    12
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Namespaces
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">
                    156
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Users
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">
                    8
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Team Members
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">
                    3
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Active Reviewers
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info alert for standard namespaces */}
      {!isSpecialCase && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Namespace Management</AlertTitle>
          <AlertDescription>
            This dashboard manages the <strong>{namespaceTitle}</strong> namespace. 
            Each namespace represents a distinct IFLA standard with its own content, team, and workflow.
          </AlertDescription>
        </Alert>
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
        return '⚡';
      case 'codespaces':
        return '💻';
      case 'internal':
        return '🔧';
      case 'external':
        return '🔗';
      default:
        return '📋';
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
    if (!action.requiredRole) return true;
    return action.requiredRole === 'superadmin' ? isSuperAdmin : true;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {actions.map((action) => {
        const hasAccess = canAccessAction(action);
        return (
          <div
            key={action.id}
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm 
              transition-all duration-200 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 
              flex flex-col ${action.disabled || !hasAccess ? 'opacity-70 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex-1">
                {action.title}
              </h4>
              <span
                className="text-xl ml-2"
                title={getActionTypeLabel(action.type)}
              >
                {getActionTypeIcon(action.type)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">
              {action.description}
            </p>
            <div className="flex justify-between items-center gap-2">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  action.disabled !== false || !hasAccess
                    ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={action.disabled !== false || !hasAccess}
              >
                {!hasAccess ? 'Superadmin Only' : action.disabled !== false ? 'Coming Soon' : 'Run Action'}
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {getActionTypeLabel(action.type)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function NamespaceManagementClient({
  namespaceTitle,
  namespaceCode,
  namespaceKey,
  githubRepo = 'iflastandards/standards-dev',
  isSpecialCase = false,
  isSuperAdmin = false,
  namespaceDescription,
}: NamespaceManagementClientProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Determine which tabs to show
  const availableTabs = isSpecialCase && isSuperAdmin 
    ? [...standardNamespaceTabs, ...specialCaseTabs]
    : standardNamespaceTabs;

  const currentTab = availableTabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DocusaurusNavbar siteKey={namespaceKey} />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {namespaceTitle} {isSpecialCase ? 'System' : 'Namespace'} Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {namespaceDescription || 
                (isSpecialCase 
                  ? `Manage system-wide settings and configuration for ${namespaceTitle}`
                  : `Manage content, workflows, and team collaboration for the ${namespaceTitle} namespace`
                )
              }
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 border-b-2 border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-3 transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 font-semibold'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${tab.specialCaseOnly ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.specialCaseOnly && (
                    <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">●</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'overview' ? (
              <NamespaceDashboard 
                namespaceTitle={namespaceTitle} 
                namespaceCode={namespaceCode}
                namespaceKey={namespaceKey}
                isSpecialCase={isSpecialCase}
              />
            ) : activeTab === 'github' ? (
              <>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
                    Repository Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Repository:
                      </span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {githubRepo}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Quick Actions:
                      </span>
                      <div className="flex gap-2">
                        <a
                          href={`https://github.com/${githubRepo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Repository
                        </a>
                        <a
                          href={`https://github.com/${githubRepo}/issues`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Open Issues
                        </a>
                        <a
                          href={`https://github.com/${githubRepo}/pulls`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                        >
                          PRs
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {currentTab && (
                  <ActionGrid 
                    actions={currentTab.actions} 
                    isSuperAdmin={isSuperAdmin}
                  />
                )}
              </>
            ) : activeTab === 'settings' ? (
              <>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
                    {isSpecialCase ? 'System' : 'Namespace'} Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Configuration
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {isSpecialCase 
                          ? `Manage system-wide configuration and settings for ${namespaceTitle}.`
                          : `Manage namespace configuration, navigation, and deployment settings for ${namespaceTitle}.`
                        }
                      </p>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {isSpecialCase ? 'System Key' : 'Namespace Key'}:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                            {namespaceKey}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {isSpecialCase ? 'System Code' : 'Namespace Code'}:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                            {namespaceCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {currentTab && (
                  <ActionGrid 
                    actions={currentTab.actions} 
                    isSuperAdmin={isSuperAdmin}
                  />
                )}
              </>
            ) : (
              currentTab && (
                <ActionGrid 
                  actions={currentTab.actions} 
                  isSuperAdmin={isSuperAdmin}
                />
              )
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
                External Resources
              </h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://github.com/${githubRepo}`}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Repository
                </a>
                <a
                  href={`https://github.com/${githubRepo}/issues`}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Issues
                </a>
                <a
                  href={`https://github.com/${githubRepo}/pulls`}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pull Requests
                </a>
                <a
                  href="https://github.com/orgs/iflastandards/teams"
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Team Management
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}