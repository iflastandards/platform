#!/usr/bin/env node

/**
 * Database connection and management layer for script inventory
 *
 * Documentation: developer_notes/script-inventory.md
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { promisify } = require('util');

class ScriptDatabase {
  constructor(options = {}) {
    this.dbPath =
      options.dbPath ||
      path.join(process.cwd(), 'output', 'script-inventory', 'inventory.db');
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.db = null;
    this.verbose = options.verbose || false;
  }

  /**
   * Connect to the database
   */
  connect() {
    return new Promise((resolve, reject) => {
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create or open database
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          // Enable foreign keys and optimize
          this.db.serialize(() => {
            this.db.run('PRAGMA foreign_keys = ON');
            this.db.run('PRAGMA journal_mode = WAL');
            this.db.run('PRAGMA synchronous = NORMAL');
            resolve(this);
          });
        }
      });
    });
  }

  /**
   * Run a single SQL statement
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {reject(err);}
        else {resolve({ lastID: this.lastID, changes: this.changes });}
      });
    });
  }

  /**
   * Get a single row
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {reject(err);}
        else {resolve(row);}
      });
    });
  }

  /**
   * Get all rows
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {reject(err);}
        else {resolve(rows);}
      });
    });
  }

  /**
   * Execute SQL (for DDL statements)
   */
  exec(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) {reject(err);}
        else {resolve();}
      });
    });
  }

  /**
   * Run all migrations
   */
  async migrate() {
    if (!this.db) {await this.connect();}

    // Create migrations table if it doesn't exist
    await this.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get applied migrations
    const appliedRows = await this.all('SELECT version FROM migrations');
    const applied = new Set(appliedRows.map((m) => m.version));

    // Get migration files
    const migrationFiles = fs
      .readdirSync(this.migrationsPath)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Apply new migrations
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');

      if (applied.has(version)) {
        if (this.verbose) {console.log(`✓ Migration ${version} already applied`);}
        continue;
      }

      console.log(`→ Applying migration ${version}...`);

      const sql = fs.readFileSync(path.join(this.migrationsPath, file), 'utf8');

      try {
        await this.exec(sql);
        await this.run('INSERT INTO migrations (version) VALUES (?)', [
          version,
        ]);
        console.log(`✓ Migration ${version} applied successfully`);
      } catch (error) {
        console.error(`✗ Migration ${version} failed:`, error.message);
        throw error;
      }
    }

    return this;
  }

  /**
   * Upsert a script record
   */
  async upsertScript(scriptData) {
    const sql = `
      INSERT INTO scripts (
        path, name, type, purpose, file_hash, file_size,
        is_cli, is_test, is_deprecated, deprecation_message,
        last_modified, documentation_path, has_help_option, has_man_option
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET
        name = excluded.name,
        type = excluded.type,
        purpose = excluded.purpose,
        file_hash = excluded.file_hash,
        file_size = excluded.file_size,
        is_cli = excluded.is_cli,
        is_test = excluded.is_test,
        is_deprecated = excluded.is_deprecated,
        deprecation_message = excluded.deprecation_message,
        last_modified = excluded.last_modified,
        documentation_path = excluded.documentation_path,
        has_help_option = excluded.has_help_option,
        has_man_option = excluded.has_man_option,
        last_analyzed = CURRENT_TIMESTAMP
    `;

    const result = await this.run(sql, [
      scriptData.path,
      scriptData.name,
      scriptData.type,
      scriptData.purpose,
      scriptData.file_hash,
      scriptData.file_size,
      scriptData.is_cli ? 1 : 0,
      scriptData.is_test ? 1 : 0,
      scriptData.is_deprecated ? 1 : 0,
      scriptData.deprecation_message,
      scriptData.last_modified,
      scriptData.documentation_path,
      scriptData.has_help_option ? 1 : 0,
      scriptData.has_man_option ? 1 : 0,
    ]);

    // Get the ID of the inserted/updated row
    if (result.lastID) {
      return result.lastID;
    } 
      const row = await this.get('SELECT id FROM scripts WHERE path = ?', [
        scriptData.path,
      ]);
      return row.id;
    
  }

  /**
   * Add CLI options for a script
   */
  async addCliOptions(scriptId, options) {
    // Delete existing options
    await this.run('DELETE FROM cli_options WHERE script_id = ?', [scriptId]);

    // Insert new options
    for (const option of options) {
      await this.run(
        `
        INSERT INTO cli_options (
          script_id, option_name, option_alias, option_type,
          description, default_value, required, choices
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          scriptId,
          option.option_name,
          option.option_alias,
          option.option_type,
          option.description,
          option.default_value,
          option.required ? 1 : 0,
          option.choices ? JSON.stringify(option.choices) : null,
        ],
      );
    }
  }

  /**
   * Add tags for a script
   */
  async addTags(scriptId, tags) {
    // Delete existing tags
    await this.run('DELETE FROM tags WHERE script_id = ?', [scriptId]);

    // Insert new tags
    for (const tag of tags) {
      await this.run(
        `
        INSERT INTO tags (script_id, tag, tag_type)
        VALUES (?, ?, ?)
      `,
        [scriptId, tag.tag, tag.tag_type || 'custom'],
      );
    }
  }

  /**
   * Add package.json script references
   */
  async addPackageJsonScripts(scriptId, npmScripts) {
    // Delete existing references
    await this.run('DELETE FROM package_json_scripts WHERE script_id = ?', [
      scriptId,
    ]);

    // Insert new references
    for (const script of npmScripts) {
      await this.run(
        `
        INSERT INTO package_json_scripts (
          script_id, npm_script_name, command, package_json_path
        ) VALUES (?, ?, ?, ?)
      `,
        [
          scriptId,
          script.npm_script_name,
          script.command,
          script.package_json_path || 'package.json',
        ],
      );
    }
  }

  /**
   * Add dependencies for a script
   */
  async addDependencies(scriptId, dependencies) {
    // Delete existing dependencies
    await this.run('DELETE FROM dependencies WHERE script_id = ?', [scriptId]);

    // Insert new dependencies
    for (const dep of dependencies) {
      await this.run(
        `
        INSERT INTO dependencies (script_id, dependency, dependency_type)
        VALUES (?, ?, ?)
      `,
        [scriptId, dep.dependency, dep.dependency_type || 'npm'],
      );
    }
  }

  /**
   * Get script by path
   */
  async getScriptByPath(scriptPath) {
    return this.get('SELECT * FROM scripts WHERE path = ?', [scriptPath]);
  }

  /**
   * Check if script has changed
   */
  async hasScriptChanged(scriptPath, currentHash) {
    const result = await this.get(
      'SELECT file_hash FROM scripts WHERE path = ?',
      [scriptPath],
    );
    return !result || result.file_hash !== currentHash;
  }

  /**
   * Get all scripts
   */
  async getAllScripts() {
    return this.all('SELECT * FROM scripts ORDER BY path');
  }

  /**
   * Get undocumented scripts
   */
  async getUndocumentedScripts() {
    return this.all('SELECT * FROM v_undocumented_scripts');
  }

  /**
   * Get deprecated scripts
   */
  async getDeprecatedScripts() {
    return this.all('SELECT * FROM v_deprecated_scripts');
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const stats = {};

    // Total scripts
    const totalRow = await this.get('SELECT COUNT(*) as count FROM scripts');
    stats.total = totalRow.count;

    // By type
    stats.byType = await this.all(`
      SELECT type, COUNT(*) as count 
      FROM scripts 
      GROUP BY type
    `);

    // Documentation status
    const docRow = await this.get(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE documentation_path IS NOT NULL
    `);
    stats.documented = docRow.count;
    stats.undocumented = stats.total - stats.documented;

    // CLI scripts
    const cliRow = await this.get(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE is_cli = 1
    `);
    stats.cli = cliRow.count;

    // Test scripts
    const testRow = await this.get(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE is_test = 1
    `);
    stats.tests = testRow.count;

    // Deprecated
    const depRow = await this.get(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE is_deprecated = 1
    `);
    stats.deprecated = depRow.count;

    return stats;
  }

  /**
   * Find potential duplicates
   */
  async findDuplicates() {
    return this.all('SELECT * FROM v_potential_duplicates');
  }

  /**
   * Search scripts (full-text search)
   */
  async searchScripts(query) {
    return this.all(
      `
      SELECT s.* 
      FROM scripts s
      JOIN scripts_fts ON s.id = scripts_fts.rowid
      WHERE scripts_fts MATCH ?
      ORDER BY rank
    `,
      [query],
    );
  }

  /**
   * Get scripts by directory
   */
  async getScriptsByDirectory() {
    return this.all('SELECT * FROM v_scripts_by_directory');
  }

  /**
   * Execute raw SQL query
   */
  async query(sql, params = []) {
    // Determine if it's a SELECT query
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return this.all(sql, params);
    } 
      return this.run(sql, params);
    
  }

  /**
   * Close the database connection
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {reject(err);}
          else {
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Calculate file hash
   */
  static calculateFileHash(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 16);
  }
}

// CLI interface for database management
if (require.main === module) {
  const db = new ScriptDatabase({ verbose: true });
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case '--init':
        case '--migrate':
          await db.connect();
          await db.migrate();
          console.log('✓ Database initialized and migrations applied');
          break;

        case '--stats':
          await db.connect();
          const stats = await db.getStatistics();
          console.log('\nScript Inventory Statistics:');
          console.log('============================');
          console.log(`Total scripts: ${stats.total}`);
          console.log(`Documented: ${stats.documented}`);
          console.log(`Undocumented: ${stats.undocumented}`);
          console.log(`CLI scripts: ${stats.cli}`);
          console.log(`Test scripts: ${stats.tests}`);
          console.log(`Deprecated: ${stats.deprecated}`);
          console.log('\nBy Type:');
          stats.byType.forEach((t) => console.log(`  ${t.type}: ${t.count}`));
          break;

        default:
          console.log(`
Script Inventory Database Manager

Usage:
  node lib/db.js --init          Initialize database and run migrations
  node lib/db.js --migrate       Run pending migrations
  node lib/db.js --stats         Show database statistics
          `);
      }

      await db.close();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = ScriptDatabase;
