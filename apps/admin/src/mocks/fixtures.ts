/**
 * Mock Data Fixtures
 * Functions to generate dynamic mock data for testing
 */

import type { Job } from '@/../../packages/contracts/schemas/Job.zod';
import type { RdfBuild } from '@/../../packages/contracts/schemas/RdfBuild.zod';
import rdfBuildsFixture from '@/../../packages/fixtures/rdf-builds.json';

// In-memory storage for jobs
export const jobStore = new Map<string, Job>();

/**
 * Generate a mock job ID
 */
export function generateJobId(): string {
  return crypto.randomUUID();
}

/**
 * Create a mock job
 */
export function createMockJob(partial: Partial<Job> = {}): Job {
  const id = partial.id || generateJobId();
  const job: Job = {
    id,
    type: 'rdf_build',
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    ...partial,
  };

  jobStore.set(id, job);
  return job;
}

/**
 * Update a job's status (simulates job progression)
 */
export function updateJobStatus(id: string, updates: Partial<Job>): Job | null {
  const job = jobStore.get(id);
  if (!job) return null;

  const updatedJob = {
    ...job,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  jobStore.set(id, updatedJob);
  return updatedJob;
}

/**
 * Simulate job progression over time
 */
export function simulateJobProgress(id: string) {
  // Start as running after 1 second
  setTimeout(() => {
    updateJobStatus(id, {
      status: 'running',
      progress: 25,
    });
  }, 1000);

  // Update progress at 2 seconds
  setTimeout(() => {
    updateJobStatus(id, {
      progress: 50,
    });
  }, 2000);

  // Update progress at 3 seconds
  setTimeout(() => {
    updateJobStatus(id, {
      progress: 75,
    });
  }, 3000);

  // Complete at 4 seconds
  setTimeout(() => {
    updateJobStatus(id, {
      status: 'success',
      progress: 100,
      finishedAt: new Date().toISOString(),
      outputUrl: `https://mock-storage.example.com/rdf/${id}.ttl`,
    });
  }, 4000);
}

/**
 * Get mock RDF builds from fixtures
 */
export function getMockRdfBuilds(): RdfBuild[] {
  return rdfBuildsFixture.map((build: any) => ({
    id: build.id,
    type: 'rdf_build' as const,
    status: build.status as Job['status'],
    progress: build.metadata?.triplesCount ? 100 : 50,
    createdAt: build.startedAt || new Date().toISOString(),
    finishedAt: build.completedAt || undefined,
    outputUrl: build.outputUrl || undefined,
    error: build.error || undefined,
    namespaceId: build.vocabularyId,
    format: build.format as any,
    metadata: build.metadata,
  })) as RdfBuild[];
}

/**
 * Generate a random delay for realistic network simulation
 */
export function getRandomDelay(min = 100, max = 500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
