/**
 * User Contract Schema
 * Single source of truth for user data structure across the application
 * Used by MSW handlers, API adapters, and tests
 */

import { z } from 'zod';

// Clerk User structure
export const ClerkEmailAddressSchema = z.object({
  id: z.string(),
  emailAddress: z.string().email(),
  verification: z
    .object({
      status: z.string(),
      strategy: z.string(),
    })
    .optional(),
});

// Legacy Review Group structure (used in test users)
export const LegacyReviewGroupSchema = z.object({
  reviewGroupId: z.string(),
  role: z.enum(['admin', 'member']),
});

// GitHub-based Review Group structure (new format)
export const ReviewGroupSchema = z.object({
  slug: z.string(),
  name: z.string(),
  role: z.enum(['maintainer', 'member']),
  namespaces: z.array(z.string()),
});

// Team role structure (used in test users)
export const TeamRoleSchema = z.object({
  teamId: z.string(),
  role: z.enum(['admin', 'editor', 'author']),
  reviewGroup: z.string(),
  namespaces: z.array(z.string()),
});

// Translation assignment structure
export const TranslationAssignmentSchema = z.object({
  language: z.string(),
  namespaces: z.array(z.string()),
});

// Project membership
export const ProjectSchema = z.object({
  number: z.number(),
  title: z.string(),
  role: z.enum(['lead', 'editor', 'reviewer', 'translator']),
  namespaces: z.array(z.string()),
  sourceTeam: z.string(),
});

// Public metadata structure (stored in Clerk)
// Supports both legacy and new formats
export const UserPublicMetadataSchema = z
  .object({
    // System-level roles
    systemRole: z.enum(['admin', 'superadmin']).optional(),
    roles: z.array(z.string()).optional(),

    // Single role field (legacy)
    role: z.enum(['admin', 'editor', 'author', 'translator']).optional(),

    // Legacy format (used by test users)
    reviewGroups: z
      .union([z.array(LegacyReviewGroupSchema), z.array(ReviewGroupSchema)])
      .optional(),
    teams: z.array(TeamRoleSchema).optional(),
    translations: z.array(TranslationAssignmentSchema).optional(),

    // GitHub integration fields
    githubId: z.string().optional(),
    githubUsername: z.string().optional(),
    isReviewGroupAdmin: z.boolean().optional(),
    totalActiveProjects: z.number().optional(),
  })
  .passthrough(); // Allow additional fields

// Private metadata structure (stored in Clerk)
export const UserPrivateMetadataSchema = z.object({
  projects: z.record(z.string(), ProjectSchema).optional(),
  accessibleNamespaces: z.array(z.string()).optional(),
  lastGitHubSync: z.string().optional(),
});

// Main Clerk User schema
export const ClerkUserSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fullName: z.string().nullable(),
  username: z.string().nullable(),
  emailAddresses: z.array(ClerkEmailAddressSchema),
  publicMetadata: UserPublicMetadataSchema,
  privateMetadata: UserPrivateMetadataSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Application User schema (transformed from Clerk)
export const AppUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  githubUsername: z.string().optional(),
  systemRole: z.enum(['admin']).optional(),
  roles: z.array(z.string()).optional(),
  reviewGroups: z.array(ReviewGroupSchema),
  projects: z.record(z.string(), ProjectSchema),
  isReviewGroupAdmin: z.boolean(),
  accessibleNamespaces: z.array(z.string()),
});

// Auth session schema
export const AuthSessionSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  sessionClaims: z
    .object({
      email: z.string().email().optional(),
      publicMetadata: UserPublicMetadataSchema.optional(),
    })
    .optional(),
});

// Simplified fixture schema (for test data)
export const UserFixtureSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fullName: z.string().nullable(),
  publicMetadata: UserPublicMetadataSchema,
  privateMetadata: UserPrivateMetadataSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Type exports
export type ClerkUser = z.infer<typeof ClerkUserSchema>;
export type UserFixture = z.infer<typeof UserFixtureSchema>;
export type AppUser = z.infer<typeof AppUserSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type UserPublicMetadata = z.infer<typeof UserPublicMetadataSchema>;
export type UserPrivateMetadata = z.infer<typeof UserPrivateMetadataSchema>;
export type LegacyReviewGroup = z.infer<typeof LegacyReviewGroupSchema>;
export type ReviewGroup = z.infer<typeof ReviewGroupSchema>;
export type TeamRole = z.infer<typeof TeamRoleSchema>;
export type TranslationAssignment = z.infer<typeof TranslationAssignmentSchema>;
export type Project = z.infer<typeof ProjectSchema>;
