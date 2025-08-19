/**
 * Environment configuration with type-safe access to environment variables
 * This centralizes all environment variable access and provides defaults
 */

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Environment configuration object
 * All environment variables should be accessed through this object
 */
export const env = {
  // Core Configuration
  useMock: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
  apiBase: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000',

  // Mock Configuration
  mockDelayMs: parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MS || '100', 10),
  mockErrorRate: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_RATE || '0'),

  // Clerk Authentication
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',

  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // External Services
  externalApiUrl: process.env.NEXT_PUBLIC_EXTERNAL_API_URL || '',
  externalApiKey: process.env.EXTERNAL_API_KEY || '',

  // Feature Flags
  enableDebugLogging: process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING === 'true',
  enableDevtools: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true',

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
} as const;

/**
 * Validate required environment variables
 * Call this during app initialization to catch missing configs early
 */
export function validateEnvironment(): void {
  const required: Array<[keyof typeof env, string]> = [];

  // Only validate required vars when not using mocks
  if (!env.useMock) {
    required.push(
      ['apiBase', 'NEXT_PUBLIC_API_BASE'],
      ['clerkPublishableKey', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'],
      ['supabaseUrl', 'NEXT_PUBLIC_SUPABASE_URL'],
      ['supabaseAnonKey', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    );

    // Server-side only validations
    if (runtime.isServer) {
      if (!env.clerkSecretKey) {
        console.warn(
          'Missing CLERK_SECRET_KEY - authentication may not work properly',
        );
      }
      if (!env.supabaseServiceRoleKey) {
        console.warn(
          'Missing SUPABASE_SERVICE_ROLE_KEY - some admin operations may fail',
        );
      }
    }
  }

  const missing = required.filter(([key]) => !env[key]);

  if (missing.length > 0) {
    const missingVars = missing.map(([, envVar]) => envVar).join(', ');
    throw new Error(
      `Missing required environment variables: ${missingVars}\n` +
        `Please check your .env files and ensure all required variables are set.`,
    );
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
 * Export a type-safe configuration object
 */
export const config = {
  env,
  runtime,
  validateEnvironment,
  debug,
} as const;

export default config;
