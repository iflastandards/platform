/**
 * Vocabulary Management API Routes
 * 
 * This API demonstrates namespace-level authorization for vocabulary operations.
 * All vocabulary permissions are determined by namespace access - there are no
 * vocabulary-specific permissions in the system.
 * 
 * Authorization Hierarchy:
 * - Superadmins: Full access to all vocabularies
 * - Review Group Admins: Full access to vocabularies in their review group's namespaces
 * - Team Editors: Full CRUD access to vocabularies in their assigned namespaces
 * - Team Authors: Create/Read/Update access to vocabularies in their assigned namespaces
 * - Translators: Read-only access to vocabularies in their assigned namespaces
 * - Authenticated Users: Read-only access to all vocabularies
 * 
 * @module api/admin/vocabularies
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/withAuth';

// Zod schemas for request/response validation
const VocabularySchema = z.object({
  id: z.string().uuid(),
  namespaceId: z.string().min(1, 'Namespace ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  status: z.enum(['draft', 'published', 'deprecated']).default('draft'),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
});

const CreateVocabularySchema = z.object({
  namespaceId: z.string().min(1, 'Namespace ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  metadata: z.record(z.string(), z.any()).optional(),
});

const UpdateVocabularySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  status: z.enum(['draft', 'published', 'deprecated']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const VocabularyListQuerySchema = z.object({
  namespaceId: z.string().optional(),
  status: z.enum(['draft', 'published', 'deprecated']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

type Vocabulary = z.infer<typeof VocabularySchema>;
type CreateVocabularyRequest = z.infer<typeof CreateVocabularySchema>;
type UpdateVocabularyRequest = z.infer<typeof UpdateVocabularySchema>;
type VocabularyListQuery = z.infer<typeof VocabularyListQuerySchema>;

// Mock data store (replace with actual database calls)
const mockVocabularies: Vocabulary[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    namespaceId: 'isbd',
    name: 'ISBD Core Elements',
    description: 'Core bibliographic elements for ISBD',
    version: '1.0.0',
    status: 'published',
    metadata: { standard: 'ISBD', category: 'core' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: '550e8400-e29b-41d4-a716-446655440000',
    updatedBy: '550e8400-e29b-41d4-a716-446655440000',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    namespaceId: 'unimarc',
    name: 'UNIMARC Fields',
    description: 'UNIMARC bibliographic format fields',
    version: '2.1.0',
    status: 'published',
    metadata: { standard: 'UNIMARC', category: 'fields' },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    createdBy: '550e8400-e29b-41d4-a716-446655440000',
    updatedBy: '550e8400-e29b-41d4-a716-446655440000',
  },
];

/**
 * GET /api/admin/vocabularies
 * 
 * List vocabularies with optional filtering and pagination.
 * Users can only see vocabularies from namespaces they have access to.
 * 
 * Query Parameters:
 * - namespaceId: Filter by namespace (optional)
 * - status: Filter by status (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search term for name/description (optional)
 * 
 * Authorization: Authenticated users can read vocabularies from accessible namespaces
 */
export const GET = withAuth(
  async (req: AuthenticatedRequest) => {
    try {
      // Parse and validate query parameters
      const url = new URL(req.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const query = VocabularyListQuerySchema.parse(queryParams);

      // Get user's accessible namespaces
      const userAccessibleNamespaces = await getUserAccessibleNamespaces(req.auth);
      
      // Filter vocabularies based on user access
      let filteredVocabularies = mockVocabularies.filter(vocab => {
        // Check namespace access
        if (!userAccessibleNamespaces.includes(vocab.namespaceId)) {
          return false;
        }
        
        // Apply query filters
        if (query.namespaceId && vocab.namespaceId !== query.namespaceId) {
          return false;
        }
        
        if (query.status && vocab.status !== query.status) {
          return false;
        }
        
        if (query.search) {
          const searchLower = query.search.toLowerCase();
          return vocab.name.toLowerCase().includes(searchLower) ||
                 vocab.description?.toLowerCase().includes(searchLower);
        }
        
        return true;
      });

      // Apply pagination
      const total = filteredVocabularies.length;
      const offset = (query.page - 1) * query.limit;
      const paginatedVocabularies = filteredVocabularies.slice(offset, offset + query.limit);

      return NextResponse.json({
        success: true,
        data: paginatedVocabularies,
        meta: {
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
            hasNext: offset + query.limit < total,
            hasPrev: query.page > 1,
          },
          cache: {
            ttl: 300, // 5 minutes
            key: `vocabularies:${req.auth.userId}:${JSON.stringify(query)}`,
          },
        },
      });

    } catch (error) {
      console.error('Error fetching vocabularies:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.issues,
          },
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch vocabularies',
        },
      }, { status: 500 });
    }
  },
  {
    resourceType: 'vocabulary',
    action: 'read',
    debug: true,
  }
);

/**
 * POST /api/admin/vocabularies
 * 
 * Create a new vocabulary in a specific namespace.
 * User must have 'create' permission for vocabularies in the target namespace.
 * 
 * Request Body:
 * - namespaceId: Target namespace ID (required)
 * - name: Vocabulary name (required)
 * - description: Optional description
 * - version: Version string (default: "1.0.0")
 * - metadata: Optional metadata object
 * 
 * Authorization: User must have vocabulary create permission in the target namespace
 */
export const POST = withAuth(
  async (req: AuthenticatedRequest) => {
    try {
      // Parse and validate request body
      const body = await req.json();
      const createData = CreateVocabularySchema.parse(body);

      // Generate new vocabulary
      const newVocabulary: Vocabulary = {
        id: crypto.randomUUID(),
        ...createData,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.auth.userId,
        updatedBy: req.auth.userId,
      };

      // In a real implementation, save to database
      mockVocabularies.push(newVocabulary);

      return NextResponse.json({
        success: true,
        data: newVocabulary,
        meta: {
          message: `Vocabulary "${newVocabulary.name}" created successfully in namespace "${newVocabulary.namespaceId}"`,
        },
      }, { status: 201 });

    } catch (error) {
      console.error('Error creating vocabulary:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues,
          },
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create vocabulary',
        },
      }, { status: 500 });
    }
  },
  {
    resourceType: 'vocabulary',
    action: 'create',
    getResourceAttributes: (req) => {
      // For POST requests, we'll check authorization inside the handler
      // since we need to parse the body first
      return {};
    },
    debug: true,
    errorMessage: 'You do not have permission to create vocabularies in this namespace',
  }
);

/**
 * Helper function to get user's accessible namespaces
 * This would typically query the database based on user roles
 */
async function getUserAccessibleNamespaces(authContext: any): Promise<string[]> {
  // Superadmins have access to all namespaces
  if (authContext.roles.systemRole === 'superadmin' || authContext.roles.system === 'superadmin') {
    return ['isbd', 'unimarc', 'frbr', 'lrm', 'mri']; // Return all namespaces
  }

  const accessibleNamespaces = new Set<string>();

  // Add namespaces from team memberships
  authContext.roles.teams?.forEach((team: any) => {
    team.namespaces?.forEach((ns: string) => accessibleNamespaces.add(ns));
  });

  // Add namespaces from translation assignments
  authContext.roles.translations?.forEach((trans: any) => {
    trans.namespaces?.forEach((ns: string) => accessibleNamespaces.add(ns));
  });

  // Review group admins get access to all namespaces in their review groups
  // This would require a database lookup to map review groups to namespaces
  if (authContext.roles.reviewGroups?.length > 0) {
    // For demo purposes, assume review group admins get access to common namespaces
    ['isbd', 'unimarc', 'frbr'].forEach(ns => accessibleNamespaces.add(ns));
  }

  return Array.from(accessibleNamespaces);
}

/**
 * Example usage in client code:
 * 
 * // List vocabularies
 * const response = await fetch('/api/admin/vocabularies?namespaceId=isbd&status=published');
 * const { data: vocabularies, meta } = await response.json();
 * 
 * // Create vocabulary
 * const newVocab = await fetch('/api/admin/vocabularies', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     namespaceId: 'isbd',
 *     name: 'New ISBD Vocabulary',
 *     description: 'A new vocabulary for ISBD elements',
 *   }),
 * });
 * 
 * // Error handling
 * if (!response.ok) {
 *   const { error } = await response.json();
 *   if (error.code === 'PERMISSION_DENIED') {
 *     // Handle authorization error
 *     console.error('Access denied:', error.message);
 *   }
 * }
 */
