/**
 * Authorization Cache with TTL Support
 * 
 * This module provides a caching layer for authorization decisions to improve performance.
 * It caches permission checks with configurable time-to-live (TTL) and handles cache
 * invalidation when user roles change.
 * 
 * @module cache/AuthCache
 */

import { AuthContext } from '../schemas/auth.schema';
import { ResourceType } from '../authorization';

/**
 * Cache entry structure
 */
interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

/**
 * Cache key structure for permission checks
 */
interface PermissionCacheKey {
  userId: string;
  resourceType: ResourceType;
  action: string;
  attributes?: Record<string, any>;
}

/**
 * Cache statistics for monitoring
 */
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

/**
 * Configuration options for AuthCache
 */
export interface AuthCacheConfig {
  /**
   * Default TTL in milliseconds (default: 5 minutes)
   */
  defaultTTL?: number;
  
  /**
   * Maximum cache size (default: 1000 entries)
   */
  maxSize?: number;
  
  /**
   * Whether to enable cache statistics (default: true in development)
   */
  enableStats?: boolean;
  
  /**
   * TTL for different resource types (in milliseconds)
   */
  ttlByResource?: Partial<Record<ResourceType, number>>;
  
  /**
   * Whether to use memory cache (default: true)
   * Set to false to disable caching entirely
   */
  enabled?: boolean;
}

/**
 * Singleton AuthCache implementation
 * 
 * Provides in-memory caching for authorization decisions with TTL support
 * and automatic cleanup of expired entries.
 * 
 * @example
 * const cache = AuthCache.getInstance();
 * 
 * // Cache a permission check
 * const cacheKey = cache.createPermissionKey(userId, 'namespace', 'read', { namespaceId: 'isbd' });
 * cache.set(cacheKey, true, 60000); // Cache for 1 minute
 * 
 * // Retrieve from cache
 * const cached = cache.get(cacheKey);
 * if (cached !== null) {
 *   return cached;
 * }
 * 
 * // Clear user's cache on role change
 * cache.invalidateUser(userId);
 */
export class AuthCache {
  private static instance: AuthCache;
  private cache: Map<string, CacheEntry>;
  private config: Required<AuthCacheConfig>;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(config: AuthCacheConfig = {}) {
    this.cache = new Map();
    this.config = {
      defaultTTL: config.defaultTTL ?? 5 * 60 * 1000, // 5 minutes
      maxSize: config.maxSize ?? 1000,
      enableStats: config.enableStats ?? process.env.NODE_ENV === 'development',
      ttlByResource: config.ttlByResource ?? {
        // Longer TTL for stable resources
        reviewGroup: 10 * 60 * 1000, // 10 minutes
        namespace: 10 * 60 * 1000,   // 10 minutes
        // Shorter TTL for frequently changing resources
        vocabulary: 2 * 60 * 1000,   // 2 minutes
        translation: 2 * 60 * 1000,  // 2 minutes
        spreadsheet: 1 * 60 * 1000,  // 1 minute
      },
      enabled: config.enabled ?? true
    };
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0
    };

    // Start cleanup interval
    if (this.config.enabled) {
      this.startCleanupInterval();
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: AuthCacheConfig): AuthCache {
    if (!AuthCache.instance) {
      AuthCache.instance = new AuthCache(config);
    }
    return AuthCache.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (AuthCache.instance) {
      AuthCache.instance.clear();
      AuthCache.instance.stopCleanupInterval();
      AuthCache.instance = null as any;
    }
  }

  /**
   * Create a cache key for permission checks
   */
  public createPermissionKey(
    userId: string,
    resourceType: ResourceType,
    action: string,
    attributes?: Record<string, any>
  ): string {
    const key: PermissionCacheKey = {
      userId,
      resourceType,
      action,
      attributes: attributes ? this.sortObject(attributes) : undefined
    };
    return this.hashKey(key);
  }

  /**
   * Create a cache key for auth context
   */
  public createAuthContextKey(userId: string): string {
    return `auth_context:${userId}`;
  }

  /**
   * Get value from cache
   */
  public get<T = any>(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    
    if (!entry) {
      this.recordMiss();
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.recordMiss();
      return null;
    }

    // Update hit count
    entry.hits++;
    this.recordHit();
    
    return entry.value as T;
  }

  /**
   * Set value in cache with optional TTL
   */
  public set<T = any>(
    key: string,
    value: T,
    ttl?: number,
    resourceType?: ResourceType
  ): void {
    if (!this.config.enabled) return;

    // Determine TTL
    let effectiveTTL = ttl;
    if (!effectiveTTL && resourceType && this.config.ttlByResource[resourceType]) {
      effectiveTTL = this.config.ttlByResource[resourceType];
    }
    effectiveTTL = effectiveTTL ?? this.config.defaultTTL;

    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + effectiveTTL,
      createdAt: Date.now(),
      hits: 0
    };

    this.cache.set(key, entry);
    this.updateStats();
  }

  /**
   * Delete specific key from cache
   */
  public delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.updateStats();
    return result;
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Invalidate all cache entries for a specific user
   */
  public invalidateUser(userId: string): void {
    const keysToDelete: string[] = [];
    
    // Find all keys related to this user
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }

    // Delete found keys
    keysToDelete.forEach(key => this.cache.delete(key));
    this.updateStats();

    if (this.config.enableStats && keysToDelete.length > 0) {
      console.log(`[AuthCache] Invalidated ${keysToDelete.length} entries for user ${userId}`);
    }
  }

  /**
   * Invalidate cache entries for a specific resource
   */
  public invalidateResource(resourceType: ResourceType, resourceId?: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(resourceType) && (!resourceId || key.includes(resourceId))) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    this.updateStats();

    if (this.config.enableStats && keysToDelete.length > 0) {
      console.log(`[AuthCache] Invalidated ${keysToDelete.length} entries for ${resourceType}${resourceId ? `:${resourceId}` : ''}`);
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? this.stats.hits / (this.stats.hits + this.stats.misses)
        : 0
    };
  }

  /**
   * Cache auth context with user-specific TTL
   */
  public cacheAuthContext(userId: string, context: AuthContext, ttl?: number): void {
    const key = this.createAuthContextKey(userId);
    this.set(key, context, ttl ?? 10 * 60 * 1000); // Default 10 minutes for auth context
  }

  /**
   * Get cached auth context
   */
  public getCachedAuthContext(userId: string): AuthContext | null {
    const key = this.createAuthContextKey(userId);
    return this.get<AuthContext>(key);
  }

  /**
   * Cache permission check result
   */
  public cachePermission(
    userId: string,
    resourceType: ResourceType,
    action: string,
    allowed: boolean,
    attributes?: Record<string, any>
  ): void {
    const key = this.createPermissionKey(userId, resourceType, action, attributes);
    this.set(key, allowed, undefined, resourceType);
  }

  /**
   * Get cached permission check result
   */
  public getCachedPermission(
    userId: string,
    resourceType: ResourceType,
    action: string,
    attributes?: Record<string, any>
  ): boolean | null {
    const key = this.createPermissionKey(userId, resourceType, action, attributes);
    return this.get<boolean>(key);
  }

  /**
   * Warm up cache for a user
   * Pre-cache common permissions for better performance
   */
  public async warmupForUser(
    userId: string,
    _commonResources: Array<{ resourceType: ResourceType; actions: string[] }>
  ): Promise<void> {
    // This would typically call the authorization functions
    // and cache the results, but we'll leave it as a placeholder
    // for the actual implementation to avoid circular dependencies
    
    if (this.config.enableStats) {
      console.log(`[AuthCache] Warming up cache for user ${userId}`);
    }
  }

  // Private methods

  private hashKey(obj: any): string {
    // Simple JSON stringification for key generation
    // In production, consider using a proper hash function
    return JSON.stringify(obj);
  }

  private sortObject(obj: Record<string, any>): Record<string, any> {
    // Sort object keys for consistent cache keys
    const sorted: Record<string, any> = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  private evictOldest(): void {
    // Find and remove the oldest entry with least hits
    let oldestKey: string | null = null;
    let oldestEntry: CacheEntry | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldestEntry || 
          entry.createdAt < oldestEntry.createdAt ||
          (entry.createdAt === oldestEntry.createdAt && entry.hits < oldestEntry.hits)) {
        oldestKey = key;
        oldestEntry = entry;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60 * 1000);

    // Don't block Node.js from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.config.enableStats && keysToDelete.length > 0) {
      console.log(`[AuthCache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  private recordHit(): void {
    if (this.config.enableStats) {
      this.stats.hits++;
    }
  }

  private recordMiss(): void {
    if (this.config.enableStats) {
      this.stats.misses++;
    }
  }

  private updateStats(): void {
    if (this.config.enableStats) {
      this.stats.size = this.cache.size;
      this.stats.hitRate = this.stats.hits + this.stats.misses > 0
        ? this.stats.hits / (this.stats.hits + this.stats.misses)
        : 0;
    }
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0
    };
  }

  /**
   * Export cache state for debugging
   */
  public exportState(): Record<string, any> {
    const state: Record<string, any> = {
      config: this.config,
      stats: this.getStats(),
      entries: []
    };

    if (this.config.enableStats) {
      for (const [key, entry] of this.cache.entries()) {
        state.entries.push({
          key,
          expiresAt: new Date(entry.expiresAt).toISOString(),
          createdAt: new Date(entry.createdAt).toISOString(),
          hits: entry.hits,
          ttl: entry.expiresAt - entry.createdAt
        });
      }
    }

    return state;
  }
}

// Export singleton instance getter for convenience
export const getAuthCache = (config?: AuthCacheConfig) => AuthCache.getInstance(config);