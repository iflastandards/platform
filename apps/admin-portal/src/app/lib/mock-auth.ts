// apps/admin-portal/src/lib/mock-auth.ts

interface MockUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

const mockUsers: Record<string, MockUser> = {};

export function createUser(userData: { name: string; roles: string[] }): MockUser {
  const id = `mock-${Date.now()}`;
  const user: MockUser = {
    id,
    name: userData.name,
    email: `${userData.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
    roles: userData.roles,
  };
  mockUsers[id] = user;
  return user;
}

export function getUser(id: string): MockUser | null {
  return mockUsers[id] || null;
}
