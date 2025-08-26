#!/usr/bin/env node

/**
 * Health check routes for Script Inventory API
 */

import { Router, type Request, type Response } from 'express';
import { ScriptDatabase } from '../../database/connection';

export const healthRoutes: Router = Router();

/**
 * Basic health check
 */
healthRoutes.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'script-inventory-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    node: process.version,
  });
});

/**
 * Detailed health check
 */
healthRoutes.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'script-inventory-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    node: process.version,
    memory: process.memoryUsage(),
    checks: {
      database: { status: 'unknown' },
      filesystem: { status: 'unknown' },
    },
  };

  // Check database connection
  try {
    const db = new ScriptDatabase();
    await db.connect();
    const stats = await db.getStats();
    await db.disconnect();

    health.checks.database = {
      status: 'healthy',
      stats: {
        totalScripts: stats.totalScripts,
        totalTags: stats.totalTags,
        totalDependencies: stats.totalDependencies,
        databaseSize: stats.databaseSize,
        lastUpdated: stats.lastUpdated,
      },
    };
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Check filesystem access
  try {
    const fs = await import('fs').then(m => m.promises);
    await fs.access(process.cwd());
    health.checks.filesystem = { status: 'healthy' };
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.filesystem = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Database-specific health check
 */
healthRoutes.get('/db', async (req, res) => {
  try {
    const db = new ScriptDatabase();
    await db.connect();
    
    // Try a simple query
    const stats = await db.getStats();
    await db.disconnect();

    res.json({
      status: 'healthy',
      database: {
        connected: true,
        path: db.getPath(),
        exists: db.exists(),
        stats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default healthRoutes;