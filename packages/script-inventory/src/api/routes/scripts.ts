#!/usr/bin/env node

/**
 * Script management routes for Script Inventory API
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ScriptInventory } from '../../core/script-inventory';
import type { 
  SearchQuery, 
  RegisterScriptRequest, 
  BulkRegisterRequest,
  ExportFormat 
} from '../../types';

export function scriptRoutes(inventory: ScriptInventory): Router {
  const router = Router();

  /**
   * GET /api/scripts - List all scripts with pagination
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: SearchQuery = {
        keywords: req.query.keywords ? String(req.query.keywords).split(',') : undefined,
        type: req.query.type ? String(req.query.type).split(',') as any : undefined,
        excludeDeprecated: req.query.excludeDeprecated === 'true',
        minDocScore: req.query.minDocScore ? parseInt(String(req.query.minDocScore)) : undefined,
        tags: req.query.tags ? String(req.query.tags).split(',') : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit)) : 50,
        offset: req.query.offset ? parseInt(String(req.query.offset)) : 0,
      };

      const result = await inventory.search(query);
      res.json({
        success: true,
        data: result,
        meta: {
          total: result.total,
          page: Math.floor(result.offset / result.limit) + 1,
          totalPages: Math.ceil(result.total / result.limit),
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/scripts/search - Search scripts with query parameters
   */
  router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: SearchQuery = {
        keywords: req.query.q ? String(req.query.q).split(/\s+/) : undefined,
        type: req.query.type ? String(req.query.type).split(',') as any : undefined,
        excludeDeprecated: req.query.excludeDeprecated !== 'false',
        minDocScore: req.query.minDocScore ? parseInt(String(req.query.minDocScore)) : undefined,
        tags: req.query.tags ? String(req.query.tags).split(',') : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit)) : 50,
        offset: req.query.offset ? parseInt(String(req.query.offset)) : 0,
      };

      const result = await inventory.search(query);
      res.json({
        success: true,
        query: req.query.q || '',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/scripts/stats - Get inventory statistics
   */
  router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await inventory.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/scripts/deprecated - Get deprecated scripts
   */
  router.get('/deprecated', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const scripts = await inventory.getDeprecatedScripts();
      res.json({
        success: true,
        data: {
          scripts,
          count: scripts.length,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/scripts/dependencies - Get dependency graph data
   */
  router.get('/dependencies', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const graph = await inventory.getDependencyGraph();
      res.json({
        success: true,
        data: graph,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/scripts/export/:format - Export inventory
   */
  router.get('/export/:format', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = req.params.format as ExportFormat;
      
      if (!['json', 'csv', 'markdown'].includes(format)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid export format. Use: json, csv, markdown',
        });
      }

      const includeMetadata = req.query.includeMetadata === 'true';
      const includeDeprecated = req.query.includeDeprecated !== 'false';
      const filterByType = req.query.type ? String(req.query.type).split(',') as any : undefined;

      const exportData = await inventory.export({
        format,
        includeMetadata,
        includeDeprecated,
        filterByType,
      });

      // Set appropriate content type
      const contentTypes = {
        json: 'application/json',
        csv: 'text/csv',
        markdown: 'text/markdown',
      };

      const filenames = {
        json: 'script-inventory.json',
        csv: 'script-inventory.csv',
        markdown: 'script-inventory.md',
      };

      res.setHeader('Content-Type', contentTypes[format]);
      res.setHeader('Content-Disposition', `attachment; filename="${filenames[format]}"`);
      res.send(exportData);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/scripts/:id - Get script by ID
   */
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const script = await inventory.getScript(req.params.id);
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Script not found',
          id: req.params.id,
        });
      }

      res.json({
        success: true,
        data: script,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/scripts/register - Register a single script
   */
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request: RegisterScriptRequest = req.body;
      
      if (!request.path) {
        return res.status(400).json({
          success: false,
          error: 'Script path is required',
        });
      }

      const result = await inventory.registerScript(request);
      
      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json({
        success: result.success,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/scripts/bulk-register - Register multiple scripts
   */
  router.post('/bulk-register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request: BulkRegisterRequest = req.body;
      
      if (!request.scripts || !Array.isArray(request.scripts)) {
        return res.status(400).json({
          success: false,
          error: 'Scripts array is required',
        });
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const scriptRequest of request.scripts) {
        try {
          const result = await inventory.registerScript(scriptRequest);
          results.push(result);
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          const errorResult = {
            success: false,
            scriptId: undefined,
            errors: [error instanceof Error ? error.message : String(error)],
            warnings: [],
          };
          results.push(errorResult);
          errorCount++;
        }
      }

      res.json({
        success: errorCount === 0,
        data: {
          results,
          summary: {
            total: request.scripts.length,
            successful: successCount,
            failed: errorCount,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/scripts/validate - Validate script documentation
   */
  router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { path } = req.body;
      
      if (!path) {
        return res.status(400).json({
          success: false,
          error: 'Script path is required',
        });
      }

      const result = await inventory.validateScript(path);
      
      res.json({
        success: result.isValid,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/scripts/analyze - Trigger script analysis
   */
  router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const options = req.body;
      const result = await inventory.analyze(options);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default scriptRoutes;