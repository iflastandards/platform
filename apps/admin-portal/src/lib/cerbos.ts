/**
 * Cerbos client for authorization checks in the admin portal
 */

import { HTTP } from '@cerbos/http';

// Cerbos Hub configuration
const CERBOS_HUB_URL = 'https://hub.cerbos.cloud';
const CERBOS_HUB_SECRET = process.env.CERBOS_HUB_SECRET;

if (!CERBOS_HUB_SECRET) {
  throw new Error('CERBOS_HUB_SECRET environment variable is required');
}

// Create Cerbos client instance
export const cerbos = new HTTP(CERBOS_HUB_URL, {
  headers: {
    Authorization: `Bearer ${CERBOS_HUB_SECRET}`,
  },
});

// Type definitions for our domain
export interface Principal {
  id: string;
  roles: string[];
  attributes?: {
    namespaces?: Record<string, string>;
    sites?: Record<string, string>;
    languages?: string[];
    [key: string]: any;
  };
}

export interface Resource {
  kind: string;
  id: string;
  attributes?: {
    namespace?: string;
    siteKey?: string;
    visibility?: string;
    [key: string]: any;
  };
}

export interface CheckRequest {
  principal: Principal;
  resource: Resource;
  actions: string[];
}

/**
 * Check if a principal can perform actions on a resource
 */
export async function checkPermissions(request: CheckRequest): Promise<{
  allowed: boolean;
  results: Record<string, boolean>;
}> {
  try {
    const response = await cerbos.checkResource({
      principal: request.principal,
      resource: request.resource,
      actions: request.actions,
    });

    const results: Record<string, boolean> = {};
    for (const action of request.actions) {
      results[action] = response.isAllowed(action) ?? false;
    }

    const allowed = Object.values(results).some(result => result);

    return { allowed, results };
  } catch (error) {
    console.error('Cerbos permission check failed:', error);
    // Fail closed - deny access on error
    const results: Record<string, boolean> = {};
    for (const action of request.actions) {
      results[action] = false;
    }
    return { allowed: false, results };
  }
}

/**
 * Helper to check namespace permissions
 */
export async function checkNamespacePermission(
  principal: Principal,
  namespace: string,
  actions: string[]
): Promise<boolean> {
  const result = await checkPermissions({
    principal,
    resource: {
      kind: 'namespace',
      id: namespace,
      attributes: {
        namespace,
        visibility: 'public'
      }
    },
    actions
  });

  return result.allowed;
}

/**
 * Helper to check site permissions
 */
export async function checkSitePermission(
  principal: Principal,
  siteKey: string,
  namespace: string,
  actions: string[]
): Promise<boolean> {
  const result = await checkPermissions({
    principal,
    resource: {
      kind: 'site',
      id: siteKey,
      attributes: {
        siteKey,
        namespace,
        visibility: 'public'
      }
    },
    actions
  });

  return result.allowed;
}

/**
 * Helper to check user administration permissions
 */
export async function checkUserAdminPermission(
  principal: Principal,
  scope: 'system' | 'namespace' | 'site',
  targetContext: { namespace?: string; siteKey?: string },
  actions: string[]
): Promise<boolean> {
  const result = await checkPermissions({
    principal,
    resource: {
      kind: 'user_admin',
      id: `${scope}_admin`,
      attributes: {
        scope,
        ...targetContext
      }
    },
    actions
  });

  return result.allowed;
}

/**
 * Helper to check translation permissions
 */
export async function checkTranslationPermission(
  principal: Principal,
  namespace: string,
  siteKey: string,
  sourceLanguage: string,
  targetLanguage: string,
  actions: string[]
): Promise<boolean> {
  const result = await checkPermissions({
    principal,
    resource: {
      kind: 'translation',
      id: `${siteKey}_${targetLanguage}`,
      attributes: {
        namespace,
        siteKey,
        sourceLanguage,
        targetLanguage,
        status: 'draft'
      }
    },
    actions
  });

  return result.allowed;
}

/**
 * Create a principal from a NextAuth session
 */
export function principalFromSession(session: any): Principal {
  if (!session?.user) {
    throw new Error('No valid session provided');
  }

  return {
    id: session.user.email || session.user.id || 'anonymous',
    roles: session.user.roles || ['user'],
    attributes: {
      namespaces: session.user.namespaces || {},
      sites: session.user.sites || {},
      languages: session.user.languages || ['en'],
      github_username: session.user.login || session.user.name,
      email: session.user.email,
    }
  };
}

/**
 * Mock principal for testing (development only)
 */
export function createMockPrincipal(config: {
  role: string;
  namespace?: string;
  site?: string;
  namespaces?: string[];
  sites?: string[];
  languages?: string[];
}): Principal {
  const principal: Principal = {
    id: `test-${config.role}-${Date.now()}`,
    roles: ['user'],
    attributes: {
      namespaces: {},
      sites: {},
      languages: config.languages || ['en']
    }
  };

  // Apply role configuration
  if (config.role.startsWith('system-') || config.role === 'ifla-admin') {
    principal.roles.push(config.role);
  } else if (config.role.startsWith('namespace-')) {
    const roleType = config.role.replace('namespace-', '');
    if (config.namespace) {
      principal.attributes!.namespaces![config.namespace] = roleType;
    }
    if (config.namespaces) {
      config.namespaces.forEach(ns => {
        principal.attributes!.namespaces![ns] = roleType;
      });
    }
  } else if (config.role.startsWith('site-')) {
    const roleType = config.role.replace('site-', '');
    if (config.site) {
      principal.attributes!.sites![config.site] = roleType;
    }
    if (config.sites) {
      config.sites.forEach(s => {
        principal.attributes!.sites![s] = roleType;
      });
    }
  }

  return principal;
}