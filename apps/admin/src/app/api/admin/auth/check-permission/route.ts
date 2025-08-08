/**
 * API endpoint for client-side permission checks
 * 
 * This endpoint allows React components to check permissions
 * without exposing the full authorization logic to the client.
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { canPerformAction, ResourceType, Action } from '@/lib/authorization';

/**
 * POST /api/admin/auth/check-permission
 * 
 * Check if the current user has permission to perform an action
 * 
 * Request body:
 * {
 *   resourceType: string,
 *   action: string,
 *   attributes?: Record<string, any>
 * }
 * 
 * Response:
 * {
 *   allowed: boolean
 * }
 */
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { resourceType, action, attributes } = body;

    if (!resourceType || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: resourceType and action' },
        { status: 400 }
      );
    }

    const allowed = await canPerformAction(
      resourceType as ResourceType,
      action as Action<ResourceType>,
      attributes
    );

    return NextResponse.json({ allowed });
  } catch (error) {
    console.error('[check-permission] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check permission' },
      { status: 500 }
    );
  }
});