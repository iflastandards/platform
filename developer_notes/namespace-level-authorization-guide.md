# Namespace-Level Authorization Guide

**Version:** 1.0  
**Date:** January 2025  
**Status:** Authoritative Implementation Guide  
**Purpose:** Comprehensive guide to namespace-level authorization in the IFLA Standards Platform

## Executive Summary

The IFLA Standards Platform implements **namespace-level authorization** as the fundamental access control mechanism. This means that all content permissions (vocabularies, element sets, etc.) are determined by namespace access, not by individual content item permissions.

## Core Authorization Principle

### The Hierarchy

```
System Level
    ↓
Review Group Level  
    ↓
Namespace Level ← LOWEST AUTHORIZATION LEVEL
    ↓
Content Level (Vocabularies, Element Sets) ← NO SPECIFIC PERMISSIONS
```

### Key Rules

1. **Namespace is the lowest level of authorization**
2. **No vocabulary-specific permissions exist**
3. **No element-set-specific permissions exist**
4. **All content inherits namespace permissions**
5. **Uniform access within namespace**

## What This Means in Practice

### ✅ What Users CAN Do

If a user has `editor` role in the `isbd` namespace:
- ✅ Edit ANY vocabulary in the `isbd` namespace
- ✅ Create new vocabularies in the `isbd` namespace
- ✅ Delete vocabularies in the `isbd` namespace (if role permits)
- ✅ Edit ANY element set in the `isbd` namespace
- ✅ Import/export content from the `isbd` namespace

### ❌ What Users CANNOT Do

- ❌ Have edit access to only specific vocabularies within a namespace
- ❌ Have different permission levels for different vocabularies in the same namespace
- ❌ Be granted vocabulary-specific permissions
- ❌ Have element-set-specific permissions

### Example Scenarios

#### Scenario 1: Namespace Editor
```typescript
// User has editor role in 'isbd' namespace
const user = {
  roles: {
    teams: [{
      namespaces: ['isbd'],
      role: 'editor'
    }]
  }
};

// This user can:
// - Edit ALL vocabularies in 'isbd' namespace
// - Create new vocabularies in 'isbd' namespace  
// - Delete vocabularies in 'isbd' namespace
// - Edit ALL element sets in 'isbd' namespace

// This user CANNOT:
// - Edit vocabularies in 'unimarc' namespace (no access)
// - Have different permissions for different 'isbd' vocabularies
```

#### Scenario 2: Multiple Namespace Access
```typescript
// User has different roles in different namespaces
const user = {
  roles: {
    teams: [
      {
        namespaces: ['isbd'],
        role: 'editor'  // Full edit access to ALL isbd content
      },
      {
        namespaces: ['unimarc'],
        role: 'author'  // Limited access to ALL unimarc content
      }
    ]
  }
};

// In 'isbd' namespace: Can edit ALL vocabularies
// In 'unimarc' namespace: Can create/update ALL vocabularies (but not delete)
```

## API Implementation

### Vocabulary API Routes

All vocabulary API routes check namespace-level permissions:

```typescript
// GET /api/admin/vocabularies/:id
export const GET = withAuth(
  async (req: AuthenticatedRequest, { params }) => {
    const vocabulary = await getVocabulary(params.id);
    
    // Authorization happens at NAMESPACE level, not vocabulary level
    const hasAccess = await checkNamespaceAccess(
      req.auth, 
      vocabulary.namespaceId,  // ← Namespace determines access
      'read'
    );
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json({ vocabulary });
  },
  {
    resourceType: 'vocabulary',
    action: 'read',
    getResourceAttributes: (req) => {
      // Extract namespace from vocabulary for authorization
      const vocabulary = getVocabularyFromRequest(req);
      return {
        namespaceId: vocabulary?.namespaceId  // ← Key: namespace determines access
      };
    }
  }
);
```

### Authorization Middleware

The `withAuth` middleware automatically handles namespace-level authorization:

```typescript
// The middleware checks namespace permissions, not vocabulary permissions
export const PUT = withAuth(
  vocabularyUpdateHandler,
  {
    resourceType: 'vocabulary',  // Resource type for logging
    action: 'update',           // Action being performed
    getResourceAttributes: (req) => ({
      namespaceId: getVocabularyNamespace(req)  // ← Namespace determines access
    })
  }
);
```

## Database Schema Implications

### What We DON'T Store

```typescript
// ❌ NO vocabulary-specific permissions
interface UserRoles {
  vocabularyPermissions?: {  // ← This doesn't exist
    [vocabularyId: string]: {
      permissions: string[];
    }
  };
}
```

### What We DO Store

```typescript
// ✅ Namespace-level permissions only
interface UserRoles {
  teams: Array<{
    teamId: string;
    role: 'editor' | 'author';
    namespaces: string[];  // ← Permissions apply to entire namespace
  }>;
  
  translations: Array<{
    language: string;
    namespaces: string[];  // ← Translation access by namespace
  }>;
}
```

## Frontend Implementation

### Permission Checks

```typescript
// ✅ Correct: Check namespace permission
const canEditVocabulary = usePermission('vocabulary', 'update', {
  namespaceId: vocabulary.namespaceId  // ← Check namespace access
});

// ❌ Incorrect: Check vocabulary-specific permission
const canEditVocabulary = usePermission('vocabulary', 'update', {
  vocabularyId: vocabulary.id  // ← This doesn't work
});
```

### UI Components

```typescript
// Vocabulary editor component
function VocabularyEditor({ vocabulary }) {
  // Check namespace-level permission
  const { allowed } = usePermission('vocabulary', 'update', {
    namespaceId: vocabulary.namespaceId
  });
  
  if (!allowed) {
    return <AccessDenied message="You don't have edit access to this namespace" />;
  }
  
  return <VocabularyForm vocabulary={vocabulary} />;
}
```

## Migration from Vocabulary-Level Permissions

If the system previously had vocabulary-level permissions, here's how to migrate:

### Before (Vocabulary-Level)
```typescript
// Old system with vocabulary-specific permissions
const userPermissions = {
  vocabularies: {
    'vocab-123': ['read', 'update'],
    'vocab-456': ['read'],
    'vocab-789': ['read', 'update', 'delete']
  }
};
```

### After (Namespace-Level)
```typescript
// New system with namespace-level permissions
const userPermissions = {
  namespaces: {
    'isbd': {
      role: 'editor',  // Applies to ALL vocabularies in namespace
      permissions: ['read', 'update', 'delete']
    },
    'unimarc': {
      role: 'author',  // Applies to ALL vocabularies in namespace
      permissions: ['read', 'update']
    }
  }
};
```

### Migration Steps

1. **Group vocabularies by namespace**
2. **Determine highest permission level per namespace**
3. **Assign namespace-level role based on highest permission**
4. **Remove all vocabulary-specific permissions**
5. **Update all authorization checks to use namespace**

## Testing Namespace-Level Authorization

### Unit Tests

```typescript
describe('Namespace-Level Authorization', () => {
  it('should allow access to all vocabularies in accessible namespace', async () => {
    const user = createUser({
      teams: [{ namespaces: ['isbd'], role: 'editor' }]
    });
    
    const vocab1 = createVocabulary({ namespaceId: 'isbd' });
    const vocab2 = createVocabulary({ namespaceId: 'isbd' });
    
    // Both vocabularies should be accessible
    expect(await canPerformAction('vocabulary', 'update', { namespaceId: 'isbd' })).toBe(true);
    expect(await canPerformAction('vocabulary', 'update', { namespaceId: 'isbd' })).toBe(true);
  });
  
  it('should deny access to vocabularies in inaccessible namespace', async () => {
    const user = createUser({
      teams: [{ namespaces: ['isbd'], role: 'editor' }]
    });
    
    // Should not have access to unimarc namespace
    expect(await canPerformAction('vocabulary', 'update', { namespaceId: 'unimarc' })).toBe(false);
  });
  
  it('should not allow vocabulary-specific permissions', async () => {
    // This test ensures vocabulary-specific permissions don't exist
    expect(() => {
      canPerformAction('vocabulary', 'update', { vocabularyId: 'vocab-123' });
    }).toThrow('Vocabulary-specific permissions not supported');
  });
});
```

### Integration Tests

```typescript
describe('Vocabulary API with Namespace Authorization', () => {
  it('should allow editing any vocabulary in accessible namespace', async () => {
    const user = await createTestUser({
      teams: [{ namespaces: ['isbd'], role: 'editor' }]
    });
    
    const vocab1 = await createVocabulary({ namespaceId: 'isbd' });
    const vocab2 = await createVocabulary({ namespaceId: 'isbd' });
    
    // Should be able to edit both vocabularies
    const response1 = await request(app)
      .put(`/api/admin/vocabularies/${vocab1.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: 'Updated Name 1' });
    
    const response2 = await request(app)
      .put(`/api/admin/vocabularies/${vocab2.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ name: 'Updated Name 2' });
    
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });
});
```

## Common Mistakes to Avoid

### ❌ Don't Do This

```typescript
// Don't check vocabulary-specific permissions
if (user.vocabularyPermissions[vocabularyId]?.includes('edit')) {
  // This doesn't exist in namespace-level authorization
}

// Don't store vocabulary-specific roles
const userRoles = {
  vocabularies: {
    'vocab-123': 'editor',  // ❌ Not supported
    'vocab-456': 'viewer'   // ❌ Not supported
  }
};

// Don't create vocabulary-specific API endpoints
app.post('/api/vocabularies/:id/permissions', ...);  // ❌ Not needed
```

### ✅ Do This Instead

```typescript
// Check namespace-level permissions
if (user.namespacePermissions[namespaceId]?.includes('edit')) {
  // User can edit ALL vocabularies in this namespace
}

// Store namespace-level roles
const userRoles = {
  teams: [{
    namespaces: ['isbd', 'unimarc'],
    role: 'editor'  // ✅ Applies to all content in these namespaces
  }]
};

// Use namespace-level API endpoints
app.post('/api/namespaces/:id/permissions', ...);  // ✅ Correct level
```

## Benefits of Namespace-Level Authorization

### 1. Simplified Permission Management
- Fewer permission combinations to manage
- Clear hierarchy and inheritance
- Easier to understand and audit

### 2. Better User Experience
- Consistent access within related content
- No confusion about partial access
- Clearer error messages

### 3. Improved Performance
- Fewer permission checks required
- Better caching opportunities
- Simpler database queries

### 4. Enhanced Security
- Clearer security boundaries
- Easier to audit and review
- Reduced complexity means fewer bugs

## Conclusion

Namespace-level authorization provides a clean, simple, and secure approach to access control in the IFLA Standards Platform. By understanding that namespace is the lowest level of authorization, developers can build consistent and predictable authorization flows throughout the application.

Remember: **If you can access a namespace, you can access ALL content within that namespace according to your role level.**