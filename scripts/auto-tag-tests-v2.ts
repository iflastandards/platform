#!/usr/bin/env tsx
/**
 * Enhanced AI-Powered Test Tagging System V2
 * 
 * Features:
 * - Batch evaluation of all test files
 * - AI provider fallback (Gemini → Anthropic)
 * - Review tracking comments to prevent re-evaluation
 * - Comprehensive tagging rules based on test content
 * - Support for pre-commit workflows
 */

import * as fs from 'fs';
import { glob } from 'glob';
import chalk from 'chalk';
import { z } from 'zod';
import ora from 'ora';
import { execSync } from 'child_process';

// AI Review tracking comment format
const AI_REVIEW_MARKER = '// @ai-reviewed';
const AI_REVIEW_REGEX = /\/\/\s*@ai-reviewed\s+by:\s*([\w-]+)\s+on:\s*([\d-]+)\s+tags:\s*\[(.*?)\]/;

// Configuration schema
const ConfigSchema = z.object({
  provider: z.enum(['gemini', 'anthropic']).default('gemini'),
  fallbackProvider: z.enum(['gemini', 'anthropic']).optional(),
  apiKey: z.string().optional(),
  fallbackApiKey: z.string().optional(),
  model: z.string().optional(),
  fallbackModel: z.string().default('claude-3-opus-20240229'),
  batchSize: z.number().default(10),
  skipReviewed: z.boolean().default(true),
  forceReview: z.boolean().default(false),
  dryRun: z.boolean().default(false),
  verbose: z.boolean().default(false),
});

type Config = z.infer<typeof ConfigSchema>;

// Tag analysis result
interface TagAnalysis {
  file: string;
  existingTags: string[];
  suggestedTags: string[];
  confidence: number;
  provider: string;
  reasoning: string;
  needsUpdate: boolean;
  alreadyReviewed: boolean;
  lastReviewInfo?: {
    provider: string;
    date: string;
    tags: string[];
  };
}

// Test category patterns
const TEST_PATTERNS = {
  unit: {
    patterns: [
      /describe\(['"`].*(?:component|function|utility|helper|pure|isolated)/i,
      /mock(?:ed)?.*(?:provider|service|api)/i,
      /(?:render|shallow).*(?:component|element)/i,
      /import.*testing-library/,
      /\.unit\.(?:test|spec)\.[jt]sx?$/,
    ],
    keywords: ['mock', 'stub', 'fake', 'isolated', 'pure function'],
  },
  integration: {
    patterns: [
      /(?:integration|service|api|database|repository)/i,
      /MSW|msw/,
      /setupServer|rest\.(?:get|post|put|delete)/,
      /\.integration\.(?:test|spec)\.[jt]sx?$/,
      /waitFor(?:Server|Response|Data)/,
    ],
    keywords: ['MSW', 'API', 'service', 'database', 'integration'],
  },
  e2e: {
    patterns: [
      /(?:playwright|puppeteer|cypress|selenium)/i,
      /(?:page|browser)\s*\.\s*(?:goto|click|fill|type)/,
      /\.e2e\.(?:test|spec)\.[jt]sx?$/,
      /end-to-end|end to end|e2e/i,
    ],
    keywords: ['browser', 'page', 'navigation', 'user journey'],
  },
  serverDependent: {
    patterns: [
      /(?:localhost|127\.0\.0\.1):\d{4}/,
      /process\.env\.(?:API_URL|SERVER_URL|BASE_URL)/,
      /(?:start|stop)Server/,
      /waitForServer|checkServerHealth/,
      /requires?\s+(?:admin|server|backend)/i,
    ],
    keywords: ['server running', 'localhost', 'requires server'],
  },
  smoke: {
    patterns: [
      /smoke\s*test/i,
      /critical\s*path/i,
      /health\s*check/i,
      /\.smoke\.(?:test|spec)\.[jt]sx?$/,
    ],
    keywords: ['smoke', 'health check', 'critical path'],
  },
};

// Functional area patterns
const FUNCTIONAL_PATTERNS = {
  auth: /(?:auth|login|logout|session|user|permission|role|rbac)/i,
  api: /(?:\bapi\b|endpoint|rest|graphql|fetch|axios|request|response)/i,
  ui: /(?:render|component|button|form|input|display|view|screen|react|vue|dom)/i,
  validation: /(?:valid|validate|schema|zod|yup|joi|rules?)/i,
  security: /(?:security|csrf|xss|injection|sanitize|encrypt)/i,
  cache: /(?:cache|redis|memcache|storage|persist)/i,
  rbac: /(?:rbac|role|permission|access|authorize)/i,
  utility: /(?:util|helper|tool|format|parse|transform)/i,
  dashboard: /(?:dashboard|admin|panel|overview)/i,
};

// Priority mapping based on functional areas  
const PRIORITY_MAPPING_V2 = {
  // Critical priority areas (security, auth, core functionality)
  '@auth': '@critical',
  '@security': '@critical', 
  '@rbac': '@critical',
  '@validation': '@critical',
  
  // High priority areas (user-facing features, APIs)
  '@api': '@high-priority',
  '@ui': '@high-priority',
  '@dashboard': '@high-priority',
  
  // Low priority areas (utilities, caching, edge cases)
  '@utility': '@low-priority',
  '@cache': '@low-priority'
};

class EnhancedTestTagger {
  private config: Config;
  private stats = {
    total: 0,
    reviewed: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  constructor(config: Partial<Config> = {}) {
    this.config = ConfigSchema.parse(config);
    this.validateApiKeys();
  }

  private validateApiKeys(): void {
    if (this.config.provider === 'gemini' && !this.config.apiKey) {
      this.config.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    }
    if (this.config.fallbackProvider === 'anthropic' && !this.config.fallbackApiKey) {
      this.config.fallbackApiKey = process.env.ANTHROPIC_API_KEY;
    }
  }

  /**
   * Check if a test file has already been reviewed by AI
   */
  private checkReviewStatus(content: string): TagAnalysis['lastReviewInfo'] | undefined {
    const match = content.match(AI_REVIEW_REGEX);
    if (match) {
      return {
        provider: match[1],
        date: match[2],
        tags: match[3].split(',').map(t => t.trim()).filter(Boolean),
      };
    }
    return undefined;
  }

  /**
   * Extract existing tags from test file
   */
  private extractExistingTags(content: string): string[] {
    const tags = new Set<string>();
    
    // Extract from JSDoc comments
    const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (jsdocMatch) {
      const tagMatches = jsdocMatch[0].match(/@[\w-]+/g);
      if (tagMatches) {
        tagMatches.forEach(tag => tags.add(tag));
      }
    }

    // Extract from describe blocks
    const describeMatches = content.matchAll(/describe\s*\(\s*['"`]([^'"`]+)['"`]/g);
    for (const match of describeMatches) {
      const describeText = match[1];
      const tagMatches = describeText.match(/@[\w-]+/g);
      if (tagMatches) {
        tagMatches.forEach(tag => tags.add(tag));
      }
    }

    return Array.from(tags);
  }

  /**
   * Analyze test content to suggest tags
   */
  private analyzeTestContent(content: string, filePath: string): string[] {
    const suggestedTags = new Set<string>();

    // Determine test category
    if (TEST_PATTERNS.unit.patterns.some(p => p.test(content))) {
      suggestedTags.add('@unit');
    }
    if (TEST_PATTERNS.integration.patterns.some(p => p.test(content))) {
      suggestedTags.add('@integration');
    }
    if (TEST_PATTERNS.e2e.patterns.some(p => p.test(content))) {
      suggestedTags.add('@e2e');
    }
    if (TEST_PATTERNS.serverDependent.patterns.some(p => p.test(content))) {
      suggestedTags.add('@server-dependent');
      suggestedTags.add('@local-only');
    }
    if (TEST_PATTERNS.smoke.patterns.some(p => p.test(content))) {
      suggestedTags.add('@smoke');
      suggestedTags.add('@post-deploy');
      suggestedTags.add('@critical');
    }

    // Determine functional areas
    Object.entries(FUNCTIONAL_PATTERNS).forEach(([area, pattern]) => {
      if (pattern.test(content)) {
        suggestedTags.add(`@${area}`);
      }
    });

    // Apply validation rules
    this.applyTagValidationRules(suggestedTags);

    // Ensure priority tag is included
    this.ensurePriorityTag(suggestedTags, content);

    return Array.from(suggestedTags);
  }

  /**
   * Ensure a priority tag is included based on functional areas and content
   */
  private ensurePriorityTag(tags: Set<string>, content: string): void {
    // Check if already has priority tag
    const priorityTags = ['@critical', '@high-priority', '@low-priority'];
    const hasPriorityTag = Array.from(tags).some(tag => priorityTags.includes(tag));
    
    if (!hasPriorityTag) {
      // Collect all priority levels from detected functional areas
      const detectedPriorities: string[] = [];
      
      for (const tag of tags) {
        const mappedPriority = PRIORITY_MAPPING_V2[tag as keyof typeof PRIORITY_MAPPING_V2];
        if (mappedPriority) {
          detectedPriorities.push(mappedPriority);
        }
      }
      
      // Determine priority with special handling for utility tests
      let inferredPriority = '@low-priority'; // default
      
      if (detectedPriorities.includes('@critical')) {
        inferredPriority = '@critical';
      } else if (tags.has('@utility')) {
        // If utility is detected, prefer low priority even if other areas are present
        inferredPriority = '@low-priority';
      } else if (detectedPriorities.includes('@high-priority')) {
        inferredPriority = '@high-priority';
      } else if (detectedPriorities.length > 0) {
        inferredPriority = detectedPriorities[0]; // Use first detected priority
      }
      
      // Content-based priority inference as fallback
      if (inferredPriority === '@low-priority' && detectedPriorities.length === 0) {
        if (content.includes('auth') || content.includes('security') || content.includes('login')) {
          inferredPriority = '@critical';
        } else if (content.includes('dashboard') || content.includes('api') || content.includes('component')) {
          inferredPriority = '@high-priority';
        }
      }
      
      tags.add(inferredPriority);
    }
  }

  /**
   * Apply tag validation rules to ensure consistency
   */
  private applyTagValidationRules(tags: Set<string>): void {
    // Rule: Unit tests cannot be server-dependent
    if (tags.has('@unit') && tags.has('@server-dependent')) {
      tags.delete('@server-dependent');
      tags.delete('@local-only');
    }

    // Rule: Smoke tests must be post-deploy
    if (tags.has('@smoke')) {
      tags.add('@post-deploy');
      tags.add('@critical');
      tags.delete('@server-dependent');
      tags.delete('@local-only');
    }

    // Rule: Server-dependent tests should be local-only
    if (tags.has('@server-dependent') && !tags.has('@post-deploy')) {
      tags.add('@local-only');
    }

    // Rule: E2E tests must specify environment
    if (tags.has('@e2e') && !tags.has('@post-deploy')) {
      tags.add('@server-dependent');
      tags.add('@local-only');
    }
  }

  /**
   * Call AI provider for tag analysis
   */
  private async callAIProvider(
    content: string,
    filePath: string,
    provider: 'gemini' | 'anthropic',
    apiKey: string
  ): Promise<{ tags: string[]; confidence: number; reasoning: string }> {
    const prompt = this.buildAIPrompt(content, filePath);

    if (provider === 'gemini') {
      return this.callGemini(prompt, apiKey);
    } 
      return this.callAnthropic(prompt, apiKey);
    
  }

  /**
   * Build prompt for AI analysis
   */
  private buildAIPrompt(content: string, filePath: string): string {
    return `Analyze this test file and suggest appropriate tags based on the testing strategy.

File: ${filePath}

Test Categories (choose primary):
- @unit: Pure unit tests with mocks, no external dependencies
- @integration: Tests with MSW mocks or service integration
- @e2e: Browser automation tests
- @smoke: Critical path validation after deployment

Modifiers:
- @server-dependent: Requires local servers running
- @local-only: Can only run locally
- @post-deploy: Runs after deployment
- @critical: Critical functionality

Functional Areas (add all that apply):
- @auth: Authentication/authorization
- @api: API endpoints
- @ui: UI components
- @validation: Data validation
- @security: Security features
- @cache: Caching logic
- @rbac: Role-based access

Rules:
1. Unit tests CANNOT be @server-dependent
2. Smoke tests MUST be @post-deploy and @critical
3. Server-dependent tests SHOULD be @local-only
4. E2E tests MUST specify environment (@server-dependent or @post-deploy)

Test Content:
\`\`\`
${content.slice(0, 3000)}
\`\`\`

Respond in JSON format:
{
  "tags": ["@tag1", "@tag2"],
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}`;
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string, apiKey: string): Promise<any> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || '';
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      if (this.config.verbose) {
        console.error('Gemini API error:', error);
      }
      throw error;
    }
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(prompt: string, apiKey: string): Promise<any> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.fallbackModel,
          max_tokens: 500,
          temperature: 0.1,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.content[0]?.text || '';
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid response format from Anthropic');
    } catch (error) {
      if (this.config.verbose) {
        console.error('Anthropic API error:', error);
      }
      throw error;
    }
  }

  /**
   * Analyze a single test file
   */
  private async analyzeFile(filePath: string): Promise<TagAnalysis> {
    const content = fs.readFileSync(filePath, 'utf8');
    const existingTags = this.extractExistingTags(content);
    const lastReviewInfo = this.checkReviewStatus(content);

    // Check if already reviewed and skip if configured
    if (lastReviewInfo && this.config.skipReviewed && !this.config.forceReview) {
      return {
        file: filePath,
        existingTags,
        suggestedTags: lastReviewInfo.tags,
        confidence: 1.0,
        provider: lastReviewInfo.provider,
        reasoning: 'Previously reviewed',
        needsUpdate: false,
        alreadyReviewed: true,
        lastReviewInfo,
      };
    }

    // Local analysis first
    let suggestedTags = this.analyzeTestContent(content, filePath);
    let confidence = 0.7;
    let provider = 'local';
    let reasoning = 'Based on pattern matching';

    // Try AI providers if available
    if (this.config.apiKey || this.config.fallbackApiKey) {
      try {
        // Try primary provider (Gemini)
        if (this.config.apiKey) {
          const aiResult = await this.callAIProvider(
            content,
            filePath,
            this.config.provider as 'gemini',
            this.config.apiKey
          );
          
          if (aiResult.confidence >= 0.8) {
            suggestedTags = aiResult.tags;
            confidence = aiResult.confidence;
            provider = this.config.provider;
            reasoning = aiResult.reasoning;
          } else if (this.config.fallbackApiKey) {
            // Try fallback if confidence is low
            const fallbackProvider = this.config.fallbackProvider || 'anthropic';
            const fallbackResult = await this.callAIProvider(
              content,
              filePath,
              fallbackProvider,
              this.config.fallbackApiKey
            );
            
            suggestedTags = fallbackResult.tags;
            confidence = fallbackResult.confidence;
            provider = fallbackProvider;
            reasoning = fallbackResult.reasoning;
          }
        }
      } catch (error) {
        // Fall back to local analysis
        if (this.config.verbose) {
          console.warn(`AI analysis failed for ${filePath}, using local analysis`);
        }
      }
    }

    // Determine if update is needed
    const needsUpdate = !this.arraysEqual(existingTags.sort(), suggestedTags.sort());

    return {
      file: filePath,
      existingTags,
      suggestedTags,
      confidence,
      provider,
      reasoning,
      needsUpdate,
      alreadyReviewed: false,
      lastReviewInfo,
    };
  }

  /**
   * Update test file with new tags and review comment
   */
  private updateTestFile(filePath: string, analysis: TagAnalysis): void {
    if (this.config.dryRun) {
      console.log(chalk.yellow(`[DRY RUN] Would update ${filePath}`));
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove old review comment if exists
    content = content.replace(AI_REVIEW_REGEX, '');

    // Add new review comment
    const date = new Date().toISOString().split('T')[0];
    const reviewComment = `${AI_REVIEW_MARKER} by:${analysis.provider} on:${date} tags:[${analysis.suggestedTags.join(',')}]`;

    // Update JSDoc tags or add if missing
    const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (jsdocMatch) {
      // Update existing JSDoc
      const newJsdoc = this.updateJSDocTags(jsdocMatch[0], analysis.suggestedTags, reviewComment);
      content = content.replace(jsdocMatch[0], newJsdoc);
    } else {
      // Add new JSDoc at the beginning
      const newJsdoc = `/**\n * ${analysis.suggestedTags.join(' ')}\n * ${reviewComment}\n */\n\n`;
      content = newJsdoc + content;
    }

    fs.writeFileSync(filePath, content);
  }

  /**
   * Update JSDoc with new tags
   */
  private updateJSDocTags(jsdoc: string, tags: string[], reviewComment: string): string {
    // Remove existing tags
    let updated = jsdoc.replace(/@[\w-]+/g, '');
    
    // Remove existing review comments
    updated = updated.replace(/\/\/\s*@ai-reviewed.*$/gm, '');
    
    // Add new tags and review comment
    const lines = updated.split('\n');
    const insertIndex = lines.findIndex(line => line.includes('*/')) - 1;
    
    if (insertIndex > 0) {
      lines.splice(insertIndex, 0, ` * ${tags.join(' ')}`);
      lines.splice(insertIndex + 1, 0, ` * ${reviewComment}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Compare two arrays for equality
   */
  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  /**
   * Process files in batches
   */
  private async processBatch(files: string[]): Promise<TagAnalysis[]> {
    const results: TagAnalysis[] = [];
    
    for (const file of files) {
      try {
        const analysis = await this.analyzeFile(file);
        results.push(analysis);
        
        if (analysis.needsUpdate) {
          this.updateTestFile(file, analysis);
          this.stats.updated++;
        } else if (analysis.alreadyReviewed) {
          this.stats.skipped++;
        }
        
        this.stats.reviewed++;
      } catch (error) {
        this.stats.failed++;
        if (this.config.verbose) {
          console.error(`Error processing ${file}:`, error);
        }
      }
    }
    
    return results;
  }

  /**
   * Run batch evaluation on all test files
   */
  public async runBatchEvaluation(pattern?: string): Promise<void> {
    const spinner = ora('Finding test files...').start();
    
    // Find all test files
    const testPattern = pattern || '**/*.{test,spec}.{js,jsx,ts,tsx}';
    const files = await glob(testPattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    });
    
    this.stats.total = files.length;
    spinner.succeed(`Found ${files.length} test files`);

    // Process in batches
    const batches = [];
    for (let i = 0; i < files.length; i += this.config.batchSize) {
      batches.push(files.slice(i, i + this.config.batchSize));
    }

    for (let i = 0; i < batches.length; i++) {
      const batchSpinner = ora(`Processing batch ${i + 1}/${batches.length}`).start();
      await this.processBatch(batches[i]);
      batchSpinner.succeed(`Completed batch ${i + 1}/${batches.length}`);
    }

    // Print summary
    console.log('\n' + chalk.bold('Summary:'));
    console.log(`Total files: ${this.stats.total}`);
    console.log(`Reviewed: ${chalk.green(this.stats.reviewed)}`);
    console.log(`Updated: ${chalk.yellow(this.stats.updated)}`);
    console.log(`Skipped (already reviewed): ${chalk.blue(this.stats.skipped)}`);
    console.log(`Failed: ${chalk.red(this.stats.failed)}`);
  }

  /**
   * Run evaluation on staged files (for pre-commit)
   */
  public async runStagedEvaluation(): Promise<void> {
    try {
      // Get staged test files
      const staged = execSync('git diff --cached --name-only --diff-filter=ACM', {
        encoding: 'utf8',
      })
        .split('\n')
        .filter(file => /\.(test|spec)\.[jt]sx?$/.test(file))
        .filter(Boolean);

      if (staged.length === 0) {
        console.log(chalk.gray('No staged test files to evaluate'));
        return;
      }

      console.log(chalk.bold(`Evaluating ${staged.length} staged test files...`));
      
      for (const file of staged) {
        const spinner = ora(`Analyzing ${file}`).start();
        
        try {
          const analysis = await this.analyzeFile(file);
          
          if (analysis.needsUpdate) {
            this.updateTestFile(file, analysis);
            
            // Re-stage the file after update
            execSync(`git add ${file}`);
            
            spinner.succeed(`Updated ${file} (${analysis.provider})`);
          } else if (analysis.alreadyReviewed) {
            spinner.info(`Skipped ${file} (already reviewed)`);
          } else {
            spinner.succeed(`${file} tags are correct`);
          }
        } catch (error) {
          spinner.fail(`Failed to analyze ${file}`);
          if (this.config.verbose) {
            console.error(error);
          }
        }
      }
    } catch (error) {
      console.error(chalk.red('Error getting staged files:'), error);
      process.exit(1);
    }
  }
}

// CLI Interface
if (require.main === module) {
  const yargs = require('yargs/yargs');
  const { hideBin } = require('yargs/helpers');

  const argv = yargs(hideBin(process.argv))
    .option('provider', {
      type: 'string',
      default: 'gemini',
      choices: ['gemini', 'anthropic', 'openai'],
      description: 'Primary AI provider',
    })
    .option('fallback-provider', {
      type: 'string',
      default: 'anthropic',
      choices: ['anthropic', 'openai'],
      description: 'Fallback AI provider',
    })
    .option('batch', {
      type: 'boolean',
      default: false,
      description: 'Run batch evaluation on all test files',
    })
    .option('staged', {
      type: 'boolean',
      default: false,
      description: 'Evaluate only staged files (for pre-commit)',
    })
    .option('pattern', {
      type: 'string',
      description: 'Custom file pattern for batch mode',
    })
    .option('skip-reviewed', {
      type: 'boolean',
      default: true,
      description: 'Skip files that have already been reviewed',
    })
    .option('force-review', {
      type: 'boolean',
      default: false,
      description: 'Force re-review of all files',
    })
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: 'Show what would be updated without making changes',
    })
    .option('verbose', {
      type: 'boolean',
      default: false,
      description: 'Show detailed output',
    })
    .option('batch-size', {
      type: 'number',
      default: 10,
      description: 'Number of files to process in each batch',
    })
    .help()
    .argv;

  const tagger = new EnhancedTestTagger({
    provider: argv.provider,
    fallbackProvider: argv['fallback-provider'],
    skipReviewed: argv['skip-reviewed'],
    forceReview: argv['force-review'],
    dryRun: argv['dry-run'],
    verbose: argv.verbose,
    batchSize: argv['batch-size'],
  });

  if (argv.staged) {
    tagger.runStagedEvaluation().catch(console.error);
  } else if (argv.batch) {
    tagger.runBatchEvaluation(argv.pattern).catch(console.error);
  } else {
    console.log('Please specify --batch or --staged mode');
    process.exit(1);
  }
}

export { EnhancedTestTagger, TagAnalysis };