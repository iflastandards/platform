/**
 * MSW Request Handlers
 * Define mock API endpoints that mirror the live API contract
 */

import { http, HttpResponse, delay } from 'msw';
import {
  jobStore,
  createMockJob,
  simulateJobProgress,
  getMockRdfBuilds,
  getRandomDelay,
  updateJobStatus,
} from './fixtures';
import { CreateRdfBuildSchema } from '@/../../packages/contracts/schemas/RdfBuild.zod';
import { config } from '@/config/environment';

const API_BASE = config.env.apiBase || 'http://localhost:3000';

export const handlers = [
  // POST /api/jobs/enqueue - Create a new job
  http.post(`${API_BASE}/api/jobs/enqueue`, async ({ request }) => {
    await delay(getRandomDelay());

    try {
      const body = await request.json();

      // Validate request body
      const validatedData = CreateRdfBuildSchema.parse(body);

      // Create a new job
      const job = createMockJob({
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

      // Simulate job progression
      simulateJobProgress(job.id);

      return HttpResponse.json({
        success: true,
        data: job,
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid request',
        },
        { status: 400 },
      );
    }
  }),

  // GET /api/jobs/:id - Get a specific job
  http.get(`${API_BASE}/api/jobs/:id`, async ({ params }) => {
    await delay(getRandomDelay());

    const { id } = params;
    const job = jobStore.get(id as string);

    if (!job) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: job,
    });
  }),

  // GET /api/jobs - List all jobs
  http.get(`${API_BASE}/api/jobs`, async ({ request }) => {
    await delay(getRandomDelay());

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status');

    let jobs = Array.from(jobStore.values());

    // Filter by status if provided
    if (status) {
      jobs = jobs.filter((job) => job.status === status);
    }

    // Sort by creation date (newest first)
    jobs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedJobs = jobs.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: paginatedJobs,
      total: jobs.length,
      page,
      pageSize,
    });
  }),

  // GET /api/rdf-builds - List RDF builds
  http.get(`${API_BASE}/api/rdf-builds`, async ({ request }) => {
    await delay(getRandomDelay());

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const builds = getMockRdfBuilds();

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedBuilds = builds.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: paginatedBuilds,
      total: builds.length,
      page,
      pageSize,
    });
  }),

  // GET /api/rdf-builds/:id - Get a specific RDF build
  http.get(`${API_BASE}/api/rdf-builds/:id`, async ({ params }) => {
    await delay(getRandomDelay());

    const { id } = params;
    const builds = getMockRdfBuilds();
    const build = builds.find((b) => b.id === id);

    if (!build) {
      // Check if it's in the job store
      const job = jobStore.get(id as string);
      if (job && job.type === 'rdf_build') {
        return HttpResponse.json({
          success: true,
          data: job,
        });
      }

      return HttpResponse.json(
        {
          success: false,
          error: 'RDF build not found',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: build,
    });
  }),

  // POST /api/rdf-builds - Create a new RDF build
  http.post(`${API_BASE}/api/rdf-builds`, async ({ request }) => {
    await delay(getRandomDelay());

    try {
      const body = await request.json();

      // Validate request body
      const validatedData = CreateRdfBuildSchema.parse(body);

      // Create a new job
      const job = createMockJob({
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

      // Simulate job progression
      simulateJobProgress(job.id);

      return HttpResponse.json(
        {
          success: true,
          data: job,
        },
        { status: 201 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid request',
        },
        { status: 400 },
      );
    }
  }),

  // PUT /api/jobs/:id/retry - Retry a failed job
  http.put(`${API_BASE}/api/jobs/:id/retry`, async ({ params }) => {
    await delay(getRandomDelay());

    const { id } = params;
    const job = jobStore.get(id as string);

    if (!job) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Job not found',
        },
        { status: 404 },
      );
    }

    if (job.status !== 'failed') {
      return HttpResponse.json(
        {
          success: false,
          error: 'Can only retry failed jobs',
        },
        { status: 400 },
      );
    }

    // Reset the job to queued status
    const updatedJob = updateJobStatus(id as string, {
      status: 'queued',
      progress: 0,
      error: undefined,
      finishedAt: undefined,
    });

    // Simulate job progression again
    simulateJobProgress(id as string);

    return HttpResponse.json({
      success: true,
      data: updatedJob,
    });
  }),
];
