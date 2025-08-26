/**
 * Configuration Management System for Script Inventory Auto-Registration
 * Supports multiple configuration sources with priority-based merging
 */

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

// Configuration Schema with Zod validation
export const AutoRegistrationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  mode: z.enum(['strict', 'normal', 'lenient', 'progressive']).default('normal'),
  
  validation: z.object({
    minDocumentationScore: z.number().min(0).max(1).default(0.6),
    requiredFields: z.array(z.string()).default(['purpose', 'usage']),
    allowUndocumented: z.boolean().default(false),
    customRules: z.array(z.string()).default([])
  }).default({}),

  monitoring: z.object({
    enabled: z.boolean().default(true),
    watchPatterns: z.array(z.string()).default(['**/*.{js,ts,py,sh,bash}']),
    excludePatterns: z.array(z.string()).default(['**/node_modules/**', '**/dist/**', '**/.git/**']),
    batchSize: z.number().min(1).max(100).default(10),
    debounceMs: z.number().min(100).max(5000).default(1000)
  }).default({}),

  hooks: z.object({
    preCommit: z.object({
      enabled: z.boolean().default(true),
      failOnError: z.boolean().default(true),
      bypassKeyword: z.string().default('--skip-script-validation')
    }).default({})
  }).default({}),

  webhooks: z.object({
    enabled: z.boolean().default(false),
    secret: z.string().optional(),
    sources: z.array(z.enum(['github', 'gitlab', 'bitbucket', 'custom'])).default([])
  }).default({}),

  directories: z.array(z.string()).default(['scripts', 'tools']),
  outputPath: z.string().default('./script-inventory.db')
});

export type AutoRegistrationConfig = z.infer<typeof AutoRegistrationConfigSchema>;

export interface ConfigSource {
  name: string;
  priority: number;
  load(): Promise<Partial<AutoRegistrationConfig>>;
}

export class ConfigManager {
  private config: AutoRegistrationConfig | null = null;
  private sources: ConfigSource[] = [];
  private watchers: Map<string, any> = new Map();

  constructor() {
    this.registerDefaultSources();
  }

  private registerDefaultSources() {
    // Environment variables (highest priority)
    this.addSource({
      name: 'environment',
      priority: 100,
      load: async () => this.loadFromEnvironment()
    });

    // package.json configuration
    this.addSource({
      name: 'package.json',
      priority: 80,
      load: async () => this.loadFromPackageJson()
    });

    // Directory-specific .script-inventory.json files
    this.addSource({
      name: 'directory-config',
      priority: 60,
      load: async () => this.loadFromDirectoryConfig()
    });

    // Default configuration (lowest priority)
    this.addSource({
      name: 'defaults',
      priority: 10,
      load: async () => ({})
    });
  }

  addSource(source: ConfigSource) {
    this.sources.push(source);
    this.sources.sort((a, b) => b.priority - a.priority);
  }

  async loadConfig(): Promise<AutoRegistrationConfig> {
    const merged: Partial<AutoRegistrationConfig> = {};

    // Load from all sources in priority order (highest first)
    for (const source of this.sources) {
      try {
        const sourceConfig = await source.load();
        this.mergeConfig(merged, sourceConfig);
      } catch (error) {
        console.warn(`Failed to load config from ${source.name}:`, error);
      }
    }

    // Validate and set defaults
    this.config = AutoRegistrationConfigSchema.parse(merged);
    return this.config;
  }

  private mergeConfig(target: any, source: any) {
    for (const [key, value] of Object.entries(source)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        target[key] = target[key] || {};
        this.mergeConfig(target[key], value);
      } else {
        target[key] = value;
      }
    }
  }

  private async loadFromEnvironment(): Promise<Partial<AutoRegistrationConfig>> {
    const env = process.env;
    
    return {
      enabled: env.SCRIPT_INVENTORY_ENABLED === 'true',
      mode: env.SCRIPT_INVENTORY_MODE as any,
      validation: {
        minDocumentationScore: env.SCRIPT_INVENTORY_MIN_DOC_SCORE ? 
          parseFloat(env.SCRIPT_INVENTORY_MIN_DOC_SCORE) : undefined,
        allowUndocumented: env.SCRIPT_INVENTORY_ALLOW_UNDOCUMENTED === 'true'
      },
      monitoring: {
        enabled: env.SCRIPT_INVENTORY_MONITORING === 'true',
        batchSize: env.SCRIPT_INVENTORY_BATCH_SIZE ? 
          parseInt(env.SCRIPT_INVENTORY_BATCH_SIZE) : undefined,
        debounceMs: env.SCRIPT_INVENTORY_DEBOUNCE_MS ? 
          parseInt(env.SCRIPT_INVENTORY_DEBOUNCE_MS) : undefined
      },
      webhooks: {
        enabled: env.SCRIPT_INVENTORY_WEBHOOKS === 'true',
        secret: env.SCRIPT_INVENTORY_WEBHOOK_SECRET
      },
      directories: env.SCRIPT_INVENTORY_DIRS?.split(','),
      outputPath: env.SCRIPT_INVENTORY_DB_PATH
    };
  }

  private async loadFromPackageJson(): Promise<Partial<AutoRegistrationConfig>> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      return packageJson.scriptInventory || {};
    } catch {
      return {};
    }
  }

  private async loadFromDirectoryConfig(): Promise<Partial<AutoRegistrationConfig>> {
    const configs: Partial<AutoRegistrationConfig>[] = [];
    
    // Look for .script-inventory.json files in current and parent directories
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const configPath = path.join(currentDir, '.script-inventory.json');
      
      try {
        const configContent = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        configs.push(config);
      } catch {
        // Config file doesn't exist or is invalid
      }

      currentDir = path.dirname(currentDir);
    }

    // Merge configs from deepest to shallowest directory
    const merged: Partial<AutoRegistrationConfig> = {};
    for (const config of configs.reverse()) {
      this.mergeConfig(merged, config);
    }

    return merged;
  }

  async updateConfig(updates: Partial<AutoRegistrationConfig>): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }

    this.mergeConfig(this.config!, updates);
    this.config = AutoRegistrationConfigSchema.parse(this.config);
  }

  getConfig(): AutoRegistrationConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  async watchConfig(callback: (config: AutoRegistrationConfig) => void) {
    const watchPaths = [
      path.join(process.cwd(), 'package.json'),
      path.join(process.cwd(), '.script-inventory.json')
    ];

    for (const watchPath of watchPaths) {
      try {
        const { default: chokidar } = await import('chokidar');
        const watcher = chokidar.watch(watchPath, { ignoreInitial: true });
        
        watcher.on('change', async () => {
          try {
            const newConfig = await this.loadConfig();
            callback(newConfig);
          } catch (error) {
            console.error('Failed to reload config:', error);
          }
        });

        this.watchers.set(watchPath, watcher);
      } catch (error) {
        console.warn(`Failed to watch config file ${watchPath}:`, error);
      }
    }
  }

  async stopWatching() {
    for (const [path, watcher] of this.watchers) {
      try {
        await watcher.close();
      } catch (error) {
        console.warn(`Failed to close watcher for ${path}:`, error);
      }
    }
    this.watchers.clear();
  }

  // Validation helpers
  validateCustomRule(rule: string, scriptData: any): boolean {
    try {
      // Simple JavaScript expression evaluation
      // In production, consider using a sandboxed environment
      const func = new Function('script', `return ${rule}`);
      return !!func(scriptData);
    } catch {
      return false;
    }
  }

  getDirectorySpecificConfig(directory: string): AutoRegistrationConfig {
    // This could be extended to support directory-specific configuration overrides
    return this.getConfig();
  }
}