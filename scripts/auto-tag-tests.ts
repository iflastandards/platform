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
import dotenv from 'dotenv';

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
Test Classification and Tagging Rules for IFLA Standards Platform:

1. UNIT TESTS (@unit):
   - Environment: pre-commit, local development only
   - Characteristics: 
     * Fully mocked dependencies (using vi.mock, jest.mock, or MSW)
     * No external service calls
     * Fast execution (<5s)
     * Isolated component/function testing
   - Required tags: @unit, priority tag (@critical/@high-priority/@low-priority), feature area tag
   - Forbidden tags: @integration, @e2e, @smoke, @server-dependent, @slow
   - File location: /unit/, /src/test/unit/, or /src/__tests__/
   - File naming: *.unit.test.ts or *.unit.test.tsx

2. INTEGRATION TESTS (@integration):
   - Environment: pre-push, local development
   - Characteristics:
     * Uses real services, databases, or file systems
     * Tests component interactions
     * May be slower (>5s is acceptable)
     * Can make actual API calls
   - Required tags: @integration, priority tag, feature area tag
   - Optional tags: @server-dependent, @slow, @flaky
   - Forbidden tags: @unit, @smoke
   - File location: /integration/, /src/test/integration/
   - File naming: *.integration.test.ts

3. E2E TESTS (@e2e):
   - Environment: pre-push, local development
   - Characteristics:
     * Browser-based testing using Playwright
     * Full user workflows
     * Often slow (>30s)
     * Tests complete features end-to-end
   - Required tags: @e2e, priority tag, feature area tag
   - Optional tags: @slow, @flaky, @browser-specific (chromium-only, firefox-only, webkit-only)
   - Forbidden tags: @unit, @integration, @smoke
   - File location: /e2e/
   - File naming: *.e2e.spec.ts

4. SMOKE TESTS (@smoke):
   - Environment: CI only (both preview and production)
   - Characteristics:
     * Critical path validation only
     * Must be data-independent
     * Fast and highly reliable
     * URL-configurable (no hardcoded URLs)
     * Tests core functionality is working
   - Required tags: @smoke, @critical (always critical priority)
   - Forbidden tags: @slow, @flaky, @server-dependent, @unit, @integration
   - File location: /e2e/smoke/, /test/smoke/
   - File naming: *.smoke.spec.ts

Priority Tags (choose one):
- @critical: Core functionality that must always work
- @high-priority: Important features that should work before release
- @low-priority: Nice-to-have features that can be fixed later

Feature Area Tags (choose at least one):
- @auth: Authentication and authorization
- @api: API endpoints and data operations
- @ui: User interface components
- @rbac: Role-based access control
- @validation: Data validation and sanitization
- @dashboard: Dashboard-specific features
- @admin: Admin panel features
- @navigation: Navigation and routing
- @search: Search functionality
- @vocabulary: Vocabulary management

Optional Environment Tags:
- @local-only: Only runs locally
- @ci-only: Only runs in CI
- @server-dependent: Requires live servers
- @slow: Takes more than 30 seconds
- @flaky: Known to be unstable (should be fixed)
`;

class TestTagger {
  private aiProvider: any;
  private spinner: any; // ora.Ora type
  private options: ProcessingOptions;

  constructor(options: ProcessingOptions) {
    this.options = options;
    this.spinner = ora();
    this.initializeAIProvider();
  }

  private async initializeAIProvider() {
    switch (this.options.provider) {
      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error(
            'ANTHROPIC_API_KEY not found in environment. Please add it to your .env file.',
          );
        }
        // Dynamic import to avoid loading unnecessary providers
        const { default: Anthropic } = await import('@anthropic-ai/sdk');
        this.aiProvider = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        break;

      case 'gemini':
        if (!process.env.GEMINI_API_KEY) {
          throw new Error(
            'GEMINI_API_KEY not found in environment. Please add it to your .env file.',
          );
        }
        try {
          const GoogleGenerativeAI = (
            (await import('@google/generative-ai')) as any
          ).GoogleGenerativeAI;
          this.aiProvider = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        } catch (error) {
          throw new Error(
            'Google Generative AI package not installed. Run: pnpm add -D @google/generative-ai',
          );
        }
        break;

      case 'perplexity':
        if (!process.env.PERPLEXITY_API_KEY) {
          throw new Error(
            'PERPLEXITY_API_KEY not found in environment. Please add it to your .env file.',
          );
        }
        // Perplexity uses OpenAI-compatible API, we'll use fetch directly
        this.aiProvider = { apiKey: process.env.PERPLEXITY_API_KEY };
        break;

      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error(
            'OPENAI_API_KEY not found in environment. Please add it to your .env file.',
          );
        }
        // OpenAI - we'll use fetch directly with their API
        this.aiProvider = { apiKey: process.env.OPENAI_API_KEY };
        break;

      default:
        throw new Error(`Unsupported provider: ${this.options.provider}`);
    }
  }

  async analyzeTestFile(filePath: string): Promise<TestAnalysis> {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    const prompt = this.buildPrompt(fileName, relativePath, content);

    try {
      let response: string;

      switch (this.options.provider) {
        case 'anthropic':
          response = await this.callAnthropic(prompt);
          break;
        case 'gemini':
          response = await this.callGemini(prompt);
          break;
        case 'perplexity':
          response = await this.callPerplexity(prompt);
          break;
        case 'openai':
          response = await this.callOpenAI(prompt);
          break;
        default:
          throw new Error('Invalid provider');
      }

      // Parse and validate the response
      const analysis = JSON.parse(response);

      // Ensure all required fields are present
      return {
        classification: analysis.classification || 'unit',
        confidence: analysis.confidence || 'low',
        tags: Array.isArray(analysis.tags) ? analysis.tags : [],
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

  private buildPrompt(
    fileName: string,
    filePath: string,
    content: string,
  ): string {
    // Truncate content if too long to avoid token limits
    const maxContentLength = 8000;
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

  private async callAnthropic(prompt: string): Promise<string> {
    const model = this.options.model || 'claude-3-haiku-20240307'; // Use Haiku by default for cost
    const response = await this.aiProvider.messages.create({
      model,
      max_tokens: 1000,
      temperature: 0,
      system:
        'You are a test classification expert. Respond only with valid JSON, no additional text.',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content[0].text;
  }

  private async callGemini(prompt: string): Promise<string> {
    const model = this.aiProvider.getGenerativeModel({
      model: this.options.model || 'gemini-pro',
    });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  private async callPerplexity(prompt: string): Promise<string> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.aiProvider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.options.model || 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content:
              'You are a test classification expert. Respond only with valid JSON, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.aiProvider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.options.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a test classification expert. Respond only with valid JSON, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
        response_format: { type: 'json_object' }, // Ensure JSON response
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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
    if (!pattern) {return null;}

    // Check if file is in wrong location
    const isInWrongLocation = pattern.antiPatterns.some((ap) =>
      dirPath.includes(ap),
    );
    const isInRightLocation = pattern.preferredDirs.some((pd) =>
      dirPath.includes(pd),
    );
    const hasCorrectSuffix = fileName.includes(
      pattern.preferredSuffix.replace('.ts', ''),
    );

    if (!isInWrongLocation && (isInRightLocation || hasCorrectSuffix)) {
      return null; // Location is fine
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

    for (const file of files) {
      await this.processFile(file, results);
    }

    this.generateReport(results);
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
        fs.writeFileSync(filePath, newContent);
        console.log(chalk.green(`  ✓ Updated tags: ${tags.join(' ')}`));
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
      fs.writeFileSync(filePath, newContent);
      console.log(chalk.green(`  ✓ Applied tags: ${tags.join(' ')}`));
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

program.parse();

// Export for testing
export { TestTagger, TestAnalysis, ProcessingOptions };
