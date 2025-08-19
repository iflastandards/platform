/**
 * Mock Data Provider
 * Uses MSW handlers to provide data in development/test environments
 */

import { DataProvider } from '@refinedev/core';
import { config } from '@/config/environment';

const API_BASE = config.env.apiBase || 'http://localhost:3000';

/**
 * Generic fetch wrapper for mock API calls
 */
async function mockFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export const mockDataProvider: DataProvider = {
  // Get a list of resources
  getList: async ({ resource, pagination, filters }) => {
    const params = new URLSearchParams();

    if (pagination) {
      params.append('page', String(pagination.current || 1));
      params.append('pageSize', String(pagination.pageSize || 10));
    }

    if (filters) {
      filters.forEach((filter) => {
        if (
          'field' in filter &&
          filter.value !== undefined &&
          filter.value !== null
        ) {
          params.append(filter.field, String(filter.value));
        }
      });
    }

    const response = await mockFetch(
      `${API_BASE}/api/${resource}?${params.toString()}`,
    );

    return {
      data: response.data || [],
      total: response.total || 0,
    };
  },

  // Get a single resource
  getOne: async ({ resource, id }) => {
    const response = await mockFetch(`${API_BASE}/api/${resource}/${id}`);

    return {
      data: response.data,
    };
  },

  // Create a new resource
  create: async ({ resource, variables }) => {
    const response = await mockFetch(`${API_BASE}/api/${resource}`, {
      method: 'POST',
      body: JSON.stringify(variables),
    });

    return {
      data: response.data,
    };
  },

  // Update an existing resource
  update: async ({ resource, id, variables }) => {
    const response = await mockFetch(`${API_BASE}/api/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(variables),
    });

    return {
      data: response.data,
    };
  },

  // Delete a resource
  deleteOne: async ({ resource, id }) => {
    const response = await mockFetch(`${API_BASE}/api/${resource}/${id}`, {
      method: 'DELETE',
    });

    return {
      data: response.data || { id },
    };
  },

  // Get many resources by IDs
  getMany: async ({ resource, ids }) => {
    const promises = ids.map((id) =>
      mockFetch(`${API_BASE}/api/${resource}/${id}`)
        .then((res) => res.data)
        .catch(() => null),
    );

    const results = await Promise.all(promises);

    return {
      data: results.filter(Boolean),
    };
  },

  // Custom method for API calls
  custom: async ({ url, method, payload, query, headers }) => {
    const params = query ? `?${new URLSearchParams(query).toString()}` : '';

    const response = await mockFetch(`${API_BASE}${url}${params}`, {
      method: method.toUpperCase(),
      body: payload ? JSON.stringify(payload) : undefined,
      headers,
    });

    return {
      data: response.data || response,
    };
  },

  // Get API URL (for downloads, etc.)
  getApiUrl: () => API_BASE,
};
