import { z } from 'zod';

/**
 * Zod schemas for authentication and authorization types
 */

export const SystemRoleSchema = z.enum(['superadmin']).optional();

export const ReviewGroupRoleSchema = z.object({
  reviewGroupId: z.string().min(1, 'Review group ID is required'),
  role: z.enum(['admin']),
});

export const TeamRoleSchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  role: z.enum(['editor', 'author']),
  reviewGroup: z.string().min(1, 'Review group is required'),
  namespaces: z.array(z.string()).min(1, 'At least one namespace is required'),
});

export const TranslationAssignmentSchema = z.object({
  language: z.string().min(2).max(5), // ISO language codes
  namespaces: z.array(z.string()).min(1, 'At least one namespace is required'),
});

export const UserRolesSchema = z.object({
  systemRole: SystemRoleSchema,
  system: SystemRoleSchema, // Alias for backward compatibility
  reviewGroups: z.array(ReviewGroupRoleSchema).default([]),
  teams: z.array(TeamRoleSchema).default([]),
  translations: z.array(TranslationAssignmentSchema).default([]),
});

export const AuthContextSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email({ message: 'Valid email is required' }),
  roles: UserRolesSchema,
});

export const UserMetadataSchema = z.object({
  systemRole: SystemRoleSchema,
  reviewGroups: z.array(ReviewGroupRoleSchema).default([]),
  teams: z.array(TeamRoleSchema).default([]),
  translations: z.array(TranslationAssignmentSchema).default([]),
});

// Type exports
export type SystemRole = z.infer<typeof SystemRoleSchema>;
export type ReviewGroupRole = z.infer<typeof ReviewGroupRoleSchema>;
export type TeamRole = z.infer<typeof TeamRoleSchema>;
export type TranslationAssignment = z.infer<typeof TranslationAssignmentSchema>;
export type UserRoles = z.infer<typeof UserRolesSchema>;
export type AuthContext = z.infer<typeof AuthContextSchema>;
export type UserMetadata = z.infer<typeof UserMetadataSchema>;

// Resource types enum
export const ResourceTypeSchema = z.enum([
  'reviewGroup',
  'namespace',
  'project',
  'team',
  'elementSet',
  'vocabulary',
  'translation',
  'release',
  'spreadsheet',
  'documentation',
  'dctap',
  'user',
]);

export type ResourceType = z.infer<typeof ResourceTypeSchema>;

// Action schemas for each resource type
export const ReviewGroupActionsSchema = z.enum(['create', 'read', 'update', 'delete', 'list', 'manage']);
export const NamespaceActionsSchema = z.enum(['create', 'read', 'update', 'delete', 'list']);
export const ProjectActionsSchema = z.enum(['create', 'read', 'update', 'delete', 'assignTeam', 'assignNamespace']);
export const TeamActionsSchema = z.enum(['create', 'read', 'update', 'delete', 'listMembers', 'addMember', 'removeMember', 'updateMemberRole']);
export const ElementSetActionsSchema = z.enum(['create', 'read', 'update', 'delete']);
export const VocabularyActionsSchema = z.enum(['create', 'read', 'update', 'delete']);
export const TranslationActionsSchema = z.enum(['read', 'update', 'approve', 'assignTranslator']);
export const ReleaseActionsSchema = z.enum(['create', 'read', 'update', 'delete', 'publish']);
export const SpreadsheetActionsSchema = z.enum(['read', 'edit', 'import', 'export', 'update']);
export const DocumentationActionsSchema = z.enum(['create', 'read', 'update', 'delete']);
export const DctapActionsSchema = z.enum(['create', 'read', 'update', 'delete', 'export']);
export const UserActionsSchema = z.enum(['invite', 'read', 'update', 'delete', 'impersonate']);

// Union type for all actions
export const ActionSchema = z.union([
  ReviewGroupActionsSchema,
  NamespaceActionsSchema,
  ProjectActionsSchema,
  TeamActionsSchema,
  ElementSetActionsSchema,
  VocabularyActionsSchema,
  TranslationActionsSchema,
  ReleaseActionsSchema,
  SpreadsheetActionsSchema,
  DocumentationActionsSchema,
  DctapActionsSchema,
  UserActionsSchema,
]);

export type Action = z.infer<typeof ActionSchema>;

// Permission check request schema
export const PermissionCheckSchema = z.object({
  resourceType: ResourceTypeSchema,
  action: ActionSchema,
  resourceAttributes: z.record(z.string(), z.any()).optional(),
});

export type PermissionCheck = z.infer<typeof PermissionCheckSchema>;