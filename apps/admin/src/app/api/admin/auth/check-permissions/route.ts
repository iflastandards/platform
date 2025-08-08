/**
 * API endpoint for batch permission checks
 * 
 * This endpoint allows React components to check multiple permissions
 * in a single request for better performance.
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { canPerformAction, ResourceType, Action } from '@/lib/authorization';

/**
 * POST /api/admin/auth/check-permissions
 * 
 * Check multiple permissions for the current user
 * 
 * Request body:
 * {
 *   checks: Array<{
 *     resourceType: string,
 *     action: string,
 *     attributes?: Record<string, any>
 *   }>
 * }
 * 
 * Response:
 * {
 *   results: boolean[]
 * }
 */
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { checks } = body;

    if (!checks || !Array.isArray(checks)) {
      return NextResponse.json(
        { error: 'Missing or invalid checks array' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      checks.map(async (check) => {
        const { resourceType, action, attributes } = check;
        
        if (!resourceType || !action) {
          return false;
        }

        return canPerformAction(
          resourceType as ResourceType,
          action as Action<ResourceType>,
          attributes
        );
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[check-permissions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
});