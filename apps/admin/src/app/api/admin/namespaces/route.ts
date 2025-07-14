import { NextRequest, NextResponse } from 'next/server';
import { auth, canPerformAction, getAuthContext, getUserAccessibleResources } from '@/lib/authorization';

/**
 * GET /api/admin/namespaces
 * List namespaces the user has access to
 */
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Get review group filter from query params
    const { searchParams } = new URL(request.url);
    const reviewGroupId = searchParams.get('reviewGroup');

    // Get user's accessible resources
    const accessible = await getUserAccessibleResources();
    if (!accessible) {
      return NextResponse.json({ success: true, data: [] });
    }

    // TODO: Replace with actual database query
    // This is mock data for demonstration
    const allNamespaces = [
      {
        id: 'ns_isbd',
        name: 'ISBD Core',
        reviewGroup: 'rg_isbd',
        projects: ['proj_isbd_2024'],
        elementSets: ['es_isbd_core'],
        vocabularies: ['vocab_content_types'],
        translations: ['en', 'fr', 'es'],
        releases: ['v1.0', 'v1.1'],
        status: 'active',
        visibility: 'public',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'ns_isbdm',
        name: 'ISBD Monographs',
        reviewGroup: 'rg_isbd',
        projects: ['proj_isbd_2024'],
        elementSets: ['es_isbdm_core'],
        vocabularies: ['vocab_monograph_types'],
        translations: ['en', 'fr'],
        releases: ['v1.0'],
        status: 'active',
        visibility: 'public',
        createdAt: '2023-06-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

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
}

/**
 * POST /api/admin/namespaces
 * Create a new namespace
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    // Check authorization
    const canCreate = await auth.canCreateNamespace(reviewGroupId);
    if (!canCreate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: "You don't have permission to create namespaces in this review group",
          },
        },
        { status: 403 }
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
}