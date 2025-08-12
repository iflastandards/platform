import { NextResponse } from 'next/server';
import { getUserAccessibleResources } from '@/lib/authorization';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { getAllNamespacesData } from '@/lib/namespace-utils';

/**
 * GET /api/admin/namespaces
 * List namespaces the user has access to
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    // Get review group filter from query params
    const { searchParams } = new URL(req.url);
    const reviewGroupId = searchParams.get('reviewGroup');

    // Get user's accessible resources
    const accessible = await getUserAccessibleResources();
    if (!accessible) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch namespaces with real data
    const allNamespaces = await getAllNamespacesData();

    // Filter namespaces based on user access
    let namespaces = allNamespaces;
    
    if (accessible.namespaces !== 'all') {
      namespaces = namespaces.filter(ns => 
        accessible.namespaces.includes(ns.id) ||
        ns.visibility === 'public' ||
        accessible.reviewGroups.includes(ns.reviewGroup)
      );
    }

    // Apply review group filter if provided
    if (reviewGroupId) {
      namespaces = namespaces.filter(ns => ns.reviewGroup === reviewGroupId);
    }

    return NextResponse.json({
      success: true,
      data: namespaces,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Error fetching namespaces:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch namespaces',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/namespaces
 * Create a new namespace
 */
export const POST = withAuth(
  async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const { name, description, reviewGroupId, visibility = 'public', initialTeams = [] } = body;

      // Validate required fields
      if (!name || !reviewGroupId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Name and reviewGroupId are required',
              details: {
                missing: [!name && 'name', !reviewGroupId && 'reviewGroupId'].filter(Boolean),
              },
            },
          },
          { status: 400 }
        );
      }

      // TODO: Replace with actual database operation
      // This is mock implementation for demonstration
      const newNamespace = {
        id: `ns_${name.toLowerCase().replace(/\s+/g, '_')}`,
        name,
        description,
        reviewGroup: reviewGroupId,
        projects: [],
        elementSets: [],
        vocabularies: [],
        translations: ['en'], // Always include English
        releases: [],
        status: 'active',
        visibility,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // TODO: Assign initial teams to the namespace
      if (initialTeams.length > 0) {
        // Validate teams belong to the review group
        // Assign teams to namespace
      }

      return NextResponse.json({
        success: true,
        data: newNamespace,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error) {
      console.error('Error creating namespace:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to create namespace',
          },
        },
        { status: 500 }
      );
    }
  },
  {
    resourceType: 'namespace',
    action: 'create',
    getResourceAttributes: (_req) => {
      // Parse the body to get reviewGroupId for authorization
      // Note: This is a simplified approach, in production you might want to handle this differently
      return {};
    }
  }
);