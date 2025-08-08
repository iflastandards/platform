/**
 * Individual Vocabulary API Routes
 * 
 * This API handles operations on specific vocabularies by ID.
 * All operations use namespace-level authorization - the vocabulary's
 * namespace determines access permissions.
 * 
 * @module api/admin/vocabularies/[id]
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/withAuth';

// Reuse schemas from the main vocabularies route
const UpdateVocabularySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  status: z.enum(['draft', 'published', 'deprecated']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Mock data store (same as main route - in real app, this would be a database)
const mockVocabularies = [
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
 * GET /api/admin/vocabularies/[id]
 * 
 * Retrieve a specific vocabulary by ID.
 * User must have read access to the vocabulary's namespace.
 * 
 * Path Parameters:
 * - id: Vocabulary UUID
 * 
 * Authorization: User must have read access to the vocabulary's namespace
 */
export const GET = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Record<string, string> }) => {
    try {
      const vocabularyId = params.id;

      // Validate UUID format
      if (!z.string().uuid().safeParse(vocabularyId).success) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid vocabulary ID format',
          },
        }, { status: 400 });
      }

      // Find vocabulary
      const vocabulary = mockVocabularies.find(v => v.id === vocabularyId);
      
      if (!vocabulary) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vocabulary not found',
          },
        }, { status: 404 });
      }

      // Check namespace access
      const hasAccess = await checkNamespaceAccess(req.auth, vocabulary.namespaceId);
      
      if (!hasAccess) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'You do not have access to this vocabulary',
          },
        }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        data: vocabulary,
        meta: {
          cache: {
            ttl: 300, // 5 minutes
            key: `vocabulary:${vocabularyId}:${req.auth.userId}`,
          },
        },
      });

    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch vocabulary',
        },
      }, { status: 500 });
    }
  },
  {
    resourceType: 'vocabulary',
    action: 'read',
    getResourceAttributes: (req) => {
      // Extract vocabulary ID from URL path
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const vocabularyId = pathParts[pathParts.length - 1];
      
      // Look up vocabulary to get namespace
      const vocabulary = mockVocabularies.find(v => v.id === vocabularyId);
      
      return {
        vocabularyId,
        namespaceId: vocabulary?.namespaceId,
      };
    },
    debug: true,
  }
);

/**
 * PUT /api/admin/vocabularies/[id]
 * 
 * Update a specific vocabulary by ID.
 * User must have update access to the vocabulary's namespace.
 * 
 * Path Parameters:
 * - id: Vocabulary UUID
 * 
 * Request Body: Partial vocabulary update data
 * 
 * Authorization: User must have update access to the vocabulary's namespace
 */
export const PUT = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Record<string, string> }) => {
    try {
      const vocabularyId = params.id;

      // Validate UUID format
      if (!z.string().uuid().safeParse(vocabularyId).success) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid vocabulary ID format',
          },
        }, { status: 400 });
      }

      // Parse and validate request body
      const body = await req.json();
      const updateData = UpdateVocabularySchema.parse(body);

      // Find vocabulary
      const vocabularyIndex = mockVocabularies.findIndex(v => v.id === vocabularyId);
      
      if (vocabularyIndex === -1) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vocabulary not found',
          },
        }, { status: 404 });
      }

      const vocabulary = mockVocabularies[vocabularyIndex];

      // Check namespace access
      const hasAccess = await checkNamespaceAccess(req.auth, vocabulary.namespaceId, 'update');
      
      if (!hasAccess) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'You do not have permission to update this vocabulary',
          },
        }, { status: 403 });
      }

      // Update vocabulary
      const updatedVocabulary = {
        ...vocabulary,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: req.auth.userId,
      } as any;

      mockVocabularies[vocabularyIndex] = updatedVocabulary;

      return NextResponse.json({
        success: true,
        data: updatedVocabulary,
        meta: {
          message: `Vocabulary "${updatedVocabulary.name}" updated successfully`,
        },
      });

    } catch (error) {
      console.error('Error updating vocabulary:', error);
      
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
          message: 'Failed to update vocabulary',
        },
      }, { status: 500 });
    }
  },
  {
    resourceType: 'vocabulary',
    action: 'update',
    getResourceAttributes: (req) => {
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const vocabularyId = pathParts[pathParts.length - 1];
      
      const vocabulary = mockVocabularies.find(v => v.id === vocabularyId);
      
      return {
        vocabularyId,
        namespaceId: vocabulary?.namespaceId,
      };
    },
    debug: true,
    errorMessage: 'You do not have permission to update vocabularies in this namespace',
  }
);

/**
 * DELETE /api/admin/vocabularies/[id]
 * 
 * Delete a specific vocabulary by ID.
 * User must have delete access to the vocabulary's namespace.
 * Only editors and above can delete vocabularies.
 * 
 * Path Parameters:
 * - id: Vocabulary UUID
 * 
 * Authorization: User must have delete access to the vocabulary's namespace
 */
export const DELETE = withAuth(
  async (req: AuthenticatedRequest, { params }: { params: Record<string, string> }) => {
    try {
      const vocabularyId = params.id;

      // Validate UUID format
      if (!z.string().uuid().safeParse(vocabularyId).success) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid vocabulary ID format',
          },
        }, { status: 400 });
      }

      // Find vocabulary
      const vocabularyIndex = mockVocabularies.findIndex(v => v.id === vocabularyId);
      
      if (vocabularyIndex === -1) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vocabulary not found',
          },
        }, { status: 404 });
      }

      const vocabulary = mockVocabularies[vocabularyIndex];

      // Check namespace access
      const hasAccess = await checkNamespaceAccess(req.auth, vocabulary.namespaceId, 'delete');
      
      if (!hasAccess) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'You do not have permission to delete this vocabulary',
          },
        }, { status: 403 });
      }

      // Prevent deletion of published vocabularies without special permission
      if (vocabulary.status === 'published' && req.auth.roles.system !== 'superadmin') {
        const isReviewGroupAdmin = req.auth.roles.reviewGroups?.some((rg: any) => 
          rg.role === 'admin'
        );
        
        if (!isReviewGroupAdmin) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'CANNOT_DELETE_PUBLISHED',
              message: 'Published vocabularies can only be deleted by review group administrators',
            },
          }, { status: 403 });
        }
      }

      // Remove vocabulary
      const deletedVocabulary = mockVocabularies.splice(vocabularyIndex, 1)[0];

      return NextResponse.json({
        success: true,
        data: {
          id: deletedVocabulary.id,
          name: deletedVocabulary.name,
          deletedAt: new Date().toISOString(),
        },
        meta: {
          message: `Vocabulary "${deletedVocabulary.name}" deleted successfully`,
        },
      });

    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete vocabulary',
        },
      }, { status: 500 });
    }
  },
  {
    resourceType: 'vocabulary',
    action: 'delete',
    getResourceAttributes: (req) => {
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const vocabularyId = pathParts[pathParts.length - 1];
      
      const vocabulary = mockVocabularies.find(v => v.id === vocabularyId);
      
      return {
        vocabularyId,
        namespaceId: vocabulary?.namespaceId,
      };
    },
    debug: true,
    errorMessage: 'You do not have permission to delete vocabularies in this namespace',
  }
);

/**
 * Helper function to check namespace access for different operations
 */
async function checkNamespaceAccess(
  authContext: any, 
  namespaceId: string, 
  operation: 'read' | 'update' | 'delete' = 'read'
): Promise<boolean> {
  // Superadmins have access to everything
  if (authContext.roles.system === 'superadmin') {
    return true;
  }

  // Check team-based access
  const teamAccess = authContext.roles.teams?.find((team: any) => 
    team.namespaces?.includes(namespaceId)
  );

  if (teamAccess) {
    switch (operation) {
      case 'read':
        return true; // All team members can read
      case 'update':
        return ['editor', 'author'].includes(teamAccess.role);
      case 'delete':
        return teamAccess.role === 'editor'; // Only editors can delete
    }
  }

  // Check translation access (read-only)
  if (operation === 'read') {
    const hasTranslationAccess = authContext.roles.translations?.some((trans: any) =>
      trans.namespaces?.includes(namespaceId)
    );
    if (hasTranslationAccess) return true;
  }

  // Review group admins have full access to their namespaces
  // This would require a database lookup to map namespaces to review groups
  const isReviewGroupAdmin = authContext.roles.reviewGroups?.some((rg: any) => 
    rg.role === 'admin'
  );
  
  if (isReviewGroupAdmin) {
    // In a real implementation, check if the namespace belongs to their review group
    return true;
  }

  return false;
}

/**
 * Example usage in client code:
 * 
 * // Get specific vocabulary
 * const response = await fetch('/api/admin/vocabularies/550e8400-e29b-41d4-a716-446655440001');
 * const { data: vocabulary } = await response.json();
 * 
 * // Update vocabulary
 * const updateResponse = await fetch('/api/admin/vocabularies/550e8400-e29b-41d4-a716-446655440001', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'Updated Vocabulary Name',
 *     description: 'Updated description',
 *     status: 'published',
 *   }),
 * });
 * 
 * // Delete vocabulary
 * const deleteResponse = await fetch('/api/admin/vocabularies/550e8400-e29b-41d4-a716-446655440001', {
 *   method: 'DELETE',
 * });
 * 
 * // Handle authorization errors
 * if (!response.ok) {
 *   const { error } = await response.json();
 *   switch (error.code) {
 *     case 'PERMISSION_DENIED':
 *       console.error('Access denied:', error.message);
 *       break;
 *     case 'NOT_FOUND':
 *       console.error('Vocabulary not found');
 *       break;
 *     case 'CANNOT_DELETE_PUBLISHED':
 *       console.error('Cannot delete published vocabulary');
 *       break;
 *   }
 * }
 */
