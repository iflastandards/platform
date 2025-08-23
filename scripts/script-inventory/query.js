#!/usr/bin/env node

/**
 * Script Inventory Query Tool
 * Search, filter, browse and export the script inventory
 * Documentation: scripts/script-inventory/README.md
 */

const Database = require('./lib/db-cli');
const fs = require('fs').promises;
const path = require('path');
const { stringify } = require('csv-stringify/sync');

class ScriptQuery {
  constructor(options = {}) {
    this.dbPath =
      options.dbPath ||
      path.join(__dirname, 'output/script-inventory/inventory.db');
    this.db = new Database(this.dbPath);
  }

  /**
   * Search scripts by keyword
   */
  async search(keyword) {
    return this.db.exec(
      `
      SELECT s.*, GROUP_CONCAT(t.tag) as tags
      FROM scripts s
      LEFT JOIN tags t ON t.script_id = s.id
      WHERE s.path LIKE ? OR s.name LIKE ? OR s.purpose LIKE ?
      GROUP BY s.id
      ORDER BY s.name
    `,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
    );
  }

  /**
   * Filter by type
   */
  async filterByType(type) {
    return this.db.exec(
      `
      SELECT s.*, GROUP_CONCAT(t.tag) as tags
      FROM scripts s
      LEFT JOIN tags t ON t.script_id = s.id
      WHERE s.type = ?
      GROUP BY s.id
      ORDER BY s.name
    `,
      [type],
    );
  }

  /**
   * Filter by category tag
   */
  async filterByCategory(category) {
    return this.db.exec(
      `
      SELECT s.*, GROUP_CONCAT(t2.tag) as tags
      FROM scripts s
      JOIN tags t ON t.script_id = s.id AND t.tag_type = 'category' AND t.tag = ?
      LEFT JOIN tags t2 ON t2.script_id = s.id
      GROUP BY s.id
      ORDER BY s.name
    `,
      [category],
    );
  }

  /**
   * Get CLI scripts
   */
  async getCliScripts() {
    return this.db.exec(
      `
      SELECT s.*, GROUP_CONCAT(t.tag) as tags
      FROM scripts s
      LEFT JOIN tags t ON t.script_id = s.id
      WHERE s.is_cli = 1
      GROUP BY s.id
      ORDER BY s.name
    `,
    );
  }

  /**
   * Get deprecated scripts
   */
  async getDeprecatedScripts() {
    return this.db.exec(
      `
      SELECT s.*, GROUP_CONCAT(t.tag) as tags
      FROM scripts s
      LEFT JOIN tags t ON t.script_id = s.id
      WHERE s.is_deprecated = 1
      GROUP BY s.id
      ORDER BY s.name
    `,
    );
  }

  /**
   * Get scripts with package.json references
   */
  async getPackageScripts() {
    return this.db.exec(
      `
      SELECT s.*, p.npm_script_name, p.command, GROUP_CONCAT(t.tag) as tags
      FROM scripts s
      JOIN package_json_scripts p ON p.script_id = s.id
      LEFT JOIN tags t ON t.script_id = s.id
      GROUP BY s.id, p.npm_script_name
      ORDER BY p.npm_script_name
    `,
    );
  }

  /**
   * Get all scripts
   */
  async getAllScripts() {
    return this.db.exec(
      `
      SELECT s.*, GROUP_CONCAT(t.tag) as tags
      FROM scripts s
      LEFT JOIN tags t ON t.script_id = s.id
      GROUP BY s.id
      ORDER BY s.path
    `,
    );
  }

  /**
   * Get script details with all related data
   */
  async getScriptDetails(scriptPath) {
    const script = await this.db.exec(`SELECT * FROM scripts WHERE path = ?`, [
      scriptPath,
    ]);

    if (!script || script.length === 0) {
      return null;
    }

    const scriptId = script[0].id;

    const tags = await this.db.exec(
      `SELECT tag, tag_type FROM tags WHERE script_id = ?`,
      [scriptId],
    );

    const cliOptions = await this.db.exec(
      `SELECT * FROM cli_options WHERE script_id = ?`,
      [scriptId],
    );

    const dependencies = await this.db.exec(
      `SELECT * FROM dependencies WHERE script_id = ?`,
      [scriptId],
    );

    const packageRefs = await this.db.exec(
      `SELECT * FROM package_json_scripts WHERE script_id = ?`,
      [scriptId],
    );

    return {
      ...script[0],
      tags,
      cliOptions,
      dependencies,
      packageRefs,
    };
  }

  /**
   * Export to CSV
   */
  async exportToCsv(scripts) {
    const columns = [
      'path',
      'name',
      'type',
      'purpose',
      'is_cli',
      'is_test',
      'is_deprecated',
      'has_help_option',
      'tags',
      'file_size',
      'last_modified',
    ];

    const csv = stringify(scripts, {
      header: true,
      columns,
    });

    return csv;
  }

  /**
   * Export to Markdown
   */
  async exportToMarkdown(scripts) {
    let md = '# Script Inventory\n\n';
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += `Total scripts: ${scripts.length}\n\n`;

    // Group by type
    const byType = {};
    for (const script of scripts) {
      if (!byType[script.type]) {
        byType[script.type] = [];
      }
      byType[script.type].push(script);
    }

    for (const [type, typeScripts] of Object.entries(byType)) {
      md += `## ${type.charAt(0).toUpperCase() + type.slice(1)} Scripts\n\n`;

      for (const script of typeScripts) {
        md += `### ${script.name}\n\n`;
        md += `- **Path**: ${script.path}\n`;
        md += `- **Purpose**: ${script.purpose || 'Not documented'}\n`;
        if (script.is_cli) {md += `- **CLI**: Yes\n`;}
        if (script.is_test) {md += `- **Test**: Yes\n`;}
        if (script.is_deprecated) {md += `- **DEPRECATED**\n`;}
        if (script.tags) {md += `- **Tags**: ${script.tags}\n`;}
        md += '\n';
      }
    }

    return md;
  }

  /**
   * Export to JSON
   */
  async exportToJson(scripts) {
    return JSON.stringify(scripts, null, 2);
  }

  /**
   * Get statistics
   */
  async getStats() {
    const total = await this.db.exec(`SELECT COUNT(*) as count FROM scripts`);

    const byType = await this.db.exec(
      `
      SELECT type, COUNT(*) as count
      FROM scripts
      GROUP BY type
    `,
    );

    const byCategory = await this.db.exec(
      `
      SELECT tag, COUNT(*) as count
      FROM tags
      WHERE tag_type = 'category'
      GROUP BY tag
    `,
    );

    const cli = await this.db.exec(
      `SELECT COUNT(*) as count FROM scripts WHERE is_cli = 1`,
    );

    const tests = await this.db.exec(
      `SELECT COUNT(*) as count FROM scripts WHERE is_test = 1`,
    );

    const deprecated = await this.db.exec(
      `SELECT COUNT(*) as count FROM scripts WHERE is_deprecated = 1`,
    );

    const withHelp = await this.db.exec(
      `SELECT COUNT(*) as count FROM scripts WHERE has_help_option = 1`,
    );

    return {
      total: total[0].count,
      byType,
      byCategory,
      cli: cli[0].count,
      tests: tests[0].count,
      deprecated: deprecated[0].count,
      withHelp: withHelp[0].count,
    };
  }
}

// CLI interface
if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
      console.log(`
Script Inventory Query Tool
Documentation: scripts/script-inventory/README.md

Usage: node query.js [command] [options]

Commands:
  search <keyword>        Search scripts by keyword
  type <type>            Filter by type (javascript, typescript, python, shell)
  category <category>    Filter by category tag
  cli                    List CLI scripts
  deprecated             List deprecated scripts
  package                List scripts in package.json
  all                    List all scripts
  details <path>         Get detailed info for a script
  stats                  Show statistics
  export <format>        Export results (csv, markdown, json)

Options:
  --output <file>        Save export to file
  --db <path>           Use different database

Examples:
  node query.js search test
  node query.js type typescript
  node query.js cli --export csv --output cli-scripts.csv
  node query.js details scripts/build.js
  node query.js stats
      `);
      process.exit(0);
    }

    const query = new ScriptQuery();
    const command = args[0];
    let results = [];

    try {
      switch (command) {
        case 'search':
          if (!args[1]) {
            console.error('Error: search keyword required');
            process.exit(1);
          }
          results = await query.search(args[1]);
          break;

        case 'type':
          if (!args[1]) {
            console.error('Error: type required');
            process.exit(1);
          }
          results = await query.filterByType(args[1]);
          break;

        case 'category':
          if (!args[1]) {
            console.error('Error: category required');
            process.exit(1);
          }
          results = await query.filterByCategory(args[1]);
          break;

        case 'cli':
          results = await query.getCliScripts();
          break;

        case 'deprecated':
          results = await query.getDeprecatedScripts();
          break;

        case 'package':
          results = await query.getPackageScripts();
          break;

        case 'all':
          results = await query.getAllScripts();
          break;

        case 'details':
          if (!args[1]) {
            console.error('Error: script path required');
            process.exit(1);
          }
          const details = await query.getScriptDetails(args[1]);
          if (!details) {
            console.error('Script not found');
            process.exit(1);
          }
          console.log(JSON.stringify(details, null, 2));
          process.exit(0);

        case 'stats':
          const stats = await query.getStats();
          console.log('\n📊 Script Inventory Statistics:');
          console.log('═══════════════════════════════════════');
          console.log(`Total scripts: ${stats.total}`);
          console.log(`CLI scripts: ${stats.cli}`);
          console.log(`Test scripts: ${stats.tests}`);
          console.log(`Deprecated: ${stats.deprecated}`);
          console.log(`With help: ${stats.withHelp}`);
          console.log('\nBy Type:');
          for (const type of stats.byType) {
            console.log(`  ${type.type}: ${type.count}`);
          }
          console.log('\nBy Category:');
          for (const cat of stats.byCategory) {
            console.log(`  ${cat.tag}: ${cat.count}`);
          }
          process.exit(0);

        case 'export':
          results = await query.getAllScripts();
          break;

        default:
          console.error(`Unknown command: ${command}`);
          process.exit(1);
      }

      // Handle export
      const exportIndex = args.indexOf('--export');
      const outputIndex = args.indexOf('--output');

      if (exportIndex !== -1 || command === 'export') {
        const format = exportIndex !== -1 ? args[exportIndex + 1] : args[1];
        let output;

        switch (format) {
          case 'csv':
            output = await query.exportToCsv(results);
            break;
          case 'markdown':
          case 'md':
            output = await query.exportToMarkdown(results);
            break;
          case 'json':
            output = await query.exportToJson(results);
            break;
          default:
            console.error(`Unknown export format: ${format}`);
            process.exit(1);
        }

        if (outputIndex !== -1 && args[outputIndex + 1]) {
          await fs.writeFile(args[outputIndex + 1], output);
          console.log(`✅ Exported to ${args[outputIndex + 1]}`);
        } else {
          console.log(output);
        }
      } else {
        // Display results
        if (results.length === 0) {
          console.log('No results found');
        } else {
          console.log(`\n📋 Found ${results.length} scripts:\n`);
          for (const script of results) {
            console.log(`${script.path}`);
            if (script.purpose) {
              console.log(`  Purpose: ${script.purpose}`);
            }
            if (script.tags) {
              console.log(`  Tags: ${script.tags}`);
            }
            if (script.is_deprecated) {
              console.log(`  ⚠️  DEPRECATED`);
            }
            console.log();
          }
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = ScriptQuery;
