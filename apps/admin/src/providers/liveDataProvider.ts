/**
 * Live Data Provider
 * Connects to real backend services using adapters
 */

import { DataProvider } from '@refinedev/core';
import { SupabaseJobsAdapter } from './adapters/supabaseJobs.adapter';
import { RdfServiceAdapter } from './adapters/rdfService.adapter';
import { config } from '@/config/environment';

// Initialize adapters
const jobsAdapter = new SupabaseJobsAdapter();
const rdfAdapter = new RdfServiceAdapter();

const API_BASE = config.env.apiBase || 'http://localhost:3000';

export const liveDataProvider: DataProvider = {
  // Get a list of resources
  getList: async ({ resource, pagination, filters }) => {
    switch (resource) {
      case 'rdf-builds': {
        const result = await rdfAdapter.listRdfBuilds({
          limit: pagination?.pageSize,
          offset: pagination?.current
            ? (pagination.current - 1) * (pagination.pageSize || 10)
            : 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: filters?.find((f: any) => f.field === 'status')?.value,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          namespaceId: filters?.find((f: any) => f.field === 'namespaceId')
            ?.value,
        });

        return {
          data: result.data as any,
          total: result.total,
        };
      }

      case 'jobs': {
        const result = await jobsAdapter.listJobs({
          limit: pagination?.pageSize,
          offset: pagination?.current
            ? (pagination.current - 1) * (pagination.pageSize || 10)
            : 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: filters?.find((f: any) => f.field === 'status')?.value,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: filters?.find((f: any) => f.field === 'type')?.value,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          namespaceId: filters?.find((f: any) => f.field === 'namespaceId')
            ?.value,
        });

        return {
          data: result.data as any,
          total: result.total,
        };
      }

      default:
        throw new Error(`Resource ${resource} not implemented`);
    }
  },

  // Get a single resource
  getOne: async ({ resource, id }) => {
    switch (resource) {
      case 'rdf-builds': {
        const data = await rdfAdapter.getRdfBuild(String(id));
        return { data: data as any };
      }

      case 'jobs': {
        const data = await jobsAdapter.getJob(String(id));
        return { data: data as any };
      }

      default:
        throw new Error(`Resource ${resource} not implemented`);
    }
  },

  // Create a new resource
  create: async ({ resource, variables }) => {
    switch (resource) {
      case 'rdf-builds': {
        const data = await rdfAdapter.createRdfBuild(variables as any);
        return { data: data as any };
      }

      case 'jobs': {
        const data = await jobsAdapter.enqueueJob(variables as any);
        return { data: data as any };
      }

      default:
        throw new Error(`Resource ${resource} not implemented`);
    }
  },

  // Update an existing resource
  update: async ({ resource, id, variables }) => {
    switch (resource) {
      case 'jobs': {
        const data = await jobsAdapter.updateJobStatus(
          String(id),
          variables as any,
        );
        return { data: data as any };
      }

      default:
        throw new Error(`Resource ${resource} not implemented for update`);
    }
  },

  // Delete a resource
  deleteOne: async ({ resource, id }) => {
    switch (resource) {
      case 'jobs': {
        const data = await jobsAdapter.cancelJob(String(id));
        return { data: data as any };
      }

      default:
        throw new Error(`Resource ${resource} not implemented for delete`);
    }
  },

  // Get many resources by IDs
  getMany: async ({ resource, ids }) => {
    const promises = ids.map((id) => {
      switch (resource) {
        case 'rdf-builds':
          return rdfAdapter.getRdfBuild(String(id)).catch(() => null);
        case 'jobs':
          return jobsAdapter.getJob(String(id)).catch(() => null);
        default:
          return null;
      }
    });

    const results = await Promise.all(promises);

    return {
      data: results.filter(Boolean) as any,
    };
  },

  // Custom method for API calls
  custom: async ({ url, method, payload }) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: method.toUpperCase(),
      body: payload ? JSON.stringify(payload) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      data: data.data || data,
    };
  },

  // Get API URL
  getApiUrl: () => API_BASE,
};
