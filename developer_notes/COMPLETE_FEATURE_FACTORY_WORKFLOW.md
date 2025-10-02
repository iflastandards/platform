# Complete Feature Factory Workflow - Production Ready

## Overview

This is the comprehensive workflow for building production-ready features with all necessary components including error handling, caching, jobs, accessibility, and monitoring.

## Phase 1: Discovery & Requirements

### Core Questions
1. **User Journey & Goals**
2. **Data Model & Relationships**
3. **Operations (CRUD + Custom)**
4. **Access Control (RBAC)**
5. **Integration Points**
6. **Edge Cases & Error Scenarios**
7. **Performance Requirements**
8. **Long-Running Tasks** (need jobs/queues?)

### Deliverables
- Requirements document
- User stories with acceptance criteria
- Performance targets (response times, data volumes)
- Job/queue requirements for async operations

## Phase 2: Comprehensive Planning

### A. Data Architecture

#### 1. Zod Contracts
```typescript
// Main entity contract
export const NamespaceContract = z.object({
  id: z.string().uuid(),
  // ... all fields
});

// Relationship contracts
export const NamespaceVocabularyContract = z.object({
  namespaceId: z.string().uuid(),
  vocabularyId: z.string().uuid(),
  isPrimary: z.boolean(),
});

// Job contracts for async operations
export const NamespaceVerificationJobContract = z.object({
  id: z.string().uuid(),
  namespaceId: z.string().uuid(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  result: z.any().optional(),
  error: z.string().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

// Audit trail contract
export const AuditLogContract = z.object({
  id: z.string().uuid(),
  resourceType: z.string(),
  resourceId: z.string().uuid(),
  action: z.string(),
  userId: z.string().uuid(),
  changes: z.record(z.any()),
  timestamp: z.string().datetime(),
});
```

#### 2. Mock Data Fixtures
```typescript
// packages/contracts/src/fixtures/namespaces.fixtures.ts
export const mockNamespaces: Namespace[] = [
  // Realistic test data covering all scenarios
  createMockNamespace({ status: 'active', isStandard: true }),
  createMockNamespace({ status: 'proposed' }),
  createMockNamespace({ status: 'deprecated' }),
  // Edge cases
  createMockNamespace({ uri: 'http://invalid-url.example' }), // For error testing
];

export const mockNamespaceJobs: NamespaceVerificationJob[] = [
  createMockJob({ status: 'pending' }),
  createMockJob({ status: 'running', progress: 45 }),
  createMockJob({ status: 'completed', progress: 100 }),
  createMockJob({ status: 'failed', error: 'URI not resolvable' }),
];
```

#### 3. Database Schema
```sql
-- supabase/migrations/001_create_namespaces.sql
CREATE TABLE namespaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uri TEXT UNIQUE NOT NULL,
  prefix TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  maintainer TEXT,
  version TEXT,
  status TEXT CHECK (status IN ('proposed', 'active', 'deprecated')),
  is_standard BOOLEAN DEFAULT false,
  documentation_url TEXT,
  last_verified TIMESTAMPTZ,
  proposed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationship table
CREATE TABLE vocabulary_namespaces (
  vocabulary_id UUID REFERENCES vocabularies(id) ON DELETE CASCADE,
  namespace_id UUID REFERENCES namespaces(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (vocabulary_id, namespace_id)
);

-- Jobs table for async operations
CREATE TABLE namespace_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  namespace_id UUID REFERENCES namespaces(id),
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  result JSONB,
  error TEXT,
  created_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_namespaces_status ON namespaces(status);
CREATE INDEX idx_namespaces_prefix ON namespaces(prefix);
CREATE INDEX idx_namespace_jobs_status ON namespace_jobs(status);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- RLS Policies
ALTER TABLE namespaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active namespaces"
  ON namespaces FOR SELECT
  USING (status = 'active' OR auth.jwt() ->> 'role' IN ('editor', 'admin'));

CREATE POLICY "Editors can propose namespaces"
  ON namespaces FOR INSERT
  WITH CHECK (
    status = 'proposed' AND 
    auth.uid() = proposed_by AND
    auth.jwt() ->> 'role' IN ('editor', 'admin')
  );

CREATE POLICY "Admins can update namespaces"
  ON namespaces FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_namespaces_updated_at
  BEFORE UPDATE ON namespaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to update usage count
CREATE OR REPLACE FUNCTION update_namespace_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE namespaces 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.namespace_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE namespaces 
    SET usage_count = usage_count - 1 
    WHERE id = OLD.namespace_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usage_count
  AFTER INSERT OR DELETE ON vocabulary_namespaces
  FOR EACH ROW
  EXECUTE FUNCTION update_namespace_usage_count();
```

### B. Resource Metadata Configuration

```typescript
// apps/admin/src/config/resources/namespaces.ts
import { generateResourceMeta } from '@/packages/contracts/utils';

export const namespaceResourceConfig = {
  name: 'namespaces',
  identifier: 'namespace',
  routes: {
    list: '/namespaces',
    create: '/namespaces/create',
    edit: '/namespaces/edit/:id',
    show: '/namespaces/show/:id',
    // Custom routes
    import: '/namespaces/import',
    verify: '/namespaces/verify/:id',
    approve: '/namespaces/approve/:id',
  },
  meta: {
    ...generateResourceMeta(NamespaceContract, 'namespaces'),
    
    // UI Configuration
    table: {
      defaultSort: [{ field: 'prefix', order: 'asc' }],
      defaultPageSize: 25,
      searchableFields: ['prefix', 'title', 'uri'],
      filterableFields: ['status', 'isStandard'],
      columns: {
        prefix: { width: 100, fixed: 'left' },
        title: { ellipsis: true },
        status: { width: 120, render: 'StatusTag' },
        usageCount: { width: 100, align: 'center' },
        actions: { width: 150, fixed: 'right' }
      }
    },
    
    form: {
      layout: 'vertical',
      sections: [
        {
          title: 'Basic Information',
          fields: ['prefix', 'title', 'description'],
          columns: 1
        },
        {
          title: 'Technical Details',
          fields: ['uri', 'version', 'documentationUrl'],
          columns: 1
        },
        {
          title: 'Classification',
          fields: ['status', 'isStandard', 'maintainer'],
          columns: 2
        }
      ]
    },
    
    // Permissions
    permissions: {
      list: ['viewer', 'editor', 'admin'],
      create: ['editor', 'admin'],
      edit: ['admin'],
      delete: ['admin'],
      approve: ['admin'],
      verify: ['editor', 'admin'],
      import: ['admin']
    },
    
    // Caching configuration
    cache: {
      list: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
      detail: {
        staleTime: 60 * 1000, // 1 minute
        cacheTime: 5 * 60 * 1000, // 5 minutes
      }
    },
    
    // Job configurations
    jobs: {
      verification: {
        queue: 'namespace-verification',
        timeout: 30000, // 30 seconds
        retries: 3
      },
      import: {
        queue: 'namespace-import',
        timeout: 60000, // 1 minute
        retries: 1
      }
    }
  }
};
```

### C. API Design

#### 1. RESTful Endpoints
```typescript
// Standard CRUD
GET    /api/namespaces          // List with filters, pagination, search
GET    /api/namespaces/:id      // Get single namespace
POST   /api/namespaces          // Create new namespace
PUT    /api/namespaces/:id      // Update namespace
DELETE /api/namespaces/:id      // Delete namespace

// Custom endpoints
POST   /api/namespaces/:id/approve      // Approve proposed namespace
POST   /api/namespaces/:id/verify       // Verify URI is resolvable
POST   /api/namespaces/:id/deprecate    // Mark as deprecated
GET    /api/namespaces/:id/vocabularies // Get vocabularies using this namespace
POST   /api/namespaces/import/prefix-cc // Import from prefix.cc
POST   /api/namespaces/import/file      // Import from RDF file
GET    /api/namespaces/export           // Export as RDF/JSON-LD/CSV
GET    /api/namespaces/:id/audit-log    // Get audit trail

// Job endpoints
GET    /api/jobs/:jobId                 // Get job status
GET    /api/jobs/:jobId/progress        // SSE endpoint for live progress
POST   /api/jobs/:jobId/cancel          // Cancel running job
```

#### 2. Supabase Edge Functions for Jobs
```typescript
// supabase/functions/verify-namespace/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const { namespaceId, jobId } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  try {
    // Update job status to running
    await supabase
      .from('namespace_jobs')
      .update({ 
        status: 'running', 
        started_at: new Date().toISOString(),
        progress: 0 
      })
      .eq('id', jobId);
    
    // Get namespace details
    const { data: namespace } = await supabase
      .from('namespaces')
      .select('*')
      .eq('id', namespaceId)
      .single();
    
    // Verify URI (with progress updates)
    await updateProgress(jobId, 25, 'Resolving URI...');
    const isResolvable = await verifyUri(namespace.uri);
    
    await updateProgress(jobId, 50, 'Checking content type...');
    const contentType = await getContentType(namespace.uri);
    
    await updateProgress(jobId, 75, 'Validating RDF content...');
    const isValidRdf = await validateRdfContent(namespace.uri);
    
    // Update namespace with verification results
    await supabase
      .from('namespaces')
      .update({
        last_verified: new Date().toISOString(),
        metadata: {
          ...namespace.metadata,
          verification: {
            isResolvable,
            contentType,
            isValidRdf,
            verifiedAt: new Date().toISOString()
          }
        }
      })
      .eq('id', namespaceId);
    
    // Complete job
    await supabase
      .from('namespace_jobs')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        result: {
          isResolvable,
          contentType,
          isValidRdf
        }
      })
      .eq('id', jobId);
    
  } catch (error) {
    // Handle failure
    await supabase
      .from('namespace_jobs')
      .update({
        status: 'failed',
        error: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

async function updateProgress(jobId: string, progress: number, message: string) {
  // Update job progress in database
  // Emit realtime event for UI updates
  await supabase
    .from('namespace_jobs')
    .update({ progress, status_message: message })
    .eq('id', jobId);
    
  // Broadcast progress via Supabase Realtime
  await supabase.channel(`job:${jobId}`).send({
    type: 'broadcast',
    event: 'progress',
    payload: { progress, message }
  });
}
```

### D. MSW Handlers with Job Simulation

```typescript
// apps/admin/src/mocks/handlers/namespaces.ts
import { http, HttpResponse, delay } from 'msw';
import { mockNamespaces, mockNamespaceJobs } from '@/fixtures';

export const namespaceHandlers = [
  // Standard CRUD handlers
  http.get('/api/namespaces', async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '25');
    
    let filtered = [...mockNamespaces];
    
    // Apply filters
    if (status) {
      filtered = filtered.filter(n => n.status === status);
    }
    if (search) {
      filtered = filtered.filter(n => 
        n.prefix.includes(search) || 
        n.title.includes(search)
      );
    }
    
    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);
    
    return HttpResponse.json({
      data: paginated,
      total: filtered.length,
      page,
      pageSize
    });
  }),
  
  // Job creation and progress simulation
  http.post('/api/namespaces/:id/verify', async ({ params }) => {
    const jobId = crypto.randomUUID();
    
    // Create job
    const job = {
      id: jobId,
      type: 'namespace-verification',
      namespaceId: params.id,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    mockNamespaceJobs.push(job);
    
    // Simulate async job processing
    setTimeout(() => simulateJobProgress(jobId), 100);
    
    return HttpResponse.json({ jobId });
  }),
  
  // Job status endpoint
  http.get('/api/jobs/:jobId', ({ params }) => {
    const job = mockNamespaceJobs.find(j => j.id === params.jobId);
    return HttpResponse.json(job);
  }),
  
  // SSE endpoint for live progress
  http.get('/api/jobs/:jobId/progress', ({ params }) => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const job = mockNamespaceJobs.find(j => j.id === params.jobId);
        
        while (job && job.status === 'running') {
          const data = `data: ${JSON.stringify({
            progress: job.progress,
            status: job.status,
            message: `Processing... ${job.progress}%`
          })}\n\n`;
          
          controller.enqueue(encoder.encode(data));
          await delay(1000);
          
          if (job.progress >= 100) {
            controller.close();
            break;
          }
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  }),
  
  // Import from prefix.cc
  http.post('/api/namespaces/import/prefix-cc', async ({ request }) => {
    const { prefix } = await request.json();
    
    // Simulate fetching from prefix.cc
    await delay(1000);
    
    const imported = {
      id: crypto.randomUUID(),
      uri: `http://example.org/${prefix}/`,
      prefix,
      title: `${prefix.toUpperCase()} Vocabulary`,
      status: 'proposed',
      isStandard: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockNamespaces.push(imported);
    
    return HttpResponse.json({ data: imported });
  })
];

// Simulate job progress updates
function simulateJobProgress(jobId: string) {
  const job = mockNamespaceJobs.find(j => j.id === jobId);
  if (!job) return;
  
  job.status = 'running';
  job.startedAt = new Date().toISOString();
  
  const interval = setInterval(() => {
    job.progress = Math.min(job.progress + 25, 100);
    
    if (job.progress >= 100) {
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.result = {
        isResolvable: true,
        contentType: 'application/rdf+xml',
        isValidRdf: true
      };
      clearInterval(interval);
    }
  }, 1000);
}
```

### E. UI Components with Job Progress

```typescript
// apps/admin/src/components/namespaces/NamespaceVerification.tsx
import { useState, useEffect } from 'react';
import { Button, Progress, notification } from 'antd';
import { useCreate, useSubscription } from '@refinedev/core';

export const NamespaceVerification: FC<{ namespaceId: string }> = ({ namespaceId }) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  
  const { mutate: startVerification } = useCreate({
    resource: 'namespaces/verify',
    successNotification: false, // We'll handle notifications
  });
  
  // Subscribe to job progress via SSE or WebSocket
  useEffect(() => {
    if (!jobId) return;
    
    const eventSource = new EventSource(`/api/jobs/${jobId}/progress`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setStatus(data.status);
      
      if (data.status === 'completed') {
        notification.success({
          message: 'Verification Complete',
          description: 'Namespace URI has been verified successfully'
        });
        eventSource.close();
      } else if (data.status === 'failed') {
        notification.error({
          message: 'Verification Failed',
          description: data.error
        });
        eventSource.close();
      }
    };
    
    return () => eventSource.close();
  }, [jobId]);
  
  const handleVerify = () => {
    startVerification(
      { values: { namespaceId } },
      {
        onSuccess: (data) => {
          setJobId(data.jobId);
          setStatus('running');
        }
      }
    );
  };
  
  return (
    <div>
      {status === 'idle' && (
        <Button onClick={handleVerify} type="primary">
          Verify Namespace
        </Button>
      )}
      
      {status === 'running' && (
        <div>
          <Progress percent={progress} status="active" />
          <p>Verifying namespace URI...</p>
        </div>
      )}
      
      {status === 'completed' && (
        <div>
          <Progress percent={100} status="success" />
          <p>✓ Verification complete</p>
        </div>
      )}
      
      {status === 'failed' && (
        <div>
          <Progress percent={progress} status="exception" />
          <p>✗ Verification failed</p>
          <Button onClick={handleVerify}>Retry</Button>
        </div>
      )}
    </div>
  );
};
```

### F. Error Handling & User Feedback

```typescript
// apps/admin/src/components/ErrorBoundary.tsx
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button, Result } from 'antd';
import * as Sentry from '@sentry/nextjs';

function ErrorFallback({ error, resetErrorBoundary }) {
  // Log to Sentry
  Sentry.captureException(error, {
    tags: {
      component: 'namespace-inventory'
    }
  });
  
  return (
    <Result
      status="error"
      title="Something went wrong"
      subTitle={error.message}
      extra={[
        <Button key="retry" onClick={resetErrorBoundary}>
          Try Again
        </Button>,
        <Button key="home" href="/">
          Go Home
        </Button>
      ]}
    />
  );
}

// Wrap features with error boundary
export const NamespaceInventory = () => {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      <NamespaceList />
    </ReactErrorBoundary>
  );
};
```

### G. Accessibility Implementation

```typescript
// apps/admin/src/components/namespaces/AccessibleNamespaceList.tsx
export const AccessibleNamespaceList = () => {
  const { tableProps } = useTable();
  const { speak } = useAnnounce(); // Screen reader announcements
  
  return (
    <div role="region" aria-label="Namespace Inventory">
      <h1 id="page-title">Namespace Inventory</h1>
      
      {/* Skip to content link */}
      <a href="#main-table" className="sr-only focus:not-sr-only">
        Skip to namespace list
      </a>
      
      {/* Live region for updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {tableProps.loading && "Loading namespaces..."}
        {!tableProps.loading && `${tableProps.dataSource.length} namespaces loaded`}
      </div>
      
      <Table
        {...tableProps}
        id="main-table"
        aria-labelledby="page-title"
        rowKey="id"
        // Keyboard navigation
        onRow={(record) => ({
          tabIndex: 0,
          role: "row",
          "aria-label": `Namespace ${record.prefix}: ${record.title}`,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate(`/namespaces/show/${record.id}`);
            }
          }
        })}
        // Column headers with sort indicators
        columns={[
          {
            title: "Prefix",
            dataIndex: "prefix",
            sorter: true,
            // ARIA labels for sort
            onHeaderCell: () => ({
              "aria-sort": "ascending", // or "descending" or "none"
              role: "columnheader"
            })
          },
          // ... other columns
        ]}
      />
      
      {/* Keyboard shortcuts help */}
      <div className="sr-only">
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Tab: Navigate between elements</li>
          <li>Enter or Space: Open namespace details</li>
          <li>Escape: Close dialogs</li>
        </ul>
      </div>
    </div>
  );
};
```

### H. Performance Optimization

```typescript
// apps/admin/src/hooks/useOptimizedNamespaces.ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export const useOptimizedNamespaces = () => {
  const queryClient = useQueryClient();
  
  // Paginated infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['namespaces'],
    queryFn: ({ pageParam = 1 }) => fetchNamespaces({ page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.page * lastPage.pageSize < lastPage.total) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
  
  // Flatten pages for virtual scrolling
  const allNamespaces = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data]
  );
  
  // Optimistic updates
  const optimisticUpdate = useCallback((namespace: Namespace) => {
    queryClient.setQueryData(['namespaces'], (old: any) => {
      // Update cache optimistically
      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          data: page.data.map(n => 
            n.id === namespace.id ? namespace : n
          )
        }))
      };
    });
  }, [queryClient]);
  
  // Prefetch on hover
  const prefetchNamespace = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['namespaces', id],
      queryFn: () => fetchNamespace(id),
      staleTime: 60 * 1000,
    });
  }, [queryClient]);
  
  return {
    namespaces: allNamespaces,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    optimisticUpdate,
    prefetchNamespace,
  };
};

// Virtual scrolling for large lists
export const VirtualNamespaceList = () => {
  const { namespaces } = useOptimizedNamespaces();
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: namespaces.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 5, // Render 5 items outside viewport
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <NamespaceRow namespace={namespaces[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### I. Monitoring & Analytics

```typescript
// apps/admin/src/utils/analytics.ts
import * as Sentry from '@sentry/nextjs';
import { Analytics } from '@segment/analytics-next';

const analytics = new Analytics({ 
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_KEY 
});

export const trackNamespaceEvent = (event: string, properties?: any) => {
  // Track in Segment
  analytics.track(event, {
    feature: 'namespace-inventory',
    ...properties,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
  });
  
  // Custom metrics
  if (event === 'namespace_verification_started') {
    performance.mark('verification-start');
  } else if (event === 'namespace_verification_completed') {
    performance.mark('verification-end');
    performance.measure('verification-duration', 'verification-start', 'verification-end');
    
    const measure = performance.getEntriesByName('verification-duration')[0];
    analytics.track('performance_metric', {
      metric: 'verification_duration',
      value: measure.duration,
      unit: 'ms'
    });
  }
};

// Error tracking with context
export const trackError = (error: Error, context: any) => {
  Sentry.captureException(error, {
    tags: {
      feature: 'namespace-inventory',
      ...context.tags
    },
    extra: {
      ...context
    }
  });
};

// Performance monitoring
export const measureApiCall = async (name: string, fn: () => Promise<any>) => {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    analytics.track('api_performance', {
      endpoint: name,
      duration,
      success: true
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    analytics.track('api_performance', {
      endpoint: name,
      duration,
      success: false,
      error: error.message
    });
    
    throw error;
  }
};
```

## Complete Technical Task Checklist

### Phase A: Foundation (Tasks 1-6)
1. **Git branch**: Create feature branch
2. **Contracts**: Define all Zod schemas (entity, relationships, jobs, audit)
3. **Mock data fixtures**: Create comprehensive test data
4. **Database migrations**: Create tables, indexes, RLS policies, triggers
5. **Resource metadata**: Generate from contracts with UI/cache/job configs
6. **Tests (RED phase)**: Write comprehensive tests (unit, integration, e2e)

### Phase B: API & Services (Tasks 7-12)
7. **MSW handlers**: Mock all endpoints including jobs/SSE
8. **API routes**: Implement custom endpoints beyond CRUD
9. **Supabase Edge Functions**: Create job processors
10. **Service adapters**: Create Supabase adapters with validation
11. **Import/Export logic**: Implement prefix.cc and file importers
12. **Job management**: Queue setup and progress tracking

### Phase C: UI Generation (Tasks 13-17)
13. **Resource config**: Add to Refine with full metadata
14. **Inferencer scaffolding**: Generate UI from MSW + metadata
15. **Verify scaffold**: Run tests against generated code
16. **UI customization (GREEN)**: Add business logic and custom features
17. **Job progress UI**: Add components for async operations

### Phase D: Production Ready (Tasks 18-24)
18. **Error handling**: Add error boundaries and user feedback
19. **Accessibility**: Implement WCAG 2.1 AA compliance
20. **Performance optimization**: Add caching, virtualization, prefetching
21. **Monitoring & Analytics**: Add tracking and performance metrics
22. **Documentation**: API docs, user guide, ADRs
23. **Refactor**: Clean up and optimize code
24. **Final testing**: All tests green, including load testing

## Deliverables Checklist

- [ ] Zod contracts for all entities
- [ ] Database schema with migrations
- [ ] Mock data covering all scenarios
- [ ] MSW handlers for all endpoints
- [ ] Supabase Edge Functions for jobs
- [ ] Resource metadata configuration
- [ ] Generated UI components
- [ ] Custom UI features
- [ ] Job progress tracking
- [ ] Error handling throughout
- [ ] Accessibility compliance
- [ ] Performance optimizations
- [ ] Monitoring integration
- [ ] Comprehensive test suite
- [ ] Documentation
- [ ] Deployment configuration

This comprehensive workflow ensures we build production-ready features with all necessary components for reliability, performance, and user experience.