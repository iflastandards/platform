#!/usr/bin/env node

/**
 * AI-Powered Test File Tagging Tool
 *
 * Automatically classifies and tags test files according to the IFLA Standards Platform
 * testing strategy using AI providers (Anthropic Claude, Google Gemini, OpenAI GPT-4, or Perplexity).
 *
 * Features:
 * - Multi-provider AI support for flexible cost/accuracy tradeoffs
 * - Intelligent test classification (unit/integration/e2e/smoke)
 * - File location validation with move suggestions
 * - Git integration for staged/affected files
 * - Interactive and non-interactive modes
 * - Comprehensive reporting
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { type BaseLLM, type ChatParams, type ChatResult } from '@memberjunction/ai';

// Load environment variables
dotenv.config();

// Types
interface TestAnalysis {
  classification: 'unit' | 'integration' | 'e2e' | 'smoke';
  confidence: 'high' | 'medium' | 'low';
  tags: string[];
  reasoning: string;
  concerns: string[];
  recommendations: string[];
}

interface LocationAnalysis {
  currentPath: string;
  suggestedPath: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ProcessingOptions {
  provider: 'anthropic' | 'gemini' | 'perplexity' | 'openai';
  model?: string;
  dryRun: boolean;
  interactive: boolean;
  pattern?: string;
  affected: boolean;
  staged: boolean;
  verbose: boolean;
  output?: string;
  moveFiles: boolean;
  fixNames: boolean;
}

interface ProcessingResults {
  processed: string[];
  skipped: string[];
  errors: string[];
  moved: string[];
  needsReview: Array<{
    file: string;
    analysis: TestAnalysis;
    locationIssue?: LocationAnalysis;
  }>;
}

// Test tagging rules constant
const TAGGING_RULES = `
TEST CLASSIFICATION RULES:

1. @unit - Fast isolated tests with mocked dependencies
   • Uses: vi.mock, jest.mock, or MSW for all external deps
   • Runs: pre-commit, CI, local
   • Forbids: @integration, @e2e, @server-dependent

2. @integration - Component interaction tests
   • Without @server-dependent: Uses MSW/mocks, runs in CI
   • With @server-dependent: Needs local servers, no CI
   • Forbids: @unit, @e2e, @smoke

3. @e2e - Browser automation tests (Playwright)
   • With @server-dependent: Tests localhost, local-only
   • With @post-deploy: Tests deployed URLs, CI-only
   • Forbids: @unit, @integration

4. @api - API endpoint tests
   • With MSW mocks: Runs everywhere
   • With @live-api + @server-dependent: Local server required
   • With @live-api + @post-deploy: Tests deployed APIs

5. @smoke - Critical path validation
   • Runs: CI-only, after deployment
   • Must be fast and data-independent

REQUIRED TAGS:
• Priority: @critical, @high-priority, or @low-priority
• Feature: @auth, @api, @ui, @validation, @security, etc.

FILE CONVENTIONS:
• Unit: *.unit.test.ts, in /unit/ directories
• Integration: *.integration.test.ts
• E2E: *.e2e.spec.ts, in /e2e/ directories`;

// Priority and feature area tag definitions
const PRIORITY_TAGS = ['@critical', '@high-priority', '@low-priority'];
const FEATURE_AREA_TAGS = [
  '@auth', '@api', '@ui', '@rbac', '@validation', '@security', '@cache', 
  '@error-handling', '@edge-case', '@happy-path', '@utility', '@dashboard', 
  '@admin', '@navigation', '@search', '@vocabulary'
];

// Priority mapping based on functional areas
const PRIORITY_MAPPING = {
  // Critical priority areas (security, auth, core functionality)
  '@auth': '@critical',
  '@security': '@critical',
  '@rbac': '@critical',
  '@validation': '@critical',
  
  // High priority areas (user-facing features, APIs)
  '@api': '@high-priority',
  '@ui': '@high-priority', 
  '@dashboard': '@high-priority',
  '@admin': '@high-priority',
  '@navigation': '@high-priority',
  '@search': '@high-priority',
  '@vocabulary': '@high-priority',
  
  // Low priority areas (utilities, caching, edge cases)
  '@utility': '@low-priority',
  '@cache': '@low-priority',
  '@error-handling': '@low-priority',
  '@edge-case': '@low-priority'
};

class TestTagger {
  private llm: BaseLLM | null = null;
  private spinner: any; // ora.Ora type
  private options: ProcessingOptions;

  constructor(options: ProcessingOptions) {
    this.options = options;
    this.spinner = ora();
  }

  // Initialize must be called before using the tagger
  async initialize(): Promise<void> {
    await this.initializeAIProvider();
  }

  private async initializeAIProvider() {
    // Map our provider names to the @memberjunction/ai class names and API key env vars
    const providerMap: Record<string, { className: string; apiKeyEnv: string; packageName: string }> = {
      anthropic: {
        className: 'AnthropicLLM',
        apiKeyEnv: 'ANTHROPIC_API_KEY',
        packageName: '@memberjunction/ai-anthropic'
      },
      gemini: {
        className: 'GeminiLLM',
        apiKeyEnv: 'GEMINI_API_KEY',
        packageName: '@memberjunction/ai-gemini'
      },
      openai: {
        className: 'OpenAILLM',
        apiKeyEnv: 'OPENAI_API_KEY',
        packageName: '@memberjunction/ai-openai'
      },
      perplexity: {
        className: 'OpenAILLM', // Perplexity uses OpenAI-compatible API
        apiKeyEnv: 'PERPLEXITY_API_KEY',
        packageName: '@memberjunction/ai-openai'
      }
    };

    const providerConfig = providerMap[this.options.provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${this.options.provider}`);
    }

    const apiKey = process.env[providerConfig.apiKeyEnv];
    if (!apiKey) {
      throw new Error(
        `${providerConfig.apiKeyEnv} not found in environment. Please add it to your .env file.`
      );
    }

    try {
      // Dynamically import the provider package and get the class directly
      const providerModule = await import(providerConfig.packageName);
      
      // Get the LLM class from the module
      let LLMClass: any;
      switch (this.options.provider) {
        case 'anthropic':
          LLMClass = providerModule.AnthropicLLM;
          break;
        case 'gemini':
          LLMClass = providerModule.GeminiLLM;
          break;
        case 'openai':
        case 'perplexity':
          LLMClass = providerModule.OpenAILLM;
          break;
      }

      if (!LLMClass) {
        throw new Error(`Could not find ${providerConfig.className} in ${providerConfig.packageName}`);
      }

      // Create instance directly
      this.llm = new LLMClass(apiKey);

      // For Perplexity, set the base URL
      if (this.options.provider === 'perplexity' && this.llm) {
        this.llm.SetAdditionalSettings({
          baseURL: 'https://api.perplexity.ai'
        });
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize ${this.options.provider} provider. ` +
        `Make sure ${providerConfig.packageName} is installed: ` +
        `pnpm add -D ${providerConfig.packageName}\n` +
        `Error: ${error}`
      );
    }
  }

  /**
   * Infer priority tag based on functional area tags and test classification
   */
  private inferPriorityTag(tags: string[], classification: string, content: string): string {
    // Special case: smoke tests are always critical
    if (tags.includes('@smoke') || content.includes('smoke test') || content.includes('critical path')) {
      return '@critical';
    }

    // Check functional area mapping
    for (const tag of tags) {
      if (PRIORITY_MAPPING[tag as keyof typeof PRIORITY_MAPPING]) {
        return PRIORITY_MAPPING[tag as keyof typeof PRIORITY_MAPPING];
      }
    }

    // Fallback based on classification and content patterns
    if (classification === 'e2e' || classification === 'smoke') {
      return '@critical';
    }
    
    if (classification === 'integration' && (
      content.includes('auth') || 
      content.includes('security') ||
      content.includes('login') ||
      content.includes('permission') ||
      content.includes('role')
    )) {
      return '@critical';
    }

    if (classification === 'integration' || tags.some(tag => ['@api', '@ui', '@dashboard'].includes(tag))) {
      return '@high-priority';
    }

    // Default for unit tests and utilities
    return '@low-priority';
  }

  async analyzeTestFile(filePath: string): Promise<TestAnalysis> {
    if (!this.llm) {
      throw new Error('TestTagger not initialized. Call initialize() first.');
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    const prompt = this.buildPrompt(fileName, relativePath, content);

    try {
      // Use the @memberjunction/ai abstraction
      const chatParams: ChatParams = {
        model: this.getModelName(),
        messages: [
          {
            role: 'system',
            content: 'You are a test classification expert. Respond only with valid JSON, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        maxOutputTokens: 1000
        // Note: response_format is provider-specific, not in base ChatParams
      };

      const result: ChatResult = await this.llm.ChatCompletion(chatParams);
      
      if (!result.success) {
        console.error('AI Provider Error:', result);
        throw new Error((result as any).message || 'Failed to get response from AI provider');
      }

      // Extract content from the response
      let content: string | undefined;
      if (result.data?.choices?.[0]?.message?.content) {
        content = result.data.choices[0].message.content;
      } else if ((result as any).data?.choices?.[0]?.text) {
        content = (result as any).data.choices[0].text;
      }

      if (!content) {
        console.error('AI Provider Response structure:', JSON.stringify(result, null, 2));
        throw new Error('Could not extract content from AI provider response');
      }

      // Clean up markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7); // Remove ```json
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3); // Remove ```
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3); // Remove trailing ```
      }
      cleanContent = cleanContent.trim();

      // Parse and validate the response
      const analysis = JSON.parse(cleanContent);

      // Ensure all required fields are present
      let tags = Array.isArray(analysis.tags) ? analysis.tags : [];
      const classification = analysis.classification || 'unit';
      
      // Ensure priority tag is included
      const hasPriorityTag = tags.some((tag: string) => PRIORITY_TAGS.includes(tag));
      if (!hasPriorityTag) {
        const inferredPriority = this.inferPriorityTag(tags, classification, content);
        tags.push(inferredPriority);
      }

      return {
        classification: classification,
        confidence: analysis.confidence || 'low',
        tags,
        reasoning: analysis.reasoning || 'No reasoning provided',
        concerns: Array.isArray(analysis.concerns) ? analysis.concerns : [],
        recommendations: Array.isArray(analysis.recommendations)
          ? analysis.recommendations
          : [],
      };
    } catch (error) {
      console.error(chalk.red(`Error analyzing ${filePath}:`), error);
      throw error;
    }
  }

  private getModelName(): string {
    // Map provider to default model names
    const defaultModels: Record<string, string> = {
      anthropic: this.options.model || 'claude-3-haiku-20240307', // Haiku for cost efficiency
      gemini: this.options.model || 'gemini-1.5-flash', // Updated model name
      openai: this.options.model || 'gpt-4o-mini',
      perplexity: this.options.model || 'sonar-small-online'
    };

    return defaultModels[this.options.provider] || 'gpt-4o-mini';
  }

  private buildPrompt(
    fileName: string,
    filePath: string,
    content: string,
  ): string {
    // Calculate available space for content after accounting for the template
    // The template without content is approximately 5000-6000 characters
    const templateOverhead = 6000; // Conservative estimate for template text
    const maxTotalLength = 14000; // Leave buffer under 15000
    const maxContentLength = maxTotalLength - templateOverhead;
    
    const truncatedContent =
      content.length > maxContentLength
        ? content.slice(0, maxContentLength) +
          '\n// ... content truncated for analysis ...'
        : content;

    return `You are a test classification expert for the IFLA Standards Platform.
Analyze this test file and determine the appropriate tags based on our tagging rules.

STRICT RULES TO FOLLOW:
${TAGGING_RULES}

FILE NAME: ${fileName}
FILE PATH: ${filePath}

TEST FILE CONTENT:
\`\`\`typescript
${truncatedContent}
\`\`\`

ANALYSIS INSTRUCTIONS:
1. Identify test type by looking for:
   - Mock usage (vi.mock, jest.mock, MSW handlers) → likely @unit
   - Real database/API calls without mocks → likely @integration
   - Browser automation (page.goto, page.click, Playwright) → likely @e2e
   - Critical path testing with data independence → possibly @smoke

2. Check the file location and name:
   - Is it in the correct directory for its type?
   - Does the filename follow the naming convention?

3. Assess execution characteristics:
   - Will it run fast (<5s) or slow?
   - Does it require external services?
   - Is it testing critical functionality?

4. Determine confidence level:
   - high: Clear indicators match one test type
   - medium: Some ambiguity but probable classification
   - low: Unclear or conflicting indicators

RESPONSE FORMAT (return ONLY valid JSON):
{
  "classification": "unit|integration|e2e|smoke",
  "confidence": "high|medium|low",
  "tags": ["@tag1", "@tag2", "@tag3"],
  "reasoning": "Brief explanation of why this classification was chosen",
  "concerns": ["List any ambiguities or issues found"],
  "recommendations": ["Suggested improvements for the test"]
}`;
  }


  private analyzeFileLocation(
    filePath: string,
    classification: string,
  ): LocationAnalysis | null {
    const fileName = path.basename(filePath);
    const dirPath = path.dirname(filePath);

    // Define expected locations for each test type
    const locationPatterns = {
      unit: {
        preferredDirs: ['/unit/', '/src/test/unit/', '/src/__tests__/'],
        preferredSuffix: '.unit.test.ts',
        antiPatterns: ['/integration/', '/e2e/', '/server-dependent/'],
      },
      integration: {
        preferredDirs: ['/integration/', '/src/test/integration/'],
        preferredSuffix: '.integration.test.ts',
        antiPatterns: ['/unit/', '/e2e/'],
      },
      e2e: {
        preferredDirs: ['/e2e/', '/test/e2e/'],
        preferredSuffix: '.e2e.spec.ts',
        antiPatterns: ['/unit/', '/integration/'],
      },
      smoke: {
        preferredDirs: ['/e2e/smoke/', '/test/smoke/'],
        preferredSuffix: '.smoke.spec.ts',
        antiPatterns: ['/unit/', '/integration/'],
      },
    };

    const pattern =
      locationPatterns[classification as keyof typeof locationPatterns];
    if (!pattern) {
      return null;
    }

    // Check if file is in wrong location
    const isInWrongLocation = pattern.antiPatterns.some((ap) => {
      // Remove leading/trailing slashes for more flexible matching
      const cleanPattern = ap.replace(/^\/|\/$/g, '');
      return dirPath.includes(cleanPattern);
    });
    const isInRightLocation = pattern.preferredDirs.some((pd) => {
      // Remove leading/trailing slashes for more flexible matching
      const cleanPattern = pd.replace(/^\/|\/$/g, '');
      return dirPath.includes(cleanPattern);
    });
    const hasCorrectSuffix = fileName.includes(
      pattern.preferredSuffix.replace('.ts', ''),
    );

    if (!isInWrongLocation && isInRightLocation && hasCorrectSuffix) {
      return null; // Location and naming are both fine
    }

    // Suggest new location
    let suggestedPath = filePath;
    let reason = '';
    let confidence: 'high' | 'medium' | 'low' = 'medium';

    if (isInWrongLocation) {
      confidence = 'high';
      reason = `${classification} test found in wrong directory type`;

      // Find the project root
      const projectRoot = this.findProjectRoot(filePath);
      const preferredDir = pattern.preferredDirs[0];

      // Construct suggested path
      let newFileName = fileName;
      if (!hasCorrectSuffix && this.options.fixNames) {
        const baseName = fileName.replace(
          /\.(test|spec)\.(ts|tsx|js|jsx)$/,
          '',
        );
        const extension = path.extname(fileName).split('.').pop();
        newFileName = `${baseName}${pattern.preferredSuffix.replace('.ts', '')}.${extension}`;
        reason += ' and filename pattern is incorrect';
      }

      suggestedPath = path.join(
        projectRoot,
        preferredDir.replace(/^\//, ''),
        newFileName,
      );
    } else if (!hasCorrectSuffix && this.options.fixNames) {
      confidence = 'medium';
      reason = `Filename pattern doesn't match ${classification} convention`;
      const baseName = fileName.replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, '');
      const extension = path.extname(fileName).split('.').pop();
      suggestedPath = path.join(
        dirPath,
        `${baseName}${pattern.preferredSuffix.replace('.ts', '')}.${extension}`,
      );
    }

    return {
      currentPath: filePath,
      suggestedPath,
      reason,
      confidence,
    };
  }

  private findProjectRoot(filePath: string): string {
    // Walk up directory tree to find package.json or project.json
    let current = path.dirname(filePath);
    while (current !== '/' && current !== path.parse(current).root) {
      if (
        fs.existsSync(path.join(current, 'package.json')) ||
        fs.existsSync(path.join(current, 'project.json'))
      ) {
        return current;
      }
      current = path.dirname(current);
    }
    return path.dirname(filePath);
  }

  async processFiles(): Promise<void> {
    const files = await this.getFilesToProcess();

    if (files.length === 0) {
      console.log(chalk.yellow('No test files found to process'));
      return;
    }

    console.log(
      chalk.blue(`\nFound ${files.length} test file(s) to analyze\n`),
    );

    const results: ProcessingResults = {
      processed: [],
      skipped: [],
      errors: [],
      moved: [],
      needsReview: [],
    };

    // Process files in batches for efficiency while maintaining connection
    const BATCH_SIZE = 5; // Process up to 5 files in parallel
    const useBatching = files.length > 1 && !this.options.interactive;
    
    if (useBatching) {
      console.log(chalk.gray(`Using batch processing (${BATCH_SIZE} files at a time)...`));
      
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, Math.min(i + BATCH_SIZE, files.length));
        await this.processBatch(batch, results);
      }
    } else {
      // Process sequentially for interactive mode or single file
      for (const file of files) {
        await this.processFile(file, results);
      }
    }

    this.generateReport(results);
    
    // Clean up the LLM connection
    this.cleanup();
  }

  private async processBatch(
    files: string[],
    results: ProcessingResults,
  ): Promise<void> {
    if (!this.llm) {
      throw new Error('TestTagger not initialized. Call initialize() first.');
    }

    console.log(chalk.gray(`\nProcessing batch of ${files.length} files...`));

    // Prepare all chat params for the batch
    const batchParams: ChatParams[] = [];
    const validFiles: string[] = [];

    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        const relativePath = path.relative(process.cwd(), filePath);
        const prompt = this.buildPrompt(fileName, relativePath, content);

        batchParams.push({
          model: this.getModelName(),
          messages: [
            {
              role: 'system',
              content: 'You are a test classification expert. Respond only with valid JSON, no additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0,
          maxOutputTokens: 1000
          // Note: response_format is provider-specific
        });
        validFiles.push(filePath);
      } catch (error) {
        console.error(chalk.red(`Error reading ${filePath}:`), error);
        results.errors.push(filePath);
      }
    }

    if (batchParams.length === 0) {return;}

    try {
      // Process all files in parallel using maintained connection
      const batchResults = await this.llm.ChatCompletions(batchParams);

      // Process results
      for (let i = 0; i < validFiles.length; i++) {
        const filePath = validFiles[i];
        const result = batchResults[i];
        
        this.spinner.start(`Processing ${chalk.cyan(filePath)}`);
        
        try {
          if (!result.success) {
            throw new Error((result as any).message || 'Failed to get response from AI provider');
          }

          // Extract and parse content
          const content = this.extractContentFromResult(result);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const analysis = this.parseAnalysis(content, fileContent);
          
          // Handle the analysis result
          await this.handleAnalysisResult(filePath, analysis, results);
          
          this.spinner.succeed(`Analyzed ${chalk.cyan(filePath)}`);
          results.processed.push(filePath);
          
        } catch (error) {
          this.spinner.fail(`Failed ${chalk.red(filePath)}`);
          console.error(chalk.red(`Error processing ${filePath}:`), error);
          results.errors.push(filePath);
        }
      }
    } catch (error) {
      // Fallback to sequential processing if batch fails
      console.warn(chalk.yellow('Batch processing failed, falling back to sequential...'));
      for (const file of validFiles) {
        await this.processFile(file, results);
      }
    }
  }

  private extractContentFromResult(result: ChatResult): string {
    // Extract content from the response
    let content: string | undefined;
    if (result.data?.choices?.[0]?.message?.content) {
      content = result.data.choices[0].message.content;
    } else if ((result as any).data?.choices?.[0]?.text) {
      content = (result as any).data.choices[0].text;
    }

    if (!content) {
      throw new Error('Could not extract content from AI provider response');
    }

    return content;
  }

  private parseAnalysis(content: string, fileContent: string): TestAnalysis {
    // Clean up markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    // Parse and validate the response
    const analysis = JSON.parse(cleanContent);

    // Ensure all required fields are present
    let tags = Array.isArray(analysis.tags) ? analysis.tags : [];
    const classification = analysis.classification || 'unit';
    
    // Ensure priority tag is included
    const hasPriorityTag = tags.some((tag: string) => PRIORITY_TAGS.includes(tag));
    if (!hasPriorityTag) {
      const inferredPriority = this.inferPriorityTag(tags, classification, fileContent);
      tags.push(inferredPriority);
    }

    return {
      classification: classification,
      confidence: analysis.confidence || 'low',
      tags,
      reasoning: analysis.reasoning || 'No reasoning provided',
      concerns: Array.isArray(analysis.concerns) ? analysis.concerns : [],
      recommendations: Array.isArray(analysis.recommendations)
        ? analysis.recommendations
        : [],
    };
  }

  private async handleAnalysisResult(
    filePath: string,
    analysis: TestAnalysis,
    results: ProcessingResults,
  ): Promise<void> {
    // Check file location
    const locationAnalysis = this.analyzeFileLocation(filePath, analysis.classification);
    
    if (locationAnalysis && this.options.interactive) {
      results.needsReview.push({
        file: filePath,
        analysis,
        locationIssue: locationAnalysis,
      });
    } else if (!this.options.dryRun) {
      await this.applyTags(filePath, analysis.tags);
    }
  }

  private cleanup(): void {
    // Clean up the LLM connection and resources
    if (this.llm) {
      // Clear any cached settings or state
      this.llm?.ClearAdditionalSettings();
      console.log(chalk.gray('\n✓ AI connection closed'));
    }
  }

  private async getFilesToProcess(): Promise<string[]> {
    if (this.options.staged) {
      // Get staged files
      try {
        const staged = execSync('git diff --staged --name-only', {
          encoding: 'utf8',
        })
          .split('\n')
          .filter((f) => f && f.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/));
        return staged;
      } catch {
        return [];
      }
    }

    if (this.options.affected) {
      // Get affected files via Nx
      try {
        const affected = execSync(
          'pnpm nx print-affected --type=app --select=files',
          { encoding: 'utf8' },
        )
          .split('\n')
          .filter((f) => f && f.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/));
        return affected;
      } catch {
        console.log(
          chalk.yellow(
            'Could not determine affected files. Falling back to pattern matching.',
          ),
        );
      }
    }

    // Use glob pattern
    const pattern = this.options.pattern || '**/*.{test,spec}.{ts,tsx,js,jsx}';
    return glob.sync(pattern, {
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
      ],
    });
  }

  private async processFile(
    filePath: string,
    results: ProcessingResults,
  ): Promise<void> {
    this.spinner.start(`Analyzing ${chalk.cyan(filePath)}`);

    try {
      const analysis = await this.analyzeTestFile(filePath);

      this.spinner.succeed(`Analyzed ${chalk.cyan(filePath)}`);

      if (this.options.verbose) {
        console.log(
          chalk.gray(
            `  Classification: ${analysis.classification} (${analysis.confidence} confidence)`,
          ),
        );
        console.log(chalk.gray(`  Tags: ${analysis.tags.join(', ')}`));
        console.log(chalk.gray(`  Reasoning: ${analysis.reasoning}`));
      }

      // Check file location
      const locationIssue = this.analyzeFileLocation(
        filePath,
        analysis.classification,
      );

      if (locationIssue && locationIssue.confidence !== 'low') {
        console.log(chalk.yellow(`\n  ⚠️  File location issue detected:`));
        console.log(chalk.gray(`     Current: ${locationIssue.currentPath}`));
        console.log(
          chalk.green(`     Suggested: ${locationIssue.suggestedPath}`),
        );
        console.log(chalk.gray(`     Reason: ${locationIssue.reason}`));

        if (this.options.moveFiles && this.options.interactive) {
          const { shouldMove } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'shouldMove',
              message:
                'Would you like to move this file to the suggested location?',
              default: true,
            },
          ]);

          if (shouldMove && !this.options.dryRun) {
            await this.moveTestFile(
              locationIssue.currentPath,
              locationIssue.suggestedPath,
            );
            console.log(
              chalk.green(`  ✓ Moved file to ${locationIssue.suggestedPath}`),
            );
            results.moved.push(locationIssue.suggestedPath);
            filePath = locationIssue.suggestedPath; // Update path for tag application
          }
        }

        // Add to recommendations
        analysis.recommendations.push(
          `Move file to ${locationIssue.suggestedPath}`,
        );
      }

      // Handle based on confidence
      if (
        analysis.confidence === 'low' ||
        (this.options.interactive && analysis.confidence === 'medium')
      ) {
        // Need review
        results.needsReview.push({
          file: filePath,
          analysis,
          locationIssue: locationIssue || undefined,
        });

        if (this.options.interactive) {
          const decision = await this.promptForDecision(filePath, analysis);

          if (decision.action === 'apply') {
            await this.applyTags(filePath, decision.tags);
            results.processed.push(filePath);
          } else {
            results.skipped.push(filePath);
          }
        } else {
          results.skipped.push(filePath);
        }
      } else {
        // Auto-apply if high confidence
        if (!this.options.dryRun) {
          await this.applyTags(filePath, analysis.tags);
        } else {
          console.log(
            chalk.blue(
              `  [DRY RUN] Would add tags: ${analysis.tags.join(' ')}`,
            ),
          );
        }
        results.processed.push(filePath);
      }

      // Show concerns if any
      if (analysis.concerns.length > 0) {
        console.log(
          chalk.yellow(`  ⚠️  Concerns: ${analysis.concerns.join('; ')}`),
        );
      }
    } catch (error) {
      this.spinner.fail(`Failed to analyze ${chalk.red(filePath)}`);
      if (this.options.verbose) {
        console.error(error);
      }
      results.errors.push(filePath);
    }
  }

  private async moveTestFile(from: string, to: string): Promise<void> {
    // Ensure target directory exists
    const targetDir = path.dirname(to);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Move file
    fs.renameSync(from, to);

    // Update git index if file was tracked
    try {
      execSync(`git mv "${from}" "${to}"`, { stdio: 'ignore' });
    } catch {
      // File might not be tracked yet, that's okay
    }
  }

  private async promptForDecision(
    filePath: string,
    analysis: TestAnalysis,
  ): Promise<{ action: string; tags: string[] }> {
    console.log('\n' + chalk.yellow('Manual Review Required'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(`File: ${chalk.cyan(filePath)}`);
    console.log(
      `Classification: ${analysis.classification} (${analysis.confidence} confidence)`,
    );
    console.log(`Suggested tags: ${chalk.green(analysis.tags.join(', '))}`);
    console.log(`Reasoning: ${analysis.reasoning}`);

    if (analysis.concerns.length > 0) {
      console.log(chalk.yellow(`Concerns: ${analysis.concerns.join('; ')}`));
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Apply suggested tags', value: 'apply' },
          { name: 'Edit tags', value: 'edit' },
          { name: 'Skip this file', value: 'skip' },
        ],
      },
    ]);

    if (answers.action === 'edit') {
      const editAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'tags',
          message: 'Enter tags (space-separated):',
          default: analysis.tags.join(' '),
        },
      ]);
      return {
        action: 'apply',
        tags: editAnswers.tags.split(' ').filter(Boolean),
      };
    }

    return { action: answers.action, tags: analysis.tags };
  }

  private async applyTags(filePath: string, tags: string[]): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check if tags already exist
      const existingTagMatch = content.match(
        /^\s*\/\*\*\s*\n\s*\*\s*(@\w+.*)\n\s*\*\//m,
      );
      if (existingTagMatch) {
        // Update existing tags
        const newTagComment = `/**\n * ${tags.join(' ')}\n */`;
        const newContent = content.replace(existingTagMatch[0], newTagComment);

        if (!this.options.dryRun) {
          try {
            fs.writeFileSync(filePath, newContent);
            console.log(chalk.green(`  ✓ Updated tags: ${tags.join(' ')}`));
          } catch (writeError) {
            const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
            console.error(chalk.red(`  ✗ Failed to write ${filePath}: ${errorMessage}`));
          }
        }
        return;
      }

      // Find first test/describe block
      const testMatch = content.match(
        /(describe|it|test|smokeTest|integrationTest|e2eTest)\s*\(/,
      );
      if (!testMatch || testMatch.index === undefined) {
        console.error(chalk.red(`  ✗ Cannot find test block in ${filePath}`));
        return;
      }

      // Build tag comment
      const tagComment = `/**\n * ${tags.join(' ')}\n */\n`;

      // Insert before test block
      const lines = content.slice(0, testMatch.index).split('\n');
      const lastNonEmptyLine = lines
        .map((line, i) => ({ line, index: i }))
        .filter(({ line }) => line.trim().length > 0)
        .pop();

      const insertPos = lastNonEmptyLine
        ? content
            .split('\n')
            .slice(0, lastNonEmptyLine.index + 1)
            .join('\n').length + 1
        : 0;

      const newContent =
        content.slice(0, insertPos) +
        '\n' +
        tagComment +
        content.slice(insertPos);

      if (!this.options.dryRun) {
        try {
          fs.writeFileSync(filePath, newContent);
          console.log(chalk.green(`  ✓ Applied tags: ${tags.join(' ')}`));
        } catch (writeError) {
          const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
          console.error(chalk.red(`  ✗ Failed to write ${filePath}: ${errorMessage}`));
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`  ✗ Error processing ${filePath}: ${errorMessage}`));
    }
  }

  private generateReport(results: ProcessingResults): void {
    const timestamp = new Date().toISOString();
    const report = `# Test Tagging Report

**Date:** ${timestamp}
**Provider:** ${this.options.provider}
**Model:** ${this.options.model || 'default'}
**Mode:** ${this.options.dryRun ? 'DRY RUN' : 'APPLIED'}

## Summary
- **Total files analyzed:** ${results.processed.length + results.skipped.length + results.errors.length}
- **Successfully processed:** ${results.processed.length}
- **Skipped:** ${results.skipped.length}
- **Errors:** ${results.errors.length}
- **Files moved:** ${results.moved.length}
- **Need manual review:** ${results.needsReview.length}

## Processed Files
${results.processed.length > 0 ? results.processed.map((f) => `- ✓ ${f}`).join('\n') : '_None_'}

## Skipped Files
${results.skipped.length > 0 ? results.skipped.map((f) => `- ○ ${f}`).join('\n') : '_None_'}

## Files Moved
${results.moved.length > 0 ? results.moved.map((f) => `- 📁 ${f}`).join('\n') : '_None_'}

## Errors
${results.errors.length > 0 ? results.errors.map((f) => `- ✗ ${f}`).join('\n') : '_None_'}

## Files Needing Manual Review
${
  results.needsReview.length > 0
    ? results.needsReview
        .map((r) => {
          const concerns =
            r.analysis.concerns.length > 0
              ? `\n  - Concerns: ${r.analysis.concerns.join('; ')}`
              : '';
          const location = r.locationIssue
            ? `\n  - Location issue: ${r.locationIssue.reason}`
            : '';
          return `- ⚠️  ${r.file}${concerns}${location}`;
        })
        .join('\n')
    : '_None_'
}

## Recommendations
1. Review files with low confidence classifications
2. Consider moving files to their appropriate directories
3. Ensure all tests have proper priority and feature area tags
4. Run \`pnpm test:validate\` to verify tag compliance

---
_Generated by auto-tag-tests.ts_
`;

    console.log('\n' + chalk.bold('Summary:'));
    console.log(chalk.green(`  ✓ Processed: ${results.processed.length}`));
    console.log(chalk.yellow(`  ○ Skipped: ${results.skipped.length}`));
    console.log(chalk.red(`  ✗ Errors: ${results.errors.length}`));
    if (results.moved.length > 0) {
      console.log(chalk.blue(`  📁 Moved: ${results.moved.length}`));
    }
    if (results.needsReview.length > 0) {
      console.log(
        chalk.yellow(`  ⚠️  Need review: ${results.needsReview.length}`),
      );
    }

    if (this.options.output) {
      fs.writeFileSync(this.options.output, report);
      console.log(chalk.gray(`\nReport saved to: ${this.options.output}`));
    }
  }
}

// CLI setup
const program = new Command();

program
  .name('auto-tag-tests')
  .description(
    `AI-powered test file classifier and tagger for IFLA Standards Platform

This tool analyzes test files to automatically:
  • Classify tests as unit, integration, e2e, or smoke
  • Add appropriate execution phase tags
  • Validate and suggest file relocations
  • Ensure compliance with testing strategy

Test Execution Phases:
  • Pre-commit: Unit tests only (fast, fully mocked)
  • Pre-push: Integration & E2E tests (thorough validation)
  • CI Preview/Production: Smoke tests (critical path only)

Examples:
  $ pnpm test:tag                      # Analyze all tests (dry run)
  $ pnpm test:tag --no-dry-run         # Apply changes
  $ pnpm test:tag --staged             # Check staged files only
  $ pnpm test:tag --affected           # Check Nx affected files
  $ pnpm test:tag --provider anthropic # Use Claude for high accuracy
  $ pnpm test:tag --provider gemini    # Use Gemini (free tier)
  $ pnpm test:tag --provider openai    # Use GPT-4 Turbo
  $ pnpm test:tag --move-files         # Suggest and move misplaced files`,
  )
  .version('1.0.0')
  .option(
    '-p, --provider <provider>',
    'AI provider: anthropic, gemini, openai, or perplexity',
    'gemini',
  )
  .option(
    '-m, --model <model>',
    'Specific AI model to use (provider-dependent)',
  )
  .option('-d, --dry-run', 'Preview changes without applying them', true)
  .option('--no-dry-run', 'Apply changes immediately')
  .option('-i, --interactive', 'Prompt for decisions on ambiguous cases', true)
  .option('--no-interactive', 'Run without prompts (for CI/automation)')
  .option('-s, --staged', 'Process only git staged files', false)
  .option('-a, --affected', 'Process only Nx affected files', false)
  .option('-v, --verbose', 'Show detailed output', false)
  .option('-o, --output <file>', 'Save detailed report to file')
  .option(
    '--pattern <glob>',
    'Custom file glob pattern (default: "**/*.{test,spec}.{ts,tsx,js,jsx}")',
  )
  .option('--move-files', 'Enable file relocation suggestions', false)
  .option('--fix-names', 'Fix file naming conventions', false)
  .action(async (options) => {
    try {
      // Show configuration
      console.log(chalk.bold('\n🤖 AI-Powered Test Tagger'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.gray(`Provider: ${options.provider}`));
      if (options.model) {
        console.log(chalk.gray(`Model: ${options.model}`));
      }
      console.log(
        chalk.gray(`Mode: ${options.dryRun ? 'DRY RUN' : 'APPLY CHANGES'}`),
      );
      console.log(
        chalk.gray(`Interactive: ${options.interactive ? 'Yes' : 'No'}`),
      );

      const tagger = new TestTagger(options as ProcessingOptions);
      await tagger.initialize(); // Initialize the AI provider
      await tagger.processFiles();

      if (options.dryRun) {
        console.log(
          chalk.yellow(
            '\n⚠️  This was a dry run. Use --no-dry-run to apply changes.',
          ),
        );
      }
    } catch (error: any) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      if (options.verbose && error.stack) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Only parse command line if this is the main module (not being imported for testing)
if (require.main === module) {
  program.parse();
}

// Export for testing
export { TestTagger, TestAnalysis, ProcessingOptions };
