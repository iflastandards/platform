---
inclusion: fileMatch
fileMatchPattern: ['**/admin/**/*.ts', '**/admin/**/*.tsx', '**/admin/**/*.js', '**/admin/**/*.jsx']
---

# NestJS Admin Coding Standards

## Overview

This document outlines the coding standards and architectural patterns for the Next.js-based admin portal in the IFLA Standards Platform. These standards ensure consistency, maintainability, and proper integration with the platform's architecture.

## Base Path Handling

When using a `basePath` (e.g., `/admin`) in the Next.js admin portal, follow these strict conventions to avoid routing bugs:

### Internal Links and Navigation

- **Always use Next.js routing utilities for internal links**
  ```tsx
  // CORRECT
  import Link from 'next/link';
  <Link href="/dashboard">Dashboard</Link>
  
  // INCORRECT - Never use raw anchor tags for internal navigation
  <a href="/admin/dashboard">Dashboard</a>
  ```

- **Use the `useRouter` hook for programmatic navigation**
  ```tsx
  // CORRECT
  import { useRouter } from 'next/navigation';
  const router = useRouter();
  router.push('/settings');
  
  // INCORRECT
  window.location.href = '/admin/settings';
  ```

### API Calls and Static Assets

- **Use the custom `addBasePath` utility for all API calls and static assets**
  ```tsx
  // CORRECT
  import { addBasePath } from '@ifla/theme/utils';
  
  // API calls
  fetch(addBasePath('/api/users'))
  
  // Images and static assets
  <img src={addBasePath('/images/logo.png')} alt="Logo" />
  ```

- **Never manually prepend the base path**
  ```tsx
  // INCORRECT
  fetch('/admin/api/users')
  <img src="/admin/images/logo.png" alt="Logo" />
  ```

### Middleware and Route Handlers

- **Write all middleware matchers without the base path**
  ```tsx
  // CORRECT
  export const config = {
    matcher: ['/dashboard/:path*', '/settings/:path*']
  };
  
  // INCORRECT
  export const config = {
    matcher: ['/admin/dashboard/:path*', '/admin/settings/:path*']
  };
  ```

## Component Architecture

### Component Organization

- **Use the App Router directory structure**
  ```
  app/
  ├── (auth)/           # Authentication routes grouped
  │   ├── login/        # Login page
  │   └── register/     # Registration page
  ├── (dashboard)/      # Dashboard routes grouped
  │   ├── projects/     # Projects page
  │   └── settings/     # Settings page
  ├── api/              # API routes
  └── layout.tsx        # Root layout
  ```

- **Co-locate components with their pages**
  ```
  app/projects/
  ├── page.tsx          # Page component
  ├── ProjectList.tsx   # Page-specific component
  └── ProjectCard.tsx   # Page-specific component
  ```

- **Place shared components in a dedicated directory**
  ```
  components/
  ├── ui/              # Reusable UI components
  ├── forms/           # Form components
  └── layouts/         # Layout components
  ```

### Component Patterns

- **Use TypeScript for all components**
  ```tsx
  // CORRECT
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }
  
  export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
    return (
      <button 
        className={`btn btn-${variant}`} 
        onClick={onClick}
      >
        {label}
      </button>
    );
  }
  ```

- **Prefer functional components with hooks**
  ```tsx
  // CORRECT
  import { useState, useEffect } from 'react';
  
  export function UserProfile({ userId }: { userId: string }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
      async function fetchUser() {
        const response = await fetch(addBasePath(`/api/users/${userId}`));
        const data = await response.json();
        setUser(data);
      }
      fetchUser();
    }, [userId]);
    
    // Component rendering
  }
  ```

- **Use React Server Components where appropriate**
  ```tsx
  // Server Component
  export default async function ProjectList() {
    const projects = await getProjects();
    
    return (
      <div>
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }
  ```

## State Management

### Server State

- **Use React Query for server state management**
  ```tsx
  // CORRECT
  import { useQuery } from '@tanstack/react-query';
  
  function useProjects() {
    return useQuery({
      queryKey: ['projects'],
      queryFn: async () => {
        const response = await fetch(addBasePath('/api/projects'));
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
      }
    });
  }
  ```

- **Implement proper error handling and loading states**
  ```tsx
  function ProjectsPage() {
    const { data, isLoading, error } = useProjects();
    
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.message} />;
    
    return <ProjectList projects={data} />;
  }
  ```

### Client State

- **Use React Context for shared state**
  ```tsx
  // CORRECT
  // context/ThemeContext.tsx
  import { createContext, useContext, useState } from 'react';
  
  const ThemeContext = createContext(null);
  
  export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    
    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }
  
  export function useTheme() {
    return useContext(ThemeContext);
  }
  ```

- **Use local state for component-specific state**
  ```tsx
  function FilterPanel() {
    const [filters, setFilters] = useState({
      status: 'all',
      type: 'all'
    });
    
    // Component logic
  }
  ```

## API Integration

### API Routes

- **Organize API routes by resource**
  ```
  app/api/
  ├── projects/
  │   ├── route.ts           # GET, POST /api/projects
  │   └── [id]/
  │       └── route.ts       # GET, PUT, DELETE /api/projects/:id
  ├── users/
  │   └── route.ts           # GET, POST /api/users
  └── auth/
      └── route.ts           # Authentication endpoints
  ```

- **Use Next.js Route Handlers with proper HTTP methods**
  ```tsx
  // CORRECT
  // app/api/projects/route.ts
  import { NextResponse } from 'next/server';
  
  export async function GET(request: Request) {
    // Handle GET request
    const projects = await fetchProjects();
    return NextResponse.json(projects);
  }
  
  export async function POST(request: Request) {
    // Handle POST request
    const data = await request.json();
    const newProject = await createProject(data);
    return NextResponse.json(newProject, { status: 201 });
  }
  ```

### Error Handling

- **Use consistent error response format**
  ```tsx
  // CORRECT
  try {
    // API logic
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
  ```

- **Implement proper status codes**
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Server Error

## Authentication and Authorization

### Clerk Integration

- **Use Clerk middleware for protected routes**
  ```tsx
  // middleware.ts
  import { authMiddleware } from '@clerk/nextjs';
  
  export default authMiddleware({
    publicRoutes: ['/api/public', '/login']
  });
  
  export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)']
  };
  ```

- **Access user data with Clerk hooks**
  ```tsx
  // CORRECT
  import { useUser } from '@clerk/nextjs';
  
  function ProfilePage() {
    const { user, isLoaded } = useUser();
    
    if (!isLoaded) return <LoadingSpinner />;
    
    return (
      <div>
        <h1>Welcome, {user.firstName}</h1>
        {/* Profile content */}
      </div>
    );
  }
  ```

### Cerbos Authorization

- **Use Cerbos for role-based access control**
  ```tsx
  // CORRECT
  import { checkAccess } from '@ifla/admin/lib/cerbos';
  
  export async function canUserEditProject(userId: string, projectId: string) {
    const decision = await checkAccess({
      principal: { id: userId, roles: ['user'] },
      resource: { kind: 'project', id: projectId },
      action: 'edit'
    });
    
    return decision.allowed;
  }
  ```

- **Implement UI-level permission checks**
  ```tsx
  function ProjectActions({ project }) {
    const { user } = useUser();
    const { data: permissions } = useQuery({
      queryKey: ['permissions', project.id, user?.id],
      queryFn: () => fetchUserPermissions(user.id, project.id)
    });
    
    return (
      <div>
        {permissions?.canEdit && (
          <Button label="Edit" onClick={() => editProject(project.id)} />
        )}
        {permissions?.canDelete && (
          <Button label="Delete" onClick={() => deleteProject(project.id)} />
        )}
      </div>
    );
  }
  ```

## Form Handling

### Form Validation

- **Use Zod for form validation**
  ```tsx
  // CORRECT
  import { z } from 'zod';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  
  const projectSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['active', 'archived', 'draft'])
  });
  
  type ProjectFormData = z.infer<typeof projectSchema>;
  
  function ProjectForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
      resolver: zodResolver(projectSchema)
    });
    
    const onSubmit = (data: ProjectFormData) => {
      // Submit form data
    };
    
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    );
  }
  ```

### Form Components

- **Create reusable form components**
  ```tsx
  // CORRECT
  function TextField({ 
    label, 
    name, 
    register, 
    error 
  }: {
    label: string;
    name: string;
    register: any;
    error?: string;
  }) {
    return (
      <div className="form-field">
        <label htmlFor={name}>{label}</label>
        <input id={name} {...register(name)} />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
  ```

## Testing

### Unit Testing

- **Test components with React Testing Library**
  ```tsx
  // CORRECT
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { Button } from './Button';
  
  describe('Button', () => {
    it('renders with the correct label', () => {
      render(<Button label="Click me" onClick={() => {}} />);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
    
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<Button label="Click me" onClick={handleClick} />);
      
      await userEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  ```

### API Testing

- **Test API routes with supertest**
  ```tsx
  // CORRECT
  import { createRequest, createResponse } from 'node-mocks-http';
  import { GET } from './app/api/projects/route';
  
  describe('Projects API', () => {
    it('returns projects list', async () => {
      const req = createRequest({
        method: 'GET',
      });
      const res = createResponse();
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });
  ```

## Performance Optimization

### Code Splitting

- **Use dynamic imports for code splitting**
  ```tsx
  // CORRECT
  import dynamic from 'next/dynamic';
  
  const DashboardChart = dynamic(() => import('./DashboardChart'), {
    loading: () => <p>Loading chart...</p>,
    ssr: false // Disable for client-side only components
  });
  ```

### Image Optimization

- **Use Next.js Image component for optimized images**
  ```tsx
  // CORRECT
  import Image from 'next/image';
  
  function Avatar({ user }) {
    return (
      <Image
        src={user.avatarUrl}
        alt={`${user.name}'s avatar`}
        width={64}
        height={64}
        priority={false}
      />
    );
  }
  ```

## Accessibility

### Semantic HTML

- **Use semantic HTML elements**
  ```tsx
  // CORRECT
  <nav aria-label="Main navigation">
    <ul>
      <li><Link href="/dashboard">Dashboard</Link></li>
      <li><Link href="/projects">Projects</Link></li>
    </ul>
  </nav>
  
  // INCORRECT
  <div className="nav">
    <div><a href="/admin/dashboard">Dashboard</a></div>
    <div><a href="/admin/projects">Projects</a></div>
  </div>
  ```

### ARIA Attributes

- **Use ARIA attributes when necessary**
  ```tsx
  // CORRECT
  <button 
    aria-expanded={isOpen} 
    aria-controls="dropdown-menu"
    onClick={toggleMenu}
  >
    Menu
  </button>
  <div 
    id="dropdown-menu" 
    role="menu" 
    hidden={!isOpen}
  >
    {/* Menu items */}
  </div>
  ```

## Error Boundaries

- **Implement error boundaries for graceful error handling**
  ```tsx
  // CORRECT
  'use client';
  
  import { useEffect } from 'react';
  
  export default function ErrorBoundary({
    error,
    reset,
  }: {
    error: Error & { digest?: string };
    reset: () => void;
  }) {
    useEffect(() => {
      // Log the error to an error reporting service
      console.error('Unhandled error:', error);
    }, [error]);
  
    return (
      <div className="error-container">
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </div>
    );
  }
  ```

## Summary of Best Practices

1. **Base Path Handling**
   - Always use Next.js routing utilities
   - Use the custom `addBasePath` utility for API calls and static assets
   - Never manually prepend the base path

2. **Component Architecture**
   - Use the App Router directory structure
   - Co-locate components with their pages
   - Use TypeScript for all components
   - Prefer functional components with hooks

3. **State Management**
   - Use React Query for server state
   - Use React Context for shared state
   - Use local state for component-specific state

4. **API Integration**
   - Organize API routes by resource
   - Use Next.js Route Handlers with proper HTTP methods
   - Implement consistent error handling

5. **Authentication and Authorization**
   - Use Clerk middleware for protected routes
   - Use Cerbos for role-based access control
   - Implement UI-level permission checks

6. **Form Handling**
   - Use Zod for form validation
   - Create reusable form components

7. **Testing**
   - Test components with React Testing Library
   - Test API routes with supertest

8. **Performance Optimization**
   - Use dynamic imports for code splitting
   - Use Next.js Image component for optimized images

9. **Accessibility**
   - Use semantic HTML elements
   - Use ARIA attributes when necessary
   - Implement keyboard navigation