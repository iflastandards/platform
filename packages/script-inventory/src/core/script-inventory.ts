#!/usr/bin/env node

/**
 * ScriptInventory - Main class for script inventory operations
 * Provides a unified API for all inventory functionality
 */

import { ScriptDatabase } from '../database/connection';
import { DatabaseQueries } from '../database/queries';
import { ScriptAnalyzer } from './analyzer';
import type { 
  SearchQuery, 
  SearchResult, 
  ScriptStats, 
  Script, 
  ExportFormat, 
  ExportOptions,
  ScriptInventoryConfig,
  AnalyzerOptions,
  ValidationResult,
  RegisterScriptRequest,
  RegistrationResult
} from '../types';

export class ScriptInventory {
  private db: ScriptDatabase;
  private queries: DatabaseQueries;
  private analyzer: ScriptAnalyzer;
  private config: ScriptInventoryConfig;

  constructor(config: Partial<ScriptInventoryConfig> = {}) {
    this.config = {
      validationMode: config.validationMode || 'normal',
      minDocScore: config.minDocScore || 60,
      requiredFields: config.requiredFields || ['purpose', 'usage'],
      excludePaths: config.excludePaths || ['**/temp/**', '**/build/**'],
      databasePath: config.databasePath,
      serverPort: config.serverPort || 3001,
      watchDirectories: config.watchDirectories || ['scripts', 'tools'],
    };

    this.db = new ScriptDatabase({
      dbPath: this.config.databasePath,
      verbose: false,
    });
    
    this.queries = new DatabaseQueries(this.db);
    
    this.analyzer = new ScriptAnalyzer({
      directories: this.config.watchDirectories,
      outputPath: this.config.databasePath,
      minDocScore: this.config.minDocScore,
      excludePatterns: this.config.excludePaths,
    });
  }

  /**
   * Initialize the inventory system
   */
  async initialize(): Promise<void> {
    await this.db.connect();
    await this.db.runMigrations();
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await this.db.disconnect();
  }

  /**
   * Analyze all scripts in configured directories
   */
  async analyze(options?: AnalyzerOptions) {
    if (options) {
      // Create temporary analyzer with custom options
      const tempAnalyzer = new ScriptAnalyzer(options);
      return await tempAnalyzer.analyze();
    } else {
      return await this.analyzer.analyze();
    }
  }

  /**
   * Search scripts with advanced filtering
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    await this.ensureConnected();
    return await this.queries.searchScripts(query);
  }

  /**
   * Get script by ID
   */
  async getScript(id: string): Promise<Script | null> {
    await this.ensureConnected();
    const script = await this.queries.getScript(id);
    
    if (script) {
      // Enrich with related data
      const [cliOptions, tags, dependencies] = await Promise.all([
        this.queries.getCliOptions(id),
        this.queries.getTags(id),
        this.queries.getDependencies(id),
      ]);

      script.metadata.cliOptions = cliOptions;
      script.metadata.tags = tags;
      script.metadata.dependencies = dependencies;
    }

    return script;
  }

  /**
   * Get script by file path
   */
  async getScriptByPath(path: string): Promise<Script | null> {
    await this.ensureConnected();
    return await this.queries.getScriptByPath(path);
  }

  /**
   * Get all scripts
   */
  async getAllScripts(): Promise<Script[]> {
    await this.ensureConnected();
    return await this.queries.getAllScripts();
  }

  /**
   * Get inventory statistics
   */
  async getStats(): Promise<ScriptStats> {
    await this.ensureConnected();
    return await this.queries.getScriptStats();
  }

  /**
   * Get deprecated scripts
   */
  async getDeprecatedScripts(): Promise<Script[]> {
    const result = await this.search({
      excludeDeprecated: false,
      limit: 1000,
    });
    
    return result.scripts.filter(script => script.isDeprecated);
  }

  /**
   * Get CLI scripts
   */
  async getCliScripts(): Promise<Script[]> {
    const result = await this.search({
      limit: 1000,
    });
    
    return result.scripts.filter(script => script.isCli);
  }

  /**
   * Get scripts by type
   */
  async getScriptsByType(type: string): Promise<Script[]> {
    const result = await this.search({
      type: [type as any],
      limit: 1000,
    });
    
    return result.scripts;
  }

  /**
   * Register a single script
   */
  async registerScript(request: RegisterScriptRequest): Promise<RegistrationResult> {
    try {
      await this.ensureConnected();
      
      const wasUpdated = await this.analyzer.analyzeScript(request.path);
      const script = await this.getScriptByPath(request.path);
      
      if (!script) {
        return {
          success: false,
          errors: [`Failed to register script: ${request.path}`],
          warnings: [],
        };
      }

      return {
        success: true,
        scriptId: script.id,
        errors: [],
        warnings: wasUpdated ? ['Script was updated'] : [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
      };
    }
  }

  /**
   * Validate script documentation
   */
  async validateScript(path: string): Promise<ValidationResult> {
    try {
      const script = await this.getScriptByPath(path);
      
      if (!script) {
        return {
          isValid: false,
          score: 0,
          missing: ['Script not found in inventory'],
          suggestions: ['Register the script first'],
          errors: [{ field: 'path', message: 'Script not found', severity: 'error' }],
        };
      }

      const missing: string[] = [];
      const suggestions: string[] = [];
      const errors: ValidationResult['errors'] = [];

      // Check required fields
      for (const field of this.config.requiredFields) {
        if (field === 'purpose' && (!script.purpose || script.purpose === 'No description available')) {
          missing.push('purpose');
          errors.push({ field: 'purpose', message: 'Script purpose is required', severity: 'error' });
        }
        
        if (field === 'usage' && !script.metadata.usage) {
          missing.push('usage');
          errors.push({ field: 'usage', message: 'Usage documentation is required', severity: 'error' });
        }
      }

      // Generate suggestions
      if (script.docScore < 70) {
        suggestions.push('Add more detailed documentation');
      }
      
      if (!script.hasHelpOption && script.isCli) {
        suggestions.push('Add --help option for CLI scripts');
      }

      if (!script.metadata.examples || script.metadata.examples.length === 0) {
        suggestions.push('Add usage examples');
      }

      const isValid = missing.length === 0 && 
                     script.docScore >= this.config.minDocScore;

      return {
        isValid,
        score: script.docScore,
        missing,
        suggestions,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        score: 0,
        missing: ['Validation failed'],
        suggestions: [],
        errors: [{ 
          field: 'general', 
          message: error instanceof Error ? error.message : String(error), 
          severity: 'error' 
        }],
      };
    }
  }

  /**
   * Export inventory in various formats
   */
  async export(options: ExportOptions): Promise<string> {
    const scripts = await this.getAllScripts();
    
    // Apply filters
    let filteredScripts = scripts;
    
    if (!options.includeDeprecated) {
      filteredScripts = filteredScripts.filter(s => !s.isDeprecated);
    }
    
    if (options.filterByType && options.filterByType.length > 0) {
      filteredScripts = filteredScripts.filter(s => 
        options.filterByType!.includes(s.type)
      );
    }

    switch (options.format) {
      case 'json':
        return this.exportAsJson(filteredScripts, options);
      case 'csv':
        return this.exportAsCsv(filteredScripts, options);
      case 'markdown':
        return this.exportAsMarkdown(filteredScripts, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Get dependency graph data
   */
  async getDependencyGraph(): Promise<any> {
    await this.ensureConnected();
    
    const scripts = await this.getAllScripts();
    const nodes = scripts.map(script => ({
      id: script.id,
      label: script.name,
      type: script.type,
      deprecated: script.isDeprecated,
    }));

    // TODO: Build actual dependency relationships
    // This would require analyzing import/require statements
    const edges: any[] = [];

    return { nodes, edges };
  }

  /**
   * Ensure database connection
   */
  private async ensureConnected(): Promise<void> {
    if (!this.db.db) {
      await this.initialize();
    }
  }

  /**
   * Export as JSON
   */
  private exportAsJson(scripts: Script[], options: ExportOptions): string {
    const data = options.includeMetadata 
      ? scripts 
      : scripts.map(({ metadata, ...script }) => script);
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export as CSV
   */
  private exportAsCsv(scripts: Script[], options: ExportOptions): string {
    const headers = [
      'path', 'name', 'type', 'purpose', 'is_cli', 'is_test', 
      'is_deprecated', 'doc_score', 'last_modified'
    ];

    const rows = scripts.map(script => [
      script.path,
      script.name,
      script.type,
      script.purpose,
      script.isCli,
      script.isTest,
      script.isDeprecated,
      script.docScore,
      script.lastModified.toISOString(),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(','))
    ].join('\n');
  }

  /**
   * Export as Markdown
   */
  private exportAsMarkdown(scripts: Script[], options: ExportOptions): string {
    const lines = [
      '# Script Inventory',
      '',
      `Generated on ${new Date().toISOString()}`,
      '',
      `Total scripts: ${scripts.length}`,
      '',
    ];

    // Group by type
    const groupedScripts = scripts.reduce((acc, script) => {
      if (!acc[script.type]) acc[script.type] = [];
      acc[script.type].push(script);
      return acc;
    }, {} as Record<string, Script[]>);

    for (const [type, typeScripts] of Object.entries(groupedScripts)) {
      lines.push(`## ${type.charAt(0).toUpperCase() + type.slice(1)} Scripts`);
      lines.push('');

      for (const script of typeScripts) {
        lines.push(`### ${script.name}`);
        lines.push('');
        lines.push(`**Path:** \`${script.path}\``);
        lines.push(`**Purpose:** ${script.purpose}`);
        lines.push(`**Documentation Score:** ${script.docScore}/100`);
        
        if (script.isCli) {
          lines.push('**Type:** CLI Tool');
        }
        
        if (script.isDeprecated) {
          lines.push('**Status:** ⚠️ Deprecated');
        }
        
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Get database instance for advanced operations
   */
  getDatabase() {
    return this.db;
  }
}