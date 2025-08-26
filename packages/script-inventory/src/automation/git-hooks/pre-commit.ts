/**
 * Pre-commit Hook Implementation for Script Inventory
 * Validates and registers scripts before commit completion
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { ScriptInventory } from '../../core/script-inventory';
import { ConfigManager } from '../config/config-manager';

export interface PreCommitOptions {
  skipValidation?: boolean;
  verbose?: boolean;
  failFast?: boolean;
}

export interface PreCommitResult {
  success: boolean;
  registeredScripts: string[];
  validationErrors: Array<{
    file: string;
    errors: string[];
  }>;
  warnings: string[];
  duration: number;
}

export class PreCommitHook {
  private configManager: ConfigManager;
  private inventory: ScriptInventory;

  constructor() {
    this.configManager = new ConfigManager();
    this.inventory = new ScriptInventory();
  }

  async execute(options: PreCommitOptions = {}): Promise<PreCommitResult> {
    const startTime = Date.now();
    const result: PreCommitResult = {
      success: true,
      registeredScripts: [],
      validationErrors: [],
      warnings: [],
      duration: 0
    };

    try {
      // Load configuration
      const config = await this.configManager.loadConfig();
      
      // Check if pre-commit hook is enabled
      if (!config.hooks.preCommit.enabled) {
        if (options.verbose) {
          console.log('Pre-commit hook disabled in configuration');
        }
        result.duration = Date.now() - startTime;
        return result;
      }

      // Check for bypass keyword in commit message
      if (await this.shouldBypass(config.hooks.preCommit.bypassKeyword, options)) {
        if (options.verbose) {
          console.log('Pre-commit validation bypassed');
        }
        result.warnings.push('Script validation was bypassed');
        result.duration = Date.now() - startTime;
        return result;
      }

      // Get staged script files
      const stagedScripts = await this.getStagedScriptFiles();
      
      if (stagedScripts.length === 0) {
        if (options.verbose) {
          console.log('No script files found in staged changes');
        }
        result.duration = Date.now() - startTime;
        return result;
      }

      console.log(`📋 Validating ${stagedScripts.length} script(s)...`);

      // Initialize inventory
      await this.inventory.initialize();

      // Process each staged script
      for (const scriptPath of stagedScripts) {
        try {
          await this.processScript(scriptPath, config, result, options);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.validationErrors.push({
            file: scriptPath,
            errors: [errorMessage]
          });
          
          if (options.failFast) {
            break;
          }
        }
      }

      // Determine overall success
      const hasErrors = result.validationErrors.length > 0;
      const shouldFail = config.hooks.preCommit.failOnError && hasErrors;
      
      result.success = !shouldFail;

      // Output results
      await this.outputResults(result, options);

    } catch (error) {
      result.success = false;
      result.validationErrors.push({
        file: 'system',
        errors: [error instanceof Error ? error.message : String(error)]
      });
    } finally {
      await this.inventory.close();
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  private async shouldBypass(bypassKeyword: string, options: PreCommitOptions): Promise<boolean> {
    if (options.skipValidation) {
      return true;
    }

    try {
      // Check if bypass keyword is in commit message
      const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
      return commitMsg.includes(bypassKeyword);
    } catch {
      return false;
    }
  }

  private async getStagedScriptFiles(): Promise<string[]> {
    try {
      // Get list of staged files
      const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
        .split('\n')
        .filter(line => line.trim());

      // Filter for script files
      const scriptExtensions = ['.js', '.ts', '.py', '.sh', '.bash', '.zsh', '.fish'];
      const scriptFiles = staged.filter(file => {
        const ext = path.extname(file);
        return scriptExtensions.includes(ext) || this.isExecutableScript(file);
      });

      // Filter out deleted files
      const existingFiles = [];
      for (const file of scriptFiles) {
        try {
          await fs.access(file);
          existingFiles.push(file);
        } catch {
          // File was deleted, skip it
        }
      }

      return existingFiles;
    } catch (error) {
      console.warn('Failed to get staged files:', error);
      return [];
    }
  }

  private async isExecutableScript(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Check for shebang or executable permissions
      const hasShebang = content.startsWith('#!');
      const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;
      
      return hasShebang || isExecutable;
    } catch {
      return false;
    }
  }

  private async processScript(
    scriptPath: string, 
    config: any,
    result: PreCommitResult,
    options: PreCommitOptions
  ): Promise<void> {
    try {
      // Validate script documentation
      const validation = await this.inventory.validateScript(scriptPath);
      
      if (!validation.isValid) {
        result.validationErrors.push({
          file: scriptPath,
          errors: validation.issues.map(issue => issue.message)
        });
        return;
      }

      // Check documentation score threshold
      if (validation.score < config.validation.minDocumentationScore) {
        const required = (config.validation.minDocumentationScore * 100).toFixed(0);
        const actual = (validation.score * 100).toFixed(0);
        
        result.validationErrors.push({
          file: scriptPath,
          errors: [`Documentation score ${actual}% below required ${required}%`]
        });
        
        if (config.mode !== 'lenient') {
          return;
        }
      }

      // Register the script
      const script = await this.inventory.registerScript(scriptPath, true);
      result.registeredScripts.push(scriptPath);
      
      if (options.verbose) {
        console.log(`✅ ${scriptPath} (score: ${(validation.score * 100).toFixed(0)}%)`);
      }

      // Add warnings for low documentation scores
      if (validation.score < 0.7) {
        result.warnings.push(`${scriptPath}: Consider improving documentation (${(validation.score * 100).toFixed(0)}%)`);
      }

    } catch (error) {
      throw new Error(`Failed to process ${scriptPath}: ${error}`);
    }
  }

  private async outputResults(result: PreCommitResult, options: PreCommitOptions): Promise<void> {
    const { success, registeredScripts, validationErrors, warnings } = result;

    if (registeredScripts.length > 0) {
      console.log(`✅ Registered ${registeredScripts.length} script(s)`);
      if (options.verbose) {
        registeredScripts.forEach(script => console.log(`   - ${script}`));
      }
    }

    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} warning(s):`);
      warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (validationErrors.length > 0) {
      console.log(`❌ ${validationErrors.length} validation error(s):`);
      validationErrors.forEach(error => {
        console.log(`   ${error.file}:`);
        error.errors.forEach(msg => console.log(`     - ${msg}`));
      });

      if (!success) {
        console.log('');
        console.log('💡 To bypass validation, use:');
        console.log('   git commit -m "your message --skip-script-validation"');
        console.log('');
        console.log('🔧 To fix documentation issues:');
        console.log('   script-inventory validate <file>');
      }
    }

    console.log(`⏱️  Validation completed in ${result.duration}ms`);
  }

  // Static method for use as git hook
  static async run(): Promise<void> {
    const hook = new PreCommitHook();
    
    try {
      const result = await hook.execute({
        verbose: process.env.SCRIPT_INVENTORY_VERBOSE === 'true'
      });

      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Pre-commit hook failed:', error);
      process.exit(1);
    }
  }
}

// Export for CLI usage
export async function runPreCommitHook(options: PreCommitOptions = {}): Promise<PreCommitResult> {
  const hook = new PreCommitHook();
  return await hook.execute(options);
}