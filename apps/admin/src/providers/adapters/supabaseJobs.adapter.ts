/**
 * Supabase Jobs Adapter
 * Handles job queue operations using Supabase
 */

import { createClient } from '@supabase/supabase-js';
import {
  JobSchema,
  type Job,
  validateData,
} from '@ifla/contracts';
import { config } from '@/config/environment';

// Initialize Supabase client
const supabase = createClient(
  config.env.supabaseUrl,
  config.env.supabaseAnonKey,
);

export class SupabaseJobsAdapter {
  /**
   * Enqueue a new job
   */
  async enqueueJob(jobData: Partial<Job>): Promise<Job> {
    // Call Supabase RPC function or insert directly
    const { data, error } = await supabase
      .rpc('enqueue_job', {
        job_type: jobData.type,
        job_data: jobData,
      })
      .single();

    if (error) {
      throw new Error(`Failed to enqueue job: ${error.message}`);
    }

    // Validate response with Zod schema
    return validateData(JobSchema, data, 'enqueued job') as Job;
  }

  /**
   * Get a specific job by ID
   */
  async getJob(id: string): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    // Validate response with Zod schema
    return validateData(JobSchema, data, 'job') as Job;
  }

  /**
   * List jobs with optional filtering
   */
  async listJobs(params?: {
    status?: Job['status'];
    type?: Job['type'];
    namespaceId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Job[]; total: number }> {
    let query = supabase.from('jobs').select('*', { count: 'exact' });

    // Apply filters
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.type) {
      query = query.eq('type', params.type);
    }
    if (params?.namespaceId) {
      query = query.eq('namespace_id', params.namespaceId);
    }

    // Apply pagination
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (params?.offset) {
      query = query.range(
        params.offset,
        params.offset + (params.limit || 10) - 1,
      );
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list jobs: ${error.message}`);
    }

    // Validate each job in the response
    const validatedJobs = (data || []).map(
      (job) => validateData(JobSchema, job, `job ${job.id}`) as Job,
    );

    return {
      data: validatedJobs,
      total: count || 0,
    };
  }

  /**
   * Update a job's status
   */
  async updateJobStatus(
    id: string,
    updates: Partial<Pick<Job, 'status' | 'progress' | 'error' | 'outputUrl'>>,
  ): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    // Validate response with Zod schema
    return validateData(JobSchema, data, 'updated job') as Job;
  }

  /**
   * Retry a failed job
   */
  async retryJob(id: string): Promise<Job> {
    // Call Supabase RPC function to retry
    const { data, error } = await supabase
      .rpc('retry_job', { job_id: id })
      .single();

    if (error) {
      throw new Error(`Failed to retry job: ${error.message}`);
    }

    // Validate response with Zod schema
    return validateData(JobSchema, data, 'retried job') as Job;
  }

  /**
   * Cancel a running job
   */
  async cancelJob(id: string): Promise<Job> {
    return this.updateJobStatus(id, {
      status: 'cancelled',
      error: 'Job cancelled by user',
    });
  }
}
