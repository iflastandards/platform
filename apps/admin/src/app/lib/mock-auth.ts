/**
 * Mock authentication utilities for testing
 * This provides a way to create and manage mock users for testing purposes
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// In-memory storage for mock users
const mockUsers = new Map<string, MockUser>();

/**
 * Create a mock user for testing
 */
export function createUser(userData: {
  name: string;
  roles: string[];
}): MockUser {
  // Generate a unique ID
  const id = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate email from name
  const email = userData.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '.') // Replace spaces with dots
    .replace(/-+/g, '-') // Keep hyphens
    + '@example.com';
  
  const user: MockUser = {
    id,
    name: userData.name,
    email,
    roles: userData.roles,
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