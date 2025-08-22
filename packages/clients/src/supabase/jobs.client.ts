import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fromZodError } from 'zod-validation-error';
import { ClientApiError, ClientNotFoundError, ClientValidationError, ClientError } from '../errors';
import {
  JobSchema, 
  JobCreateSchema, 
  JobUpdateSchema,
  JobQuerySchema,
  Job, 
  JobCreate, 
  JobUpdate,
  JobQuery 
} from '@site/packages/contracts/schemas';

/**
 * Supabase Jobs Client - Type-safe wrapper around Supabase operations for jobs
 * Provides runtime validation using Zod schemas and proper error handling
 */
export class SupabaseJobsClient {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get a single job by ID with runtime validation
   */
  async getJob(id: string): Promise<Job> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new ClientApiError(`Failed to fetch job ${id}: ${error.message}`);
    }

    if (!data) {
      throw new ClientNotFoundError(`Job ${id} not found`);
    }

    // ✅ CRITICAL: Always validate with Zod before returning
    const validationResult = JobSchema.safeParse(data);
    if (!validationResult.success) {
      throw new ClientValidationError('Invalid job data from database.', {
        cause: fromZodError(validationResult.error),
      });
    }
    return validationResult.data;
  }

  /**
   * List jobs with filtering and pagination
   */
  async listJobs(query: Partial<JobQuery> = {}): Promise<{ jobs: Job[]; total: number }> {
    // Validate query parameters with defaults
    const validatedQuery = JobQuerySchema.parse(query);

    let supabaseQuery = this.supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order(validatedQuery.sortBy, { ascending: validatedQuery.sortOrder === 'asc' })
      .range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1);

    // Dynamically apply filters from the validated query
    const filters = {
      status: validatedQuery.status,
      type: validatedQuery.type,
      vocabularyId: validatedQuery.vocabularyId,
      standardId: validatedQuery.standardId,
    };

    for (const [key, value] of Object.entries(filters)) {
      if (value) { // Zod's `optional()` makes non-present fields `undefined`
        supabaseQuery = supabaseQuery.eq(key, value);
      }
    }

    const { data, error, count } = await supabaseQuery;

    if (error) {
      throw new ClientApiError(`Failed to fetch jobs: ${error.message}`);
    }

    if (!data) {
      return { jobs: [], total: 0 };
    }

    // Validate all returned jobs
    const validationResult = JobSchema.array().safeParse(data);
    if (!validationResult.success) {
      throw new ClientValidationError('Invalid job list data from database.', {
        cause: fromZodError(validationResult.error),
      });
    }
    return { jobs: validationResult.data, total: count ?? 0 };
  }

  /**
   * Create a new job with validation
   */
  async createJob(jobData: JobCreate): Promise<Job> {
    // Validate input data
    const validationResult = JobCreateSchema.safeParse(jobData);
    if (!validationResult.success) {
      throw new ClientValidationError('Invalid job creation data provided.', {
        cause: fromZodError(validationResult.error),
      });
    }

    // Prepare job record for insertion
    const jobRecord = {
      ...validatedData,
      id: crypto.randomUUID(),
      status: 'queued' as const,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('jobs')
      .insert(jobRecord)
      .select()
      .single();

    if (error || !data) {
      throw new ClientApiError(`Failed to create job: ${error?.message ?? 'No data returned'}`);
    }

    // Validate returned job data
    const returnValidationResult = JobSchema.safeParse(data);
    if (!returnValidationResult.success) {
      throw new ClientValidationError('Invalid job data returned after creation.', {
        cause: fromZodError(returnValidationResult.error),
      });
    }
    return returnValidationResult.data;
  }

  /**
   * Update job status and progress (internal use)
   */
  async updateJob(id: string, updates: JobUpdate): Promise<Job> {
    // Validate update data
    const validationResult = JobUpdateSchema.safeParse(updates);
    if (!validationResult.success) {
      throw new ClientValidationError('Invalid job update data provided.', {
        cause: fromZodError(validationResult.error),
      });
    }

    const updateRecord = {
      ...validatedUpdates,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('jobs')
      .update(updateRecord)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new ClientApiError(`Failed to update job ${id}: ${error?.message ?? 'No data returned'}`);
    }

    // Validate updated job data
    const returnValidationResult = JobSchema.safeParse(data);
    if (!returnValidationResult.success) {
      throw new ClientValidationError('Invalid job data after update.', {
        cause: fromZodError(returnValidationResult.error),
      });
    }
    return returnValidationResult.data;
  }

  /**
   * Delete a job (with proper cleanup)
   */
  async deleteJob(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new ClientApiError(`Failed to delete job ${id}: ${error.message}`);
    }
  }

  /**
   * Get jobs by status for monitoring
   */
  async getJobsByStatus(status: Job['status']): Promise<Job[]> {
    const query: Partial<JobQuery> = { status, limit: 100 };
    const result = await this.listJobs(query);
    return result.jobs;
  }

  /**
   * Get running jobs that may need progress updates
   */
  async getRunningJobs(): Promise<Job[]> {
    return this.getJobsByStatus('running');
  }

  /**
   * Get queued jobs for processing
   */
  async getQueuedJobs(): Promise<Job[]> {
    return this.getJobsByStatus('queued');
  }
}

/**
 * Factory function to create a configured jobs client
 */
export function createJobsClient(supabaseUrl: string, supabaseKey: string): SupabaseJobsClient {
  const supabase = createClient(supabaseUrl, supabaseKey);
  return new SupabaseJobsClient(supabase);
}

/**
 * Default client instance (expects environment variables)
 */
export const jobsClient = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new ClientError('Missing Supabase environment variables for default client');
  }
  
  return createJobsClient(url, key);
})();
