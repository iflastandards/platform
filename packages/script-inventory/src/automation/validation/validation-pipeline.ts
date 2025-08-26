#!/usr/bin/env node

/**
 * Documentation Validation Pipeline
 * Handles script documentation analysis and quality scoring
 */

import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { scriptParser } from '../../core/parser';
import { fileExtractor } from '../../core/extractors';
import type {
  Script,
  ValidationResult,
  ValidationError,
  ValidationConfig,
  ValidationRule,
  QualityMetrics,
  EnrichedMetadata,
  Suggestion,
  ScriptMetadata,
  ValidationMode
} from '../../types';

export class ValidationPipeline {
  private config: ValidationConfig;

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  /**
   * Validate a script file and return comprehensive results
   */
  async validateScript(filePath: string, mode?: ValidationMode): Promise<ValidationResult> {
    try {
      const validationMode = mode || this.config.mode;
      const errors: ValidationError[] = [];
      const missing: string[] = [];
      const suggestions: string[] = [];

      // Parse the script first
      const parsedScript = await scriptParser.parseScript(filePath);
      
      // Extract file information
      const fileInfo = await fileExtractor.extractFileInfo(filePath);
      
      // Create basic script object for validation
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
        docScore: 0, // Will be calculated
        metadata: parsedScript
      };

      // Validate purpose documentation
      const purposeValidation = await this.validatePurpose(script, validationMode);
      errors.push(...purposeValidation.errors);
      missing.push(...purposeValidation.missing);
      suggestions.push(...purposeValidation.suggestions);

      // Validate usage documentation
      const usageValidation = await this.validateUsageDocumentation(script, validationMode);
      errors.push(...usageValidation.errors);
      missing.push(...usageValidation.missing);
      suggestions.push(...usageValidation.suggestions);

      // Validate CLI documentation (if applicable)
      if (script.isCli) {
        const cliValidation = await this.validateCliDocumentation(script, validationMode);
        errors.push(...cliValidation.errors);
        missing.push(...cliValidation.missing);
        suggestions.push(...cliValidation.suggestions);
      }

      // Apply custom rules
      const rulesValidation = await this.applyCustomRules(script, this.config.customRules);
      errors.push(...rulesValidation.errors);
      suggestions.push(...rulesValidation.suggestions);

      // Calculate overall documentation score
      const score = await this.calculateDocumentationScore(script.metadata, validationMode);
      script.docScore = score;

      // Check if validation passes
      const criticalErrors = errors.filter(e => e.severity === 'error');
      const isValid = criticalErrors.length === 0 && 
                     score >= this.config.minDocumentationScore;

      return {
        isValid,
        score,
        missing,
        suggestions,
        errors
      };

    } catch (error) {
      return {
        isValid: false,
        score: 0,
        missing: ['Validation failed'],
        suggestions: [],
        errors: [{
          field: 'general',
          message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error'
        }]
      };
    }
  }

  /**
   * Extract purpose from script file
   */
  async extractPurpose(filePath: string): Promise<string> {
    try {
      const content = await fsPromises.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      
      // Try multiple extraction strategies
      
      // 1. Look for JSDoc @description or @purpose
      const jsdocMatch = content.match(/\/\*\*[\s\S]*?@(?:description|purpose)\s+([^@\*]+)/i);
      if (jsdocMatch) {
        return jsdocMatch[1].trim().replace(/\s+/g, ' ');
      }

      // 2. Look for comment blocks at the top
      const commentMatch = content.match(/(?:\/\*\*|\/\*|#)\s*([^*#\n]+(?:\n\s*[*#]\s*[^*#\n]*)*)/);
      if (commentMatch) {
        const extracted = commentMatch[1]
          .replace(/[*#]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (extracted.length > 10 && !extracted.toLowerCase().includes('todo')) {
          return extracted;
        }
      }

      // 3. Look for CLI description in commander.js or yargs
      const cliDescMatch = content.match(/(?:description|desc)\(['"]([^'"]+)['"]\)/i);
      if (cliDescMatch) {
        return cliDescMatch[1].trim();
      }

      // 4. Look for package.json description reference
      const packageMatch = content.match(/require\(['"]\.\.\/package\.json['"]\)\.description/);
      if (packageMatch) {
        try {
          const packagePath = path.resolve(path.dirname(filePath), '..', 'package.json');
          const packageJson = JSON.parse(await fsPromises.readFile(packagePath, 'utf-8'));
          if (packageJson.description) {
            return packageJson.description;
          }
        } catch {
          // Ignore package.json read errors
        }
      }

      // 5. Fallback: analyze filename for hints
      const nameHints = this.generatePurposeFromFileName(fileName);
      if (nameHints) {
        return nameHints;
      }

      return 'No description available';
    } catch (error) {
      throw new Error(`Failed to extract purpose from ${filePath}: ${error}`);
    }
  }

  /**
   * Calculate comprehensive quality metrics
   */
  async calculateQualityMetrics(metadata: EnrichedMetadata): Promise<QualityMetrics> {
    const metrics: QualityMetrics = {
      documentationScore: 0,
      purposeClarity: 0,
      usageCompleteness: 0,
      exampleQuality: 0,
      cliDocumentation: 0,
      maintainabilityScore: 0
    };

    // Purpose clarity (0-100)
    if (metadata.description && metadata.description !== 'No description available') {
      const length = metadata.description.length;
      const hasKeywords = /\b(analyze|process|generate|convert|validate|extract|build|deploy|test)\b/i.test(metadata.description);
      metrics.purposeClarity = Math.min(100, (length / 50) * 40 + (hasKeywords ? 30 : 0) + 30);
    }

    // Usage completeness (0-100)
    if (metadata.usage) {
      metrics.usageCompleteness = Math.min(100, metadata.usage.length / 100 * 60 + 40);
    }

    // Example quality (0-100)
    if (metadata.examples && metadata.examples.length > 0) {
      const avgExampleLength = metadata.examples.reduce((acc, ex) => acc + ex.length, 0) / metadata.examples.length;
      metrics.exampleQuality = Math.min(100, avgExampleLength / 50 * 50 + metadata.examples.length * 25);
    }

    // CLI documentation (0-100, only if CLI)
    if (metadata.cliOptions && metadata.cliOptions.length > 0) {
      const documentedOptions = metadata.cliOptions.filter(opt => opt.description && opt.description.length > 5);
      metrics.cliDocumentation = (documentedOptions.length / metadata.cliOptions.length) * 100;
    } else {
      metrics.cliDocumentation = 100; // N/A for non-CLI scripts
    }

    // Maintainability score (0-100)
    let maintainabilityScore = 50; // Base score
    if (metadata.author) maintainabilityScore += 10;
    if (metadata.created) maintainabilityScore += 10;
    if (metadata.tags && metadata.tags.length > 0) maintainabilityScore += 15;
    if (metadata.dependencies && metadata.dependencies.length < 10) maintainabilityScore += 15;
    metrics.maintainabilityScore = Math.min(100, maintainabilityScore);

    // Overall documentation score (weighted average)
    metrics.documentationScore = Math.round(
      metrics.purposeClarity * 0.25 +
      metrics.usageCompleteness * 0.20 +
      metrics.exampleQuality * 0.15 +
      metrics.cliDocumentation * 0.20 +
      metrics.maintainabilityScore * 0.20
    );

    return metrics;
  }

  /**
   * Generate improvement suggestions
   */
  async generateImprovementSuggestions(script: Script): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    // Purpose improvement suggestions
    if (!script.purpose || script.purpose === 'No description available') {
      suggestions.push({
        type: 'documentation',
        priority: 'high',
        message: 'Missing script purpose documentation',
        suggestion: 'Add a clear description of what this script does at the top of the file',
        automated: false
      });
    } else if (script.purpose.length < 20) {
      suggestions.push({
        type: 'documentation',
        priority: 'medium',
        message: 'Script purpose is too brief',
        suggestion: 'Expand the script description to be more detailed and informative',
        automated: false
      });
    }

    // Usage suggestions
    if (!script.metadata.usage) {
      suggestions.push({
        type: 'documentation',
        priority: 'medium',
        message: 'Missing usage documentation',
        suggestion: 'Add usage examples or instructions for how to run this script',
        automated: false
      });
    }

    // CLI suggestions
    if (script.isCli && !script.hasHelpOption) {
      suggestions.push({
        type: 'structure',
        priority: 'medium',
        message: 'CLI script missing help option',
        suggestion: 'Add --help option to display usage information',
        automated: true
      });
    }

    // Example suggestions
    if (!script.metadata.examples || script.metadata.examples.length === 0) {
      suggestions.push({
        type: 'documentation',
        priority: 'low',
        message: 'No usage examples provided',
        suggestion: 'Add practical examples showing how to use this script',
        automated: false
      });
    }

    // Maintenance suggestions
    if (script.isDeprecated) {
      suggestions.push({
        type: 'maintenance',
        priority: 'high',
        message: 'Script is marked as deprecated',
        suggestion: 'Consider removing deprecated script or updating documentation with migration path',
        automated: false
      });
    }

    // Test suggestions
    if (!script.isTest && !script.metadata.tags.some(tag => tag.tag === 'tested')) {
      suggestions.push({
        type: 'testing',
        priority: 'low',
        message: 'No test coverage indicated',
        suggestion: 'Consider adding tests or test documentation for this script',
        automated: false
      });
    }

    return suggestions;
  }

  /**
   * Calculate documentation score based on validation mode
   */
  private async calculateDocumentationScore(metadata: ScriptMetadata, mode: ValidationMode): Promise<number> {
    let baseScore = 0;
    
    // Purpose scoring (0-30 points)
    if (metadata.description && metadata.description !== 'No description available') {
      const length = metadata.description.length;
      const clarity = length > 50 ? 30 : Math.round(length / 50 * 30);
      baseScore += clarity;
    }

    // Usage scoring (0-25 points)  
    if (metadata.usage && metadata.usage.length > 10) {
      baseScore += 25;
    } else if (metadata.usage) {
      baseScore += 10;
    }

    // Examples scoring (0-20 points)
    if (metadata.examples && metadata.examples.length > 0) {
      baseScore += Math.min(20, metadata.examples.length * 10);
    }

    // CLI documentation scoring (0-15 points)
    if (metadata.cliOptions && metadata.cliOptions.length > 0) {
      const documentedOptions = metadata.cliOptions.filter(opt => opt.description);
      const ratio = documentedOptions.length / metadata.cliOptions.length;
      baseScore += Math.round(ratio * 15);
    } else {
      baseScore += 10; // Non-CLI scripts get partial credit
    }

    // Metadata completeness (0-10 points)
    let metadataScore = 0;
    if (metadata.author) metadataScore += 2;
    if (metadata.created) metadataScore += 2;
    if (metadata.tags && metadata.tags.length > 0) metadataScore += 3;
    if (metadata.dependencies && metadata.dependencies.length >= 0) metadataScore += 3;
    baseScore += metadataScore;

    // Apply mode-specific adjustments
    switch (mode) {
      case 'strict':
        // Strict mode: penalize missing elements more heavily
        if (!metadata.usage) baseScore -= 15;
        if (!metadata.examples || metadata.examples.length === 0) baseScore -= 10;
        break;
      case 'lenient':
        // Lenient mode: more forgiving scoring
        baseScore += 10; // Bonus points for lenient mode
        break;
      case 'progressive':
        // Progressive mode: encourage improvement over time
        const daysSinceModified = metadata.created ? 
          (Date.now() - metadata.created.getTime()) / (1000 * 60 * 60 * 24) : 0;
        if (daysSinceModified > 30) {
          baseScore -= 5; // Slight penalty for old undocumented scripts
        }
        break;
      case 'normal':
      default:
        // Normal mode: no adjustments
        break;
    }

    return Math.max(0, Math.min(100, baseScore));
  }

  /**
   * Validate purpose documentation
   */
  private async validatePurpose(script: Omit<Script, 'id'>, mode: ValidationMode): Promise<{
    errors: ValidationError[];
    missing: string[];
    suggestions: string[];
  }> {
    const errors: ValidationError[] = [];
    const missing: string[] = [];
    const suggestions: string[] = [];

    if (!script.purpose || script.purpose === 'No description available') {
      missing.push('purpose');
      errors.push({
        field: 'purpose',
        message: 'Script purpose is required',
        severity: mode === 'strict' ? 'error' : 'warning'
      });
      suggestions.push('Add a clear description of what this script does');
    } else if (script.purpose.length < 10) {
      errors.push({
        field: 'purpose',
        message: 'Script purpose is too brief',
        severity: 'warning'
      });
      suggestions.push('Expand the script description to be more informative');
    } else if (script.purpose.toLowerCase().includes('todo') || 
               script.purpose.toLowerCase().includes('fixme')) {
      errors.push({
        field: 'purpose',
        message: 'Script purpose contains placeholder text',
        severity: 'warning'
      });
      suggestions.push('Replace placeholder text with actual script description');
    }

    return { errors, missing, suggestions };
  }

  /**
   * Validate usage documentation
   */
  private async validateUsageDocumentation(script: Omit<Script, 'id'>, mode: ValidationMode): Promise<{
    errors: ValidationError[];
    missing: string[];
    suggestions: string[];
  }> {
    const errors: ValidationError[] = [];
    const missing: string[] = [];
    const suggestions: string[] = [];

    if (!script.metadata.usage) {
      if (this.config.requiredFields.includes('usage')) {
        missing.push('usage');
        errors.push({
          field: 'usage',
          message: 'Usage documentation is required',
          severity: mode === 'strict' ? 'error' : 'warning'
        });
      }
      suggestions.push('Add usage examples or instructions for running this script');
    } else if (script.metadata.usage.length < 20) {
      errors.push({
        field: 'usage',
        message: 'Usage documentation is too brief',
        severity: 'info'
      });
      suggestions.push('Provide more detailed usage instructions');
    }

    return { errors, missing, suggestions };
  }

  /**
   * Validate CLI documentation
   */
  private async validateCliDocumentation(script: Omit<Script, 'id'>, mode: ValidationMode): Promise<{
    errors: ValidationError[];
    missing: string[];
    suggestions: string[];
  }> {
    const errors: ValidationError[] = [];
    const missing: string[] = [];
    const suggestions: string[] = [];

    if (!script.hasHelpOption) {
      errors.push({
        field: 'cli',
        message: 'CLI script should have --help option',
        severity: mode === 'strict' ? 'error' : 'warning'
      });
      suggestions.push('Add --help option to display usage information');
    }

    if (script.metadata.cliOptions && script.metadata.cliOptions.length > 0) {
      const undocumentedOptions = script.metadata.cliOptions.filter(
        opt => !opt.description || opt.description.length < 5
      );
      
      if (undocumentedOptions.length > 0) {
        errors.push({
          field: 'cli',
          message: `${undocumentedOptions.length} CLI options lack descriptions`,
          severity: mode === 'strict' ? 'error' : 'warning'
        });
        suggestions.push('Add descriptions for all CLI options');
      }
    }

    return { errors, missing, suggestions };
  }

  /**
   * Apply custom validation rules
   */
  private async applyCustomRules(script: Omit<Script, 'id'>, rules: ValidationRule[]): Promise<{
    errors: ValidationError[];
    suggestions: string[];
  }> {
    const errors: ValidationError[] = [];
    const suggestions: string[] = [];

    for (const rule of rules) {
      try {
        // Create evaluation context
        const context = {
          script,
          isCli: script.isCli,
          isTest: script.isTest,
          isDeprecated: script.isDeprecated,
          hasHelpOption: script.hasHelpOption,
          docScore: script.docScore,
          purpose: script.purpose,
          metadata: script.metadata
        };

        // Evaluate condition
        const conditionFn = new Function('context', `with(context) { return ${rule.condition}; }`);
        const conditionMet = conditionFn(context);

        if (conditionMet) {
          // Evaluate requirement
          const requirementFn = new Function('context', `with(context) { return ${rule.requirement}; }`);
          const requirementMet = requirementFn(context);

          if (!requirementMet) {
            errors.push({
              field: 'custom',
              message: `Custom rule violation: ${rule.description}`,
              severity: rule.severity
            });
            
            suggestions.push(`Rule: ${rule.name} - ${rule.description}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to evaluate custom rule ${rule.name}:`, error);
      }
    }

    return { errors, suggestions };
  }

  /**
   * Generate purpose from filename analysis
   */
  private generatePurposeFromFileName(fileName: string): string | null {
    // Remove extension
    const baseName = path.parse(fileName).name;
    
    // Common script name patterns
    const patterns = [
      { pattern: /^build[-_]?(\w+)/, template: 'Build script for $1' },
      { pattern: /^deploy[-_]?(\w+)?/, template: 'Deployment script for $1' },
      { pattern: /^test[-_]?(\w+)?/, template: 'Test script for $1' },
      { pattern: /^analyze[-_]?(\w+)/, template: 'Analysis script for $1' },
      { pattern: /^generate[-_]?(\w+)/, template: 'Generator script for $1' },
      { pattern: /^convert[-_]?(\w+)/, template: 'Conversion script for $1' },
      { pattern: /^validate[-_]?(\w+)/, template: 'Validation script for $1' },
      { pattern: /^extract[-_]?(\w+)/, template: 'Extraction script for $1' },
      { pattern: /^process[-_]?(\w+)/, template: 'Processing script for $1' },
      { pattern: /^setup[-_]?(\w+)?/, template: 'Setup script for $1' },
      { pattern: /^install[-_]?(\w+)?/, template: 'Installation script for $1' },
      { pattern: /^clean[-_]?(\w+)?/, template: 'Cleanup script for $1' }
    ];

    for (const { pattern, template } of patterns) {
      const match = baseName.match(pattern);
      if (match) {
        return template.replace('$1', match[1] || 'project').replace(' for ', ' for ');
      }
    }

    // Generic purpose based on name structure
    if (baseName.includes('-') || baseName.includes('_')) {
      const words = baseName.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1));
      return `Script for ${words.join(' ').toLowerCase()}`;
    }

    return null;
  }
}