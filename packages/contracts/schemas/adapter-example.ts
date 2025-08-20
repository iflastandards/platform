/**
 * Example of how to implement data adapters with mandatory validation
 *
 * ACCEPTANCE CRITERION: No data provider method may return data
 * that has not been successfully parsed by a Zod schema.
 */

import { z } from 'zod';
import { JobSchema, type Job } from './Job.zod';
import {
  validateData,
  createValidatedAdapter,
  ValidationError,
} from './validation';

/**
 * Example 1: Supabase adapter with validation
 */
export class SupabaseJobAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private supabase: any) {} // Would be Supabase client type

  async getJob(id: string): Promise<Job> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    // MANDATORY: Validate before returning
    // Even though Supabase has TypeScript types, we must validate at runtime
    return validateData(JobSchema, data, 'supabase job') as Job;
  }

  async getJobs(): Promise<Job[]> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    // Validate each job in the array
     
    return data.map(
      (job: unknown) =>
        validateData(JobSchema, job, `job ${(job as any).id}`) as Job,
    );
  }

  async createJob(jobData: Partial<Job>): Promise<Job> {
    // Validate input data before sending to Supabase
    const validatedInput = validateData(
      JobSchema.partial(),
      jobData,
      'job creation data',
    );

    const { data, error } = await this.supabase
      .from('jobs')
      .insert(validatedInput)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    // Validate response before returning
    return validateData(JobSchema, data, 'created job') as Job;
  }
}

/**
 * Example 2: External API adapter with transformation
 */
export class ExternalApiJobAdapter {
  private apiUrl = 'https://api.example.com';

  async fetchJob(id: string): Promise<Job> {
    const response = await fetch(`${this.apiUrl}/jobs/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Transform external format to our internal format
    // External API might have different field names
    const transformedData = {
      id: rawData.job_id,
      type: this.mapJobType(rawData.job_type),
      status: this.mapJobStatus(rawData.job_status),
      progress: rawData.percentage || 0,
      createdAt: rawData.created_at,
      updatedAt: rawData.updated_at,
      finishedAt: rawData.finished_at,
      error: rawData.error_message,
      metadata: rawData.extra_data,
    };

    // MANDATORY: Validate transformed data
    return validateData(JobSchema, transformedData, 'external job') as Job;
  }

  private mapJobType(externalType: string): Job['type'] {
    const typeMap: Record<string, Job['type']> = {
      vocab_import: 'vocabulary_import',
      rdf_export: 'export_rdf',
      term_validation: 'validate_terms',
      doc_generation: 'generate_docs',
    };
    return typeMap[externalType] || 'vocabulary_import';
  }

  private mapJobStatus(externalStatus: string): Job['status'] {
    const statusMap: Record<string, Job['status']> = {
      pending: 'queued',
      in_progress: 'running',
      completed: 'success',
      error: 'failed',
      aborted: 'cancelled',
    };
    return statusMap[externalStatus] || 'queued';
  }
}

/**
 * Example 3: Using createValidatedAdapter for automatic validation
 */
export const fetchJobWithValidation = createValidatedAdapter(
  z.string().uuid(), // Input schema - job ID
  JobSchema, // Output schema - Job
  async (jobId: string) => {
    // Fetch from some data source
    const response = await fetch(`https://api.example.com/jobs/${jobId}`);
    const data = await response.json();

    // Transform if needed
    return {
      id: data.id,
      type: data.type,
      status: data.status,
      progress: data.progress || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      finishedAt: data.finishedAt,
      error: data.error,
      metadata: data.metadata,
    };
  },
);

/**
 * Example 4: MSW (Mock Service Worker) handler with validation
 */
export function createMockJobHandler() {
  return {
    getJob: (jobId: string) => {
      // Mock data that matches our schema
      const mockJob = {
        id: jobId,
        type: 'vocabulary_import' as const,
        status: 'running' as const,
        progress: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Even mock data must be validated
      return validateData(JobSchema, mockJob, 'mock job');
    },

    getJobs: () => {
      const mockJobs = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'vocabulary_import',
          status: 'success',
          progress: 100,
          createdAt: '2024-01-01T00:00:00Z',
          finishedAt: '2024-01-01T00:05:00Z',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          type: 'export_rdf',
          status: 'running',
          progress: 75,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      // Validate each mock job
      return mockJobs.map((job) =>
        validateData(JobSchema, job, `mock job ${job.id}`),
      );
    },
  };
}

/**
 * Example 5: API route handler with validation middleware
 */
export async function jobApiHandler(req: { body: unknown }) {
  try {
    // Validate request body using partial schema (for updates)
    const jobData = validateData(JobSchema.partial(), req.body, 'request body');

    // Process the job (this would be your business logic)
    const processedJob = {
      id: crypto.randomUUID(),
      type: 'vocabulary_import' as const,
      status: 'queued' as const,
      progress: 0,
      createdAt: new Date().toISOString(),
      ...jobData,
    };

    // Validate response before sending
    const validatedResponse = validateData(JobSchema, processedJob, 'response');

    return {
      status: 200,
      body: validatedResponse,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 400,
        body: {
          error: 'Validation failed',
          details: error.errors.format(),
        },
      };
    }
    throw error;
  }
}

/**
 * Example 6: Batch processing with validation
 */
export async function processJobBatch(jobs: unknown[]): Promise<{
  successful: Job[];
  failed: Array<{ data: unknown; error: string }>;
}> {
  const successful: Job[] = [];
  const failed: Array<{ data: unknown; error: string }> = [];

  for (const jobData of jobs) {
    try {
      const validJob = validateData(JobSchema, jobData, 'batch job') as Job;
      successful.push(validJob);
    } catch (error) {
      failed.push({
        data: jobData,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { successful, failed };
}
