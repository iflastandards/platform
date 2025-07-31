/**
 * Integration Tests for Scaffold from Spreadsheet API
 * Part of the 5-level testing strategy - Level 2: Integration Tests
 * These run in pre-push hooks and test API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { currentUser } from '@clerk/nextjs/server';

// Mock dependencies at the boundary
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(() =>
    Promise.resolve({
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      publicMetadata: {
        roles: ['ifla-admin'],
      },
    }),
  ),
}));

// Simple mock for ImportService
const mockJobs = new Map();
vi.mock('@/lib/services/import-service', () => ({
  ImportService: {
    createImportJob: vi.fn(async (params) => {
      const job = { id: `job-${Date.now()}`, ...params, status: 'pending' };
      mockJobs.set(job.id, job);
      return job;
    }),
    processImportJob: vi.fn(() => Promise.resolve()),
    getImportJob: vi.fn(async (id) => mockJobs.get(id)),
  },
}));

describe('Scaffold API - Integration Tests @integration @api @high-priority', () => {
  beforeEach(() => {
    mockJobs.clear();
    vi.clearAllMocks();
  });

  describe('POST endpoint', () => {
    it('should create job with valid request', async () => {
      const request = new NextRequest(
        'http://localhost/api/actions/scaffold-from-spreadsheet',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            namespace: 'isbd',
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/123/edit',
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobId).toMatch(/^job-\d+$/);
      expect(data.namespace).toBe('isbd');
    });

    it('should reject invalid spreadsheet URLs', async () => {
      const request = new NextRequest(
        'http://localhost/api/actions/scaffold-from-spreadsheet',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            namespace: 'isbd',
            spreadsheetUrl: 'not-a-google-sheet',
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should check user permissions', async () => {
      vi.mocked(currentUser).mockResolvedValueOnce({
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        publicMetadata: {
          roles: ['lrm-editor'], // No access to isbd
        },
      } as any);

      const request = new NextRequest(
        'http://localhost/api/actions/scaffold-from-spreadsheet',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            namespace: 'isbd',
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/123/edit',
          }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(403);
    });
  });

  describe('GET endpoint', () => {
    it('should retrieve job status', async () => {
      // Create a job first
      const job = {
        id: 'test-job',
        namespace_id: 'isbd',
        status: 'processing',
        created_by: 'test-user',
        created_at: new Date().toISOString(),
      };
      mockJobs.set(job.id, job);

      const request = new NextRequest(
        'http://localhost/api/actions/scaffold-from-spreadsheet?jobId=test-job',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobId).toBe('test-job');
      expect(data.status).toBe('processing');
      expect(data.progress).toBe(60); // Based on progressMap
    });

    it('should return 404 for missing job', async () => {
      const request = new NextRequest(
        'http://localhost/api/actions/scaffold-from-spreadsheet?jobId=missing',
      );
      const response = await GET(request);

      expect(response.status).toBe(404);
    });
  });
});
