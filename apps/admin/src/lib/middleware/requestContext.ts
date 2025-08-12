/**
 * Request Context Utilities
 * 
 * This module provides utilities for enriching API route handlers with
 * additional context information such as request IDs, timing, and metadata.
 * 
 * @module middleware/requestContext
 */

import { NextRequest } from 'next/server';
import type { AuthContext } from '../schemas/auth.schema';

/**
 * Request context that gets attached to handlers
 */
export interface RequestContext {
  /**
   * Unique request ID for tracking and debugging
   */
  requestId: string;
  
  /**
   * Timestamp when the request was received
   */
  timestamp: Date;
  
  /**
   * Request method (GET, POST, etc.)
   */
  method: string;
  
  /**
   * Request path
   */
  path: string;
  
  /**
   * Client IP address (if available)
   */
  clientIp?: string;
  
  /**
   * User agent string
   */
  userAgent?: string;
  
  /**
   * Request origin
   */
  origin?: string;
  
  /**
   * Referer header
   */
  referer?: string;
  
  /**
   * Performance timing
   */
  timing: {
    start: number;
    end?: number;
    duration?: number;
  };
  
  /**
   * Request metadata
   */
  metadata: Record<string, any>;
}

/**
 * Enhanced request with context
 */
export interface RequestWithContext extends NextRequest {
  context: RequestContext;
  auth?: AuthContext;
}

/**
 * Create a new request context
 */
export function createRequestContext(req: NextRequest): RequestContext {
  const headers = req.headers;
  
  return {
    requestId: generateRequestId(),
    timestamp: new Date(),
    method: req.method,
    path: req.nextUrl?.pathname || req.url || '/',
    clientIp: getClientIp(req),
    userAgent: headers.get('user-agent') || undefined,
    origin: headers.get('origin') || undefined,
    referer: headers.get('referer') || undefined,
    timing: {
      start: performance.now()
    },
    metadata: {}
  };
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `req_${timestamp}_${random}`;
}

/**
 * Extract client IP from request
 */
function getClientIp(req: NextRequest): string | undefined {
  const headers = req.headers;
  
  // Check various headers that might contain the client IP
  const possibleHeaders = [
    'x-real-ip',
    'x-forwarded-for',
    'x-client-ip',
    'x-cluster-client-ip',
    'cf-connecting-ip',
    'fastly-client-ip',
    'true-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];
  
  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      // Handle comma-separated list (x-forwarded-for)
      const ip = value.split(',')[0].trim();
      if (isValidIp(ip)) {
        return ip;
      }
    }
  }
  
  return undefined;
}

/**
 * Validate IP address format
 */
function isValidIp(ip: string): boolean {
  // Simple IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // Simple IPv6 validation
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  return ipv6Regex.test(ip);
}

/**
 * Add metadata to request context
 */
export function addContextMetadata(
  context: RequestContext,
  key: string,
  value: any
): void {
  context.metadata[key] = value;
}

/**
 * Complete request timing
 */
export function completeRequestTiming(context: RequestContext): void {
  context.timing.end = performance.now();
  context.timing.duration = context.timing.end - context.timing.start;
}

/**
 * Format context for logging
 */
export function formatContextForLogging(context: RequestContext): Record<string, any> {
  return {
    requestId: context.requestId,
    timestamp: context.timestamp.toISOString(),
    method: context.method,
    path: context.path,
    clientIp: context.clientIp,
    userAgent: context.userAgent,
    origin: context.origin,
    duration: context.timing.duration ? `${context.timing.duration.toFixed(2)}ms` : 'pending',
    metadata: context.metadata
  };
}

/**
 * Create a context-aware logger
 */
export function createContextLogger(context: RequestContext) {
  const prefix = `[${context.requestId}]`;
  
  return {
    info: (message: string, data?: any) => {
      console.log(`${prefix} INFO:`, message, data || '');
    },
    warn: (message: string, data?: any) => {
      console.warn(`${prefix} WARN:`, message, data || '');
    },
    error: (message: string, error?: any) => {
      console.error(`${prefix} ERROR:`, message, error || '');
    },
    debug: (_message: string, _data?: any) => {
      // Debug logging disabled for cleaner terminal output
      // Uncomment the following lines to enable debug logging
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`${prefix} DEBUG:`, _message, _data || '');
      // }
    }
  };
}

/**
 * Middleware to add request context
 */
export function withRequestContext<T extends Function>(handler: T): T {
  return (async (req: NextRequest, ...args: any[]) => {
    const context = createRequestContext(req);
    const logger = createContextLogger(context);
    
    // Attach context to request
    (req as any).context = context;
    (req as any).logger = logger;
    
    try {
      // Log request start
      logger.debug('Request started', {
        method: context.method,
        path: context.path,
        clientIp: context.clientIp
      });
      
      // Call the handler
      const result = await (handler as any)(req, ...args);
      
      // Complete timing
      completeRequestTiming(context);
      
      // Log request completion
      logger.debug('Request completed', {
        duration: context.timing.duration,
        status: result?.status || 'unknown'
      });
      
      // Add request ID to response headers if it's a Response object
      if (result && typeof result === 'object' && 'headers' in result) {
        result.headers.set('x-request-id', context.requestId);
        result.headers.set('x-response-time', `${context.timing.duration?.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      // Complete timing
      completeRequestTiming(context);
      
      // Log error
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: context.timing.duration
      });
      
      throw error;
    }
  }) as unknown as T;
}

/**
 * Extract request context from headers (for distributed tracing)
 */
export function extractTraceContext(headers: Headers): {
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
} {
  return {
    traceId: headers.get('x-trace-id') || undefined,
    spanId: headers.get('x-span-id') || undefined,
    parentSpanId: headers.get('x-parent-span-id') || undefined
  };
}

/**
 * Create trace headers for downstream requests
 */
export function createTraceHeaders(context: RequestContext): Record<string, string> {
  return {
    'x-trace-id': context.requestId,
    'x-span-id': generateRequestId(),
    'x-parent-span-id': context.requestId
  };
}