#!/usr/bin/env node

/**
 * Express API server for Script Inventory
 * Provides REST endpoints for script management and querying
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ScriptInventory } from '../core/script-inventory';
import { scriptRoutes } from './routes/scripts';
import { healthRoutes } from './routes/health';
import { webhookRoutes } from './routes/webhooks';
import { analyticsRoutes } from './routes/analytics';
import type { ScriptInventoryConfig } from '../types';

export interface ServerOptions {
  port?: number;
  cors?: boolean;
  helmet?: boolean;
  compression?: boolean;
  inventoryConfig?: Partial<ScriptInventoryConfig>;
}

export class ScriptInventoryServer {
  private app: express.Application;
  private inventory: ScriptInventory;
  private server: any;
  private options: Required<ServerOptions>;

  constructor(options: ServerOptions = {}) {
    this.options = {
      port: options.port || 3001,
      cors: options.cors !== false,
      helmet: options.helmet !== false,
      compression: options.compression !== false,
      inventoryConfig: options.inventoryConfig || {},
    };

    this.app = express();
    this.inventory = new ScriptInventory(this.options.inventoryConfig);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Set up Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    if (this.options.helmet) {
      this.app.use(helmet());
    }

    // CORS middleware
    if (this.options.cors) {
      this.app.use(cors({
        origin: process.env.NODE_ENV === 'production' 
          ? ['http://localhost:3000', 'http://localhost:3030'] // /apps/docs ports
          : true,
        credentials: true,
      }));
    }

    // Compression middleware
    if (this.options.compression) {
      this.app.use(compression());
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Set up API routes
   */
  private setupRoutes(): void {
    // Health check routes
    this.app.use('/health', healthRoutes);
    this.app.get('/', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'script-inventory-api',
        timestamp: new Date().toISOString(),
      });
    });

    // Script inventory routes
    this.app.use('/api/scripts', scriptRoutes(this.inventory));
    
    // Webhook routes (Phase 2)
    this.app.use('/api/webhooks', webhookRoutes(this.inventory));
    this.app.use('/api/auto-register', webhookRoutes(this.inventory));
    
    // Analytics routes (Phase 3)
    this.app.use('/api/v3/analytics', analyticsRoutes(this.inventory, { enableWebSocket: true }));

    // API documentation
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Script Inventory API',
        version: '1.0.0',
        description: 'REST API for script inventory management with auto-registration',
        endpoints: {
          health: {
            'GET /health': 'Server health check',
            'GET /health/db': 'Database health check',
          },
          scripts: {
            'GET /api/scripts': 'List all scripts with pagination',
            'GET /api/scripts/:id': 'Get script by ID',
            'GET /api/scripts/search': 'Search scripts with filters',
            'GET /api/scripts/stats': 'Get inventory statistics',
            'GET /api/scripts/deprecated': 'Get deprecated scripts',
            'GET /api/scripts/dependencies': 'Get dependency graph data',
            'POST /api/scripts/register': 'Register a new script',
            'POST /api/scripts/bulk-register': 'Register multiple scripts',
            'POST /api/scripts/validate': 'Validate script documentation',
            'POST /api/scripts/analyze': 'Trigger script analysis',
            'GET /api/scripts/export/:format': 'Export inventory (json/csv/markdown)',
          },
          webhooks: {
            'POST /api/webhooks/github': 'GitHub push event handler',
            'POST /api/webhooks/build': 'Build completion handler',
            'POST /api/webhooks/external': 'External tool integration',
          },
          autoRegister: {
            'POST /api/auto-register/bulk': 'Bulk script registration',
            'POST /api/auto-register/validate-batch': 'Batch validation',
          },
          analyticsV3: {
            'GET /api/v3/analytics/dashboard': 'Analytics dashboard overview',
            'GET /api/v3/analytics/scripts/:id/analyze': 'Comprehensive script analysis',
            'GET /api/v3/analytics/scripts/:id/metrics': 'Script metrics and quality scores',
            'GET /api/v3/analytics/scripts/:id/risks': 'Risk assessment results',
            'GET /api/v3/analytics/scripts/:id/recommendations': 'Improvement recommendations',
            'POST /api/v3/analytics/ml/train': 'Train machine learning models',
            'POST /api/v3/analytics/batch/analyze': 'Batch analysis operations',
            'GET /api/v3/analytics/dashboard/realtime': 'Real-time analytics stream'
          }
        },
        features: [
          'Real-time script monitoring',
          'Pre-commit validation hooks', 
          'Webhook integration',
          'Batch processing',
          'Documentation quality scoring',
          'Auto-registration system',
          'Machine learning quality predictions',
          'Advanced risk assessment',
          'Intelligent recommendations',
          'Real-time analytics dashboard',
          'Performance bottleneck detection',
          'Security vulnerability scanning'
        ],
        github: 'https://github.com/IFLA/standards-dev',
        documentation: '/apps/docs/tools/script-inventory',
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: ['/health', '/api', '/api/scripts', '/api/webhooks', '/api/auto-register'],
      });
    });
  }

  /**
   * Set up error handling middleware
   */
  private setupErrorHandling(): void {
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('API Error:', err);

      // Database connection errors
      if (err.message.includes('Database not connected')) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Database connection error',
          code: 'DB_CONNECTION_ERROR',
        });
      }

      // Validation errors
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Bad Request',
          message: err.message,
          code: 'VALIDATION_ERROR',
        });
      }

      // Webhook signature errors
      if (err.message.includes('Invalid webhook signature')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid webhook signature',
          code: 'INVALID_SIGNATURE',
        });
      }

      // Auto-registration errors
      if (err.name === 'AutoRegistrationError') {
        return res.status(422).json({
          error: 'Unprocessable Entity',
          message: err.message,
          code: 'AUTO_REGISTRATION_ERROR',
        });
      }

      // Default error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : err.message,
        code: 'INTERNAL_ERROR',
      });
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      // Initialize inventory system
      await this.inventory.initialize();
      console.log('✅ Script Inventory initialized');

      // Start HTTP server
      this.server = this.app.listen(this.options.port, () => {
        console.log(`🚀 Script Inventory API server running on port ${this.options.port}`);
        console.log(`📚 API documentation: http://localhost:${this.options.port}/api`);
        console.log(`💚 Health check: http://localhost:${this.options.port}/health`);
        console.log(`🔗 Webhook endpoints: http://localhost:${this.options.port}/api/webhooks`);
        console.log(`🤖 Auto-registration: http://localhost:${this.options.port}/api/auto-register`);
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Stop the server gracefully
   */
  async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down Script Inventory API server...');

    try {
      // Close HTTP server
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => {
            console.log('✅ HTTP server closed');
            resolve();
          });
        });
      }

      // Close database connections
      await this.inventory.close();
      console.log('✅ Database connections closed');

      console.log('👋 Script Inventory API server shut down gracefully');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Get Express app instance (for testing)
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Get inventory instance (for testing)
   */
  getInventory(): ScriptInventory {
    return this.inventory;
  }
}

// Start server if this file is executed directly
if (require.main === module) {
  const server = new ScriptInventoryServer({
    port: parseInt(process.env.PORT || '3001'),
  });

  server.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default ScriptInventoryServer;