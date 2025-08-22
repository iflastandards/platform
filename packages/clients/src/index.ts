/**
 * @ifla/clients
 *
 * This is the main entry point for the `@ifla/clients` package.
 * It is intended for exporting shared types and utilities.
 *
 * For specific client implementations, please use the sub-path exports:
 * - `@ifla/clients/supabase`
 * - `@ifla/clients/github`
 */

// Exporting client class types is useful for dependency injection or typing
// without pulling in the full implementation.
export type { SupabaseJobsClient } from './supabase';

// Export shared utilities and error classes
export * from './errors';
// When a GitHub client is created, its type can be exported here too.
export type { GitHubClient } from './github';