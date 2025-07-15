# GitHub Integration Implementation Patterns

This document contains detailed implementation patterns, code examples, and best practices for the GitHub Teams integration.

## Table of Contents

1. [Test Data Generation with Faker.js](#test-data-generation-with-fakerjs)
2. [Mock Service Worker (MSW) Setup](#mock-service-worker-msw-setup)
3. [Component Specifications](#component-specifications)
4. [Error Handling Patterns](#error-handling-patterns)
5. [Performance Optimization](#performance-optimization)
6. [Security Implementation](#security-implementation)

## Test Data Generation with Faker.js

### Basic User Generation

```typescript
// scripts/generate-test-users.ts
import { faker } from '@faker-js/faker';
import type { ClerkUser } from '@clerk/nextjs/server';

interface TestUser {
  email: string;
  username: string;
  publicMetadata: {
    githubId: string;
    githubUsername: string;
    systemRole?: 'admin';
    reviewGroups: Array<{
      slug: string;
      name: string;
      role: 'maintainer' | 'member';
      namespaces: string[];
    }>;
    isReviewGroupAdmin: boolean;
    totalActiveProjects: number;
  };
  privateMetadata: {
    projects: Record<string, any>;
    accessibleNamespaces: string[];
    lastGitHubSync: string;
  };
}

export function generateTestUser(options: {
  role?: 'admin' | 'rg_admin' | 'editor' | 'author' | 'translator';
  teamCount?: number;
} = {}): TestUser {
  const { role = faker.helpers.arrayElement(['editor', 'author', 'translator']), teamCount = 1 } = options;
  
  const username = faker.internet.userName().toLowerCase().replace(/[._]/g, '-');
  const teams = generateTeamMemberships(role, teamCount);
  
  return {
    email: faker.internet.email(),
    username,
    publicMetadata: {
      githubId: faker.string.numeric(8),
      githubUsername: username,
      systemRole: role === 'admin' ? 'admin' : undefined,
      reviewGroups: teams,
      isReviewGroupAdmin: teams.some(t => t.role === 'maintainer'),
      totalActiveProjects: faker.number.int({ min: 0, max: 5 })
    },
    privateMetadata: {
      projects: generateProjects(teams),
      accessibleNamespaces: teams.flatMap(t => t.namespaces),
      lastGitHubSync: faker.date.recent().toISOString()
    }
  };
}

function generateTeamMemberships(role: string, count: number) {
  const availableTeams = [
    { slug: 'isbd-review-group', name: 'ISBD Review Group', namespaces: ['isbd', 'isbdm'] },
    { slug: 'bcm-review-group', name: 'BCM Review Group', namespaces: ['bcm'] },
    { slug: 'cat-review-group', name: 'CAT Review Group', namespaces: ['cat'] },
    { slug: 'unimarc-review-group', name: 'UNIMARC Review Group', namespaces: ['unimarc'] },
    { slug: 'subject-analysis-review-group', name: 'Subject Analysis Review Group', namespaces: ['subject'] }
  ];
  
  const selectedTeams = faker.helpers.arrayElements(availableTeams, { min: 1, max: Math.min(count, 3) });
  
  return selectedTeams.map((team, index) => ({
    ...team,
    role: (role === 'rg_admin' && index === 0) ? 'maintainer' as const : 'member' as const
  }));
}
```

### Edge Case Generation

```typescript
// Generate users with specific scenarios
export function generateEdgeCaseUsers() {
  return [
    // User in multiple teams with different roles
    generateTestUser({ role: 'editor', teamCount: 3 }),
    
    // RG Admin of one team, member of others
    {
      ...generateTestUser({ role: 'rg_admin', teamCount: 2 }),
      publicMetadata: {
        ...generateTestUser({ role: 'rg_admin', teamCount: 2 }).publicMetadata,
        reviewGroups: [
          { slug: 'isbd-review-group', name: 'ISBD', role: 'maintainer', namespaces: ['isbd'] },
          { slug: 'bcm-review-group', name: 'BCM', role: 'member', namespaces: ['bcm'] }
        ]
      }
    },
    
    // Translator with no team membership (project-only)
    {
      ...generateTestUser({ role: 'translator', teamCount: 0 }),
      publicMetadata: {
        ...generateTestUser({ role: 'translator', teamCount: 0 }).publicMetadata,
        reviewGroups: []
      }
    }
  ];
}
```

## Mock Service Worker (MSW) Setup

### Initial Configuration

```typescript
// apps/admin/src/mocks/browser.ts
import { setupWorker } from 'msw';
import { githubHandlers } from './github-handlers';

export const worker = setupWorker(...githubHandlers);

// Start worker in development
if (process.env.NODE_ENV === 'development' && process.env.MOCK_GITHUB_API === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass'
  });
}
```

### Comprehensive GitHub Handlers

```typescript
// apps/admin/src/mocks/github-handlers.ts
import { rest } from 'msw';
import { faker } from '@faker-js/faker';

// Stateful mock data
let mockTeams = generateMockTeams();
let mockMembers = new Map<string, any[]>();

export const githubHandlers = [
  // List organization teams
  rest.get('https://api.github.com/orgs/iflastandards/teams', (req, res, ctx) => {
    // Simulate occasional errors
    if (shouldSimulateError()) {
      return res(
        ctx.status(500),
        ctx.json({ message: 'Internal Server Error' })
      );
    }
    
    return res(ctx.json(mockTeams));
  }),
  
  // Get team members with pagination
  rest.get('https://api.github.com/orgs/iflastandards/teams/:team_slug/members', (req, res, ctx) => {
    const { team_slug } = req.params;
    const page = Number(req.url.searchParams.get('page') || 1);
    const perPage = Number(req.url.searchParams.get('per_page') || 30);
    
    const members = mockMembers.get(team_slug as string) || generateTeamMembers(team_slug as string);
    mockMembers.set(team_slug as string, members);
    
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedMembers = members.slice(start, end);
    
    return res(
      ctx.set({
        'Link': generateLinkHeader(page, perPage, members.length),
        'X-Total-Count': String(members.length)
      }),
      ctx.json(paginatedMembers)
    );
  }),
  
  // Add team member
  rest.put('https://api.github.com/orgs/iflastandards/teams/:team_slug/memberships/:username', 
    async (req, res, ctx) => {
      const { team_slug, username } = req.params;
      const body = await req.json();
      
      // Simulate rate limiting
      if (shouldSimulateRateLimit()) {
        return res(
          ctx.status(403),
          ctx.set({
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600)
          }),
          ctx.json({ message: 'API rate limit exceeded' })
        );
      }
      
      // Add member to mock data
      const members = mockMembers.get(team_slug as string) || [];
      if (!members.find(m => m.login === username)) {
        members.push({
          login: username,
          id: faker.number.int({ min: 10000, max: 99999 }),
          avatar_url: faker.image.avatar(),
          type: 'User'
        });
        mockMembers.set(team_slug as string, members);
      }
      
      return res(
        ctx.json({
          url: `https://api.github.com/teams/${team_slug}/memberships/${username}`,
          role: body.role || 'member',
          state: 'active'
        })
      );
    }
  ),
  
  // Remove team member
  rest.delete('https://api.github.com/orgs/iflastandards/teams/:team_slug/memberships/:username',
    (req, res, ctx) => {
      const { team_slug, username } = req.params;
      
      const members = mockMembers.get(team_slug as string) || [];
      const filtered = members.filter(m => m.login !== username);
      mockMembers.set(team_slug as string, filtered);
      
      return res(ctx.status(204));
    }
  )
];

// Helper functions
function shouldSimulateError(): boolean {
  return process.env.MOCK_ERRORS === 'true' && Math.random() < 0.1;
}

function shouldSimulateRateLimit(): boolean {
  return process.env.MOCK_RATE_LIMIT === 'true' && Math.random() < 0.2;
}

function generateLinkHeader(page: number, perPage: number, total: number): string {
  const lastPage = Math.ceil(total / perPage);
  const links = [];
  
  if (page < lastPage) {
    links.push(`<https://api.github.com/resource?page=${page + 1}>; rel="next"`);
  }
  if (page > 1) {
    links.push(`<https://api.github.com/resource?page=${page - 1}>; rel="prev"`);
  }
  links.push(`<https://api.github.com/resource?page=${lastPage}>; rel="last"`);
  links.push(`<https://api.github.com/resource?page=1>; rel="first"`);
  
  return links.join(', ');
}
```

## Component Specifications

### User Management Table

```typescript
// apps/admin/src/components/team/UserManagementTable.tsx
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

interface UserManagementTableProps {
  users: Array<{
    id: string;
    username: string;
    email: string;
    teams: Array<{ name: string; role: string }>;
    lastActive: Date;
  }>;
  onRoleChange: (userId: string, teamSlug: string, newRole: string) => void;
  onRemoveFromTeam: (userId: string, teamSlug: string) => void;
  loading?: boolean;
}

export function UserManagementTable({ users, onRoleChange, onRemoveFromTeam, loading }: UserManagementTableProps) {
  const columns: GridColDef[] = [
    { 
      field: 'username', 
      headerName: 'GitHub Username', 
      width: 150,
      renderCell: (params) => (
        <a href={`https://github.com/${params.value}`} target="_blank" rel="noopener noreferrer">
          @{params.value}
        </a>
      )
    },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'teams',
      headerName: 'Team Memberships',
      width: 300,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {params.value.map((team: any) => (
            <Chip
              key={team.name}
              label={`${team.name} (${team.role})`}
              size="small"
              color={team.role === 'maintainer' ? 'primary' : 'default'}
            />
          ))}
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => <UserActions user={params.row} onRoleChange={onRoleChange} />
    }
  ];
  
  return (
    <DataGrid
      rows={users}
      columns={columns}
      loading={loading}
      pageSizeOptions={[10, 25, 50]}
      checkboxSelection
      disableRowSelectionOnClick
    />
  );
}
```

### Team Assignment Form

```typescript
// apps/admin/src/components/team/TeamAssignmentForm.tsx
import { useState } from 'react';
import { Autocomplete, TextField, Button, FormControl, Select, MenuItem } from '@mui/material';
import { useGitHubUsers } from '@/hooks/useGitHubUsers';

interface TeamAssignmentFormProps {
  teamSlug: string;
  existingMembers: string[];
  onAssign: (username: string, role: 'member' | 'maintainer') => Promise<void>;
}

export function TeamAssignmentForm({ teamSlug, existingMembers, onAssign }: TeamAssignmentFormProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [role, setRole] = useState<'member' | 'maintainer'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { users, loading } = useGitHubUsers();
  
  // Filter out existing members
  const availableUsers = users.filter(u => !existingMembers.includes(u.login));
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await onAssign(selectedUser, role);
      setSelectedUser('');
      setRole('member');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <Autocomplete
        value={selectedUser}
        onChange={(_, value) => setSelectedUser(value || '')}
        options={availableUsers.map(u => u.login)}
        loading={loading}
        renderInput={(params) => (
          <TextField {...params} label="GitHub Username" variant="outlined" />
        )}
        style={{ width: 300 }}
      />
      
      <FormControl>
        <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
          <MenuItem value="member">Member</MenuItem>
          <MenuItem value="maintainer">Maintainer</MenuItem>
        </Select>
      </FormControl>
      
      <Button 
        type="submit" 
        variant="contained" 
        disabled={!selectedUser || isSubmitting}
      >
        Add to Team
      </Button>
    </form>
  );
}
```

## Error Handling Patterns

### Centralized Error Handler

```typescript
// apps/admin/src/lib/error-handler.ts
import { toast } from 'react-hot-toast';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): void {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 401:
        toast.error('Authentication failed. Please sign in again.');
        // Redirect to login
        break;
      case 403:
        if (error.code === 'rate_limit') {
          toast.error('GitHub API rate limit exceeded. Please try again later.');
        } else {
          toast.error('You do not have permission to perform this action.');
        }
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(error.message || 'An unexpected error occurred.');
    }
  } else {
    toast.error('An unexpected error occurred.');
  }
}
```

### React Query Integration

```typescript
// apps/admin/src/hooks/useTeamMembers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubService } from '@/services/github';
import { handleAPIError } from '@/lib/error-handler';

export function useTeamMembers(teamSlug: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['team-members', teamSlug],
    queryFn: () => githubService.getTeamMembers(teamSlug),
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof APIError && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
    onError: handleAPIError
  });
  
  const addMember = useMutation({
    mutationFn: ({ username, role }: { username: string; role: 'member' | 'maintainer' }) =>
      githubService.addTeamMember(teamSlug, username, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members', teamSlug]);
      toast.success('Team member added successfully');
    },
    onError: handleAPIError
  });
  
  return {
    members: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addMember
  };
}
```

## Performance Optimization

### Debounced Search

```typescript
// apps/admin/src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage in user search
export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { data: users } = useQuery({
    queryKey: ['users', debouncedSearch],
    queryFn: () => githubService.searchUsers(debouncedSearch),
    enabled: debouncedSearch.length > 2
  });
  
  return (
    <Autocomplete
      options={users || []}
      onInputChange={(_, value) => setSearchTerm(value)}
      // ...
    />
  );
}
```

### Virtual List for Large Teams

```typescript
// apps/admin/src/components/team/VirtualMemberList.tsx
import { FixedSizeList } from 'react-window';
import { ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';

interface VirtualMemberListProps {
  members: Array<{
    id: string;
    login: string;
    avatar_url: string;
    role: string;
  }>;
  height: number;
}

export function VirtualMemberList({ members, height }: VirtualMemberListProps) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const member = members[index];
    
    return (
      <ListItem style={style} key={member.id}>
        <ListItemAvatar>
          <Avatar src={member.avatar_url} alt={member.login} />
        </ListItemAvatar>
        <ListItemText
          primary={`@${member.login}`}
          secondary={member.role}
        />
      </ListItem>
    );
  };
  
  return (
    <FixedSizeList
      height={height}
      itemCount={members.length}
      itemSize={72}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## Security Implementation

### Permission Hook

```typescript
// apps/admin/src/hooks/usePermissions.ts
import { useUser } from '@clerk/nextjs';

export function usePermissions() {
  const { user } = useUser();
  
  const isSystemAdmin = user?.publicMetadata?.systemRole === 'admin';
  
  const isTeamMaintainer = (teamSlug: string): boolean => {
    const teams = user?.publicMetadata?.reviewGroups as any[] || [];
    return teams.some(t => t.slug === teamSlug && t.role === 'maintainer');
  };
  
  const canManageTeam = (teamSlug: string): boolean => {
    return isSystemAdmin || isTeamMaintainer(teamSlug);
  };
  
  const canAssignRoles = (teamSlug: string): boolean => {
    return canManageTeam(teamSlug);
  };
  
  const canCreateProjects = (teamSlug: string): boolean => {
    return canManageTeam(teamSlug);
  };
  
  return {
    isSystemAdmin,
    isTeamMaintainer,
    canManageTeam,
    canAssignRoles,
    canCreateProjects
  };
}
```

### Protected Route Component

```typescript
// apps/admin/src/components/auth/ProtectedRoute.tsx
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate } from 'react-router-dom';
import { Alert } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'systemAdmin' | 'teamMaintainer';
  teamSlug?: string;
}

export function ProtectedRoute({ children, requiredPermission, teamSlug }: ProtectedRouteProps) {
  const permissions = usePermissions();
  
  let hasPermission = true;
  
  switch (requiredPermission) {
    case 'systemAdmin':
      hasPermission = permissions.isSystemAdmin;
      break;
    case 'teamMaintainer':
      hasPermission = teamSlug ? permissions.canManageTeam(teamSlug) : false;
      break;
  }
  
  if (!hasPermission) {
    return (
      <Alert severity="error">
        You do not have permission to access this page.
      </Alert>
    );
  }
  
  return <>{children}</>;
}
```

---

This implementation patterns document provides concrete, production-ready code examples that can be directly used in the GitHub Teams integration project. Each pattern has been designed with security, performance, and maintainability in mind.