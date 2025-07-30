/**
 * Centralized selectors for e2e tests
 * 
 * This file contains common selectors used across multiple test files
 * to avoid duplication and ensure consistency when UI components change.
 */

// Authentication and User Interface (Admin Portal Only)
export const auth = {
  // Admin portal auth interface selectors (not used in Docusaurus sites)
  userButton: (userName: string) => ({
    role: 'button',
    name: userName
  }),
  
  // Generic user account button (used in simplified footer auth)
  accountButton: {
    role: 'button',
    name: /account/i
  },
  
  // Sign-in elements (admin portal only)
  signInHeading: 'Sign in to Admin Portal',
  githubSignInButton: {
    role: 'button',
    name: /sign in with github/i
  },
  
  // Menu items (for admin portal MUI-based dropdowns)
  manageMenuItem: {
    role: 'menuitem',
    name: /manage/i
  },
  logoutMenuItem: {
    role: 'menuitem', 
    name: /logout/i
  },
  
  // Keep logged in checkbox (admin portal only)
  keepLoggedInCheckbox: 'input[type="checkbox"]',
} as const;

// Dashboard and Role-based Routes  
export const dashboard = {
  // Updated role-based dashboard routes using the correct structure from apps/admin/src/app/(authenticated)/dashboard
  routes: {
    main: 'http://localhost:3007/dashboard',
    namespace: (siteKey: string) => `http://localhost:3007/dashboard/${siteKey}`,
    roleSpecific: {
      admin: 'http://localhost:3007/dashboard/admin',
      editor: 'http://localhost:3007/dashboard/editor', 
      author: 'http://localhost:3007/dashboard/author',
      rg: 'http://localhost:3007/dashboard/rg',
      pending: 'http://localhost:3007/dashboard/pending',
    }
  },
  
  // Role-based action buttons
  actions: {
    // Admin-level actions
    publishVersion: {
      role: 'button',
      name: 'Publish Version'
    },
    manageUsers: {
      role: 'button', 
      name: 'Manage Users'
    },
    
    // Editor-level actions
    editContent: {
      role: 'button',
      name: 'Edit Content'
    },
    sheetsToRdf: {
      role: 'button',
      name: 'Sheets → RDF'  
    },
    
    // Reviewer actions
    viewPullRequests: {
      role: 'button',
      name: 'View Pull Requests'
    },
    
    // Translator actions  
    translateContent: {
      role: 'button',
      name: 'Translate Content'
    }
  },
  
  // Access denied elements
  accessDenied: {
    heading: 'Access Denied',
    permissionMessage: /You don't have permission/,
    returnToDashboard: {
      role: 'link',
      name: 'Return to Dashboard'
    },
    requestAccess: {
      role: 'link', 
      name: 'Request Access'
    }
  }
} as const;

// Navigation and UI Components
export const navigation = {
  // MUI AppBar navigation
  navbar: {
    menuButton: '[aria-label="open drawer"]',
    title: 'IFLA Admin',
    notificationButton: '[aria-label="notifications"]',
    themeToggleButton: '[aria-label="toggle theme"]'
  },
  
  // Sidebar/Drawer navigation
  sidebar: {
    dashboardLink: {
      role: 'button',
      name: 'Dashboard'
    },
    namespacesExpander: {
      role: 'button', 
      name: 'Namespaces'
    },
    importWorkflow: {
      role: 'button',
      name: 'Import Workflow'  
    },
    translation: {
      role: 'button',
      name: 'Translation'
    },
    reviewQueue: {
      role: 'button',
      name: 'Review Queue'
    }
  },
  
  // Docusaurus-style navbar (for embedded or legacy views)
  docusaurusNavbar: {
    brand: '.docusaurus-navbar__brand',
    breadcrumb: '.docusaurus-navbar__breadcrumb',
    activeBreadcrumb: '.docusaurus-navbar__breadcrumb--active',
    userMenu: '.docusaurus-navbar__user-menu'
  }
} as const;

// Test Environment and Site Validation
export const sites = {
  // Site URLs for testing (port-based)
  urls: {
    newtest: 'http://localhost:3008/newtest/',
    admin: 'http://localhost:3007'
  },
  
  // Site-specific elements
  siteTitle: (siteName: string) => siteName,
  
  // Management link (appears in footer)
  managementLink: {
    role: 'link',
    name: /management/i
  },
  
  // Common site elements
  homeLink: {
    role: 'link',
    name: /home/i
  }
} as const;

// Form and Input Elements
export const forms = {
  checkbox: (label?: string) => label 
    ? { role: 'checkbox', name: label }
    : 'input[type="checkbox"]',
    
  textInput: (label?: string) => label
    ? { role: 'textbox', name: label } 
    : 'input[type="text"]',
    
  submitButton: {
    role: 'button',
    name: /submit|save|create/i
  }
} as const;

// Utility functions for dynamic selectors
export const utils = {
  /**
   * Create a user button selector for the authenticated user
   */
  userButtonSelector: (userName: string) => ({
    role: 'button' as const,
    name: userName
  }),
  
  /**
   * Create a namespace-specific dashboard URL
   */
  namespaceDashboardUrl: (siteKey: string) => `/dashboard/${siteKey}`,
  
  /**
   * Create a role-specific dashboard URL (for redirects)
   */
  roleDashboardUrl: (role: 'admin' | 'editor' | 'author' | 'rg' | 'pending') => `/dashboard/${role}`,
  
  /**
   * Generate a site URL for testing
   */
  siteUrl: (port: number, path = '/') => `http://localhost:${port}${path}`,
  
  /**
   * Check if an element has a specific attribute value
   */
  hasAttribute: (element: any, attribute: string, value: string) => ({
    element,
    attribute, 
    value
  })
} as const;

// Validation helpers for test assertions
export const validation = {
  /**
   * Expected URL patterns for different environments
   */
  urlPatterns: {
    signin: /.*\/auth\/signin/,
    dashboard: /.*\/dashboard/,
    namespaceDashboard: (siteKey: string) => new RegExp(`.*\/dashboard\/${siteKey}`),
  },
  
  /**
   * Text patterns for common validations
   */
  textPatterns: {
    accessDenied: /You don't have permission/,
    signInRequired: /Sign in to Admin Portal/,
    authRestricted: /Access restricted to authorized IFLA team members/,
  }
} as const;

export default {
  auth,
  dashboard, 
  navigation,
  sites,
  forms,
  utils,
  validation
};
