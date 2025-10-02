/**
 * Test fixtures for different types of test files
 * Used by test-tagging script tests
 */

export const TEST_FILE_FIXTURES = {
  // Unit test examples
  UNIT_TEST_WITH_MOCKS: `import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../UserService';
import { DatabaseService } from '../DatabaseService';

// Mock all dependencies
vi.mock('../DatabaseService');

describe('UserService Unit Tests', () => {
  let userService: UserService;
  let mockDbService: any;

  beforeEach(() => {
    mockDbService = vi.mocked(DatabaseService);
    userService = new UserService(mockDbService);
  });

  it('should create user successfully with mocked dependencies', () => {
    mockDbService.save.mockResolvedValue({ id: 1, name: 'John' });
    
    const result = userService.createUser({ name: 'John' });
    
    expect(result).toBeDefined();
  });
});`,

  UNIT_TEST_PURE_LOGIC: `import { describe, it, expect } from 'vitest';
import { calculateTax, validateEmail } from '../utils';

describe('Utility Functions Unit Tests', () => {
  describe('calculateTax', () => {
    it('should calculate tax correctly for standard rate', () => {
      const result = calculateTax(100, 0.1);
      expect(result).toBe(10);
    });

    it('should handle zero amount', () => {
      const result = calculateTax(0, 0.1);
      expect(result).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});`,

  // Integration test examples
  INTEGRATION_TEST_DATABASE: `import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UserRepository } from '../repositories/UserRepository';
import { DatabaseConnection } from '../database/DatabaseConnection';

describe('UserRepository Integration Tests', () => {
  let userRepo: UserRepository;
  let dbConnection: DatabaseConnection;

  beforeAll(async () => {
    dbConnection = new DatabaseConnection(process.env.TEST_DB_URL);
    await dbConnection.connect();
    userRepo = new UserRepository(dbConnection);
  });

  afterAll(async () => {
    await dbConnection.disconnect();
  });

  it('should save and retrieve user from database', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    
    const savedUser = await userRepo.create(userData);
    expect(savedUser.id).toBeDefined();
    
    const retrievedUser = await userRepo.findById(savedUser.id);
    expect(retrievedUser.name).toBe(userData.name);
  });

  it('should handle user not found scenario', async () => {
    const user = await userRepo.findById(999999);
    expect(user).toBeNull();
  });
});`,

  INTEGRATION_TEST_API: `import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { setupTestDatabase, cleanupTestDatabase } from '../test-helpers/database';

describe('User API Integration Tests', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create user via API endpoint', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(userData.name);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({})
      .expect(400);
    
    expect(response.body.errors).toContain('name is required');
  });
});`,

  // E2E test examples
  E2E_TEST_PLAYWRIGHT: `import { test, expect } from '@playwright/test';

test.describe('User Registration E2E Tests', () => {
  test('should complete full user registration flow', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Verify success page
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL('/welcome');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');
    
    // Submit empty form
    await page.click('[data-testid="submit-button"]');
    
    // Check validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });
});`,

  E2E_TEST_MULTI_PAGE: `import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
  });

  test('should navigate through admin sections', async ({ page }) => {
    // Start at dashboard
    await expect(page).toHaveURL('/admin/dashboard');
    
    // Navigate to users
    await page.click('[data-testid="users-nav"]');
    await expect(page).toHaveURL('/admin/users');
    
    // Navigate to settings
    await page.click('[data-testid="settings-nav"]');
    await expect(page).toHaveURL('/admin/settings');
  });

  test('should manage user permissions', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Find user and click edit
    await page.click('[data-testid="user-1-edit"]');
    
    // Change permissions
    await page.check('[data-testid="admin-permission"]');
    await page.click('[data-testid="save-button"]');
    
    // Verify changes
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });
});`,

  // Smoke test examples
  SMOKE_TEST_CRITICAL_PATH: `import { test, expect } from '@playwright/test';

test.describe('Critical Path Smoke Tests', () => {
  test('should verify application is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check main elements load
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="content"]')).toBeVisible();
  });

  test('should verify API health endpoint', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should verify login functionality works', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login form exists
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    
    // Try login with test credentials
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'test123');
    await page.click('[data-testid="login-button"]');
    
    // Should either login or show proper error
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible();
    const hasError = await page.locator('[data-testid="login-error"]').isVisible();
    
    expect(isLoggedIn || hasError).toBe(true);
  });
});`,

  // Problem test files (for testing error detection)
  PROBLEMATIC_NO_DESCRIBE: `import { it, expect } from 'vitest';

// No describe block - should cause issues
it('should do something', () => {
  expect(true).toBe(true);
});

export const helperFunction = () => {
  return 'helper';
};`,

  PROBLEMATIC_MIXED_PATTERNS: `import { describe, it, expect } from 'vitest';
import { test } from '@playwright/test';

// Mixed testing frameworks - should be flagged
describe('Vitest tests', () => {
  it('should work with vitest', () => {
    expect(true).toBe(true);
  });
});

test('Playwright test', async ({ page }) => {
  await page.goto('/');
});`,

  PROBLEMATIC_UNCLEAR_TYPE: `import { describe, it, expect } from 'vitest';

describe('Ambiguous test type', () => {
  // Could be unit or integration - unclear from content
  it('should process data', () => {
    const result = processData('input');
    expect(result).toBeDefined();
  });
  
  it('should handle errors', () => {
    expect(() => processData(null)).toThrow();
  });
});

function processData(input: string | null) {
  if (!input) throw new Error('Invalid input');
  return input.toUpperCase();
}`,

  // Correctly tagged test files (for validation testing)
  
  // Unit tests - fully mocked, no server dependencies
  CORRECTLY_TAGGED_UNIT: `/**
 * @unit @critical @api
 */
import { vi, describe, it, expect } from 'vitest';
import { UserService } from '../UserService';

vi.mock('../UserService');

describe('UserController @unit @critical @api', () => {
  it('should handle user creation', () => {
    const mockUserService = vi.mocked(UserService);
    mockUserService.create.mockResolvedValue({ id: 1 });
    
    expect(mockUserService.create).toBeDefined();
  });
});`,

  // Mock-based integration - MSW mocks, no live servers
  CORRECTLY_TAGGED_INTEGRATION_MOCK: `/**
 * @integration @high-priority @api @validation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { AuthService } from '../AuthService';

const server = setupServer(
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ token: 'mock-token', success: true });
  })
);

describe('Authentication Flow @integration @high-priority @api @validation', () => {
  beforeEach(() => {
    server.listen();
  });

  it('should authenticate valid credentials with MSW', async () => {
    const authService = new AuthService();
    const result = await authService.authenticate('user@test.com', 'password');
    
    expect(result.success).toBe(true);
    expect(result.token).toBe('mock-token');
  });
});`,

  // Server-dependent integration - requires local servers
  CORRECTLY_TAGGED_INTEGRATION_SERVER: `/**
 * @integration @server-dependent @high-priority @api @local-only
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { AuthService } from '../AuthService';

describe('Live API Authentication @integration @server-dependent @high-priority @api @local-only', () => {
  beforeAll(() => {
    // Ensure admin server is running on localhost:3007
    if (!process.env.ADMIN_URL) {
      throw new Error('Admin server must be running. Start with: nx run admin:dev');
    }
  });

  it('should authenticate against running admin server', async () => {
    const authService = new AuthService('http://localhost:3007');
    const result = await authService.authenticate('admin@test.com', 'password');
    
    expect(result.success).toBe(true);
  });
});`,

  // Mock API tests - MSW intercepted
  CORRECTLY_TAGGED_API_MOCK: `/**
 * @api @integration @critical @validation
 */
import { describe, it, expect } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import request from 'supertest';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'John' }]);
  })
);

describe('Users API Endpoints @api @integration @critical @validation', () => {
  beforeAll(() => server.listen());
  
  it('should return users list', async () => {
    const response = await fetch('/api/users');
    const users = await response.json();
    
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('John');
  });
});`,

  // Local live API tests - against localhost
  CORRECTLY_TAGGED_API_LOCAL: `/**
 * @api @live-api @server-dependent @critical @local-only
 */
import { test, expect } from '@playwright/test';

test.describe('Admin API Endpoints @api @live-api @server-dependent @critical @local-only', () => {
  test('should authenticate with live admin server', async ({ request }) => {
    const response = await request.post('http://localhost:3007/api/auth/login', {
      data: { email: 'admin@test.com', password: 'admin123' }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
  });
});`,

  // Post-deploy API tests - against deployed URLs
  CORRECTLY_TAGGED_API_DEPLOYED: `/**
 * @api @live-api @post-deploy @critical
 */
import { test, expect } from '@playwright/test';

test.describe('Deployed API Health @api @live-api @post-deploy @critical', () => {
  test('should validate deployed API health endpoint', async ({ request }) => {
    const baseUrl = process.env.DEPLOYED_API_URL || 'https://api.iflastandards.info';
    const response = await request.get(\`\${baseUrl}/api/health\`);
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
});`,

  // Local E2E - against localhost
  CORRECTLY_TAGGED_E2E_LOCAL: `/**
 * @e2e @server-dependent @critical @navigation @ui @local-only
 */
import { test, expect } from '@playwright/test';

test.describe('Local Navigation Flow @e2e @server-dependent @critical @navigation @ui @local-only', () => {
  test('should navigate admin sections on localhost', async ({ page }) => {
    await page.goto('http://localhost:3007/admin');
    
    await page.click('[data-testid="users-nav"]');
    await expect(page).toHaveURL('http://localhost:3007/admin/users');
    
    await page.click('[data-testid="settings-nav"]');
    await expect(page).toHaveURL('http://localhost:3007/admin/settings');
  });
});`,

  // Post-deploy E2E - against deployed URLs
  CORRECTLY_TAGGED_E2E_DEPLOYED: `/**
 * @e2e @post-deploy @critical @navigation @ui
 */
import { test, expect } from '@playwright/test';

test.describe('Deployed Navigation @e2e @post-deploy @critical @navigation @ui', () => {
  test('should navigate deployed portal', async ({ page }) => {
    const baseUrl = process.env.DEPLOYED_URL || 'https://docs.iflastandards.info';
    await page.goto(baseUrl);
    
    await page.click('[data-testid="about-link"]');
    await expect(page).toHaveURL(\`\${baseUrl}/about\`);
  });
});`,

  // Smoke tests - always post-deploy
  CORRECTLY_TAGGED_SMOKE: `/**
 * @smoke @post-deploy @critical
 */
import { test, expect } from '@playwright/test';

test.describe('Critical Path Validation @smoke @post-deploy @critical', () => {
  test('should validate deployed portal health', async ({ page }) => {
    const baseUrl = process.env.DEPLOYED_URL || 'https://docs.iflastandards.info';
    await page.goto(baseUrl);
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
  });

  test('should validate API health endpoint', async ({ request }) => {
    const apiUrl = process.env.DEPLOYED_API_URL || 'https://api.iflastandards.info';
    const response = await request.get(\`\${apiUrl}/api/health\`);
    expect(response.status()).toBe(200);
  });
});`
};

// AI response fixtures for testing
export const AI_RESPONSE_FIXTURES = {
  VALID_UNIT_ANALYSIS: {
    classification: 'unit',
    confidence: 'high',
    tags: ['@unit', '@critical', '@api'],
    reasoning: 'This test uses vi.mock to mock dependencies and tests isolated functionality without external services.',
    concerns: [],
    recommendations: ['Consider adding more edge case tests', 'Verify all mocked methods are called correctly']
  },

  VALID_INTEGRATION_ANALYSIS: {
    classification: 'integration',
    confidence: 'high',
    tags: ['@integration', '@high-priority', '@api', '@validation'],
    reasoning: 'This test makes actual API calls and tests component interactions without full mocking.',
    concerns: ['May be slower than unit tests', 'Depends on external services'],
    recommendations: ['Add cleanup after each test', 'Consider test data isolation']
  },

  VALID_E2E_ANALYSIS: {
    classification: 'e2e',
    confidence: 'high',
    tags: ['@e2e', '@critical', '@ui', '@navigation'],
    reasoning: 'This test uses Playwright to test full user workflows in a real browser environment.',
    concerns: ['Slow execution time', 'Browser dependency'],
    recommendations: ['Add explicit waits for better stability', 'Consider headless mode for CI']
  },

  VALID_SMOKE_ANALYSIS: {
    classification: 'smoke',
    confidence: 'high',
    tags: ['@smoke', '@critical'],
    reasoning: 'This test validates critical functionality and application health without complex interactions.',
    concerns: [],
    recommendations: ['Keep test simple and fast', 'Ensure URL-independent execution']
  },

  LOW_CONFIDENCE_ANALYSIS: {
    classification: 'unit',
    confidence: 'low',
    tags: ['@unit', '@low-priority'],
    reasoning: 'Classification unclear due to ambiguous test patterns.',
    concerns: ['Mixed testing patterns detected', 'Unclear dependency management'],
    recommendations: ['Clarify test scope', 'Add explicit mocking or real service usage']
  },

  MALFORMED_JSON_RESPONSE: '{"classification": "unit", "confidence": "high"', // Missing closing brace

  EMPTY_RESPONSE: '',

  NON_JSON_RESPONSE: 'This is not JSON content at all.',

  WRAPPED_JSON_RESPONSE: '```json\n{"classification": "integration", "confidence": "medium", "tags": ["@integration", "@api"], "reasoning": "Test appears to use real services", "concerns": [], "recommendations": []}\n```'
};

// File location test cases
export const LOCATION_TEST_CASES = [
  {
    description: 'Unit test in correct location',
    filePath: '/src/test/unit/user.unit.test.ts',
    classification: 'unit',
    expectedIssue: null
  },
  {
    description: 'Unit test in wrong directory',
    filePath: '/src/test/integration/user.test.ts',
    classification: 'unit',
    expectedIssue: {
      reason: 'unit test found in wrong directory type',
      confidence: 'high'
    }
  },
  {
    description: 'Integration test with wrong naming',
    filePath: '/src/test/integration/user.test.ts',
    classification: 'integration',
    expectedIssue: {
      reason: 'Filename pattern doesn\'t match integration convention',
      confidence: 'medium'
    }
  },
  {
    description: 'E2E test in correct location',
    filePath: '/e2e/login.e2e.spec.ts',
    classification: 'e2e',
    expectedIssue: null
  },
  {
    description: 'Smoke test in wrong location',
    filePath: '/src/test/unit/health.test.ts',
    classification: 'smoke',
    expectedIssue: {
      reason: 'smoke test found in wrong directory type',
      confidence: 'high'
    }
  }
];

// Expected tag patterns for validation
export const TAG_VALIDATION_PATTERNS = {
  CATEGORY_TAGS: ['@unit', '@integration', '@e2e', '@smoke'],
  PRIORITY_TAGS: ['@critical', '@high-priority', '@low-priority'],
  FUNCTIONAL_TAGS: ['@api', '@ui', '@validation', '@security', '@authentication', '@navigation', '@rbac', '@deployment', '@utility'],
  OPTIONAL_TAGS: ['@local-only', '@ci-only', '@server-dependent', '@slow', '@flaky']
};