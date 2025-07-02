"use client";

import React, { useState } from 'react';
import { DocusaurusNavbar } from '@/app/components/docusaurus-navbar';
import { useInactivityLogout } from '@/app/hooks/useInactivityLogout';

interface ManagementAction {
  id: string;
  title: string;
  description: string;
  type: 'github-cli' | 'codespaces' | 'internal' | 'external';
  disabled?: boolean;
}

interface TabData {
  id: string;
  label: string;
  actions: ManagementAction[];
}

export interface SiteManagementClientProps {
  siteTitle: string;
  siteCode: string;
  siteKey: string;
  githubRepo?: string;
}

const managementTabs: TabData[] = [
  {
    id: 'overview',
    label: 'Overview',
    actions: [] // Special case - will show dashboard
  },
  {
    id: 'content',
    label: 'Content Management',
    actions: [
      {
        id: 'create-page',
        title: 'Create New Page',
        description: 'Add new documentation pages for elements, terms, or concepts',
        type: 'github-cli'
      },
      {
        id: 'scaffold-elements',
        title: 'Scaffold Element Pages',
        description: 'Generate element documentation from CSV data',
        type: 'github-cli'
      },
      {
        id: 'scaffold-vocabularies',
        title: 'Scaffold Vocabulary Pages',
        description: 'Generate value vocabulary pages from CSV data',
        type: 'github-cli'
      },
      {
        id: 'update-examples',
        title: 'Manage Examples',
        description: 'Add, edit, or organize usage examples',
        type: 'codespaces'
      },
      {
        id: 'organize-sidebar',
        title: 'Organize Navigation',
        description: 'Reorder sidebar structure and categorization',
        type: 'codespaces'
      }
    ]
  },
  {
    id: 'rdf',
    label: 'RDF & Vocabularies',
    actions: [
      {
        id: 'csv-to-rdf',
        title: 'CSV → RDF',
        description: 'Convert CSV vocabulary data to RDF format',
        type: 'github-cli'
      },
      {
        id: 'rdf-to-csv',
        title: 'RDF → CSV',
        description: 'Extract CSV data from RDF fragments',
        type: 'github-cli'
      },
      {
        id: 'sync-sheets',
        title: 'Sync Google Sheets',
        description: 'Pull/push data between CSV files and Google Sheets',
        type: 'github-cli'
      },
      {
        id: 'validate-rdf',
        title: 'Validate RDF',
        description: 'Check RDF fragments against DCTAP profile',
        type: 'github-cli'
      },
      {
        id: 'update-dctap',
        title: 'Manage DC-TAP',
        description: 'Maintain DC-TAP and JSON-LD context files for this standard',
        type: 'codespaces'
      },
      {
        id: 'generate-release',
        title: 'Generate RDF Release',
        description: 'Compile fragments into master RDF files',
        type: 'github-cli'
      }
    ]
  },
  {
    id: 'workflow',
    label: 'Review & Workflow',
    actions: [
      {
        id: 'review-queue',
        title: 'Review Queue',
        description: 'View and manage pending content reviews',
        type: 'internal'
      },
      {
        id: 'assign-reviewers',
        title: 'Assign Reviewers',
        description: 'Assign team members to review specific content',
        type: 'internal'
      },
      {
        id: 'track-deadlines',
        title: 'Track Deadlines',
        description: 'Monitor review timelines and upcoming deadlines',
        type: 'internal'
      },
      {
        id: 'workflow-status',
        title: 'Content Status',
        description: 'View what content is in each workflow stage',
        type: 'internal'
      },
      {
        id: 'merge-approved',
        title: 'Merge Approved Changes',
        description: 'Integrate reviewed and approved content',
        type: 'github-cli'
      }
    ]
  },
  {
    id: 'team',
    label: 'Team Management',
    actions: [
      {
        id: 'manage-members',
        title: 'Manage Team Members',
        description: 'Add or remove contributors to this standard',
        type: 'external'
      },
      {
        id: 'assign-roles',
        title: 'Assign Roles',
        description: 'Set reviewer and editor permissions',
        type: 'external'
      },
      {
        id: 'view-activity',
        title: 'View Team Activity',
        description: 'Monitor contributions and recent changes',
        type: 'internal'
      },
      {
        id: 'team-settings',
        title: 'Team Settings',
        description: 'Configure team preferences and notifications',
        type: 'internal'
      }
    ]
  },
  {
    id: 'releases',
    label: 'Releases & Publishing',
    actions: [
      {
        id: 'create-release',
        title: 'Create Release Candidate',
        description: 'Package content for testing and review',
        type: 'github-cli'
      },
      {
        id: 'release-notes',
        title: 'Generate Release Notes',
        description: 'Document changes and updates for this release',
        type: 'codespaces'
      },
      {
        id: 'export-pdf',
        title: 'Export PDF',
        description: 'Generate downloadable PDF documentation',
        type: 'github-cli'
      },
      {
        id: 'tag-release',
        title: 'Tag Stable Release',
        description: 'Mark and publish a stable version',
        type: 'github-cli'
      },
      {
        id: 'deploy-production',
        title: 'Deploy to Production',
        description: 'Publish approved release to live site',
        type: 'github-cli'
      }
    ]
  },
  {
    id: 'quality',
    label: 'Quality Assurance',
    actions: [
      {
        id: 'validate-links',
        title: 'Validate Links',
        description: 'Check all internal and external references',
        type: 'github-cli'
      },
      {
        id: 'check-consistency',
        title: 'Check Consistency',
        description: 'Validate terminology and cross-references',
        type: 'github-cli'
      },
      {
        id: 'accessibility-audit',
        title: 'Accessibility Audit',
        description: 'Verify WCAG compliance across all pages',
        type: 'github-cli'
      },
      {
        id: 'translation-check',
        title: 'Translation Status',
        description: 'Review multilingual content consistency',
        type: 'internal'
      },
      {
        id: 'performance-test',
        title: 'Performance Test',
        description: 'Check site speed and build performance',
        type: 'github-cli'
      }
    ]
  }
];

function StatusDashboard({ siteTitle, siteCode }: { siteTitle: string, siteCode: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">{siteTitle} Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <span className="font-medium text-gray-900 dark:text-gray-100">Last Updated:</span>
            <span className="text-gray-600 dark:text-gray-400 font-semibold">2 hours ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <span className="font-medium text-gray-900 dark:text-gray-100">Build Status:</span>
            <span className="text-green-600 dark:text-green-400 font-semibold">Passing</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <span className="font-medium text-gray-900 dark:text-gray-100">Open PRs:</span>
            <span className="text-gray-600 dark:text-gray-400 font-semibold">3</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <span className="font-medium text-gray-900 dark:text-gray-100">Pending Reviews:</span>
            <span className="text-gray-600 dark:text-gray-400 font-semibold">5</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">Recent Activity - {siteCode}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">2h ago</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">Updated element C2001</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">1d ago</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">Merged PR #45</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">2d ago</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">Added new vocabulary terms</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">Quick Actions</h3>
        <div className="flex flex-col gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed" disabled>
            New Content
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed" disabled>
            Sync Sheets
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium opacity-50 cursor-not-allowed" disabled>
            View PRs
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">Team Overview</h3>
        <div className="flex justify-around gap-4">
          <div className="text-center">
            <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">8</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team Members</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">3</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Reviewers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionGrid({ actions }: { actions: ManagementAction[] }) {
  const getActionTypeIcon = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli': return '⚡';
      case 'codespaces': return '💻';
      case 'internal': return '🔧';
      case 'external': return '🔗';
      default: return '📋';
    }
  };
  
  const getActionTypeLabel = (type: ManagementAction['type']) => {
    switch (type) {
      case 'github-cli': return 'GitHub CLI';
      case 'codespaces': return 'Codespaces';
      case 'internal': return 'Internal Tool';
      case 'external': return 'External Link';
      default: return 'Action';
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {actions.map((action) => (
        <div 
          key={action.id} 
          className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm 
            transition-all duration-200 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 
            flex flex-col ${action.disabled ? 'opacity-70 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700' : ''}`}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex-1">{action.title}</h4>
            <span className="text-xl ml-2" title={getActionTypeLabel(action.type)}>
              {getActionTypeIcon(action.type)}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">{action.description}</p>
          <div className="flex justify-between items-center gap-2">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                action.disabled !== false 
                  ? 'bg-gray-200 text-gray-700 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={action.disabled !== false}
            >
              {action.disabled !== false ? 'Coming Soon' : 'Run Action'}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {getActionTypeLabel(action.type)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SiteManagementClient({ 
  siteTitle, 
  siteCode, 
  siteKey,
  githubRepo = 'iflastandards/standards-dev' 
}: SiteManagementClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Set up inactivity logout with warning
  useInactivityLogout({
    timeoutMinutes: 30,
    warningMinutes: 5,
    checkKeepSignedIn: true,
    onWarning: () => {
      // Could show a toast notification here
      console.log('Session will expire in 5 minutes due to inactivity');
    },
    onLogout: () => {
      console.log('Logging out due to inactivity');
    }
  });
  
  const currentTab = managementTabs.find(tab => tab.id === activeTab);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DocusaurusNavbar siteKey={siteKey} />
      <div className="py-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{siteTitle} Management</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage content, workflows, and team collaboration for the {siteTitle} standard
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 border-b-2 border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {managementTabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-3 transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 font-semibold' 
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'overview' ? (
            <StatusDashboard siteTitle={siteTitle} siteCode={siteCode} />
          ) : (
            currentTab && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{currentTab.label}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage {currentTab.label.toLowerCase()} for {siteTitle}</p>
                </div>
                <ActionGrid actions={currentTab.actions} />
              </>
            )
          )}
        </div>
        
        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">External Resources</h4>
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