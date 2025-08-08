/**
 * Authentication and Authorization Middleware for API Routes
 * 
 * This module provides a reusable middleware wrapper that handles:
 * - Authentication verification via Clerk
 * - Authorization checks using custom RBAC
 * - Request context enrichment with user data
 * - Standardized error responses
 * - Optional debug logging for development
 * 
 * @module middleware/withAuth
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuthContext, canPerformAction, type ResourceType, type Action } from '../authorization';
import { AuthContext } from '../schemas/auth.schema';
import { createRequestContext, completeRequestTiming, createContextLogger } from './requestContext';

/**
 * Configuration options for the withAuth middleware
 */
export interface WithAuthOptions<T extends ResourceType = ResourceType> {
  /**
   * The resource type being accessed (e.g., 'user', 'namespace', 'vocabulary')
   */
  resourceType?: T;
  
  /**
   * The action being performed (e.g., 'read', 'create', 'update', 'delete')
   */
  action?: Action<T>;
  
  /**
   * Function to extract resource attributes from the request
   * Used for fine-grained authorization checks
   */
  getResourceAttributes?: (req: NextRequest) => Record<string, any>;
  
  /**
   * Whether to require authentication (default: true)
   * Set to false for public endpoints that optionally use auth
   */
  requireAuthentication?: boolean;
  
  /**
   * Enable debug logging for authorization failures (default: false in production)
   */
  debug?: boolean;
  
  /**
   * Custom error message for authorization failures
   */
  errorMessage?: string;
  
  /**
   * Whether to include detailed error information in responses
   * (default: true in development, false in production)
   */
  includeDetails?: boolean;
}

/**
 * Extended request type with authentication context
 */
export interface AuthenticatedRequest extends NextRequest {
  auth: AuthContext;
  userId: string;
  sessionClaims: any;
}

/**
 * API route handler type with authentication context
 */
export type AuthenticatedRouteHandler = (
  req: AuthenticatedRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse;

/**
 * Standard error response format
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * Create a standardized error response
 */
function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: any,
  includeDetails = process.env.NODE_ENV === 'development'
): NextResponse {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(includeDetails && details ? { details } : {})
    },
    timestamp: new Date().toISOString(),
  };

  // Add request ID if available (for debugging)
  if (process.env.NODE_ENV === 'development') {
    response.requestId = crypto.randomUUID();
  }

  return NextResponse.json(response, { status });
}

/**
 * Log authorization debug information
 */
function logAuthDebug(
  action: string,
  resourceType: string,
  userId: string,
  allowed: boolean,
  attributes?: Record<string, any>
): void {
  if (process.env.NODE_ENV === 'development' || process.env.AUTH_DEBUG === 'true') {
    console.log('[AUTH DEBUG]', {
      timestamp: new Date().toISOString(),
      userId,
      action,
      resourceType,
      attributes,
      allowed,
      stack: new Error().stack?.split('\n').slice(2, 4).join('\n')
    });
  }
}

/**
 * Higher-order function that wraps API route handlers with authentication and authorization
 * 
 * @param handler - The API route handler function
 * @param options - Configuration options for authentication and authorization
 * @returns Wrapped handler with auth checks
 * 
 * @example
 * // Basic authentication only
 * export const GET = withAuth(async (req, { params }) => {
 *   // User is authenticated, req.auth contains user context
 *   return NextResponse.json({ user: req.auth });
 * });
 * 
 * @example
 * // With authorization check
 * export const POST = withAuth(
 *   async (req, { params }) => {
 *     // User is authenticated and authorized
 *     const data = await req.json();
 *     return NextResponse.json({ success: true });
 *   },
 *   {
 *     resourceType: 'vocabulary',
 *     action: 'create',
 *     getResourceAttributes: (req) => ({
 *       namespaceId: req.nextUrl.searchParams.get('namespace')
 *     })
 *   }
 * );
 * 
 * @example
 * // Public endpoint with optional auth
 * export const GET = withAuth(
 *   async (req, { params }) => {
 *     // req.auth may be null if user is not authenticated
 *     const isAuthenticated = !!req.auth;
 *     return NextResponse.json({ 
 *       public: true,
 *       authenticated: isAuthenticated 
 *     });
 *   },
 *   { requireAuthentication: false }
 * );
 */
export function withAuth<T extends ResourceType = ResourceType>(
  handler: AuthenticatedRouteHandler,
  options: WithAuthOptions<T> = {}
): (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse> {
  const {
    resourceType,
    action,
    getResourceAttributes,
    requireAuthentication = true,
    debug = process.env.NODE_ENV === 'development',
    errorMessage,
    includeDetails = process.env.NODE_ENV === 'development'
  } = options;

  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    // Create request context for tracking
    const requestContext = createRequestContext(req);
    const logger = createContextLogger(requestContext);
    
    try {
      logger.debug('Processing authenticated request', {
        resource: resourceType,
        action,
        path: req.nextUrl.pathname
      });
      
      // Step 1: Check authentication
      const session = await auth();
      const userId = session?.userId;
      const sessionClaims = session?.sessionClaims;
      
      if (!userId && requireAuthentication) {
        return createErrorResponse(
          'UNAUTHENTICATED',
          'Authentication required',
          401,
          { hint: 'Please sign in to access this resource' },
          includeDetails
        );
      }

      // Step 2: Get auth context
      const authContext = await getAuthContext();
      
      if (!authContext && requireAuthentication) {
        return createErrorResponse(
          'AUTH_CONTEXT_ERROR',
          'Failed to retrieve authentication context',
          500,
          { hint: 'There was an error processing your authentication. Please try again.' },
          includeDetails
        );
      }

      // Step 3: Check authorization if resource and action are specified
      if (resourceType && action && authContext) {
        const attributes = getResourceAttributes ? getResourceAttributes(req) : {};
        const allowed = await canPerformAction(resourceType, action, attributes);
        
        if (debug) {
          logAuthDebug(action, resourceType, authContext.userId, allowed, attributes);
        }
        
        if (!allowed) {
          return createErrorResponse(
            'PERMISSION_DENIED',
            errorMessage || `You don't have permission to ${action} ${resourceType}`,
            403,
            {
              resource: resourceType,
              action,
              ...(includeDetails ? { attributes } : {})
            },
            includeDetails
          );
        }
      }

      // Step 4: Enrich request with auth context
      const authenticatedReq = req as AuthenticatedRequest;
      if (authContext) {
        authenticatedReq.auth = authContext;
        authenticatedReq.userId = authContext.userId;
        authenticatedReq.sessionClaims = sessionClaims;
      }

      // Step 5: Call the handler
      const response = await handler(authenticatedReq, context);
      
      // Complete request timing and add headers
      completeRequestTiming(requestContext);
      
      if (response && response instanceof NextResponse) {
        response.headers.set('x-request-id', requestContext.requestId);
        response.headers.set('x-response-time', `${requestContext.timing.duration?.toFixed(2)}ms`);
        
        logger.debug('Request completed successfully', {
          duration: requestContext.timing.duration,
          status: response.status
        });
      }
      
      return response;
      
    } catch (error) {
      // Complete timing even on error
      completeRequestTiming(requestContext);
      
      // Handle unexpected errors
      logger.error('Request failed with error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: requestContext.timing.duration
      });
      
      console.error('[withAuth] Unexpected error:', error);
      
      const errorResponse = createErrorResponse(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        500,
        includeDetails ? { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          requestId: requestContext.requestId
        } : undefined,
        includeDetails
      );
      
      // Add request ID to error response
      errorResponse.headers.set('x-request-id', requestContext.requestId);
      errorResponse.headers.set('x-response-time', `${requestContext.timing.duration?.toFixed(2)}ms`);
      
      return errorResponse;
    }
  };
}

/**
 * Middleware variant for routes that require only authentication (no authorization)
 * 
 * @example
 * export const GET = requireAuthentication(async (req, { params }) => {
 *   return NextResponse.json({ user: req.auth });
 * });
 */
export function requireAuthentication(handler: AuthenticatedRouteHandler) {
  return withAuth(handler, { requireAuthentication: true });
}

/**
 * Middleware variant for public routes with optional authentication
 * 
 * @example
 * export const GET = optionalAuth(async (req, { params }) => {
 *   const isAuthenticated = !!req.auth;
 *   return NextResponse.json({ authenticated: isAuthenticated });
 * });
 */
export function optionalAuth(handler: AuthenticatedRouteHandler) {
  return withAuth(handler, { requireAuthentication: false });
}

/**
 * Create a middleware with preset resource type for consistent API routes
 * 
 * @example
 * const withVocabularyAuth = createResourceAuth('vocabulary');
 * 
 * export const GET = withVocabularyAuth('read', async (req, { params }) => {
 *   // User can read vocabularies
 * });
 * 
 * export const POST = withVocabularyAuth('create', async (req, { params }) => {
 *   // User can create vocabularies
 * });
 */
export function createResourceAuth<T extends ResourceType>(resourceType: T) {
  return function<A extends Action<T>>(
    action: A,
    handler: AuthenticatedRouteHandler,
    options?: Omit<WithAuthOptions<T>, 'resourceType' | 'action'>
  ) {
    return withAuth(handler, {
      ...options,
      resourceType,
      action
    });
  };
}

/**
 * Batch authorization check for multiple resources
 * Useful for endpoints that need to check permissions for multiple items
 * 
 * @example
 * export const GET = withAuth(async (req, { params }) => {
 *   const namespaces = ['isbd', 'unimarc', 'frbr'];
 *   const permissions = await checkBatchPermissions(
 *     'namespace',
 *     'read',
 *     namespaces.map(ns => ({ namespaceId: ns }))
 *   );
 *   
 *   const accessible = namespaces.filter((_, i) => permissions[i]);
 *   return NextResponse.json({ namespaces: accessible });
 * });
 */
export async function checkBatchPermissions<T extends ResourceType>(
  resourceType: T,
  action: Action<T>,
  attributesList: Record<string, any>[]
): Promise<boolean[]> {
  return Promise.all(
    attributesList.map(attributes => 
      canPerformAction(resourceType, action, attributes)
    )
  );
}

/**
 * Express-style middleware chain for complex authorization scenarios
 * 
 * @example
 * export const POST = withAuthChain(
 *   requireAuthentication,
 *   requireRole('admin'),
 *   requireNamespaceAccess(),
 *   async (req, { params }) => {
 *     // User is authenticated, is an admin, and has namespace access
 *   }
 * );
 */
export function withAuthChain(
  ...middlewares: Array<(handler: AuthenticatedRouteHandler) => AuthenticatedRouteHandler>
): (handler: AuthenticatedRouteHandler) => AuthenticatedRouteHandler {
  return (handler: AuthenticatedRouteHandler) => {
    return middlewares.reduceRight(
      (next, middleware) => middleware(next),
      handler
    );
  };
}

/**
 * Role-based middleware for checking specific roles
 * 
 * @example
 * export const DELETE = requireRole('superadmin')(async (req, { params }) => {
 *   // Only superadmins can access this
 * });
 */
export function requireRole(role: 'superadmin' | 'admin') {
  return function(handler: AuthenticatedRouteHandler) {
    return withAuth(async (req, context) => {
      if (req.auth.roles.system !== role) {
        return createErrorResponse(
          'INSUFFICIENT_ROLE',
          `This action requires ${role} privileges`,
          403
        );
      }
      return handler(req, context);
    });
  };
}

/**
 * Namespace access middleware
 * 
 * @example
 * export const PUT = requireNamespaceAccess()(async (req, { params }) => {
 *   // User has access to the namespace in params.namespace
 * });
 */
export function requireNamespaceAccess(paramName = 'namespace') {
  return function(handler: AuthenticatedRouteHandler) {
    return withAuth(
      handler,
      {
        resourceType: 'namespace',
        action: 'read',
        getResourceAttributes: (req) => {
          const url = new URL(req.url);
          const pathParts = url.pathname.split('/');
          const namespaceIndex = pathParts.indexOf(paramName);
          const namespaceId = namespaceIndex >= 0 ? pathParts[namespaceIndex + 1] : undefined;
          return { namespaceId };
        }
      }
    );
  };
}