# Specialized Subagent Specifications

## MCP Context7 Usage Pattern

### CRITICAL: Always Check Current Documentation

**Every agent MUST use Context7 MCP to retrieve current library documentation before generating code.** This prevents using outdated training data and ensures compatibility with the latest versions.

### Standard Context7 Invocation Pattern

```typescript
// BEFORE generating any code, agents should:
async function getLibraryDocs(libraryId: string, topic: string) {
  // Use Context7 MCP to get current documentation
  const docs = await context7.query({
    library: libraryId,
    query: topic,
    includeExamples: true
  });
  
  // Generate code based on CURRENT documentation
  return generateCodeFromDocs(docs);
}

// Example: CRUD Builder checking Refine.dev hooks
const refineDocs = await context7.query({
  library: "/refinedev/refine",
  query: "useTable hook with Ant Design",
  includeExamples: true
});
```

### Why This Matters

- **React 19**: Major changes to concurrent features, suspense, and hooks
- **Next.js 15**: App Router is now stable with different patterns than Pages Router
- **Ant Design 5.x**: Breaking changes in theming and component APIs
- **Refine.dev v4**: Significant updates to data provider and hook patterns
- **Supabase v2**: New client initialization and auth patterns

---

## 1. CRUD Builder Agent

### Identity & Purpose
**Name**: `crud-builder`  
**Role**: Expert in building data management interfaces with Refine.dev and Ant Design  
**Objective**: Generate production-ready CRUD interfaces with minimal customization needed

### Required Documentation Sources

#### Primary: Refine.dev Official Documentation
```typescript
const refineDocumentation = {
  // CRITICAL: Always consult these Refine.dev docs first
  antDesignIntegration: "https://refine.dev/docs/ui-integrations/ant-design/introduction/",
  generalConcepts: "https://refine.dev/docs/guides-concepts/general-concepts/",
  
  // Core sections to reference
  essential: [
    "/docs/ui-integrations/ant-design/introduction/",        // Ant Design setup
    "/docs/ui-integrations/ant-design/components/crud/list/", // List components
    "/docs/ui-integrations/ant-design/components/crud/create/", // Create forms
    "/docs/ui-integrations/ant-design/components/crud/edit/",   // Edit forms
    "/docs/ui-integrations/ant-design/components/crud/show/",   // Show views
  ],
  
  // Advanced features we should use
  advanced: [
    "/docs/guides-concepts/audit-logs/",                    // Audit logging
    "/docs/guides-concepts/realtime/",                      // Real-time updates
    "/docs/guides-concepts/access-control/",                // RBAC integration
    "/docs/guides-concepts/notifications/",                 // Notification system
    "/docs/guides-concepts/import-export/",                 // CSV/Excel import/export
    "/docs/guides-concepts/multitenancy/",                  // Multi-tenant support
    "/docs/data/hooks/use-table/",                         // Advanced table features
    "/docs/data/hooks/use-form/",                          // Advanced form features
    "/docs/data/hooks/use-infinite-list/",                 // Infinite scrolling
  ],
  
  // Best practices and patterns
  patterns: [
    "/docs/guides-concepts/forms/",                         // Form best practices
    "/docs/guides-concepts/tables/",                        // Table patterns
    "/docs/guides-concepts/routing/",                       // Routing with resources
    "/docs/guides-concepts/data-fetching/",                 // Optimized data fetching
  ]
};
```

#### Secondary: Context7 Libraries
```typescript
const crudBuilderLibraries = {
  primary: [
    "/refinedev/refine",        // Refine.dev core and hooks
    "/ant-design/ant-design",   // Ant Design components
    "/react-hook-form/react-hook-form", // Form handling
    "/tanstack/query",          // Data fetching and caching
    "/colinhacks/zod"           // Schema validation
  ],
  secondary: [
    "/supabase/supabase",       // Database client
    "/vercel/next.js",          // Next.js patterns
    "/facebook/react",          // React latest features
    "/microsoft/TypeScript"     // TypeScript patterns
  ]
};
```

### Documentation Consultation Template
```typescript
// CRUD Builder must ALWAYS check Refine.dev docs first
async function generateCRUDInterface(entity: string, fields: Field[], features: Features) {
  // Step 1: Consult Refine.dev documentation FIRST
  const refineGuidance = await consultRefineDocs({
    // Check Ant Design integration specifics
    antDesignDocs: await webfetch({
      url: "https://refine.dev/docs/ui-integrations/ant-design/components/crud/list/",
      format: "markdown"
    }),
    
    // Check if audit logs are needed
    auditLogs: features.audit ? await webfetch({
      url: "https://refine.dev/docs/guides-concepts/audit-logs/",
      format: "markdown"
    }) : null,
    
    // Check realtime requirements
    realtime: features.realtime ? await webfetch({
      url: "https://refine.dev/docs/guides-concepts/realtime/",
      format: "markdown"
    }) : null,
    
    // Check access control patterns
    accessControl: await webfetch({
      url: "https://refine.dev/docs/guides-concepts/access-control/",
      format: "markdown"
    }),
    
    // Check import/export if needed
    importExport: features.importExport ? await webfetch({
      url: "https://refine.dev/docs/guides-concepts/import-export/",
      format: "markdown"
    }) : null
  });
  
  // Step 2: Get current library patterns from Context7
  const libraryPatterns = await Promise.all([
    context7.query({
      library: "/refinedev/refine",
      query: `useTable useForm useList useInfiniteList ${entity}`,
      includeExamples: true
    }),
    context7.query({
      library: "/ant-design/ant-design",
      query: "Table Form Modal Drawer latest v5 API",
      includeExamples: true
    })
  ]);
  
  // Step 3: Generate based on official Refine.dev patterns
  return generateFromOfficialDocs({
    refineGuidance,      // Primary source
    libraryPatterns,     // Current API details
    entity,
    fields,
    features
  });
}
```

### Key Refine.dev Patterns to Follow

```typescript
// ALWAYS use these Refine.dev patterns from their docs

// 1. Resource Definition (from docs)
const resource = {
  name: "vocabularies",
  list: "/vocabularies",
  create: "/vocabularies/create",
  edit: "/vocabularies/edit/:id",
  show: "/vocabularies/show/:id",
  meta: {
    canDelete: true,
    audit: true,         // Enable audit logs
    realtime: true,      // Enable realtime updates
  }
};

// 2. List Component with Ant Design (from Refine docs)
export const VocabularyList = () => {
  const { tableProps, filters, sorters } = useTable({
    resource: "vocabularies",
    pagination: {
      mode: "server",    // As recommended in docs
      pageSize: 20,
    },
    filters: {
      mode: "server",    // Server-side filtering
      permanent: [
        { field: "status", operator: "eq", value: "active" }
      ],
    },
    sorters: {
      mode: "server",    // Server-side sorting
      initial: [
        { field: "createdAt", order: "desc" }
      ],
    },
    // From audit log docs
    meta: {
      audit: {
        action: "list",
        resource: "vocabularies"
      }
    }
  });

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <ExportButton />  {/* From import/export docs */}
          <ImportButton />
        </>
      )}
    >
      <Table {...tableProps} rowKey="id">
        {/* Columns as per Ant Design integration docs */}
      </Table>
    </List>
  );
};

// 3. Form with Validation (from Refine form docs)
export const VocabularyForm = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "vocabularies",
    redirect: "show",
    // From access control docs
    meta: {
      canAccess: {
        action: "create",
        resource: "vocabularies"
      }
    },
    // From notification docs
    successNotification: (data) => ({
      message: "Success",
      description: "Vocabulary created successfully",
      type: "success",
    }),
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        {/* Form fields as per Ant Design docs */}
      </Form>
    </Create>
  );
};

// 4. Realtime Updates (from Refine realtime docs)
const { data } = useList({
  resource: "vocabularies",
  liveMode: "auto",        // Auto-refresh on changes
  onLiveEvent: (event) => {
    // Handle realtime events as per docs
  },
});

// 5. Access Control (from RBAC docs)
const { can } = useCan({
  resource: "vocabularies",
  action: "create",
});
```

### Must-Follow Refine.dev Best Practices

1. **Always use Refine's hooks** - Don't bypass with direct API calls
2. **Follow resource conventions** - Use standard CRUD paths
3. **Implement audit logs** - For compliance and tracking
4. **Add realtime when applicable** - For collaborative features
5. **Use server-side operations** - For pagination, filtering, sorting
6. **Implement proper access control** - Using Refine's patterns
7. **Add import/export** - For data management features
8. **Use notification system** - For user feedback
9. **Follow Ant Design integration patterns** - From Refine's specific docs
10. **Implement error boundaries** - As shown in Refine examples

### Core Competencies

#### Available Feature Capabilities to Suggest
```typescript
const availableFeatures = {
  // Refine.dev Advanced Features
  refine: {
    auditLog: {
      name: "Audit Logging",
      description: "Track all CRUD operations automatically",
      question: "Do you want audit trails for compliance and tracking?",
      implementation: "useAuditLog hook with metadata"
    },
    realtime: {
      name: "Real-time Updates",
      description: "Live updates when data changes",
      question: "Should users see real-time updates when others make changes?",
      implementation: "liveMode: 'auto' with Supabase Realtime"
    },
    importExport: {
      name: "Import/Export",
      description: "CSV/Excel import and export functionality",
      question: "Do users need to import/export data in bulk?",
      implementation: "useImport and useExport hooks"
    },
    accessControl: {
      name: "Role-Based Access Control",
      description: "Fine-grained permissions per action",
      question: "Do different user roles need different permissions?",
      implementation: "accessControlProvider with can method"
    },
    notifications: {
      name: "Smart Notifications",
      description: "Success/error notifications with undo",
      question: "Should actions show notifications with undo capability?",
      implementation: "notificationProvider with Ant Design"
    },
    advancedFilters: {
      name: "Advanced Filtering",
      description: "Saved filters, filter presets, complex queries",
      question: "Do users need saved filters or complex search?",
      implementation: "useTable with filterMode: 'server'"
    },
    bulkActions: {
      name: "Bulk Operations",
      description: "Select multiple items for bulk actions",
      question: "Should users be able to select and act on multiple items?",
      implementation: "useBulkDelete, custom bulk actions"
    },
    offlineSupport: {
      name: "Offline Mode",
      description: "Work offline with sync when connected",
      question: "Do users need to work without internet connection?",
      implementation: "Custom dataProvider with local storage"
    }
  },
  
  // Ant Design Advanced Components
  antDesign: {
    virtualTable: {
      name: "Virtual Scrolling",
      description: "Handle thousands of rows efficiently",
      question: "Will tables have more than 100 rows?",
      implementation: "rc-virtual-list with Table"
    },
    advancedForms: {
      name: "Dynamic Forms",
      description: "Conditional fields, form arrays, wizards",
      question: "Do forms need conditional logic or multiple steps?",
      implementation: "Form.List, Form.Provider, Steps"
    },
    dragAndDrop: {
      name: "Drag and Drop",
      description: "Reorder items, move between lists",
      question: "Should users be able to drag and reorder items?",
      implementation: "react-sortable-hoc with Table/List"
    },
    richTextEditor: {
      name: "Rich Text Editing",
      description: "WYSIWYG editor for content",
      question: "Do text fields need formatting (bold, links, etc)?",
      implementation: "lexical or tiptap integration"
    },
    advancedSearch: {
      name: "Search with Autocomplete",
      description: "Typeahead search with suggestions",
      question: "Should search show suggestions as users type?",
      implementation: "AutoComplete with async data"
    }
  },
  
  // Supabase Advanced Features
  supabase: {
    rowLevelSecurity: {
      name: "Row Level Security",
      description: "Database-level security policies",
      question: "Should data access be restricted at database level?",
      implementation: "RLS policies with auth.uid()"
    },
    edgeFunctions: {
      name: "Edge Functions",
      description: "Serverless functions for complex operations",
      question: "Are there complex operations that need server processing?",
      implementation: "Supabase Edge Functions"
    },
    realtimeSubscriptions: {
      name: "Database Subscriptions",
      description: "Subscribe to database changes",
      question: "Should the app react to database changes instantly?",
      implementation: "Supabase Realtime channels"
    },
    storage: {
      name: "File Storage",
      description: "Upload and manage files/images",
      question: "Do users need to upload files or images?",
      implementation: "Supabase Storage with policies"
    },
    vectorSearch: {
      name: "AI/Vector Search",
      description: "Semantic search with embeddings",
      question: "Do you want AI-powered semantic search?",
      implementation: "pgvector with embeddings"
    }
  },
  
  // Performance Features
  performance: {
    infiniteScroll: {
      name: "Infinite Scrolling",
      description: "Load more data as user scrolls",
      question: "Should lists load more items on scroll?",
      implementation: "useInfiniteList hook"
    },
    optimisticUpdates: {
      name: "Optimistic Updates",
      description: "Instant UI updates before server confirms",
      question: "Should the UI update immediately on user actions?",
      implementation: "mutate with optimisticResponse"
    },
    caching: {
      name: "Smart Caching",
      description: "Cache data to reduce server calls",
      question: "Should frequently accessed data be cached?",
      implementation: "React Query staleTime and cacheTime"
    }
  },
  
  // Integration Features
  integrations: {
    github: {
      name: "GitHub Integration",
      description: "Sync with GitHub repos/issues",
      question: "Do you need GitHub integration?",
      implementation: "Octokit with webhooks"
    },
    webhooks: {
      name: "Webhook Support",
      description: "Send/receive webhooks for events",
      question: "Should the system notify external services?",
      implementation: "Webhook endpoints with verification"
    },
    email: {
      name: "Email Notifications",
      description: "Send emails for important events",
      question: "Should users receive email notifications?",
      implementation: "Resend or SendGrid integration"
    }
  }
};
```

#### Feature Suggestion Protocol
```typescript
// CRUD Builder should proactively ask about features
async function suggestFeatures(entity: string, context: Context) {
  const suggestions = [];
  
  // Analyze entity to suggest relevant features
  if (context.expectedRows > 100) {
    suggestions.push(availableFeatures.antDesign.virtualTable);
    suggestions.push(availableFeatures.performance.infiniteScroll);
  }
  
  if (context.hasStatus || context.hasWorkflow) {
    suggestions.push(availableFeatures.refine.auditLog);
    suggestions.push(availableFeatures.refine.realtime);
    suggestions.push(availableFeatures.refine.notifications);
  }
  
  if (context.multiUser) {
    suggestions.push(availableFeatures.refine.accessControl);
    suggestions.push(availableFeatures.supabase.rowLevelSecurity);
    suggestions.push(availableFeatures.refine.realtime);
  }
  
  if (context.hasFiles || context.hasImages) {
    suggestions.push(availableFeatures.supabase.storage);
    suggestions.push(availableFeatures.antDesign.dragAndDrop);
  }
  
  if (context.hasLongText) {
    suggestions.push(availableFeatures.antDesign.richTextEditor);
  }
  
  if (context.needsBulkOperations) {
    suggestions.push(availableFeatures.refine.bulkActions);
    suggestions.push(availableFeatures.refine.importExport);
  }
  
  // Ask user about each relevant feature
  const questions = suggestions.map(feature => ({
    feature: feature.name,
    question: feature.question,
    implementation: feature.implementation
  }));
  
  return questions;
}
```

#### Technical Expertise
- **Refine.dev Mastery**
  - All hooks: `useTable`, `useForm`, `useList`, `useOne`, `useMany`
  - Inferencer optimization and customization
  - Resource metadata configuration
  - Data provider patterns
  - Access control integration
  - Audit logging, realtime, import/export
  - Advanced filtering and bulk operations

- **Ant Design Patterns**
  - Form validation and layout
  - Table configuration (sorting, filtering, pagination)
  - Complex form fields (cascading selects, dynamic fields)
  - Responsive design patterns
  - Theme customization

- **Supabase Integration**
  - RLS policy generation
  - Optimistic updates
  - Real-time subscriptions
  - Relationship handling
  - Performance optimization

#### Decision Matrix

```typescript
const crudDecisions = {
  // UI Generation Decisions
  useInferencer: (fieldCount: number, complexity: string) => {
    if (fieldCount < 10 && complexity === 'simple') return true;
    if (fieldCount < 20 && complexity === 'moderate') return 'partial';
    return false;
  },

  // Table Optimization
  virtualScrolling: (rowCount: number) => rowCount > 100,
  
  serverSidePagination: (totalRecords: number) => totalRecords > 1000,
  
  // Form Patterns
  formLayout: (fieldCount: number) => {
    if (fieldCount <= 5) return 'vertical';
    if (fieldCount <= 10) return 'horizontal';
    return 'steps'; // Multi-step form
  },
  
  // Caching Strategy
  cacheTime: (updateFrequency: string) => {
    const times = {
      'realtime': 0,
      'frequent': 60 * 1000,      // 1 minute
      'normal': 5 * 60 * 1000,    // 5 minutes
      'rare': 30 * 60 * 1000      // 30 minutes
    };
    return times[updateFrequency] || times.normal;
  }
};
```

#### Output Templates

```typescript
// Resource Configuration Template
const resourceTemplate = {
  name: "${resourceName}",
  list: "/${resourceName}",
  create: "/${resourceName}/create",
  edit: "/${resourceName}/edit/:id",
  show: "/${resourceName}/show/:id",
  meta: {
    label: "${resourceLabel}",
    icon: "${resourceIcon}",
    canDelete: ${canDelete},
    auditLog: ${needsAuditLog},
    fields: generateFieldsFromContract(${contractName}),
    permissions: {
      list: ${listPermissions},
      create: ${createPermissions},
      edit: ${editPermissions},
      delete: ${deletePermissions}
    }
  }
};

// List Component Template
const listTemplate = `
export const ${ResourceName}List: React.FC = () => {
  const { tableProps, filters, sorters } = useTable({
    syncWithLocation: true,
    pagination: {
      pageSize: ${pageSize},
      mode: "${paginationMode}",
    },
    filters: {
      mode: "${filterMode}",
      initial: ${initialFilters}
    },
    sorters: {
      mode: "${sorterMode}",
      initial: ${initialSorters}
    },
    queryOptions: {
      staleTime: ${staleTime},
      cacheTime: ${cacheTime},
      select: (data) => validateWithContract(data, ${ContractName})
    }
  });

  return (
    <List 
      canCreate={${canCreate}}
      title="${resourceTitle}"
    >
      ${virtualScrolling ? '<VirtualTable>' : '<Table>'}
        ${generateColumns(fields)}
      ${virtualScrolling ? '</VirtualTable>' : '</Table>'}
    </List>
  );
};
`;
```

### Subagent Invocation Protocol

```typescript
interface CrudBuilderRequest {
  entity: string;
  contract: ZodSchema;
  operations: ('list' | 'create' | 'edit' | 'show' | 'delete')[];
  features: {
    search?: boolean;
    filters?: string[];
    sorting?: string[];
    bulkActions?: boolean;
    export?: boolean;
    import?: boolean;
    realtime?: boolean;
    audit?: boolean;
  };
  permissions: {
    roleField?: string;
    customLogic?: string;
  };
  performance: {
    expectedRows?: number;
    updateFrequency?: 'realtime' | 'frequent' | 'normal' | 'rare';
  };
}

interface CrudBuilderResponse {
  files: {
    contract: string;
    resource: string;
    components: {
      list?: string;
      create?: string;
      edit?: string;
      show?: string;
    };
    tests: string[];
    migrations: string;
  };
  setup: {
    dependencies: string[];
    envVariables: string[];
    supabaseConfig: string;
  };
  customizations: {
    required: string[];
    optional: string[];
  };
  performance: {
    estimatedLoadTime: number;
    optimizations: string[];
  };
}
```

---

## 2. Job Orchestrator Agent

### Identity & Purpose
**Name**: `job-orchestrator`  
**Role**: Expert in designing and implementing asynchronous job processing systems  
**Objective**: Create robust, scalable job queues with progress monitoring and error recovery

### Required Context7 Libraries
```typescript
const jobOrchestratorLibraries = {
  primary: [
    "/supabase/supabase",       // Edge Functions and Realtime
    "/taskforcesh/bullmq",      // Queue management
    "/sindresorhus/p-queue",    // Promise queue
    "/nodejs/node"              // Worker threads, streams
  ],
  secondary: [
    "/vercel/next.js",          // API routes for job endpoints
    "/tanstack/query",          // Job status polling
    "/ant-design/ant-design"    // Progress components
  ]
};
```

### Context7 Invocation Template
```typescript
// Job Orchestrator must check current patterns for async processing
async function designJobSystem(jobType: string, dataSize: number) {
  // Step 1: Get Supabase Edge Function patterns
  const edgeFunctions = await context7.query({
    library: "/supabase/supabase",
    query: "Edge Functions with job processing and Realtime updates",
    includeExamples: true
  });
  
  // Step 2: Get queue management patterns
  const queuePatterns = await context7.query({
    library: "/taskforcesh/bullmq",
    query: "job queue with progress tracking retry policies",
    includeExamples: true
  });
  
  // Step 3: Get streaming and chunking patterns
  const streamingPatterns = await context7.query({
    library: "/nodejs/node",
    query: "stream processing with backpressure and chunks",
    includeExamples: true
  });
  
  // Generate job architecture using current docs
  return designFromCurrentDocs({
    edgeFunctions,
    queuePatterns,
    streamingPatterns,
    jobType,
    dataSize
  });
}
```

### Core Competencies

#### Technical Expertise
- **Job Queue Patterns**
  - Queue selection (Supabase, BullMQ, AWS SQS)
  - Job scheduling and cron patterns
  - Priority queues
  - Dead letter queues
  - Job dependencies and chains

- **Processing Strategies**
  - Chunking and batching
  - Parallel vs sequential processing
  - Checkpoint/resume patterns
  - Graceful shutdown
  - Resource pooling

- **Progress & Monitoring**
  - Progress calculation strategies
  - SSE vs WebSocket vs polling
  - Real-time updates via Supabase Realtime
  - Progress persistence
  - ETA calculations

#### Decision Matrix

```typescript
const jobDecisions = {
  // Queue Selection
  queueSystem: (requirements: JobRequirements) => {
    if (requirements.volume < 100/day) return 'supabase-functions';
    if (requirements.volume < 10000/day) return 'supabase-queue';
    if (requirements.realtime) return 'bullmq';
    return 'aws-sqs';
  },

  // Chunking Strategy
  chunkSize: (totalItems: number, itemSize: bytes, memoryLimit: bytes) => {
    const maxChunk = Math.floor(memoryLimit / itemSize);
    const idealChunk = Math.ceil(totalItems / 10); // 10 chunks ideal
    return Math.min(maxChunk, idealChunk, 1000); // Cap at 1000
  },

  // Progress Updates
  updateFrequency: (totalDuration: seconds) => {
    if (totalDuration < 10) return 'on-complete';
    if (totalDuration < 60) return 'every-second';
    if (totalDuration < 600) return 'every-10-seconds';
    return 'every-minute';
  },

  // Retry Strategy
  retryPolicy: (jobType: string, criticality: string) => {
    const policies = {
      'critical': { attempts: 5, backoff: 'exponential', maxDelay: 3600 },
      'important': { attempts: 3, backoff: 'linear', maxDelay: 300 },
      'normal': { attempts: 2, backoff: 'fixed', maxDelay: 60 }
    };
    return policies[criticality] || policies.normal;
  },

  // Timeout Configuration
  timeout: (jobType: string, averageDuration: seconds) => {
    const buffer = 2; // 2x buffer
    const maxTimeout = 3600; // 1 hour max
    return Math.min(averageDuration * buffer, maxTimeout);
  }
};
```

#### Job Architecture Templates

```typescript
// Edge Function Job Template
const edgeFunctionTemplate = `
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const { jobId, input } = await req.json();
  const supabase = createClient(/* ... */);
  
  try {
    // Initialize job
    await updateJobStatus(jobId, 'running', 0);
    
    // Process in chunks
    const chunks = chunkData(input, ${chunkSize});
    for (let i = 0; i < chunks.length; i++) {
      await processChunk(chunks[i]);
      await updateProgress(jobId, ((i + 1) / chunks.length) * 100);
    }
    
    // Complete
    await updateJobStatus(jobId, 'completed', 100, result);
  } catch (error) {
    await handleJobError(jobId, error);
  }
});
`;

// Progress Monitor Component Template
const progressMonitorTemplate = `
export const JobProgressMonitor: FC<{ jobId: string }> = ({ jobId }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel(\`job:\${jobId}\`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: \`id=eq.\${jobId}\`
      }, (payload) => {
        setJob(payload.new);
      })
      .on('broadcast', {
        event: 'log'
      }, (payload) => {
        setLogs(prev => [...prev, payload.message]);
      })
      .subscribe();
    
    return () => { channel.unsubscribe(); };
  }, [jobId]);
  
  if (!job) return <Skeleton active />;
  
  return (
    <Card title="Job Progress">
      <Progress 
        percent={job.progress} 
        status={getProgressStatus(job.status)}
        strokeColor={getProgressColor(job.status)}
      />
      <Descriptions column={1}>
        <Descriptions.Item label="Status">{job.status}</Descriptions.Item>
        <Descriptions.Item label="Started">{formatDate(job.startedAt)}</Descriptions.Item>
        <Descriptions.Item label="ETA">{calculateETA(job)}</Descriptions.Item>
      </Descriptions>
      {logs.length > 0 && (
        <div className="job-logs">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      )}
    </Card>
  );
};
`;
```

---

## 3. GitHub Syncer Agent

### Identity & Purpose
**Name**: `github-syncer`  
**Role**: Expert in GitHub API integration and bi-directional synchronization  
**Objective**: Maintain synchronized state between GitHub and internal systems with conflict resolution

### Required Context7 Libraries
```typescript
const githubSyncerLibraries = {
  primary: [
    "/octokit/octokit.js",      // GitHub API client
    "/octokit/webhooks.js",     // Webhook handling
    "/graphql/graphql-js",      // GraphQL queries
    "/octokit/auth-app.js"      // GitHub App authentication
  ],
  secondary: [
    "/supabase/supabase",       // Database sync
    "/vercel/next.js",          // Webhook endpoints
    "/nodejs/node"              // Crypto for signatures
  ]
};
```

### Context7 Invocation Template
```typescript
// GitHub Syncer must check current Octokit patterns
async function setupGitHubIntegration(syncType: string) {
  // Step 1: Get current Octokit API patterns
  const octokitPatterns = await context7.query({
    library: "/octokit/octokit.js",
    query: "Octokit REST API GraphQL pagination rate limiting",
    includeExamples: true
  });
  
  // Step 2: Get webhook security patterns
  const webhookSecurity = await context7.query({
    library: "/octokit/webhooks.js",
    query: "webhook signature verification event handling",
    includeExamples: true
  });
  
  // Step 3: Get GitHub App auth patterns
  const authPatterns = await context7.query({
    library: "/octokit/auth-app.js",
    query: "GitHub App installation authentication JWT",
    includeExamples: true
  });
  
  // Design integration using current GitHub API docs
  return designGitHubSync({
    octokitPatterns,
    webhookSecurity,
    authPatterns,
    syncType
  });
}
```

### Core Competencies

#### Technical Expertise
- **GitHub API Mastery**
  - REST API v3 vs GraphQL v4 selection
  - Pagination strategies (cursor vs offset)
  - Rate limit management
  - Webhook configuration and security
  - GitHub Apps vs OAuth Apps

- **Synchronization Patterns**
  - One-way sync (GitHub → DB)
  - Two-way sync with conflict resolution
  - Event-driven sync via webhooks
  - Scheduled reconciliation
  - Incremental vs full sync

- **Optimization Strategies**
  - Request batching with GraphQL
  - Conditional requests with ETags
  - Aggressive caching strategies
  - Parallel request management

#### Decision Matrix

```typescript
const githubDecisions = {
  // API Selection
  apiVersion: (query: GitHubQuery) => {
    if (query.fields.length > 3) return 'graphql'; // Multiple fields
    if (query.nested) return 'graphql'; // Nested data
    if (query.simple) return 'rest'; // Simple fetch
    return 'graphql'; // Default to GraphQL
  },

  // Sync Strategy
  syncStrategy: (requirements: SyncRequirements) => {
    if (requirements.realtime) return 'webhook';
    if (requirements.frequency < 3600) return 'polling';
    return 'scheduled';
  },

  // Rate Limit Management
  rateLimitStrategy: (remaining: number, reset: timestamp) => {
    if (remaining < 100) return 'pause-until-reset';
    if (remaining < 500) return 'reduce-frequency';
    if (remaining < 1000) return 'use-conditional-requests';
    return 'normal';
  },

  // Cache Strategy
  cacheStrategy: (resourceType: string) => {
    const ttls = {
      'users': 3600,        // 1 hour
      'teams': 1800,        // 30 minutes
      'repos': 600,         // 10 minutes
      'issues': 300,        // 5 minutes
      'commits': 86400      // 24 hours
    };
    return ttls[resourceType] || 600;
  },

  // Conflict Resolution
  conflictResolution: (conflictType: string, policy: string) => {
    const strategies = {
      'github-wins': () => 'overwrite-local',
      'local-wins': () => 'overwrite-github',
      'merge': () => 'create-merge-request',
      'manual': () => 'flag-for-review'
    };
    return strategies[policy] || strategies['manual'];
  }
};
```

#### GitHub Integration Templates

```typescript
// Octokit Service Template
const octokitServiceTemplate = `
export class GitHubService {
  private octokit: Octokit;
  private cache: NodeCache;
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      throttle: {
        onRateLimit: ${rateLimitHandler},
        onSecondaryRateLimit: ${secondaryRateLimitHandler}
      }
    });
    
    this.cache = new NodeCache({ stdTTL: ${cacheTTL} });
    this.rateLimiter = new RateLimiter(${requestsPerHour});
  }
  
  async syncTeams(org: string): Promise<SyncResult> {
    const cacheKey = \`teams:\${org}\`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isStale(cached)) {
      return { source: 'cache', data: cached };
    }
    
    // Check rate limit
    await this.rateLimiter.checkLimit();
    
    // Fetch with GraphQL for efficiency
    const query = \`
      query(\$org: String!) {
        organization(login: \$org) {
          teams(first: 100) {
            nodes {
              id
              name
              slug
              members(first: 100) {
                nodes {
                  login
                  email
                }
              }
            }
          }
        }
      }
    \`;
    
    const result = await this.octokit.graphql(query, { org });
    
    // Update cache
    this.cache.set(cacheKey, result);
    
    // Sync to database
    await this.syncToDatabase(result);
    
    return { source: 'api', data: result };
  }
}
`;

// Webhook Handler Template
const webhookHandlerTemplate = `
export async function handleGitHubWebhook(
  event: string,
  payload: any,
  signature: string
): Promise<void> {
  // Verify signature
  if (!verifyWebhookSignature(payload, signature, secret)) {
    throw new Error('Invalid webhook signature');
  }
  
  // Route by event type
  switch (event) {
    case 'team':
      await handleTeamEvent(payload);
      break;
    case 'repository':
      await handleRepositoryEvent(payload);
      break;
    case 'push':
      await handlePushEvent(payload);
      break;
    default:
      console.log(\`Unhandled event: \${event}\`);
  }
  
  // Log webhook receipt
  await logWebhookEvent(event, payload);
}
`;
```

---

## 4. Test Architect Agent

### Identity & Purpose
**Name**: `test-architect`  
**Role**: Expert in comprehensive test strategy design and implementation  
**Objective**: Create robust test suites that provide confidence while maintaining speed

### Required Context7 Libraries
```typescript
const testArchitectLibraries = {
  primary: [
    "/mswjs/msw",                      // Mock Service Worker
    "/vitest-dev/vitest",              // Test runner
    "/testing-library/react-testing-library", // React testing
    "/microsoft/playwright",           // E2E testing
    "/colinhacks/zod"                 // Contract testing
  ],
  secondary: [
    "/faker-js/faker",                 // Test data generation
    "/vercel/next.js",                 // Next.js testing patterns
    "/facebook/react",                 // React test utils
    "/ant-design/ant-design"           // Component testing
  ]
};
```

### Context7 Invocation Template
```typescript
// Test Architect must check current testing patterns
async function designTestStrategy(feature: string, coverage: number) {
  // Step 1: Get MSW handler patterns
  const mswPatterns = await context7.query({
    library: "/mswjs/msw",
    query: "MSW handlers REST GraphQL interceptors Response mocking",
    includeExamples: true
  });
  
  // Step 2: Get Vitest configuration and patterns
  const vitestPatterns = await context7.query({
    library: "/vitest-dev/vitest",
    query: "Vitest config parallel testing coverage mocking",
    includeExamples: true
  });
  
  // Step 3: Get React Testing Library patterns
  const rtlPatterns = await context7.query({
    library: "/testing-library/react-testing-library",
    query: "render screen userEvent waitFor async testing",
    includeExamples: true
  });
  
  // Step 4: Get E2E patterns
  const e2ePatterns = await context7.query({
    library: "/microsoft/playwright",
    query: "Playwright Page Locator API testing authentication",
    includeExamples: true
  });
  
  // Design test suite using current patterns
  return createTestStrategy({
    mswPatterns,
    vitestPatterns,
    rtlPatterns,
    e2ePatterns,
    feature,
    targetCoverage: coverage
  });
}
```

### Core Competencies

#### Technical Expertise
- **Test Strategy Design**
  - Test pyramid optimization
  - Coverage analysis
  - Performance budgets
  - Risk-based testing
  - Regression prevention

- **Mock Strategy**
  - MSW handler generation
  - Fixture data generation
  - Contract testing
  - Snapshot testing
  - Visual regression testing

- **Test Optimization**
  - Parallel execution
  - Test splitting
  - Selective testing
  - Flaky test detection
  - Test prioritization

#### Decision Matrix

```typescript
const testDecisions = {
  // Test Distribution
  testPyramid: (feature: Feature) => {
    const complexity = calculateComplexity(feature);
    return {
      unit: complexity * 10,        // More units for complex features
      integration: complexity * 5,   // Half as many integration
      e2e: Math.min(complexity, 3)  // Cap E2E tests at 3
    };
  },

  // Mock Strategy
  mockingApproach: (dependencies: string[]) => {
    if (dependencies.includes('external-api')) return 'msw';
    if (dependencies.includes('database')) return 'in-memory';
    if (dependencies.includes('file-system')) return 'virtual-fs';
    return 'jest-mocks';
  },

  // Coverage Targets
  coverageThresholds: (criticality: string) => {
    const thresholds = {
      'critical': { statements: 95, branches: 90, functions: 95, lines: 95 },
      'important': { statements: 85, branches: 80, functions: 85, lines: 85 },
      'normal': { statements: 70, branches: 65, functions: 70, lines: 70 },
      'experimental': { statements: 50, branches: 40, functions: 50, lines: 50 }
    };
    return thresholds[criticality] || thresholds.normal;
  },

  // Test Execution Strategy
  executionStrategy: (testCount: number, duration: seconds) => {
    if (testCount < 50) return 'sequential';
    if (duration < 30) return 'parallel-all';
    if (testCount < 200) return 'parallel-by-file';
    return 'sharded';
  },

  // Flaky Test Handling
  flakyTestStrategy: (failureRate: number) => {
    if (failureRate > 0.1) return 'quarantine';
    if (failureRate > 0.05) return 'retry-3x';
    if (failureRate > 0.01) return 'retry-1x';
    return 'no-retry';
  }
};
```

#### Test Generation Templates

```typescript
// MSW Handler Template
const mswHandlerTemplate = `
import { http, HttpResponse } from 'msw';
import { ${ContractName} } from '@ifla/contracts';
import { generateMockData } from '../fixtures';

export const ${resourceName}Handlers = [
  // List handler with pagination
  http.get('/api/${resourceName}', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const data = generateMockData(${ContractName}, pageSize * 3);
    const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
    
    return HttpResponse.json({
      data: paginatedData,
      total: data.length,
      page,
      pageSize
    });
  }),

  // Get single item
  http.get('/api/${resourceName}/:id', ({ params }) => {
    const data = generateMockData(${ContractName}, 1)[0];
    return HttpResponse.json({ ...data, id: params.id });
  }),

  // Create with validation
  http.post('/api/${resourceName}', async ({ request }) => {
    const body = await request.json();
    const result = ${ContractName}.safeParse(body);
    
    if (!result.success) {
      return HttpResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({ 
      ...result.data, 
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    });
  }),

  // Update with optimistic locking
  http.patch('/api/${resourceName}/:id', async ({ params, request }) => {
    const body = await request.json();
    const result = ${ContractName}.partial().safeParse(body);
    
    if (!result.success) {
      return HttpResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      ...result.data,
      id: params.id,
      updatedAt: new Date().toISOString()
    });
  }),

  // Delete with soft delete
  http.delete('/api/${resourceName}/:id', ({ params }) => {
    return HttpResponse.json({ 
      success: true,
      deletedId: params.id 
    });
  })
];
`;

// Component Test Template
const componentTestTemplate = `
import { render, screen, waitFor, userEvent } from '@testing-library/react';
import { ${ComponentName} } from './${ComponentName}';
import { TestWrapper } from '@/test/utils';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

describe('${ComponentName}', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    // Reset any runtime handlers
    server.resetHandlers();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render data after loading', async () => {
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      expect(screen.getAllByRole('row')).toHaveLength(11); // Header + 10 rows
    });

    it('should handle empty state', async () => {
      server.use(
        http.get('/api/${resourceName}', () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );
      
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('No data available')).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('should handle pagination', async () => {
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Page 2')).toBeInTheDocument();
      });
    });

    it('should handle sorting', async () => {
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      await user.click(nameHeader);
      
      await waitFor(() => {
        const firstRow = screen.getAllByRole('row')[1];
        expect(firstRow).toHaveTextContent(/^A/); // Sorted alphabetically
      });
    });

    it('should handle filtering', async () => {
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'test');
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeLessThan(11); // Filtered results
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      server.use(
        http.get('/api/${resourceName}', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );
      
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      });
    });

    it('should allow retry on error', async () => {
      let callCount = 0;
      server.use(
        http.get('/api/${resourceName}', () => {
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json(
              { error: 'Network Error' },
              { status: 500 }
            );
          }
          return HttpResponse.json({ 
            data: generateMockData(${ContractName}, 10),
            total: 10 
          });
        })
      );
      
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      });
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('table')).toHaveAttribute('aria-label');
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination');
    });

    it('should be keyboard navigable', async () => {
      render(
        <TestWrapper>
          <${ComponentName} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      
      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'button');
      
      // Use keyboard to interact
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});
`;

// E2E Test Template
const e2eTestTemplate = `
import { test, expect } from '@playwright/test';
import { mockAPI } from '../utils/mock-api';
import { login } from '../utils/auth';

test.describe('${FeatureName} E2E Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setup authentication
    await login(page, 'editor@test.com');
    
    // Setup API mocks if needed
    await mockAPI(context, {
      '${resourceName}': generateMockData(${ContractName}, 20)
    });
  });

  test('should complete full CRUD workflow', async ({ page }) => {
    // Navigate to list page
    await page.goto('/${resourceName}');
    
    // Verify list loads
    await expect(page.getByRole('table')).toBeVisible();
    const rowCount = await page.getByRole('row').count();
    expect(rowCount).toBeGreaterThan(1);
    
    // Create new item
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByRole('heading', { name: /create ${resourceName}/i })).toBeVisible();
    
    // Fill form
    await page.getByLabel('Name').fill('Test Item');
    await page.getByLabel('Description').fill('Test Description');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify creation
    await expect(page.getByText('Successfully created')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Test Item' })).toBeVisible();
    
    // Edit item
    await page.getByRole('button', { name: /edit/i }).first().click();
    await page.getByLabel('Name').clear();
    await page.getByLabel('Name').fill('Updated Item');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify update
    await expect(page.getByText('Successfully updated')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Updated Item' })).toBeVisible();
    
    // Delete item
    await page.getByRole('button', { name: /delete/i }).first().click();
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Verify deletion
    await expect(page.getByText('Successfully deleted')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Updated Item' })).not.toBeVisible();
  });

  test('should handle pagination correctly', async ({ page }) => {
    await page.goto('/${resourceName}');
    
    // Wait for table to load
    await expect(page.getByRole('table')).toBeVisible();
    
    // Check initial page
    await expect(page.getByText('Page 1')).toBeVisible();
    
    // Navigate to next page
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText('Page 2')).toBeVisible();
    
    // Navigate back
    await page.getByRole('button', { name: /previous/i }).click();
    await expect(page.getByText('Page 1')).toBeVisible();
  });

  test('should persist filters in URL', async ({ page }) => {
    await page.goto('/${resourceName}');
    
    // Apply filter
    await page.getByPlaceholderText('Search...').fill('test');
    await page.keyboard.press('Enter');
    
    // Check URL updated
    await expect(page).toHaveURL(/\?.*search=test/);
    
    // Reload page
    await page.reload();
    
    // Filter should persist
    await expect(page.getByPlaceholderText('Search...')).toHaveValue('test');
  });

  test('should handle errors gracefully', async ({ page, context }) => {
    // Mock API error
    await context.route('/api/${resourceName}', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' })
      });
    });
    
    await page.goto('/${resourceName}');
    
    // Should show error message
    await expect(page.getByText(/error loading data/i)).toBeVisible();
    
    // Should show retry button
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/${resourceName}');
    
    // Run accessibility scan
    const accessibilityScanResults = await page.accessibility.snapshot();
    expect(accessibilityScanResults).toBeTruthy();
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Check screen reader landmarks
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
```

---

## 5. Performance Optimizer Agent

### Identity & Purpose
**Name**: `perf-optimizer`  
**Role**: Expert in application performance optimization  
**Objective**: Identify and resolve performance bottlenecks while maintaining code quality

### Required Context7 Libraries
```typescript
const perfOptimizerLibraries = {
  primary: [
    "/facebook/react",              // React 19 optimization features
    "/tanstack/virtual",            // Virtualization
    "/tanstack/query",              // Query caching
    "/vitejs/vite",                 // Build optimization
    "/GoogleChrome/web-vitals"      // Performance metrics
  ],
  secondary: [
    "/vercel/next.js",              // Next.js optimization
    "/ant-design/ant-design",       // Component performance
    "/supabase/supabase",           // Query optimization
    "/webpack/webpack"              // Bundle analysis
  ]
};
```

### Context7 Invocation Template
```typescript
// Performance Optimizer must check current optimization techniques
async function optimizePerformance(component: string, metrics: Metrics) {
  // Step 1: Get React 19 optimization patterns
  const reactOptimizations = await context7.query({
    library: "/facebook/react",
    query: "React.memo useMemo useCallback Suspense lazy React 19",
    includeExamples: true
  });
  
  // Step 2: Get virtualization patterns
  const virtualization = await context7.query({
    library: "/tanstack/virtual",
    query: "useVirtualizer dynamic sizing infinite scroll",
    includeExamples: true
  });
  
  // Step 3: Get caching strategies
  const caching = await context7.query({
    library: "/tanstack/query",
    query: "staleTime cacheTime prefetch infinite queries",
    includeExamples: true
  });
  
  // Step 4: Get build optimization
  const buildOptimization = await context7.query({
    library: "/vitejs/vite",
    query: "code splitting dynamic imports tree shaking",
    includeExamples: true
  });
  
  // Apply optimizations using current best practices
  return applyOptimizations({
    reactOptimizations,
    virtualization,
    caching,
    buildOptimization,
    component,
    currentMetrics: metrics
  });
}
```

### Core Competencies

#### Technical Expertise
- **React Optimization**
  - Component rendering analysis
  - Memo strategies
  - Code splitting
  - Lazy loading
  - Virtual DOM optimization

- **Database Optimization**
  - Query analysis
  - Index strategies
  - Connection pooling
  - Caching layers
  - Query batching

- **Bundle Optimization**
  - Tree shaking
  - Dynamic imports
  - Chunk splitting
  - Asset optimization
  - CDN strategies

#### Decision Matrix

```typescript
const perfDecisions = {
  // React Optimization
  memoization: (component: Component) => {
    const renderCost = measureRenderCost(component);
    if (renderCost > 16) return 'React.memo';
    if (renderCost > 8) return 'useMemo-critical';
    return 'no-memo';
  },

  // Data Fetching
  fetchStrategy: (dataSize: KB, frequency: number) => {
    if (dataSize < 10 && frequency > 100) return 'cache-first';
    if (dataSize > 100) return 'paginate';
    if (frequency < 10) return 'fetch-on-demand';
    return 'prefetch';
  },

  // Virtualization
  virtualization: (itemCount: number, itemHeight: pixels) => {
    const viewportItems = window.innerHeight / itemHeight;
    if (itemCount > viewportItems * 3) return 'required';
    if (itemCount > viewportItems * 2) return 'recommended';
    return 'not-needed';
  },

  // Bundle Strategy
  bundleStrategy: (dependencies: Dependency[]) => {
    const strategies = [];
    if (dependencies.some(d => d.size > 100)) strategies.push('code-split');
    if (dependencies.some(d => d.usage < 0.3)) strategies.push('lazy-load');
    if (dependencies.length > 50) strategies.push('vendor-chunk');
    return strategies;
  }
};
```

#### Performance Optimization Templates

```typescript
// React Component Optimization Template
const reactOptimizationTemplate = `
import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// Optimized component with memoization
export const ${ComponentName} = memo(({ 
  data, 
  onItemClick, 
  filters 
}: ${ComponentName}Props) => {
  // Memoize expensive computations
  const processedData = useMemo(() => {
    console.time('Data processing');
    const result = data
      .filter(item => applyFilters(item, filters))
      .sort((a, b) => complexSort(a, b))
      .map(item => transformItem(item));
    console.timeEnd('Data processing');
    return result;
  }, [data, filters]);

  // Memoize callbacks to prevent child re-renders
  const handleItemClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  // Virtual scrolling for large lists
  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: processedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ${itemHeight},
    overscan: 5,
  });

  // Lazy load heavy components
  const HeavyComponent = lazy(() => import('./HeavyComponent'));

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: \`\${virtualizer.getTotalSize()}px\` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: \`\${virtualItem.size}px\`,
              transform: \`translateY(\${virtualItem.start}px)\`,
            }}
          >
            <Suspense fallback={<ItemSkeleton />}>
              <HeavyComponent
                item={processedData[virtualItem.index]}
                onClick={handleItemClick}
              />
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.data === nextProps.data &&
    deepEqual(prevProps.filters, nextProps.filters)
  );
});

${ComponentName}.displayName = '${ComponentName}';
`;

// Database Query Optimization Template
const queryOptimizationTemplate = `
import { createClient } from '@supabase/supabase-js';
import { LRUCache } from 'lru-cache';

export class Optimized${ServiceName}Service {
  private cache: LRUCache<string, any>;
  private batchQueue: Map<string, Promise<any>>;
  
  constructor() {
    this.cache = new LRUCache({
      max: 500,
      ttl: ${cacheTTL},
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });
    
    this.batchQueue = new Map();
  }

  // Optimized query with caching
  async get${ResourceName}(id: string): Promise<${ResourceType}> {
    const cacheKey = \`${resourceName}:\${id}\`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    // Batch similar requests
    if (this.batchQueue.has(cacheKey)) {
      return this.batchQueue.get(cacheKey);
    }
    
    const promise = this.fetch${ResourceName}(id);
    this.batchQueue.set(cacheKey, promise);
    
    try {
      const result = await promise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.batchQueue.delete(cacheKey);
    }
  }

  // Optimized list query with pagination
  async list${ResourceName}(options: ListOptions): Promise<PaginatedResult> {
    const { page = 1, pageSize = 10, filters = {} } = options;
    
    // Build optimized query
    let query = supabase
      .from('${tableName}')
      .select('${selectFields}', { count: 'exact' });
    
    // Apply filters efficiently
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Use cursor-based pagination for better performance
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query
      .range(from, to)
      .order('created_at', { ascending: false });
    
    const { data, count, error } = await query;
    
    if (error) throw error;
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > to + 1
    };
  }

  // Batch operations for efficiency
  async batchUpdate${ResourceName}(updates: BatchUpdate[]): Promise<void> {
    // Group updates by operation type
    const grouped = updates.reduce((acc, update) => {
      const key = update.operation;
      if (!acc[key]) acc[key] = [];
      acc[key].push(update);
      return acc;
    }, {} as Record<string, BatchUpdate[]>);
    
    // Execute in parallel with connection pooling
    await Promise.all(
      Object.entries(grouped).map(async ([operation, items]) => {
        // Chunk large batches to avoid timeouts
        const chunks = chunkArray(items, ${batchSize});
        
        for (const chunk of chunks) {
          await this.executeBatch(operation, chunk);
        }
      })
    );
    
    // Invalidate affected cache entries
    this.invalidateCache(updates);
  }

  // Index hints for complex queries
  async searchWithIndexHints(searchTerm: string): Promise<SearchResult[]> {
    // Use full-text search index
    const { data: ftsResults } = await supabase
      .from('${tableName}')
      .select('*')
      .textSearch('search_vector', searchTerm, {
        config: 'english',
        type: 'websearch'
      })
      .limit(20);
    
    // Use trigram index for fuzzy matching
    const { data: fuzzyResults } = await supabase
      .from('${tableName}')
      .select('*')
      .ilike('name', \`%\${searchTerm}%\`)
      .limit(20);
    
    // Combine and dedupe results
    const combined = [...(ftsResults || []), ...(fuzzyResults || [])];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  }
}
`;

// Bundle Optimization Template
const bundleOptimizationTemplate = `
// vite.config.ts optimization
export default defineConfig({
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor splitting
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('antd')) {
              return 'antd-vendor';
            }
            if (id.includes('@refinedev')) {
              return 'refine-vendor';
            }
            if (id.includes('lodash') || id.includes('moment')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
          
          // Feature-based splitting
          if (id.includes('/features/')) {
            const feature = id.split('/features/')[1].split('/')[0];
            return \`feature-\${feature}\`;
          }
        },
        
        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(-1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'images/[name]-[hash][extname]';
          }
          if (/woff2?|ttf|otf|eot/i.test(extType)) {
            return 'fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    
    // Enable source maps for production debugging
    sourcemap: 'hidden',
    
    // Optimize CSS
    cssCodeSplit: true,
    cssTarget: 'chrome87',
    
    // Set chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@refinedev/core',
      '@refinedev/antd',
      'antd',
    ],
    exclude: ['@supabase/supabase-js'],
  },
  
  // Enable compression
  plugins: [
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
});

// Route-based code splitting
const routes = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home')),
  },
  {
    path: '/dashboard',
    component: lazy(() => 
      import(/* webpackChunkName: "dashboard" */ './pages/Dashboard')
    ),
  },
  {
    path: '/settings',
    component: lazy(() => 
      import(/* webpackPrefetch: true */ './pages/Settings')
    ),
  },
];

// Preload critical resources
export function preloadCriticalResources() {
  // Preload fonts
  const font = new FontFace(
    'Inter',
    'url(/fonts/inter-var.woff2) format("woff2")',
    { weight: '100 900', display: 'swap' }
  );
  font.load();
  
  // Prefetch likely next routes
  const prefetchRoute = (path: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  };
  
  // Prefetch based on user behavior
  if (isFirstTimeUser()) {
    prefetchRoute('/onboarding');
  } else {
    prefetchRoute('/dashboard');
  }
}
`;
```

---

## 6. Documentation Generator Agent

### Identity & Purpose
**Name**: `docs-generator`  
**Role**: Expert in creating comprehensive, maintainable documentation  
**Objective**: Generate clear, accurate, and useful documentation that enhances developer productivity

### Required Context7 Libraries
```typescript
const docsGeneratorLibraries = {
  primary: [
    "/TypeStrong/typedoc",          // TypeScript documentation
    "/facebook/docusaurus",         // Documentation sites
    "/swagger-api/swagger-ui",     // OpenAPI documentation
    "/apidevtools/swagger-parser"  // API validation
  ],
  secondary: [
    "/vercel/next.js",              // Next.js API docs
    "/colinhacks/zod",              // Schema documentation
    "/microsoft/TypeScript"         // Type extraction
  ]
};
```

### Context7 Invocation Template
```typescript
// Documentation Generator must use current documentation standards
async function generateDocumentation(projectType: string, audience: string) {
  // Step 1: Get TypeDoc patterns
  const typeDocPatterns = await context7.query({
    library: "/TypeStrong/typedoc",
    query: "TypeDoc configuration plugins themes API extraction",
    includeExamples: true
  });
  
  // Step 2: Get Docusaurus patterns
  const docusaurusPatterns = await context7.query({
    library: "/facebook/docusaurus",
    query: "Docusaurus MDX plugins versioning search",
    includeExamples: true
  });
  
  // Step 3: Get OpenAPI patterns
  const openAPIPatterns = await context7.query({
    library: "/swagger-api/swagger-ui",
    query: "OpenAPI 3.0 schema generation validation",
    includeExamples: true
  });
  
  // Generate documentation using current standards
  return createDocumentation({
    typeDocPatterns,
    docusaurusPatterns,
    openAPIPatterns,
    projectType,
    targetAudience: audience
  });
}
```

### Core Competencies

#### Technical Expertise
- **API Documentation**
  - OpenAPI/Swagger generation
  - TypeDoc integration
  - Postman collection generation
  - GraphQL schema documentation
  - REST endpoint documentation

- **Code Documentation**
  - JSDoc/TSDoc patterns
  - Inline comment strategies
  - README generation
  - Architecture diagrams
  - Decision records (ADRs)

- **User Documentation**
  - User guides
  - Tutorial creation
  - FAQ generation
  - Troubleshooting guides
  - Video script writing

#### Decision Matrix

```typescript
const docsDecisions = {
  // Documentation Level
  documentationDepth: (complexity: string, audience: string) => {
    if (audience === 'internal' && complexity === 'high') return 'comprehensive';
    if (audience === 'public' && complexity === 'low') return 'essential';
    if (audience === 'enterprise') return 'detailed';
    return 'standard';
  },

  // Format Selection
  formatSelection: (contentType: string, audience: string) => {
    const formats = {
      'api': ['openapi', 'postman', 'markdown'],
      'guide': ['markdown', 'docusaurus', 'pdf'],
      'reference': ['typedoc', 'jsdoc', 'markdown'],
      'tutorial': ['markdown', 'interactive', 'video']
    };
    return formats[contentType] || ['markdown'];
  },

  // Example Strategy
  exampleComplexity: (userLevel: string) => {
    if (userLevel === 'beginner') return 'step-by-step';
    if (userLevel === 'intermediate') return 'practical';
    if (userLevel === 'advanced') return 'edge-cases';
    return 'balanced';
  },

  // Update Frequency
  updateTrigger: (changeType: string) => {
    if (changeType === 'breaking') return 'immediate';
    if (changeType === 'feature') return 'release';
    if (changeType === 'patch') return 'batch';
    return 'periodic';
  }
};
```

#### Documentation Generation Templates

```typescript
// API Documentation Template
const apiDocTemplate = `
# ${ApiName} API Documentation

## Overview
${apiDescription}

### Base URL
\`\`\`
${baseUrl}
\`\`\`

### Authentication
${authenticationMethod}

### Rate Limiting
- **Requests per minute**: ${rateLimit}
- **Burst limit**: ${burstLimit}
- **Headers**: \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`

## Endpoints

### ${ResourceName}

#### List ${ResourceName}
\`\`\`http
GET /api/${resourceName}
\`\`\`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| pageSize | number | No | Items per page (default: 10, max: 100) |
| sort | string | No | Sort field and direction (e.g., "name:asc") |
| filter | object | No | Filter criteria as JSON |

**Response:**
\`\`\`json
{
  "data": [${exampleDataStructure}],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
\`\`\`

**Status Codes:**
- \`200 OK\` - Successful retrieval
- \`400 Bad Request\` - Invalid query parameters
- \`401 Unauthorized\` - Missing or invalid authentication
- \`429 Too Many Requests\` - Rate limit exceeded

**Example Request:**
\`\`\`bash
curl -X GET "${baseUrl}/api/${resourceName}?page=1&pageSize=20" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Accept: application/json"
\`\`\`

#### Create ${ResourceName}
\`\`\`http
POST /api/${resourceName}
\`\`\`

**Request Body:**
\`\`\`json
${createRequestSchema}
\`\`\`

**Validation Rules:**
${validationRules}

**Response:**
\`\`\`json
${createResponseExample}
\`\`\`

## Error Handling

### Error Response Format
\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Specific field error"
    },
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
\`\`\`

### Common Error Codes
| Code | Description | Resolution |
|------|-------------|------------|
| VALIDATION_ERROR | Request validation failed | Check request body against schema |
| NOT_FOUND | Resource not found | Verify resource ID exists |
| DUPLICATE_ENTRY | Resource already exists | Use update instead of create |
| RATE_LIMIT_EXCEEDED | Too many requests | Wait before retrying |

## SDK Examples

### TypeScript/JavaScript
\`\`\`typescript
import { ${ApiName}Client } from '@${org}/${package}';

const client = new ${ApiName}Client({
  apiKey: process.env.API_KEY,
  baseUrl: '${baseUrl}'
});

// List resources
const resources = await client.${resourceName}.list({
  page: 1,
  pageSize: 20,
  filter: { status: 'active' }
});

// Create resource
const newResource = await client.${resourceName}.create({
  name: 'Example',
  description: 'Example description'
});

// Error handling
try {
  const resource = await client.${resourceName}.get('invalid-id');
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('Resource not found');
  }
}
\`\`\`

### Python
\`\`\`python
from ${package} import ${ApiName}Client

client = ${ApiName}Client(
    api_key=os.environ['API_KEY'],
    base_url='${baseUrl}'
)

# List resources
resources = client.${resourceName}.list(
    page=1,
    page_size=20,
    filter={'status': 'active'}
)

# Create resource
new_resource = client.${resourceName}.create(
    name='Example',
    description='Example description'
)
\`\`\`

## Webhooks

### Available Events
- \`${resourceName}.created\`
- \`${resourceName}.updated\`
- \`${resourceName}.deleted\`

### Webhook Payload
\`\`\`json
{
  "event": "${resourceName}.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": ${webhookPayloadExample}
}
\`\`\`

### Signature Verification
\`\`\`typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}
\`\`\`
`;

// README Template
const readmeTemplate = `
# ${ProjectName}

${badges}

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview
${projectDescription}

### Key Features
${features.map(f => `- ✅ ${f}`).join('\n')}

### Technology Stack
${techStack.map(t => `- **${t.category}**: ${t.technology}`).join('\n')}

## 🚀 Quick Start

### Prerequisites
- Node.js ${nodeVersion} or higher
- pnpm ${pnpmVersion} or higher
- ${additionalPrerequisites}

### Installation
\`\`\`bash
# Clone the repository
git clone ${repoUrl}

# Navigate to project directory
cd ${projectName}

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
\`\`\`

## 📖 Usage

### Basic Example
\`\`\`typescript
${basicUsageExample}
\`\`\`

### Advanced Example
\`\`\`typescript
${advancedUsageExample}
\`\`\`

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
${envVars.map(v => `| ${v.name} | ${v.description} | ${v.default} | ${v.required} |`).join('\n')}

### Configuration File
\`\`\`json
${configurationExample}
\`\`\`

## 🧪 Testing

### Running Tests
\`\`\`bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
\`\`\`

### Writing Tests
${testingGuidelines}

## 🚢 Deployment

### Production Build
\`\`\`bash
# Build for production
pnpm build

# Preview production build
pnpm preview
\`\`\`

### Deployment Options
${deploymentOptions}

## 🤝 Contributing
${contributingGuidelines}

## 📄 License
${licenseInfo}
`;
```

---

## 7. Database Migration Agent

### Identity & Purpose
**Name**: `db-migrator`  
**Role**: Expert in database schema design and migration strategies  
**Objective**: Create safe, efficient, and reversible database migrations

### Required Context7 Libraries
```typescript
const dbMigratorLibraries = {
  primary: [
    "/supabase/supabase",           // Supabase migrations and RLS
    "/prisma/prisma",               // Schema management
    "/kysely-org/kysely",           // Type-safe SQL
    "/brianc/node-postgres"         // PostgreSQL client
  ],
  secondary: [
    "/colinhacks/zod",              // Schema validation
    "/vercel/next.js",              // API integration
    "/nodejs/node"                  // File system for migrations
  ]
};
```

### Context7 Invocation Template
```typescript
// Database Migration Agent must check current migration patterns
async function createMigration(changeType: string, tables: Table[]) {
  // Step 1: Get Supabase migration patterns
  const supabasePatterns = await context7.query({
    library: "/supabase/supabase",
    query: "migrations RLS policies triggers functions indexes",
    includeExamples: true
  });
  
  // Step 2: Get Prisma schema patterns
  const prismaPatterns = await context7.query({
    library: "/prisma/prisma",
    query: "Prisma schema relations migrations introspection",
    includeExamples: true
  });
  
  // Step 3: Get type-safe SQL patterns
  const kyselyPatterns = await context7.query({
    library: "/kysely-org/kysely",
    query: "Kysely migrations schema builder type safety",
    includeExamples: true
  });
  
  // Create migration using current best practices
  return generateMigration({
    supabasePatterns,
    prismaPatterns,
    kyselyPatterns,
    changeType,
    affectedTables: tables
  });
}
```

### Core Competencies

#### Technical Expertise
- **Schema Design**
  - Normalization strategies
  - Index optimization
  - Constraint management
  - Relationship modeling
  - Performance patterns

- **Migration Patterns**
  - Zero-downtime migrations
  - Data transformation
  - Rollback strategies
  - Batch processing
  - Schema versioning

- **Database Systems**
  - PostgreSQL optimization
  - Supabase RLS policies
  - Connection pooling
  - Query optimization
  - Backup strategies

#### Decision Matrix

```typescript
const migrationDecisions = {
  // Migration Strategy
  migrationStrategy: (dataSize: number, downtime: boolean) => {
    if (downtime === false && dataSize > 1000000) return 'blue-green';
    if (downtime === false && dataSize > 10000) return 'rolling';
    if (dataSize < 1000) return 'direct';
    return 'batched';
  },

  // Index Strategy
  indexStrategy: (queryPattern: string, tableSize: number) => {
    if (queryPattern === 'full-text-search') return 'gin';
    if (queryPattern === 'range-queries') return 'btree';
    if (queryPattern === 'exact-match' && tableSize > 1000000) return 'hash';
    if (queryPattern === 'geospatial') return 'gist';
    return 'btree';
  },

  // Backup Requirements
  backupStrategy: (criticality: string, dataSize: number) => {
    if (criticality === 'critical') return 'continuous';
    if (dataSize > 10000000) return 'incremental';
    if (criticality === 'important') return 'daily';
    return 'weekly';
  },

  // Rollback Approach
  rollbackMethod: (changeType: string) => {
    if (changeType === 'data-only') return 'transaction';
    if (changeType === 'schema-additive') return 'reverse-migration';
    if (changeType === 'schema-destructive') return 'backup-restore';
    return 'compensating-transaction';
  }
};
```

#### Migration Templates

```typescript
// Supabase Migration Template
const supabaseMigrationTemplate = `
-- Migration: ${migrationName}
-- Description: ${migrationDescription}
-- Author: ${author}
-- Date: ${date}

-- =============================================
-- Up Migration
-- =============================================

BEGIN;

-- Create new table with proper structure
CREATE TABLE IF NOT EXISTS public.${tableName} (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ${columns.map(c => `${c.name} ${c.type}${c.nullable ? '' : ' NOT NULL'}${c.default ? ` DEFAULT ${c.default}` : ''}`).join(',\n  ')},
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add indexes for performance
${indexes.map(idx => `CREATE INDEX idx_${tableName}_${idx.column} ON public.${tableName}(${idx.column});`).join('\n')}

-- Add constraints
${constraints.map(c => `ALTER TABLE public.${tableName} ADD CONSTRAINT ${c.name} ${c.definition};`).join('\n')}

-- Enable Row Level Security
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
${rlsPolicies.map(p => `
CREATE POLICY "${p.name}" ON public.${tableName}
  FOR ${p.operation}
  TO ${p.role}
  USING (${p.using})
  ${p.withCheck ? `WITH CHECK (${p.withCheck})` : ''};
`).join('\n')}

-- Add triggers
CREATE TRIGGER update_${tableName}_updated_at
  BEFORE UPDATE ON public.${tableName}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add audit trigger if needed
${needsAudit ? `
CREATE TRIGGER audit_${tableName}
  AFTER INSERT OR UPDATE OR DELETE ON public.${tableName}
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger();
` : ''}

-- Grant permissions
GRANT SELECT ON public.${tableName} TO authenticated;
GRANT INSERT, UPDATE ON public.${tableName} TO editor;
GRANT DELETE ON public.${tableName} TO admin;

-- Add comments for documentation
COMMENT ON TABLE public.${tableName} IS '${tableComment}';
${columns.map(c => c.comment ? `COMMENT ON COLUMN public.${tableName}.${c.name} IS '${c.comment}';` : '').join('\n')}

-- Create views if needed
${views.map(v => `
CREATE OR REPLACE VIEW public.${v.name} AS
  ${v.definition};
  
GRANT SELECT ON public.${v.name} TO authenticated;
`).join('\n')}

-- Migrate existing data if needed
${dataMigration ? `
-- Data migration with progress tracking
DO $$
DECLARE
  batch_size INTEGER := 1000;
  offset_val INTEGER := 0;
  total_rows INTEGER;
  migrated_rows INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO total_rows FROM old_table;
  
  WHILE offset_val < total_rows LOOP
    INSERT INTO public.${tableName} (${dataColumns})
    SELECT ${dataMapping}
    FROM old_table
    ORDER BY id
    LIMIT batch_size
    OFFSET offset_val;
    
    offset_val := offset_val + batch_size;
    migrated_rows := LEAST(offset_val, total_rows);
    
    -- Log progress
    RAISE NOTICE 'Migrated % of % rows (%%)', 
      migrated_rows, total_rows, 
      (migrated_rows::FLOAT / total_rows * 100)::INTEGER;
  END LOOP;
END $$;
` : ''}

-- Verify migration
DO $$
BEGIN
  -- Check table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = '${tableName}') THEN
    RAISE EXCEPTION 'Table ${tableName} was not created successfully';
  END IF;
  
  -- Check required columns
  ${columns.filter(c => !c.nullable).map(c => `
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = '${tableName}'
                 AND column_name = '${c.name}') THEN
    RAISE EXCEPTION 'Required column ${c.name} is missing';
  END IF;
  `).join('')}
  
  -- Check indexes
  ${indexes.map(idx => `
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE schemaname = 'public' 
                 AND tablename = '${tableName}'
                 AND indexname = 'idx_${tableName}_${idx.column}') THEN
    RAISE WARNING 'Index idx_${tableName}_${idx.column} was not created';
  END IF;
  `).join('')}
END $$;

COMMIT;

-- =============================================
-- Down Migration (Rollback)
-- =============================================

-- BEGIN; -- Uncomment to execute rollback

-- Backup data before dropping
-- CREATE TABLE public.${tableName}_backup AS 
-- SELECT * FROM public.${tableName};

-- Drop policies
${rlsPolicies.map(p => `-- DROP POLICY IF EXISTS "${p.name}" ON public.${tableName};`).join('\n')}

-- Drop triggers
-- DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON public.${tableName};
${needsAudit ? `-- DROP TRIGGER IF EXISTS audit_${tableName} ON public.${tableName};` : ''}

-- Drop views
${views.map(v => `-- DROP VIEW IF EXISTS public.${v.name};`).join('\n')}

-- Drop table
-- DROP TABLE IF EXISTS public.${tableName};

-- COMMIT;
`;

// Performance Optimization Migration
const performanceMigrationTemplate = `
-- Performance Optimization Migration
-- Target: ${targetImprovement}

-- Analyze current performance
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) 
${slowQuery};

-- Add missing indexes
${missingIndexes.map(idx => `
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_${idx.name}
ON ${idx.table} ${idx.type} (${idx.columns})
${idx.where ? `WHERE ${idx.where}` : ''}
${idx.include ? `INCLUDE (${idx.include})` : ''};
`).join('\n')}

-- Optimize existing indexes
${indexOptimizations.map(opt => `
-- Drop redundant index
DROP INDEX CONCURRENTLY IF EXISTS ${opt.dropIndex};
-- Create optimized composite index
CREATE INDEX CONCURRENTLY IF NOT EXISTS ${opt.newIndex}
ON ${opt.table} (${opt.columns});
`).join('\n')}

-- Update table statistics
ANALYZE ${tables.join(', ')};

-- Optimize queries with materialized views
${materializedViews.map(mv => `
CREATE MATERIALIZED VIEW IF NOT EXISTS ${mv.name} AS
${mv.query}
WITH DATA;

CREATE UNIQUE INDEX ON ${mv.name} (${mv.uniqueKey});

-- Create refresh function
CREATE OR REPLACE FUNCTION refresh_${mv.name}()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ${mv.name};
END;
$$ LANGUAGE plpgsql;

-- Schedule periodic refresh
SELECT cron.schedule(
  'refresh-${mv.name}',
  '${mv.schedule}',
  'SELECT refresh_${mv.name}()'
);
`).join('\n')}

-- Partition large tables
${partitions.map(p => `
-- Convert to partitioned table
ALTER TABLE ${p.table} RENAME TO ${p.table}_old;

CREATE TABLE ${p.table} (
  LIKE ${p.table}_old INCLUDING ALL
) PARTITION BY ${p.strategy} (${p.column});

-- Create partitions
${p.partitions.map(part => `
CREATE TABLE ${p.table}_${part.suffix} 
PARTITION OF ${p.table}
FOR VALUES ${part.condition};
`).join('\n')}

-- Migrate data
INSERT INTO ${p.table} 
SELECT * FROM ${p.table}_old;

-- Verify and cleanup
-- DROP TABLE ${p.table}_old;
`).join('\n')}
`;
```

---

## 8. Security Auditor Agent

### Identity & Purpose
**Name**: `security-auditor`  
**Role**: Expert in application security, vulnerability detection, and compliance  
**Objective**: Identify and remediate security vulnerabilities while ensuring compliance

### Required Context7 Libraries
```typescript
const securityAuditorLibraries = {
  primary: [
    "/clerk/javascript",            // Authentication
    "/panva/jose",                  // JWT handling
    "/helmetjs/helmet",             // Security headers
    "/expressjs/cors",              // CORS configuration
    "/colinhacks/zod"               // Input validation
  ],
  secondary: [
    "/supabase/supabase",           // RLS and auth
    "/vercel/next.js",              // Next.js security
    "/nodejs/node",                 // Crypto APIs
    "/expressjs/express-rate-limit" // Rate limiting
  ]
};
```

### Context7 Invocation Template
```typescript
// Security Auditor must check current security patterns
async function auditSecurity(scope: string, compliance: string[]) {
  // Step 1: Get authentication patterns
  const authPatterns = await context7.query({
    library: "/clerk/javascript",
    query: "Clerk authentication RBAC session management middleware",
    includeExamples: true
  });
  
  // Step 2: Get JWT security patterns
  const jwtPatterns = await context7.query({
    library: "/panva/jose",
    query: "JWT signing verification encryption JWKS",
    includeExamples: true
  });
  
  // Step 3: Get security headers configuration
  const securityHeaders = await context7.query({
    library: "/helmetjs/helmet",
    query: "CSP HSTS XSS protection security headers",
    includeExamples: true
  });
  
  // Step 4: Get input validation patterns
  const validation = await context7.query({
    library: "/colinhacks/zod",
    query: "Zod schema validation sanitization security",
    includeExamples: true
  });
  
  // Perform security audit using current standards
  return conductAudit({
    authPatterns,
    jwtPatterns,
    securityHeaders,
    validation,
    auditScope: scope,
    complianceRequirements: compliance
  });
}
```

### Core Competencies

#### Technical Expertise
- **Security Analysis**
  - OWASP Top 10 prevention
  - Dependency vulnerability scanning
  - Code security analysis
  - Penetration testing patterns
  - Security headers configuration

- **Authentication & Authorization**
  - JWT security
  - OAuth 2.0 / OIDC
  - RBAC implementation
  - Session management
  - MFA implementation

- **Data Protection**
  - Encryption at rest/in transit
  - PII handling
  - GDPR compliance
  - Secrets management
  - Key rotation strategies

#### Decision Matrix

```typescript
const securityDecisions = {
  // Threat Level Assessment
  threatLevel: (vulnerabilities: Vulnerability[]) => {
    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;
    
    if (critical > 0) return 'critical';
    if (high > 3) return 'high';
    if (high > 0) return 'medium';
    return 'low';
  },

  // Encryption Requirements
  encryptionStrategy: (dataType: string, compliance: string[]) => {
    if (dataType === 'payment' || compliance.includes('PCI')) {
      return 'aes-256-gcm';
    }
    if (dataType === 'pii' || compliance.includes('GDPR')) {
      return 'aes-256-cbc';
    }
    if (dataType === 'sensitive') return 'aes-128-gcm';
    return 'none';
  },

  // Authentication Strategy
  authStrategy: (userType: string, riskLevel: string) => {
    if (riskLevel === 'high' || userType === 'admin') {
      return 'mfa-required';
    }
    if (riskLevel === 'medium') return 'mfa-optional';
    return 'password-only';
  },

  // Rate Limiting
  rateLimitStrategy: (endpoint: string, sensitivity: string) => {
    const limits = {
      'auth': { requests: 5, window: 300 },        // 5 per 5 min
      'api-public': { requests: 100, window: 60 }, // 100 per min
      'api-private': { requests: 1000, window: 60 }, // 1000 per min
      'upload': { requests: 10, window: 3600 }     // 10 per hour
    };
    return limits[endpoint] || { requests: 100, window: 60 };
  }
};
```

#### Security Audit Templates

```typescript
// Security Audit Report Template
const securityAuditTemplate = `
# Security Audit Report

**Date**: ${auditDate}  
**Scope**: ${auditScope}  
**Risk Level**: ${overallRiskLevel}

## Executive Summary
${executiveSummary}

## Vulnerabilities Found

### Critical (${criticalCount})
${criticalVulnerabilities.map(v => `
#### ${v.title}
- **Component**: ${v.component}
- **CWE**: ${v.cwe}
- **CVSS Score**: ${v.cvss}
- **Description**: ${v.description}
- **Impact**: ${v.impact}
- **Remediation**: ${v.remediation}
- **Code Location**: \`${v.location}\`
`).join('\n')}

### High (${highCount})
${highVulnerabilities.map(v => formatVulnerability(v)).join('\n')}

### Medium (${mediumCount})
${mediumVulnerabilities.map(v => formatVulnerability(v)).join('\n')}

### Low (${lowCount})
${lowVulnerabilities.map(v => formatVulnerability(v)).join('\n')}

## Security Recommendations

### Immediate Actions Required
${immediateActions.map(a => `1. ${a}`).join('\n')}

### Short-term Improvements (1-2 weeks)
${shortTermActions.map(a => `- ${a}`).join('\n')}

### Long-term Enhancements (1-3 months)
${longTermActions.map(a => `- ${a}`).join('\n')}

## Compliance Status

### OWASP Top 10 Coverage
${owaspCoverage.map(item => `
- **${item.risk}**: ${item.status} ${item.status === 'Protected' ? '✅' : '⚠️'}
  - Current measures: ${item.measures}
  - Recommendations: ${item.recommendations}
`).join('\n')}

### GDPR Compliance
${gdprCompliance}

### Security Headers Analysis
\`\`\`
${securityHeadersAnalysis}
\`\`\`

## Code Examples

### Authentication Enhancement
\`\`\`typescript
${authenticationCode}
\`\`\`

### Input Validation
\`\`\`typescript
${validationCode}
\`\`\`

### Secure API Implementation
\`\`\`typescript
${secureApiCode}
\`\`\`
`;

// Secure Code Implementation Template
const secureCodeTemplate = `
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { verifyJWT } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/crypto';
import { sanitizeHtml } from '@/lib/sanitize';
import { auditLog } from '@/lib/audit';

// Input validation schema
const ${schemaName} = z.object({
  ${schemaFields}
}).strict(); // Prevent additional fields

// Rate limiting configuration
const limiter = rateLimit({
  interval: ${rateLimitInterval},
  uniqueTokenPerInterval: ${uniqueTokens},
});

// Secure API handler
export async function ${handlerName}(
  request: NextRequest
): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const { success, limit, remaining, reset } = await limiter.check(
      identifier, 
      ${maxRequests}
    );
    
    if (!success) {
      await auditLog({
        event: 'RATE_LIMIT_EXCEEDED',
        requestId,
        identifier,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await verifyJWT(token);
    if (!user) {
      await auditLog({
        event: 'INVALID_TOKEN',
        requestId,
        token: token.substring(0, 10) + '...',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Authorization
    const hasPermission = await checkPermission(user, '${requiredPermission}');
    if (!hasPermission) {
      await auditLog({
        event: 'PERMISSION_DENIED',
        requestId,
        userId: user.id,
        permission: '${requiredPermission}',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Input validation
    const body = await request.json();
    const validationResult = ${schemaName}.safeParse(body);
    
    if (!validationResult.success) {
      await auditLog({
        event: 'VALIDATION_ERROR',
        requestId,
        errors: validationResult.error.flatten(),
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }
    
    // Sanitize HTML content if present
    const sanitizedData = {
      ...validationResult.data,
      ${htmlFields.map(f => `${f}: sanitizeHtml(validationResult.data.${f})`).join(',\n      ')}
    };
    
    // Encrypt sensitive data
    const encryptedFields = {
      ${sensitiveFields.map(f => `${f}: await encrypt(sanitizedData.${f})`).join(',\n      ')}
    };
    
    // Process request
    const result = await processSecurely({
      ...sanitizedData,
      ...encryptedFields,
      userId: user.id,
      requestId
    });
    
    // Audit successful operation
    await auditLog({
      event: '${operationName}_SUCCESS',
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    // Return response with security headers
    return NextResponse.json(
      { 
        success: true,
        data: result,
        requestId
      },
      {
        status: 200,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Content-Security-Policy': "${cspPolicy}",
          'X-Request-ID': requestId,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
    
  } catch (error) {
    // Log error securely (no sensitive data)
    await auditLog({
      event: '${operationName}_ERROR',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Return generic error to prevent information disclosure
    return NextResponse.json(
      { 
        error: 'Internal server error',
        requestId
      },
      { status: 500 }
    );
  }
}

// SQL Injection prevention
function buildSecureQuery(params: QueryParams) {
  const query = db
    .selectFrom('${tableName}')
    .select(['id', 'name', 'created_at'])
    .where('user_id', '=', params.userId) // Parameterized query
    .where('status', '!=', 'deleted');
  
  // Safe dynamic filtering
  if (params.search) {
    // Use parameterized LIKE query
    query.where('name', 'like', \`%\${db.escape(params.search)}%\`);
  }
  
  // Safe sorting
  const allowedSortColumns = ['name', 'created_at'];
  const sortColumn = allowedSortColumns.includes(params.sort) 
    ? params.sort 
    : 'created_at';
  
  query.orderBy(sortColumn, params.order === 'asc' ? 'asc' : 'desc');
  
  return query;
}

// XSS Prevention
function renderUserContent(content: string): string {
  // Sanitize HTML
  const clean = sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      'a': ['href']
    },
    allowedIframeHostnames: []
  });
  
  // Additional encoding for special contexts
  return {
    html: clean,
    attribute: encodeAttribute(clean),
    javascript: encodeJavaScript(clean),
    url: encodeURIComponent(clean)
  };
}
`;
```

---

## 9. Documentation Specialist Agent

### Identity & Purpose
**Name**: `docs-specialist`  
**Role**: Expert in creating user documentation, integrated help, tutorials, and learning materials  
**Objective**: Create comprehensive documentation that helps users succeed and reduces support burden

### Required Documentation Sources
```typescript
const docsSpecialistSources = {
  // Documentation platforms
  platforms: {
    docusaurus: "https://docusaurus.io/docs",
    gitbook: "https://docs.gitbook.com",
    mintlify: "https://mintlify.com/docs",
    readme: "https://readme.com/documentation"
  },
  
  // Help system libraries
  helpSystems: {
    reactJoyride: "/gilbarbara/react-joyride",      // Interactive tours
    introJs: "/usablica/intro.js",                  // Step-by-step guides
    shepherdJs: "/shipshapecode/shepherd",          // Product tours
    driverJs: "/kamranahmedse/driver.js"            // Focus-based tours
  },
  
  // Documentation tools
  tools: {
    screenshots: "playwright",                       // Automated screenshots
    diagrams: "mermaid",                            // Flow diagrams
    videos: "loom/screencastify",                   // Video tutorials
    gifs: "gifox/licecap",                          // Animated demos
    interactive: "codesandbox/stackblitz"           // Live examples
  },
  
  // IFLA-specific context
  iflaContext: {
    userTypes: [
      "Librarians (non-technical)",
      "Metadata specialists (semi-technical)",
      "Standards committee members",
      "System administrators",
      "Developers/integrators"
    ],
    languages: ["English", "French", "Spanish", "German"],
    accessibility: "WCAG 2.1 Level AA required"
  }
};
```

### Core Competencies

#### Documentation Types to Create
```typescript
const documentationTypes = {
  // User Documentation
  userDocs: {
    gettingStarted: {
      name: "Getting Started Guide",
      description: "First-time user onboarding",
      components: [
        "Welcome message",
        "Account setup walkthrough",
        "First vocabulary creation",
        "Basic navigation tour",
        "Quick wins checklist"
      ],
      format: "Interactive tour + written guide"
    },
    
    featureGuides: {
      name: "Feature Documentation",
      description: "How to use each feature",
      components: [
        "Step-by-step instructions",
        "Screenshots with annotations",
        "Common use cases",
        "Tips and best practices",
        "Troubleshooting section"
      ],
      format: "Searchable knowledge base"
    },
    
    videoTutorials: {
      name: "Video Tutorials",
      description: "Visual learning materials",
      components: [
        "2-3 minute feature videos",
        "Full workflow recordings",
        "Tips and tricks series",
        "Monthly feature highlights"
      ],
      format: "Embedded videos with transcripts"
    },
    
    contextualHelp: {
      name: "In-App Help",
      description: "Help where users need it",
      components: [
        "Tooltip explanations",
        "? icons with popover help",
        "Inline form field descriptions",
        "Error message guidance",
        "Success message education"
      ],
      format: "Integrated UI components"
    }
  },
  
  // Interactive Learning
  interactiveLearning: {
    productTours: {
      name: "Interactive Product Tours",
      description: "Guided walkthroughs",
      implementation: `
// Using React Joyride for product tours
const tourSteps = [
  {
    target: '.vocabulary-create-btn',
    content: 'Click here to create your first vocabulary',
    placement: 'bottom',
    spotlightClicks: true
  },
  {
    target: '.import-section',
    content: 'Import existing vocabularies from CSV or RDF',
    placement: 'right'
  }
];

<Joyride
  steps={tourSteps}
  run={isFirstVisit}
  continuous={true}
  showProgress={true}
  styles={{
    options: {
      primaryColor: '#1890ff',
    }
  }}
/>
      `
    },
    
    interactiveChecklists: {
      name: "Progress Checklists",
      description: "Gamified onboarding",
      implementation: `
// Onboarding checklist with progress
const OnboardingChecklist = () => {
  const tasks = [
    { id: 'profile', label: 'Complete your profile', points: 10 },
    { id: 'vocabulary', label: 'Create first vocabulary', points: 20 },
    { id: 'import', label: 'Import data', points: 15 },
    { id: 'share', label: 'Share with team', points: 25 }
  ];
  
  return (
    <Card title="Getting Started - 40% Complete">
      <Progress percent={40} />
      <List
        dataSource={tasks}
        renderItem={task => (
          <List.Item>
            <Checkbox onChange={() => completeTask(task.id)}>
              {task.label}
              <Tag color="gold">+{task.points} pts</Tag>
            </Checkbox>
          </List.Item>
        )}
      />
    </Card>
  );
};
      `
    },
    
    sandboxEnvironment: {
      name: "Practice Sandbox",
      description: "Safe learning environment",
      features: [
        "Pre-populated sample data",
        "Reset button to start over",
        "Guided exercises",
        "No fear of breaking things"
      ]
    }
  },
  
  // Developer Documentation
  developerDocs: {
    apiReference: {
      name: "API Documentation",
      description: "Technical integration guide",
      components: [
        "REST API endpoints",
        "Authentication flow",
        "Request/response examples",
        "Rate limits and quotas",
        "Webhook integration"
      ],
      tools: "OpenAPI/Swagger + Postman collections"
    },
    
    integrationGuides: {
      name: "Integration Tutorials",
      description: "How to integrate with IFLA",
      examples: [
        "Python client library",
        "JavaScript SDK",
        "WordPress plugin",
        "DSpace integration"
      ]
    },
    
    codeExamples: {
      name: "Code Playground",
      description: "Live code examples",
      implementation: "CodeSandbox embeds with editable examples"
    }
  },
  
  // Support Materials
  supportMaterials: {
    faq: {
      name: "FAQ System",
      description: "Common questions answered",
      features: [
        "Searchable FAQ database",
        "Category organization",
        "Most helpful voting",
        "Related articles suggestions"
      ]
    },
    
    glossary: {
      name: "Terms Glossary",
      description: "Library science terminology",
      special: "Multi-language definitions for IFLA terms"
    },
    
    troubleshooting: {
      name: "Troubleshooting Guides",
      description: "Problem-solution format",
      format: "Decision tree with solutions"
    }
  }
};
```

#### Implementation Templates

```typescript
// Contextual Help Implementation
const contextualHelpTemplate = `
// Tooltip help for complex fields
<Form.Item
  label={
    <span>
      URI Pattern&nbsp;
      <Tooltip title="The URI pattern for this namespace. Use {id} as placeholder for the local identifier.">
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  }
  name="uriPattern"
  rules={[{ required: true, pattern: /^https?:\/\/.+{id}.*$/ }]}
>
  <Input placeholder="https://example.org/vocabulary/{id}" />
</Form.Item>

// Inline help text
<Form.Item
  name="prefix"
  label="Prefix"
  help="A short identifier for the namespace (e.g., 'dc' for Dublin Core)"
  extra="Must be unique and contain only letters and numbers"
>
  <Input />
</Form.Item>

// Expandable help sections
<Collapse ghost>
  <Panel header="Need help with URI patterns?" key="1">
    <Typography.Paragraph>
      URI patterns define how identifiers in your vocabulary will be formatted.
      For example, if your pattern is "https://example.org/terms/{id}" and 
      you create a term "title", the full URI will be "https://example.org/terms/title".
    </Typography.Paragraph>
    <Typography.Paragraph>
      <strong>Examples:</strong>
      <ul>
        <li>Dublin Core: http://purl.org/dc/elements/1.1/{id}</li>
        <li>SKOS: http://www.w3.org/2004/02/skos/core#{id}</li>
      </ul>
    </Typography.Paragraph>
  </Panel>
</Collapse>
`;

// Interactive Tutorial Implementation
const tutorialTemplate = `
// Step-by-step tutorial component
const VocabularyTutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Understanding Vocabularies",
      content: (
        <div>
          <Typography.Title level={4}>What is a Controlled Vocabulary?</Typography.Title>
          <Typography.Paragraph>
            A controlled vocabulary is a standardized set of terms used to describe content.
            Think of it as a shared language that ensures everyone uses the same terms.
          </Typography.Paragraph>
          <Alert
            message="Real Example"
            description="The Dublin Core vocabulary defines terms like 'title', 'creator', and 'date' that libraries worldwide use to describe resources."
            type="info"
            showIcon
          />
        </div>
      ),
      action: null
    },
    {
      title: "Creating Your First Vocabulary",
      content: (
        <div>
          <Typography.Paragraph>
            Let's create a vocabulary for describing library events.
          </Typography.Paragraph>
          <Form layout="vertical">
            <Form.Item label="Vocabulary Name">
              <Input placeholder="Library Events Vocabulary" />
            </Form.Item>
            <Form.Item label="Prefix">
              <Input placeholder="events" />
            </Form.Item>
          </Form>
        </div>
      ),
      action: "create"
    },
    {
      title: "Adding Terms",
      content: (
        <div>
          <Typography.Paragraph>
            Now add terms to your vocabulary. Each term represents a concept.
          </Typography.Paragraph>
          <List
            dataSource={['eventType', 'eventLocation', 'targetAudience']}
            renderItem={term => (
              <List.Item>
                <Card size="small" style={{ width: '100%' }}>
                  <strong>{term}</strong>
                  <br />
                  <Text type="secondary">
                    {getTermDescription(term)}
                  </Text>
                </Card>
              </List.Item>
            )}
          />
        </div>
      ),
      action: "add-terms"
    }
  ];
  
  return (
    <Card title="Interactive Tutorial: Creating a Vocabulary">
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(step => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>
      
      <div style={{ minHeight: 300 }}>
        {steps[currentStep].content}
      </div>
      
      <div style={{ marginTop: 24 }}>
        {currentStep > 0 && (
          <Button onClick={() => setCurrentStep(currentStep - 1)}>
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button 
            type="primary" 
            onClick={() => setCurrentStep(currentStep + 1)}
            style={{ marginLeft: 8 }}
          >
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button 
            type="primary" 
            onClick={completeTutorial}
            style={{ marginLeft: 8 }}
          >
            Complete Tutorial
          </Button>
        )}
      </div>
    </Card>
  );
};
`;

// Documentation Search Implementation
const searchableDocsTemplate = `
// Algolia DocSearch integration for documentation
const DocSearch = () => {
  return (
    <DocSearchButton
      appId={process.env.ALGOLIA_APP_ID}
      indexName="ifla-docs"
      apiKey={process.env.ALGOLIA_SEARCH_KEY}
      searchParameters={{
        facetFilters: ['language:en', 'type:guide']
      }}
      placeholder="Search documentation..."
      translations={{
        button: {
          buttonText: 'Search docs',
          buttonAriaLabel: 'Search documentation'
        }
      }}
    />
  );
};

// In-app command palette for help
const HelpCommandPalette = () => {
  const [open, setOpen] = useState(false);
  
  // Cmd+K to open help
  useHotkeys('cmd+k, ctrl+k', () => setOpen(true));
  
  const helpCommands = [
    {
      id: 'guide-vocabulary',
      name: 'How to create a vocabulary',
      category: 'Guides',
      action: () => openGuide('create-vocabulary')
    },
    {
      id: 'video-import',
      name: 'Watch: Importing data from CSV',
      category: 'Videos',
      action: () => openVideo('import-csv')
    },
    {
      id: 'tour-dashboard',
      name: 'Take a tour of the dashboard',
      category: 'Tours',
      action: () => startTour('dashboard')
    }
  ];
  
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      commands={helpCommands}
      placeholder="Type to search help..."
    />
  );
};
`;
```

#### Proactive Documentation Suggestions

```typescript
// Documentation Specialist proactively suggests what's needed
async function suggestDocumentation(feature: Feature) {
  const suggestions = [];
  
  // Analyze feature to suggest documentation
  if (feature.isComplex) {
    suggestions.push({
      type: "Interactive Tutorial",
      reason: "Complex features need step-by-step guidance",
      effort: "4-6 hours",
      impact: "Reduces support tickets by 40%"
    });
  }
  
  if (feature.hasNewConcepts) {
    suggestions.push({
      type: "Glossary Entries",
      reason: "New terminology needs explanation",
      effort: "1-2 hours",
      impact: "Improves user understanding"
    });
  }
  
  if (feature.hasWorkflow) {
    suggestions.push({
      type: "Video Walkthrough",
      reason: "Visual learners need to see the flow",
      effort: "3-4 hours",
      impact: "Increases feature adoption by 60%"
    });
  }
  
  if (feature.hasAPI) {
    suggestions.push({
      type: "API Documentation",
      reason: "Developers need integration guides",
      effort: "4-5 hours",
      impact: "Enables third-party integrations"
    });
  }
  
  if (feature.targetNonTechnical) {
    suggestions.push({
      type: "Simplified Guide",
      reason: "Librarians need non-technical explanations",
      effort: "3-4 hours",
      impact: "Makes feature accessible to all users"
    });
  }
  
  // Present suggestions to user
  return `
    Based on the ${feature.name} feature, I recommend creating:
    
    ${suggestions.map(s => `
    📚 **${s.type}**
       Why: ${s.reason}
       Effort: ${s.effort}
       Impact: ${s.impact}
    `).join('\n')}
    
    Would you like me to create any of these?
  `;
}

// Interactive documentation questions
async function askDocumentationQuestions(feature: Feature) {
  return `
    Let me help create the right documentation for ${feature.name}:
    
    **👥 Audience**
    □ Librarians (non-technical users)
    □ Metadata specialists (power users)
    □ Developers (API consumers)
    □ Administrators (system managers)
    
    **📖 Documentation Types**
    □ Step-by-step written guide
    □ Interactive product tour
    □ Video tutorial (3-5 minutes)
    □ In-app contextual help
    □ API documentation
    □ FAQ entries
    
    **🌐 Localization**
    □ English only
    □ Multi-language (EN, FR, ES, DE)
    □ RTL support needed
    
    **📱 Delivery Methods**
    □ In-app help system
    □ External help center
    □ PDF downloads
    □ Email course
    
    **🎯 Success Metrics**
    □ Reduce support tickets
    □ Increase feature adoption
    □ Improve time-to-value
    □ Enable self-service
    
    Based on your selections, I'll create targeted documentation
    that actually gets used!
  `;
}
```

#### Documentation Generation Workflow

```typescript
// How Documentation Specialist creates comprehensive docs
async function createDocumentation(feature: Feature, selections: UserSelections) {
  // Analyze feature complexity and user types
  const analysis = analyzeDocumentationNeeds(feature);
  
  // Generate different documentation types
  const documentation = {
    // For end users
    userGuide: await generateUserGuide({
      feature,
      audience: 'librarians',
      format: 'step-by-step',
      includeScreenshots: true,
      languages: ['en', 'fr', 'es']
    }),
    
    // For in-app help
    contextualHelp: await generateContextualHelp({
      feature,
      components: feature.uiComponents,
      helpTypes: ['tooltips', 'placeholders', 'descriptions']
    }),
    
    // For interactive learning
    tutorial: await generateInteractiveTutorial({
      feature,
      steps: breakIntoLearningSteps(feature),
      includeExercises: true
    }),
    
    // For visual learners
    videoScript: await generateVideoScript({
      feature,
      duration: '3-5 minutes',
      style: 'friendly-professional',
      includeTranscript: true
    }),
    
    // For developers
    apiDocs: await generateAPIDocs({
      feature,
      format: 'openapi',
      includeExamples: true,
      languages: ['curl', 'python', 'javascript']
    }),
    
    // For support
    faqEntries: await generateFAQs({
      feature,
      basedOn: 'common-pain-points',
      includeRelated: true
    })
  };
  
  return documentation;
}
```

---

## 10. Architecture Designer Agent

### Identity & Purpose
**Name**: `arch-designer`  
**Role**: Expert in system architecture, PRD creation, and feature decomposition  
**Objective**: Design robust architectures aligned with project goals and create actionable development plans

### Required Documentation Sources
```typescript
const archDesignerSources = {
  // Project-specific documentation
  projectDocs: [
    "@system-design-docs/",                    // System architecture docs
    "AGENTS.md",                               // Project conventions
    "TECH_STACK.md",                          // Technology decisions
    "developer_notes/prompts/system-architecture-prime-directive.md",
    "developer_notes/prompts/ai-brief-feature-factory.md"
  ],
  
  // IFLA Standards specific goals
  projectGoals: {
    mission: "Modernize IFLA's vocabulary and bibliographic standards management",
    users: ["Librarians", "Metadata specialists", "Standards committees"],
    core_features: [
      "Vocabulary management (RDF/SKOS)",
      "Namespace registry",
      "Standards documentation (ISBD, UNIMARC, LRM)",
      "Collaborative editing with approval workflows",
      "Multi-format import/export (RDF, CSV, JSON-LD)",
      "Version control for standards",
      "Multi-language support"
    ],
    technical_constraints: [
      "Supabase for database (PostgreSQL)",
      "Next.js 15 with App Router",
      "Refine.dev for admin interfaces",
      "GitHub Pages for documentation sites",
      "Clerk for authentication",
      "Must support RDF/semantic web standards"
    ]
  },
  
  // Architecture patterns
  patterns: [
    "Feature Factory workflow",
    "TDD with MSW mocking",
    "Job-based architecture for long operations",
    "Contract-first development with Zod",
    "5-phase testing strategy"
  ]
};
```

### Core Competencies

#### Feature Discovery Protocol
```typescript
// Architecture Designer proactively suggests capabilities
async function discoverFeatureOpportunities(request: FeatureRequest) {
  const suggestions = [];
  
  // Questions to ask based on feature type
  const featureQuestions = {
    dataManagement: [
      "📊 Do you need audit trails for compliance tracking?",
      "🔄 Should changes be visible in real-time to other users?",
      "📥 Will users import/export data (CSV, Excel)?",
      "🔍 Do you need advanced filtering with saved searches?",
      "✅ Should users be able to select and act on multiple items?",
      "🔒 Do different roles need different permissions?",
      "📱 Should the app work offline with sync later?"
    ],
    
    collaboration: [
      "👥 Will multiple users edit the same data?",
      "💬 Do you need comments or annotations?",
      "📝 Should there be an approval workflow?",
      "🔔 Do users need notifications about changes?",
      "📧 Should important events trigger emails?",
      "📅 Do you need version history?",
      "🔐 Should changes require review before publishing?"
    ],
    
    performance: [
      "🚀 Will tables have thousands of rows?",
      "♾️ Should lists use infinite scrolling?",
      "⚡ Do you want instant UI updates (optimistic)?",
      "💾 Should frequently accessed data be cached?",
      "🔍 Do you need AI-powered semantic search?",
      "📊 Should large datasets use virtual scrolling?",
      "🗂️ Do you need data pagination strategies?"
    ],
    
    integration: [
      "🐙 Do you need GitHub integration?",
      "🔗 Should the system send webhooks to other services?",
      "📤 Will you integrate with external APIs?",
      "🗄️ Do you need to sync with external databases?",
      "📨 Should events trigger Slack/Discord notifications?",
      "📁 Will users upload files or images?",
      "🤖 Do you want AI/ML capabilities?"
    ],
    
    ux: [
      "🎨 Do text fields need rich formatting?",
      "🔀 Should users drag to reorder items?",
      "🔎 Should search show suggestions as you type?",
      "📝 Do forms need conditional fields or wizards?",
      "📸 Will users crop or edit images?",
      "📍 Do you need maps or location features?",
      "📈 Should data have charts/visualizations?"
    ]
  };
  
  // Map answers to specific implementations
  const featureImplementations = {
    "audit trails": {
      tech: "Refine useAuditLog + Supabase triggers",
      effort: "2-3 hours",
      value: "High for compliance"
    },
    "real-time": {
      tech: "Supabase Realtime + Refine liveMode",
      effort: "3-4 hours",
      value: "High for collaboration"
    },
    "import/export": {
      tech: "Refine useImport/useExport hooks",
      effort: "4-5 hours",
      value: "High for data management"
    },
    "virtual scrolling": {
      tech: "@tanstack/virtual + Ant Table",
      effort: "3-4 hours",
      value: "Critical for 1000+ rows"
    },
    "rich text": {
      tech: "Lexical or TipTap editor",
      effort: "4-6 hours",
      value: "Medium for content"
    },
    "file upload": {
      tech: "Supabase Storage + policies",
      effort: "3-4 hours",
      value: "High if needed"
    },
    "webhooks": {
      tech: "Next.js API routes + verification",
      effort: "2-3 hours",
      value: "High for integrations"
    },
    "ai search": {
      tech: "pgvector + OpenAI embeddings",
      effort: "6-8 hours",
      value: "High for UX"
    }
  };
  
  return {
    questions: featureQuestions,
    implementations: featureImplementations,
    recommendation: generateRecommendation(request)
  };
}
```

#### Technical Expertise
- **System Design**
  - Microservices vs monolith decisions
  - Database schema design
  - API architecture (REST/GraphQL)
  - Event-driven architectures
  - Caching strategies
  - Feature capability assessment

- **Requirements Engineering**
  - User story creation
  - Acceptance criteria definition
  - Non-functional requirements
  - Dependency mapping
  - Risk assessment

- **Task Decomposition**
  - Epic breakdown
  - Story point estimation
  - Dependency identification
  - Critical path analysis
  - Sprint planning

#### Decision Matrix
```typescript
const archDecisions = {
  // Architecture Style
  architectureStyle: (requirements: Requirements) => {
    if (requirements.includes('real-time')) return 'event-driven';
    if (requirements.includes('complex-workflows')) return 'orchestrated';
    if (requirements.includes('simple-crud')) return 'rest-based';
    return 'hybrid';
  },

  // Data Storage Strategy
  dataStrategy: (dataType: string, volume: number) => {
    if (dataType === 'rdf-triples') return 'graph-optimized';
    if (dataType === 'documents') return 'document-store';
    if (volume > 1000000) return 'partitioned';
    return 'relational';
  },

  // Feature Complexity
  estimateComplexity: (feature: Feature) => {
    const factors = {
      ui_components: feature.screens * 2,
      api_endpoints: feature.endpoints * 3,
      data_models: feature.models * 2,
      integrations: feature.integrations * 5,
      workflows: feature.workflows * 4
    };
    const total = Object.values(factors).reduce((a, b) => a + b, 0);
    
    if (total > 40) return 'epic';
    if (total > 20) return 'large';
    if (total > 10) return 'medium';
    return 'small';
  },

  // Testing Strategy
  testingApproach: (feature: Feature) => {
    if (feature.type === 'critical-path') return 'comprehensive';
    if (feature.type === 'experimental') return 'minimal';
    if (feature.type === 'user-facing') return 'e2e-focused';
    return 'balanced';
  }
};
```

### Feature Discovery Conversation Template
```typescript
// How Architecture Designer interacts with user
async function interactiveFeatureDiscovery(request: string) {
  // Step 1: Initial understanding
  const response = `
I understand you want to build ${feature}. Let me help you leverage the full capabilities of our tech stack!

Based on this feature, I can enable several powerful capabilities. Please let me know which ones you'd like:

**📊 Data Management**
□ Audit trails - Track all changes for compliance
□ Real-time updates - See changes as they happen
□ Import/Export - Bulk CSV/Excel operations
□ Advanced filters - Save and share filter presets
□ Bulk actions - Select multiple items for operations

**🚀 Performance**
□ Virtual scrolling - Handle 10,000+ rows smoothly
□ Infinite scroll - Load more as users scroll
□ Optimistic updates - Instant UI feedback
□ Smart caching - Reduce server calls

**👥 Collaboration**
□ Role-based access - Different permissions per role
□ Approval workflows - Review before publishing
□ Comments/Notes - Collaborate on items
□ Email notifications - Alert users of changes
□ Version history - Track all modifications

**✨ User Experience**
□ Rich text editing - Format descriptions
□ Drag to reorder - Rearrange items visually
□ Search suggestions - Autocomplete as you type
□ Multi-step forms - Guide users through complex inputs
□ File uploads - Attach documents or images

Which capabilities would add value to your ${feature}? 
(I can implement each in 2-5 hours using our existing libraries)
`;

  return response;
}

// How CRUD Builder suggests specific implementations
async function suggestImplementations(selectedFeatures: string[]) {
  const implementations = [];
  
  for (const feature of selectedFeatures) {
    switch(feature) {
      case 'audit-trails':
        implementations.push({
          name: 'Audit Logging',
          implementation: `
// Using Refine's built-in audit log
const { formProps } = useForm({
  meta: {
    audit: {
      action: "create",
      resource: "vocabularies",
      previousData: null
    }
  }
});

// Supabase trigger for audit table
CREATE TRIGGER audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON vocabularies
FOR EACH ROW EXECUTE FUNCTION audit_changes();
          `,
          effort: '2 hours',
          documentation: 'https://refine.dev/docs/guides-concepts/audit-logs/'
        });
        break;
        
      case 'real-time':
        implementations.push({
          name: 'Real-time Updates',
          implementation: `
// Enable real-time in useTable
const { tableProps } = useTable({
  resource: "vocabularies",
  liveMode: "auto", // Automatically refresh on changes
  onLiveEvent: (event) => {
    notification.info({
      message: \`\${event.type} by \${event.payload.user}\`
    });
  }
});

// Supabase Realtime setup
const channel = supabase
  .channel('vocabularies-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'vocabularies'
  }, handleRealtimeEvent)
  .subscribe();
          `,
          effort: '3 hours',
          documentation: 'https://refine.dev/docs/guides-concepts/realtime/'
        });
        break;
        
      case 'import-export':
        implementations.push({
          name: 'Import/Export',
          implementation: `
// Export button with useExport
const { triggerExport } = useExport({
  resource: "vocabularies",
  mapData: (item) => ({
    ...item,
    created_at: new Date(item.created_at).toLocaleDateString()
  }),
  filename: "vocabularies-export"
});

// Import button with useImport
const { inputProps, isLoading } = useImport({
  resource: "vocabularies",
  mapData: (data) => validateAndTransform(data),
  onFinish: (result) => {
    notification.success({
      message: \`Imported \${result.succeeded} items\`
    });
  }
});
          `,
          effort: '4 hours',
          documentation: 'https://refine.dev/docs/guides-concepts/import-export/'
        });
        break;
    }
  }
  
  return implementations;
}
```

### PRD Generation Template
```typescript
// Architecture Designer creates comprehensive PRDs with selected features
async function generatePRD(featureRequest: string, selectedCapabilities: string[]) {
  // Analyze project context
  const projectContext = await analyzeProjectGoals();
  
  // Consult existing architecture
  const existingArch = await consultSystemDesignDocs();
  
  // Generate PRD structure
  return `
# Product Requirements Document: ${featureName}

## 1. Executive Summary
${summary}

## 2. User Stories
As a ${userRole}, I want to ${userGoal} so that ${userBenefit}

### Acceptance Criteria
- [ ] ${criteria1}
- [ ] ${criteria2}
- [ ] ${criteria3}

## 3. System Architecture

### Data Model
\`\`\`typescript
// Zod contracts
const ${EntityName}Contract = z.object({
  id: z.string().uuid(),
  ${fields}
});
\`\`\`

### API Design
- GET /api/${resource} - List with pagination
- GET /api/${resource}/:id - Get single
- POST /api/${resource} - Create
- PATCH /api/${resource}/:id - Update
- DELETE /api/${resource}/:id - Soft delete

### Database Schema
\`\`\`sql
CREATE TABLE ${tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ${columns},
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_${tableName}_status ON ${tableName}(status);
${additionalIndexes}

-- RLS Policies
${rlsPolicies}
\`\`\`

## 4. Technical Implementation

### Phase 1: Foundation (${foundationHours}h)
- [ ] Create Zod contracts
- [ ] Set up database migrations
- [ ] Create MSW mock handlers
- [ ] Write initial test suite

### Phase 2: Core Features (${coreHours}h)
- [ ] Implement CRUD operations
- [ ] Add validation layer
- [ ] Create UI components
- [ ] Integrate with data provider

### Phase 3: Advanced Features (${advancedHours}h)
- [ ] Add ${advancedFeature1}
- [ ] Implement ${advancedFeature2}
- [ ] Create ${advancedFeature3}

### Phase 4: Polish (${polishHours}h)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Documentation
- [ ] E2E test coverage

## 5. Dependencies
- Depends on: ${dependencies}
- Blocks: ${blockedFeatures}
- Integration points: ${integrations}

## 6. Risks & Mitigations
${riskAnalysis}

## 7. Success Metrics
- ${metric1}
- ${metric2}
- ${metric3}

## 8. Timeline
- Start: ${startDate}
- Phase 1 Complete: ${phase1Date}
- Phase 2 Complete: ${phase2Date}
- Phase 3 Complete: ${phase3Date}
- Production Ready: ${endDate}
`;
}
```

### Task Decomposition Template
```typescript
// Architecture Designer breaks down features into tasks
async function decomposeFeature(prd: PRD): TaskList {
  const tasks = [];
  
  // Foundation tasks (always needed)
  tasks.push(
    { id: 'contracts', name: 'Define Zod contracts', points: 2, dependencies: [] },
    { id: 'migrations', name: 'Create database migrations', points: 3, dependencies: ['contracts'] },
    { id: 'mocks', name: 'Set up MSW handlers', points: 2, dependencies: ['contracts'] },
    { id: 'tests', name: 'Write test suite', points: 3, dependencies: ['mocks'] }
  );
  
  // API tasks
  if (prd.needs.api) {
    tasks.push(
      { id: 'api-list', name: 'Implement list endpoint', points: 2, dependencies: ['migrations'] },
      { id: 'api-crud', name: 'Implement CRUD endpoints', points: 3, dependencies: ['migrations'] },
      { id: 'api-validation', name: 'Add validation middleware', points: 2, dependencies: ['api-crud'] }
    );
  }
  
  // UI tasks
  if (prd.needs.ui) {
    tasks.push(
      { id: 'ui-list', name: 'Create list component', points: 3, dependencies: ['mocks'] },
      { id: 'ui-form', name: 'Create form component', points: 3, dependencies: ['mocks'] },
      { id: 'ui-integration', name: 'Integrate with Refine', points: 2, dependencies: ['ui-list', 'ui-form'] }
    );
  }
  
  // Advanced features
  if (prd.features.audit) {
    tasks.push({ id: 'audit', name: 'Add audit logging', points: 2, dependencies: ['api-crud'] });
  }
  
  if (prd.features.realtime) {
    tasks.push({ id: 'realtime', name: 'Implement realtime updates', points: 3, dependencies: ['api-crud'] });
  }
  
  if (prd.features.import) {
    tasks.push({ id: 'import', name: 'Create import job', points: 5, dependencies: ['api-crud'] });
  }
  
  return {
    tasks,
    totalPoints: tasks.reduce((sum, t) => sum + t.points, 0),
    criticalPath: calculateCriticalPath(tasks),
    phases: groupTasksIntoPhases(tasks)
  };
}
```

### Architecture Validation
```typescript
// Ensure architectural consistency
async function validateArchitecture(proposal: Architecture) {
  const violations = [];
  
  // Check against Prime Directive
  if (!proposal.contracts) {
    violations.push('Missing Zod contracts (Prime Directive violation)');
  }
  
  if (!proposal.mockFirst) {
    violations.push('No mock-first approach (Prime Directive violation)');
  }
  
  if (!proposal.dataProvider) {
    violations.push('Direct API calls instead of dataProvider (Prime Directive violation)');
  }
  
  // Check against project constraints
  if (proposal.database !== 'supabase') {
    violations.push('Must use Supabase for database');
  }
  
  if (proposal.auth !== 'clerk') {
    violations.push('Must use Clerk for authentication');
  }
  
  // Check RDF/semantic requirements
  if (proposal.involves.rdf && !proposal.rdfStrategy) {
    violations.push('Missing RDF/SKOS handling strategy');
  }
  
  return {
    valid: violations.length === 0,
    violations,
    recommendations: generateRecommendations(violations)
  };
}
```

### Context7 Invocation Template
```typescript
// Architecture Designer checks patterns and best practices
async function designArchitecture(feature: string) {
  // Check architectural patterns
  const patterns = await context7.query({
    library: "/vercel/next.js",
    query: "App Router architecture API routes middleware",
    includeExamples: true
  });
  
  // Check data layer patterns
  const dataPatterns = await context7.query({
    library: "/supabase/supabase",
    query: "RLS policies Edge Functions database design",
    includeExamples: true
  });
  
  // Check state management
  const statePatterns = await context7.query({
    library: "/tanstack/query",
    query: "query invalidation caching strategies",
    includeExamples: true
  });
  
  return createArchitecture({
    patterns,
    dataPatterns,
    statePatterns,
    projectConstraints: archDesignerSources.projectGoals.technical_constraints
  });
}
```

---

## MCP Tool Usage Patterns for All Agents

### Documentation Priority Order

**EVERY agent must follow this documentation hierarchy:**

1. **Official Framework Documentation** (via `webfetch`)
   - Refine.dev docs for CRUD features
   - Supabase docs for database features
   - Next.js docs for routing/API routes
   - Framework-specific best practices

2. **Context7 MCP** (for library APIs)
   - Current API signatures
   - Breaking changes
   - Version compatibility
   - Code examples

3. **Project Documentation** (local files)
   - AGENTS.md for project conventions
   - System design docs
   - Existing patterns in codebase

### The Documentation First Principle

**EVERY agent must follow this pattern:**

1. **Check Official Docs** - Use `webfetch` for framework documentation
2. **Check Current APIs** - Use Context7 for library documentation  
3. **Use Library IDs** - Always use specific Context7 library IDs
4. **Include Examples** - Request examples in all queries
5. **Verify Versions** - Ensure compatibility with current versions

### Example: CRUD Builder Consulting Refine.dev Docs

```typescript
// CRUD Builder MUST check Refine.dev official docs first
async function crudBuilderWorkflow(entity: string, features: Features) {
  // Step 1: Check official Refine.dev documentation
  const refineDocs = {
    // Get Ant Design integration patterns
    antDesignPatterns: await webfetch({
      url: "https://refine.dev/docs/ui-integrations/ant-design/components/crud/list/",
      format: "markdown"
    }),
    
    // Get audit log implementation if needed
    auditLogs: features.audit ? await webfetch({
      url: "https://refine.dev/docs/guides-concepts/audit-logs/",
      format: "markdown"
    }) : null,
    
    // Get realtime patterns if needed
    realtime: features.realtime ? await webfetch({
      url: "https://refine.dev/docs/guides-concepts/realtime/",
      format: "markdown"
    }) : null,
    
    // Always check access control
    accessControl: await webfetch({
      url: "https://refine.dev/docs/guides-concepts/access-control/",
      format: "markdown"
    })
  };
  
  // Step 2: Extract patterns and examples from docs
  const patterns = extractPatternsFromDocs(refineDocs);
  
  // Step 3: Get current API details from Context7
  const apiDetails = await context7.query({
    library: "/refinedev/refine",
    query: "useTable useForm useList current API",
    includeExamples: true
  });
  
  // Step 4: Generate code following official patterns
  return generateCode({
    officialPatterns: patterns,      // Primary source
    currentAPIs: apiDetails,         // API details
    entity,
    features
  });
}
```

### Universal Query Pattern

```typescript
// This pattern should be used by EVERY agent before code generation
async function beforeCodeGeneration(task: Task) {
  // Step 1: Identify required libraries
  const requiredLibs = identifyRequiredLibraries(task);
  
  // Step 2: Query each library for current patterns
  const currentDocs = await Promise.all(
    requiredLibs.map(lib => 
      context7.query({
        library: lib.id,
        query: lib.topics.join(" "),
        includeExamples: true,
        version: "latest" // Always get latest unless specified
      })
    )
  );
  
  // Step 3: Extract patterns and breaking changes
  const patterns = extractPatterns(currentDocs);
  const breakingChanges = identifyBreakingChanges(currentDocs);
  
  // Step 4: Generate code using ONLY current documentation
  return generateCode({
    patterns,
    avoidDeprecated: breakingChanges,
    task
  });
}
```

### Common Context7 Queries by Task Type

```typescript
// CRUD Operations
const crudQueries = [
  { lib: "/refinedev/refine", query: "useTable useForm dataProvider" },
  { lib: "/ant-design/ant-design", query: "Table Form Modal Button" },
  { lib: "/tanstack/query", query: "useQuery useMutation queryClient" }
];

// Async Jobs
const jobQueries = [
  { lib: "/supabase/supabase", query: "Edge Functions Realtime" },
  { lib: "/taskforcesh/bullmq", query: "Queue Worker Job" },
  { lib: "/nodejs/node", query: "streams worker_threads" }
];

// Testing
const testQueries = [
  { lib: "/mswjs/msw", query: "http HttpResponse handlers" },
  { lib: "/vitest-dev/vitest", query: "describe test expect vi" },
  { lib: "/testing-library/react-testing-library", query: "render screen userEvent" }
];

// Performance
const perfQueries = [
  { lib: "/facebook/react", query: "memo useCallback useMemo lazy" },
  { lib: "/tanstack/virtual", query: "useVirtualizer" },
  { lib: "/vitejs/vite", query: "rollupOptions build optimization" }
];
```

### Handling Version-Specific Features

```typescript
// Agents must be aware of version differences
const versionAwareQuery = async (library: string, feature: string) => {
  // First, check if feature exists in current version
  const featureCheck = await context7.query({
    library,
    query: `${feature} availability version`,
    includeExamples: false
  });
  
  if (!featureCheck.available) {
    // Get alternative for current version
    const alternative = await context7.query({
      library,
      query: `${feature} alternative migration`,
      includeExamples: true
    });
    return alternative;
  }
  
  // Get current implementation
  return await context7.query({
    library,
    query: feature,
    includeExamples: true
  });
};
```

### Critical Version Checks

```typescript
// These MUST be checked for every project
const criticalVersions = {
  react: {
    library: "/facebook/react",
    check: "React 19 concurrent features Suspense",
    breaking: ["componentWillMount", "componentWillReceiveProps", "findDOMNode"]
  },
  nextjs: {
    library: "/vercel/next.js",
    check: "App Router Pages Router migration",
    breaking: ["getInitialProps", "_app.js", "_document.js"]
  },
  antd: {
    library: "/ant-design/ant-design",
    check: "Ant Design 5 theming ConfigProvider",
    breaking: ["moment", "less variables", "Form.create"]
  },
  refine: {
    library: "/refinedev/refine",
    check: "Refine v4 dataProvider hooks",
    breaking: ["useDataProvider", "IDataContext"]
  },
  supabase: {
    library: "/supabase/supabase",
    check: "Supabase client v2 auth",
    breaking: ["auth.session", "auth.user", "auth.signIn"]
  }
};

// Every agent MUST run this check
async function checkCriticalVersions() {
  for (const [name, config] of Object.entries(criticalVersions)) {
    const result = await context7.query({
      library: config.library,
      query: config.check,
      includeExamples: true
    });
    
    // Warn about deprecated patterns
    for (const deprecated of config.breaking) {
      if (codeContains(deprecated)) {
        console.warn(`⚠️ ${name}: "${deprecated}" is deprecated/broken in current version`);
      }
    }
  }
}
```

### Error Handling for MCP Queries

```typescript
// Robust error handling for Context7 queries
async function safeContext7Query(library: string, query: string) {
  try {
    const result = await context7.query({
      library,
      query,
      includeExamples: true,
      timeout: 10000 // 10 second timeout
    });
    
    if (!result || result.error) {
      // Fallback to basic patterns (but warn user)
      console.warn(`⚠️ Could not fetch current docs for ${library}`);
      console.warn("Using fallback patterns - may be outdated!");
      return getFallbackPatterns(library);
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to query ${library}:`, error);
    // Continue with caution
    return getFallbackPatterns(library);
  }
}
```

### Caching Context7 Responses

```typescript
// Cache responses to avoid repeated queries
const context7Cache = new Map<string, CachedResponse>();

async function cachedContext7Query(library: string, query: string) {
  const cacheKey = `${library}:${query}`;
  const cached = context7Cache.get(cacheKey);
  
  // Use cache if less than 1 hour old
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.data;
  }
  
  // Fetch fresh data
  const fresh = await context7.query({
    library,
    query,
    includeExamples: true
  });
  
  // Update cache
  context7Cache.set(cacheKey, {
    data: fresh,
    timestamp: Date.now()
  });
  
  return fresh;
}
```

### Integration with Task Tool

```typescript
// How agents use Context7 within Task tool
async function enhancedTask(params: TaskParams) {
  // Pre-fetch all required documentation
  const docs = await prefetchDocumentation(params.subagent_type);
  
  // Include docs in the agent prompt
  const enhancedPrompt = `
    ${params.prompt}
    
    IMPORTANT: Use these current documentation patterns:
    ${JSON.stringify(docs, null, 2)}
    
    DO NOT use outdated patterns. Follow the examples above.
  `;
  
  return task({
    ...params,
    prompt: enhancedPrompt
  });
}
```

---

## Implementation with Current Task Tool

### Step 1: Create Subagent Prompt Templates

```typescript
// developer_notes/subagent-prompts/crud-builder.md
const crudBuilderPrompt = `
You are a CRUD Builder specialist with deep expertise in Refine.dev, Ant Design, and Supabase.

Your task: Create a complete CRUD interface for ${entity}.

Requirements:
- Contract: ${contract}
- Operations: ${operations}
- Expected rows: ${rowCount}
- Update frequency: ${updateFrequency}

You must:
1. Generate resource configuration with metadata
2. Use Inferencer where appropriate
3. Implement virtual scrolling if rows > 100
4. Add proper caching based on update frequency
5. Include contract validation
6. Generate Supabase RLS policies
7. Create comprehensive tests

Output all code with explanations for customization points.
`;
```

### Step 2: Invoke Subagents via Task Tool

```typescript
// In your main agent code
async function handleFeatureRequest(prompt: string) {
  // Detect feature type
  const featureType = detectFeatureType(prompt);
  
  if (featureType === 'crud') {
    // Invoke CRUD builder
    const crudResult = await task({
      description: "Build CRUD interface",
      subagent_type: "general", // Until we have specific types
      prompt: crudBuilderPrompt
    });
    
    // Invoke test architect
    const testResult = await task({
      description: "Design test strategy",
      subagent_type: "general",
      prompt: testArchitectPrompt
    });
    
    // Combine results
    return combineSubagentResults([crudResult, testResult]);
  }
}
```

### Step 3: Parallel Subagent Execution

```typescript
async function buildCompleteFeature(requirements: Requirements) {
  // Launch all relevant subagents in parallel
  const tasks = await Promise.all([
    // CRUD Interface
    task({
      description: "Design CRUD interface",
      subagent_type: "general",
      prompt: generateCrudPrompt(requirements)
    }),
    
    // Job Processing (if needed)
    requirements.hasJobs && task({
      description: "Design job architecture",
      subagent_type: "general",
      prompt: generateJobPrompt(requirements)
    }),
    
    // Test Strategy
    task({
      description: "Create test strategy",
      subagent_type: "general",
      prompt: generateTestPrompt(requirements)
    }),
    
    // Performance Analysis
    task({
      description: "Optimize performance",
      subagent_type: "general",
      prompt: generatePerfPrompt(requirements)
    })
  ].filter(Boolean));
  
  return coordinateResults(tasks);
}
```

---

## Coordination Protocol

### Message Format

```typescript
interface SubagentMessage {
  id: string;
  type: 'request' | 'response' | 'status' | 'error';
  source: string;
  target: string;
  timestamp: string;
  payload: any;
}
```

### Coordination Flow

```typescript
class FeatureCoordinator {
  private agents: Map<string, SubagentInterface>;
  private messageQueue: Queue<SubagentMessage>;
  private results: Map<string, any>;
  
  async coordinateFeature(requirements: Requirements) {
    // Phase 1: Planning
    const plan = await this.planPhase(requirements);
    
    // Phase 2: Parallel Execution
    const tasks = this.createTasks(plan);
    const results = await this.executeTasks(tasks);
    
    // Phase 3: Integration
    const integrated = await this.integrateResults(results);
    
    // Phase 4: Validation
    const validated = await this.validateIntegration(integrated);
    
    return validated;
  }
  
  private async planPhase(requirements: Requirements) {
    // Determine which agents are needed
    const agents = this.selectAgents(requirements);
    
    // Create execution plan
    return {
      agents,
      dependencies: this.analyzeDependencies(agents),
      parallelizable: this.identifyParallelTasks(agents),
      sequential: this.identifySequentialTasks(agents)
    };
  }
  
  private async executeTasks(tasks: Task[]) {
    // Group by execution strategy
    const parallel = tasks.filter(t => t.parallel);
    const sequential = tasks.filter(t => !t.parallel);
    
    // Execute parallel tasks
    const parallelResults = await Promise.all(
      parallel.map(t => this.executeTask(t))
    );
    
    // Execute sequential tasks
    const sequentialResults = [];
    for (const task of sequential) {
      const result = await this.executeTask(task);
      sequentialResults.push(result);
    }
    
    return [...parallelResults, ...sequentialResults];
  }
  
  private async integrateResults(results: any[]) {
    // Combine code from different agents
    const code = this.mergeCode(results);
    
    // Resolve conflicts
    const resolved = this.resolveConflicts(code);
    
    // Ensure compatibility
    const compatible = this.ensureCompatibility(resolved);
    
    return compatible;
  }
}
```

### Communication Patterns

#### 1. Request-Response Pattern
```typescript
// Main → Subagent
const request: SubagentMessage = {
  id: generateId(),
  type: 'request',
  source: 'main',
  target: 'crud-builder',
  timestamp: new Date().toISOString(),
  payload: {
    action: 'generate-list',
    entity: 'vocabulary',
    contract: VocabularyContract
  }
};

// Subagent → Main
const response: SubagentMessage = {
  id: request.id,
  type: 'response',
  source: 'crud-builder',
  target: 'main',
  timestamp: new Date().toISOString(),
  payload: {
    code: generatedCode,
    dependencies: requiredDeps,
    customizations: neededCustomizations
  }
};
```

#### 2. Broadcast Pattern
```typescript
// Main → All Subagents
const broadcast: SubagentMessage = {
  id: generateId(),
  type: 'status',
  source: 'main',
  target: '*',
  timestamp: new Date().toISOString(),
  payload: {
    event: 'requirements-updated',
    data: updatedRequirements
  }
};
```

#### 3. Inter-Agent Communication
```typescript
// CRUD Builder → Test Architect
const interAgent: SubagentMessage = {
  id: generateId(),
  type: 'request',
  source: 'crud-builder',
  target: 'test-architect',
  timestamp: new Date().toISOString(),
  payload: {
    action: 'generate-tests',
    components: generatedComponents,
    contracts: usedContracts
  }
};
```

### Conflict Resolution

```typescript
class ConflictResolver {
  resolve(conflicts: Conflict[]): Resolution {
    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'naming':
          // Prefer consistent naming convention
          return this.resolveNaming(conflict);
          
        case 'import':
          // Merge imports, remove duplicates
          return this.mergeImports(conflict);
          
        case 'implementation':
          // Choose based on performance metrics
          return this.chooseBestImplementation(conflict);
          
        case 'styling':
          // Defer to design system
          return this.applyDesignSystem(conflict);
          
        default:
          // Flag for human review
          return this.flagForReview(conflict);
      }
    }
  }
}
```

### Quality Assurance

```typescript
class QualityGate {
  async validate(feature: GeneratedFeature): Promise<ValidationResult> {
    const checks = await Promise.all([
      this.checkTypeScript(feature),
      this.checkLinting(feature),
      this.checkTests(feature),
      this.checkAccessibility(feature),
      this.checkPerformance(feature),
      this.checkSecurity(feature)
    ]);
    
    return {
      passed: checks.every(c => c.passed),
      issues: checks.flatMap(c => c.issues),
      suggestions: this.generateSuggestions(checks)
    };
  }
}
```

## Benefits of This Architecture

### 1. **Specialization = Quality**
Each agent is an expert, producing better code in its domain

### 2. **Parallelization = Speed**
Multiple agents work simultaneously, reducing development time

### 3. **Consistency = Maintainability**
Each agent follows established patterns consistently

### 4. **Coordination = Completeness**
The coordinator ensures nothing is missed

### 5. **Flexibility = Adaptability**
Easy to add new agents or modify existing ones

## Practical Invocation Examples

### Example 0: Interactive Feature Discovery

```typescript
// User: "I need to add namespace management to the system"

async function interactiveNamespaceFeature() {
  // STEP 1: Architecture Designer discovers opportunities
  const discovery = await task({
    description: "Discover feature opportunities",
    subagent_type: "general",
    prompt: `
      As arch-designer expert:
      
      User wants: Namespace management for RDF/SKOS
      
      Ask the user about these capabilities:
      1. Data Management:
         - Should we track who changed namespaces and when? (Audit trails)
         - Should users see updates in real-time when others edit? (Realtime)
         - Do you need bulk import from prefix.cc or CSV? (Import/Export)
         - Should users save complex search filters? (Advanced filtering)
      
      2. Collaboration:
         - Do namespaces need approval before going live? (Workflow)
         - Should changes notify interested users? (Notifications)
         - Do you need comments on namespace proposals? (Comments)
      
      3. Performance:
         - Will you have 1000+ namespaces? (Virtual scrolling)
         - Should the list load more on scroll? (Infinite scroll)
      
      4. Integration:
         - Sync with GitHub namespace definitions? (GitHub)
         - Notify external systems of changes? (Webhooks)
         - Upload namespace documentation? (File storage)
      
      Present these as checkboxes the user can select.
    `
  });
  
  // User responds: "I want audit trails, real-time, import from prefix.cc, 
  //                approval workflow, and we'll have 5000+ namespaces"
  
  // STEP 2: CRUD Builder provides specific implementation
  const implementation = await task({
    description: "Design with selected features",
    subagent_type: "general",
    prompt: `
      As crud-builder expert:
      
      Entity: Namespace
      Selected features:
      - Audit trails (compliance tracking)
      - Real-time updates (collaboration)
      - Import from prefix.cc (bulk operations)
      - Approval workflow (status management)
      - Virtual scrolling (5000+ items)
      
      Provide:
      1. Refine.dev implementation with these features
      2. Time estimate for each feature
      3. Code examples using our libraries
      4. Links to relevant documentation
      
      Show how to:
      - Use useAuditLog for tracking changes
      - Enable liveMode: "auto" for real-time
      - Implement useImport with prefix.cc adapter
      - Add status field with approval states
      - Use @tanstack/virtual for scrolling
    `
  });
  
  // STEP 3: Show the user what they're getting
  const summary = `
    Based on your selections, here's what I'll implement:
    
    ✅ **Audit Trails** (2 hours)
       - Track all changes with user and timestamp
       - Using Refine's useAuditLog + Supabase triggers
       - Compliance-ready audit history
    
    ✅ **Real-time Updates** (3 hours)
       - Live updates when others make changes
       - Using Supabase Realtime + Refine liveMode
       - Collaborative editing experience
    
    ✅ **Prefix.cc Import** (4 hours)
       - Bulk import namespaces from prefix.cc
       - Using custom job with progress tracking
       - Validation and duplicate detection
    
    ✅ **Approval Workflow** (3 hours)
       - Draft → Review → Approved states
       - Role-based approval permissions
       - Email notifications on status change
    
    ✅ **Virtual Scrolling** (2 hours)
       - Handle 5000+ namespaces smoothly
       - Using @tanstack/virtual with Ant Table
       - Maintains 60fps scrolling performance
    
    **Total estimate: 14 hours**
    
    This leverages existing Refine.dev and Supabase features,
    so we're not building from scratch!
  `;
  
  return {
    discovery,
    implementation,
    summary
  };
}
```

### Example 1: Architecture-First Development

```typescript
// User request: "I need to add namespace management to the system"

// STEP 1: Architecture Designer creates the PRD and plan
async function startWithArchitecture() {
  const architecture = await task({
    description: "Design namespace feature",
    subagent_type: "general",
    prompt: `
      As arch-designer expert:
      Feature: RDF Namespace Management
      Context: IFLA Standards project needs to manage RDF namespaces
      Users: Metadata specialists, librarians
      
      Create:
      1. Complete PRD with user stories
      2. System architecture aligned with project goals
      3. Task breakdown with dependencies
      4. Risk analysis and mitigation
      
      Consider:
      - Must integrate with existing vocabulary management
      - Needs import from prefix.cc and LOV
      - Requires approval workflow
      - Must support RDF/SKOS standards
    `
  });
  
  // STEP 2: Architecture validation
  const validation = await task({
    description: "Validate architecture",
    subagent_type: "general",
    prompt: `
      As arch-designer expert:
      Validate this architecture against:
      - Prime Directive requirements
      - IFLA project constraints
      - Technical stack limitations
      - Security requirements
      
      Architecture: ${architecture}
    `
  });
  
  // STEP 3: Coordinate specialized agents based on architecture
  const implementation = await Promise.all([
    // Database design based on architecture
    task({
      subagent_type: "general",
      description: "Design database",
      prompt: `
        As db-migrator expert:
        Based on architecture: ${architecture.dataModel}
        Create migrations for namespace management
      `
    }),
    
    // CRUD interface based on PRD
    task({
      subagent_type: "general",
      description: "Design CRUD",
      prompt: `
        As crud-builder expert:
        Based on PRD: ${architecture.prd}
        Create namespace CRUD with Refine.dev
      `
    }),
    
    // Import system based on requirements
    task({
      subagent_type: "general",
      description: "Design import",
      prompt: `
        As job-orchestrator expert:
        Based on requirements: ${architecture.importRequirements}
        Design prefix.cc import system
      `
    }),
    
    // Test strategy based on risks
    task({
      subagent_type: "general",
      description: "Design tests",
      prompt: `
        As test-architect expert:
        Based on risks: ${architecture.risks}
        Create comprehensive test strategy
      `
    })
  ]);
  
  return {
    prd: architecture.prd,
    tasks: architecture.taskBreakdown,
    implementation
  };
}
```

### Example 1: Building a Complete Vocabulary Management System

```typescript
// User request: "I need a vocabulary management system with import/export"

// Main agent coordinates multiple subagents
async function buildVocabularySystem() {
  // Phase 1: Design and Architecture
  const [crudDesign, migrationPlan, securityAudit] = await Promise.all([
    task({
      description: "Design vocabulary CRUD",
      subagent_type: "general",
      prompt: `
        As crud-builder expert:
        Entity: Vocabulary
        Fields: name, uri, prefix, description, status, version
        Features: search, filter by status, bulk edit, version history
        Expected rows: 10,000+
        Special: URI validation, prefix uniqueness, approval workflow
      `
    }),
    
    task({
      description: "Create database schema",
      subagent_type: "general",
      prompt: `
        As db-migrator expert:
        Table: vocabularies
        Indexes: uri (unique), prefix (unique), name (gin for search)
        RLS: Editors can create/edit, Admins can approve/delete
        Audit: Full audit trail needed
      `
    }),
    
    task({
      description: "Security review",
      subagent_type: "general",
      prompt: `
        As security-auditor expert:
        Feature: Vocabulary management
        Concerns: URI injection, XSS in descriptions, unauthorized access
        Compliance: GDPR for user-submitted content
      `
    })
  ]);

  // Phase 2: Implementation
  const [importJob, exportJob, tests] = await Promise.all([
    task({
      description: "Design import system",
      subagent_type: "general",
      prompt: `
        As job-orchestrator expert:
        Job: CSV/RDF vocabulary import
        Size: Up to 50,000 terms
        Processing: Validate URIs, check duplicates, batch insert
        Progress: Real-time updates per 100 items
      `
    }),
    
    task({
      description: "Design export system",
      subagent_type: "general",
      prompt: `
        As job-orchestrator expert:
        Job: Export vocabularies to RDF/CSV/JSON-LD
        Features: Filter before export, streaming for large datasets
        Formats: Turtle, N-Triples, CSV, JSON-LD
      `
    }),
    
    task({
      description: "Create test suite",
      subagent_type: "general",
      prompt: `
        As test-architect expert:
        Feature: Vocabulary management with import/export
        Coverage: 90% minimum
        E2E: Full CRUD workflow, import/export cycles
        Performance: Test with 10,000 items
      `
    })
  ]);

  // Phase 3: Documentation and Optimization
  const [docs, performance] = await Promise.all([
    task({
      description: "Generate documentation",
      subagent_type: "general",
      prompt: `
        As docs-generator expert:
        Feature: Vocabulary Management API
        Include: API reference, user guide, import format specs
        Examples: CRUD operations, batch import, webhook integration
      `
    }),
    
    task({
      description: "Optimize performance",
      subagent_type: "general",
      prompt: `
        As perf-optimizer expert:
        Component: Vocabulary list with 10,000+ items
        Goals: <100ms load time, smooth scrolling, efficient search
        Consider: Virtual scrolling, search debouncing, caching strategy
      `
    })
  ]);

  return coordinateResults([
    crudDesign, migrationPlan, securityAudit,
    importJob, exportJob, tests,
    docs, performance
  ]);
}
```

### Example 2: GitHub Team Sync with RBAC

```typescript
// User request: "Sync GitHub teams to our RBAC system"

async function setupGitHubSync() {
  // Parallel execution of specialized tasks
  const results = await Promise.all([
    // GitHub integration design
    task({
      description: "Design GitHub sync",
      subagent_type: "general",
      prompt: `
        As github-syncer expert:
        Sync: Teams and members from GitHub org
        Direction: GitHub → Database (one-way)
        Frequency: Webhook + hourly reconciliation
        Mapping: GitHub team → RBAC role, team maintainer → admin
        Handle: Member additions, removals, team renames
      `
    }),
    
    // Job processing for sync
    task({
      description: "Create sync job",
      subagent_type: "general",
      prompt: `
        As job-orchestrator expert:
        Job: GitHub team synchronization
        Steps: Fetch teams, fetch members, compare with DB, apply changes
        Concurrency: Process teams in parallel, max 5 concurrent
        Error handling: Retry on rate limit, report conflicts
      `
    }),
    
    // Database schema for teams
    task({
      description: "Design team storage",
      subagent_type: "general",
      prompt: `
        As db-migrator expert:
        Tables: github_teams, github_members, team_role_mappings
        Relationships: Many-to-many team-members
        Indexes: github_id (unique), slug, synchronized_at
        Constraints: Cascade delete on team removal
      `
    }),
    
    // Security audit
    task({
      description: "Audit GitHub integration",
      subagent_type: "general",
      prompt: `
        As security-auditor expert:
        Integration: GitHub webhook + API
        Verify: Webhook signatures, token permissions, rate limiting
        Protect: API keys, prevent privilege escalation
        Audit: Log all permission changes
      `
    }),
    
    // Test strategy
    task({
      description: "Test GitHub sync",
      subagent_type: "general",
      prompt: `
        As test-architect expert:
        Test: GitHub team synchronization
        Mock: GitHub API responses, webhook payloads
        Scenarios: New team, removed member, renamed team, API failure
        E2E: Full sync cycle with real test org
      `
    })
  ]);

  return integrateGitHubSyncResults(results);
}
```

### Example 3: Performance Crisis Response

```typescript
// User request: "The vocabulary list is extremely slow with 50k items"

async function fixPerformanceIssue() {
  // Phase 1: Diagnosis
  const diagnosis = await task({
    description: "Diagnose performance",
    subagent_type: "general",
    prompt: `
      As perf-optimizer expert:
      Problem: Vocabulary list with 50k items is slow
      Symptoms: Initial load >5s, scrolling laggy, search freezes UI
      Analyze: Render performance, query efficiency, bundle size
      Provide: Specific bottlenecks and measurements
    `
  });

  // Phase 2: Parallel optimization strategies
  const optimizations = await Promise.all([
    task({
      description: "Optimize React rendering",
      subagent_type: "general",
      prompt: `
        As perf-optimizer expert:
        Based on diagnosis: ${diagnosis.renderIssues}
        Implement: Virtual scrolling for 50k items
        Use: @tanstack/react-virtual
        Optimize: Memo strategies, prevent unnecessary re-renders
      `
    }),
    
    task({
      description: "Optimize database queries",
      subagent_type: "general",
      prompt: `
        As db-migrator expert:
        Current query time: ${diagnosis.queryTime}ms
        Add: Covering indexes, materialized view for search
        Optimize: Pagination strategy, use cursor-based pagination
        Implement: Query result caching
      `
    }),
    
    task({
      description: "Optimize search",
      subagent_type: "general",
      prompt: `
        As crud-builder expert:
        Current search: Client-side filtering of 50k items
        Implement: Server-side search with debouncing
        Add: Search suggestions, recent searches cache
        Use: PostgreSQL full-text search
      `
    }),
    
    task({
      description: "Optimize bundle",
      subagent_type: "general",
      prompt: `
        As perf-optimizer expert:
        Current bundle: ${diagnosis.bundleSize}
        Split: Lazy load vocabulary management module
        Optimize: Tree shake unused Ant Design components
        Compress: Enable brotli compression
      `
    })
  ]);

  // Phase 3: Verification
  const verification = await task({
    description: "Verify improvements",
    subagent_type: "general",
    prompt: `
      As test-architect expert:
      Create performance benchmarks:
      - Initial load time < 500ms
      - Search response < 100ms
      - Smooth scrolling at 60fps
      - Memory usage < 100MB
    `
  });

  return {
    diagnosis,
    optimizations,
    verification
  };
}
```

### Example 4: Emergency Security Patch

```typescript
// User request: "Security scan found SQL injection vulnerability"

async function emergencySecurityPatch() {
  // Immediate parallel response
  const [audit, patch, tests, migration] = await Promise.all([
    task({
      description: "Full security audit",
      subagent_type: "general",
      prompt: `
        As security-auditor expert:
        CRITICAL: SQL injection found in search endpoint
        Perform: Complete audit of all database queries
        Check: Input validation, parameterized queries, escaping
        Report: All vulnerable endpoints with severity
      `
    }),
    
    task({
      description: "Create security patch",
      subagent_type: "general",
      prompt: `
        As security-auditor expert:
        Fix: SQL injection in search endpoint
        Implement: Parameterized queries with Zod validation
        Add: Input sanitization, rate limiting, audit logging
        Pattern: Apply same fix to all similar endpoints
      `
    }),
    
    task({
      description: "Create security tests",
      subagent_type: "general",
      prompt: `
        As test-architect expert:
        Test: SQL injection prevention
        Create: Fuzzing tests with malicious inputs
        Verify: All database queries are parameterized
        Add: Security regression tests
      `
    }),
    
    task({
      description: "Update security policies",
      subagent_type: "general",
      prompt: `
        As db-migrator expert:
        Restrict: Database user permissions
        Add: Query audit triggers
        Implement: Stored procedures for complex queries
        Enable: Query logging for forensics
      `
    })
  ]);

  // Deploy hotfix
  const deployment = await task({
    description: "Deploy security fix",
    subagent_type: "general",
    prompt: `
      As docs-generator expert:
      Document: Security incident and fix
      Create: Incident report, fix verification steps
      Update: Security guidelines, code review checklist
      Notify: Generate security advisory
    `
  });

  return {
    vulnerabilities: audit,
    patches: patch,
    verification: tests,
    hardening: migration,
    documentation: deployment
  };
}
```

### Example 5: Using Architecture Designer for Planning

```typescript
// User request: "Help me plan the RDF namespace feature properly"

async function architectureFirstApproach() {
  // Step 1: Get comprehensive architecture and PRD
  const planning = await task({
    description: "Create PRD and architecture",
    subagent_type: "general",
    prompt: `
      As arch-designer expert:
      
      Create comprehensive planning for RDF Namespace Registry:
      
      1. PRD with:
         - User stories for librarians and metadata specialists
         - Acceptance criteria
         - Success metrics
      
      2. Technical Architecture:
         - Data model (with Zod contracts)
         - API design
         - Database schema with RLS
         - Integration points
      
      3. Task Breakdown:
         - Ordered task list with dependencies
         - Story point estimates
         - Critical path identification
         - 4-phase implementation plan
      
      4. Risk Analysis:
         - Technical risks
         - Mitigation strategies
         - Fallback plans
      
      Project context:
      - IFLA Standards management system
      - Must support RDF/SKOS standards
      - Needs prefix.cc integration
      - Requires approval workflows
      - Multi-language support needed
    `
  });
  
  // Step 2: Validate against project constraints
  const validation = await task({
    description: "Validate architecture",
    subagent_type: "general",
    prompt: `
      As arch-designer expert:
      
      Validate this plan against:
      - Prime Directive (contracts, mock-first, dataProvider)
      - Tech stack (Supabase, Next.js 15, Refine.dev)
      - IFLA requirements (RDF support, standards compliance)
      - Security requirements (RBAC, audit logs)
      
      Identify any violations or concerns.
      
      Plan: ${planning}
    `
  });
  
  // Step 3: Get implementation guidance from specialized agents
  const guidance = await Promise.all([
    task({
      description: "CRUD implementation plan",
      subagent_type: "general",
      prompt: `As crud-builder: Review this PRD and provide Refine.dev implementation approach: ${planning.prd}`
    }),
    task({
      description: "Database implementation plan",
      subagent_type: "general",
      prompt: `As db-migrator: Review this schema and provide migration strategy: ${planning.schema}`
    }),
    task({
      description: "Test implementation plan",
      subagent_type: "general",
      prompt: `As test-architect: Review this PRD and provide test strategy: ${planning.prd}`
    })
  ]);
  
  return {
    prd: planning.prd,
    architecture: planning.architecture,
    tasks: planning.taskBreakdown,
    validation: validation,
    implementationGuidance: guidance
  };
}
```

### Example 6: Creating Complete Documentation Package

```typescript
// User: "We're launching the vocabulary feature. Create full documentation."

async function createComprehensiveDocumentation() {
  // Step 1: Documentation Specialist analyzes the feature
  const docPlan = await task({
    description: "Plan documentation",
    subagent_type: "general",
    prompt: `
      As docs-specialist expert:
      
      Feature: Vocabulary Management with import/export
      Users: Librarians (non-technical), metadata specialists, developers
      
      Create documentation plan covering:
      1. User documentation (getting started, guides)
      2. Interactive help (tours, tooltips)
      3. Video tutorials (3-5 min each)
      4. Developer docs (API, integration)
      5. Support materials (FAQ, troubleshooting)
    `
  });
  
  // Step 2: Generate different documentation types in parallel
  const [userDocs, interactiveHelp, developerDocs, supportDocs] = await Promise.all([
    // User-facing documentation
    task({
      description: "Create user guides",
      subagent_type: "general",
      prompt: `
        As docs-specialist expert:
        
        Create user documentation for librarians:
        1. Getting Started with Vocabularies (first-time users)
        2. Creating Your First Vocabulary (step-by-step)
        3. Importing from CSV (with screenshots)
        4. Managing Terms (add, edit, delete)
        5. Collaboration Features (sharing, permissions)
        
        Style: Friendly, non-technical, lots of examples
        Include: Screenshots, tips, common mistakes to avoid
      `
    }),
    
    // Interactive help components
    task({
      description: "Design help system",
      subagent_type: "general",
      prompt: `
        As docs-specialist expert:
        
        Create interactive help:
        1. Product tour for first visit (React Joyride)
        2. Contextual tooltips for complex fields
        3. Inline help text for forms
        4. Command palette (Cmd+K) for quick help
        5. Progress checklist for onboarding
        
        Implementation: React components with code
      `
    }),
    
    // Developer documentation
    task({
      description: "Create API docs",
      subagent_type: "general",
      prompt: `
        As docs-generator expert:
        
        Create developer documentation:
        1. REST API reference (OpenAPI spec)
        2. Authentication guide
        3. Python client example
        4. JavaScript SDK usage
        5. Webhook integration
        
        Include: Code examples, Postman collection
      `
    }),
    
    // Support materials
    task({
      description: "Create support docs",
      subagent_type: "general",
      prompt: `
        As docs-specialist expert:
        
        Create support materials:
        1. FAQ (20 common questions)
        2. Troubleshooting guide (problem-solution)
        3. Glossary of terms (IFLA terminology)
        4. Video scripts for tutorials
        5. Email templates for onboarding
        
        Focus on reducing support tickets
      `
    })
  ]);
  
  // Step 3: Create implementation plan
  const implementation = await task({
    description: "Implementation plan",
    subagent_type: "general",
    prompt: `
      As docs-specialist expert:
      
      Create implementation plan for:
      ${JSON.stringify(docPlan)}
      
      Include:
      1. React components for in-app help
      2. Docusaurus setup for help center
      3. Video recording schedule
      4. Translation requirements
      5. Maintenance plan
    `
  });
  
  return {
    plan: docPlan,
    userDocs,
    interactiveHelp,
    developerDocs,
    supportDocs,
    implementation
  };
}

// Result: Complete documentation package
const result = {
  inApp: {
    productTour: "7-step tour for new users",
    tooltips: "42 contextual help tooltips",
    commandPalette: "Quick help with Cmd+K",
    onboardingChecklist: "10-item progress tracker"
  },
  
  helpCenter: {
    gettingStarted: "5 beginner guides",
    featureGuides: "12 detailed guides",
    videoTutorials: "8 videos with transcripts",
    faq: "20 common questions"
  },
  
  developer: {
    apiReference: "OpenAPI 3.0 spec",
    sdks: "Python, JS, PHP clients",
    examples: "15 integration examples",
    postman: "Complete collection"
  },
  
  support: {
    troubleshooting: "25 problem-solutions",
    glossary: "150 IFLA terms",
    emailTemplates: "5 onboarding emails"
  }
};
```

### Example 7: Complete Feature from Scratch

```typescript
// User request: "Build a complete RDF namespace registry"

async function buildNamespaceRegistry() {
  // Comprehensive parallel development
  const phase1 = await Promise.all([
    // Core CRUD
    task({
      description: "Design namespace CRUD",
      subagent_type: "general",
      prompt: `
        As crud-builder expert:
        Entity: RDF Namespace
        Fields: prefix, uri, title, description, homepage, status
        Features: Search, filter, bulk import, validation
        Special: Fetch from prefix.cc, validate URI format
      `
    }),
    
    // Database design
    task({
      description: "Design namespace schema",
      subagent_type: "general",
      prompt: `
        As db-migrator expert:
        Table: namespaces with version history
        Indexes: prefix (unique), uri, full-text search on title/description
        Relations: namespace_versions, namespace_usages
        Features: Soft delete, audit trail, change tracking
      `
    }),
    
    // Import system
    task({
      description: "Create import system",
      subagent_type: "general",
      prompt: `
        As job-orchestrator expert:
        Sources: prefix.cc API, LOV API, manual CSV
        Processing: Fetch, validate, deduplicate, enrich metadata
        Schedule: Daily sync from external sources
        Progress: Real-time import status
      `
    }),
    
    // GitHub integration
    task({
      description: "GitHub namespace sync",
      subagent_type: "general",
      prompt: `
        As github-syncer expert:
        Sync: Namespace definitions from .github/namespaces.yml
        Watch: PR updates to namespace files
        Validate: PR checks for namespace conflicts
        Deploy: Auto-merge approved namespace additions
      `
    }),
    
    // Security
    task({
      description: "Security implementation",
      subagent_type: "general",
      prompt: `
        As security-auditor expert:
        Protect: Against XSS in descriptions, URI injection
        Validate: URI format, prevent malicious redirects
        RBAC: Public read, authenticated write, admin approve
        Audit: Log all changes with user attribution
      `
    }),
    
    // Testing
    task({
      description: "Comprehensive testing",
      subagent_type: "general",
      prompt: `
        As test-architect expert:
        Unit: All validation functions, URI parsing
        Integration: Import flows, external API mocking
        E2E: Complete namespace lifecycle
        Performance: Handle 10,000+ namespaces
      `
    }),
    
    // Documentation
    task({
      description: "Complete documentation",
      subagent_type: "general",
      prompt: `
        As docs-generator expert:
        API: Full REST API documentation with examples
        User: Guide for browsing, searching, contributing
        Admin: Import configuration, approval workflow
        Developer: Integration guide, webhook usage
      `
    }),
    
    // Performance
    task({
      description: "Performance optimization",
      subagent_type: "general",
      prompt: `
        As perf-optimizer expert:
        Optimize: Search with 10,000+ namespaces
        Cache: Frequently accessed namespaces
        CDN: Static namespace data
        Bundle: Code split namespace management
      `
    })
  ]);

  return coordinateCompleteFeature(phase1);
}
```

## Critical Documentation Requirements

### Why Official Documentation Matters

The Refine.dev framework (and others) have purpose-built patterns, best practices, and integrations that aren't always obvious from just the API. By consulting official documentation:

1. **We use intended patterns** - Not just what works, but what's recommended
2. **We leverage built-in features** - Like audit logs, realtime, access control
3. **We avoid anti-patterns** - Things that work but cause problems later
4. **We get production-ready code** - Following framework best practices
5. **We stay current** - Documentation is updated with each release

### Documentation Consultation Order

For EVERY feature, agents should:

1. **Check official framework docs** (webfetch)
   - Refine.dev for admin features
   - Supabase for database features
   - Next.js for routing/SSR
   
2. **Check library APIs** (Context7)
   - Current signatures
   - Breaking changes
   - Version compatibility

3. **Check project patterns** (local files)
   - Existing implementations
   - Project conventions
   - Team decisions

### Example: Building a Vocabulary CRUD

```typescript
// RIGHT: Consult docs first
const docs = await webfetch({
  url: "https://refine.dev/docs/ui-integrations/ant-design/components/crud/list/",
  format: "markdown"
});
// Extract patterns like useTable configuration, pagination setup, etc.

// WRONG: Just using Context7 without checking framework patterns
const api = await context7.query({
  library: "/refinedev/refine",
  query: "useTable"
});
// Missing framework-specific patterns and best practices
```

## Next Steps

1. **Implement prompt templates** for each subagent that include doc consultation
2. **Create coordination logic** that ensures doc checking
3. **Test with real features** using official documentation
4. **Build feedback loop** to improve pattern recognition
5. **Document patterns** discovered from official sources

This architecture, combined with official documentation consultation, transforms feature development into a systematic, best-practice-driven process that produces production-ready code.