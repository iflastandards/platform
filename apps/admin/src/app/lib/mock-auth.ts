/**
 * Mock authentication utilities for testing
 * This provides a way to create and manage mock users for testing purposes
 */

import { UserRoles } from '@/lib/auth';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  roles: UserRoles;
  publicMetadata: {
    systemRole?: 'superadmin';
    reviewGroups: Array<{
      reviewGroupId: string;
      role: 'admin';
    }>;
    teams: Array<{
      teamId: string;
      role: 'editor' | 'author';
      reviewGroup: string;
      namespaces: string[];
    }>;
    translations: Array<{
      language: string;
      namespaces: string[];
    }>;
  };
}

// In-memory storage for mock users
const mockUsers = new Map<string, MockUser>();

/**
 * Create a mock user for testing
 */
export function createUser(userData: {
  name: string;
  roles?: UserRoles;
  systemRole?: 'superadmin';
  reviewGroups?: Array<{ reviewGroupId: string; role: 'admin' }>;
  teams?: Array<{ teamId: string; role: 'editor' | 'author'; reviewGroup: string; namespaces: string[] }>;
  translations?: Array<{ language: string; namespaces: string[] }>;
}): MockUser {
  // Generate a unique ID
  const id = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Generate email from name
  const email = userData.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '.') // Replace spaces with dots
    .replace(/-+/g, '-') // Keep hyphens
    + '@example.com';
  
  const roles: UserRoles = userData.roles || {
    systemRole: userData.systemRole,
    reviewGroups: userData.reviewGroups || [],
    teams: userData.teams || [],
    translations: userData.translations || [],
  };

  const publicMetadata = {
    systemRole: userData.systemRole,
    reviewGroups: userData.reviewGroups || [],
    teams: userData.teams || [],
    translations: userData.translations || [],
  };
  
  const user: MockUser = {
    id,
    name: userData.name,
    email,
    roles,
    publicMetadata,
  };
  
  // Store the user
  mockUsers.set(id, user);
  
  return user;
}

/**
 * Get a mock user by ID
 */
export function getUser(id: string): MockUser | null {
  if (!id) return null;
  return mockUsers.get(id) || null;
}

/**
 * Clear all mock users (useful for test cleanup)
 */
export function clearUsers(): void {
  mockUsers.clear();
}

/**
 * Get all mock users (useful for debugging)
 */
export function getAllUsers(): MockUser[] {
  return Array.from(mockUsers.values());
}

/**
 * Helper functions to create common user types
 */
export const createSuperAdmin = (name: string = 'Super Admin') => 
  createUser({
    name,
    systemRole: 'superadmin',
  });

export const createReviewGroupAdmin = (name: string, reviewGroupId: string) =>
  createUser({
    name,
    reviewGroups: [{ reviewGroupId, role: 'admin' }],
  });

export const createNamespaceEditor = (name: string, teamId: string, reviewGroup: string, namespaces: string[]) =>
  createUser({
    name,
    teams: [{ teamId, role: 'editor', reviewGroup, namespaces }],
  });

export const createNamespaceAuthor = (name: string, teamId: string, reviewGroup: string, namespaces: string[]) =>
  createUser({
    name,
    teams: [{ teamId, role: 'author', reviewGroup, namespaces }],
  });

export const createTranslator = (name: string, language: string, namespaces: string[]) =>
  createUser({
    name,
    translations: [{ language, namespaces }],
  });