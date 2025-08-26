#!/usr/bin/env node

/**
 * Auto-Registration System Main Entry Point
 * Exports all automation functionality for the Script Inventory System
 */

import { ConfigManager, configManager } from './config/config-manager';
import { PreCommitHook } from './git-hooks/pre-commit';
import { ValidationPipeline } from './validation/validation-pipeline';
import { ScriptFileWatcher } from './monitoring/file-watcher';

// Configuration Management
export { ConfigManager, configManager } from './config/config-manager';

// Git Hooks
export { PreCommitHook, runPreCommitHook } from './git-hooks/pre-commit';

// Validation System
export { ValidationPipeline } from './validation/validation-pipeline';

// File Monitoring
export { ScriptFileWatcher } from './monitoring/file-watcher';

// Batch Processing (would be implemented in a separate file)
export interface BatchProcessor {
  processQueue(): Promise<void>;
  addJob(job: any): Promise<string>;
  getQueueStatus(): any;
}

// Error Handling
export class AutoRegistrationError extends Error {
  public code: string;
  public context: {
    filePath?: string;
    operation: string;
    timestamp: Date;
    metadata?: any;
  };

  constructor(message: string, code: string, context: Partial<AutoRegistrationError['context']>) {
    super(message);
    this.name = 'AutoRegistrationError';
    this.code = code;
    this.context = {
      operation: 'unknown',
      timestamp: new Date(),
      ...context
    };
  }
}

// Main Auto-Registration Manager
export class AutoRegistrationManager {
  private configManager: ConfigManager;
  private fileWatcher: ScriptFileWatcher;
  private preCommitHook: PreCommitHook;
  private validationPipeline: ValidationPipeline | null = null;
  
  constructor() {
    this.configManager = new ConfigManager();
    this.fileWatcher = new ScriptFileWatcher();
    this.preCommitHook = new PreCommitHook();
  }

  /**
   * Initialize the auto-registration system
   */
  async initialize(): Promise<void> {
    try {
      const config = await this.configManager.loadConfiguration();
      
      if (!config.enabled) {
        console.log('Auto-registration system is disabled');
        return;
      }

      // Initialize validation pipeline
      this.validationPipeline = new ValidationPipeline({
        mode: config.validationMode,
        minDocumentationScore: 60,
        requiredFields: ['purpose', 'usage'],
        customRules: [],
        excludePatterns: config.excludePatterns
      });

      console.log('✅ Auto-registration system initialized');
    } catch (error) {
      throw new AutoRegistrationError(
        'Failed to initialize auto-registration system',
        'INIT_ERROR',
        { operation: 'initialize' }
      );
    }
  }

  /**
   * Start file watching
   */
  async startWatching(): Promise<void> {
    await this.fileWatcher.startWatching();
  }

  /**
   * Stop file watching
   */
  async stopWatching(): Promise<void> {
    await this.fileWatcher.stopWatching();
  }

  /**
   * Run pre-commit validation
   */
  async runPreCommitValidation(): Promise<any> {
    return await this.preCommitHook.validateStagedScripts();
  }

  /**
   * Validate a file with the auto-registration system
   */
  async validateFile(filePath: string): Promise<any> {
    if (!this.validationPipeline) {
      throw new AutoRegistrationError(
        'Validation pipeline not initialized',
        'VALIDATION_ERROR',
        { operation: 'validateFile', filePath }
      );
    }

    const effectiveConfig = await this.configManager.getEffectiveConfig(filePath);
    return await this.validationPipeline.validateScript(filePath, effectiveConfig.validationMode);
  }

  /**
   * Get system configuration
   */
  async getConfiguration(): Promise<any> {
    return await this.configManager.getConfig();
  }

  /**
   * Update configuration
   */
  async updateConfiguration(updates: any): Promise<void> {
    // Implementation would update configuration
    console.log('Configuration update not yet implemented');
  }

  /**
   * Get system status
   */
  getStatus(): any {
    const watcherStats = this.fileWatcher.getStats();
    
    return {
      initialized: this.validationPipeline !== null,
      fileWatcher: {
        running: !!this.fileWatcher,
        stats: watcherStats
      },
      validationPipeline: {
        enabled: this.validationPipeline !== null
      },
      timestamp: new Date()
    };
  }
}

// Default export
export const autoRegistrationManager = new AutoRegistrationManager();

// Utility functions
export const utils = {
  /**
   * Check if a file is a script file
   */
  isScriptFile(filePath: string): boolean {
    const scriptExtensions = ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.py3', '.sh', '.bash', '.zsh'];
    return scriptExtensions.some(ext => filePath.endsWith(ext));
  },

  /**
   * Get script type from file extension
   */
  getScriptType(filePath: string): string {
    const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    
    switch (ext) {
      case '.js':
      case '.mjs':
      case '.cjs':
        return 'javascript';
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.py':
      case '.py3':
        return 'python';
      case '.sh':
      case '.bash':
      case '.zsh':
        return 'shell';
      default:
        return 'unknown';
    }
  },

  /**
   * Validate configuration object
   */
  validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof config.enabled !== 'boolean') {
      errors.push('enabled must be a boolean');
    }

    if (!['strict', 'normal', 'lenient', 'progressive'].includes(config.validationMode)) {
      errors.push('validationMode must be one of: strict, normal, lenient, progressive');
    }

    if (typeof config.batchSize !== 'number' || config.batchSize < 1 || config.batchSize > 100) {
      errors.push('batchSize must be a number between 1 and 100');
    }

    if (typeof config.debounceDelay !== 'number' || config.debounceDelay < 0) {
      errors.push('debounceDelay must be a non-negative number');
    }

    if (!Array.isArray(config.watchDirectories) || config.watchDirectories.length === 0) {
      errors.push('watchDirectories must be a non-empty array');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Type exports for external usage
export type {
  AutoRegistrationConfig,
  ValidationConfig,
  ValidationResult,
  PreCommitValidationResult,
  StagedFile,
  FileSystemEvent,
  FileChange,
  BatchProcessingResult,
  WebhookPayload,
  GitHubWebhookPayload,
  BuildWebhookPayload,
  ExternalScriptPayload
} from '../types';