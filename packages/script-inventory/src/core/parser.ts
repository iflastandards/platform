#!/usr/bin/env node

/**
 * Script Parser Module
 * Extracts metadata and documentation from script files
 * Converted to TypeScript from scripts/script-inventory/lib/parser.js
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { ScriptType, CliOption, Tag } from '../types';

export interface ParsedScript {
  path: string;
  name: string;
  type: ScriptType;
  purpose: string;
  description: string;
  usage: string;
  examples: string[];
  cliOptions: CliOption[];
  tags: Tag[];
  imports: string[];
  isDeprecated: boolean;
  isCli: boolean;
  isTest: boolean;
  hasHelpOption: boolean;
  hasManOption: boolean;
  docScore: number;
  author?: string;
  created?: Date;
}

export interface ParserPatterns {
  docString: RegExp;
  docComment: RegExp;
  lineComment: RegExp;
  cliArgs: {
    yargs: RegExp;
    commander: RegExp;
    argparse: RegExp;
    processArgv: RegExp;
    bashGetopts: RegExp;
    bashCase: RegExp;
  };
  purpose: {
    header: RegExp;
    usage: RegExp;
    help: RegExp;
  };
  deprecated: RegExp;
  testTags: RegExp;
  imports: {
    commonjs: RegExp;
    esm: RegExp;
    python: RegExp;
    bash: RegExp;
  };
}

export class ScriptParser {
  private patterns: ParserPatterns = {
    // Documentation patterns
    docString: /^(['"])([^'"]*)\1/gm,
    docComment: /\/\*\*([\s\S]*?)\*\//g,
    lineComment: /^\s*(?:\/\/|#)\s*(.+)/gm,

    // CLI argument patterns
    cliArgs: {
      yargs: /\.option\(['"]([^'"]+)['"],\s*{([^}]+)}/g,
      commander: /\.option\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/g,
      argparse: /add_argument\(['"]([^'"]+)['"]/g,
      processArgv: /process\.argv\.(?:slice|indexOf)\(['"]([^'"]+)['"]/g,
      bashGetopts: /getopts\s+["']([^"']+)["']/g,
      bashCase: /case\s+"\$1"\s+in([\s\S]*?)esac/g,
    },

    // Purpose patterns
    purpose: {
      header: /(?:Purpose|Description|Summary):\s*(.+)/gi,
      usage: /Usage:\s*(.+)/gi,
      help: /--help.*?:\s*(.+)/gi,
    },

    // Deprecation patterns
    deprecated: /@deprecated|DEPRECATED|This script is deprecated/gi,

    // Test tags
    testTags: /@(unit|integration|e2e|smoke|slow|flaky|skip)\b/gi,

    // Import/require patterns
    imports: {
      commonjs: /require\(['"]([^'"]+)['"]\)/g,
      esm: /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      python: /^(?:import|from)\s+([^\s]+)/gm,
      bash: /source\s+['"]?([^'"\s]+)['"]?/g,
    },
  };

  /**
   * Parse a script file and extract metadata
   */
  async parseScript(filePath: string): Promise<ParsedScript> {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath).toLowerCase();

    const type = this.determineScriptType(extension);
    const purpose = this.extractPurpose(content);
    const description = this.extractDescription(content);
    const usage = this.extractUsage(content);
    const examples = this.extractExamples(content);
    const cliOptions = this.extractCliOptions(content, type);
    const tags = this.extractTags(content);
    const imports = this.extractImports(content, type);
    const isDeprecated = this.checkDeprecated(content);
    const isCli = this.checkIsCli(content, cliOptions);
    const isTest = this.checkIsTest(filePath, tags);
    const hasHelpOption = this.checkHasHelpOption(content);
    const hasManOption = this.checkHasManOption(content);
    const author = this.extractAuthor(content);
    const created = await this.extractCreatedDate(filePath);

    const docScore = this.calculateDocumentationScore({
      purpose,
      description,
      usage,
      examples,
      cliOptions,
      hasHelpOption,
      content,
    });

    return {
      path: filePath,
      name: fileName,
      type,
      purpose,
      description,
      usage,
      examples,
      cliOptions,
      tags,
      imports,
      isDeprecated,
      isCli,
      isTest,
      hasHelpOption,
      hasManOption,
      docScore,
      author,
      created,
    };
  }

  /**
   * Determine script type from file extension
   */
  private determineScriptType(extension: string): ScriptType {
    switch (extension) {
      case '.js':
      case '.mjs':
      case '.cjs':
        return 'javascript';
      case '.ts':
      case '.tsx':
      case '.mts':
      case '.cts':
        return 'typescript';
      case '.py':
      case '.py3':
        return 'python';
      case '.sh':
      case '.bash':
      case '.zsh':
      case '.fish':
        return 'shell';
      default:
        return 'javascript'; // Default fallback
    }
  }

  /**
   * Extract purpose from various documentation patterns
   */
  private extractPurpose(content: string): string {
    // Try header patterns first
    let match = this.patterns.purpose.header.exec(content);
    if (match) return match[1].trim();

    // Try first JSDoc comment
    match = this.patterns.docComment.exec(content);
    if (match) {
      const docContent = match[1].trim();
      const firstLine = docContent.split('\n')[0].replace(/^\*\s*/, '').trim();
      if (firstLine && firstLine.length > 10) return firstLine;
    }

    // Try first meaningful comment
    this.patterns.lineComment.lastIndex = 0;
    while ((match = this.patterns.lineComment.exec(content)) !== null) {
      const comment = match[1].trim();
      if (comment.length > 15 && !comment.startsWith('@') && !comment.includes('eslint')) {
        return comment;
      }
    }

    return 'No description available';
  }

  /**
   * Extract detailed description
   */
  private extractDescription(content: string): string {
    const match = this.patterns.docComment.exec(content);
    if (match) {
      return match[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s*/, ''))
        .join('\n')
        .trim();
    }
    return '';
  }

  /**
   * Extract usage information
   */
  private extractUsage(content: string): string {
    const match = this.patterns.purpose.usage.exec(content);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract code examples
   */
  private extractExamples(content: string): string[] {
    const examples: string[] = [];
    
    // Look for example sections in comments
    const examplePattern = /(?:Example|Examples):\s*([\s\S]*?)(?:\n\s*\*\/|\n\s*$|\n\s*\*\s*@)/gi;
    let match;
    
    while ((match = examplePattern.exec(content)) !== null) {
      const example = match[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s*/, '').trim())
        .filter(line => line)
        .join('\n')
        .trim();
      
      if (example) {
        examples.push(example);
      }
    }

    return examples;
  }

  /**
   * Extract CLI options from various patterns
   */
  private extractCliOptions(content: string, type: ScriptType): CliOption[] {
    const options: CliOption[] = [];
    let match;

    // Commander.js pattern
    this.patterns.cliArgs.commander.lastIndex = 0;
    while ((match = this.patterns.cliArgs.commander.exec(content)) !== null) {
      const optionName = match[1];
      const description = match[2] || '';
      options.push({
        id: 0, // Will be set by database
        scriptId: '', // Will be set by database
        optionName,
        description,
        required: false,
      });
    }

    // Yargs pattern
    this.patterns.cliArgs.yargs.lastIndex = 0;
    while ((match = this.patterns.cliArgs.yargs.exec(content)) !== null) {
      const optionName = match[1];
      const optionConfig = match[2];
      const description = this.extractFromConfig(optionConfig, 'describe') || 
                         this.extractFromConfig(optionConfig, 'description') || '';
      const required = this.extractFromConfig(optionConfig, 'required') === 'true';
      
      options.push({
        id: 0,
        scriptId: '',
        optionName,
        description,
        required,
      });
    }

    // Bash getopts pattern
    if (type === 'shell') {
      this.patterns.cliArgs.bashGetopts.lastIndex = 0;
      while ((match = this.patterns.cliArgs.bashGetopts.exec(content)) !== null) {
        const optString = match[1];
        for (const char of optString) {
          if (char !== ':') {
            options.push({
              id: 0,
              scriptId: '',
              optionName: `-${char}`,
              description: '',
              required: false,
            });
          }
        }
      }
    }

    return options;
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string): Tag[] {
    const tags: Tag[] = [];
    let match;

    // Test tags
    this.patterns.testTags.lastIndex = 0;
    while ((match = this.patterns.testTags.exec(content)) !== null) {
      tags.push({
        id: 0,
        scriptId: '',
        tag: match[1],
        tagType: 'test',
      });
    }

    return tags;
  }

  /**
   * Extract import statements
   */
  private extractImports(content: string, type: ScriptType): string[] {
    const imports = new Set<string>();
    let match;

    const patterns = this.patterns.imports;

    // JavaScript/TypeScript imports
    if (type === 'javascript' || type === 'typescript') {
      [patterns.commonjs, patterns.esm].forEach(pattern => {
        pattern.lastIndex = 0;
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1];
          if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            imports.add(importPath.split('/')[0]); // Get package name
          }
        }
      });
    }

    // Python imports
    if (type === 'python') {
      patterns.python.lastIndex = 0;
      while ((match = patterns.python.exec(content)) !== null) {
        imports.add(match[1].split('.')[0]); // Get top-level module
      }
    }

    // Shell sources
    if (type === 'shell') {
      patterns.bash.lastIndex = 0;
      while ((match = patterns.bash.exec(content)) !== null) {
        imports.add(match[1]);
      }
    }

    return Array.from(imports);
  }

  /**
   * Check if script is deprecated
   */
  private checkDeprecated(content: string): boolean {
    return this.patterns.deprecated.test(content);
  }

  /**
   * Check if script is a CLI tool
   */
  private checkIsCli(content: string, cliOptions: CliOption[]): boolean {
    return cliOptions.length > 0 || 
           content.includes('process.argv') ||
           content.includes('argparse') ||
           content.includes('click') ||
           content.includes('getopt');
  }

  /**
   * Check if script is a test
   */
  private checkIsTest(filePath: string, tags: Tag[]): boolean {
    const fileName = path.basename(filePath).toLowerCase();
    const hasTestTags = tags.some(tag => tag.tagType === 'test');
    const hasTestInName = fileName.includes('test') || 
                         fileName.includes('spec') || 
                         fileName.includes('.e2e.');
    
    return hasTestTags || hasTestInName;
  }

  /**
   * Check if script has help option
   */
  private checkHasHelpOption(content: string): boolean {
    return content.includes('--help') || content.includes('-h');
  }

  /**
   * Check if script has man option
   */
  private checkHasManOption(content: string): boolean {
    return content.includes('--man');
  }

  /**
   * Extract author information
   */
  private extractAuthor(content: string): string | undefined {
    const authorPattern = /@author\s+(.+)/i;
    const match = authorPattern.exec(content);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Extract creation date from git or file stats
   */
  private async extractCreatedDate(filePath: string): Promise<Date | undefined> {
    try {
      const stats = await fs.stat(filePath);
      return stats.birthtime;
    } catch {
      return undefined;
    }
  }

  /**
   * Calculate documentation score
   */
  private calculateDocumentationScore(data: {
    purpose: string;
    description: string;
    usage: string;
    examples: string[];
    cliOptions: CliOption[];
    hasHelpOption: boolean;
    content: string;
  }): number {
    let score = 0;

    // Basic description (20 points)
    if (data.purpose && data.purpose !== 'No description available') {
      score += 20;
    }

    // Detailed description (15 points)
    if (data.description && data.description.length > 50) {
      score += 15;
    }

    // Usage information (15 points)
    if (data.usage) {
      score += 15;
    }

    // Examples (15 points)
    if (data.examples.length > 0) {
      score += 15;
    }

    // CLI documentation (10 points)
    if (data.cliOptions.length > 0 && data.cliOptions.some(opt => opt.description)) {
      score += 10;
    }

    // Help option (10 points)
    if (data.hasHelpOption) {
      score += 10;
    }

    // JSDoc comments (10 points)
    if (this.patterns.docComment.test(data.content)) {
      score += 10;
    }

    // File length bonus (5 points for longer files)
    if (data.content.length > 1000) {
      score += 5;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Extract value from configuration string
   */
  private extractFromConfig(config: string, key: string): string | null {
    const pattern = new RegExp(`${key}:\\s*['"]([^'"]+)['"]`);
    const match = pattern.exec(config);
    return match ? match[1] : null;
  }
}

// Export default instance
export const scriptParser = new ScriptParser();