import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../../../app/api/scaffold/route';
import { auth } from '../../../app/lib/auth';
import { exec } from 'child_process';

// Mock dependencies
vi.mock('../../../app/lib/auth');
vi.mock('child_process');
vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn),
}));

// Helper to create mock NextRequest
const createMockRequest = (body: any): NextRequest => {
  return {
    json: async () => body,
  } as NextRequest;
};

describe('POST /api/scaffold', () => {
  const mockAuth = vi.mocked(auth);
  const mockExec = vi.mocked(exec);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.cwd mock
    vi.spyOn(process, 'cwd').mockReturnValue('/mock/workspace');
  });

  describe('Authentication and Authorization', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest({
        siteKey: 'test',
        title: 'Test Site',
        tagline: 'Test tagline',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('returns 401 when user lacks system-admin role', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['editor', 'reviewer'],
        },
        expires: new Date().toISOString(),
      });

      const request = createMockRequest({
        siteKey: 'test',
        title: 'Test Site',
        tagline: 'Test tagline',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('allows access for system-admin role', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          roles: ['system-admin'],
        },
        expires: new Date().toISOString(),
      });

      mockExec.mockImplementation((cmd, opts, callback: any) => {
        callback(null, { stdout: 'Success', stderr: '' });
      });

      const request = createMockRequest({
        siteKey: 'test',
        title: 'Test Site',
        tagline: 'Test tagline',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          roles: ['system-admin'],
        },
        expires: new Date().toISOString(),
      });
    });

    it('validates required siteKey parameter', async () => {
      const request = createMockRequest({
        title: 'Test Site',
        tagline: 'Test tagline',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('siteKey');
    });

    it('validates required title parameter', async () => {
      const request = createMockRequest({
        siteKey: 'test',
        tagline: 'Test tagline',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('title');
    });

    it('sanitizes siteKey to prevent command injection', async () => {
      mockExec.mockImplementation((cmd, opts, callback: any) => {
        callback(null, { stdout: 'Success', stderr: '' });
      });

      const request = createMockRequest({
        siteKey: 'test; rm -rf /',
        title: 'Test Site',
        tagline: 'Test tagline',
      });

      const response = await POST(request);

      // Should sanitize the siteKey
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('--siteKey=test-rm-rf-'),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('escapes quotes in title and tagline', async () => {
      mockExec.mockImplementation((cmd, opts, callback: any) => {
        callback(null, { stdout: 'Success', stderr: '' });
      });

      const request = createMockRequest({
        siteKey: 'test',
        title: 'Test "Site" with quotes',
        tagline: "Test 'tagline' with quotes",
      });

      const response = await POST(request);

      // Should escape quotes properly
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('--title="Test \\"Site\\" with quotes"'),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('Scaffolding Execution', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          roles: ['system-admin'],
        },
        expires: new Date().toISOString(),
      });
    });

    it('executes scaffolding script with correct parameters', async () => {
      mockExec.mockImplementation((cmd, opts, callback: any) => {
        callback(null, { stdout: 'Site created successfully', stderr: '' });
      });

      const request = createMockRequest({
        siteKey: 'newsite',
        title: 'New Site',
        tagline: 'A new IFLA site',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(mockExec).toHaveBeenCalledWith(
        'pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Site" --tagline="A new IFLA site"',
        { cwd: '/mock/workspace' },
        expect.any(Function)
      );

      expect(response.status).toBe(200);
      expect(json).toEqual({
        success: true,
        output: 'Site created successfully',
        siteKey: 'newsite',
      });
    });

    it('handles scaffolding script errors', async () => {
      mockExec.mockImplementation((cmd, opts, callback: any) => {
        const error = new Error('Command failed');
        (error as any).stderr = 'Site already exists';
        callback(error, null);
      });

      const request = createMockRequest({
        siteKey: 'existing',
        title: 'Existing Site',
        tagline: 'Test',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Command failed');
      expect(json.stderr).toContain('Site already exists');
    });

    it('handles timeout scenarios', async () => {
      vi.useFakeTimers();
      
      mockExec.mockImplementation((cmd, opts, callback: any) => {
        // Simulate a hanging process
        setTimeout(() => {
          callback(new Error('Timeout'), null);
        }, 60000);
      });

      const request = createMockRequest({
        siteKey: 'test',
        title: 'Test Site',
        tagline: 'Test',
      });

      const responsePromise = POST(request);
      
      // Fast-forward time
      vi.advanceTimersByTime(60000);
      
      const response = await responsePromise;
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Timeout');

      vi.useRealTimers();
    });
  });

  describe('Dataset Handling', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          roles: ['system-admin'],
        },
        expires: new Date().toISOString(),
      });
    });

    it('processes uploaded dataset when provided', async () => {
      mockExec.mockImplementation((cmd, opts, callback: any) => {
        callback(null, { stdout: 'Success with dataset', stderr: '' });
      });

      const mockDataset = {
        type: 'rdf',
        content: '<rdf:RDF>...</rdf:RDF>',
        filename: 'vocabulary.rdf',
      };

      const request = createMockRequest({
        siteKey: 'test',
        title: 'Test Site',
        tagline: 'Test',
        dataset: mockDataset,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      // In real implementation, would verify dataset was saved
    });

    it('validates dataset format', async () => {
      const invalidDataset = {
        type: 'invalid',
        content: 'not valid data',
      };

      const request = createMockRequest({
        siteKey: 'test',
        title: 'Test Site',
        tagline: 'Test',
        dataset: invalidDataset,
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Invalid dataset format');
    });
  });

  describe('Response Handling', () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          roles: ['system-admin'],
        },
        expires: new Date().toISOString(),
      });
    });

    it('includes stdout in success response', async () => {
      const stdoutMessage = `
Creating new site: newsite
✓ Directory structure created
✓ Configuration files generated
✓ Dependencies installed
✓ Site ready at /standards/newsite
      `.trim();

      mockExec.mockImplementation((cmd, opts, callback: any) => {
        callback(null, { stdout: stdoutMessage, stderr: '' });
      });

      const request = createMockRequest({
        siteKey: 'newsite',
        title: 'New Site',
        tagline: 'Test',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.output).toBe(stdoutMessage);
      expect(json.success).toBe(true);
    });

    it('includes stderr warnings in success response', async () => {
      mockExec.mockImplementation((cmd, opts, callback: any) => {
        callback(null, { 
          stdout: 'Site created', 
          stderr: 'Warning: Using default theme version' 
        });
      });

      const request = createMockRequest({
        siteKey: 'test',
        title: 'Test Site',
        tagline: 'Test',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.warnings).toContain('Using default theme version');
    });
  });
});
