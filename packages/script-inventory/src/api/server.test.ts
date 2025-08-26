/**
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { ScriptInventoryServer } from './server';
import type { Script } from '../types';

// Mock ScriptInventory
vi.mock('../core/script-inventory', () => ({
  ScriptInventory: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    close: vi.fn(),
    getScripts: vi.fn(),
    getScript: vi.fn(),
    getScriptCount: vi.fn(),
    searchScripts: vi.fn(),
    getStats: vi.fn(),
    getDeprecatedScripts: vi.fn(),
    getDependencies: vi.fn(),
    registerScript: vi.fn(),
    registerScripts: vi.fn(),
    validateScript: vi.fn(),
    analyze: vi.fn(),
    exportData: vi.fn()
  }))
}));

describe('ScriptInventoryServer @integration @api', () => {
  let server: ScriptInventoryServer;
  let app: any;
  let mockInventory: any;

  beforeEach(async () => {
    server = new ScriptInventoryServer({ port: 0 }); // Use port 0 for testing
    app = server.getApp();
    mockInventory = server.getInventory();
    
    // Mock inventory initialization
    mockInventory.initialize.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await server.shutdown();
    vi.clearAllMocks();
  });

  describe('health endpoints @critical', () => {
    it('should respond to root health check', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        service: 'script-inventory-api',
        timestamp: expect.any(String)
      });
    });

    it('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'script-inventory-api',
        uptime: expect.any(Number),
        version: '1.0.0'
      });
    });

    it('should provide API documentation', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'Script Inventory API',
        version: '1.0.0',
        description: 'REST API for script inventory management',
        endpoints: expect.any(Object)
      });
    });
  });

  describe('script endpoints @integration @api', () => {
    const mockScript: Script = {
      id: 'test-script',
      path: '/test/script.js',
      name: 'test-script',
      type: 'utility',
      purpose: 'Test script',
      description: 'A test script',
      author: 'Test Author',
      version: '1.0.0',
      tags: ['test'],
      dependencies: [],
      lastModified: new Date(),
      lastAnalyzed: new Date(),
      documentationScore: 0.8,
      deprecated: false,
      usage: 'node script.js',
      fileInfo: { size: 1024, extension: '.js' },
      packageReferences: []
    };

    describe('GET /api/scripts @integration', () => {
      it('should list scripts with pagination', async () => {
        mockInventory.getScripts.mockResolvedValue([mockScript]);
        mockInventory.getScriptCount.mockResolvedValue(1);

        const response = await request(app)
          .get('/api/scripts')
          .expect(200);

        expect(response.body).toEqual({
          scripts: [mockScript],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            limit: 50
          }
        });
      });

      it('should handle pagination parameters', async () => {
        mockInventory.getScripts.mockResolvedValue([mockScript]);
        mockInventory.getScriptCount.mockResolvedValue(100);

        const response = await request(app)
          .get('/api/scripts?page=2&limit=10')
          .expect(200);

        expect(mockInventory.getScripts).toHaveBeenCalledWith({
          limit: 10,
          offset: 10
        });

        expect(response.body.pagination).toEqual({
          currentPage: 2,
          totalPages: 10,
          totalCount: 100,
          limit: 10
        });
      });
    });

    describe('GET /api/scripts/:id @integration', () => {
      it('should get script by ID', async () => {
        mockInventory.getScript.mockResolvedValue(mockScript);

        const response = await request(app)
          .get(`/api/scripts/${mockScript.id}`)
          .expect(200);

        expect(response.body).toEqual(mockScript);
        expect(mockInventory.getScript).toHaveBeenCalledWith(mockScript.id);
      });

      it('should return 404 for non-existent script', async () => {
        mockInventory.getScript.mockResolvedValue(null);

        const response = await request(app)
          .get('/api/scripts/non-existent')
          .expect(404);

        expect(response.body).toEqual({
          error: 'Script not found',
          id: 'non-existent'
        });
      });
    });

    describe('GET /api/scripts/search @integration', () => {
      it('should search scripts with filters', async () => {
        const searchResults = { scripts: [mockScript], total: 1 };
        mockInventory.searchScripts.mockResolvedValue(searchResults);

        const response = await request(app)
          .get('/api/scripts/search?keywords=test&type=utility')
          .expect(200);

        expect(response.body).toEqual(searchResults);
        expect(mockInventory.searchScripts).toHaveBeenCalledWith({
          keywords: ['test'],
          type: 'utility',
          tags: undefined,
          deprecated: false,
          minDocumentationScore: undefined,
          limit: 50,
          offset: 0
        });
      });
    });

    describe('GET /api/scripts/stats @integration', () => {
      it('should return inventory statistics', async () => {
        const mockStats = {
          totalScripts: 10,
          totalTags: 5,
          avgDocumentationScore: 0.8
        };
        mockInventory.getStats.mockResolvedValue(mockStats);

        const response = await request(app)
          .get('/api/scripts/stats')
          .expect(200);

        expect(response.body).toEqual(mockStats);
      });
    });

    describe('POST /api/scripts/register @integration', () => {
      it('should register a new script', async () => {
        mockInventory.registerScript.mockResolvedValue(mockScript);

        const response = await request(app)
          .post('/api/scripts/register')
          .send({ path: '/test/script.js' })
          .expect(201);

        expect(response.body).toEqual({
          message: 'Script registered successfully',
          script: mockScript
        });
        expect(mockInventory.registerScript).toHaveBeenCalledWith('/test/script.js', false);
      });

      it('should validate request body', async () => {
        const response = await request(app)
          .post('/api/scripts/register')
          .send({})
          .expect(400);

        expect(response.body).toEqual({
          error: 'Invalid request',
          message: 'Script path is required and must be a string'
        });
      });
    });

    describe('POST /api/scripts/bulk-register @integration', () => {
      it('should register multiple scripts', async () => {
        const bulkResults = {
          successful: [mockScript],
          failed: []
        };
        mockInventory.registerScripts.mockResolvedValue(bulkResults);

        const response = await request(app)
          .post('/api/scripts/bulk-register')
          .send({ paths: ['/test/script1.js', '/test/script2.js'] })
          .expect(201);

        expect(response.body).toEqual({
          message: 'Registered 1 scripts',
          results: bulkResults
        });
      });

      it('should validate paths array', async () => {
        const response = await request(app)
          .post('/api/scripts/bulk-register')
          .send({ paths: [] })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Invalid request',
          message: 'Paths array is required and must not be empty'
        });
      });
    });

    describe('POST /api/scripts/validate @integration', () => {
      it('should validate script documentation', async () => {
        const validation = {
          isValid: true,
          score: 0.9,
          issues: []
        };
        mockInventory.validateScript.mockResolvedValue(validation);

        const response = await request(app)
          .post('/api/scripts/validate')
          .send({ path: '/test/script.js' })
          .expect(200);

        expect(response.body).toEqual(validation);
      });
    });

    describe('GET /api/scripts/export/:format @integration', () => {
      it('should export inventory as JSON', async () => {
        const exportData = { scripts: [mockScript] };
        mockInventory.exportData.mockResolvedValue(JSON.stringify(exportData));

        const response = await request(app)
          .get('/api/scripts/export/json')
          .expect(200);

        expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
        expect(response.headers['content-disposition']).toBe('attachment; filename=\"script-inventory.json\"');
        expect(JSON.parse(response.text)).toEqual(exportData);
      });

      it('should validate export format', async () => {
        const response = await request(app)
          .get('/api/scripts/export/invalid')
          .expect(400);

        expect(response.body).toEqual({
          error: 'Invalid format',
          message: 'Format must be json, csv, or markdown'
        });
      });
    });
  });

  describe('error handling @critical @error-handling', () => {
    it('should handle 404 routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Route GET /non-existent-route not found',
        availableRoutes: ['/health', '/api', '/api/scripts']
      });
    });

    it('should handle database connection errors', async () => {
      mockInventory.getScripts.mockRejectedValue(new Error('Database not connected'));

      const response = await request(app)
        .get('/api/scripts')
        .expect(503);

      expect(response.body).toEqual({
        error: 'Service Unavailable',
        message: 'Database connection error',
        code: 'DB_CONNECTION_ERROR'
      });
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid script format');
      validationError.name = 'ValidationError';
      mockInventory.registerScript.mockRejectedValue(validationError);

      const response = await request(app)
        .post('/api/scripts/register')
        .send({ path: '/invalid/script.js' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: 'Invalid script format',
        code: 'VALIDATION_ERROR'
      });
    });

    it('should handle internal server errors', async () => {
      mockInventory.getScripts.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .get('/api/scripts')
        .expect(500);

      expect(response.body.error).toBe('Internal Server Error');
      expect(response.body.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('middleware configuration @integration', () => {
    it('should set security headers when helmet enabled', async () => {
      const secureServer = new ScriptInventoryServer({ helmet: true });
      const secureApp = secureServer.getApp();

      const response = await request(secureApp)
        .get('/')
        .expect(200);

      // Helmet should add security headers
      expect(response.headers).toHaveProperty('x-frame-options');
      
      await secureServer.shutdown();
    });

    it('should handle CORS when enabled', async () => {
      const corsServer = new ScriptInventoryServer({ cors: true });
      const corsApp = corsServer.getApp();

      const response = await request(corsApp)
        .options('/api/scripts')
        .set('Origin', 'http://localhost:3000')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      
      await corsServer.shutdown();
    });
  });
});