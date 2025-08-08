/**
 * Client-side permission checking hook
 * 
 * This hook provides a convenient way to check user permissions in React components.
 * It handles loading states, caching, and provides a simple API for permission checks.
 * 
 * @module hooks/usePermission
 */

import { useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { ResourceType, Action } from '@/lib/authorization';
import React from 'react';

/**
 * Permission check result
 */
interface PermissionResult {
  allowed: boolean;
  loading: boolean;
  error: Error | null;
}

/**
 * Permission check options
 */
interface PermissionCheckOptions {
  /**
   * Whether to skip the check (useful for conditional checks)
   */
  skip?: boolean;
  
  /**
   * Cache duration in milliseconds (default: 5 minutes)
   */
  cacheDuration?: number;
  
  /**
   * Callback when permission check completes
   */
  onComplete?: (allowed: boolean) => void;
  
  /**
   * Callback when permission check fails
   */
  onError?: (error: Error) => void;
}

/**
 * Client-side permission cache
 */
class ClientPermissionCache {
  private cache: Map<string, { result: boolean; timestamp: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  get(key: string, ttl?: number): boolean | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const effectiveTTL = ttl ?? this.defaultTTL;
    if (Date.now() - entry.timestamp > effectiveTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }

  set(key: string, result: boolean): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidateUser(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton cache instance
const permissionCache = new ClientPermissionCache();

/**
 * Hook to check a single permission
 * 
 * @example
 * function MyComponent() {
 *   const { allowed, loading } = usePermission('vocabulary', 'create', {
 *     namespaceId: 'isbd'
 *   });
 *   
 *   if (loading) return <Spinner />;
 *   if (!allowed) return <AccessDenied />;
 *   
 *   return <VocabularyEditor />;
 * }
 */
export function usePermission<T extends ResourceType>(
  resourceType: T,
  action: Action<T>,
  attributes?: Record<string, any>,
  options: PermissionCheckOptions = {}
): PermissionResult {
  const { user, isLoaded } = useUser();
  const [result, setResult] = useState<PermissionResult>({
    allowed: false,
    loading: true,
    error: null
  });

  const cacheKey = useMemo(() => {
    if (!user?.id) return null;
    return JSON.stringify({
      userId: user.id,
      resourceType,
      action,
      attributes: attributes ? Object.keys(attributes).sort().reduce((acc, key) => {
        acc[key] = attributes[key];
        return acc;
      }, {} as Record<string, any>) : undefined
    });
  }, [user?.id, resourceType, action, attributes]);

  useEffect(() => {
    if (options.skip) {
      setResult({ allowed: false, loading: false, error: null });
      return;
    }

    if (!isLoaded) {
      setResult({ allowed: false, loading: true, error: null });
      return;
    }

    if (!user) {
      setResult({ allowed: false, loading: false, error: null });
      return;
    }

    // Check cache first
    if (cacheKey) {
      const cached = permissionCache.get(cacheKey, options.cacheDuration);
      if (cached !== null) {
        setResult({ allowed: cached, loading: false, error: null });
        options.onComplete?.(cached);
        return;
      }
    }

    // Perform permission check
    const checkPermission = async () => {
      try {
        const response = await fetch('/api/admin/auth/check-permission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceType,
            action,
            attributes
          })
        });

        if (!response.ok) {
          throw new Error(`Permission check failed: ${response.statusText}`);
        }

        const data = await response.json();
        const allowed = data.allowed ?? false;

        // Cache the result
        if (cacheKey) {
          permissionCache.set(cacheKey, allowed);
        }

        setResult({ allowed, loading: false, error: null });
        options.onComplete?.(allowed);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Permission check failed');
        setResult({ allowed: false, loading: false, error: err });
        options.onError?.(err);
      }
    };

    checkPermission();
  }, [user, isLoaded, resourceType, action, attributes, cacheKey, options]);

  return result;
}

/**
 * Hook to check multiple permissions at once
 * 
 * @example
 * function MyComponent() {
 *   const permissions = usePermissions([
 *     { resourceType: 'vocabulary', action: 'create' },
 *     { resourceType: 'vocabulary', action: 'delete' },
 *     { resourceType: 'user', action: 'invite' }
 *   ]);
 *   
 *   const canCreate = permissions[0]?.allowed;
 *   const canDelete = permissions[1]?.allowed;
 *   const canInvite = permissions[2]?.allowed;
 * }
 */
export function usePermissions(
  checks: Array<{
    resourceType: ResourceType;
    action: string;
    attributes?: Record<string, any>;
  }>,
  options: PermissionCheckOptions = {}
): PermissionResult[] {
  const { user, isLoaded } = useUser();
  const [results, setResults] = useState<PermissionResult[]>(
    checks.map(() => ({ allowed: false, loading: true, error: null }))
  );

  useEffect(() => {
    if (options.skip) {
      setResults(checks.map(() => ({ allowed: false, loading: false, error: null })));
      return;
    }

    if (!isLoaded) {
      setResults(checks.map(() => ({ allowed: false, loading: true, error: null })));
      return;
    }

    if (!user) {
      setResults(checks.map(() => ({ allowed: false, loading: false, error: null })));
      return;
    }

    const checkPermissions = async () => {
      try {
        const response = await fetch('/api/admin/auth/check-permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checks })
        });

        if (!response.ok) {
          throw new Error(`Permission check failed: ${response.statusText}`);
        }

        const data = await response.json();
        const newResults = data.results.map((allowed: boolean) => ({
          allowed,
          loading: false,
          error: null
        }));

        setResults(newResults);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Permission check failed');
        setResults(checks.map(() => ({ allowed: false, loading: false, error: err })));
      }
    };

    checkPermissions();
  }, [user, isLoaded, checks, options.skip]);

  return results;
}

/**
 * Hook to get user's role and basic permissions
 * 
 * @example
 * function MyComponent() {
 *   const { role, isSuperadmin, isAdmin, canManageUsers } = useRole();
 *   
 *   if (isSuperadmin) {
 *     return <SuperadminDashboard />;
 *   }
 * }
 */
export function useRole() {
  const { user } = useUser();
  
  return useMemo(() => {
    const metadata = user?.publicMetadata as any;
    const systemRole = metadata?.systemRole;
    
    return {
      role: systemRole,
      isSuperadmin: systemRole === 'superadmin',
      isAdmin: systemRole === 'superadmin' || metadata?.reviewGroups?.some((rg: any) => rg.role === 'admin'),
      canManageUsers: systemRole === 'superadmin' || metadata?.reviewGroups?.length > 0,
      reviewGroups: metadata?.reviewGroups || [],
      teams: metadata?.teams || [],
      translations: metadata?.translations || []
    };
  }, [user]);
}

/**
 * Hook to check if user can perform any of the given actions
 * 
 * @example
 * function MyComponent() {
 *   const canEdit = useCanAny('vocabulary', ['create', 'update', 'delete']);
 *   
 *   if (canEdit) {
 *     return <EditButton />;
 *   }
 * }
 */
export function useCanAny<T extends ResourceType>(
  resourceType: T,
  actions: Array<Action<T>>,
  attributes?: Record<string, any>,
  options: PermissionCheckOptions = {}
): boolean {
  const checks = actions.map(action => ({
    resourceType,
    action,
    attributes
  }));
  
  const results = usePermissions(checks, options);
  return results.some(r => r.allowed);
}

/**
 * Hook to check if user can perform all of the given actions
 * 
 * @example
 * function MyComponent() {
 *   const canFullyManage = useCanAll('vocabulary', ['create', 'update', 'delete']);
 *   
 *   if (canFullyManage) {
 *     return <FullManagementPanel />;
 *   }
 * }
 */
export function useCanAll<T extends ResourceType>(
  resourceType: T,
  actions: Array<Action<T>>,
  attributes?: Record<string, any>,
  options: PermissionCheckOptions = {}
): boolean {
  const checks = actions.map(action => ({
    resourceType,
    action,
    attributes
  }));
  
  const results = usePermissions(checks, options);
  return results.every(r => r.allowed);
}

/**
 * Component wrapper that shows/hides content based on permissions
 * 
 * @example
 * <PermissionGate
 *   resourceType="vocabulary"
 *   action="create"
 *   fallback={<AccessDenied />}
 * >
 *   <VocabularyCreator />
 * </PermissionGate>
 */
export function PermissionGate<T extends ResourceType>({
  resourceType,
  action,
  attributes,
  children,
  fallback = null,
  loadingComponent = null
}: {
  resourceType: T;
  action: Action<T>;
  attributes?: Record<string, any>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}) {
  const { allowed, loading } = usePermission(resourceType, action, attributes);
  
  if (loading) return <>{loadingComponent}</>;
  if (!allowed) return <>{fallback}</>;
  
  return <>{children}</>;
}

/**
 * Invalidate the permission cache for the current user
 * Useful after role changes or permission updates
 */
export function invalidatePermissionCache(): void {
  const { user } = useUser();
  if (user?.id) {
    permissionCache.invalidateUser(user.id);
  }
}

/**
 * Clear the entire permission cache
 * Useful for testing or when switching environments
 */
export function clearPermissionCache(): void {
  permissionCache.clear();
}