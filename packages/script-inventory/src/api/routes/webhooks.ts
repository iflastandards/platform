/**
 * Webhook endpoints for external system integration
 * Supports GitHub, build systems, and custom webhook sources
 */

import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { ScriptInventory } from '../../core/script-inventory';
import { ConfigManager } from '../../automation/config/config-manager';

export interface WebhookPayload {
  source: string;
  event: string;
  timestamp: string;
  data: any;
}

export interface GitHubPushPayload {
  repository: {
    full_name: string;
    clone_url: string;
  };
  commits: Array<{
    id: string;
    message: string;
    added: string[];
    modified: string[];
    removed: string[];
  }>;
  head_commit: {
    id: string;
    message: string;
  };
}

export interface BuildSystemPayload {
  build_id: string;
  status: 'success' | 'failure' | 'cancelled';
  project: string;
  branch: string;
  scripts_created?: string[];
  scripts_modified?: string[];
  scripts_deleted?: string[];
}

export function webhookRoutes(inventory: ScriptInventory): Router {
  const router = Router();
  const configManager = new ConfigManager();

  // Middleware to verify webhook signatures
  const verifySignature = async (req: Request, res: Response, next: Function) => {
    const config = await configManager.loadConfig();
    
    if (!config.webhooks.enabled) {
      return res.status(503).json({
        error: 'Webhooks disabled',
        message: 'Webhook endpoints are disabled in configuration'
      });
    }

    const signature = req.headers['x-hub-signature-256'] as string;
    const secret = config.webhooks.secret;

    if (secret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex')}`;

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid webhook signature'
        });
      }
    }

    next();
  };

  // GitHub webhook handler
  router.post('/github', verifySignature, async (req: Request, res: Response) => {
    try {
      const event = req.headers['x-github-event'] as string;
      const payload = req.body as GitHubPushPayload;

      if (event !== 'push') {
        return res.json({ message: 'Event ignored', event });
      }

      console.log(`📨 GitHub push webhook: ${payload.repository.full_name}`);

      const results = {
        processed: 0,
        registered: 0,
        updated: 0,
        removed: 0,
        errors: [] as string[]
      };

      // Process commits
      for (const commit of payload.commits) {
        // Handle added/modified files
        const changedFiles = [...commit.added, ...commit.modified];
        for (const file of changedFiles) {
          if (isScriptFile(file)) {
            try {
              await inventory.registerScript(file, true);
              results.registered++;
              results.processed++;
            } catch (error) {
              results.errors.push(`Failed to register ${file}: ${error}`);
            }
          }
        }

        // Handle removed files
        for (const file of commit.removed) {
          if (isScriptFile(file)) {
            try {
              await inventory.removeScript(file);
              results.removed++;
              results.processed++;
            } catch (error) {
              results.errors.push(`Failed to remove ${file}: ${error}`);
            }
          }
        }
      }

      res.json({
        message: 'Webhook processed successfully',
        repository: payload.repository.full_name,
        commit: payload.head_commit.id,
        results
      });

    } catch (error) {
      console.error('GitHub webhook error:', error);
      res.status(500).json({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Build system webhook handler
  router.post('/build', verifySignature, async (req: Request, res: Response) => {
    try {
      const payload = req.body as BuildSystemPayload;
      
      console.log(`🔨 Build system webhook: ${payload.project} - ${payload.status}`);

      if (payload.status !== 'success') {
        return res.json({ 
          message: 'Build not successful, skipping script registration',
          build_id: payload.build_id,
          status: payload.status
        });
      }

      const results = {
        processed: 0,
        registered: 0,
        updated: 0,
        removed: 0,
        errors: [] as string[]
      };

      // Process created scripts
      if (payload.scripts_created) {
        for (const script of payload.scripts_created) {
          try {
            await inventory.registerScript(script, false);
            results.registered++;
            results.processed++;
          } catch (error) {
            results.errors.push(`Failed to register new script ${script}: ${error}`);
          }
        }
      }

      // Process modified scripts
      if (payload.scripts_modified) {
        for (const script of payload.scripts_modified) {
          try {
            await inventory.registerScript(script, true);
            results.updated++;
            results.processed++;
          } catch (error) {
            results.errors.push(`Failed to update script ${script}: ${error}`);
          }
        }
      }

      // Process deleted scripts
      if (payload.scripts_deleted) {
        for (const script of payload.scripts_deleted) {
          try {
            await inventory.removeScript(script);
            results.removed++;
            results.processed++;
          } catch (error) {
            results.errors.push(`Failed to remove script ${script}: ${error}`);
          }
        }
      }

      res.json({
        message: 'Build webhook processed successfully',
        build_id: payload.build_id,
        project: payload.project,
        results
      });

    } catch (error) {
      console.error('Build webhook error:', error);
      res.status(500).json({
        error: 'Build webhook processing failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Generic webhook handler for custom integrations
  router.post('/custom', verifySignature, async (req: Request, res: Response) => {
    try {
      const payload = req.body as WebhookPayload;
      
      console.log(`🔗 Custom webhook: ${payload.source} - ${payload.event}`);

      const results = {
        processed: 0,
        registered: 0,
        errors: [] as string[]
      };

      // Basic script registration from payload data
      if (payload.data && payload.data.scripts) {
        for (const scriptPath of payload.data.scripts) {
          try {
            await inventory.registerScript(scriptPath, true);
            results.registered++;
            results.processed++;
          } catch (error) {
            results.errors.push(`Failed to register ${scriptPath}: ${error}`);
          }
        }
      }

      res.json({
        message: 'Custom webhook processed successfully',
        source: payload.source,
        event: payload.event,
        results
      });

    } catch (error) {
      console.error('Custom webhook error:', error);
      res.status(500).json({
        error: 'Custom webhook processing failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Bulk script registration endpoint for build systems
  router.post('/bulk-register', verifySignature, async (req: Request, res: Response) => {
    try {
      const { scripts, force = false, source = 'webhook' } = req.body;

      if (!Array.isArray(scripts) || scripts.length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Scripts array is required and must not be empty'
        });
      }

      console.log(`📦 Bulk registration webhook: ${scripts.length} scripts from ${source}`);

      const results = {
        successful: [] as string[],
        failed: [] as { path: string; error: string }[]
      };

      // Process scripts in parallel batches
      const batchSize = 5;
      for (let i = 0; i < scripts.length; i += batchSize) {
        const batch = scripts.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (scriptPath: string) => {
            try {
              await inventory.registerScript(scriptPath, force);
              results.successful.push(scriptPath);
            } catch (error) {
              results.failed.push({
                path: scriptPath,
                error: error instanceof Error ? error.message : String(error)
              });
            }
          })
        );
      }

      res.json({
        message: `Bulk registration completed`,
        source,
        total: scripts.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results
      });

    } catch (error) {
      console.error('Bulk registration webhook error:', error);
      res.status(500).json({
        error: 'Bulk registration failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Webhook status and configuration endpoint
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const config = await configManager.loadConfig();
      
      res.json({
        enabled: config.webhooks.enabled,
        sources: config.webhooks.sources,
        hasSecret: !!config.webhooks.secret,
        endpoints: {
          github: '/api/webhooks/github',
          build: '/api/webhooks/build',
          custom: '/api/webhooks/custom',
          bulkRegister: '/api/webhooks/bulk-register'
        },
        documentation: {
          github: 'GitHub push events with script file detection',
          build: 'Build system completion notifications',
          custom: 'Generic webhook for custom integrations',
          bulkRegister: 'Bulk script registration for CI/CD systems'
        }
      });

    } catch (error) {
      res.status(500).json({
        error: 'Failed to get webhook status',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Test webhook endpoint for development
  router.post('/test', async (req: Request, res: Response) => {
    try {
      const { type = 'custom', payload = {} } = req.body;
      
      console.log(`🧪 Test webhook: ${type}`);

      res.json({
        message: 'Test webhook received successfully',
        type,
        payload,
        timestamp: new Date().toISOString(),
        headers: {
          'content-type': req.headers['content-type'],
          'x-github-event': req.headers['x-github-event'],
          'user-agent': req.headers['user-agent']
        }
      });

    } catch (error) {
      res.status(500).json({
        error: 'Test webhook failed',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  return router;
}

// Helper function to determine if a file is a script
function isScriptFile(filePath: string): boolean {
  const scriptExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.sh', '.bash', '.zsh', '.fish', '.ps1'];
  const ext = filePath.toLowerCase().split('.').pop();
  
  return scriptExtensions.includes(`.${ext}`) ||
         filePath.toLowerCase().includes('script') ||
         filePath.includes('/scripts/') ||
         filePath.includes('/tools/');
}

export default webhookRoutes;