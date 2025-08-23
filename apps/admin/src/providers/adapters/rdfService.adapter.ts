/**
 * RDF Service Adapter
 * Handles RDF build operations and vocabulary management
 */

import {
  RdfBuildSchema,
  CreateRdfBuildSchema,
  type RdfBuild,
  type CreateRdfBuild,
  type Job,
  validateData,
} from '@ifla/contracts';
import { SupabaseJobsAdapter } from './supabaseJobs.adapter';
import { config } from '@/config/environment';

const API_BASE = config.env.apiBase || 'http://localhost:3000';

export class RdfServiceAdapter {
  private jobsAdapter: SupabaseJobsAdapter;

  constructor() {
    this.jobsAdapter = new SupabaseJobsAdapter();
  }

  /**
   * List RDF builds
   */
  async listRdfBuilds(params?: {
    namespaceId?: string;
    status?: Job['status'];
    limit?: number;
    offset?: number;
  }): Promise<{ data: RdfBuild[]; total: number }> {
    const response = await fetch(
      `${API_BASE}/api/rdf-builds?${new URLSearchParams({
        ...(params?.namespaceId && { namespaceId: params.namespaceId }),
        ...(params?.status && { status: params.status }),
        ...(params?.limit && { limit: String(params.limit) }),
        ...(params?.offset && { offset: String(params.offset) }),
      })}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch RDF builds: ${response.statusText}`);
    }

    const result = await response.json();

    // Validate each build in the response
    const validatedBuilds = (result.data || []).map(
      (build: unknown) =>
        validateData(RdfBuildSchema, build, `RDF build`) as RdfBuild,
    );

    return {
      data: validatedBuilds,
      total: result.total || 0,
    };
  }

  /**
   * Get a specific RDF build
   */
  async getRdfBuild(id: string): Promise<RdfBuild> {
    const response = await fetch(`${API_BASE}/api/rdf-builds/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch RDF build: ${response.statusText}`);
    }

    const result = await response.json();

    // Validate response with Zod schema
    return validateData(RdfBuildSchema, result.data, 'RDF build') as RdfBuild;
  }

  /**
   * Create a new RDF build
   * This calls the jobs adapter to enqueue the job
   */
  async createRdfBuild(data: CreateRdfBuild): Promise<RdfBuild> {
    // Validate input
    const validatedData = validateData(
      CreateRdfBuildSchema,
      data,
      'create RDF build request',
    ) as CreateRdfBuild;

    // Create a job through the Supabase adapter
    const job = await this.jobsAdapter.enqueueJob({
      type: 'rdf_build',
      namespaceId: validatedData.namespaceId,
      vocabularyId: validatedData.vocabularyId,
      metadata: {
        format: validatedData.format,
        includeDeprecated: validatedData.includeDeprecated,
        includeHistory: validatedData.includeHistory,
        compression: validatedData.compression,
      },
    });

    // Convert Job to RdfBuild
    return {
      ...job,
      type: 'rdf_build',
      format: validatedData.format,
      buildConfig: {
        format: validatedData.format,
        includeDeprecated: validatedData.includeDeprecated,
        includeHistory: validatedData.includeHistory,
        compression: validatedData.compression,
      },
    } as RdfBuild;
  }

  /**
   * Retry a failed RDF build
   */
  async retryRdfBuild(id: string): Promise<RdfBuild> {
    const job = await this.jobsAdapter.retryJob(id);

    // Convert Job to RdfBuild
    return {
      ...job,
      type: 'rdf_build',
    } as RdfBuild;
  }

  /**
   * Cancel a running RDF build
   */
  async cancelRdfBuild(id: string): Promise<RdfBuild> {
    const job = await this.jobsAdapter.cancelJob(id);

    // Convert Job to RdfBuild
    return {
      ...job,
      type: 'rdf_build',
    } as RdfBuild;
  }

  /**
   * Download the output of a completed RDF build
   */
  async downloadRdfBuildOutput(id: string): Promise<string> {
    const build = await this.getRdfBuild(id);

    if (build.status !== 'success' || !build.outputUrl) {
      throw new Error('Build is not complete or has no output');
    }

    return build.outputUrl;
  }
}
