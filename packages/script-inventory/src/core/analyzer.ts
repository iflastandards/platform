/**
 * Script Analyzer - Main analysis engine
 * Converted to TypeScript from scripts/script-inventory/analyze-fixed.js
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ScriptDatabase } from '../database/connection';
import { DatabaseQueries } from '../database/queries';
import { scriptParser } from './parser';
import { fileExtractor } from './extractors';
import type { Script, ScriptType } from '../types';

export interface AnalyzerOptions {
  directories?: string[];
  outputPath?: string;
  verbose?: boolean;
  minDocScore?: number;
  excludePatterns?: string[];
  includeDeprecated?: boolean;
}

export interface AnalysisResult {
  totalAnalyzed: number;
  newScripts: number;
  updatedScripts: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

export class ScriptAnalyzer {
  private db: ScriptDatabase;
  private queries: DatabaseQueries;
  private options: Required<AnalyzerOptions>;

  constructor(options: AnalyzerOptions = {}) {
    this.options = {
      directories: options.directories || ['scripts', 'tools'],
      outputPath: options.outputPath || path.join(process.cwd(), 'scripts', 'script-inventory', 'output', 'script-inventory', 'inventory.db'),
      verbose: options.verbose || false,
      minDocScore: options.minDocScore || 0,
      excludePatterns: options.excludePatterns || [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
        '**/*.min.js',
        '**/*.d.ts',
      ],
      includeDeprecated: options.includeDeprecated || true,
    };

    this.db = new ScriptDatabase({
      dbPath: this.options.outputPath,
      verbose: this.options.verbose,
    });
    this.queries = new DatabaseQueries(this.db);
  }

  /**
   * Analyze all scripts in the specified directories
   */
  async analyze(): Promise<AnalysisResult> {
    const startTime = Date.now();
    const result: AnalysisResult = {
      totalAnalyzed: 0,
      newScripts: 0,
      updatedScripts: 0,
      errors: [],
      warnings: [],
      duration: 0,
    };

    try {
      // Connect to database
      await this.db.connect();
      await this.db.runMigrations();

      if (this.options.verbose) {
        console.log('🔍 Starting script analysis...');
        console.log(`📁 Directories: ${this.options.directories.join(', ')}`);
      }

      // Find all script files
      const scriptFiles = await this.findScriptFiles();
      
      if (this.options.verbose) {
        console.log(`📄 Found ${scriptFiles.length} script files`);
      }

      // Analyze each script
      for (const filePath of scriptFiles) {
        try {
          const wasUpdated = await this.analyzeScript(filePath);
          result.totalAnalyzed++;
          
          if (wasUpdated) {
            result.updatedScripts++;
          } else {
            result.newScripts++;
          }

          if (this.options.verbose && result.totalAnalyzed % 10 === 0) {
            console.log(`✓ Analyzed ${result.totalAnalyzed}/${scriptFiles.length} scripts`);
          }
        } catch (error) {
          const errorMsg = `Failed to analyze ${filePath}: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          
          if (this.options.verbose) {
            console.error(`❌ ${errorMsg}`);
          }
        }
      }

      // Clean up deleted scripts
      await this.cleanupDeletedScripts();

      result.duration = Date.now() - startTime;

      if (this.options.verbose) {
        console.log('\n📊 Analysis Complete:');
        console.log(`  📄 Total analyzed: ${result.totalAnalyzed}`);
        console.log(`  🆕 New scripts: ${result.newScripts}`);
        console.log(`  🔄 Updated scripts: ${result.updatedScripts}`);
        console.log(`  ❌ Errors: ${result.errors.length}`);
        console.log(`  ⚠️  Warnings: ${result.warnings.length}`);
        console.log(`  ⏱️  Duration: ${result.duration}ms`);
      }

    } catch (error) {
      result.errors.push(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      await this.db.disconnect();
    }

    return result;
  }

  /**
   * Analyze a single script file
   */
  async analyzeScript(filePath: string): Promise<boolean> {
    // Get file information
    const fileInfo = await fileExtractor.extractFileInfo(filePath);
    
    // Check if script has changed since last analysis
    const existingScript = await this.queries.getScriptByPath(filePath);
    if (existingScript && existingScript.fileHash === fileInfo.hash) {
      return false; // No changes, skip
    }

    // Parse script metadata
    const parsedScript = await scriptParser.parseScript(filePath);
    
    // Extract package.json references
    const packageReferences = await fileExtractor.findPackageJsonReferences(filePath);
    
    // Extract dependencies
    const dependencies = await fileExtractor.extractDependencies(filePath);

    // Create script object
    const script: Omit<Script, 'id'> = {
      path: filePath,
      name: fileInfo.fileName,
      type: parsedScript.type,
      purpose: parsedScript.purpose,
      fileHash: fileInfo.hash,
      fileSize: fileInfo.size,
      isCli: parsedScript.isCli,
      isTest: parsedScript.isTest,
      isDeprecated: parsedScript.isDeprecated,
      hasHelpOption: parsedScript.hasHelpOption,
      hasManOption: parsedScript.hasManOption,
      lastModified: fileInfo.modified,
      lastAnalyzed: new Date(),
      docScore: parsedScript.docScore,
      metadata: {
        ...parsedScript,
        fileInfo,
        packageReferences,
        dependencies: [], // Will be set separately
      },
    };

    // Skip if below minimum doc score and not including deprecated
    if (!this.options.includeDeprecated && script.isDeprecated) {
      return false;
    }

    if (script.docScore < this.options.minDocScore) {
      return false;
    }

    // Save script to database
    const scriptId = await this.queries.upsertScript(script);

    // Save related data
    if (parsedScript.cliOptions.length > 0) {
      await this.queries.insertCliOptions(scriptId, parsedScript.cliOptions);
    }

    if (parsedScript.tags.length > 0) {
      await this.queries.insertTags(scriptId, parsedScript.tags);
    }

    if (dependencies.length > 0) {
      await this.queries.insertDependencies(scriptId, dependencies);
    }

    return Boolean(existingScript); // true if updated, false if new
  }

  /**
   * Find all script files in the specified directories
   */
  private async findScriptFiles(): Promise<string[]> {
    const patterns = [
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
      '**/*.ts',
      '**/*.tsx',
      '**/*.py',
      '**/*.py3',
      '**/*.sh',
      '**/*.bash',
      '**/*.zsh',
    ];

    const allFiles = new Set<string>();

    for (const directory of this.options.directories) {
      if (!(await this.directoryExists(directory))) {
        if (this.options.verbose) {
          console.warn(`⚠️  Directory not found: ${directory}`);
        }
        continue;
      }

      for (const pattern of patterns) {
        const files = await glob(pattern, {
          cwd: directory,
          absolute: true,
          ignore: this.options.excludePatterns,
          nodir: true,
        });

        files.forEach(file => allFiles.add(file));
      }
    }

    // Filter out files that don't actually exist or are not readable
    const existingFiles: string[] = [];
    for (const file of allFiles) {
      try {
        const stats = await fs.stat(file);
        if (stats.isFile()) {
          existingFiles.push(file);
        }
      } catch {
        // Skip files that can't be read
      }
    }

    return existingFiles.sort();
  }

  /**
   * Check if directory exists
   */
  private async directoryExists(directory: string): Promise<boolean> {
    try {
      const stats = await fs.stat(directory);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Clean up scripts that have been deleted from the filesystem
   */
  private async cleanupDeletedScripts(): Promise<void> {
    const allScripts = await this.queries.getAllScripts();
    const deletedScripts: string[] = [];

    for (const script of allScripts) {
      try {
        await fs.stat(script.path);
      } catch {
        // File doesn't exist, mark for deletion
        deletedScripts.push(script.id);
      }
    }

    if (deletedScripts.length > 0) {
      if (this.options.verbose) {
        console.log(`🗑️  Cleaning up ${deletedScripts.length} deleted scripts`);
      }

      for (const scriptId of deletedScripts) {
        await this.queries.deleteScript(scriptId);
      }
    }
  }

  /**
   * Get analysis statistics
   */
  async getStats() {
    await this.db.connect();
    try {
      const stats = await this.queries.getScriptStats();
      const dbStats = await this.db.getStats();
      
      return {
        ...stats,
        databaseSize: dbStats.databaseSize,
        lastAnalyzed: dbStats.lastUpdated,
      };
    } finally {
      await this.db.disconnect();
    }
  }
}

// Export default instance
export const scriptAnalyzer = new ScriptAnalyzer();