import { NextRequest, NextResponse } from 'next/server';
import { auth, getAuthContext, getUserAccessibleResources } from '@/lib/authorization';
import { promises as fs } from 'fs';
import path from 'path';

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

    // Fetch namespaces from file system
    const standardsDir = path.join(process.cwd(), 'standards');
    const allNamespaces = [];
    
    try {
      const dirs = await fs.readdir(standardsDir);
      
      for (const dir of dirs) {
        const namespacePath = path.join(standardsDir, dir);
        const stat = await fs.stat(namespacePath);
        
        if (stat.isDirectory()) {
          // Check if namespace.json exists
          const configPath = path.join(namespacePath, 'namespace.json');
          try {
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);
            allNamespaces.push({
              id: dir,
              name: config.name || dir,
              description: config.description || '',
              reviewGroup: config.reviewGroup || '',
              visibility: config.visibility || 'public',
              status: config.status || 'active',
              ...config
            });
          } catch (err) {
            // If no namespace.json, skip this directory
            console.warn(`No namespace.json found for ${dir}`);
          }
        }
      }
    } catch (err) {
      console.error('Error reading namespaces from file system:', err);
      throw new Error('Failed to fetch namespaces from file system');
    }

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