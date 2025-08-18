import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  JobSchema, 
  JobCreateSchema, 
  JobUpdateSchema,
  JobQuerySchema,
  Job, 
  JobCreate, 
  JobUpdate,
  JobQuery 
} from '../../../contracts/schemas/Job.zod';

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
      throw new Error(`Failed to fetch job ${id}: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Job ${id} not found`);
    }

    // ✅ CRITICAL: Always validate with Zod before returning
    try {
      return JobSchema.parse(data);
    } catch (validationError) {
      throw new Error(`Invalid job data from database: ${validationError}`);
    }
  }

  /**
   * List jobs with filtering and pagination
   */
  async listJobs(query: JobQuery = {}): Promise<{ jobs: Job[]; total: number }> {
    // Validate query parameters
    const validatedQuery = JobQuerySchema.parse(query);

    let supabaseQuery = this.supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order(validatedQuery.sortBy, { ascending: validatedQuery.sortOrder === 'asc' })
      .range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1);

    // Apply filters
    if (validatedQuery.status) {
      supabaseQuery = supabaseQuery.eq('status', validatedQuery.status);
    }
    if (validatedQuery.type) {
      supabaseQuery = supabaseQuery.eq('type', validatedQuery.type);
    }
    if (validatedQuery.vocabularyId) {
      supabaseQuery = supabaseQuery.eq('vocabularyId', validatedQuery.vocabularyId);
    }
    if (validatedQuery.standardId) {
      supabaseQuery = supabaseQuery.eq('standardId', validatedQuery.standardId);
    }

    const { data, error, count } = await supabaseQuery;

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    if (!data) {
      return { jobs: [], total: 0 };
    }

    // Validate all returned jobs
    try {
      const jobs = JobSchema.array().parse(data);
      return { jobs, total: count ?? 0 };
    } catch (validationError) {
      throw new Error(`Invalid job data from database: ${validationError}`);
    }
  }

  /**
   * Create a new job with validation
   */
  async createJob(jobData: JobCreate): Promise<Job> {
    // Validate input data
    const validatedData = JobCreateSchema.parse(jobData);

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

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    if (!data) {
      throw new Error('Job creation failed: no data returned');
    }

    // Validate returned job data
    try {
      return JobSchema.parse(data);
    } catch (validationError) {
      throw new Error(`Invalid job data returned after creation: ${validationError}`);
    }
  }

  /**
   * Update job status and progress (internal use)
   */
  async updateJob(id: string, updates: JobUpdate): Promise<Job> {
    // Validate update data
    const validatedUpdates = JobUpdateSchema.parse(updates);

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

    if (error) {
      throw new Error(`Failed to update job ${id}: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Job ${id} not found for update`);
    }

    // Validate updated job data
    try {
      return JobSchema.parse(data);
    } catch (validationError) {
      throw new Error(`Invalid job data after update: ${validationError}`);
    }
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
      throw new Error(`Failed to delete job ${id}: ${error.message}`);
    }
  }

  /**
   * Get jobs by status for monitoring
   */
  async getJobsByStatus(status: Job['status']): Promise<Job[]> {
    const query: JobQuery = { status, limit: 100 };
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
    throw new Error('Missing Supabase environment variables');
  }
  
  return createJobsClient(url, key);
})();
