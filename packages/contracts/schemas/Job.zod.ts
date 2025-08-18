import { z } from 'zod';

/**
 * Job Schema - Represents background jobs for vocabulary processing, RDF exports, etc.
 * Used throughout the admin portal for job management and monitoring
 */
export const JobSchema = z.object({
  id: z.string().uuid('Invalid job ID format'),
  type: z.enum(['vocabulary_import', 'export_rdf', 'validate_terms', 'generate_docs'], {
    errorMap: () => ({ message: 'Invalid job type' }),
  }),
  status: z.enum(['queued', 'running', 'success', 'failed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid job status' }),
  }),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.string().datetime('Invalid created date format'),
  updatedAt: z.string().datetime('Invalid updated date format').optional(),
  finishedAt: z.string().datetime('Invalid finished date format').optional(),
  outputUrl: z.string().url('Invalid output URL').optional(),
  error: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  
  // Related resource IDs
  vocabularyId: z.string().uuid().optional(),
  standardId: z.string().optional(),
  userId: z.string().optional(),
});

/**
 * Schema for creating new jobs
 */
export const JobCreateSchema = JobSchema.pick({
  type: true,
  vocabularyId: true,
  standardId: true,
}).extend({
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

/**
 * Schema for updating job status (internal use)
 */
export const JobUpdateSchema = JobSchema.pick({
  status: true,
  progress: true,
  error: true,
  finishedAt: true,
  outputUrl: true,
}).partial();

/**
 * Schema for job filtering and search
 */
export const JobQuerySchema = z.object({
  status: z.enum(['queued', 'running', 'success', 'failed', 'cancelled']).optional(),
  type: z.enum(['vocabulary_import', 'export_rdf', 'validate_terms', 'generate_docs']).optional(),
  vocabularyId: z.string().uuid().optional(),
  standardId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports for TypeScript consumption
export type Job = z.infer<typeof JobSchema>;
export type JobCreate = z.infer<typeof JobCreateSchema>;
export type JobUpdate = z.infer<typeof JobUpdateSchema>;
export type JobQuery = z.infer<typeof JobQuerySchema>;

// Status type guards for better type narrowing
export const isCompletedJob = (job: Job): job is Job & { status: 'success' | 'failed' | 'cancelled' } => {
  return ['success', 'failed', 'cancelled'].includes(job.status);
};

export const isRunningJob = (job: Job): job is Job & { status: 'running' } => {
  return job.status === 'running';
};

export const isQueuedJob = (job: Job): job is Job & { status: 'queued' } => {
  return job.status === 'queued';
};
