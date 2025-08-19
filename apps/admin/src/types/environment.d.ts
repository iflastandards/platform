/**
 * TypeScript declarations for environment variables
 * This ensures type safety when accessing process.env
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Core
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_USE_MOCK?: string;
    NEXT_PUBLIC_API_BASE?: string;

    // Mock Configuration
    NEXT_PUBLIC_MOCK_DELAY_MS?: string;
    NEXT_PUBLIC_MOCK_ERROR_RATE?: string;

    // Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
    CLERK_SECRET_KEY?: string;

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;

    // External Services
    NEXT_PUBLIC_EXTERNAL_API_URL?: string;
    EXTERNAL_API_KEY?: string;

    // Feature Flags
    NEXT_PUBLIC_ENABLE_DEBUG_LOGGING?: string;
    NEXT_PUBLIC_ENABLE_DEVTOOLS?: string;

    // Monitoring
    NEXT_PUBLIC_SENTRY_DSN?: string;
    NEXT_PUBLIC_ANALYTICS_ID?: string;

    // Legacy
    NEXT_PUBLIC_IFLA_DEMO?: string;
    IFLA_DEMO?: string;
  }
}
