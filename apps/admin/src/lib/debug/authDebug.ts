/**
 * Authorization Debug Utilities
 * 
 * This module provides comprehensive debugging tools for authorization checks,
 * helping developers understand why permissions are granted or denied.
 * 
 * @module debug/authDebug
 */

import type { AuthContext } from '../schemas/auth.schema';
import type { ResourceType, Action } from '../authorization';

/**
 * Debug information for an authorization check
 */
export interface AuthDebugInfo {
  timestamp: string;
  userId: string;
  email: string;
  resource: ResourceType;
  action: string;
  attributes?: Record<string, any>;
  result: 'allowed' | 'denied';
  reason: string;
  roleChecks: RoleCheck[];
  executionTime: number;
  stackTrace?: string;
  requestId?: string;
}

/**
 * Individual role check result
 */
export interface RoleCheck {
  role: string;
  type: 'system' | 'reviewGroup' | 'team' | 'translation';
  checked: boolean;
  matched: boolean;
  details?: string;
}

/**
 * Debug logger configuration
 */
export interface DebugConfig {
  enabled: boolean;
  verbose: boolean;
  includeStackTrace: boolean;
  logToConsole: boolean;
  logToFile: boolean;
  maxLogs: number;
}

/**
 * In-memory debug log storage
 */
class AuthDebugLogger {
  private logs: AuthDebugInfo[] = [];
  private config: DebugConfig;

  constructor(config?: Partial<DebugConfig>) {
    this.config = {
      enabled: process.env.AUTH_DEBUG === 'true' || process.env.NODE_ENV === 'development',
      verbose: process.env.AUTH_DEBUG_VERBOSE === 'true',
      includeStackTrace: process.env.AUTH_DEBUG_STACK === 'true',
      logToConsole: true,
      logToFile: false,
      maxLogs: 1000,
      ...config
    };
  }

  /**
   * Log an authorization check
   */
  log(info: AuthDebugInfo): void {
    if (!this.config.enabled) return;

    // Add to in-memory storage
    this.logs.push(info);
    if (this.logs.length > this.config.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output
    if (this.config.logToConsole) {
      this.logToConsole(info);
    }

    // File output (could be implemented with a logging service)
    if (this.config.logToFile) {
      this.logToFile(info);
    }
  }

  /**
   * Format and log to console
   */
  private logToConsole(info: AuthDebugInfo): void {
    const color = info.result === 'allowed' ? '\x1b[32m' : '\x1b[31m'; // Green or Red
    const reset = '\x1b[0m';
    
    console.log(`${color}[AUTH ${info.result.toUpperCase()}]${reset}`, {
      timestamp: info.timestamp,
      user: `${info.email} (${info.userId})`,
      action: `${info.action} ${info.resource}`,
      reason: info.reason,
      time: `${info.executionTime}ms`,
      ...(this.config.verbose && {
        attributes: info.attributes,
        roleChecks: info.roleChecks,
        requestId: info.requestId
      }),
      ...(this.config.includeStackTrace && info.stackTrace && {
        stack: info.stackTrace
      })
    });
  }

  /**
   * Log to file (placeholder for actual implementation)
   */
  private logToFile(info: AuthDebugInfo): void {
    // In production, this could write to a log file or send to a logging service
    // For now, it's a placeholder
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count = 10): AuthDebugInfo[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string): AuthDebugInfo[] {
    return this.logs.filter(log => log.userId === userId);
  }

  /**
   * Get logs for a specific resource
   */
  getResourceLogs(resource: ResourceType): AuthDebugInfo[] {
    return this.logs.filter(log => log.resource === resource);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const authDebugLogger = new AuthDebugLogger();

/**
 * Create a debug context for an authorization check
 */
export function createDebugContext(
  authContext: AuthContext,
  resource: ResourceType,
  action: Action<ResourceType>,
  attributes?: Record<string, any>
): { startTime: number; requestId: string } {
  return {
    startTime: performance.now(),
    requestId: crypto.randomUUID()
  };
}

/**
 * Log the result of an authorization check with detailed information
 */
export function logAuthorizationResult(
  authContext: AuthContext,
  resource: ResourceType,
  action: Action<ResourceType>,
  result: boolean,
  debugContext: { startTime: number; requestId: string },
  attributes?: Record<string, any>,
  roleChecks?: RoleCheck[]
): void {
  const executionTime = performance.now() - debugContext.startTime;
  
  const info: AuthDebugInfo = {
    timestamp: new Date().toISOString(),
    userId: authContext.userId,
    email: authContext.email,
    resource,
    action: action as string,
    attributes,
    result: result ? 'allowed' : 'denied',
    reason: generateReason(authContext, resource, action, result, roleChecks),
    roleChecks: roleChecks || [],
    executionTime,
    requestId: debugContext.requestId,
    ...(authDebugLogger['config'].includeStackTrace && {
      stackTrace: new Error().stack?.split('\n').slice(3, 8).join('\n')
    })
  };

  authDebugLogger.log(info);
}

/**
 * Generate a human-readable reason for the authorization result
 */
function generateReason(
  authContext: AuthContext,
  resource: ResourceType,
  action: Action<ResourceType>,
  result: boolean,
  roleChecks?: RoleCheck[]
): string {
  if (result) {
    // Find which role granted access
    const matchedRole = roleChecks?.find(check => check.matched);
    if (matchedRole) {
      return `Access granted via ${matchedRole.type} role: ${matchedRole.role}${matchedRole.details ? ` (${matchedRole.details})` : ''}`;
    }
    return 'Access granted based on user permissions';
  } else {
    // Explain why access was denied
    if (!roleChecks || roleChecks.length === 0) {
      return 'No applicable roles found for this resource and action';
    }
    
    const checkedRoles = roleChecks.filter(check => check.checked);
    if (checkedRoles.length === 0) {
      return 'User has no roles that grant access to this resource';
    }
    
    return `Access denied. Checked roles: ${checkedRoles.map(r => r.role).join(', ')}. None granted permission for ${action} on ${resource}.`;
  }
}

/**
 * Debug helper to explain permission requirements
 */
export function explainPermissionRequirements(
  resource: ResourceType,
  action: Action<ResourceType>,
  attributes?: Record<string, any>
): string {
  const requirements: string[] = [];
  
  // System-level requirements
  if (resource === 'user' && (action === 'create' || action === 'delete')) {
    requirements.push('Requires superadmin role');
  }
  
  // Review group requirements
  if (resource === 'namespace' || resource === 'vocabulary') {
    requirements.push('Requires review group admin role or team membership');
    if (attributes?.reviewGroupId) {
      requirements.push(`Must have access to review group: ${attributes.reviewGroupId}`);
    }
  }
  
  // Namespace-specific requirements
  if (attributes?.namespaceId) {
    requirements.push(`Must have access to namespace: ${attributes.namespaceId}`);
    if (action === 'update' || action === 'delete') {
      requirements.push('Requires editor role or higher in the namespace');
    }
  }
  
  // Translation requirements
  if (resource === 'translation') {
    requirements.push('Requires translator role for the specific language');
    if (attributes?.language) {
      requirements.push(`Must have translation rights for language: ${attributes.language}`);
    }
  }
  
  return requirements.length > 0 
    ? `Requirements: ${requirements.join('; ')}`
    : 'No specific requirements identified';
}

/**
 * Create a detailed permission matrix for a user
 */
export function generatePermissionMatrix(authContext: AuthContext): Record<string, Record<string, boolean>> {
  const resources: ResourceType[] = ['user', 'namespace', 'vocabulary', 'translation', 'release'];
  const actions = ['read', 'create', 'update', 'delete'] as const;
  const matrix: Record<string, Record<string, boolean>> = {};
  
  for (const resource of resources) {
    matrix[resource] = {};
    for (const action of actions) {
      // Simplified check - in production this would call the actual permission check
      matrix[resource][action] = checkPermissionSimplified(authContext, resource, action as any);
    }
  }
  
  return matrix;
}

/**
 * Simplified permission check for matrix generation
 */
function checkPermissionSimplified(
  authContext: AuthContext,
  resource: ResourceType,
  action: string
): boolean {
  // Superadmin can do everything
  if (authContext.roles.system === 'superadmin') return true;
  
  // Basic read permissions for authenticated users
  if (action === 'read') return true;
  
  // Review group admins can manage their groups
  if (authContext.roles.reviewGroups.length > 0 && 
      (resource === 'namespace' || resource === 'vocabulary')) {
    return true;
  }
  
  // Team members can edit in their namespaces
  if (authContext.roles.teams.length > 0 && 
      action === 'update' &&
      (resource === 'vocabulary' || resource === 'translation')) {
    return true;
  }
  
  return false;
}

/**
 * Export debug information for troubleshooting
 */
export function exportDebugInfo(authContext: AuthContext): string {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    user: {
      id: authContext.userId,
      email: authContext.email
    },
    roles: authContext.roles,
    permissionMatrix: generatePermissionMatrix(authContext),
    recentLogs: authDebugLogger.getRecentLogs(5),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      AUTH_DEBUG: process.env.AUTH_DEBUG,
      AUTH_DEBUG_VERBOSE: process.env.AUTH_DEBUG_VERBOSE
    }
  };
  
  return JSON.stringify(debugInfo, null, 2);
}

/**
 * Debug API endpoint helper
 */
export function createDebugEndpoint() {
  return {
    getLogs: () => authDebugLogger.getRecentLogs(100),
    getUserLogs: (userId: string) => authDebugLogger.getUserLogs(userId),
    getResourceLogs: (resource: ResourceType) => authDebugLogger.getResourceLogs(resource),
    clearLogs: () => authDebugLogger.clearLogs(),
    exportLogs: () => authDebugLogger.exportLogs(),
    explainRequirements: explainPermissionRequirements,
    getPermissionMatrix: generatePermissionMatrix
  };
}