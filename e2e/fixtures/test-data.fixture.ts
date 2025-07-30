/**
 * Test Data Fixtures
 * Provides consistent test data across all test types
 */

export const TestData = {
  // User data for different roles
  users: {
    admin: {
      email: 'admin@test.iflastandards.info',
      password: 'AdminTest123!',
      role: 'admin',
      permissions: ['all'],
    },
    editor: {
      email: 'editor@test.iflastandards.info',
      password: 'EditorTest123!',
      role: 'editor',
      permissions: ['read', 'write', 'publish'],
    },
    viewer: {
      email: 'viewer@test.iflastandards.info',
      password: 'ViewerTest123!',
      role: 'viewer',
      permissions: ['read'],
    },
    guest: {
      email: 'guest@test.iflastandards.info',
      password: 'GuestTest123!',
      role: 'guest',
      permissions: [],
    },
  },
  
  // Test vocabulary data
  vocabulary: {
    sample: {
      term: 'Test Term',
      definition: 'A term used for testing purposes',
      scope: 'Testing',
      language: 'en',
      source: 'Test Suite',
    },
    batch: Array.from({ length: 10 }, (_, i) => ({
      term: `Test Term ${i + 1}`,
      definition: `Definition for test term ${i + 1}`,
      scope: 'Testing',
      language: 'en',
      source: 'Test Suite',
    })),
  },
  
  // Test site data
  sites: {
    portal: {
      name: 'IFLA Standards Portal',
      url: '/portal',
      baseUrl: 'http://localhost:3000',
    },
    isbdm: {
      name: 'ISBDM',
      url: '/isbdm',
      baseUrl: 'http://localhost:3001',
    },
    lrm: {
      name: 'LRM',
      url: '/lrm',
      baseUrl: 'http://localhost:3002',
    },
    admin: {
      name: 'Admin Portal',
      url: '/admin',
      baseUrl: 'http://localhost:3007/admin',
    },
  },
  
  // API endpoints
  api: {
    health: '/api/health',
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      session: '/api/auth/session',
    },
    vocabulary: {
      list: '/api/vocabularies',
      create: '/api/vocabularies',
      update: '/api/vocabularies/:id',
      delete: '/api/vocabularies/:id',
    },
  },
  
  // Test timeouts
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    veryLong: 60000,
  },
  
  // Error messages
  errors: {
    unauthorized: 'Unauthorized access',
    forbidden: 'Forbidden: Insufficient permissions',
    notFound: 'Resource not found',
    serverError: 'Internal server error',
  },
};