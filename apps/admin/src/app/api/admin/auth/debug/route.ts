/**
 * Debug API endpoint for authorization troubleshooting
 * 
 * This endpoint provides detailed information about authorization checks,
 * permission matrices, and recent authorization logs.
 * 
 * Only available in development mode or when AUTH_DEBUG is enabled.
 * Only accessible to superadmins in production.
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { 
  authDebugLogger,
  explainPermissionRequirements,
  generatePermissionMatrix,
  exportDebugInfo
} from '@/lib/debug/authDebug';
import type { ResourceType } from '@/lib/authorization';

/**
 * GET /api/admin/auth/debug
 * Get debug information about authorization
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  // In production, only superadmins can access debug info
  if (process.env.NODE_ENV === 'production' && req.auth.roles.system !== 'superadmin') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Debug endpoint is only available to superadmins in production'
        }
      },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  switch (action) {
    case 'logs':
      // Get recent authorization logs
      const count = parseInt(searchParams.get('count') || '10');
      return NextResponse.json({
        success: true,
        data: authDebugLogger.getRecentLogs(count)
      });
      
    case 'user-logs':
      // Get logs for a specific user
      const userId = searchParams.get('userId');
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_PARAMETER',
              message: 'userId parameter is required'
            }
          },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        data: authDebugLogger.getUserLogs(userId)
      });
      
    case 'resource-logs':
      // Get logs for a specific resource
      const resource = searchParams.get('resource') as ResourceType;
      if (!resource) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_PARAMETER',
              message: 'resource parameter is required'
            }
          },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        data: authDebugLogger.getResourceLogs(resource)
      });
      
    case 'explain':
      // Explain permission requirements
      const explainResource = searchParams.get('resource') as ResourceType;
      const explainAction = searchParams.get('actionType');
      if (!explainResource || !explainAction) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_PARAMETERS',
              message: 'resource and actionType parameters are required'
            }
          },
          { status: 400 }
        );
      }
      
      const attributes: Record<string, any> = {};
      searchParams.forEach((value, key) => {
        if (!['action', 'resource', 'actionType'].includes(key)) {
          attributes[key] = value;
        }
      });
      
      return NextResponse.json({
        success: true,
        data: {
          requirements: explainPermissionRequirements(explainResource, explainAction as any, attributes)
        }
      });
      
    case 'matrix':
      // Get permission matrix for current user
      return NextResponse.json({
        success: true,
        data: {
          userId: req.auth.userId,
          email: req.auth.email,
          matrix: generatePermissionMatrix(req.auth)
        }
      });
      
    case 'export':
      // Export full debug information
      return NextResponse.json({
        success: true,
        data: JSON.parse(exportDebugInfo(req.auth))
      });
      
    case 'clear':
      // Clear debug logs (development only)
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Clear logs is only available in development'
            }
          },
          { status: 403 }
        );
      }
      authDebugLogger.clearLogs();
      return NextResponse.json({
        success: true,
        message: 'Debug logs cleared'
      });
      
    default:
      // Return available actions
      return NextResponse.json({
        success: true,
        data: {
          availableActions: [
            'logs - Get recent authorization logs',
            'user-logs - Get logs for a specific user (requires userId param)',
            'resource-logs - Get logs for a specific resource (requires resource param)',
            'explain - Explain permission requirements (requires resource and actionType params)',
            'matrix - Get permission matrix for current user',
            'export - Export full debug information',
            'clear - Clear debug logs (development only)'
          ],
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            AUTH_DEBUG: process.env.AUTH_DEBUG,
            AUTH_DEBUG_VERBOSE: process.env.AUTH_DEBUG_VERBOSE
          }
        }
      });
  }
});