#!/usr/bin/env node

/**
 * Script Inventory Analyzer (Fixed Version)
 * Main entry point for analyzing and inventorying scripts
 * Documentation: scripts/script-inventory/README.md
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const ScriptParser = require('./lib/parser');
const FileExtractor = require('./lib/extractors');
const Database = require('./lib/db-cli');

class ScriptAnalyzer {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.dbPath =
      options.dbPath ||
      path.join(this.rootDir, 'output/script-inventory/inventory.db');
    this.parser = new ScriptParser();
    this.extractor = new FileExtractor(this.rootDir);
    this.db = new Database(this.dbPath);

    // Configuration
    this.config = {
      scriptDirs: options.scriptDirs || ['scripts', 'tools'],
      filePatterns: options.filePatterns || [
        '**/*.js',
        '**/*.mjs',
        '**/*.cjs',
        '**/*.ts',
        '**/*.mts',
        '**/*.cts',
        '**/*.sh',
        '**/*.bash',
        '**/*.py',
      ],
      ignoreDirs: options.ignoreDirs || [
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage',
        '.next',
        '.cache',
        'tmp',
        'temp',
      ],
      minDocScore: options.minDocScore || 50,
      verbose: options.verbose || false,
    };

    this.stats = {
      totalScripts: 0,
      analyzed: 0,
      documented: 0,
      undocumented: 0,
      deprecated: 0,
      errors: [],
    };
  }

  /**
   * Main analysis entry point
   */
  async analyze() {
    console.log('🔍 Starting script inventory analysis...\n');

    // Find all scripts
    const scripts = await this.discoverScripts();
    this.stats.totalScripts = scripts.length;
    console.log(`📂 Found ${scripts.length} scripts to analyze\n`);

    // Clear existing data if doing full scan
    await this.clearDatabase();

    // Analyze each script
    const batchSize = 10;
    for (let i = 0; i < scripts.length; i += batchSize) {
      const batch = scripts.slice(i, i + batchSize);
      await Promise.all(batch.map((script) => this.analyzeScript(script)));

      // Progress update
      const progress = Math.min(i + batchSize, scripts.length);
      const percent = Math.round((progress / scripts.length) * 100);
      process.stdout.write(
        `\rProgress: ${progress}/${scripts.length} (${percent}%)`,
      );
    }

    console.log('\n');

    // Generate summary
    await this.generateSummary();

    return this.stats;
  }

  /**
   * Discover all scripts in configured directories
   */
  async discoverScripts() {
    const scripts = [];

    for (const dir of this.config.scriptDirs) {
      const dirPath = path.join(this.rootDir, dir);

      // Check if directory exists
      try {
        await fs.access(dirPath);
      } catch {
        if (this.config.verbose) {
          console.log(`⚠️  Directory not found: ${dir}`);
        }
        continue;
      }

      // Find scripts matching patterns
      for (const pattern of this.config.filePatterns) {
        const globPattern = path.join(dir, pattern);
        const matches = await glob(globPattern, {
          cwd: this.rootDir,
          ignore: this.config.ignoreDirs.map((d) => `**/${d}/**`),
        });

        scripts.push(...matches.map((m) => path.join(this.rootDir, m)));
      }
    }

    // Remove duplicates
    return [...new Set(scripts)];
  }

  /**
   * Analyze a single script
   */
  async analyzeScript(scriptPath) {
    try {
      // Parse script metadata
      const metadata = await this.parser.parseFile(scriptPath);

      // Extract file info and relationships
      const fileInfo = await this.extractor.extractFileInfo(scriptPath);
      const packageRefs =
        await this.extractor.findPackageJsonReferences(scriptPath);
      const content = await fs.readFile(scriptPath, 'utf-8');
      const relatedScripts = await this.extractor.findRelatedScripts(
        scriptPath,
        content,
      );
      const testRelationships = await this.extractor.findTestRelationships(
        scriptPath,
        content,
      );

      // Combine all data
      const scriptData = {
        ...metadata,
        ...fileInfo,
        packageReferences: packageRefs,
        relatedScripts,
        testRelationships,
        category: this.categorizeScript(scriptPath, metadata),
      };

      // Store in database
      await this.storeScript(scriptData);

      // Update stats
      this.stats.analyzed++;
      if (metadata.documentationScore >= this.config.minDocScore) {
        this.stats.documented++;
      } else {
        this.stats.undocumented++;
      }
      if (metadata.isDeprecated) {
        this.stats.deprecated++;
      }
    } catch (error) {
      this.stats.errors.push({
        script: scriptPath,
        error: error.message,
      });

      if (this.config.verbose) {
        console.error(`\n❌ Error analyzing ${scriptPath}:`, error.message);
      }
    }
  }

  /**
   * Categorize script based on path and content
   */
  categorizeScript(scriptPath, metadata) {
    const relativePath = path.relative(this.rootDir, scriptPath);

    // Check by path
    if (relativePath.includes('test') || relativePath.includes('spec')) {
      return 'test';
    }
    if (relativePath.includes('build') || relativePath.includes('webpack')) {
      return 'build';
    }
    if (relativePath.includes('deploy') || relativePath.includes('release')) {
      return 'deployment';
    }
    if (
      relativePath.includes('migrate') ||
      relativePath.includes('migration')
    ) {
      return 'migration';
    }
    if (relativePath.includes('dev') || relativePath.includes('debug')) {
      return 'development';
    }
    if (relativePath.includes('util') || relativePath.includes('helper')) {
      return 'utility';
    }
    if (relativePath.includes('analyze') || relativePath.includes('report')) {
      return 'analysis';
    }

    // Check by content/purpose
    const purpose = (metadata.purpose || '').toLowerCase();
    if (purpose.includes('test')) {return 'test';}
    if (purpose.includes('build')) {return 'build';}
    if (purpose.includes('deploy')) {return 'deployment';}
    if (purpose.includes('migrate')) {return 'migration';}
    if (purpose.includes('analyze')) {return 'analysis';}
    if (purpose.includes('check') || purpose.includes('validate'))
      {return 'validation';}
    if (purpose.includes('generate') || purpose.includes('scaffold'))
      {return 'generation';}

    return 'other';
  }

  /**
   * Store script data in database
   */
  async storeScript(data) {
    try {
      // Insert script into main table
      await this.db.exec(
        `
        INSERT OR REPLACE INTO scripts (
          path, name, type, file_size, file_hash,
          purpose, is_deprecated, is_cli, is_test,
          has_help_option, has_man_option,
          last_modified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
        [
          data.relativePath,
          data.fileName,
          data.fileType,
          data.size,
          data.hash,
          data.purpose || '',
          data.isDeprecated ? 1 : 0,
          data.hasCliArgs ? 1 : 0,
          data.hasTestTags ? 1 : 0,
          data.hasHelp ? 1 : 0,
          data.hasManOption ? 1 : 0,
          data.lastModified,
        ],
      );

      // Get the script ID
      const result = await this.db.exec(
        `SELECT id FROM scripts WHERE path = ?`,
        [data.relativePath],
      );
      if (!result || result.length === 0) {
        throw new Error(`Failed to get script ID for ${data.relativePath}`);
      }
      const scriptId = result[0].id;

      // Store CLI options
      for (const arg of data.cliArguments || []) {
        await this.db.exec(
          `
          INSERT OR IGNORE INTO cli_options (
            script_id, option_name, description, required
          ) VALUES (?, ?, ?, ?)
        `,
          [scriptId, arg.argument, arg.description, 0],
        );
      }

      // Store dependencies
      for (const dep of data.dependencies || []) {
        const depType = dep.startsWith('.')
          ? 'local'
          : dep.match(/^[a-z]+$/)
            ? 'builtin'
            : 'npm';
        await this.db.exec(
          `
          INSERT OR IGNORE INTO dependencies (
            script_id, dependency, dependency_type
          ) VALUES (?, ?, ?)
        `,
          [scriptId, dep, depType],
        );
      }

      // Store tags (test tags and categories)
      for (const tag of data.testTags || []) {
        await this.db.exec(
          `
          INSERT OR IGNORE INTO tags (
            script_id, tag, tag_type
          ) VALUES (?, ?, 'test')
        `,
          [scriptId, tag],
        );
      }

      // Add category as a tag
      await this.db.exec(
        `
        INSERT OR IGNORE INTO tags (
          script_id, tag, tag_type
        ) VALUES (?, ?, 'category')
      `,
        [scriptId, data.category],
      );

      // Store package.json references
      for (const ref of data.packageReferences || []) {
        // Extract just the script name from the command
        const scriptName = ref.name || 'unknown';
        const packagePath = path.relative(this.rootDir, ref.packageJson);

        await this.db.exec(
          `
          INSERT OR IGNORE INTO package_json_scripts (
            script_id, npm_script_name, command, package_json_path
          ) VALUES (?, ?, ?, ?)
        `,
          [scriptId, scriptName, ref.command || '', packagePath],
        );
      }
    } catch (error) {
      if (this.config.verbose) {
        console.error(
          `\nError storing script ${data.relativePath}:`,
          error.message,
        );
      }
      throw error;
    }
  }

  /**
   * Clear existing database data
   */
  async clearDatabase() {
    const tables = [
      'package_json_scripts',
      'tags',
      'cli_options',
      'dependencies',
      'related_scripts',
      'scripts',
    ];

    for (const table of tables) {
      try {
        await this.db.exec(`DELETE FROM ${table}`);
      } catch (error) {
        if (this.config.verbose) {
          console.log(`Note: Could not clear table ${table}:`, error.message);
        }
      }
    }
  }

  /**
   * Generate analysis summary
   */
  async generateSummary() {
    console.log('\n📊 Analysis Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`Total scripts found:        ${this.stats.totalScripts}`);
    console.log(`Successfully analyzed:      ${this.stats.analyzed}`);
    console.log(
      `Well documented (≥${this.config.minDocScore}%):    ${this.stats.documented}`,
    );
    console.log(`Poorly documented:          ${this.stats.undocumented}`);
    console.log(`Deprecated scripts:         ${this.stats.deprecated}`);
    console.log(`Analysis errors:            ${this.stats.errors.length}`);

    // Category breakdown
    const categories = await this.db.exec(`
      SELECT tag as category, COUNT(*) as count
      FROM tags
      WHERE tag_type = 'category'
      GROUP BY tag
      ORDER BY count DESC
    `);

    if (categories && categories.length > 0) {
      console.log('\n📁 Scripts by Category:');
      for (const cat of categories) {
        console.log(`  ${cat.category.padEnd(15)} ${cat.count}`);
      }
    }

    // Script types breakdown
    const types = await this.db.exec(`
      SELECT type, COUNT(*) as count
      FROM scripts
      GROUP BY type
      ORDER BY count DESC
    `);

    if (types && types.length > 0) {
      console.log('\n📝 Scripts by Type:');
      for (const t of types) {
        console.log(`  ${t.type.padEnd(20)} ${t.count}`);
      }
    }

    // Deprecated scripts
    const deprecated = await this.db.exec(
      `
      SELECT path
      FROM scripts
      WHERE is_deprecated = 1
      LIMIT 10
    `,
    );

    if (deprecated && deprecated.length > 0) {
      console.log(`\n⚠️  Deprecated scripts:`);
      for (const script of deprecated) {
        console.log(`  - ${script.path}`);
      }
    }

    if (this.stats.errors.length > 0) {
      console.log('\n❌ Analysis Errors:');
      for (const error of this.stats.errors.slice(0, 5)) {
        console.log(`  - ${error.script}: ${error.error}`);
      }
      if (this.stats.errors.length > 5) {
        console.log(`  ... and ${this.stats.errors.length - 5} more errors`);
      }
    }

    console.log('\n✅ Analysis complete!');
    console.log(`📄 Database saved to: ${this.dbPath}`);
  }
}

// CLI interface
if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Script Inventory Analyzer
Documentation: scripts/script-inventory/README.md

Usage: node analyze-fixed.js [options]

Options:
  --help, -h           Show this help message
  --verbose, -v        Show detailed progress
  --min-doc-score N    Minimum documentation score (default: 50)
  --output PATH        Database output path
  --dirs DIR1,DIR2     Directories to scan (default: scripts,tools)

Examples:
  # Full analysis
  node analyze-fixed.js
  
  # Verbose mode with custom threshold
  node analyze-fixed.js --verbose --min-doc-score 70
  
  # Custom directories
  node analyze-fixed.js --dirs scripts,tools,developer_notes

Output:
  Database: output/script-inventory/inventory.db
  Use the query.js tool to search and report on results.
      `);
      process.exit(0);
    }

    // Parse options
    const options = {
      verbose: args.includes('--verbose') || args.includes('-v'),
    };

    // Min doc score
    const minDocIndex = args.findIndex((a) => a === '--min-doc-score');
    if (minDocIndex !== -1 && args[minDocIndex + 1]) {
      options.minDocScore = parseInt(args[minDocIndex + 1]);
    }

    // Output path
    const outputIndex = args.findIndex((a) => a === '--output');
    if (outputIndex !== -1 && args[outputIndex + 1]) {
      options.dbPath = args[outputIndex + 1];
    }

    // Directories
    const dirsIndex = args.findIndex((a) => a === '--dirs');
    if (dirsIndex !== -1 && args[dirsIndex + 1]) {
      options.scriptDirs = args[dirsIndex + 1].split(',');
    }

    // Run analysis
    const analyzer = new ScriptAnalyzer(options);

    try {
      const stats = await analyzer.analyze();
      process.exit(stats.errors.length > 0 ? 1 : 0);
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  }

  main();
}
