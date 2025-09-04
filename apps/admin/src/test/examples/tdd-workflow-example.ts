/**
 * Example: Using the TDD Workflow with Environment-Based Testing
 *
 * This example demonstrates how to use the integrated testing strategy
 * with the 5-phase testing approach.
 */

import {
  env,
  testingStrategy,
  shouldRunTest,
  getNxAffectedConfig,
  type TestTag,
} from '../../config/environment';

// ============================================
// Example 1: Conditional Test Execution
// ============================================

export function runTestsForCurrentEnvironment() {
  console.log(`Current Environment: ${env.name}`);
  console.log(`Current Phase: ${testingStrategy.getCurrentPhase()}`);
  console.log(`Allowed Tags: ${testingStrategy.getAllowedTags().join(', ')}`);

  // Check what types of tests can run
  if (testingStrategy.canRunUnitTests()) {
    console.log('✅ Can run unit tests');
  }

  if (testingStrategy.canRunIntegrationTests()) {
    console.log('✅ Can run integration tests');
  }

  if (testingStrategy.canRunE2ETests()) {
    console.log('✅ Can run E2E tests');
  }

  if (testingStrategy.canRunSmokeTests()) {
    console.log('✅ Can run smoke tests');
  }
}

// ============================================
// Example 2: Phase-Based Test Execution
// ============================================

export function executeTestsForPhase() {
  if (testingStrategy.isPreCommitPhase()) {
    console.log('Phase 2: Pre-Commit - Running unit and integration with MSW');
    return {
      command: 'nx affected --target=test --target=test:integration',
      environment: 'test_mock',
      useMocks: true,
    };
  }

  if (testingStrategy.isPrePushPhase()) {
    console.log('Phase 3: Pre-Push - Running E2E with real local services');
    return {
      command: 'nx affected --target=e2e',
      environment: 'test_local',
      useMocks: false,
      requires: ['supabase start', 'test servers running'],
    };
  }

  if (testingStrategy.isPullRequestPhase()) {
    console.log('Phase 4: Pull Request - Running full test suite');
    return {
      command: 'nx affected --target=test --all',
      environment: 'test_integration',
      useMocks: false,
    };
  }

  if (testingStrategy.isDeploymentPhase()) {
    console.log('Phase 5: Deployment - Running smoke tests only');
    return {
      command: 'nx run-many --target=test:smoke',
      environment: env.name, // staging or production
      useMocks: false,
      restrictions: 'No data modifications allowed',
    };
  }

  // Phase 1: Development (default)
  console.log('Phase 1: Development - Selective testing');
  return {
    command: 'nx affected --target=test --watch',
    environment: 'development',
    useMocks: env.useMock,
  };
}

// ============================================
// Example 3: Nx Affected Configuration
// ============================================

export function getNxCommand() {
  const config = getNxAffectedConfig();

  if (!config.useNxAffected) {
    // Phase 5: Deployment - no nx affected
    const projects = config.projects || ['admin', 'portal'];
    return `nx run-many --target=${config.targets?.join(' --target=')} --projects=${projects.join(',')}`;
  }

  // Phases 1-4: Use nx affected
  let command = 'nx affected';

  if (config.base) {
    command += ` --base=${config.base}`;
  }

  if (config.targets) {
    config.targets.forEach((target: string) => {
      command += ` --target=${target}`;
    });
  }

  if (config.all) {
    command += ' --all';
  }

  if (config.parallel) {
    command += ' --parallel';
  }

  if (config.watch) {
    command += ' --watch';
  }

  return command;
}

// ============================================
// Example 4: Test File with Conditional Execution
// ============================================

export const conditionalTestExample = `
import { describe, it, expect } from 'vitest';
import { shouldRunTest, type TestTag } from '@/config/environment';

/**
 * @unit @critical @mock-only
 */
describe('Unit Tests (Pre-Commit)', () => {
  // Skip if not in mock environment
  const tags: TestTag[] = ['@unit', '@mock-only'];
  const shouldRun = shouldRunTest(tags);
  
  if (!shouldRun) {
    it.skip('Skipped - not in mock environment', () => {});
    return;
  }
  
  it('should validate business logic with mocks', () => {
    // Test runs only in test_mock environment
    expect(true).toBe(true);
  });
});

/**
 * @e2e @critical @real-only
 */
describe('E2E Tests (Pre-Push)', () => {
  const tags: TestTag[] = ['@e2e', '@real-only'];
  const shouldRun = shouldRunTest(tags);
  
  if (!shouldRun) {
    it.skip('Skipped - not in real environment', () => {});
    return;
  }
  
  it('should complete user workflow with real services', async () => {
    // Test runs only in test_local environment
    // Requires local Supabase and servers running
    expect(true).toBe(true);
  });
});

/**
 * @smoke @critical @prod-only
 */
describe('Smoke Tests (Deployment)', () => {
  const tags: TestTag[] = ['@smoke', '@prod-only'];
  const shouldRun = shouldRunTest(tags);
  
  if (!shouldRun) {
    it.skip('Skipped - not in production environment', () => {});
    return;
  }
  
  it('should verify service availability', async () => {
    // Test runs only in production environment
    // Only checks health, no data modifications
    const response = await fetch('/api/health');
    expect(response.ok).toBe(true);
  });
});
`;

// ============================================
// Example 5: Service with Environment Switching
// ============================================

export class ExampleService {
  private provider: any;

  constructor() {
    // Automatically select provider based on environment
    if (env.useMock) {
      this.provider = this.createMockProvider();
    } else {
      this.provider = this.createRealProvider();
    }

    console.log(`Service initialized for ${env.name} environment`);
    console.log(`Using ${env.useMock ? 'mock' : 'real'} provider`);
  }

  private createMockProvider() {
    return {
      getData: async () => {
        // Return mock data instantly
        return { id: 'mock-123', name: 'Mock Data' };
      },
    };
  }

  private createRealProvider() {
    return {
      getData: async () => {
        // Make real API call
        const response = await fetch(`${env.apiBase}/api/data`);
        return response.json();
      },
    };
  }

  async fetchData() {
    const data = await this.provider.getData();

    // Always validate with contract regardless of environment
    // This ensures mock and real data have same shape
    return this.validateContract(data);
  }

  private validateContract(data: any) {
    // Contract validation ensures consistency
    // across all environments
    if (!data.id || !data.name) {
      throw new Error('Data validation failed');
    }
    return data;
  }
}

// ============================================
// Usage Examples
// ============================================

if (require.main === module) {
  console.log('=== TDD Workflow Example ===\n');

  // Show current environment capabilities
  runTestsForCurrentEnvironment();

  console.log('\n=== Phase-Based Execution ===\n');

  // Get command for current phase
  const phaseConfig = executeTestsForPhase();
  console.log('Config:', phaseConfig);

  console.log('\n=== Nx Command Generation ===\n');

  // Generate nx command
  const nxCommand = getNxCommand();
  console.log('Command:', nxCommand);

  console.log('\n=== Service Example ===\n');

  // Create service that adapts to environment
  const service = new ExampleService();

  console.log('\n=== Complete! ===');
}
