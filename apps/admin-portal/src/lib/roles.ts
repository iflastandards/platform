// apps/admin-portal/src/lib/roles.ts

export interface RoleAssignment {
  userId: string;
  role: string;
  namespace?: string;
  site?: string;
}

export interface UserRoles {
  userId: string;
  roles: RoleAssignment[];
}
