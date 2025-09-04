/**
 * Environment configuration with type-safe access to environment variables
 * This centralizes all environment variable access and provides defaults
 *
 * Environment Hierarchy:
 * 1. test_mock - Pure mock data, no external dependencies
 * 2. test_local - Local Supabase (Orbstack), MSW for external APIs
 * 3. test_integration - Local Supabase, real external APIs
 * 4. staging - Remote staging services
 * 5. production - Production services
 */

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Detect current environment based on multiple signals
 */
function detectEnvironment():
  | 'test_mock'
  | 'test_local'
  | 'test_integration'
  | 'staging'
  | 'production'
  | 'development' {
  // Explicit environment override
  if (process.env.NEXT_PUBLIC_ENV_NAME) {
    return process.env.NEXT_PUBLIC_ENV_NAME as any;
  }

  // Test environment detection
  if (process.env.NODE_ENV === 'test') {
    if (process.env.USE_MOCKS === 'true') {
      return 'test_mock';
    }
    if (process.env.USE_LOCAL_SUPABASE === 'true') {
      return 'test_local';
    }
    return 'test_integration';
  }

  // Production/staging detection based on URLs
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL.includes('staging')) {
      return 'staging';
    }
    return 'production';
  }

  // Local development with various configurations
  if (process.env.NODE_ENV === 'development') {
    if (process.env.USE_MOCKS === 'true') {
      return 'test_mock';
    }
    if (process.env.USE_LOCAL_SUPABASE === 'true') {
      return 'test_local';
    }
    return 'development';
  }

  return 'development';
}

const currentEnv = detectEnvironment();

/**
 * Environment-specific configurations
 */
const environmentConfigs = {
  test_mock: {
    supabaseUrl: 'http://localhost:54321',
    supabaseAnonKey: 'mock-anon-key',
    apiBase: 'http://localhost:3007',
    useMocks: true,
    mockDelayMs: 100,
    mockErrorRate: 0,
    enableDebugLogging: true,
    enableDevtools: true,
  },
  test_local: {
    // Local Supabase via Orbstack
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321',
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    apiBase: 'http://localhost:3007',
    useMocks: false,
    mockDelayMs: 0,
    mockErrorRate: 0,
    enableDebugLogging: true,
    enableDevtools: true,
  },
  test_integration: {
    // Local Supabase, real external APIs
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321',
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    apiBase: 'http://localhost:3007',
    useMocks: false,
    mockDelayMs: 0,
    mockErrorRate: 0,
    enableDebugLogging: true,
    enableDevtools: true,
  },
  staging: {
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_STAGING_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '',
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_STAGING_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '',
    apiBase:
      process.env.NEXT_PUBLIC_API_STAGING_BASE ||
      'https://admin-iflastandards-preview.onrender.com',
    useMocks: false,
    mockDelayMs: 0,
    mockErrorRate: 0,
    enableDebugLogging: false,
    enableDevtools: true,
  },
  production: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    apiBase:
      process.env.NEXT_PUBLIC_API_BASE || 'https://admin.iflastandards.info',
    useMocks: false,
    mockDelayMs: 0,
    mockErrorRate: 0,
    enableDebugLogging: false,
    enableDevtools: false,
  },
  development: {
    // Default development - can be overridden by env vars
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    apiBase: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3007',
    useMocks: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
    mockDelayMs: parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MS || '100', 10),
    mockErrorRate: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_RATE || '0'),
    enableDebugLogging: process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING === 'true',
    enableDevtools: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS !== 'false',
  },
};

// Get config for current environment
const envConfig = environmentConfigs[currentEnv];

/**
 * Environment configuration object
 * All environment variables should be accessed through this object
 */
export const env = {
  // Environment info
  name: currentEnv,
  isLocalSupabase:
    currentEnv === 'test_local' ||
    currentEnv === 'test_integration' ||
    (currentEnv === 'development' && process.env.USE_LOCAL_SUPABASE === 'true'),

  // Core Configuration
  useMock: envConfig.useMocks,
  apiBase: envConfig.apiBase,

  // Mock Configuration
  mockDelayMs: envConfig.mockDelayMs,
  mockErrorRate: envConfig.mockErrorRate,

  // Clerk Authentication
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  clerkSignInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
  clerkSignUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
  clerkAfterSignInUrl:
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/admin',
  clerkAfterSignOutUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || '/',
  clerkSignInFallbackUrl:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ||
    '/admin/api/auth/callback',
  clerkSignUpFallbackUrl:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ||
    '/admin/api/auth/callback',
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET || '',

  // Supabase
  supabaseUrl: envConfig.supabaseUrl,
  supabaseAnonKey: envConfig.supabaseAnonKey,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // External Services
  externalApiUrl: process.env.NEXT_PUBLIC_EXTERNAL_API_URL || '',
  externalApiKey: process.env.EXTERNAL_API_KEY || '',

  // GitHub Integration
  githubApiUrl:
    process.env.NEXT_PUBLIC_GITHUB_API_URL || 'https://api.github.com',
  githubAppId: process.env.GITHUB_APP_ID || '',
  githubPrivateKey: process.env.GITHUB_PRIVATE_KEY || '',

  // Render.com compatibility
  renderUrl: process.env.RENDER_EXTERNAL_URL || '',
  port: process.env.PORT || '3007',

  // Feature Flags
  enableDebugLogging: envConfig.enableDebugLogging,
  enableDevtools: envConfig.enableDevtools,

  // Monitoring
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',

  // Legacy (to be removed)
  iflaDemo: process.env.NEXT_PUBLIC_IFLA_DEMO === 'true',
} as const;

/**
 * Runtime environment detection
 */
export const runtime = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isBrowser,
  isServer: !isBrowser,
  // Specific environment checks
  isTestMock: currentEnv === 'test_mock',
  isTestLocal: currentEnv === 'test_local',
  isTestIntegration: currentEnv === 'test_integration',
  isStaging: currentEnv === 'staging',
  // Service availability
  hasLocalSupabase: env.isLocalSupabase,
  hasOrbstack: process.env.ORBSTACK_RUNNING === 'true',
  isCI: process.env.CI === 'true',
  isRender: !!process.env.RENDER,
} as const;

/**
 * Validate required environment variables
 * Call this during app initialization to catch missing configs early
 */
export function validateEnvironment(): void {
  const required: Array<[keyof typeof env, string]> = [];

  // Environment-specific validation
  switch (currentEnv) {
    case 'test_mock':
      // No external dependencies required
      break;

    case 'test_local':
    case 'test_integration':
      // Check if local Supabase is actually running
      if (runtime.isServer && env.isLocalSupabase) {
        // Try to ping local Supabase
        fetch(`${env.supabaseUrl}/rest/v1/`).catch(() => {
          console.warn(
            '⚠️  Local Supabase not responding. Run: supabase start',
          );
        });
      }
      required.push([
        'clerkPublishableKey',
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      ]);
      break;

    case 'staging':
    case 'production':
      required.push(
        ['apiBase', 'NEXT_PUBLIC_API_BASE'],
        ['clerkPublishableKey', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'],
        ['supabaseUrl', 'NEXT_PUBLIC_SUPABASE_URL'],
        ['supabaseAnonKey', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
      );
      break;

    case 'development':
    default:
      // Flexible for development
      if (!env.useMock) {
        required.push([
          'clerkPublishableKey',
          'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        ]);
      }
      break;
  }

  // Server-side only validations
  if (runtime.isServer && !env.useMock) {
    if (!env.clerkSecretKey && currentEnv !== 'test_mock') {
      console.warn(
        'Missing CLERK_SECRET_KEY - authentication may not work properly',
      );
    }
    if (!env.supabaseServiceRoleKey && env.isLocalSupabase) {
      console.warn(
        'Missing SUPABASE_SERVICE_ROLE_KEY - some admin operations may fail',
      );
    }
  }

  const missing = required.filter(([key]) => !env[key]);

  if (missing.length > 0) {
    const missingVars = missing.map(([, envVar]) => envVar).join(', ');
    throw new Error(
      `Missing required environment variables for ${currentEnv}: ${missingVars}\n` +
        `Please check your .env files and ensure all required variables are set.`,
    );
  }

  // Log current environment for debugging
  if (env.enableDebugLogging) {
    console.log(`🔧 Running in ${currentEnv} environment`);
    console.log(`   Mocks: ${env.useMock ? 'enabled' : 'disabled'}`);
    console.log(`   Supabase: ${env.isLocalSupabase ? 'local' : 'remote'}`);
    console.log(`   API Base: ${env.apiBase}`);
  }
}

/**
 * Debug logger that respects the debug flag
 */
export const debug = {
  log: (...args: unknown[]) => {
    if (env.enableDebugLogging) {
      console.log('[DEBUG]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (env.enableDebugLogging) {
      console.error('[DEBUG ERROR]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (env.enableDebugLogging) {
      console.warn('[DEBUG WARN]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (env.enableDebugLogging) {
      console.info('[DEBUG INFO]', ...args);
    }
  },
};

/**
 * Helper to switch environments programmatically (useful for testing)
 */
export function switchEnvironment(envName: keyof typeof environmentConfigs) {
  if (runtime.isBrowser) {
    console.warn('Environment switching only works on server-side');
    return;
  }

  process.env.NEXT_PUBLIC_ENV_NAME = envName;
  // Would need to reload the module to take effect
  console.log(`Environment switched to: ${envName} (requires restart)`);
}

/**
 * Get connection strings for current environment
 */
export function getConnectionStrings() {
  return {
    postgres: env.isLocalSupabase
      ? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
      : env.supabaseUrl
          .replace('https://', 'postgresql://postgres:postgres@')
          .replace('.supabase.co', '.supabase.co:5432/postgres'),
    redis: env.isLocalSupabase
      ? 'redis://localhost:6379'
      : process.env.REDIS_URL || '',
    // Additional local Supabase services
    graphql: env.isLocalSupabase
      ? 'http://127.0.0.1:54321/graphql/v1'
      : `${env.supabaseUrl}/graphql/v1`,
    storage: env.isLocalSupabase
      ? 'http://127.0.0.1:54321/storage/v1/s3'
      : `${env.supabaseUrl}/storage/v1`,
    studio: env.isLocalSupabase ? 'http://127.0.0.1:54323' : null,
    inbucket: env.isLocalSupabase ? 'http://127.0.0.1:54324' : null,
  };
}

/**
 * Test helpers
 */
export const testHelpers = {
  /**
   * Use in tests to ensure mock environment
   */
  ensureMockEnvironment() {
    if (!env.useMock) {
      throw new Error('Test requires mock environment. Set USE_MOCKS=true');
    }
  },

  /**
   * Use in integration tests to ensure local services
   */
  ensureLocalServices() {
    if (!env.isLocalSupabase) {
      throw new Error('Test requires local Supabase. Run: supabase start');
    }
  },

  /**
   * Skip test if not in appropriate environment
   */
  skipIfNoLocalServices() {
    if (!env.isLocalSupabase) {
      return { skip: true, reason: 'Requires local Supabase' };
    }
    return { skip: false };
  },
};

/**
 * Test-specific configurations for 5-phase testing strategy
 */
export type TestTag =
  | '@unit'
  | '@integration'
  | '@e2e'
  | '@smoke'
  | '@contract'
  | '@performance'
  | '@security'
  | '@critical'
  | '@essential'
  | '@important'
  | '@nice-to-have'
  | '@mock-only'
  | '@real-only'
  | '@staging-only'
  | '@prod-only'
  | '@all-envs'
  | '@service-availability';

/**
 * Test tag mappings for each environment
 * Defines which test types run in each environment
 */
export const testTagsByEnvironment = {
  test_mock: ['@unit', '@integration', '@contract', '@mock-only'] as TestTag[],
  test_local: ['@e2e', '@real-only'] as TestTag[],
  test_integration: ['@integration', '@e2e', '@real-only'] as TestTag[],
  staging: ['@smoke', '@service-availability', '@critical'] as TestTag[],
  production: ['@smoke', '@service-availability', '@critical'] as TestTag[],
  development: ['@unit', '@integration', '@e2e'] as TestTag[], // Flexible for dev
} as const;

/**
 * Phase mapping for 5-phase testing strategy
 */
export const phaseByEnvironment = {
  test_mock: 2, // Phase 2: Pre-commit (Unit + Integration with MSW)
  test_local: 3, // Phase 3: Pre-push (E2E with real local services)
  test_integration: 4, // Phase 4: Pull Request (Full suite)
  staging: 5, // Phase 5: Preview deployment (Smoke only)
  production: 5, // Phase 5: Production deployment (Smoke only)
  development: 1, // Phase 1: Selective (Development)
} as const;

/**
 * Test timeout configurations by environment
 */
export const testTimeouts = {
  test_mock: 5000, // 5s for mocked tests
  test_local: 30000, // 30s for local E2E
  test_integration: 60000, // 1m for full integration
  staging: 10000, // 10s for smoke tests
  production: 10000, // 10s for smoke tests
  development: 30000, // 30s default for dev
} as const;

/**
 * Check if current environment should run tests with given tags
 */
export function shouldRunTest(testTags: TestTag[]): boolean {
  const allowedTags = testTagsByEnvironment[currentEnv] || [];
  return testTags.some((tag) => allowedTags.includes(tag as any));
}

/**
 * Get test timeout for current environment
 */
export function getTestTimeout(): number {
  return testTimeouts[currentEnv] || 30000;
}

/**
 * Get test phase for current environment
 */
export function getCurrentTestPhase(): number {
  return phaseByEnvironment[currentEnv] || 1;
}

/**
 * Priority-based test filtering
 * Determines which priority levels are enforced in each environment
 */
export function filterTestsByPriority(
  priority: '@critical' | '@essential' | '@important' | '@nice-to-have',
): boolean {
  type PriorityTag =
    | '@critical'
    | '@essential'
    | '@important'
    | '@nice-to-have';

  const priorityRules: Record<string, readonly PriorityTag[]> = {
    test_mock: ['@critical', '@essential', '@important', '@nice-to-have'],
    test_local: ['@critical', '@essential', '@important'],
    test_integration: ['@critical', '@essential', '@important'],
    staging: ['@critical', '@essential'],
    production: ['@critical'],
    development: ['@critical', '@essential', '@important', '@nice-to-have'],
  };

  const allowed = priorityRules[currentEnv] || priorityRules.development;
  return allowed.includes(priority as PriorityTag);
}

/**
 * Get nx affected configuration for current environment
 */
export function getNxAffectedConfig() {
  const phase = getCurrentTestPhase();

  switch (phase) {
    case 2: // Pre-commit
      return {
        base: 'HEAD~1',
        targets: ['typecheck', 'lint', 'test', 'test:integration'],
        parallel: true,
        useNxAffected: true,
      };
    case 3: // Pre-push
      return {
        base: 'origin/main',
        targets: ['e2e'],
        parallel: false, // E2E tests often need sequential execution
        useNxAffected: true,
      };
    case 4: // Pull Request
      return {
        base: 'origin/main',
        targets: ['test', 'test:integration', 'e2e'],
        all: true,
        parallel: true,
        useNxAffected: true,
      };
    case 5: // Deployment
      // No nx affected for deployment - run specific smoke tests
      return {
        useNxAffected: false,
        targets: ['test:smoke', 'test:service-availability'],
        projects: ['admin', 'portal'],
      };
    default: // Development (Phase 1)
      return {
        base: 'HEAD',
        targets: ['test'],
        watch: true,
        useNxAffected: true,
      };
  }
}

/**
 * Test execution helpers integrated with 5-phase strategy
 */
export const testingStrategy = {
  getCurrentPhase: getCurrentTestPhase,
  shouldRunTest,
  getTestTimeout,
  filterTestsByPriority,
  getNxAffectedConfig,

  // Phase-specific helpers
  isPreCommitPhase: () => getCurrentTestPhase() === 2,
  isPrePushPhase: () => getCurrentTestPhase() === 3,
  isPullRequestPhase: () => getCurrentTestPhase() === 4,
  isDeploymentPhase: () => getCurrentTestPhase() === 5,

  // Environment-specific test checks
  canRunUnitTests: () => shouldRunTest(['@unit']),
  canRunIntegrationTests: () => shouldRunTest(['@integration']),
  canRunE2ETests: () => shouldRunTest(['@e2e']),
  canRunSmokeTests: () => shouldRunTest(['@smoke']),

  // Get allowed test tags for current environment
  getAllowedTags: () => testTagsByEnvironment[currentEnv] || [],
};

/**
 * Export a type-safe configuration object
 */
export const config = {
  env,
  runtime,
  validateEnvironment,
  debug,
  switchEnvironment,
  getConnectionStrings,
  testHelpers,
  testingStrategy, // Testing strategy integration
  // Expose current environment for logging
  currentEnvironment: currentEnv,
} as const;

export default config;
