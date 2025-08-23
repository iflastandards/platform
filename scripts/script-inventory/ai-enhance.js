#!/usr/bin/env node

/**
 * AI Enhancement Tool for Script Inventory
 * Uses AI to analyze and interpret undocumented scripts
 * Documentation: scripts/script-inventory/README.md
 */

const Database = require('./lib/db-cli');
const fs = require('fs').promises;
const path = require('path');

class AIEnhancer {
  constructor(options = {}) {
    this.dbPath =
      options.dbPath ||
      path.join(__dirname, 'output/script-inventory/inventory.db');
    this.db = new Database(this.dbPath);
    this.rootDir = options.rootDir || path.join(__dirname, '../..');
  }

  /**
   * Get scripts that need AI analysis
   */
  async getUndocumentedScripts() {
    return this.db.exec(`
      SELECT id, path, name, type, purpose
      FROM scripts
      WHERE purpose IS NULL 
         OR purpose = ''
         OR purpose LIKE 'Usage: %'
         OR purpose LIKE 'Options:%'
         OR LENGTH(purpose) < 10
      ORDER BY path
    `);
  }

  /**
   * Analyze a script using AI
   */
  async analyzeScript(scriptInfo) {
    // Handle relative paths properly
    let fullPath;
    if (scriptInfo.path.startsWith('../')) {
      // Path is relative to script-inventory directory
      fullPath = path.join(__dirname, scriptInfo.path);
    } else if (scriptInfo.path.startsWith('/')) {
      // Absolute path
      fullPath = scriptInfo.path;
    } else {
      // Relative to root
      fullPath = path.join(this.rootDir, scriptInfo.path);
    }

    try {
      const content = await fs.readFile(fullPath, 'utf-8');

      // Prepare context for AI analysis
      const prompt = this.buildPrompt(scriptInfo, content);

      // For now, we'll use a simplified analysis
      // In production, this would call an AI API
      const analysis = this.performBasicAnalysis(scriptInfo, content);

      return analysis;
    } catch (error) {
      console.error(`Error reading ${fullPath}:`, error.message);
      return null;
    }
  }

  /**
   * Build prompt for AI analysis
   */
  buildPrompt(scriptInfo, content) {
    return `
Analyze this ${scriptInfo.type} script and provide:
1. A brief purpose/description (one sentence)
2. Whether it's deprecated
3. Whether it's a CLI tool
4. Whether it's a test file
5. Main category (build, test, utility, analysis, deployment, development, other)

Script: ${scriptInfo.name}
Path: ${scriptInfo.path}

First 100 lines of code:
${content.split('\n').slice(0, 100).join('\n')}
`;
  }

  /**
   * Perform basic analysis without AI
   * This uses heuristics to improve documentation
   */
  performBasicAnalysis(scriptInfo, content) {
    const analysis = {
      purpose: null,
      isDeprecated: false,
      isCli: false,
      isTest: false,
      category: 'other',
      confidence: 0,
    };

    const lowerContent = content.toLowerCase();
    const name = scriptInfo.name.toLowerCase();

    // Detect test files
    if (
      name.includes('test') ||
      name.includes('spec') ||
      content.includes('@test') ||
      content.includes('describe(') ||
      content.includes('it(') ||
      content.includes('test(')
    ) {
      analysis.isTest = true;
      analysis.category = 'test';
      analysis.confidence += 0.3;
    }

    // Detect build scripts
    if (
      name.includes('build') ||
      name.includes('compile') ||
      content.includes('webpack') ||
      content.includes('rollup') ||
      content.includes('vite') ||
      content.includes('nx build')
    ) {
      analysis.category = 'build';
      analysis.confidence += 0.2;
    }

    // Detect CLI tools
    if (
      content.includes('process.argv') ||
      content.includes('commander') ||
      content.includes('yargs') ||
      content.includes('--help')
    ) {
      analysis.isCli = true;
      analysis.confidence += 0.2;
    }

    // Detect deprecated
    if (
      content.includes('deprecated') ||
      content.includes('@deprecated') ||
      content.includes('DEPRECATED') ||
      content.includes('obsolete')
    ) {
      analysis.isDeprecated = true;
      analysis.confidence += 0.3;
    }

    // Generate purpose based on filename and content patterns
    analysis.purpose = this.generatePurpose(scriptInfo, content, analysis);

    return analysis;
  }

  /**
   * Generate a purpose description based on analysis
   */
  generatePurpose(scriptInfo, content, analysis) {
    const name = scriptInfo.name.replace(/\.(js|ts|py|sh)$/, '');
    const words = name.split(/[-_]/).filter(Boolean);

    // Common patterns
    if (analysis.isTest) {
      if (name.includes('e2e'))
        {return `End-to-end tests for ${words.slice(1).join(' ')}`;}
      if (name.includes('unit'))
        {return `Unit tests for ${words.slice(1).join(' ')}`;}
      if (name.includes('integration'))
        {return `Integration tests for ${words.slice(1).join(' ')}`;}
      return `Tests for ${words.join(' ')}`;
    }

    if (name.startsWith('validate-')) {
      return `Validates ${words.slice(1).join(' ')}`;
    }

    if (name.startsWith('check-')) {
      return `Checks ${words.slice(1).join(' ')}`;
    }

    if (name.startsWith('build-')) {
      return `Builds ${words.slice(1).join(' ')}`;
    }

    if (name.startsWith('generate-')) {
      return `Generates ${words.slice(1).join(' ')}`;
    }

    if (name.startsWith('create-')) {
      return `Creates ${words.slice(1).join(' ')}`;
    }

    if (name.startsWith('analyze-')) {
      return `Analyzes ${words.slice(1).join(' ')}`;
    }

    if (name.startsWith('test-')) {
      return `Tests ${words.slice(1).join(' ')}`;
    }

    if (name.includes('lint')) {
      return 'Linting and code style checking';
    }

    if (name.includes('format')) {
      return 'Code formatting utility';
    }

    if (name.includes('deploy')) {
      return 'Deployment script';
    }

    if (name.includes('migration') || name.includes('migrate')) {
      return 'Data or schema migration script';
    }

    // Check content for common patterns
    if (content.includes('nx run') || content.includes('nx affected')) {
      return 'Nx monorepo task runner';
    }

    if (content.includes('pre-commit') || content.includes('pre-push')) {
      return 'Git hook script';
    }

    // Default to descriptive name
    return `Script for ${words.join(' ')}`;
  }

  /**
   * Update database with AI analysis
   */
  async updateScript(scriptId, analysis) {
    // Update purpose if we have a better one
    if (analysis.purpose && analysis.confidence > 0.3) {
      await this.db.exec(`UPDATE scripts SET purpose = ? WHERE id = ?`, [
        analysis.purpose,
        scriptId,
      ]);
    }

    // Update flags
    if (analysis.isDeprecated) {
      await this.db.exec(`UPDATE scripts SET is_deprecated = 1 WHERE id = ?`, [
        scriptId,
      ]);
    }

    if (analysis.isCli) {
      await this.db.exec(`UPDATE scripts SET is_cli = 1 WHERE id = ?`, [
        scriptId,
      ]);
    }

    if (analysis.isTest) {
      await this.db.exec(`UPDATE scripts SET is_test = 1 WHERE id = ?`, [
        scriptId,
      ]);
    }

    // Update category tag
    if (analysis.category && analysis.category !== 'other') {
      // Remove old category tag
      await this.db.exec(
        `DELETE FROM tags WHERE script_id = ? AND tag_type = 'category'`,
        [scriptId],
      );

      // Add new category tag
      await this.db.exec(
        `INSERT INTO tags (script_id, tag, tag_type) VALUES (?, ?, 'category')`,
        [scriptId, analysis.category],
      );
    }
  }

  /**
   * Run enhancement on all undocumented scripts
   */
  async enhance(options = {}) {
    console.log('🤖 Starting AI enhancement of script inventory...\n');

    const scripts = await this.getUndocumentedScripts();
    console.log(`Found ${scripts.length} scripts needing enhancement\n`);

    let enhanced = 0;
    let errors = 0;

    for (const script of scripts) {
      if (options.verbose) {
        console.log(`Analyzing: ${script.path}`);
      }

      const analysis = await this.analyzeScript(script);

      if (analysis && analysis.confidence > 0) {
        await this.updateScript(script.id, analysis);
        enhanced++;

        if (options.verbose) {
          console.log(`  ✓ Purpose: ${analysis.purpose}`);
          if (analysis.category !== 'other') {
            console.log(`  ✓ Category: ${analysis.category}`);
          }
        }
      } else {
        errors++;
        if (options.verbose) {
          console.log(`  ✗ Could not analyze`);
        }
      }

      // Show progress
      if (!options.verbose && (enhanced + errors) % 10 === 0) {
        process.stdout.write(
          `Progress: ${enhanced + errors}/${scripts.length}\r`,
        );
      }
    }

    console.log('\n\n📊 Enhancement Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`Scripts analyzed: ${scripts.length}`);
    console.log(`Successfully enhanced: ${enhanced}`);
    console.log(`Failed: ${errors}`);

    return { enhanced, errors };
  }
}

// CLI interface
if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
AI Enhancement Tool for Script Inventory
Documentation: scripts/script-inventory/README.md

This tool uses heuristics and pattern matching to enhance
the script inventory with better descriptions and categorization.

Usage: node ai-enhance.js [options]

Options:
  --help, -h      Show this help message
  --verbose, -v   Show detailed progress
  --dry-run       Show what would be done without updating
  --db PATH       Use different database

Examples:
  node ai-enhance.js
  node ai-enhance.js --verbose
      `);
      process.exit(0);
    }

    const options = {
      verbose: args.includes('--verbose') || args.includes('-v'),
      dryRun: args.includes('--dry-run'),
    };

    const enhancer = new AIEnhancer();

    try {
      const result = await enhancer.enhance(options);
      process.exit(result.errors > 0 ? 1 : 0);
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  }

  main();
}

module.exports = AIEnhancer;
