#!/usr/bin/env node

/**
 * Script Inventory Analyzer
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
    // Check if script already exists
    const existing = await this.db.query(
      `SELECT id FROM scripts WHERE path = ?`,
      [data.relativePath]
    );
    
    let scriptId;
    if (existing && existing.length > 0) {
      // Update existing script
      scriptId = existing[0].id;
      await this.db.exec(
        `UPDATE scripts SET 
          name = ?, type = ?, size = ?, file_hash = ?,
          category = ?, purpose = ?, documentation_score = ?, 
          is_deprecated = ?, is_executable = ?, has_help = ?,
          has_error_handling = ?, has_shebang = ?, last_modified = ?,
          updated_at = datetime('now')
        WHERE id = ?`,
        [
          data.fileName,
          data.fileType,
          data.size,
          data.hash,
          data.category,
          data.purpose,
          data.documentationScore,
          data.isDeprecated ? 1 : 0,
          data.isExecutable ? 1 : 0,
          data.hasHelpOption ? 1 : 0,
          data.hasErrorHandling ? 1 : 0,
          data.shebang ? 1 : 0,
          data.modified.toISOString(),
          scriptId
        ]
      );
    } else {
    // Insert script
    await this.db.exec(
      `
      INSERT INTO scripts (
        file_path, file_name, file_type, file_size, file_hash,
        category, purpose, documentation_score, is_deprecated,
        is_executable, has_help, has_error_handling, shebang,
        last_modified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `,
      [
        data.relativePath,
        data.fileName,
        data.fileType,
        data.size,
        data.hash,
        data.category,
        data.purpose,
        data.documentationScore,
        data.isDeprecated ? 1 : 0,
        data.isExecutable ? 1 : 0,
        data.hasHelpOption ? 1 : 0,
        data.hasErrorHandling ? 1 : 0,
        data.shebang,
        data.modified.toISOString(),
      ],
    );

    // Get the last inserted script ID
    const result = await this.db.query(`SELECT last_insert_rowid() as id`);
    const scriptId = result[0].id;

    // Store documentation
    if (data.documentation) {
      await this.db.exec(
        `
        INSERT INTO documentation (
          script_id, doc_string, header_comments, doc_comments,
          inline_comment_count
        ) VALUES (?, ?, ?, ?, ?)
      `,
        [
          scriptId,
          data.documentation.docString,
          JSON.stringify(data.documentation.headerComments),
          JSON.stringify(data.documentation.docComments),
          data.documentation.inlineComments,
        ],
      );
    }

    // Store CLI arguments
    for (const arg of data.cliArguments || []) {
      await this.db.exec(
        `
        INSERT INTO cli_arguments (
          script_id, argument, description, library
        ) VALUES (?, ?, ?, ?)
      `,
        [scriptId, arg.argument, arg.description, arg.library],
      );
    }

    // Store dependencies
    for (const dep of data.dependencies || []) {
      await this.db.exec(
        `
        INSERT INTO dependencies (
          script_id, dependency_name, dependency_type
        ) VALUES (?, ?, ?)
      `,
        [scriptId, dep, 'import'],
      );
    }

    // Store functions
    for (const func of data.functions || []) {
      await this.db.exec(
        `
        INSERT INTO functions (
          script_id, function_name
        ) VALUES (?, ?)
      `,
        [scriptId, func],
      );
    }

    // Store environment variables
    for (const envVar of data.envVars || []) {
      await this.db.exec(
        `
        INSERT INTO environment_vars (
          script_id, var_name
        ) VALUES (?, ?)
      `,
        [scriptId, envVar],
      );
    }

    // Store output formats
    for (const format of data.outputFormats || []) {
      await this.db.exec(
        `
        INSERT INTO output_formats (
          script_id, format
        ) VALUES (?, ?)
      `,
        [scriptId, format],
      );
    }

    // Store test tags
    for (const tag of data.testTags || []) {
      await this.db.exec(
        `
        INSERT INTO test_tags (
          script_id, tag
        ) VALUES (?, ?)
      `,
        [scriptId, tag],
      );
    }

    // Store package references
    for (const ref of data.packageReferences || []) {
      await this.db.exec(
        `
        INSERT INTO package_json_scripts (
          script_id, package_json_path, script_name,
          command
        ) VALUES (?, ?, ?, ?)
      `,
        [scriptId, ref.packageJson, ref.name, ref.command || ref.path || ''],
      );
    }

    // Store related scripts
    for (const related of data.relatedScripts || []) {
      await this.db.exec(
        `
        INSERT INTO related_scripts (
          script_id, related_script_path, relationship_type
        ) VALUES (?, ?, ?)
      `,
        [scriptId, related, 'references'],
      );
    }

    // Store test relationships
    if (data.testRelationships) {
      const rel = data.testRelationships;
      if (rel.isTest && rel.testsFor) {
        await this.db.exec(
          `
          INSERT INTO related_scripts (
            script_id, related_script_path, relationship_type
          ) VALUES (?, ?, ?)
        `,
          [scriptId, rel.testsFor, 'tests'],
        );
      }
      for (const testFile of rel.testFiles || []) {
        await this.db.exec(
          `
          INSERT INTO related_scripts (
            script_id, related_script_path, relationship_type
          ) VALUES (?, ?, ?)
        `,
          [scriptId, testFile, 'tested-by'],
        );
      }
    }
    } // Close the else block
  } // Close the storeScript method

  /**
   * Clear existing database data
   */
  async clearDatabase() {
    const tables = [
      'related_scripts',
      'package_json_scripts',
      'tags',
      'cli_options',
      'dependencies',
      'scripts',
    ];

    for (const table of tables) {
      await this.db.exec(`DELETE FROM ${table}`);
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
    const categories = await this.db.query(`
      SELECT category, COUNT(*) as count
      FROM scripts
      GROUP BY category
      ORDER BY count DESC
    `);

    if (categories.length > 0) {
      console.log('\n📁 Scripts by Category:');
      for (const cat of categories) {
        console.log(`  ${cat.category.padEnd(15)} ${cat.count}`);
      }
    }

    // Documentation quality breakdown
    const docQuality = await this.db.query(`
      SELECT 
        CASE 
          WHEN documentation_score >= 80 THEN 'Excellent (80-100)'
          WHEN documentation_score >= 60 THEN 'Good (60-79)'
          WHEN documentation_score >= 40 THEN 'Fair (40-59)'
          WHEN documentation_score >= 20 THEN 'Poor (20-39)'
          ELSE 'Very Poor (0-19)'
        END as quality,
        COUNT(*) as count
      FROM scripts
      GROUP BY quality
      ORDER BY documentation_score DESC
    `);

    if (docQuality.length > 0) {
      console.log('\n📝 Documentation Quality:');
      for (const qual of docQuality) {
        console.log(`  ${qual.quality.padEnd(20)} ${qual.count}`);
      }
    }

    // Scripts without tests
    const noTests = await this.db.query(`
      SELECT file_path
      FROM scripts s
      WHERE NOT EXISTS (
        SELECT 1 FROM related_scripts rs
        WHERE rs.script_id = s.id
        AND rs.relationship_type IN ('tests', 'tested-by')
      )
      AND s.category != 'test'
      LIMIT 10
    `);

    if (noTests.length > 0) {
      console.log('\n⚠️  Scripts without tests (top 10):');
      for (const script of noTests) {
        console.log(`  - ${script.file_path}`);
      }
    }

    // Undocumented scripts
    const undocumented = await this.db.query(
      `
      SELECT file_path, documentation_score
      FROM scripts
      WHERE documentation_score < ?
      ORDER BY documentation_score ASC
      LIMIT 10
    `,
      [this.config.minDocScore],
    );

    if (undocumented.length > 0) {
      console.log(
        `\n⚠️  Poorly documented scripts (score < ${this.config.minDocScore}, top 10):`,
      );
      for (const script of undocumented) {
        console.log(
          `  - ${script.file_path} (score: ${script.documentation_score})`,
        );
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

Usage: node analyze.js [options]

Options:
  --help, -h           Show this help message
  --verbose, -v        Show detailed progress
  --incremental, -i    Only analyze changed files (not implemented yet)
  --min-doc-score N    Minimum documentation score (default: 50)
  --output PATH        Database output path
  --dirs DIR1,DIR2     Directories to scan (default: scripts,tools)

Examples:
  # Full analysis
  node analyze.js
  
  # Verbose mode with custom threshold
  node analyze.js --verbose --min-doc-score 70
  
  # Custom directories
  node analyze.js --dirs scripts,tools,developer_notes

Output:
  Database: output/script-inventory/inventory.db
  Use the query.js tool to search and report on results.
      `);
      process.exit(0);
    }

    // Parse options
    const options = {
      verbose: args.includes('--verbose') || args.includes('-v'),
      incremental: args.includes('--incremental') || args.includes('-i'),
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
